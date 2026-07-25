const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const SURAH_DIR = path.join(ROOT, "src", "data", "surahs");
const HADITH_DIR = path.join(ROOT, "src", "data", "hadiths");

function dataFiles(directory) {
  return fs
    .readdirSync(directory)
    .filter((name) => /^\d{3}-.+\.js$/.test(name))
    .sort();
}

function registryFiles(directory) {
  const indexFile = path.join(directory, "index.js");
  const source = fs.readFileSync(indexFile, "utf8");
  const registered = [
    ...source.matchAll(/from\s+"\.\/([^"]+\.js)";/g),
  ].map((match) => match[1]);
  const available = dataFiles(directory);
  const missing = registered.filter((name) => !available.includes(name));
  const unregistered = available.filter((name) => !registered.includes(name));

  if (missing.length || unregistered.length) {
    const details = [
      missing.length ? `missing: ${missing.join(", ")}` : "",
      unregistered.length ? `unregistered: ${unregistered.join(", ")}` : "",
    ].filter(Boolean).join("; ");
    throw new Error(`Lesson registry mismatch in ${path.relative(ROOT, directory)} (${details}).`);
  }

  return registered;
}

function parseDataModule(file) {
  const source = fs.readFileSync(file, "utf8");
  const marker = "export default ";
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`Missing "export default" in ${path.relative(ROOT, file)}.`);
  }

  const expression = source.slice(start + marker.length).trim().replace(/;$/, "");
  return vm.runInNewContext(`(${expression})`, Object.create(null), {
    filename: file,
  });
}

function loadDirectory(directory) {
  return registryFiles(directory).map((name) =>
    parseDataModule(path.join(directory, name))
  );
}

function findDataFile(directory, id) {
  const match = dataFiles(directory).find((name) =>
    name.endsWith(`-${id}.js`)
  );
  return match ? path.join(directory, match) : null;
}

function writeDataModule(file, value, label) {
  const contents =
    `// ${label}\n` +
    "// Lesson data only. Shared behavior lives in src/app.js.\n" +
    `export default ${JSON.stringify(value, null, 2)};\n`;
  fs.writeFileSync(file, contents, "utf8");
}

function loadLessonData() {
  const surahs = loadDirectory(SURAH_DIR);
  const hadiths = loadDirectory(HADITH_DIR);
  return { surahs, hadiths, lessons: [...surahs, ...hadiths] };
}

module.exports = {
  HADITH_DIR,
  SURAH_DIR,
  findDataFile,
  loadLessonData,
  parseDataModule,
  writeDataModule,
};

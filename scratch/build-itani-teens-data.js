// One-off builder: parses every translation-notes/<n>-<slug>-itani-teens.md
// verbatim and emits src/data/translations/itani-teens.js, the single
// per-surah source of Itani teen English used by the shared Quran renderer.
//
//   node scratch/build-itani-teens-data.js
//
// Validation rules:
//   - the entry "N." list must match the canonical ayah count for the surah
//   - entry 0 (basmala) may exist or not; Al-Fatiha has no entry 0 because
//     its basmala is ayah 1
//   - no translation wording is edited: it is copied byte-for-byte

const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const NOTES_DIR = path.join(__dirname, "..", "translation-notes");
const OUT_DIR = path.join(__dirname, "..", "src", "data", "translations");
const OUT_FILE = path.join(OUT_DIR, "itani-teens.js");

// Canonical numbered ayah counts for all 114 surahs (same table as audit-surah.js).
const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52,
  99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69,
  60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14,
  11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50,
  40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11,
  8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function parseTranslationNote(text) {
  const entryPattern = /^(\d+)\.\s+(.*)$/;
  const entries = new Map();
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const match = line.match(entryPattern);
    if (match) {
      current = Number(match[1]);
      entries.set(current, match[2].trim());
      continue;
    }
    if (line.trim() && current !== null && entries.has(current)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("#") && !trimmed.startsWith("Source:") && !trimmed.startsWith("Retrieved:")) {
        entries.set(current, (entries.get(current) + " " + trimmed).trim());
      }
    }
  }
  const basmala = entries.has(0) ? entries.get(0) : null;
  const ayahs = [];
  for (let n = 1; n <= Math.max(...[...entries.keys()]); n++) {
    ayahs.push(entries.get(n) ?? "");
  }
  return { basmala, ayahs };
}

const { surahs } = loadLessonData();
const sorted = [...surahs].sort((a, b) => a.number - b.number);
const data = {};
const report = [];

for (const s of sorted) {
  const number = s.number;
  const canonical = AYAH_COUNTS[number - 1];
  const noteFile = path.join(NOTES_DIR, `${number}-${s.id}-itani-teens.md`);
  if (!fs.existsSync(noteFile)) {
    throw new Error(`Missing translation note for surah ${number} (${s.id}): ${path.relative(path.join(__dirname, ".."), noteFile)}`);
  }
  const text = fs.readFileSync(noteFile, "utf8");
  const { basmala, ayahs } = parseTranslationNote(text);
  if (ayahs.length !== canonical) {
    throw new Error(`Surah ${number} (${s.id}): translation note has ${ayahs.length} ayah entries, canonical is ${canonical}`);
  }
  if (number === 1 && basmala !== null) {
    throw new Error("Surah 1 (fatiha): unexpected entry 0 — the basmala is ayah 1 and must not be duplicated");
  }
  data[number] = { basmala, ayahs };
  report.push(`  ${String(number).padStart(3)} ${s.id.padEnd(12)} ${ayahs.length} ayahs  basmala:${basmala !== null ? "yes" : "no"}`);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const json = JSON.stringify(data, null, 2);
fs.writeFileSync(
  OUT_FILE,
  `// Itani teen English translations, parsed verbatim from\n` +
  `// translation-notes/<surah-number>-<slug>-itani-teens.md by\n` +
  `// scratch/build-itani-teens-data.js. Do not hand-edit the wording here —\n` +
  `// regenerate from the translation notes and verify the result instead.\n\n` +
  `export const ITANI_TEEN_TRANSLATIONS = Object.freeze(${json});\n`,
  "utf8",
);

console.log(`Parsed ${sorted.length} surahs, 1\u2192114 (registered set):`);
console.log(report.join("\n"));
console.log(`\nwritten: ${path.relative(path.join(__dirname, ".."), OUT_FILE)}`);
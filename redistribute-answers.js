// Spread a module's quiz answer indexes to ~8,8,7,7 without changing which
// option is correct.
//
//   node redistribute-answers.js <slug>            # dry run
//   node redistribute-answers.js <slug> --apply    # writes that lesson file

const path = require("path");
const {
  HADITH_DIR,
  SURAH_DIR,
  findDataFile,
  parseDataModule,
  writeDataModule,
} = require("./lesson-data-loader");

const slug = process.argv[2];
const apply = process.argv.includes("--apply");

if (!slug || slug.startsWith("--")) {
  console.error("Usage: node redistribute-answers.js <slug> [--apply]");
  process.exit(2);
}

const file =
  findDataFile(SURAH_DIR, slug) ||
  findDataFile(HADITH_DIR, slug);

if (!file) {
  console.error(`Module id "${slug}" not found.`);
  process.exit(1);
}

const lesson = parseDataModule(file);
const originalCorrect = lesson.quiz.map((question) =>
  question.options[question.answer]
);
const originalOptionSets = lesson.quiz.map((question) =>
  [...question.options].sort().join("|")
);

lesson.quiz.forEach((question, index) => {
  const target = index % 4;
  const oldAnswer = question.answer;
  const oldOptions = [...question.options];

  question.options = [0, 1, 2, 3].map(
    (optionIndex) =>
      oldOptions[
        (((optionIndex - target + oldAnswer) % 4) + 4) % 4
      ]
  );
  question.answer = target;
});

let valid = true;
lesson.quiz.forEach((question, index) => {
  if (question.options[question.answer] !== originalCorrect[index]) {
    console.error(`Q${index + 1}: correct answer changed.`);
    valid = false;
  }
  if ([...question.options].sort().join("|") !== originalOptionSets[index]) {
    console.error(`Q${index + 1}: option set changed.`);
    valid = false;
  }
  if (new Set(question.options).size !== 4) {
    console.error(`Q${index + 1}: options are not unique.`);
    valid = false;
  }
});

if (!valid) process.exit(1);

const spread = [0, 0, 0, 0];
lesson.quiz.forEach((question) => spread[question.answer]++);
console.log(`questions rewritten : ${lesson.quiz.length}`);
console.log(`new answer spread   : ${spread.join(",")}`);
console.log("VERIFY OK — every correct answer text was preserved");

if (apply) {
  const kind = file.startsWith(SURAH_DIR) ? "Surah" : "Hadith lesson";
  const name = lesson.nameEnglish || lesson.title || lesson.id;
  writeDataModule(file, lesson, `${kind} ${lesson.number || ""} · ${name}`.trim());
  console.log(`written: ${path.relative(__dirname, file)}`);
} else {
  console.log("(dry run — pass --apply to write)");
}

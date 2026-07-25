// Strict, chapter-specific completion gate.
//
// Usage:
//   node audit-surah.js <slug|number>
//
// Exit 0 means the requested surah passes the automated contract. Browser
// testing and a meaning-level source review are still required because code
// cannot detect a real quote attached to the wrong claim.

const fs = require("fs");
const path = require("path");
const { findDataFile, loadLessonData, SURAH_DIR } = require("./lesson-data-loader");

const ROOT = __dirname;
const CATEGORY_SEQUENCE = [
  ...Array(12).fill("Vocabulary"),
  ...Array(7).fill("Comprehension"),
  ...Array(5).fill("Critical Thinking"),
  ...Array(6).fill("Rhetoric"),
];
const CATEGORY_COUNTS = {
  Vocabulary: 12,
  Comprehension: 7,
  "Critical Thinking": 5,
  Rhetoric: 6,
};
const RHETORIC_AREAS = ["Meaning Construction", "Nazm", "Style of Address"];
const ALLOWED_VERIFIERS = new Set([
  "ClearQuran (Talal Itani)",
  "Saheeh International",
  "The Noble Qur'an (Muhsin Khan)",
  "The Noble Qur'an (Pickthall)",
  "The Noble Qur'an (Yusuf Ali)",
  "Abdul Haleem",
  "tafsir Ibn Kathir",
  "corpus.quran.com",
]);
const ALLOWED_PRIMARY_SOURCES = new Set([
  "Qur'anic Arabic Corpus",
  "Hans Wehr Dict. 4e",
  "Lane Lexicon",
  "tafsir Ibn Kathir",
  "The Noble Qur'an (Muhsin Khan)",
  "The Noble Qur'an (Pickthall)",
  "The Noble Qur'an (Yusuf Ali)",
]);
const LOCAL_QUOTE_VERIFIERS = new Set([
  "ClearQuran (Talal Itani)",
  "tafsir Ibn Kathir",
]);
const BANNED_TEXT = [
  /which misses the deeper connection the surah makes/i,
  /deeper connection the surah makes between creation and guidance/i,
  /the (?:surah|quran) forgot/i,
  /the surah is incomplete/i,
  /make (?:the )?surah longer/i,
  /allah (?:did not|does not|didn't|doesn't) know/i,
  /random(?:ly)? changes? (?:the )?(?:subject|topic)/i,
  /the order is random/i,
  /mistake by (?:the )?prophet/i,
  /(?:the )?prophet.{0,24}forgot/i,
  /ending was added later/i,
  /lucky number in (?:the )?arabic/i,
  /only for rhythm and (?:poetic )?decoration/i,
  /allah prefers people to be poor/i,
  /the only sin in islam/i,
  /greeting that means hello/i,
  /all of the above/i,
  /none of the above/i,
  /^\s*\(?B\s*[-–—:]/i,
];

// Canonical numbered ayah counts for all 114 surahs. The basmalah is not an
// extra numbered ayah in source-note metadata.
const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52,
  99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69,
  60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14,
  11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50,
  40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11,
  8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function vocabTarget(ayahCount) {
  if (ayahCount <= 4) return 10;
  if (ayahCount <= 6) return 12;
  if (ayahCount <= 11) return 14;
  return 16;
}

function words(value) {
  return String(value || "").toLowerCase().match(/[a-z]+/g) || [];
}

function hasVerbatimRun(note, sourceText, run = 4) {
  const noteWords = words(note);
  const sourceWords = words(sourceText);
  if (noteWords.length < run || sourceWords.length < run) return false;
  const sourceRuns = new Set();
  for (let i = 0; i + run <= sourceWords.length; i++) {
    sourceRuns.add(sourceWords.slice(i, i + run).join(" "));
  }
  for (let i = 0; i + run <= noteWords.length; i++) {
    if (sourceRuns.has(noteWords.slice(i, i + run).join(" "))) return true;
  }
  return false;
}

function sourceBody(text) {
  const parts = String(text || "").split(/\r?\n---\r?\n/);
  return parts.length > 1 ? parts.slice(1).join("\n---\n") : text;
}

function exactList(actual, expected) {
  if (actual.length !== expected.length) return false;
  const remaining = [...expected];
  for (const value of actual) {
    const index = remaining.indexOf(value);
    if (index === -1) return false;
    remaining.splice(index, 1);
  }
  return remaining.length === 0;
}

function numberedExactly(ayahs, expectedCount) {
  return (
    Array.isArray(ayahs) &&
    ayahs.length === expectedCount &&
    ayahs.every((ayah, index) => ayah.n === index + 1)
  );
}

function sourceFile(directory, number, suffix) {
  const full = path.join(ROOT, directory);
  if (!fs.existsSync(full)) return null;
  const matches = fs
    .readdirSync(full)
    .filter((name) => name.startsWith(`${number}-`) && name.endsWith(suffix));
  return matches.length === 1 ? path.join(full, matches[0]) : null;
}

function validateVerification(value, label, failures, options = {}) {
  if (!value || typeof value !== "object") {
    failures.push(`${label}: missing verified metadata`);
    return;
  }
  if (value.status !== "verified") {
    failures.push(`${label}: status is not verified`);
  }
  if (!ALLOWED_VERIFIERS.has(value.by)) {
    failures.push(`${label}: disallowed or missing verifier "${value.by || ""}"`);
  }
  if (!String(value.note || "").trim()) {
    failures.push(`${label}: verification note is empty`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt || "")) {
    failures.push(`${label}: checkedAt must use YYYY-MM-DD`);
  }
  if (options.requireIbnKathir && value.by !== "tafsir Ibn Kathir") {
    failures.push(`${label}: must be verified by tafsir Ibn Kathir`);
  }
  if (
    options.requireVerseRange &&
    !new RegExp(`(?:^|\\D)${options.number}:\\d+(?:-\\d+)?(?:\\D|$)`).test(
      value.note || ""
    )
  ) {
    failures.push(`${label}: note must name an exact ${options.number}:ayah range`);
  }
}

function collectBlanks(section) {
  return (section?.ayahs || []).flatMap((ayah) =>
    (ayah.segments || [])
      .filter((segment) => segment.b !== undefined)
      .map((segment) => segment.b)
  );
}

function checkOptions(item, label, failures, lengthFailures) {
  if (!Array.isArray(item.options) || item.options.length !== 4) {
    failures.push(`${label}: must have exactly four options`);
    return;
  }
  const clean = item.options.map((option) => String(option).trim());
  if (clean.some((option) => !option)) failures.push(`${label}: has an empty option`);
  if (new Set(clean).size !== clean.length) failures.push(`${label}: has duplicate options`);
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) {
    failures.push(`${label}: answer index is invalid`);
    return;
  }
  for (const option of clean) {
    if (BANNED_TEXT.some((pattern) => pattern.test(option))) {
      failures.push(`${label}: contains a banned giveaway distractor`);
      break;
    }
  }
  const lengths = clean.map((option) => option.split(/\s+/).length);
  const maxOther = Math.max(
    ...lengths.filter((_, index) => index !== item.answer)
  );
  if (lengths[item.answer] - maxOther >= 2) {
    lengthFailures.push(
      `${label}: correct answer is ${lengths[item.answer]} words; other choices max at ${maxOther}`
    );
  }
}

function auditSurah(surah) {
  const failures = [];
  const lengthFailures = [];
  const expectedAyahs = AYAH_COUNTS[surah.number - 1];
  const expectedVocab = vocabTarget(expectedAyahs);
  const vocabulary = surah.vocabulary || [];
  const practice = surah.practice || [];
  const quiz = surah.quiz || [];

  if (!expectedAyahs) {
    failures.push(`Surah number ${surah.number} has no canonical ayah count`);
    return { failures, lengthFailures };
  }

  if (!String(surah.intro || "").trim()) failures.push("intro: missing");
  validateVerification(surah.introVerified, "intro", failures, {
    requireIbnKathir: true,
  });

  if (vocabulary.length !== expectedVocab) {
    failures.push(
      `vocabulary: ${vocabulary.length}; expected ${expectedVocab} for ${expectedAyahs} ayahs`
    );
  }
  vocabulary.forEach((entry, index) => {
    const label = `vocabulary ${index + 1} (${entry.arabic || "missing Arabic"})`;
    for (const field of ["arabic", "meaning", "connection", "hint"]) {
      if (!String(entry[field] || "").trim()) failures.push(`${label}: missing ${field}`);
    }
    for (const field of ["primary", "ref", "checkedAt"]) {
      if (!String(entry.source?.[field] || "").trim()) {
        failures.push(`${label}: missing source.${field}`);
      }
    }
    if (
      entry.source?.primary &&
      !ALLOWED_PRIMARY_SOURCES.has(entry.source.primary)
    ) {
      failures.push(
        `${label}: disallowed source.primary "${entry.source.primary}"`
      );
    }
    if (
      entry.source?.ref &&
      !new RegExp(`(?:^|\\D)${surah.number}:\\d+`).test(entry.source.ref)
    ) {
      failures.push(`${label}: source.ref must name an exact verse`);
    }
    if (
      entry.source?.checkedAt &&
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.source.checkedAt)
    ) {
      failures.push(`${label}: source.checkedAt must use YYYY-MM-DD`);
    }
    for (const field of ["english", "arabic", "explanation"]) {
      if (!String(entry.grammar?.[field] || "").trim()) {
        failures.push(`${label}: missing grammar.${field}`);
      }
    }
    const grammarText = [
      entry.grammar?.english,
      entry.grammar?.arabic,
      entry.grammar?.explanation,
    ].join(" ");
    if (
      /emphatic prefix l[aā]m|opening لَ|مؤكد باللام/i.test(grammarText) &&
      !String(entry.arabic || "").trim().startsWith("ل")
    ) {
      failures.push(
        `${label}: grammar says the form has an opening emphatic lam, but arabic does not start with ل`
      );
    }
    validateVerification(entry.verified, label, failures);
  });

  if (practice.length !== vocabulary.length) {
    failures.push(
      `practice: ${practice.length}; expected one item for each of ${vocabulary.length} cards`
    );
  }
  practice.forEach((item, index) => {
    const label = `practice ${index + 1}`;
    if (!String(item.q || "").trim()) failures.push(`${label}: missing question`);
    if (!String(item.explanation || "").trim()) failures.push(`${label}: missing explanation`);
    checkOptions(item, label, failures, []);
  });
  vocabulary.forEach((entry) => {
    const covered = practice.some((item) => {
      const correct = item.options?.[item.answer];
      return (
        (String(item.q || "").includes(entry.arabic) && correct === entry.meaning) ||
        (String(item.q || "").includes(entry.meaning) && correct === entry.arabic)
      );
    });
    if (!covered) failures.push(`practice: no exact item tests ${entry.arabic} = ${entry.meaning}`);
  });

  const bankChecks = [
    ["fillBlanks", surah.fillBlanks, vocabulary.map((entry) => entry.arabic)],
    ["fillBlanksEn", surah.fillBlanksEn, vocabulary.map((entry) => entry.meaning)],
  ];
  for (const [label, section, expectedBank] of bankChecks) {
    if (!numberedExactly(section?.ayahs, expectedAyahs)) {
      failures.push(
        `${label}: must contain ayahs 1-${expectedAyahs}, once each and in order`
      );
    }
    const bank = collectBlanks(section);
    if (!exactList(bank, expectedBank)) {
      failures.push(`${label}: blank set does not exactly match the vocabulary set`);
    }
    if (Array.isArray(section?.wordBank) && !exactList(section.wordBank, expectedBank)) {
      failures.push(`${label}: wordBank does not exactly match the vocabulary set`);
    }
  }

  if (quiz.length !== 30) failures.push(`quiz: ${quiz.length}; expected 30`);
  const actualSequence = quiz.map((question) => question.category);
  if (!exactList(actualSequence, CATEGORY_SEQUENCE) ||
      actualSequence.some((category, index) => category !== CATEGORY_SEQUENCE[index])) {
    failures.push("quiz: categories must be ordered 12 Vocabulary, 7 Comprehension, 5 Critical Thinking, 6 Rhetoric");
  }
  const counts = {};
  quiz.forEach((question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
  });
  for (const [category, expected] of Object.entries(CATEGORY_COUNTS)) {
    if ((counts[category] || 0) !== expected) {
      failures.push(`quiz: ${category} count is ${counts[category] || 0}; expected ${expected}`);
    }
  }
  const answerSpread = [0, 1, 2, 3].map(
    (answer) => quiz.filter((question) => question.answer === answer).length
  );
  if (answerSpread.join(",") !== "8,8,7,7") {
    failures.push(`quiz: answer spread is ${answerSpread.join(",")}; expected 8,8,7,7`);
  }

  const normalizedQuestions = new Set();
  quiz.forEach((question, index) => {
    const label = `quiz Q${index + 1} (${question.category || "missing category"})`;
    if (!String(question.q || "").trim()) failures.push(`${label}: missing question`);
    if (!String(question.explanation || "").trim()) failures.push(`${label}: missing explanation`);
    const normalized = String(question.q || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    if (normalizedQuestions.has(normalized)) failures.push(`${label}: duplicate question wording`);
    normalizedQuestions.add(normalized);
    if (BANNED_TEXT.some((pattern) => pattern.test(question.q || ""))) {
      failures.push(`${label}: question contains banned filler wording`);
    }
    checkOptions(question, label, failures, lengthFailures);
    validateVerification(question.verified, label, failures, {
      requireIbnKathir: question.category === "Rhetoric",
      requireVerseRange: question.category === "Rhetoric",
      number: surah.number,
    });
  });

  const rhetoric = quiz.filter((question) => question.category === "Rhetoric");
  for (const area of RHETORIC_AREAS) {
    const count = rhetoric.filter((question) => question.rhetoricArea === area).length;
    if (count !== 2) failures.push(`rhetoricArea "${area}": ${count}; expected 2`);
  }
  const unknownAreas = rhetoric
    .map((question) => question.rhetoricArea)
    .filter((area) => !RHETORIC_AREAS.includes(area));
  if (unknownAreas.length) {
    failures.push(`Rhetoric: unknown or missing rhetoricArea values: ${unknownAreas.join(", ")}`);
  }

  const vocabQuestions = quiz.filter((question) => question.category === "Vocabulary");
  const coveredVocab = new Set();
  vocabQuestions.forEach((question) => {
    vocabulary.forEach((entry) => {
      if (question.q.includes(entry.arabic)) coveredVocab.add(entry.arabic);
    });
  });
  const coverageTarget = Math.min(vocabulary.length, 12);
  if (coveredVocab.size < coverageTarget) {
    failures.push(
      `Vocabulary quiz coverage: ${coveredVocab.size}; expected at least ${coverageTarget} distinct cards`
    );
  }

  const translationFile = sourceFile(
    "translation-notes",
    surah.number,
    "-itani-teens.md"
  );
  const tafsirFile = sourceFile(
    "tafsir-notes",
    surah.number,
    "-ibn-kathir.md"
  );
  if (!translationFile) failures.push("sources: missing or ambiguous translation note file");
  if (!tafsirFile) failures.push("sources: missing or ambiguous Ibn Kathir note file");

  const localSourceTexts = {};
  if (translationFile) {
    const text = fs.readFileSync(translationFile, "utf8");
    localSourceTexts["ClearQuran (Talal Itani)"] = sourceBody(text);
    const countSuffix =
      surah.number === 1
        ? "\\(basmalah is ayah 1\\)"
        : "\\(plus the basmalah reference at entry 0\\)";
    if (!new RegExp(`Numbered ayahs:\\s*${expectedAyahs}\\s*${countSuffix}`, "i").test(text)) {
      const expectedHeader =
        surah.number === 1
          ? `Numbered ayahs: ${expectedAyahs} (basmalah is ayah 1)`
          : `Numbered ayahs: ${expectedAyahs} (plus the basmalah reference at entry 0)`;
      failures.push(
        `translation note: header must say "${expectedHeader}"`
      );
    }
    const entries = [...text.matchAll(/^(\d+)\.\s/gm)].map((match) => Number(match[1]));
    const expectedEntries = Array.from(
      { length: expectedAyahs },
      (_, index) => index + 1
    );
    if (surah.number !== 1) expectedEntries.unshift(0);
    if (!exactList(entries, expectedEntries)) {
      failures.push(
        surah.number === 1
          ? `translation note: entries must be 1-${expectedAyahs} exactly once`
          : `translation note: entries must be 0-${expectedAyahs} exactly once`
      );
    }
  }
  if (tafsirFile) {
    const text = fs.readFileSync(tafsirFile, "utf8");
    localSourceTexts["tafsir Ibn Kathir"] = sourceBody(text);
    if (!new RegExp(`Surah length:\\s*${expectedAyahs}\\s+ayahs`, "i").test(text)) {
      failures.push(`tafsir note: Surah length must be ${expectedAyahs} ayahs`);
    }
  }

  const verifiedItems = [
    ["intro", surah.introVerified],
    ...vocabulary.map((entry, index) => [
      `vocabulary ${index + 1} (${entry.arabic})`,
      entry.verified,
    ]),
    ...quiz.map((question, index) => [`quiz Q${index + 1}`, question.verified]),
  ];
  for (const [label, verification] of verifiedItems) {
    if (
      verification &&
      LOCAL_QUOTE_VERIFIERS.has(verification.by) &&
      !hasVerbatimRun(
        verification.note,
        localSourceTexts[verification.by] || ""
      )
    ) {
      failures.push(
        `${label}: verification note needs at least four consecutive source words`
      );
    }
  }

  failures.push(...lengthFailures);
  return {
    failures,
    summary: {
      ayahs: expectedAyahs,
      vocabulary: vocabulary.length,
      practice: practice.length,
      quiz: quiz.length,
      rhetoric: rhetoric.length,
      answerSpread,
    },
  };
}

const selector = process.argv[2];
if (!selector) {
  console.error("Usage: node audit-surah.js <slug|number>");
  process.exit(2);
}

const { surahs } = loadLessonData();
const target = surahs.find(
  (surah) => surah.id === selector || String(surah.number) === selector
);
if (!target) {
  console.error(`No surah module found for "${selector}".`);
  process.exit(2);
}

const dataFile = findDataFile(SURAH_DIR, target.id);
const result = auditSurah(target);
const relativeFile = dataFile ? path.relative(ROOT, dataFile) : "(unknown file)";

console.log(`Surah ${target.number} ${target.nameEnglish} (${target.id})`);
console.log(`File: ${relativeFile}`);
if (result.summary) {
  console.log(
    `Counts: ${result.summary.ayahs} ayahs, ${result.summary.vocabulary} vocabulary, ` +
    `${result.summary.practice} practice, ${result.summary.quiz} quiz, ` +
    `${result.summary.rhetoric} Rhetoric`
  );
  console.log(`Answer spread: ${result.summary.answerSpread.join(", ")}`);
}

if (result.failures.length) {
  console.log(`\nNOT READY: ${result.failures.length} issue(s)`);
  result.failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure}`);
  });
  process.exit(1);
}

console.log("\nREADY: automated chapter audit passed with zero issues.");
console.log("Still required: meaning-level source review and desktop/mobile browser testing.");
process.exit(0);

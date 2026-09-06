// Rebuild Surah 88 (Al-Ghashiyah) lesson content to pass audit-surah.js.
// Adds intro verification and practice explanations, converts three
// critical-thinking questions into vocabulary questions so the quiz reaches
// 12/7/5/6, strips authoring scaffolding, assigns rhetoricArea, rebalances the
// answer spread and attaches genuine verification everywhere.
//   node scratch/fix-ghashiyah.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const FILE = path.join(__dirname, "..", "src", "data", "surahs", "088-ghashiyah.js");
const DATE = "2026-08-30";
const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "ghashiyah");

const itani = (line, quote) => ({
  status: "verified", by: "ClearQuran (Talal Itani)",
  note: `Quote from translation-notes/88-ghashiyah-itani-teens.md line ${line}: '${quote}'`, checkedAt: DATE,
});
const ik = (verses, quote) => ({
  status: "verified", by: "tafsir Ibn Kathir",
  note: `Ibn Kathir on ${verses}: '${quote}'`, checkedAt: DATE,
});

// ---------- 1. Intro verification ----------
s.introVerified = {
  status: "verified", by: "tafsir Ibn Kathir",
  note: "Summary of 88:1-26 checked against Tafsir Ibn Kathir. On the fire: '(Laboring, weary. They will enter into Fire, Hamiyah.)' and '(They will enter into Fire, Hamiyah) meaning, hot with intense heat.' On its drink and food: '(They will be given to drink from a boiling (Aniyah) spring.) meaning, its heat has reached its maximum limit and boiling point' and 'No food will there be for them but from Dari` ... A tree from the Hellfire' and 'This is of the worst, most disgusting and loathsome of foods.' On Paradise: '(No Laghw will they hear therein, nor any sinful speech. But only the saying of: Salam! Salam!)' On the signs: '(Do they not look at the camels, how they are created) Indeed it is an amazing creation' and 'Thus, He directs the bedouin to consider what he himself witnesses. His camel that he rides upon, the sky that is above his head.' On the Prophet's task: '(You are not a Musaytir over them.) ... You are not a dictator over them. This means that you cannot create faith in their hearts.' On the end: '(Verily, to Us will be their return;) meaning, their place of return and their resort.' The intro's account of the two groups of faces being set side by side is a structural reading of the surah, not a quotation.",
  checkedAt: DATE,
};

// ---------- 2. Practice explanations (regenerated from the cards) ----------
const M = s.vocabulary.map((v) => v.meaning);
const AR = s.vocabulary.map((v) => v.arabic);
const PD = [
  [0, "ar2en", 0, [8, 12, 4]], [1, "ar2en", 2, [2, 3, 9]], [2, "ar2en", 1, [1, 5, 13]],
  [3, "en2ar", 3, [4, 5, 10]], [4, "ar2en", 2, [7, 1, 14]], [5, "en2ar", 0, [9, 11, 2]],
  [6, "ar2en", 1, [12, 2, 15]], [7, "en2ar", 2, [13, 0, 1]], [8, "ar2en", 3, [10, 4, 15]],
  [9, "ar2en", 0, [6, 11, 3]], [10, "en2ar", 1, [12, 8, 5]], [11, "ar2en", 2, [14, 7, 1]],
  [12, "ar2en", 1, [15, 6, 2]], [13, "en2ar", 0, [3, 10, 8]], [14, "ar2en", 3, [5, 9, 0]],
  [15, "en2ar", 1, [11, 13, 4]],
];
s.practice = PD.map(([i, kind, pos, dis]) => {
  if (dis.includes(i)) throw new Error("distractor equals answer at card " + i);
  const pool = kind === "ar2en" ? M : AR;
  const options = [...dis.map((d) => pool[d])];
  options.splice(pos, 0, pool[i]);
  if (new Set(options).size !== 4) throw new Error("duplicate options at card " + i);
  return {
    type: kind,
    q: kind === "ar2en" ? `What does ${AR[i]} mean?` : `Which word means '${M[i]}'?`,
    options, answer: pos,
    explanation: `${AR[i]} means '${M[i]}' — ${s.vocabulary[i].connection}`,
  };
});

// ---------- 3. Quiz ----------
const SCAFFOLD = /^\s*\(Rhetoric\s*-\s*[^)]*\)\s*/i;
const AREA = { 4: "Meaning Construction", 9: "Nazm", 14: "Style of Address", 19: "Meaning Construction", 24: "Nazm", 29: "Style of Address" };
const QV = {
  1: itani(19, "Has the news of the overwhelming event reached you?"),
  5: ik("88:6", "No food will there be for them but from Dari`"),
  7: itani(33, "But on that day, faces will be joyful."),
  11: itani(43, "And raised couches to rest on."),
  13: ik("88:17", "(Do they not look at the camels, how they are created) Indeed it is an amazing creation"),
  17: ik("88:21", "(So remind them -- you are only one who reminds.)"),
  21: ik("88:25", "(Verily, to Us will be their return;) meaning, their place of return and their resort."),
  25: ik("88:5", "meaning, its heat has reached its maximum limit and boiling point."),
  28: itani(35, "Happy with their efforts."),
  2: itani(21, "On that day, some faces will be humbled."),
  6: ik("88:6", "This is of the worst, most disgusting and loathsome of foods."),
  10: ik("88:11", "No Laghw will they hear therein, nor any sinful speech."),
  15: ik("88:20", "Thus, He directs the bedouin to consider what he himself witnesses."),
  18: ik("88:21", "meaning, \"O Muhammad! Remind the people with what you have been sent with to them.\""),
  22: itani(67, "Truly, to Us is their return."),
  26: itani(63, "And cushions lined up neatly."),
  3: itani(23, "Working hard and exhausted."),
  12: itani(47, "And cushions lined up neatly."),
  16: ik("88:17", "Indeed it is an amazing creation, and the way it has been fashioned is strange."),
  27: ik("88:20", "Thus, He directs the bedouin to consider what he himself witnesses."),
  30: itani(19, "Has the news of the overwhelming event reached you?"),
  9: ik("88:1", "The Day of Judgement and what will happen to the People of the Fire during it"),
  14: ik("88:20", "Thus, He directs the bedouin to consider what he himself witnesses. His camel that he rides upon"),
  19: ik("88:11", "But only the saying of: \"Salam! Salam!\""),
  24: ik("88:17", "Do they not look at the camels, how they are created"),
  29: ik("88:22", "You are not a dictator over them.\" This means that you cannot create faith in their hearts."),
};

const old = s.quiz.map((q, i) => ({ ...q, _i: i + 1 }));

// Drop three critical-thinking questions that were also the length-biased ones,
// and add three vocabulary questions so the mix reaches 12/7/5/6.
const DROP_CT = [8, 20, 23];
const NEW_V = [
  {
    _i: 101, category: "Vocabulary", q: `What does ${AR[1]} mean?`,
    options: ["exhausted / weary", "humbled / downcast", "joyful / radiant", "satisfied / pleased"], answer: 1,
    explanation: `${AR[1]} describes the faces of the punished on that Day — lowered in humiliation.`,
    verified: itani(21, "On that day, some faces will be humbled."),
  },
  {
    _i: 102, category: "Vocabulary", q: `What does ${AR[2]} mean?`,
    options: ["humbled / downcast", "exhausted / weary", "laboring / working", "intensely hot / scorching"], answer: 2,
    explanation: `${AR[2]} means working hard — the punished are shown toiling, not idle.`,
    verified: itani(23, "Working hard and exhausted."),
  },
  {
    _i: 103, category: "Vocabulary", q: `What does ${AR[3]} mean?`,
    options: ["laboring / working", "joyful / radiant", "humbled / downcast", "exhausted / weary"], answer: 3,
    explanation: `${AR[3]} means worn out from effort; it follows 'laboring' to complete the picture of their toil.`,
    verified: itani(23, "Working hard and exhausted."),
  },
];

// Q4 asked about the surah's name, which this abridged tafsir passage does not
// gloss. Replaced with a Meaning Construction question the source does explain.
const Q4 = {
  _i: 4, category: "Rhetoric", rhetoricArea: "Meaning Construction",
  q: "Why does the teen translation render the fire in verse 5 as 'intensely hot' rather than simply 'burning'?",
  options: [
    "Because the Arabic word names heat at its peak",
    "Because fire in Arabic has no other meaning",
    "Because burning is a softer English word",
    "Because the verse is about a boiling spring",
  ], answer: 0,
  explanation: "Ibn Kathir explains Hamiyah as 'hot with intense heat', so the translation keeps the idea of heat that has reached its limit rather than the general word burning.",
  verified: ik("88:5", "(They will enter into Fire, Hamiyah) meaning, hot with intense heat."),
};

// Two pre-existing correct answers were 2+ words longer than every distractor,
// which is a guessing clue. Rewritten shorter, still true to the sources.
const FIX = {
  "Allah holds that person accountable and may punish him":
    "Allah holds that person accountable and punishes him",
  "It defines his role clearly while placing choice on listeners and final judgment with Allah":
    "It defines his role and leaves choice to listeners and judgment to Allah",
};

const quiz = old
  .filter((q) => !(q.category === "Critical Thinking" && DROP_CT.includes(q._i)))
  .filter((q) => q._i !== 4)
  .map((q) => {
    if (SCAFFOLD.test(q.q)) q.q = q.q.replace(SCAFFOLD, "");
    q.options = q.options.map((o) => FIX[o] || o);
    if (q.category === "Rhetoric") q.rhetoricArea = AREA[q._i];
    q.verified = QV[q._i];
    return q;
  })
  .concat(NEW_V, Q4);

const ORDER = { Vocabulary: 0, Comprehension: 1, "Critical Thinking": 2, Rhetoric: 3 };
quiz.sort((a, b) => ORDER[a.category] - ORDER[b.category] || a._i - b._i);

const TARGET = [2, 0, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 3];
quiz.forEach((q, index) => {
  const target = TARGET[index];
  const oldOptions = [...q.options];
  const oldAnswer = q.answer;
  q.options = [0, 1, 2, 3].map((i) => oldOptions[(((i - target + oldAnswer) % 4) + 4) % 4]);
  q.answer = target;
  if (q.options[q.answer] !== oldOptions[oldAnswer]) throw new Error("answer text moved at q" + (index + 1));
  delete q._i;
});
s.quiz = quiz;

// ---------- 4. Self-checks ----------
const spread = [0, 0, 0, 0];
s.quiz.forEach((q) => spread[q.answer]++);
if (spread.join(",") !== "8,8,7,7") throw new Error("spread " + spread.join(","));
const want = [...Array(12).fill("Vocabulary"), ...Array(7).fill("Comprehension"), ...Array(5).fill("Critical Thinking"), ...Array(6).fill("Rhetoric")].join(",");
if (s.quiz.map((q) => q.category).join(",") !== want) throw new Error("category order wrong");
if (s.quiz.length !== 30) throw new Error("quiz length " + s.quiz.length);
const areas = {};
s.quiz.filter((q) => q.category === "Rhetoric").forEach((q) => { areas[q.rhetoricArea] = (areas[q.rhetoricArea] || 0) + 1; });
const pairs = Object.entries(areas).sort().map(([k, v]) => k + "=" + v).join(",");
if (pairs !== "Meaning Construction=2,Nazm=2,Style of Address=2") throw new Error("areas " + JSON.stringify(areas));
const bias = [];
s.quiz.forEach((q, i) => {
  if (/\(Rhetoric/.test(q.q)) throw new Error("scaffolding left at q" + (i + 1));
  if (q.category === "Rhetoric" && !/88:\d/.test(q.verified.note)) throw new Error("rhetoric q" + (i + 1) + " lacks verse range");
  if (new Set(q.options).size !== 4) throw new Error("duplicate options q" + (i + 1));
  const w = q.options.map((o) => o.split(/\s+/).length);
  const maxOther = Math.max(...w.filter((_, j) => j !== q.answer));
  if (w[q.answer] - maxOther >= 2) bias.push(`q${i + 1} [${q.category}] ${w[q.answer]}w vs ${maxOther}w :: ${q.q} :: ${q.options.map((o, j) => (j === q.answer ? "*" : "") + o.split(/\s+/).length + "w " + o).join(" | ")}`);
});
if (bias.length) { console.log("LENGTH BIAS (" + bias.length + "):\n" + bias.join("\n")); process.exit(1); }
const sj = (a) => [...a].sort().join("|");
const arBank = s.fillBlanks.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
const enBank = (s.fillBlanksEn?.ayahs || []).flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
if (sj(arBank) !== sj(AR)) throw new Error("arabic bank mismatch");
if (s.fillBlanksEn && sj(enBank) !== sj(M)) throw new Error("english bank mismatch");
const covered = new Set();
s.quiz.filter((q) => q.category === "Vocabulary").forEach((q) => s.vocabulary.forEach((v) => { if (q.q.includes(v.arabic)) covered.add(v.arabic); }));
if (covered.size < 12) throw new Error("vocab coverage " + covered.size);
s.vocabulary.forEach((v) => {
  const ok = s.practice.some((p) => (p.q.includes(v.arabic) && p.options[p.answer] === v.meaning) || (p.q.includes(v.meaning) && p.options[p.answer] === v.arabic));
  if (!ok) throw new Error("practice misses " + v.arabic);
});

fs.writeFileSync(FILE, `// Surah 88 \u00b7 Al-Ghashiyah\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("written; quiz:", s.quiz.length, "spread:", spread.join(","), "areas:", pairs, "vocabCov:", covered.size);
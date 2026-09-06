// Rebuild Surah 83 (Al-Mutaffifin) lesson content to pass audit-surah.js.
// Keeps the existing 30 questions and banks, but: strips authoring scaffolding
// from rhetoric question text, orders the quiz 12/7/5/6, assigns rhetoricArea,
// rotates options to an 8,8,7,7 answer spread, and attaches genuine
// verification to every card, practice item, question and the intro.
//   node scratch/fix-mutaffifin.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const FILE = path.join(__dirname, "..", "src", "data", "surahs", "083-mutaffifin.js");
const DATE = "2026-08-30";
const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "mutaffifin");

const itani = (line, quote) => ({
  status: "verified", by: "ClearQuran (Talal Itani)",
  note: `Quote from translation-notes/83-mutaffifin-itani-teens.md line ${line}: '${quote}'`, checkedAt: DATE,
});
const ik = (verses, quote) => ({
  status: "verified", by: "tafsir Ibn Kathir",
  note: `Ibn Kathir on ${verses}: '${quote}'`, checkedAt: DATE,
});

// ---------- 1. English bank: one tile drifted from the vocabulary meaning ----------
s.fillBlanksEn.ayahs.forEach((a) => a.segments.forEach((x) => {
  if (x.b === "laugh / mock") x.b = "they laugh / they mock";
}));

// ---------- 2. Vocabulary verification (keyed by meaning) ----------
const VV = {
  "the defrauders / the cheats": itani(19, "How terrible for those who cheat others."),
  "they take in full": itani(21, "Those who, when they take measure from people, demand full amounts."),
  "they cause loss / they cheat": itani(23, "But when they measure or weigh for others, they give less than they should."),
  "they will be resurrected": itani(25, "Don't they realize they'll be raised back to life?"),
  "the wicked / the evildoers": itani(31, "Truly, the record of the wicked is kept in Sijjin."),
  "Sijjeen — a confining place beneath the earth": ik("83:7", "(Nay! Truly, the Record of the wicked is in Sijjin.) meaning, that their final destination and their abode will be in Sijjin, which is derived from the word prison (Sijn)"),
  "written / inscribed": ik("83:9", "Meaning, it is inscribed, written, and completed. No one can add to it and no one can remove anything from it."),
  "has rusted / has covered": ik("83:14", "(Nay! But on their hearts is the Ran (covering) which they used to earn.) This dark covering known as Rayn overcomes the hearts of the disbelievers"),
  "the righteous / the pious": itani(53, "Truly, the record of the righteous is kept in Illiyyin."),
  "'Illiyun — the highest place": ik("83:18", "(is in `Illiyyin.) meaning, their final destination is `Illiyyin, which is the opposite of Sijjin."),
  "those brought near (to Allah)": itani(59, "Witnessed by those close to Allah."),
  "couches / thrones (to recline on)": itani(63, "Relaxing on couches, looking around."),
  "pure nectar / an exquisite drink": itani(67, "They'll be given a pure drink, sealed and protected."),
  "sealed / stamped": itani(67, "They'll be given a pure drink, sealed and protected."),
  "they laugh / they mock": itani(75, "Those who did wrong used to laugh at the believers."),
  "they gaze / they look": itani(63, "Relaxing on couches, looking around."),
};
s.vocabulary.forEach((v) => {
  if (!VV[v.meaning]) throw new Error("no verification planned for meaning: " + v.meaning);
  v.verified = VV[v.meaning];
  v.source = { ...v.source, checkedAt: DATE };
});

// ---------- 3. Practice: regenerated from the vocabulary so pairings are exact ----------
const M = s.vocabulary.map((v) => v.meaning);
const AR = s.vocabulary.map((v) => v.arabic);
// [cardIndex, kind, answerPosition, three distractor card indices]
const PD = [
  [0, "ar2en", 1, [2, 8, 12]], [1, "ar2en", 3, [0, 2, 11]], [2, "ar2en", 0, [1, 7, 13]],
  [3, "ar2en", 2, [4, 9, 15]], [4, "ar2en", 1, [8, 10, 0]], [5, "en2ar", 0, [9, 6, 11]],
  [6, "en2ar", 2, [13, 5, 0]], [7, "ar2en", 3, [6, 15, 1]], [8, "ar2en", 0, [4, 10, 2]],
  [9, "en2ar", 1, [5, 12, 11]], [10, "ar2en", 2, [8, 4, 6]], [11, "en2ar", 3, [12, 9, 3]],
  [12, "ar2en", 1, [11, 13, 7]], [13, "en2ar", 0, [6, 12, 2]], [14, "ar2en", 2, [15, 11, 3]],
  [15, "en2ar", 1, [14, 10, 8]],
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

// ---------- 4. Quiz ----------
const SCAFFOLD = /^\s*\(Rhetoric\s*-\s*[^)]*\)\s*/i;
const old = s.quiz.map((q, i) => ({ ...q, _i: i + 1 }));

// rhetoricArea by original question number, taken from the scaffolding label
const AREA = { 4: "Nazm", 9: "Meaning Construction", 14: "Style of Address", 19: "Nazm", 24: "Meaning Construction", 29: "Style of Address" };

// Verified source per original question number.
const QV = {
  1: itani(19, "How terrible for those who cheat others."),
  2: itani(21, "Those who, when they take measure from people, demand full amounts."),
  3: itani(23, "But when they measure or weigh for others, they give less than they should."),
  5: itani(25, "Don't they realize they'll be raised back to life?"),
  6: itani(31, "Truly, the record of the wicked is kept in Sijjin."),
  7: ik("83:7", "(Nay! Truly, the Record of the wicked is in Sijjin.) meaning, that their final destination and their abode will be in Sijjin"),
  8: ik("83:9", "Meaning, it is inscribed, written, and completed."),
  10: ik("83:14", "(Nay! But on their hearts is the Ran (covering) which they used to earn.)"),
  11: itani(53, "Truly, the record of the righteous is kept in Illiyyin."),
  12: ik("83:18", "meaning, their final destination is `Illiyyin, which is the opposite of Sijjin."),
  26: itani(67, "They'll be given a pure drink, sealed and protected."),
  30: itani(75, "Those who did wrong used to laugh at the believers."),
  13: itani(19, "How terrible for those who cheat others."),
  15: itani(25, "Don't they realize they'll be raised back to life?"),
  16: ik("83:7", "their final destination and their abode will be in Sijjin"),
  17: ik("83:18", "meaning, their final destination is `Illiyyin, which is the opposite of Sijjin."),
  18: itani(67, "They'll be given a pure drink, sealed and protected."),
  20: ik("83:29", "Allah informs that the criminals used to laugh at the believers in the worldly life."),
  21: itani(59, "Witnessed by those close to Allah."),
  22: ik("83:1", "the people of Al-Madinah were the most terrible people in giving measurement"),
  23: ik("83:18", "which is the opposite of Sijjin"),
  25: ik("83:34", "(those who believe will laugh at the disbelievers) meaning, as retribution for how those people laughed at them."),
  27: ik("83:14", "Verily, when the servant commits a sin, a black spot appears in his heart."),
  28: ik("83:15", "(Nay! Surely, they will be veiled from seeing their Lord that Day.)"),
  4: ik("83:1", "When the Prophet came to Al-Madinah, the people of Al-Madinah were the most terrible people in giving measurement (i.e., they used to cheat). Thus, Allah revealed, (Woe to Al-Mutaffifin.)"),
  9: ik("83:14", "This dark covering known as Rayn overcomes the hearts of the disbelievers"),
  14: ik("83:29", "Whenever they would pass by the believers, they would wink at each other about them, meaning in contempt of them."),
  19: ik("83:18", "meaning, their final destination is `Illiyyin, which is the opposite of Sijjin."),
  29: ik("83:36", "(Are not the disbelievers paid for what they used to do) meaning, `will the disbelievers be recompensed for their mockery and belittlement against the believers, or not'"),
};

// Q24 originally asked about the sealed drink, which this abridged tafsir
// passage does not explain. Replaced with a Meaning Construction question the
// source does support, so no quotation is stretched to fit.
const Q24 = {
  _i: 24, category: "Rhetoric", rhetoricArea: "Meaning Construction",
  q: "Why does the teen translation keep the Arabic name Sijjin instead of simply writing 'a prison'?",
  options: [
    "Because the word is a proper name with no meaning",
    "Because the Arabic letters spell a different word",
    "Because the translation could not decide a meaning",
    "Because the name itself carries the picture of confinement",
  ], answer: 3,
  explanation: "Ibn Kathir points out that Sijjin is derived from the Arabic word for prison, so keeping the name preserves the picture of a narrow, confining place rather than flattening it into one English noun.",
  verified: ik("83:7", "which is derived from the word prison (Sijn), and here it means straitened circumstances"),
};

// Three pre-existing correct answers were 2+ words longer than every distractor,
// which is a guessing clue. Rewritten shorter, still true to the sources.
const FIX = {
  "A sealed pure nectar whose seal is musk": "A pure drink sealed with musk",
  "Because if you truly believe in judgment, you would fear even small cheating":
    "Because true belief in judgment forbids cheating",
  "It mirrors the moral state of the wicked and righteous in their destinies":
    "It matches each group's inner state to its end",
};

const quiz = old.filter((q) => q._i !== 24).map((q) => {
  if (SCAFFOLD.test(q.q)) q.q = q.q.replace(SCAFFOLD, "");
  q.options = q.options.map((o) => FIX[o] || o);
  if (FIX[q.options[q.answer]]) q.options = q.options.map((o) => FIX[o] || o);
  if (q.category === "Rhetoric") q.rhetoricArea = AREA[q._i];
  q.verified = QV[q._i];
  return q;
});
quiz.push(Q24);

const ORDER = { Vocabulary: 0, Comprehension: 1, "Critical Thinking": 2, Rhetoric: 3 };
quiz.sort((a, b) => ORDER[a.category] - ORDER[b.category] || a._i - b._i);

// rotate options so the correct answer lands on a balanced index sequence
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

// ---------- 5. Intro verification ----------
s.introVerified = {
  status: "verified", by: "tafsir Ibn Kathir",
  note: "Summary of 83:1-36 checked against Tafsir Ibn Kathir. On the reason of revelation: 'When the Prophet came to Al-Madinah, the people of Al-Madinah were the most terrible people in giving measurement (i.e., they used to cheat). Thus, Allah revealed, (Woe to Al-Mutaffifin.) After this, they began to give good measure.' On the cheat itself: 'demand full measure, meaning, they take their right by demanding full measure and extra as well' and 'give less than due) meaning, they decrease.' On the two records: 'their final destination and their abode will be in Sijjin, which is derived from the word prison (Sijn)' and 'their final destination is `Illiyyin, which is the opposite of Sijjin.' On the heart: 'This dark covering known as Rayn overcomes the hearts of the disbelievers' with the hadith 'Verily, when the servant commits a sin, a black spot appears in his heart.' On the reversal: 'Allah informs that the criminals used to laugh at the believers in the worldly life' and '(those who believe will laugh at the disbelievers) meaning, as retribution for how those people laughed at them.' The intro's account of the two records being set side by side is a structural reading of the surah, not a quotation.",
  checkedAt: DATE,
};

// ---------- 6. Self-checks ----------
const spread = [0, 0, 0, 0];
s.quiz.forEach((q) => spread[q.answer]++);
if (spread.join(",") !== "8,8,7,7") throw new Error("spread " + spread.join(","));
const want = [...Array(12).fill("Vocabulary"), ...Array(7).fill("Comprehension"), ...Array(5).fill("Critical Thinking"), ...Array(6).fill("Rhetoric")].join(",");
if (s.quiz.map((q) => q.category).join(",") !== want) throw new Error("category order wrong");
if (s.quiz.length !== 30) throw new Error("quiz length " + s.quiz.length);
const areas = {};
s.quiz.filter((q) => q.category === "Rhetoric").forEach((q) => { areas[q.rhetoricArea] = (areas[q.rhetoricArea] || 0) + 1; });
const areaPairs = Object.entries(areas).sort().map(([k, v]) => k + "=" + v).join(",");
if (areaPairs !== "Meaning Construction=2,Nazm=2,Style of Address=2") throw new Error("areas " + JSON.stringify(areas));
const bias = [];
s.quiz.forEach((q, i) => {
  if (/\(Rhetoric/.test(q.q)) throw new Error("scaffolding left at q" + (i + 1));
  if (q.category === "Rhetoric" && !/83:\d/.test(q.verified.note)) throw new Error("rhetoric q" + (i + 1) + " lacks verse range");
  if (new Set(q.options).size !== 4) throw new Error("duplicate options q" + (i + 1));
  const w = q.options.map((o) => o.split(/\s+/).length);
  const maxOther = Math.max(...w.filter((_, j) => j !== q.answer));
  if (w[q.answer] - maxOther >= 2) bias.push(`q${i + 1} [${q.category}] ${w[q.answer]}w vs ${maxOther}w :: ${q.q} :: ${q.options.map((o, j) => (j === q.answer ? "*" : "") + o.split(/\s+/).length + "w " + o).join(" | ")}`);
});
if (bias.length) { console.log("LENGTH BIAS (" + bias.length + "):\n" + bias.join("\n")); process.exit(1); }
const sj = (a) => [...a].sort().join("|");
const arBank = s.fillBlanks.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
const enBank = s.fillBlanksEn.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
if (sj(arBank) !== sj(s.vocabulary.map((v) => v.arabic))) throw new Error("arabic bank mismatch");
if (sj(enBank) !== sj(s.vocabulary.map((v) => v.meaning))) throw new Error("english bank mismatch");
const covered = new Set();
s.quiz.filter((q) => q.category === "Vocabulary").forEach((q) => s.vocabulary.forEach((v) => { if (q.q.includes(v.arabic)) covered.add(v.arabic); }));
if (covered.size < 12) throw new Error("vocab coverage " + covered.size);
s.vocabulary.forEach((v) => {
  const ok = s.practice.some((p) => (p.q.includes(v.arabic) && p.options[p.answer] === v.meaning) || (p.q.includes(v.meaning) && p.options[p.answer] === v.arabic));
  if (!ok) throw new Error("practice misses " + v.arabic);
});

fs.writeFileSync(FILE, `// Surah 83 \u00b7 Al-Mutaffifin\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("written; quiz:", s.quiz.length, "spread:", spread.join(","), "areas:", JSON.stringify(areas), "vocabCov:", covered.size);
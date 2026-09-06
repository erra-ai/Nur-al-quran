// Scoped Layer-2 check (same rules as verify-translations.js) for the five
// assigned surahs only, because the repo-wide tool caps its issue list at 60.
//   node scratch/check-five-signoff.js
const { loadLessonData } = require("../lesson-data-loader");

const IDS = ["naba", "takwir", "mutaffifin", "ghashiyah", "qadr"];
const ALLOWED = [
  "ClearQuran (Talal Itani)",
  "Saheeh International",
  "The Noble Qur'an (Muhsin Khan)",
  "The Noble Qur'an (Pickthall)",
  "The Noble Qur'an (Yusuf Ali)",
  "Abdul Haleem",
  "tafsir Ibn Kathir",
  "corpus.quran.com",
  "self",
];
const BANNED = /Maududi|Ma'arif|Tafsir al-Sa'di|Tafsir al-Jalalayn/i;

const { lessons } = loadLessonData();
let checked = 0;
let problems = 0;

function check(label, block) {
  checked++;
  if (!block) {
    problems++;
    console.log(`MISSING verified  ${label}`);
    return;
  }
  const { status, by, checkedAt, note } = block;
  const p = [];
  if (!status) p.push("no status");
  else if (!["verified", "unverified"].includes(status)) p.push(`bad status "${status}"`);
  if (!by) p.push("no by");
  else if (!ALLOWED.includes(by)) p.push(`by="${by}" not allowed`);
  if (status === "verified" && !checkedAt) p.push("verified without checkedAt");
  if (status !== "verified") p.push(`status=${status}`);
  if (BANNED.test(`${by || ""} ${note || ""}`)) p.push("cites a removed tafsir");
  if (p.length) {
    problems++;
    console.log(`BAD  ${label}  -> ${p.join(", ")}`);
  }
}

for (const id of IDS) {
  const surah = lessons.find((m) => m.id === id);
  if (!surah) {
    console.log(`no module ${id}`);
    problems++;
    continue;
  }
  surah.vocabulary.forEach((v, i) => check(`${id} vocab ${i + 1} (${v.arabic})`, v.verified));
  surah.quiz.forEach((q, i) => check(`${id} Q${i + 1}`, q.verified));
  check(`${id} intro`, surah.introVerified);
  const studentText = [
    surah.intro,
    ...surah.vocabulary.flatMap((v) => [v.meaning, v.connection, v.hint]),
    ...surah.quiz.flatMap((q) => [q.q, (q.options || []).join(" "), q.explanation]),
  ].join(" ");
  if (BANNED.test(studentText)) {
    problems++;
    console.log(`BANNED tafsir named in student text: ${id}`);
  }
}

console.log(`\n${checked} sign-offs checked across ${IDS.length} modules, ${problems} problem(s).`);
process.exit(problems ? 1 : 0);

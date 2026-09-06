// Sequential per-surah acceptance walk for the Mushaf-style Quran display.
// Processes every registered surah one at a time, in ascending order.
//
//   node scratch/verify-quran-display.js
//
// Per surah it checks:
//   1. module fillBlanks contains the canonical ayah set, numbered in order
//   2. the Itani teen translation data has the same number of ayahs
//   3. basmala handling matches the rule (Al-Fatiha: none separate)
//   4. the Quran.com API returns the expected number of verses (paginated)

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadLessonData } = require("../lesson-data-loader");

const API = "https://api.quran.com/api/v4";

const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52,
  99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69,
  60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14,
  11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50,
  40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11,
  8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

async function fetchVerseCount(chapter) {
  const response = await fetch(
    `${API}/quran/verses/uthmani_tajweed?chapter_number=${chapter}&per_page=50&page=1`,
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const verses = Array.isArray(json.verses) ? json.verses : [];
  const pagination = json.pagination || {};
  const totalPages = Number(pagination.total_pages || 0);
  return { count: verses.length, totalPages };
}

(async () => {
  const { surahs } = loadLessonData();
  const sorted = [...surahs].sort((a, b) => a.number - b.number);

  const dataSrc = fs.readFileSync(
    path.join(__dirname, "..", "src", "data", "translations", "itani-teens.js"),
    "utf8",
  );
  const literal = dataSrc.slice(dataSrc.indexOf("{"), dataSrc.lastIndexOf("}") + 1);
  const TRANSLATIONS = vm.runInNewContext(`(${literal})`);

  let failures = 0;
  console.log(`Sequential display walk over ${sorted.length} registered surahs (ascending):\n`);

  for (const s of sorted) {
    const number = s.number;
    const canonical = AYAH_COUNTS[number - 1];
    const lines = [];

    const moduleAyahs = s.fillBlanks?.ayahs ?? [];
    const numberedOk =
      moduleAyahs.length === canonical &&
      moduleAyahs.every((ayah, index) => ayah.n === index + 1);
    lines.push(`module ayahs: ${moduleAyahs.length}/${canonical}${numberedOk ? " (numbered in order)" : " MISMATCH"}`);
    if (!numberedOk) failures++;

    const t = TRANSLATIONS[number];
    const transCount = t?.ayahs?.length ?? 0;
    lines.push(`translations: ${transCount}/${canonical}`);
    if (transCount !== canonical) failures++;

    const basmalaRule =
      number === 1
        ? t?.basmala === null
        : (typeof t?.basmala === "string" && t.basmala.length > 0);
    lines.push(`basmala rule: ${number === 1 ? "none separate (ayah 1)" : basmalaRule ? "separate" : "MISSING"}`);
    if (!basmalaRule) failures++;

    const before = failures;

    let api = null;
    try {
      api = await fetchVerseCount(number);
      lines.push(`quran.com: ${api.count}/${canonical} verses${api.totalPages > 1 ? ` (paginated: ${api.totalPages} pages)` : ""}`);
      if (api.count !== canonical) failures++;
    } catch (error) {
      lines.push(`quran.com: UNAVAILABLE (${error.message})`);
      failures++;
    }

    const ok = failures === before;
    console.log(`[${ok ? "PASS" : "FAIL"}] ${String(number).padStart(3)} ${s.nameEnglish.padEnd(16)} ${lines.join(" · ")}`);
  }

  console.log(`\n${failures === 0 ? "ALL PASS" : failures + " FAILURE(S)"}`);
  process.exit(failures === 0 ? 0 : 1);
})();
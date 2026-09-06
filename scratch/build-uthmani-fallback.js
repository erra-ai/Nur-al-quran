// Build a dedicated, verified Uthmani fallback for every registered surah from
// the Quran.com text_uthmani_tajweed source (tags removed, Uthmani characters
// preserved). This is NOT reconstructed from fillBlanks.
//   node scratch/build-uthmani-fallback.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const API = "https://api.quran.com/api/v4";
const OUT = path.join(__dirname, "..", "src", "data", "quran-fallback.js");

const AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52,
  99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69,
  60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14,
  11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50,
  40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11,
  8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

// Same character normalisation the browser sanitizer applies.
function cleanChars(s) {
  return s
    .replaceAll("\u0672", "\u0670")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\u061C\uFEFF]/g, "");
}
// Remove the ornamental ayah-end span (and its digit) then all remaining tags.
function stripToUthmani(raw) {
  return cleanChars(
    String(raw || "")
      .replace(/<span\s+class=end>[\s\S]*?<\/span>/gi, " ")
      .replace(/<[^>]*>/g, "")
  ).replace(/\s+/g, " ").trim();
}
function ayahOf(key) { return Number(String(key).split(":")[1]); }

async function fetchAll(chapter) {
  const byKey = new Map();
  let page = 1;
  while (true) {
    const res = await fetch(`${API}/quran/verses/uthmani_tajweed?chapter_number=${chapter}&per_page=50&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for chapter ${chapter}`);
    const data = await res.json();
    const verses = Array.isArray(data.verses) ? data.verses : [];
    verses.forEach((v) => byKey.set(v.verse_key, v));
    const pag = data.pagination || {};
    const nextPage = Number(pag.next_page || 0);
    const totalPages = Number(pag.total_pages || 0);
    if (verses.length === 0) break;
    if (nextPage > page) { page = nextPage; continue; }
    if (totalPages > page) { page += 1; continue; }
    break;
  }
  return [...byKey.values()].sort((a, b) => ayahOf(a.verse_key) - ayahOf(b.verse_key));
}

(async () => {
  const { surahs } = loadLessonData();
  const sorted = [...surahs].sort((a, b) => a.number - b.number);
  const out = {};

  for (const s of sorted) {
    const verses = await fetchAll(s.number);
    const canonical = AYAH_COUNTS[s.number - 1];
    if (verses.length !== canonical) {
      throw new Error(`Surah ${s.number} (${s.id}): API returned ${verses.length}, expected ${canonical}`);
    }
    const ayahs = verses.map((v) => stripToUthmani(v.text_uthmani_tajweed));
    ayahs.forEach((t, i) => {
      if (!t) throw new Error(`Surah ${s.number} ayah ${i + 1}: empty fallback text`);
      if (/[\uFFFD]/.test(t)) throw new Error(`Surah ${s.number} ayah ${i + 1}: replacement char`);
      if (/[A-Za-z]/.test(t)) throw new Error(`Surah ${s.number} ayah ${i + 1}: contains Latin letters`);
    });
    out[s.number] = { basmala: null, ayahs };
    console.log(`${String(s.number).padStart(3)} ${s.id.padEnd(11)} ${ayahs.length} verses captured`);
    await new Promise((r) => setTimeout(r, 120)); // polite client
  }

  // Basmala (verse 1:1) captured once, used as the separate basmala for every
  // surah except Al-Fatiha (where it is ayah 1) and At-Tawbah (none).
  const bRes = await fetch(`${API}/quran/verses/uthmani_tajweed?verse_key=1:1`);
  const bData = await bRes.json();
  const basmala = stripToUthmani(bData.verses?.[0]?.text_uthmani_tajweed);
  console.log(`basmala captured: ${basmala}`);

  for (const key of Object.keys(out)) {
    const n = Number(key);
    out[n].basmala = n === 1 || n === 9 ? null : basmala;
  }

  const body =
    `// Dedicated verified Uthmani fallback text for the Mushaf-style display.\n` +
    `// Captured from Quran.com text_uthmani_tajweed by scratch/build-uthmani-fallback.js\n` +
    `// (tags removed, Uthmani marks preserved). Used only when the API is unreachable.\n` +
    `// Do not hand-edit; regenerate from the API and verify instead.\n\n` +
    `export const UTHMANI_FALLBACK = Object.freeze(${JSON.stringify(out, null, 2)});\n`;
  fs.writeFileSync(OUT, body, "utf8");
  console.log(`\nwritten: ${path.relative(path.join(__dirname, ".."), OUT)}`);
})().catch((e) => { console.error("BUILD FAILED:", e.message); process.exit(1); });
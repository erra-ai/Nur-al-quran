// READ-ONLY probe: for every registered surah except 114, fetch the Quran.com
// Uthmani Tajweed text and report: verse count, distinct tajweed/rule class
// tokens, and any special Unicode (pause marks, U+0672, U+FFFD, bidi controls).
//   node scratch/probe-tajweed-classes.js
const path = require("path");
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

const SPECIAL = {
  "\u0672": "U+0672 wavy-hamza alef",
  "\uFFFD": "U+FFFD replacement char",
  "\u200C": "U+200C ZWNJ",
  "\u200D": "U+200D ZWJ",
  "\u200E": "U+200E LRM", "\u200F": "U+200F RLM",
  "\u202A": "U+202A LRE", "\u202B": "U+202B RLE",
  "\u202C": "U+202C PDF", "\u202D": "U+202D LRO", "\u202E": "U+202E RLO",
  "\u061C": "U+061C ALM",
  "\u06D6": "U+06D6 sadah", "\u06D7": "U+06D7", "\u06D8": "U+06D8",
  "\u06D9": "U+06D9", "\u06DA": "U+06DA", "\u06DB": "U+06DB", "\u06DC": "U+06DC",
  "\u06DD": "U+06DD END OF AYAH", "\u06DE": "U+06DE",
  "\u06DF": "U+06DF", "\u06E0": "U+06E0",
  "\u06E1": "U+06E1", "\u06E2": "U+06E2", "\u06E3": "U+06E3", "\u06E4": "U+06E4",
  "\u06E5": "U+06E5 small low alef", "\u06E6": "U+06E6 small high alef",
  "\u06E7": "U+06E7", "\u06E8": "U+06E8", "\u06E9": "U+06E9",
  "\u06EA": "U+06EA", "\u06EB": "U+06EB", "\u06EC": "U+06EC", "\u06ED": "U+06ED",
  "\u0640": "U+0640 tatweel",
};

(async () => {
  const { surahs } = loadLessonData();
  const targets = surahs.filter((s) => s.number !== 114).sort((a, b) => a.number - b.number);
  const globalClasses = new Map(); // class -> Set of surah numbers
  const globalSpecials = new Map();

  for (const s of targets) {
    const url = `${API}/quran/verses/uthmani_tajweed?chapter_number=${s.number}&per_page=50&page=1`;
    let data;
    try {
      const res = await fetch(url);
      if (!res.ok) { console.log(`${s.number} ${s.id}: HTTP ${res.status}`); continue; }
      data = await res.json();
    } catch (e) { console.log(`${s.number} ${s.id}: FETCH ERROR ${e.message}`); continue; }

    const verses = Array.isArray(data.verses) ? data.verses : [];
    const canonical = AYAH_COUNTS[s.number - 1];
    const classes = new Set();
    const specials = new Set();
    const tags = new Set();
    for (const v of verses) {
      const t = v.text_uthmani_tajweed || "";
      for (const m of t.matchAll(/<(tajweed|rule)\s+class=([a-zA-Z_]+)>/g)) {
        classes.add(m[2]);
        if (!globalClasses.has(m[2])) globalClasses.set(m[2], new Set());
        globalClasses.get(m[2]).add(s.number);
      }
      for (const m of t.matchAll(/<([a-zA-Z]+)[^>]*>/g)) tags.add(m[1]);
      for (const ch of t) if (SPECIAL[ch]) specials.add(SPECIAL[ch]);
      for (const sp of specials) {
        if (!globalSpecials.has(sp)) globalSpecials.set(sp, new Set());
        globalSpecials.get(sp).add(s.number);
      }
    }
    const countOk = verses.length === canonical ? "OK" : `MISMATCH expected ${canonical}`;
    console.log(`${String(s.number).padStart(3)} ${s.id.padEnd(11)} ${verses.length} verses ${countOk} | tags: ${[...tags].join(",") || "none"} | classes: ${[...classes].sort().join(", ")}`);
    if (specials.size) console.log(`      specials: ${[...specials].join(", ")}`);
    const pag = data.pagination || {};
    if (Number(pag.total_pages || 1) > 1) console.log(`      PAGINATED: total_pages=${pag.total_pages}`);
  }

  console.log("\n=== GLOBAL tajweed class tokens across all 37 surahs ===");
  for (const [cls, nums] of [...globalClasses.entries()].sort()) {
    console.log(`${cls.padEnd(24)} in ${nums.size} surah(s)`);
  }
  console.log("\n=== GLOBAL special characters ===");
  if (!globalSpecials.size) console.log("none");
  for (const [sp, nums] of [...globalSpecials.entries()].sort()) {
    console.log(`${sp.padEnd(28)} in ${nums.size} surah(s): ${[...nums].sort((a,b)=>a-b).join(",")}`);
  }
})();
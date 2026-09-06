// READ-ONLY integrity audit for Surah 114 (An-Nas).
// Checks encoding, segmentation, translation alignment, vocab linkage,
// ayah numbering, and fallback-vs-API text integrity.
//   node scratch/audit-nas-integrity.js

const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "src", "data", "surahs", "114-nas.js");
const NOTE = path.join(ROOT, "translation-notes", "114-nas-itani-teens.md");

const { surahs } = loadLessonData();
const nas = surahs.find((s) => s.id === "nas");

// ---------------------------------------------------------------------------
// 1. Character encoding scan over every Arabic string in the module
// ---------------------------------------------------------------------------
const SUSPECT = {
  "\u200C": "ZWNJ", "\u200D": "ZWJ", "\u200E": "LRM", "\u200F": "RLM",
  "\u061C": "ALM", "\u202A": "LRE", "\u202B": "RLE", "\u202C": "PDF",
  "\u202D": "LRO", "\u202E": "RLO", "\u2066": "LRI", "\u2067": "RLI",
  "\u2068": "FSI", "\u2069": "PDI", "\uFEFF": "BOM", "\u00AD": "SHY",
  "\u0640": "TATWEEL", "\u06DD": "END-OF-AYAHH", "\u06DE": "RUB-HIZB",
  "\u06E5": "SMALL-LOW-ALEF", "\u06E6": "SMALL-HIGH-ALEF",
  "\u06E7": "NUQTA-HIGH", "\u06E8": "NUQTA-LOW", "\u06DA": "SORHE",
  "\u06DB": "ZHE", "\u06DC": "MADDABADLYE", "\u06DF": "SMALL-HIGH-YEH",
  "\u06E0": "ULTRA-ZWJ-YEH", "\u06E9": "RAHM", "\u066A": "ARABIC-QM",
  "\u066B": "ARABIC-DC", "\u066C": "ARABIC-SEPARATOR",
};

function scanString(label, value) {
  const findings = [];
  const chars = [...value];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cp = ch.codePointAt(0);
    if (SUSPECT[ch]) findings.push(`${label} @${i}: ${SUSPECT[ch]} U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
    else if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) findings.push(`${label} @${i}: control char U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
    else if (cp >= 0x300 && cp <= 0x36f) findings.push(`${label} @${i}: COMBINING DIACRITIC (Latin range) U+0${cp.toString(16)}`);
    else if (cp >= 0x0600 && cp <= 0x06ff) { /* Arabic block: allowed */ }
    else if (cp >= 0xfe70 && cp <= 0xfeff) findings.push(`${label} @${i}: presentation form U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
    else if (cp >= 0x0860 && cp <= 0x08ff) findings.push(`${label} @${i}: Arabic Supplement-A U+${cp.toString(16).toUpperCase().padStart(4, "0")}`);
  }
  return findings;
}

const encFindings = [];
function walk(label, node) {
  if (typeof node === "string") {
    if (/[\u0600-\u06ff]/.test(node)) encFindings.push(...scanString(label, node));
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => walk(`${label}[${i}]`, v)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(`${label}.${k}`, v);
  }
}
walk("module", nas);

// also scan the raw file bytes for BOM / CR / control chars
const raw = fs.readFileSync(FILE);
const rawFindings = [];
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) rawFindings.push("file starts with UTF-8 BOM");
if (raw.includes(0x0d)) rawFindings.push("file contains CR bytes (CRLF line endings)");
for (let i = 0; i < raw.length; i++) {
  const b = raw[i];
  if (b < 0x09 || (b >= 0x0b && b <= 0x0c) || (b >= 0x0e && b <= 0x1f && b !== 0x1b)) { rawFindings.push(`control byte 0x${b.toString(16)} at offset ${i}`); break; }
}

// ---------------------------------------------------------------------------
// 2. Word segmentation: each Arabic b segment must be a single orthographic word
// ---------------------------------------------------------------------------
const segFindings = [];
for (const ayah of nas.fillBlanks.ayahs) {
  for (const seg of ayah.segments) {
    if (seg.b === undefined) continue;
    if (/\s/.test(seg.b.trim())) segFindings.push(`ayah ${ayah.n}: b segment contains internal space: "${seg.b}"`);
    if (/[\u0600-\u06ff]/.test(seg.b) === false) segFindings.push(`ayah ${ayah.n}: b segment is not Arabic: "${seg.b}"`);
  }
}

// ---------------------------------------------------------------------------
// 4. Translation alignment: banks, m-mapping, counts, Itani wording
// ---------------------------------------------------------------------------
const alignFindings = [];
const arBlanks = nas.fillBlanks.ayahs.flatMap(a => a.segments.filter(s => s.b !== undefined));
const enBlanks = nas.fillBlanksEn.ayahs.flatMap(a => a.segments.filter(s => s.b !== undefined));
const vocabAr = nas.vocabulary.map(v => v.arabic);
const vocabEn = nas.vocabulary.map(v => v.meaning);

if (arBlanks.length !== vocabAr.length) alignFindings.push(`Arabic blank count ${arBlanks.length} != vocabulary ${vocabAr.length}`);
if (enBlanks.length !== vocabEn.length) alignFindings.push(`English blank count ${enBlanks.length} != vocabulary ${vocabEn.length}`);
const sortedEq = (a, b) => [...a].sort().join("|") === [...b].sort().join("|");
if (!sortedEq(arBlanks.map(s => s.b), vocabAr)) alignFindings.push("Arabic bank != vocabulary[].arabic");
if (!sortedEq(arBlanks.map(s => s.m), vocabEn)) alignFindings.push("Arabic m values != vocabulary[].meaning");
if (!sortedEq(enBlanks.map(s => s.b), vocabEn)) alignFindings.push("English bank != vocabulary[].meaning");
if (!sortedEq(enBlanks.map(s => s.m), vocabAr)) alignFindings.push("English m values != vocabulary[].arabic");
// per-ayah segment count parity
nas.fillBlanks.ayahs.forEach((a, i) => {
  const b = nas.fillBlanksEn.ayahs[i];
  if (!b || b.n !== a.n) { alignFindings.push(`ayah pairing mismatch at index ${i}`); return; }
  if (a.segments.length !== b.segments.length) alignFindings.push(`ayah ${a.n}: segment count ar=${a.segments.length} en=${b.segments.length}`);
});

// Itani wording check: every English b tile must appear inside the matching note line
const noteText = fs.readFileSync(NOTE, "utf8");
const noteLines = {};
for (const m of noteText.matchAll(/^(\d+)\.\s+(.*)$/gm)) noteLines[Number(m[1])] = m[2];
const itaniFindings = [];
nas.fillBlanksEn.ayahs.forEach((a) => {
  const line = noteLines[a.n] || "";
  for (const seg of a.segments) {
    if (seg.b !== undefined && !line.includes(seg.b)) {
      itaniFindings.push(`ayah ${a.n}: tile "${seg.b}" not found verbatim in Itani line: ${line}`);
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Vocabulary linkage: every card word appears in the surah text
// ---------------------------------------------------------------------------
const fullArabic = nas.fillBlanks.ayahs.map(a => a.segments.map(s => s.t ?? s.b ?? "").join("")).join(" ");
const vocabFindings = [];
for (const v of nas.vocabulary) {
  const whole = new RegExp(`(^|\\s)${v.arabic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$|\\.)`).test(fullArabic);
  if (!whole) vocabFindings.push(`vocabulary card "${v.arabic}" not found as a whole word in the surah text`);
}

// ---------------------------------------------------------------------------
// 8. Ayah numbering
// ---------------------------------------------------------------------------
const numFindings = [];
nas.fillBlanks.ayahs.forEach((a, i) => { if (a.n !== i + 1) numFindings.push(`fillBlanks index ${i} has n=${a.n}`); });
nas.fillBlanksEn.ayahs.forEach((a, i) => { if (a.n !== i + 1) numFindings.push(`fillBlanksEn index ${i} has n=${a.n}`); });
if (nas.fillBlanks.ayahs.length !== 6) numFindings.push(`fillBlanks has ${nas.fillBlanks.ayahs.length} ayahs, expected 6`);

// ---------------------------------------------------------------------------
// 9. Fallback text vs Quran.com API (with the same U+0672 -> U+0670 rule
//    the app's sanitizer applies)
// ---------------------------------------------------------------------------
function stripTags(html) {
  // Remove the ornamental ayah-end marker entirely (its Arabic-Indic digit is
  // not part of the words), then drop remaining tags, then join letters that
  // tajweed spans split apart ("ٱ ل ن ا س" -> "ٱلناس").
  return html
    .replace(/<span\s+class=end>.*?<\/span>/gs, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .trim();
}
// Orthographic equivalence classes for Uthmani vs simple text:
//   U+0671 alef wasla   -> U+0627   U+0672 wavy hamza -> U+0670
//   U+0649/U+064A final-> U+064A    small alefs       -> U+0670
function canon(s) {
  return s
    .replaceAll("\u0671", "\u0627")
    .replaceAll("\u0672", "\u0670")
    .replaceAll("\u0649", "\u064A")
    .replaceAll("\u0673", "\u0670")
    .replaceAll("\u06E5", "\u0670")
    .replaceAll("\u06E6", "\u0670");
}
function normalize(s) {
  return canon(stripTags(s))
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u06E1-\u06E8]/g, "")
    .replace(/\u0640/g, "")
    .trim();
}
// space-preserving variant for per-word comparisons
function normalizeKeepSpaces(s) {
  const noTags = s
    .replace(/<span\s+class=end>.*?<\/span>/gs, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return canon(noTags)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u06E1-\u06E8]/g, "")
    .replace(/\u0640/g, "")
    .trim();
}
function codepoints(s) { return [...s].map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}(${c})`).join(" "); }

(async () => {
  console.log("=== 1. ENCODING ===");
  console.log(encFindings.length ? encFindings.join("\n") : "clean (no ZWJ/ZWNJ/bidi controls/tatweel/presentation forms)");
  console.log("raw file:", rawFindings.length ? rawFindings.join("; ") : "no BOM, no control bytes");

  console.log("\n=== 2. SEGMENTATION (local checks) ===");
  console.log(segFindings.length ? segFindings.join("\n") : "all 12 Arabic b segments are single orthographic words");

  console.log("\n=== 4. ALIGNMENT ===");
  console.log(alignFindings.length ? alignFindings.join("\n") : "banks, m-mappings and per-ayah segment counts consistent");
  console.log("Itani verbatim:", itaniFindings.length ? "\n" + itaniFindings.join("\n") : "every English tile occurs verbatim in its Itani note line");

  console.log("\n=== 5. VOCAB LINKAGE ===");
  console.log(vocabFindings.length ? vocabFindings.join("\n") : `all ${nas.vocabulary.length} cards appear in the surah text`);

  console.log("\n=== 8. NUMBERING ===");
  console.log(numFindings.length ? numFindings.join("\n") : "ayahs numbered 1-6 sequentially in both banks");

  console.log("\n=== 9. FALLBACK vs QURAN.COM API ===");
  const res = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=114");
  const json = await res.json();
  const apiVerses = json.verses;
  console.log(`API returned ${apiVerses.length} verses (HTTP ${res.status})`);
  let allMatch = true;
  nas.fillBlanks.ayahs.forEach((a, i) => {
    const local = a.segments.map(s => s.t ?? s.b ?? "").join("");
    const api = apiVerses[i].text_uthmani_tajweed;
    const nl = normalize(local), na = normalize(api);
    let same = nl === na;
    let note = "";
    if (!same && nl === na + ".") { same = true; note = " (local adds only a trailing period)"; }
    if (!same) allMatch = false;
    console.log(`ayah ${a.n}: ${same ? "MATCH" + note : "DIFF"}`);
    if (!same) {
      console.log("  local:", nl);
      console.log("  api  :", na);
      const maxLen = Math.max(nl.length, na.length);
      for (let p = 0; p < maxLen; p++) {
        if (nl[p] !== na[p]) {
          console.log(`  first diff @${p}: local ${nl[p] ? codepoints(nl[p]) : "EOL"} vs api ${na[p] ? codepoints(na[p]) : "EOL"}`);
          break;
        }
      }
    }
    // per-word segmentation cross-check: every b segment must equal a whole
    // word of the API text (after the same normalization)
    const apiWords = normalizeKeepSpaces(api).split(/\s+/);
    for (const seg of a.segments) {
      if (seg.b === undefined) continue;
      const w = normalizeKeepSpaces(seg.b);
      if (!apiWords.includes(w)) console.log(`  SEGMENT NOT A WHOLE API WORD: "${seg.b}" -> "${w}"`);
    }
    // report the raw orthographic variant characters actually present
    const variants = [...new Set(api.match(/[\u0671\u0672\u0649\u06E5\u06E6]/g) || [])];
    if (variants.length) console.log(`  api ortho variants seen: ${variants.map(v => `U+${v.codePointAt(0).toString(16).toUpperCase()}`).join(", ")}`);
  });
  console.log(allMatch ? "RESULT: fallback text matches the API word-for-word after orthographic normalization" : "RESULT: FALLBACK MISMATCH");

  // wavy-hamza U+0672 check (the sanitizer normalizes it away)
  const raw672 = apiVerses.map((v, i) => [i + 1, v.text_uthmani_tajweed]).filter(([, t]) => t.includes("\u0672"));
  console.log("API U+0672 (wavy hamza) occurrences:", raw672.length ? raw672.map(([n]) => `ayah ${n}`).join(", ") : "none");
  console.log("local U+0672 occurrences:", fullArabic.includes("\u0672") ? "PRESENT (would render wrong)" : "none");
  console.log("local U+0670 (dagger alif) occurrences:", (fullArabic.match(/\u0670/g) || []).length);
})().catch(e => { console.error("AUDIT ERROR:", e); process.exit(1); });
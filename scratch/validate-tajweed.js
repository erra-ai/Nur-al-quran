// READ-ONLY validator for the Tajweed conversion across every registered surah.
//   node scratch/validate-tajweed.js
// Checks: verse count/order, every API tajweed class has a CSS rule, sanitized
// text has no forbidden invisible characters, and the Uthmani fallback exists.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadLessonData } = require("../lesson-data-loader");

const ROOT = path.join(__dirname, "..");
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

// Parse the CSS to learn which tajweed classes are actually styled.
const css = fs.readFileSync(path.join(ROOT, "src", "styles", "interface.css"), "utf8");
const styledClasses = new Set();
for (const m of css.matchAll(/\.tajweed\.([a-z_]+)/g)) styledClasses.add(m[1]);
const hasMaddaSubstring = /\.tajweed\[class\*="madda"\]/.test(css);

function isStyled(cls) {
  if (styledClasses.has(cls)) return true;
  if (hasMaddaSubstring && cls.startsWith("madda")) return true;
  return false;
}

// Mirror the browser sanitizer's text-node cleaning exactly.
function cleanText(s) {
  return s
    .replaceAll("\u0672", "\u0670")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\u061C\uFEFF]/g, "");
}
function sanitizedText(raw) {
  return cleanText(raw.replace(/<span\s+class=end>[\s\S]*?<\/span>/gi, " ").replace(/<[^>]*>/g, ""));
}

// Load the generated fallback data.
const fbSrc = fs.readFileSync(path.join(ROOT, "src", "data", "quran-fallback.js"), "utf8");
const fbLiteral = fbSrc.slice(fbSrc.indexOf("{"), fbSrc.lastIndexOf("}") + 1);
const FALLBACK = vm.runInNewContext(`(${fbLiteral})`, Object.create(null));

const FORBIDDEN = /[\u200C\u200D\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\u061C\uFFFD\u0672]/;

(async () => {
  const { surahs } = loadLessonData();
  const sorted = [...surahs].sort((a, b) => a.number - b.number);
  let failures = 0;
  const missingClasses = new Map();

  for (const s of sorted) {
    const problems = [];
    const res = await fetch(`${API}/quran/verses/uthmani_tajweed?chapter_number=${s.number}&per_page=50&page=1`);
    const data = await res.json();
    const verses = Array.isArray(data.verses) ? data.verses : [];
    const canonical = AYAH_COUNTS[s.number - 1];

    if (verses.length !== canonical) problems.push(`verse count ${verses.length}!=${canonical}`);
    // order check
    for (let i = 0; i < verses.length; i++) {
      if (Number(String(verses[i].verse_key).split(":")[1]) !== i + 1) { problems.push(`order break @${i + 1}`); break; }
    }
    // classes
    const classes = new Set();
    for (const v of verses) for (const m of (v.text_uthmani_tajweed || "").matchAll(/<(?:tajweed|rule)\s+class=([a-zA-Z_]+)>/g)) classes.add(m[1]);
    for (const c of classes) {
      if (!isStyled(c)) { problems.push(`UNSTYLED class ${c}`); missingClasses.set(c, (missingClasses.get(c) || 0) + 1); }
    }
    // forbidden chars after sanitization
    for (let i = 0; i < verses.length; i++) {
      const t = sanitizedText(verses[i].text_uthmani_tajweed || "");
      if (FORBIDDEN.test(t)) { problems.push(`forbidden char in ayah ${i + 1}`); break; }
    }
    // fallback present + count matches + clean
    const fb = FALLBACK[s.number];
    if (!fb || !Array.isArray(fb.ayahs) || fb.ayahs.length !== canonical) problems.push("fallback missing/short");
    else {
      for (let i = 0; i < fb.ayahs.length; i++) {
        if (FORBIDDEN.test(fb.ayahs[i]) || /[A-Za-z]/.test(fb.ayahs[i])) { problems.push(`fallback ayah ${i + 1} dirty`); break; }
      }
    }
    // basmala rule
    const basmalaOk = s.number === 1 || s.number === 9 ? (fb?.basmala == null) : (typeof fb?.basmala === "string" && fb.basmala.length > 0);
    if (!basmalaOk) problems.push("basmala rule wrong");

    const tag = s.number === 114 ? " (ref)" : "";
    if (problems.length) { failures++; console.log(`FAIL ${String(s.number).padStart(3)} ${s.id.padEnd(11)}${tag}: ${problems.join("; ")}`); }
    else console.log(`PASS ${String(s.number).padStart(3)} ${s.id.padEnd(11)}${tag}: ${verses.length} verses, ${classes.size} tajweed classes, fallback ok, basmala ok`);
    await new Promise((r) => setTimeout(r, 80));
  }

  console.log(`\nStyled tajweed classes in CSS: ${[...styledClasses].sort().join(", ")}${hasMaddaSubstring ? " (+[class*=madda])" : ""}`);
  if (missingClasses.size) console.log(`\nUNSTYLED classes still seen: ${[...missingClasses.keys()].join(", ")}`);
  console.log(`\n${failures === 0 ? "ALL PASS" : failures + " surah(s) with problems"}`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("VALIDATOR ERROR:", e); process.exit(1); });
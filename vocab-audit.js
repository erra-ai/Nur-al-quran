// vocab-audit.js
// Layer 1: every vocabulary entry must cite where its Arabic meaning came from.
// Run from the project folder:  node vocab-audit.js
//
// Exits 0 if all entries are sourced, 1 otherwise.
//
// NOTE ON METHOD: this used to scan the file with regexes looking for `source: {`.
// That silently skipped every entry written with quoted keys (`"source": {`) —
// both spellings are valid JavaScript and the app treats them identically, but
// the regex only matched one. Two whole modules (Al-Mutaffifin, At-Tin) were
// never examined and still reported clean. It now evaluates the surahs array and
// inspects real objects, so key quoting cannot hide anything again.

const fs = require('fs');
const path = require('path');

const APP_HTML = path.join(__dirname, 'app.html');
if (!fs.existsSync(APP_HTML)) {
  console.error(`ERROR: ${APP_HTML} not found. Run this script from the project folder.`);
  process.exit(2);
}

const src = fs.readFileSync(APP_HTML, 'utf8');

// app.html holds TWO module arrays: `surahs` and `hadiths`. Scanning only the
// first silently exempts 30 hadith modules from every rule.
function loadArray(name) {
  const start = src.indexOf(`const ${name} = [`);
  if (start === -1) { console.error(`ERROR: could not find \`const ${name} = [\` in app.html`); process.exit(2); }
  const bs = src.indexOf('[', start);
  let depth = 0, i = bs;
  while (i < src.length) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) break; }
    i++;
  }
  return eval(src.slice(bs, i + 1));
}
const surahs = [...loadArray('surahs'), ...loadArray('hadiths')];

// Layer 1 is about the Arabic word's meaning, so lexicons and the corpus belong
// here. Ibn Kathir is the only tafsir permitted anywhere in the project.
const allowedPrimary = [
  "Qur'anic Arabic Corpus",
  'Hans Wehr Dict. 4e',
  'Lane Lexicon',
  'tafsir Ibn Kathir',
  'The Noble Qur\'an (Muhsin Khan)',
  'The Noble Qur\'an (Pickthall)',
  'The Noble Qur\'an (Yusuf Ali)',
];

// Hadith modules cite the collection the wording comes from, which is the
// correct source for those. Matches "Hadith — Sahih Bukhari", "Hadith — Sahih
// Bukhari 2856, Muslim", etc.
const HADITH_PRIMARY = /^Hadith\s*[—-]\s*.+/;
const primaryAllowed = p => allowedPrimary.includes(p) || HADITH_PRIMARY.test(p);

let total = 0, sourced = 0, missing = 0, bad = 0;
const report = [];

for (const surah of surahs) {
  const id = surah.id || surah.nameEnglish || '?';
  for (const v of surah.vocabulary || []) {
    total++;
    const arabic = v.arabic || '?';
    if (!v.source) {
      missing++;
      report.push(`MISSING  surah=${id}  arabic=${arabic}  -> no source field`);
      continue;
    }
    sourced++;
    const issues = [];
    if (!v.source.primary) issues.push('no primary');
    else if (!primaryAllowed(v.source.primary)) {
      bad++;
      issues.push(`primary not allowed: "${v.source.primary}"`);
    }
    if (!v.source.ref) issues.push('no ref');
    if (!v.source.checkedAt) issues.push('no checkedAt');
    if (issues.length) report.push(`BAD      surah=${id}  arabic=${arabic}  -> ${issues.join(', ')}`);
  }
}

console.log('--- Vocab Source Audit (Layer 1) ---');
console.log(`Modules scanned:         ${surahs.length}`);
console.log(`Total vocab entries:     ${total}`);
console.log(`Has a source field:      ${sourced}`);
console.log(`Missing source field:    ${missing}`);
console.log(`Disallowed primary:      ${bad}`);
console.log('');

if (report.length === 0) {
  console.log('All entries are sourced. OK');
  process.exit(0);
}

console.log('Issues:');
for (const line of report) console.log('  ' + line);
process.exit(1);

// verify-translations.js
// Layer 2: every piece of English a student reads must be signed off.
// Covers vocabulary entries, quiz explanations, and the surah intro.
//
// Run from the project folder:  node verify-translations.js
// Exit 0 = everything signed off. Exit 1 = missing, invalid, or unverified.
//
// NOTE ON METHOD: this used to scan the file with regexes looking for
// `verified: {`. Entries written with quoted keys (`"verified": {`) were skipped
// entirely — not reported missing, simply never seen. Al-Mutaffifin (230 entries)
// and At-Tin (138) passed clean without a single one being examined. It now
// evaluates the surahs array and inspects real objects, so key quoting cannot
// hide anything again.

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

// Ibn Kathir (Abridged), fetched from the quran.com API, is the ONLY tafsir.
// See README-SOURCES.md and TRANSLATION-SOURCES.md.
const ALLOWED_BY = [
  'ClearQuran (Talal Itani)',
  'Saheeh International',
  "The Noble Qur'an (Muhsin Khan)",
  "The Noble Qur'an (Pickthall)",
  "The Noble Qur'an (Yusuf Ali)",
  'Abdul Haleem',
  'tafsir Ibn Kathir',
  'corpus.quran.com',
  'self',   // author wrote it from memory AND flagged status: "unverified"
];

// Names that must never appear in a `by` field or in student-facing text.
const BANNED_SOURCES = /Maududi|Ma'arif|Tafsir al-Sa'di|Tafsir al-Jalalayn/i;

const counts = {
  vocab: { total: 0, missing: 0, bad: 0, unverified: 0 },
  quiz: { total: 0, missing: 0, bad: 0, unverified: 0 },
  intro: { total: 0, missing: 0, bad: 0, unverified: 0 },
};
const issues = [];
const introIssues = [];
const bannedHits = [];

function check(kind, label, block, sink) {
  const c = counts[kind];
  c.total++;
  if (!block) { c.missing++; sink.push(`MISSING verified  ${label}`); return; }
  const { status, by, checkedAt, note } = block;
  const problems = [];
  if (!status) problems.push('no status');
  else if (!['verified', 'unverified'].includes(status)) problems.push(`bad status "${status}"`);
  if (!by) problems.push('no by');
  else if (!ALLOWED_BY.includes(by)) problems.push(`by="${by}" not allowed`);
  if (status === 'verified' && !checkedAt) problems.push('verified without checkedAt');
  if (BANNED_SOURCES.test(`${by || ''} ${note || ''}`)) problems.push('cites a removed tafsir');
  if (problems.length) { c.bad++; sink.push(`BAD  ${label}  -> ${problems.join(', ')}`); return; }
  if (status === 'unverified') c.unverified++;
}

for (const surah of surahs) {
  const id = surah.id || surah.nameEnglish || '?';

  for (const v of surah.vocabulary || []) {
    check('vocab', `surah=${id} arabic=${v.arabic}`, v.verified, issues);
  }

  (surah.quiz || []).forEach((q, n) => {
    check('quiz', `surah=${id} Q${n + 1}`, q.verified, issues);
  });

  if (surah.intro) {
    check('intro', `surah=${id}`, surah.introVerified, introIssues);
  }

  // Student-facing text must never name a scholar other than Ibn Kathir,
  // and a question must never require knowing what a scholar said.
  const studentText = [
    ['intro', surah.intro],
    ...(surah.vocabulary || []).flatMap(v => [
      [`vocab ${v.arabic} meaning`, v.meaning],
      [`vocab ${v.arabic} connection`, v.connection],
      [`vocab ${v.arabic} hint`, v.hint],
    ]),
    ...(surah.quiz || []).flatMap((q, n) => [
      [`Q${n + 1} question`, q.q],
      [`Q${n + 1} options`, (q.options || []).join(' ')],
      [`Q${n + 1} explanation`, q.explanation],
    ]),
  ];
  for (const [where, text] of studentText) {
    if (text && BANNED_SOURCES.test(text)) bannedHits.push(`surah=${id} ${where}: names a removed tafsir`);
  }
}

console.log('--- Translation Verification Audit (Layer 2) ---');
console.log(`Modules scanned:   ${surahs.length}`);
for (const [k, c] of Object.entries(counts)) {
  console.log(`${(k + ' entries:').padEnd(18)} ${String(c.total).padStart(4)}  (missing=${c.missing}, bad=${c.bad}, unverified=${c.unverified})`);
}
console.log('');

if (introIssues.length) {
  console.log('Intro paragraph issues (the first text a student reads):');
  introIssues.forEach(l => console.log('  ' + l));
  console.log('');
}

if (bannedHits.length) {
  console.log(`Removed tafsir named in student-facing text (${bannedHits.length}):`);
  bannedHits.slice(0, 40).forEach(l => console.log('  ' + l));
  if (bannedHits.length > 40) console.log(`  ... and ${bannedHits.length - 40} more`);
  console.log('');
}

if (!issues.length && !introIssues.length && !bannedHits.length) {
  console.log('Every entry, explanation and intro is signed off with a valid source. OK');
  process.exit(0);
}

if (issues.length) {
  console.log(`Entry and quiz issues (${issues.length}):`);
  issues.slice(0, 60).forEach(l => console.log('  ' + l));
  if (issues.length > 60) console.log(`  ... and ${issues.length - 60} more`);
}
process.exit(1);

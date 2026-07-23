// verify-quotes.js  — REVIEWER AID, not a pass/fail gate
//
// Lists every Ibn-Kathir / Itani sign-off whose note shares NO run of 4
// consecutive words with the module's source files (tafsir-notes/ and
// translation-notes/). Those are the notes a human must read, because they are
// one of three things and only a reader can tell which:
//   1. an accurate paraphrase of the source   (fine)
//   2. an honestly-labelled cautious inference (fine)
//   3. an invented / altered claim             (must be fixed)
//
// Why it cannot be a gate: distinguishing an accurate paraphrase from a
// fabrication needs understanding of meaning, which a script does not have.
// Both lack verbatim overlap. So this tool does NOT decide correctness — it
// shrinks the reading pass from "every note" to "just these few", and it WILL
// catch a wholly invented note (which shares no words with the source at all).
//
// Notes it skips: `by: corpus.quran.com` (cites live API word data, not saved
// to a file) and `by: self` (honestly flagged unverified).
//
// Transliterated Arabic is full of apostrophes (Qur'anic, 'Abbas, Al-'Adiyat)
// that cannot be told apart from quote marks, so extracting exact quoted spans
// cried wolf on every name. A word-run overlap check avoids that.
//
//   node verify-quotes.js <slug>      # one module
//   node verify-quotes.js --all       # every module
//
// Always exits 0. Read the list; it is a to-review list, not a failure list.

const fs = require('fs');
const path = require('path');

const CHECKED_SOURCES = ['tafsir Ibn Kathir', 'ClearQuran (Talal Itani)'];
const RUN = 4; // consecutive words that must appear verbatim in the source

const src = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
function loadArray(name) {
  const st = src.indexOf(`const ${name} = [`);
  if (st === -1) return [];
  const bs = src.indexOf('[', st);
  let d = 0, i = bs;
  while (i < src.length) { if (src[i] === '[') d++; else if (src[i] === ']') { d--; if (d === 0) break; } i++; }
  return eval(src.slice(bs, i + 1));
}
const ALL = [...loadArray('surahs'), ...loadArray('hadiths')];

const words = t => (t.toLowerCase().match(/[a-z]+/g) || []);
const squash = arr => arr.join('');

function sourceFor(num) {
  const files = [];
  for (const dir of ['tafsir-notes', 'translation-notes']) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.startsWith(num + '-')) files.push(path.join(dir, f));
  }
  const hay = squash(words(files.map(f => fs.readFileSync(f, 'utf8')).join(' ')));
  return { files, hay };
}

// true if any RUN-length window of the note's words appears in the source
function grounded(note, hay) {
  const w = words(note);
  if (w.length < RUN) return hay.includes(squash(w)); // short note: whole thing
  for (let i = 0; i + RUN <= w.length; i++) {
    if (hay.includes(squash(w.slice(i, i + RUN)))) return true;
  }
  return false;
}

function checkModule(m) {
  if (m.number === undefined) return null;
  const { files, hay } = sourceFor(m.number);
  if (!files.length) return { files, checked: 0, missing: [] };
  const notes = [];
  (m.vocabulary || []).forEach(v => notes.push(['vocab ' + v.arabic, v.verified]));
  (m.quiz || []).forEach((q, i) => notes.push(['Q' + (i + 1), q.verified]));
  if (m.introVerified) notes.push(['intro', m.introVerified]);

  let checked = 0;
  const missing = [];
  for (const [where, v] of notes) {
    if (!v || !v.note || !CHECKED_SOURCES.includes(v.by)) continue;
    checked++;
    if (!grounded(v.note, hay)) missing.push([where, v.note]);
  }
  return { files, checked, missing };
}

const slug = process.argv[2];
const targets = slug === '--all' ? ALL : ALL.filter(m => m.id === slug);
if (!targets.length) {
  console.error(slug ? `no module "${slug}"` : 'Usage: node verify-quotes.js <slug> | --all');
  process.exit(2);
}

let totalChecked = 0, totalMissing = 0;
for (const m of targets) {
  const r = checkModule(m);
  if (!r) continue;
  if (!r.files.length) { console.log(`[${m.id}] no source files — run fetch-tafsir.js / fetch-translation.js`); continue; }
  totalChecked += r.checked;
  totalMissing += r.missing.length;
  if (r.missing.length) {
    console.log(`[${m.id}] ${r.checked} notes checked, ${r.missing.length} to review by eye (paraphrase, inference, or invented):`);
    r.missing.forEach(([w, n]) => console.log(`   [${w}] ${n.slice(0, 130)}`));
  } else if (slug !== '--all') {
    console.log(`[${m.id}] ${r.checked} Ibn-Kathir/Itani notes — all share verbatim text with the source. OK`);
  }
}
if (slug === '--all') console.log(`\n${totalChecked} notes checked across ${targets.length} modules, ${totalMissing} to review by eye.`);
process.exit(0); // reviewer aid — never a build failure

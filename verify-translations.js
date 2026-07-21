// verify-translations.js
// Enforces the Layer 2 (translation) rule: every vocab entry and every
// quiz/practice question explanation must have a `verified` field.
//
// Exit code 0 = all English-facing text is verified or marked unverified.
// Exit code 1 = missing field, or `unverified` entry the author declared
//                ready (status: "verified" without checkedAt is also
//                rejected).
//
// Run from the project folder:  node verify-translations.js

const fs = require('fs');
const path = require('path');

const APP_HTML = path.join(__dirname, 'app.html');
if (!fs.existsSync(APP_HTML)) {
  console.error(`ERROR: ${APP_HTML} not found. Run this script from the project folder.`);
  process.exit(2);
}

const src = fs.readFileSync(APP_HTML, 'utf8');

const ALLOWED_BY = [
  'The Clear Quran',
  'Saheeh International',
  'The Noble Qur\'an (Muhsin Khan)',
  'The Noble Qur\'an (Pickthall)',
  'The Noble Qur\'an (Yusuf Ali)',
  'Abdul Haleem',
  'tafsir Ibn Kathir',
  'Tafsir al-Sa\'di',
  'Tafsir al-Jalalayn',
  'corpus.quran.com',
  'multiple',
  'self'  // author wrote it from memory and flagged unverified
];

let totalVocab = 0, vocabMissing = 0, vocabBad = 0, vocabUnverified = 0;
let totalQuiz = 0, quizMissing = 0, quizBad = 0, quizUnverified = 0;
const issues = [];

// 1) Vocab entries — use brace-counting to isolate each surah's vocab block
function extractVocabBlock(surahId) {
  // Find the { before `id: "<surahId>",` and walk braces to find the closing } of the surah object.
  const idMatch = src.match(new RegExp('id:\\s*"' + surahId + '"\\s*,'));
  if (!idMatch) return null;
  let i = idMatch.index - 1;
  while (i >= 0 && src[i] !== '{') i--;
  if (i < 0) return null;
  let depth = 0;
  const start = i;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
    i++;
  }
  const obj = src.slice(start, i+1);
  // Find `vocabulary: [ ... ]` inside this object.
  // Allow comments between the closing `]` and `practice:`.
  const vMatch = obj.match(/vocabulary:\s*\[([\s\S]*?)\]\s*,[\s\S]*?practice:/);
  if (!vMatch) return null;
  return vMatch[1];
}

const idMatches = [...src.matchAll(/id:\s*"([^"]+)"/g)];
const SURAH_IDS = [...new Set(idMatches.map(m => m[1]))];
for (const surahId of SURAH_IDS) {
  const block = extractVocabBlock(surahId);
  if (block === null) { issues.push(`MISSING vocab block for surah=${surahId}`); continue; }
  // Each vocab entry is { arabic: ..., meaning: ..., ... source: {...}, ... }
  // Use brace-counting to capture the whole entry.
  const idx = 0;
  let pos = 0;
  while (true) {
    const startIdx = block.indexOf('{', pos);
    if (startIdx === -1) break;
    // Skip past { type: "..." (practice questions don't have arabic)
    const after = block.slice(startIdx, startIdx + 200);
    if (!/^\{\s*arabic:/.test(after)) {
      pos = startIdx + 1;
      continue;
    }
    // Find matching }
    let depth = 0, endIdx = -1;
    for (let j = startIdx; j < block.length; j++) {
      if (block[j] === '{') depth++;
      else if (block[j] === '}') { depth--; if (depth === 0) { endIdx = j; break; } }
    }
    if (endIdx === -1) break;
    const entryText = block.slice(startIdx, endIdx + 1);
    const arabicMatch = entryText.match(/arabic:\s*"([^"]+)"/);
    if (!arabicMatch) { pos = endIdx + 1; continue; }
    const arabic = arabicMatch[1];
    totalVocab++;
    const vMatch = entryText.match(/verified:\s*\{([\s\S]*?)\}\s*$/m);
    if (!vMatch) {
      // The verified field is the last field in the entry. Try a different anchor.
      const vMatch2 = entryText.match(/verified:\s*\{([\s\S]*)\}\s*$/);
      if (!vMatch2) {
        vocabMissing++;
        issues.push(`MISSING verified  surah=${surahId}  arabic=${arabic}`);
        pos = endIdx + 1;
        continue;
      }
      // use vMatch2
      const body = vMatch2[1];
      checkVocabVerified(surahId, arabic, body);
    } else {
      const body = vMatch[1];
      checkVocabVerified(surahId, arabic, body);
    }
    pos = endIdx + 1;
  }
}

function checkVocabVerified(surahId, arabic, body) {
  const status = (body.match(/status:\s*"([^"]+)"/) || [])[1];
  const by = (body.match(/by:\s*"([^"]+)"/) || [])[1];
  const checkedAt = (body.match(/checkedAt:\s*"([^"]+)"/) || [])[1];
  if (!status) { vocabBad++; issues.push(`BAD no status  surah=${surahId}  arabic=${arabic}`); return; }
  if (!['verified', 'unverified'].includes(status)) { vocabBad++; issues.push(`BAD bad status "${status}"  surah=${surahId}  arabic=${arabic}`); return; }
  if (!by) { vocabBad++; issues.push(`BAD no by  surah=${surahId}  arabic=${arabic}`); return; }
  if (!ALLOWED_BY.includes(by)) { vocabBad++; issues.push(`BAD by="${by}" not in allowed list  surah=${surahId}  arabic=${arabic}`); return; }
  if (status === 'verified' && !checkedAt) { vocabBad++; issues.push(`BAD status=verified but no checkedAt  surah=${surahId}  arabic=${arabic}`); return; }
  if (status === 'unverified') vocabUnverified++;
}

// 2) Quiz question explanations — walk every surah block with brace counting
function extractSurahObject(surahId) {
  const idMatch = src.match(new RegExp('id:\\s*"' + surahId + '"\\s*,'));
  if (!idMatch) return null;
  let i = idMatch.index - 1;
  while (i >= 0 && src[i] !== '{') i--;
  if (i < 0) return null;
  let depth = 0;
  const start = i;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
    i++;
  }
  return src.slice(start, i+1);
}

const qRe = /\{\s*category:\s*"(Vocabulary|Comprehension|Critical Thinking|Rhetoric)",\s*q:\s*"[^"]+",\s*options:\s*\[[^\]]+\],\s*answer:\s*\d,\s*explanation:\s*"[^"]+"/g;
for (const surahId of SURAH_IDS) {
  const obj = extractSurahObject(surahId);
  if (!obj) continue;
  qRe.lastIndex = 0;
  let qm;
  while ((qm = qRe.exec(obj))) {
    totalQuiz++;
    // Find the matching } of the quiz question (brace-counted)
    let depth = 0, endIdx = -1;
    for (let j = qm.index; j < obj.length; j++) {
      if (obj[j] === '{') depth++;
      else if (obj[j] === '}') { depth--; if (depth === 0) { endIdx = j; break; } }
    }
    if (endIdx === -1) { quizBad++; issues.push(`BAD no closing brace for quiz in ${surahId}`); continue; }
    const entry = obj.slice(qm.index, endIdx + 1);
    const vMatch = entry.match(/verified:\s*\{([\s\S]*)\}\s*$/);
    if (!vMatch) {
      quizMissing++;
      issues.push(`MISSING verified on quiz in ${surahId}: ${entry.slice(0, 60)}...`);
      continue;
    }
    const body = vMatch[1];
    const status = (body.match(/status:\s*"([^"]+)"/) || [])[1];
    const by = (body.match(/by:\s*"([^"]+)"/) || [])[1];
    const checkedAt = (body.match(/checkedAt:\s*"([^"]+)"/) || [])[1];
    if (!status) { quizBad++; issues.push(`BAD no status on quiz in ${surahId}`); continue; }
    if (!['verified', 'unverified'].includes(status)) { quizBad++; issues.push(`BAD bad status on quiz in ${surahId}`); continue; }
    if (!by) { quizBad++; issues.push(`BAD no by on quiz in ${surahId}`); continue; }
    if (!ALLOWED_BY.includes(by)) { quizBad++; issues.push(`BAD by="${by}" not allowed on quiz in ${surahId}`); continue; }
    if (status === 'verified' && !checkedAt) { quizBad++; issues.push(`BAD verified without checkedAt on quiz in ${surahId}`); continue; }
    if (status === 'unverified') quizUnverified++;
  }
}

console.log('--- Translation Verification Audit ---');
console.log(`Vocab entries:    ${totalVocab}  (missing=${vocabMissing}, bad=${vocabBad}, unverified=${vocabUnverified})`);
console.log(`Quiz explanations: ${totalQuiz}  (missing=${quizMissing}, bad=${quizBad}, unverified=${quizUnverified})`);
console.log('');

if (issues.length === 0) {
  console.log('All English-facing text has a `verified` field with valid status + by. ✓');
  if (vocabUnverified + quizUnverified > 0) {
    console.log(`\nNote: ${vocabUnverified + quizUnverified} entries are still flagged "unverified" — they were written from memory and need a reviewer to sign off.`);
  }
  process.exit(0);
}

console.log('Issues:');
for (const line of issues) console.log('  ' + line);
process.exit(1);

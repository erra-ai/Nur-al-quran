// redistribute-answers.js
// Spread a module's quiz answer indexes to ~8,8,7,7 without changing which
// option is correct. It rotates each question's four options and moves the
// `answer` index to match, so the correct answer TEXT is identical afterwards.
//
// Why this exists: when questions are drafted, the correct answer is usually
// written first (index 0). Left that way, every answer is option A. The app
// shuffles options at runtime so a student never sees the pattern, but the
// Main Quiz Contract still requires the source to be spread, and preflight.js
// flags it. Do NOT hand-move answers between options — that is how a correct
// answer gets detached from its explanation.
//
//   node redistribute-answers.js <slug>            # dry run, shows the result
//   node redistribute-answers.js <slug> --apply    # writes app.html

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'app.html');
const slug = process.argv[2];
const APPLY = process.argv.includes('--apply');
if (!slug || slug.startsWith('--')) {
  console.error('Usage: node redistribute-answers.js <slug> [--apply]');
  process.exit(2);
}

let src = fs.readFileSync(FILE, 'utf8');

// Modules may be written with quoted or unquoted keys (id: / "id":). Handle both.
function find(text, from, ...needles) {
  let best = -1;
  for (const n of needles) {
    const i = text.indexOf(n, from);
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  return best;
}

// locate the module object
const idAt = find(src, 0, `id: "${slug}"`, `"id": "${slug}"`);
if (idAt === -1) { console.error(`module id "${slug}" not found`); process.exit(1); }
let d = 0, mStart = src.lastIndexOf('{', idAt), mEnd = mStart;
for (; mEnd < src.length; mEnd++) {
  if (src[mEnd] === '{') d++;
  else if (src[mEnd] === '}') { d--; if (d === 0) break; }
}

// isolate the quiz array (not practice, which also has options+answer)
const quizKey = find(src, mStart, 'quiz:', '"quiz":');
if (quizKey === -1 || quizKey > mEnd) { console.error('quiz array not found'); process.exit(1); }
let qStart = src.indexOf('[', quizKey), b = 0, qEnd = qStart;
for (; qEnd < src.length; qEnd++) {
  if (src[qEnd] === '[') b++;
  else if (src[qEnd] === ']') { b--; if (b === 0) break; }
}

const before = src.slice(0, qStart);
const quizText = src.slice(qStart, qEnd + 1);
const after = src.slice(qEnd + 1);

// rewrite each question's options block, cycling target index 0,1,2,3,0,...
let n = 0;
// key names may be quoted or not: options: [ | "options": [ , and answer: | "answer":
const re = /(\n(\s*)"?options"?: \[\n)([\s\S]*?)(\n\s*\],\n\s*"?answer"?: )(\d)/g;
const rewritten = quizText.replace(re, (whole, head, indent, body, mid, ansStr) => {
  const opts = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
  if (opts.length !== 4) { console.error(`Q${n + 1}: ${opts.length} options, left unchanged`); n++; return whole; }
  const a = Number(ansStr);
  const t = n % 4;
  // new[i] = old[(i - t + a) mod 4]  =>  new[t] === old[a]
  const rotated = [0, 1, 2, 3].map(i => opts[(((i - t + a) % 4) + 4) % 4]);
  if (rotated[t] !== opts[a]) { console.error(`Q${n + 1}: rotation check failed`); process.exit(1); }
  n++;
  const optIndent = indent + '  ';
  const newBody = rotated.map(o => `${optIndent}"${o}"`).join(',\n');
  return `${head}${newBody}${mid}${t}`;
});

const newSrc = before + rewritten + after;

// verify: same questions, correct-answer TEXT unchanged, option sets identical
function quizOf(text) {
  const at = find(text, 0, `id: "${slug}"`, `"id": "${slug}"`);
  let dd = 0, s2 = text.lastIndexOf('{', at), e2 = s2;
  for (; e2 < text.length; e2++) { if (text[e2] === '{') dd++; else if (text[e2] === '}') { dd--; if (dd === 0) break; } }
  return eval('(' + text.slice(s2, e2 + 1) + ')').quiz;
}
const oldQuiz = quizOf(src), newQuiz = quizOf(newSrc);
let ok = oldQuiz.length === newQuiz.length;
oldQuiz.forEach((q, i) => {
  const a = newQuiz[i];
  if (q.options[q.answer] !== a.options[a.answer]) { console.error(`Q${i + 1} CORRECT ANSWER CHANGED`); ok = false; }
  if ([...q.options].sort().join('|') !== [...a.options].sort().join('|')) { console.error(`Q${i + 1} option set changed`); ok = false; }
  if (new Set(a.options).size !== 4) { console.error(`Q${i + 1} options not unique`); ok = false; }
});

const spread = [0, 0, 0, 0];
newQuiz.forEach(q => spread[q.answer]++);
console.log(`questions rewritten : ${n}`);
console.log(`new answer spread   : ${spread.join(',')}`);
console.log(ok ? 'VERIFY OK — every correct answer text preserved' : 'VERIFY FAILED — not written');
if (!ok) process.exit(1);

if (APPLY) { fs.writeFileSync(FILE, newSrc); console.log('written'); }
else console.log('(dry run — pass --apply to write)');

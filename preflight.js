// preflight.js
// Run before committing a new surah.
// Usage: node preflight.js
// Exit code 0 = no hard blockers, 1 = hard content blockers found.
// Set PREFLIGHT_STRICT_LENGTH=1 to make length-bias warnings fail.

const fs = require('fs');
const file = String.raw`C:\Users\Dell\Downloads\Quran and Hadith lesson\app.html`;
const src = fs.readFileSync(file, 'utf8');

const start = src.indexOf('const surahs = [');
const bs = src.indexOf('[', start);
let d = 0, i = bs;
while (i < src.length) {
  if (src[i] === '[') d++;
  else if (src[i] === ']') {
    d--;
    if (d === 0) break;
  }
  i++;
}
const arrText = src.slice(bs, i + 1);
const surahs = eval(arrText);

const strictLength = process.env.PREFLIGHT_STRICT_LENGTH === '1';
const bannedFillers = [
  /which misses the deeper connection the surah makes/i,
  /deeper connection the surah makes between creation and guidance/i
];

const hardIssues = [];
const lengthWarnings = [];

surahs.forEach(surah => {
  surah.quiz.forEach((q, qi) => {
    q.options.forEach((option, oi) => {
      if (bannedFillers.some(pattern => pattern.test(option))) {
        hardIssues.push(`  [${surah.nameEnglish}] Q${qi + 1} option ${oi + 1}: banned filler wording`);
      }
    });

    const lens = q.options.map(o => o.split(/\s+/).filter(Boolean).length);
    const correctLen = lens[q.answer];
    const maxOther = Math.max(...lens.filter((_, j) => j !== q.answer));
    if (correctLen - maxOther >= 2) {
      lengthWarnings.push(`  [${surah.nameEnglish}] Q${qi + 1} (${q.category}): correct=${correctLen}w, others max=${maxOther}w :: ${q.q}`);
    }
  });
});

if (hardIssues.length > 0) {
  console.log(`x PREFLIGHT FAILED: ${hardIssues.length} hard content blocker(s).`);
  hardIssues.forEach(issue => console.log(issue));
  process.exit(1);
}

if (strictLength && lengthWarnings.length > 0) {
  console.log(`x PREFLIGHT FAILED: ${lengthWarnings.length} questions with length bias >= 2 words.`);
  console.log('Fix before committing: rewrite weak distractors or shorten the correct answer.');
  lengthWarnings.forEach(issue => console.log(issue));
  process.exit(1);
}

if (lengthWarnings.length === 0) {
  console.log('OK PREFLIGHT PASSED: no hard blockers and 0 length-bias warnings.');
  process.exit(0);
}

console.log(`OK PREFLIGHT PASSED WITH WARNINGS: ${lengthWarnings.length} questions have length bias >= 2 words.`);
console.log('Review these when rewriting content, but do not pad options with generic filler.');
lengthWarnings.forEach(issue => console.log(issue));
process.exit(0);

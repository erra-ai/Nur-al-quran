// preflight.js
// Run before committing a new surah.
// Usage: node preflight.js
// Exit code 0 = no hard blockers, 1 = hard content blockers found.
// Set PREFLIGHT_STRICT_LENGTH=1   to make length-bias warnings fail.
// Set PREFLIGHT_STRICT_CONTRACT=1 to make Main Quiz Contract warnings fail.
//
// The contract checks below enforce "Main Quiz Contract" and "Anti-Guessing
// and No-Giveaway Rules" in model plan.md. Those rules were written down but
// nothing checked them, so modules drifted from them unnoticed.

const fs = require('fs');
const file = require('path').join(__dirname, 'app.html');
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
const strictContract = process.env.PREFLIGHT_STRICT_CONTRACT === '1';
const bannedFillers = [
  /which misses the deeper connection the surah makes/i,
  /deeper connection the surah makes between creation and guidance/i
];

// model plan.md -> Main Quiz Contract
const CATEGORY_MIX = { 'Vocabulary': 12, 'Comprehension': 7, 'Critical Thinking': 5, 'Rhetoric': 6 };
const QUIZ_TOTAL = 30;
const RHETORIC_COUNT = 6;
const MAX_SAME_CATEGORY_RUN = 4;
const RHETORIC_AREAS = ['Meaning Construction', 'Nazm', 'Style of Address'];

// model plan.md -> Chapter-Size Vocabulary Rule.
// Three separate counts are determined three different ways:
//   vocabulary -> from the number of ayahs, via this table
//   practice   -> exactly one per vocabulary card
//   quiz       -> always 30, whatever the surah's length
function vocabTarget(ayahs) {
  if (ayahs <= 4) return 10;
  if (ayahs <= 6) return 12;
  if (ayahs <= 11) return 14;
  return 16;                    // maximum, even for a long surah
}

const hardIssues = [];
const lengthWarnings = [];
const contractWarnings = [];

surahs.forEach(surah => {
  const name = surah.nameEnglish;
  const quiz = surah.quiz || [];

  quiz.forEach((q, qi) => {
    const tag = `  [${name}] Q${qi + 1}`;

    q.options.forEach((option, oi) => {
      if (bannedFillers.some(pattern => pattern.test(option))) {
        hardIssues.push(`${tag} option ${oi + 1}: banned filler wording`);
      }
      if (!String(option).trim()) {
        hardIssues.push(`${tag} option ${oi + 1}: empty option`);
      }
    });

    // Structural faults are always blockers — these are bugs, not style.
    if (q.options.length !== 4) {
      hardIssues.push(`${tag}: has ${q.options.length} options, contract requires exactly 4`);
    }
    if (new Set(q.options).size !== q.options.length) {
      hardIssues.push(`${tag}: duplicate option text`);
    }
    if (typeof q.answer !== 'number' || !q.options[q.answer]) {
      hardIssues.push(`${tag}: answer index ${q.answer} does not point at a valid option`);
    }

    const lens = q.options.map(o => o.split(/\s+/).filter(Boolean).length);
    const correctLen = lens[q.answer];
    const maxOther = Math.max(...lens.filter((_, j) => j !== q.answer));
    if (correctLen - maxOther >= 2) {
      lengthWarnings.push(`  [${name}] Q${qi + 1} (${q.category}): correct=${correctLen}w, others max=${maxOther}w :: ${q.q}`);
    }
  });

  // --- Main Quiz Contract, per surah ---
  const faults = [];

  // Count rules first — these decide the size of the whole module.
  const vocab = surah.vocabulary || [];
  const practice = surah.practice || [];
  const ayahs = surah.fillBlanks && surah.fillBlanks.ayahs ? surah.fillBlanks.ayahs.length : null;

  if (ayahs === null) {
    faults.push('no ayah data, cannot check vocabulary count against the chapter-size table');
  } else {
    const want = vocabTarget(ayahs);
    if (vocab.length !== want) {
      faults.push(`vocabulary ${vocab.length} (want ${want} for ${ayahs} ayahs)`);
    }
  }

  if (practice.length !== vocab.length) {
    faults.push(`practice ${practice.length} != vocabulary ${vocab.length} (one item per card)`);
  }

  if (quiz.length !== QUIZ_TOTAL) {
    faults.push(`${quiz.length} questions (want ${QUIZ_TOTAL})`);
  }

  const counts = {};
  quiz.forEach(q => counts[q.category] = (counts[q.category] || 0) + 1);
  const mixOff = Object.entries(CATEGORY_MIX)
    .filter(([cat, want]) => (counts[cat] || 0) !== want)
    .map(([cat, want]) => `${cat} ${counts[cat] || 0}/${want}`);
  if (mixOff.length) faults.push(`category mix: ${mixOff.join(', ')}`);

  const unknown = Object.keys(counts).filter(c => !(c in CATEGORY_MIX));
  if (unknown.length) faults.push(`unknown categories: ${unknown.join(', ')}`);

  // Source answer indexes should be spread ~8,8,7,7. The runtime shuffles
  // options, so this is an auditing rule, not a student-facing giveaway.
  const spread = [0, 0, 0, 0];
  quiz.forEach(q => { if (typeof q.answer === 'number' && spread[q.answer] !== undefined) spread[q.answer]++; });
  if (Math.max(...spread) - Math.min(...spread) > 2) {
    faults.push(`answer index spread ${spread.join(',')} (want ~8,8,7,7)`);
  }

  // Rhetoric: exactly 6, and the 30 mixed so no category clusters.
  // Source positions are deliberately NOT fixed — see model plan.md.
  const rPos = quiz.map((q, n) => q.category === 'Rhetoric' ? n + 1 : null).filter(Boolean);
  const mixing = [];

  if (rPos.some((p, n) => n > 0 && p - rPos[n - 1] === 1)) {
    mixing.push('two rhetoric questions adjacent');
  }

  let run = 1, worst = 1, worstCat = null;
  for (let n = 1; n < quiz.length; n++) {
    if (quiz[n].category === quiz[n - 1].category) {
      run++;
      if (run > worst) { worst = run; worstCat = quiz[n].category; }
    } else run = 1;
  }
  if (worst > MAX_SAME_CATEGORY_RUN) {
    mixing.push(`${worst} "${worstCat}" in a row (max ${MAX_SAME_CATEGORY_RUN})`);
  }

  if (rPos.length === RHETORIC_COUNT && quiz.length === QUIZ_TOTAL) {
    const half = QUIZ_TOTAL / 2;
    const firstHalf = rPos.filter(p => p <= half).length;
    if (firstHalf === 0 || firstHalf === RHETORIC_COUNT) {
      mixing.push('all rhetoric questions in one half');
    }
  }

  if (mixing.length) faults.push(`mixing: ${mixing.join(', ')}`);

  // --- Vocabulary coverage: every card gets tested ---
  // A student should be quizzed on each word they learned. There are 12
  // Vocabulary questions, so a short surah (12 cards) can cover them all, and a
  // long surah (14-16 cards) covers as many as there are questions. The rule:
  // the DISTINCT cards named across the vocab questions must reach that maximum.
  // Al-Falaq's original bug — two cards tested twice, two never — shows up here
  // as fewer distinct cards covered than there are questions.
  // (A single question may quote a phrase containing two cards, e.g.
  // "بِرَبِّ الْفَلَقِ"; that is fine — it still contributes to coverage.)
  const vocabQs = quiz.filter(q => q.category === 'Vocabulary');
  if (vocabQs.length && vocab.length) {
    const covered = new Set();
    vocabQs.forEach(q => vocab.forEach(v => { if (q.q.includes(v.arabic)) covered.add(v.arabic); }));
    const need = Math.min(vocab.length, vocabQs.length);
    if (covered.size < need) {
      const missing = vocab.map(v => v.arabic).filter(a => !covered.has(a));
      faults.push(`vocabulary coverage: ${covered.size} of ${need} cards tested; not tested: ${missing.join(', ')}`);
    }
  }

  // --- Meaning Blanks / Meaning Bank ---
  // model plan.md: fillBlanks.ayahs must contain EVERY ayah of the surah, in
  // order, because Order the Verses is generated from this array. Ayahs with
  // no vocabulary word still appear, as plain `t` segments.
  // The draggable banks must equal the vocabulary set exactly — no extras,
  // no omissions, no alternate spellings.
  const blankChecks = [
    ['fillBlanks', surah.fillBlanks, v => v.arabic, 'arabic'],
    ['fillBlanksEn', surah.fillBlanksEn, v => v.meaning, 'meaning'],
  ];
  for (const [name, section, pick, label] of blankChecks) {
    if (!section || !Array.isArray(section.ayahs)) {
      if (quiz.length) faults.push(`${name} missing`);
      continue;
    }
    const ns = section.ayahs.map(a => a.n);
    const ordered = ns.every((n, k) => k === 0 || n > ns[k - 1]);
    const contiguous = ns.length === Math.max(...ns) && Math.min(...ns) === 1;
    if (!ordered) faults.push(`${name} ayahs out of order`);
    if (!contiguous) {
      const gaps = [];
      for (let n = 1; n <= Math.max(...ns); n++) if (!ns.includes(n)) gaps.push(n);
      faults.push(`${name} missing ayah${gaps.length > 1 ? 's' : ''} ${gaps.join(', ')} (every ayah must be present — Order the Verses is built from this)`);
    }
    const bank = section.ayahs.flatMap(a => (a.segments || []).filter(s => s.b !== undefined).map(s => s.b));
    const want = vocab.map(pick);
    const sortJoin = a => [...a].sort().join('');
    if (sortJoin(bank) !== sortJoin(want)) {
      const extra = bank.filter(x => !want.includes(x));
      const absent = want.filter(x => !bank.includes(x));
      const bits = [];
      if (absent.length) bits.push(`${absent.length} vocabulary ${label}(s) never appear as a blank`);
      if (extra.length) bits.push(`${extra.length} blank(s) are not vocabulary ${label}s`);
      if (bank.length !== want.length) bits.push(`bank ${bank.length} vs vocabulary ${want.length}`);
      faults.push(`${name} bank != vocabulary[].${label}: ${bits.join('; ')}`);
    }
  }

  // Rhetoric areas: exactly two questions from each of the three areas.
  // The area lives in `rhetoricArea`, never in the question text — a student
  // must not read "(B - Nazm / Structure):".
  const rhetoric = quiz.filter(q => q.category === 'Rhetoric');
  if (rhetoric.length > 0) {
    const missing = rhetoric.filter(q => !q.rhetoricArea).length;
    if (missing) {
      faults.push(`${missing} rhetoric question(s) have no rhetoricArea field`);
    } else {
      const areas = {};
      rhetoric.forEach(q => areas[q.rhetoricArea] = (areas[q.rhetoricArea] || 0) + 1);
      const off = Object.entries(areas).filter(([, v]) => v !== 2);
      const unknownArea = Object.keys(areas).filter(a => !RHETORIC_AREAS.includes(a));
      if (Object.keys(areas).length !== RHETORIC_AREAS.length || off.length) {
        faults.push(`rhetoric areas ${JSON.stringify(areas)} (want 2 of each: ${RHETORIC_AREAS.join(', ')})`);
      }
      if (unknownArea.length) faults.push(`unknown rhetoricArea: ${unknownArea.join(', ')}`);
    }
  }

  // Authoring scaffolding must not reach the student. "(B - Nazm / Structure):"
  // means nothing to a 10-12 year old. See the reading-level rule in
  // README-SOURCES.md.
  const scaffolded = quiz.filter(q => /^\s*\(\s*B\s*-/.test(q.q)).length;
  if (scaffolded) faults.push(`${scaffolded} question(s) start with "(B - ...)" scaffolding`);

  if (faults.length) contractWarnings.push(`  [${name}] ${faults.join('; ')}`);
});

if (hardIssues.length > 0) {
  console.log(`x PREFLIGHT FAILED: ${hardIssues.length} hard content blocker(s).`);
  hardIssues.forEach(issue => console.log(issue));
  process.exit(1);
}

if (strictContract && contractWarnings.length > 0) {
  console.log(`x PREFLIGHT FAILED: ${contractWarnings.length} module(s) break the Main Quiz Contract.`);
  contractWarnings.forEach(issue => console.log(issue));
  process.exit(1);
}

if (strictLength && lengthWarnings.length > 0) {
  console.log(`x PREFLIGHT FAILED: ${lengthWarnings.length} questions with length bias >= 2 words.`);
  console.log('Fix before committing: rewrite weak distractors or shorten the correct answer.');
  lengthWarnings.forEach(issue => console.log(issue));
  process.exit(1);
}

if (contractWarnings.length > 0) {
  console.log(`Main Quiz Contract (model plan.md): ${contractWarnings.length} of ${surahs.length} modules do not conform.`);
  contractWarnings.forEach(issue => console.log(issue));
  console.log('');
}

if (lengthWarnings.length === 0 && contractWarnings.length === 0) {
  console.log('OK PREFLIGHT PASSED: no hard blockers, 0 length-bias warnings, contract clean.');
  process.exit(0);
}

console.log(`OK PREFLIGHT PASSED WITH WARNINGS: ${lengthWarnings.length} questions have length bias >= 2 words.`);
console.log('Review these when rewriting content, but do not pad options with generic filler.');
lengthWarnings.forEach(issue => console.log(issue));
process.exit(0);

// vocab-audit.js
// Enforces the source-citation rule on every vocab entry.
// Run from the project folder:  node vocab-audit.js
//
// Exits with code 0 if all entries are sourced, 1 otherwise.

const fs = require('fs');
const path = require('path');

const APP_HTML = path.join(__dirname, 'app.html');
if (!fs.existsSync(APP_HTML)) {
  console.error(`ERROR: ${APP_HTML} not found. Run this script from the project folder.`);
  process.exit(2);
}

const src = fs.readFileSync(APP_HTML, 'utf8');

// Extract every surah block
const surahRe = /\{\s*id:\s*"([^"]+)",[\s\S]*?vocabulary:\s*\[([\s\S]*?)\]\s*,\s*practice:/g;
const entryRe = /\{\s*arabic:\s*"([^"]+)",[\s\S]*?source:\s*\{([^}]+)\}\s*\}/g;
const entryNoSourceRe = /\{\s*arabic:\s*"([^"]+)",[\s\S]*?\}/g; // for the gap-finder

const allowedPrimary = [
  'Qur\'anic Arabic Corpus',
  'Hans Wehr Dict. 4e',
  'Lane Lexicon',
  'Tafsir al-Sa\'di',
  'Tafsir al-Jalalayn',
  'The Noble Qur\'an (Muhsin Khan)',
  'The Noble Qur\'an (Pickthall)',
  'The Noble Qur\'an (Yusuf Ali)',
  'multiple', // only when ref lists 2+ distinct authorities
];

let totalEntries = 0, sourced = 0, missing = 0, badPrimary = 0;
const report = [];

let m;
while ((m = surahRe.exec(src))) {
  const surahId = m[1];
  const block = m[2];

  // Find every entry in the vocab block
  const entryMatches = block.match(/\{\s*arabic:[^}]*?(?:,\s*source:\s*\{[^}]+\}\s*)?\}/g) || [];
  for (const entryText of entryMatches) {
    totalEntries++;
    const arabicMatch = entryText.match(/arabic:\s*"([^"]+)"/);
    const arabic = arabicMatch ? arabicMatch[1] : '?';
    const sourceMatch = entryText.match(/source:\s*\{([^}]+)\}/);

    if (!sourceMatch) {
      missing++;
      report.push(`MISSING  surah=${surahId}  arabic=${arabic}  -> no source field`);
      continue;
    }
    sourced++;

    const sourceBody = sourceMatch[1];
    const primaryMatch = sourceBody.match(/primary:\s*"([^"]+)"/);
    const refMatch = sourceBody.match(/ref:\s*"([^"]+)"/);
    const checkedAtMatch = sourceBody.match(/checkedAt:\s*"([^"]+)"/);

    const issues = [];
    if (!primaryMatch) issues.push('no primary');
    else if (!allowedPrimary.includes(primaryMatch[1])) badPrimary++, issues.push(`primary not in allowed list: "${primaryMatch[1]}"`);
    if (!refMatch) issues.push('no ref');
    if (!checkedAtMatch) issues.push('no checkedAt');

    if (issues.length) {
      report.push(`BAD      surah=${surahId}  arabic=${arabic}  -> ${issues.join(', ')}`);
    }
  }
}

console.log('--- Vocab Source Audit ---');
console.log(`Total vocab entries:     ${totalEntries}`);
console.log(`Sourced correctly:       ${sourced}`);
console.log(`Missing source field:    ${missing}`);
console.log(`Bad primary name:        ${badPrimary}`);
console.log('');

if (report.length === 0) {
  console.log('All entries are sourced. ✓');
  process.exit(0);
}

console.log('Issues:');
for (const line of report) console.log('  ' + line);
process.exit(1);

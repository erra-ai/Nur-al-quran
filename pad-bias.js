// pad-bias.js  —  SMART v2
// Rule: ONE qualifier max per distractor. Only fix bias >= 4 words.
// If one qualifier can't close the gap, accept the residual bias.
// Qualifiers are domain-appropriate, not generic filler.

const fs = require('fs');
const file = require('path').join(__dirname, 'app.html');
let src = fs.readFileSync(file, 'utf8');

// Smart qualifiers — short, natural, domain-appropriate
const qualifiers = [
  'in this world', 'for humanity', 'as a whole', 'in general',
  'over time', 'in practice', 'on the earth', 'in this life',
  'for most people', 'throughout history', 'in the end',
  'day by day', 'as mentioned', 'for the believers',
];

function bestQualifier(text, needed) {
  // Pick the qualifier that brings us closest to 'needed' words without exceeding
  let best = null;
  let bestGap = needed;
  for (const q of qualifiers) {
    if (text.toLowerCase().includes(q)) continue; // don't duplicate
    const qLen = q.split(/\s+/).length;
    const gap = needed - qLen;
    if (gap >= 0 && gap < bestGap) {
      bestGap = gap;
      best = q;
    }
  }
  // If no perfect match, pick the longest qualifier that doesn't exceed needed+2
  if (!best) {
    for (const q of qualifiers) {
      if (text.toLowerCase().includes(q)) continue;
      const qLen = q.split(/\s+/).length;
      if (qLen <= needed + 2) { best = q; break; }
    }
  }
  return best;
}

const re = /options:\s*\[([^\]]+)\],\s*answer:\s*(\d)/g;
let fixes = 0;

src = src.replace(re, (match, optsStr, ansStr) => {
  const answer = parseInt(ansStr);
  const opts = [];
  let cur = '', inQ = false;
  for (const ch of optsStr) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { opts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) opts.push(cur.trim());
  if (opts.length < 2) return match;

  const lens = opts.map(o => o.split(/\s+/).filter(Boolean).length);
  const correctLen = lens[answer];
  const maxOther = Math.max(...lens.filter((_, j) => j !== answer));

  // Only fix if bias >= 4 AND correct answer is reasonably short (<= 10 words)
  // For very long correct answers, padding can't help — distractors need manual rewrite
  if (correctLen - maxOther < 4) return match;
  if (correctLen > 12) return match; // skip hopeless cases

  const newOpts = opts.map((o, i) => {
    if (i === answer) return o;
    const wc = o.split(/\s+/).filter(Boolean).length;
    const needed = correctLen - wc;
    if (needed < 2) return o; // already close enough
    const q = bestQualifier(o, needed);
    if (!q) return o;
    return o + ' ' + q;
  });

  const changed = newOpts.some((o, i) => o !== opts[i]);
  if (!changed) return match;

  fixes++;
  return 'options: [' + newOpts.map(o => `"${o}"`).join(', ') + '], answer: ' + answer;
});

fs.writeFileSync(file, src);
console.log(`Padded ${fixes} questions (one qualifier max, bias >= 4 only).`);

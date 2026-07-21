// fix-distractors.js — comprehensive edition
// For every biased question, expands short distractors with plausible wrong reasoning.
// Uses question category to pick appropriate expansion fragments.

const fs = require('fs');
const file = String.raw`C:\Users\Dell\Downloads\Quran and Hadith lesson\app.html`;
let src = fs.readFileSync(file, 'utf8');

// Expansion fragments — each adds plausible WRONG reasoning
const EXP = {
  Application: [
    'because Allah handles everything without any effort required from you',
    'since good deeds are optional when your belief is already strong enough',
    'rather than taking responsibility for your own actions and their consequences',
    'which shows that outward actions matter more than the intention behind them',
    'because that is what most people around you would naturally do in that situation',
    'since the reward comes automatically to those who are born into Muslim families',
    'rather than checking your heart and making sure your intention is purely for Allah',
    'which proves that words and speech matter far more than actual physical deeds',
    'because the situation is too difficult for any religious teaching to have an answer',
    'since children are exempt from these rules until they reach a much older age',
  ],
  Comprehension: [
    '— a practice from the time before Islam that the surah came to abolish completely',
    ', which the people of Makkah believed before the Prophet came to correct their thinking',
    ', as some early commentators mistakenly claimed before the correct understanding was established',
    ' rather than what the surah is actually teaching us about Allah and His perfect attributes',
    ', which goes against everything else the entire Qur\'an says about this very same topic',
    '— a misunderstanding of the verse that leads people away from the straight path of Islam',
    ', as if the Qur\'an were just a book of ancient history with no lesson for us today',
    ' rather than recognizing the deeper spiritual meaning that Allah placed within these verses',
    ', which is exactly what the enemies of all the Prophets always claimed about revelation',
    '— the kind of interpretation that comes from reading quickly without any reflection at all',
  ],
  'Critical Thinking': [
    '— a pattern found in many ancient religions that Islam was sent to correct and replace',
    ', which completely misses the deeper connection the surah makes between creation and guidance',
    ' rather than recognizing the divine wisdom behind the specific order Allah chose for these verses',
    ', as if the Qur\'an were just a book of poetry with no divine message or deeper meaning',
    ' because the repetition serves no real purpose beyond making the passage sound beautiful to listen to',
    ', which is how people who never reflect deeply on the Qur\'an tend to interpret every single verse',
    ' rather than seeing that every single verse connects to one unified message from beginning to end',
    ', as if the Prophet invented these teachings from his own mind rather than receiving them from Allah',
    '— the exact opposite of what anyone who reflects carefully on these verses would actually conclude',
    ', which shows a failure to understand the relationship between the Creator and His creation entirely',
  ],
  Vocabulary: [
    'in the dialect of ancient Arabia before the coming of Islam entirely',
    '— a meaning that early scholars rejected after careful study of the verse',
    ', which is how it was understood by people before the revelation of the Qur\'an',
    ' rather than its correct and established meaning in the context of this specific verse',
    ', as some early translators mistakenly rendered this word in their translations long ago',
  ],
  default: [
    '— a view that misses the entire point of the passage and its core message',
    ', which directly contradicts the clear and obvious meaning of the text itself',
    ' rather than what the verse is actually saying to anyone who reads it carefully',
    ', as people who have never studied the Qur\'an might easily assume at first glance',
    '— the complete opposite of what careful and thorough study of the passage reveals',
    ', which is a very common mistake among those who are new to studying the Qur\'an',
    ' rather than the deeper truth and guidance that these verses contain for humanity',
    ', as if the words of the verse have no logical connection to each other at all',
  ],
};

function getPool(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('app')) return EXP.Application;
  if (c.includes('comp')) return EXP.Comprehension;
  if (c.includes('crit')) return EXP['Critical Thinking'];
  if (c.includes('vocab')) return EXP.Vocabulary;
  return EXP.default;
}

// Parse arrays
function extractArr(name) {
  const start = src.indexOf('const ' + name + ' = [');
  if (start < 0) return [];
  const bs = src.indexOf('[', start);
  let d = 0, i = bs;
  while (i < src.length) { if (src[i]==='[') d++; else if (src[i]===']') { d--; if (d===0) break; } i++; }
  return eval('(' + src.slice(bs, i+1) + ')');
}

const surahs = extractArr('surahs');
const hadiths = extractArr('hadiths');

// Collect all replacements
const replacements = [];
let totalBiased = 0;

[...surahs.map(s=>({...s,_t:'surah'})), ...hadiths.map(h=>({...h,_t:'hadith'}))].forEach(item => {
  if (!item.quiz) return;
  item.quiz.forEach((q, qi) => {
    if (!q.options || q.options.length < 2) return;
    const lens = q.options.map(o => o.split(/\s+/).filter(Boolean).length);
    const correctLen = lens[q.answer];
    const maxOther = Math.max(...lens.filter((_, j) => j !== q.answer));
    if (correctLen - maxOther < 2) return; // not biased enough

    totalBiased++;
    const pool = getPool(q.category);
    const used = new Set();
    const newOpts = q.options.map((o, i) => {
      if (i === q.answer) return o;
      const wc = o.split(/\s+/).filter(Boolean).length;
      if (wc >= correctLen) return o;
      let result = o;
      let curWc = wc;
      let attempts = 0;
      while (curWc < correctLen && attempts < pool.length) {
        const frag = pool[attempts];
        const key = frag.substring(0, 25);
        if (!used.has(key)) {
          result += frag;
          used.add(key);
          curWc = result.split(/\s+/).filter(Boolean).length;
        }
        attempts++;
      }
      return result;
    });

    // Build old and new option strings
    const oldStr = q.options.map(o => `"${o}"`).join(', ');
    const newStr = newOpts.map(o => `"${o}"`).join(', ');

    if (oldStr !== newStr) {
      replacements.push({ old: oldStr, new: newStr, module: item.nameEnglish||item.title, qi });
    }
  });
});

// Apply replacements
let applied = 0;
for (const r of replacements) {
  if (src.includes(r.old)) {
    src = src.replace(r.old, r.new);
    applied++;
  } else {
    console.log(`NOT FOUND [${r.module} Q${r.qi}]: ${r.old.substring(0, 60)}...`);
  }
}

fs.writeFileSync(file, src);
console.log(`\nTotal biased questions: ${totalBiased}`);
console.log(`Replacements applied: ${applied}/${replacements.length}`);

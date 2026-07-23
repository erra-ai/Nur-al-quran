// fetch-translation.js
// Pulls the teen-level English rendering of one surah from quranfor.com
// (Talal Itani's ClearQuran project, adapted for teens) and writes it to
// translation-notes/<number>-<slug>-itani-teens.md
//
// This is the wording reference for `verified: { by: "ClearQuran (Talal Itani)" }`.
// Same idea as fetch-tafsir.js: a sign-off should quote a line from a local
// file, so anyone can check it later.
//
//   node fetch-translation.js 112 ikhlas
//   node fetch-translation.js --all          # every surah the app teaches
//
// Only the surahs present in app.html are fetched. Do not mirror the whole
// Qur'an — the project has no use for it.

const fs = require('fs');
const path = require('path');
const https = require('https');

const LEVEL = 'teens';
const BASE = `https://www.quranfor.com/${LEVEL}`;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'quran-lesson-app/1.0 (local study reference)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(new URL(res.headers.location, url).href));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', c => raw += c);
      res.on('end', () => resolve(raw));
    }).on('error', reject);
  });
}

const decode = s => s
  .replace(/<!--\s*-->/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&#x27;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(c))
  .replace(/\s+/g, ' ')
  .trim();

// Verses render as: <p ... id="verseN"><span ...>N. </span>text</p>
function parseVerses(html) {
  const out = [];
  const re = /id="verse(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html))) {
    const n = Number(m[1]);
    let text = decode(m[2]);
    text = text.replace(new RegExp(`^${n}\\s*\\.\\s*`), '').trim();
    if (text) out.push({ n, text });
  }
  return out;
}

function appSurahs() {
  const src = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
  const st = src.indexOf('const surahs = [');
  const bs = src.indexOf('[', st);
  let d = 0, i = bs;
  while (i < src.length) {
    if (src[i] === '[') d++;
    else if (src[i] === ']') { d--; if (d === 0) break; }
    i++;
  }
  return eval(src.slice(bs, i + 1))
    .map(m => ({ number: m.number, slug: m.id, name: m.nameEnglish }))
    .filter(m => m.number)
    .sort((a, b) => a.number - b.number);
}

async function fetchOne({ number, slug, name }) {
  const url = `${BASE}/${number}`;
  const html = await get(url);
  const verses = parseVerses(html);
  if (!verses.length) throw new Error(`no verses parsed from ${url} — page structure may have changed`);

  const outDir = path.join(__dirname, 'translation-notes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `${number}-${slug}-itani-teens.md`);

  const header = `# ClearQuran (Talal Itani) — teen level — Surah ${number}${name ? `, ${name}` : ''}

Source: ${url}
Retrieved: ${new Date().toISOString().slice(0, 10)}
Verses: ${verses.length}

Teen-level rendering from Talal Itani's ClearQuran project. This is the
wording reference for \`verified: { by: "ClearQuran (Talal Itani)" }\` in this
module. Quote the line you relied on in the note.

Regenerate with:

    node fetch-translation.js ${number} ${slug}

---

`;
  const body = verses.map(v => `${v.n}. ${v.text}`).join('\n\n');
  fs.writeFileSync(outFile, header + body + '\n');
  return { outFile, count: verses.length };
}

(async () => {
  const args = process.argv.slice(2);
  let targets;

  if (args[0] === '--all') {
    targets = appSurahs();
    console.log(`Fetching ${targets.length} surahs used by the app.\n`);
  } else if (args.length >= 2) {
    targets = [{ number: Number(args[0]), slug: args[1] }];
  } else {
    console.error('Usage: node fetch-translation.js <surah-number> <slug>');
    console.error('       node fetch-translation.js --all');
    process.exit(2);
  }

  let ok = 0;
  const failed = [];
  for (const t of targets) {
    try {
      const r = await fetchOne(t);
      ok++;
      console.log(`  ${String(t.number).padStart(3)}  ${t.slug.padEnd(12)} ${String(r.count).padStart(3)} verses`);
    } catch (e) {
      failed.push(t.slug);
      console.error(`  ${String(t.number).padStart(3)}  ${t.slug.padEnd(12)} FAILED: ${e.message}`);
    }
    if (targets.length > 1) await new Promise(r => setTimeout(r, 400)); // be a polite client
  }
  console.log(`\n${ok}/${targets.length} written to translation-notes/`);
  if (failed.length) { console.error(`failed: ${failed.join(', ')}`); process.exit(1); }
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });

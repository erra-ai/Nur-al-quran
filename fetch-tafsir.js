// fetch-tafsir.js
// Pulls the Ibn Kathir (Abridged) English tafsir for a surah from the
// quran.com API and writes it to tafsir-notes/<number>-<slug>-ibn-kathir.md
//
// This is the source of truth for every `verified: { by: "tafsir Ibn Kathir" }`
// sign-off. Scraping tafsir pages through a summariser gives paraphrases, not
// the text — always use this.
//
//   node fetch-tafsir.js 100 adiyat
//   node fetch-tafsir.js 83 mutaffifin

const fs = require('fs');
const path = require('path');
const https = require('https');

const TAFSIR_ID = 169;  // Ibn Kathir (Abridged), english — /api/v4/resources/tafsirs

const [, , surahNum, slug] = process.argv;
if (!surahNum || !slug) {
  console.error('Usage: node fetch-tafsir.js <surah-number> <slug>');
  console.error('   eg: node fetch-tafsir.js 100 adiyat');
  process.exit(2);
}

const clean = html => html
  .replace(/<\/(p|div|h[1-6])>/gi, '\n\n')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, res => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('response was not JSON — the endpoint may have changed')); }
      });
    }).on('error', reject);
  });
}

// A long surah's tafsir is split into several passages. The API's `verses`
// field is NOT reliable for finding the boundaries — asking for 78:11 returns
// the text of a later passage while still reporting verses 78:1-78:10. So walk
// every ayah and de-duplicate on the text itself. Fetching ayah 1 only would
// silently give you a fraction of the tafsir.
(async () => {
  const chapter = await getJson(`https://api.quran.com/api/v4/chapters/${surahNum}`);
  const total = chapter.chapter && chapter.chapter.verses_count;
  if (!total) { console.error('Could not read verses_count for this surah.'); process.exit(1); }

  const sections = [];      // { text, ayahs: [] }
  const byText = new Map();

  for (let ayah = 1; ayah <= total; ayah++) {
    const url = `https://api.quran.com/api/v4/tafsirs/${TAFSIR_ID}/by_ayah/${surahNum}:${ayah}`;
    const t = (await getJson(url)).tafsir;
    if (!t || !t.text) { console.error(`no tafsir text for ${surahNum}:${ayah}`); continue; }
    const text = clean(t.text);
    if (!byText.has(text)) {
      const section = { text, ayahs: [] };
      byText.set(text, section);
      sections.push(section);
    }
    byText.get(text).ayahs.push(ayah);
  }

  const covered = sections.reduce((n, s) => n + s.ayahs.length, 0);
  const outDir = path.join(__dirname, 'tafsir-notes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const outFile = path.join(outDir, `${surahNum}-${slug}-ibn-kathir.md`);

  const body = sections
    .map(s => `<!-- passage returned for ayah${s.ayahs.length > 1 ? 's' : ''} ${s.ayahs.join(', ')} -->\n\n${s.text}`)
    .join('\n\n---\n\n');

  const header = `# Tafsir Ibn Kathir (Abridged) — Surah ${surahNum}

Source: quran.com API, tafsir resource ${TAFSIR_ID} ("Ibn Kathir (Abridged)").
Retrieved: ${new Date().toISOString().slice(0, 10)}
Surah length: ${total} ayahs — all ${covered} looked up, returning ${sections.length} distinct passage(s).

This is the text every \`verified: { by: "tafsir Ibn Kathir" }\` tag in this
module must be traceable to. Regenerate with:

    node fetch-tafsir.js ${surahNum} ${slug}

---

`;

  fs.writeFileSync(outFile, header + body + '\n');
  console.log(`Wrote ${outFile}`);
  console.log(`  ${total} ayahs looked up -> ${sections.length} distinct passage(s), ${header.length + body.length} chars`);
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });

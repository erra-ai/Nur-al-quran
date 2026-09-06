// Shared Quran.com API client for the Mushaf-style display. One generalised
// entry point for every surah; nothing in this file is chapter-specific.

const QURAN_COM_API = "https://api.quran.com/api/v4";

// ---------------------------------------------------------------------------
// Sanitisation. Quran.com returns custom <tajweed>/<rule> elements and ayah
// `<span class=end>` markers. Convert only the known formatting tags and plain
// text; discard every other tag and attribute. Remote HTML is never inserted
// unsanitised.
// ---------------------------------------------------------------------------

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Invisible joiners and bidi controls that Quran.com embeds around the Uthmani
// pause marks. They are not part of the recitation and render inconsistently,
// so they are removed. Legitimate Uthmani annotation marks (U+06D6-U+06ED),
// harakat, and the tatweel elongation (U+0640) are preserved.
function stripInvisibleControls(text) {
  return text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\u061C\uFEFF]/g, "");
}

function sanitizeTajweedHtml(rawHtml, { includeAyahEnd = true } = {}) {
  const parsed = new DOMParser().parseFromString(`<div>${rawHtml || ""}</div>`, "text/html");
  const root = parsed.body.firstElementChild;

  function renderNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // The Tajweed endpoint currently uses U+0672 (alef with wavy hamza)
      // as a carrier for a normal madd in words such as الصراط. That glyph
      // renders as an incorrect full-height alef in ordinary Unicode Quran
      // fonts. Quran.com's Uthmani text represents the same position with
      // U+0670, the superscript/dagger alef used in the Madani Mushaf.
      const uthmaniText = stripInvisibleControls(
        (node.nodeValue || "").replaceAll("\u0672", "\u0670"),
      );
      return escapeHtml(uthmaniText);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(renderNode).join("");
    if (tag === "tajweed" || tag === "rule") {
      const rule = (node.getAttribute("class") || "").replace(/[^a-z0-9_-]/gi, "");
      return rule ? `<span class="tajweed ${rule}">${children}</span>` : children;
    }
    if (tag === "span" && node.classList.contains("end")) {
      return includeAyahEnd ? `<span class="ayah-end">${children}</span>` : "";
    }
    return children;
  }

  return Array.from(root?.childNodes || []).map(renderNode).join("");
}

// ---------------------------------------------------------------------------
// Fetching with an in-memory cache. Only the surah currently being viewed is
// fetched; successful responses are cached so revisits reuse them.
// ---------------------------------------------------------------------------

const chapterCache = new Map();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status >= 500 && attempt < attempts) {
          await delay(600 * (attempt + 1));
          continue;
        }
        throw new Error(`Quran.com request failed (${response.status}) for ${url}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(600 * (attempt + 1));
    }
  }
  throw lastError;
}

async function fetchChapterInfo(chapter) {
  const response = await fetchWithRetry(`${QURAN_COM_API}/chapters/${chapter}`);
  const data = await response.json();
  return data.chapter || {};
}

// The uthmani_tajweed endpoint serves whole chapters for the lesson set, but
// the pagination contract is honoured in case the API starts paging longer
// surahs. Verses are deduplicated by verse_key.
async function fetchTajweedVerses(chapter) {
  const collected = new Map();
  let page = 1;
  while (true) {
    const response = await fetchWithRetry(
      `${QURAN_COM_API}/quran/verses/uthmani_tajweed?chapter_number=${chapter}&per_page=50&page=${page}`,
    );
    const data = await response.json();
    const verses = Array.isArray(data.verses) ? data.verses : [];
    verses.forEach((verse) => collected.set(verse.verse_key, verse));
    const pagination = data.pagination || {};
    const nextPage = Number(pagination.next_page || 0);
    const totalPages = Number(pagination.total_pages || 0);
    if (verses.length === 0) break;
    if (nextPage > page) { page = nextPage; continue; }
    if (totalPages > page) { page += 1; continue; }
    break;
  }
  return Array.from(collected.values());
}

let basmalaRequest;
function fetchTajweedBasmala() {
  if (basmalaRequest) return basmalaRequest;
  basmalaRequest = fetchWithRetry(`${QURAN_COM_API}/quran/verses/uthmani_tajweed?verse_key=1:1`)
    .then((response) => response.json())
    .then((data) => data.verses?.[0]?.text_uthmani_tajweed ?? "");
  return basmalaRequest;
}

async function fetchSurahFromQuranCom(chapterNumber) {
  const chapter = Number(chapterNumber);
  if (chapterCache.has(chapter)) return chapterCache.get(chapter);

  const request = (async () => {
    const [chapterInfo, basmalaRaw, verses] = await Promise.all([
      fetchChapterInfo(chapter),
      chapter === 9 ? null : fetchTajweedBasmala(), // At-Tawbah has no basmala
      fetchTajweedVerses(chapter),
    ]);

    const pages = (Array.isArray(chapterInfo.pages) ? chapterInfo.pages : [])
      .map(Number)
      .filter((n) => Number.isFinite(n));
    const uniquePages = [...new Set(pages)];
    const pageLabel = uniquePages.length
      ? (uniquePages.length === 1 ? String(uniquePages[0]) : `${uniquePages[0]}\u2013${uniquePages[uniquePages.length - 1]}`)
      : String(chapter);

    return {
      chapterNumber: chapter,
      verseCount: verses.length,
      basmalaHtml: basmalaRaw
        ? sanitizeTajweedHtml(basmalaRaw, { includeAyahEnd: false })
        : null,
      pageLabel,
      verses: verses.map((verse) => ({
        key: verse.verse_key,
        html: sanitizeTajweedHtml(verse.text_uthmani_tajweed),
      })),
    };
  })().catch((error) => {
    // Failed requests are not cached: a later visit may retry.
    chapterCache.delete(chapter);
    throw error;
  });

  chapterCache.set(chapter, request);
  return request;
}

export { fetchSurahFromQuranCom };

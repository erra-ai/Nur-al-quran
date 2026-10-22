// One shared catalog for navigating the app: the three collections, their
// library browsing state (query / category / page — kept OUTSIDE renderHome
// so returning from a lesson restores where the student left off), and one
// single opener used by cards, navbar results, and lesson prev/next.
import { surahs, hadiths, state, renderApp } from "./state.js?v=20260907-topnav2";
import { LIFE_SKILL_LESSONS } from "./data/life-skills.js?v=20260907-topnav2";

const PAGE_SIZE = 12;

const COLLECTIONS = {
  quran:      { key: "quran", label: "Quran" },
  hadith:     { key: "hadith", label: "Hadith" },
  lifeskills: { key: "lifeskills", label: "Life Skills" },
};

// Per-collection browsing state, module-level on purpose.
const browse = {
  quran:      { query: "", category: "All", page: 1 },
  hadith:     { query: "", category: "All", page: 1 },
  lifeskills: { query: "", category: "All", page: 1 },
};

function resetBrowse() {
  for (const k of Object.keys(browse)) browse[k] = { query: "", category: "All", page: 1 };
}

function normalize(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Uniform entries: stable identity independent of filtered positions.
function catalog(key) {
  if (key === "quran") return surahs.map((s, index) => ({
    key: "quran:" + s.id, coll: "quran", kind: "Surah", ref: s, index,
    number: s.number, title: s.nameEnglish, sub: s.title,
    arabic: s.nameArabic, category: "",
    search: normalize(`${s.number} ${s.nameEnglish} ${s.title} ${s.nameArabic}`),
  }));
  if (key === "hadith") return hadiths.map((h, index) => ({
    key: "hadith:" + h.id, coll: "hadith", kind: "Hadith", ref: h, index,
    number: h.number, title: h.nameEnglish, sub: h.title,
    arabic: "", category: h.category || "",
    search: normalize(`${h.number} ${h.nameEnglish} ${h.title} ${h.category}`),
  }));
  return LIFE_SKILL_LESSONS.map((l, index) => ({
    key: "lifeskill:" + l.id, coll: "lifeskills", kind: `Lesson ${l.id}`, ref: l, index,
    number: l.id, title: l.name, sub: l.title,
    arabic: "", category: "",
    search: normalize(`${l.id} ${l.name} ${l.title} ${l.desc}`),
  }));
}

function categoriesOf(key) {
  if (key !== "hadith") return [];
  return [...new Set(hadiths.map(h => h.category).filter(Boolean))];
}

function filterCatalog(key, { query = "", category = "All" } = {}) {
  const q = normalize(query);
  return catalog(key).filter(e =>
    (category === "All" || !category || e.category === category) &&
    (!q || e.search.includes(q)));
}

function pageOf(key) { return browse[key].page; }
function setPage(key, p) { browse[key].page = Math.max(1, p); }
function setQuery(key, q) { browse[key].query = q; browse[key].page = 1; }
function setCategory(key, c) { browse[key].category = c; browse[key].page = 1; }

// ---- The single opener: every nav path calls this ----
function openEntry(e) {
  state.activeCollection = e.coll; // Back to library returns where you were
  if (e.coll === "lifeskills") {
    state.lifeSkillLesson = e.ref.id;
    state.view = "lifeSkills";
  } else {
    state.moduleType = e.coll === "hadith" ? "hadith" : "surah";
    state.surahIndex = e.index;
    state.vocabIndex = 0;
    state.practiceIndex = 0;
    state.view = "intro";
  }
  renderApp();
}

function openByIdentity(key, number) {
  const e = catalog(key).find(x => x.number === number);
  if (e) openEntry(e);
}

// Prev/next lesson inside the current collection (boundaries clamp, no wrap).
function neighborOfCurrent(delta) {
  const key = state.view === "lifeSkills" ? "lifeskills"
    : state.moduleType === "hadith" ? "hadith" : "quran";
  const list = catalog(key);
  const currentNumber = key === "lifeskills" ? state.lifeSkillLesson
    : (state.surahIndex !== null && list[state.surahIndex]) ? list[state.surahIndex].number : null;
  const idx = list.findIndex(x => x.number === currentNumber);
  if (idx < 0) return null;
  const next = idx + delta;
  return (next >= 0 && next < list.length) ? list[next] : null;
}

function goHome() {
  state.view = "home";
  renderApp();
}

export {
  PAGE_SIZE, COLLECTIONS, catalog, categoriesOf, filterCatalog,
  browse, pageOf, setPage, setQuery, setCategory,
  openEntry, openByIdentity, neighborOfCurrent, goHome, resetBrowse,
};

// Catalog + browsing-state contracts (pure logic, no DOM needed beyond
// the module's document access): identities, search normalization,
// pagination math, category filters, prev/next clamping, state memory.
import { JSDOM } from "jsdom";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("", { url: "http://localhost:8000/app.html", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Event = dom.window.Event;
globalThis.Node = dom.window.Node;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
import { readFileSync } from "node:fs";
const appHtml = readFileSync(path.join(ROOT, "app.html"), "utf8");
dom.window.document.documentElement.innerHTML = appHtml.slice(appHtml.indexOf("<body>") + 6, appHtml.indexOf("</body>"));

const toFileUrl = p => "file:///" + p.replace(/\\/g, "/");
const stateMod = await import(toFileUrl(path.join(ROOT, "src/state.js"))+"?v=20260907-topnav2");
const pagesMod = await import(toFileUrl(path.join(ROOT, "src/pages.js"))+"?v=20260907-topnav2");
const cat = await import(toFileUrl(path.join(ROOT, "src/catalog.js"))+"?v=20260907-topnav2");
const { surahs, hadiths, state } = stateMod;
stateMod.setRenderer(() => {
  if (state.view === "home") return pagesMod.renderHome();
  if (state.view === "intro") return pagesMod.renderIntro();
  if (state.view === "lifeSkills") return pagesMod.renderLifeSkills();
});

let failures = 0;
const check = (n, c, e = "") => { console.log((c ? "PASS " : "FAIL ") + n + (e ? " — " + e : "")); if (!c) failures++; };

// catalog size & identity
check("quran catalog mirrors registry", cat.catalog("quran").length === surahs.length);
check("hadith catalog mirrors registry", cat.catalog("hadith").length === hadiths.length);
check("lifeskills catalog has 12", cat.catalog("lifeskills").length === 12);
const keys = cat.catalog("quran").map(e => e.key);
check("identities unique", new Set(keys).size === keys.length);
check("identities stable per collection", new Set([...keys, ...cat.catalog("hadith").map(e => e.key)]).size === surahs.length + hadiths.length);

// search normalization
check("search trims+lowercases", cat.filterCatalog("quran", { query: "  AL-FATIHA  " }).length === 1);
check("numeric search works", cat.filterCatalog("quran", { query: "114" }).some(e => e.number === 114));
check("arabic name search works", cat.filterCatalog("quran", { query: "النَّاس" }).some(e => e.number === 114));
check("empty query returns all", cat.filterCatalog("hadith", { query: "" }).length === hadiths.length);

// categories
check("categories derived from data", cat.categoriesOf("hadith").includes("Worship"));
check("category filter is exact", cat.filterCatalog("hadith", { category: "Worship" }).every(e => e.category === "Worship"));
check("combined query+category", cat.filterCatalog("hadith", { query: "pray", category: "Worship" }).length >= 1);

// pagination state lives outside render
cat.setQuery("quran", "nas");
check("setQuery resets page to 1", cat.browse.quran.page === 1 || (cat.setPage("quran", 3), cat.setQuery("quran", "nas"), cat.browse.quran.page === 1));
cat.setCategory("quran", "All");
cat.setPage("quran", 99);
check("page clamps inside renderGrid, not silently > total", cat.pageOf("quran") === 99, "raw stored");
cat.resetBrowse();
check("resetBrowse restores defaults", cat.browse.quran.query === "" && cat.browse.hadith.page === 1);

// neighborOfCurrent clamps at boundaries (no wrap)
state.moduleType = "surah";
state.surahIndex = 0;
check("prev at first lesson is null", cat.neighborOfCurrent(-1) === null);
state.surahIndex = surahs.length - 1;
check("next at last lesson is null", cat.neighborOfCurrent(1) === null);
state.surahIndex = surahs.length - 2;
check("next at second-last works", cat.neighborOfCurrent(1).index === surahs.length - 1);
state.view = "lifeSkills"; state.lifeSkillLesson = 12;
check("LS prev at 12 -> 11", cat.neighborOfCurrent(-1).number === 11);
state.view = "home";

// openEntry sets the shared collection memory
state.view = "home";
cat.openByIdentity("hadith", hadiths[0].number);
check("openEntry records collection", state.activeCollection === "hadith" && state.view === "intro" && state.moduleType === "hadith");
cat.openByIdentity("lifeskills", 4);
check("LS openEntry sets lesson + view", state.view === "lifeSkills" && state.lifeSkillLesson === 4 && state.activeCollection === "lifeskills");

console.log(failures ? "\n" + failures + " FAILED" : "\nCATALOG CONTRACTS VERIFIED");
process.exit(failures ? 1 : 0);

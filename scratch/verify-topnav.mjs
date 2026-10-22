// Prove the top-nav wiring end-to-end: load the REAL app modules in jsdom,
// exercise navbar panels, library cards, lesson bar, and Back — all through
// the actual click handlers the browser will fire.
import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

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
globalThis.window.ResizeObserver = globalThis.ResizeObserver;
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};

const appHtml = readFileSync(path.join(ROOT, "app.html"), "utf8");
dom.window.document.documentElement.innerHTML =
  appHtml.slice(appHtml.indexOf("<body>") + 6, appHtml.indexOf("</body>"));

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log((cond ? "PASS: " : "FAIL: ") + name + (extra ? " — " + extra : ""));
  if (!cond) failures++;
};
const click = (el) => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const stateMod = await import(pathToFileURL(path.join(ROOT, "src/state.js")).href+"?v=20260907-topnav2");
const navMod = await import(pathToFileURL(path.join(ROOT, "src/navigation.js")).href+"?v=20260907-topnav2");
const pagesMod = await import(pathToFileURL(path.join(ROOT, "src/pages.js")).href+"?v=20260907-topnav2");
const { state, renderApp, setRenderer, surahs, hadiths } = stateMod;

function render() {
  navMod.syncChrome();
  if (state.view === "home") return pagesMod.renderHome();
  if (state.view === "intro") return pagesMod.renderIntro();
  if (state.view === "lifeSkills") return pagesMod.renderLifeSkills();
}
setRenderer(render);
navMod.initChrome();
renderApp();

check("topbar chrome rendered", document.querySelectorAll("#topbar .nav-drop").length === 4);
check("no old sidebar nodes remain", !document.getElementById("sidebar") && !document.getElementById("hadithSidebar"));
check("old home tabs removed", !document.querySelector(".ht-tab"));

// ---- Navbar: Quran panel opens, search filters, result opens the lesson ----
const quranDrop = document.querySelector('.nav-drop[data-coll="quran"]');
click(quranDrop.querySelector(".nav-link"));
check("Quran panel open + aria-expanded", !quranDrop.querySelector(".nav-panel").hidden &&
  quranDrop.querySelector(".nav-link").getAttribute("aria-expanded") === "true");
check("panel lists preview items", quranDrop.querySelectorAll(".nav-item").length > 0);
const input = quranDrop.querySelector(".nav-panel-search");
input.value = "ikhlas";
input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
check("panel search narrows to Al-Ikhlas", [...quranDrop.querySelectorAll(".ni-title")].some(t => /Ikhlas/i.test(t.textContent)) &&
  quranDrop.querySelectorAll(".nav-item").length <= 3, "items: " + quranDrop.querySelectorAll(".nav-item").length);
click(quranDrop.querySelector(".nav-item"));
check("panel result opens surah intro", state.view === "intro" && state.moduleType === "surah" &&
  state.surahIndex !== null && surahs[state.surahIndex].nameEnglish.match(/Ikhlas/i), surahs[state.surahIndex]?.nameEnglish);
check("panel closed after selecting", quranDrop.querySelector(".nav-panel").hidden);

// ---- Lesson bar on intro: chooser + prev/next + home ----
check("lesson bar rendered", !!document.querySelector(".lesson-bar .lb-chooser"));
const chooser = document.getElementById("lbChooser");
check("chooser has all surahs", chooser.options.length === surahs.length, "got " + chooser.options.length);
const nextBtn = document.getElementById("lbNext");
if (!nextBtn.disabled) {
  const before = state.surahIndex;
  click(nextBtn);
  check("next lesson moves index", state.view === "intro" && state.surahIndex !== before);
} else check("next at boundary disabled", true);
click(document.getElementById("lbPrev"));
check("prev returns to the same surah", surahs[state.surahIndex].nameEnglish.match(/Ikhlas/i) !== null);
click(document.getElementById("lbHome"));
check("bar Home crumb returns to library", state.view === "home" && state.activeCollection === "quran");

// ---- Library: cards, search beyond page, chips, remember collection ----
const cards = () => [...document.querySelectorAll(".lib-card")];
check("quran library first page = 12", cards().length === 12, "got " + cards().length);
check("pager visible on quran", !document.getElementById("libPager").hidden);
click(document.getElementById("pgNext"));
check("page 2 shows different cards", cards()[0].querySelector(".lc-title").textContent !== "Al-Fatiha");
const s2 = document.getElementById("libSearch");
s2.value = "nas";
s2.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
check("search matches across all pages",
  cards().some(c => c.querySelector(".lc-title").textContent === "An-Nas"), cards().map(c => c.querySelector(".lc-title").textContent).join(","));
click(document.getElementById("libClear"));
check("clear restores page 1", document.getElementById("libMeta").textContent.includes("1–12"));
click(cards()[0]);
check("card opens Al-Fatiha (first in register)", state.view === "intro" && surahs[state.surahIndex].number === 1);
click(document.getElementById("btnBack"));
check("back-to-library stays on quran collection", state.view === "home" && state.activeCollection === "quran");

// ---- Hadith: switch collection from navbar, chips filter ----
click(document.querySelector('.nav-drop[data-coll="hadith"] .nav-browse'));
check("Browse all hadith switches library", state.view === "home" && state.activeCollection === "hadith");
check("hadith page 1 = 12", cards().length === 12);
check("topic chips render with counts", document.querySelectorAll("#libChips .cat-chip").length >= 5);
const worship = [...document.querySelectorAll("#libChips .cat-chip")].find(c => c.dataset.cat === "Worship");
click(worship);
const n = hadiths.filter(h => h.category === "Worship").length;
check("Worship chip filters cards", cards().length === Math.min(12, n), "got " + cards().length + " want " + Math.min(12, n));
check("meta counts the filtered set", document.getElementById("libMeta").textContent.includes("of " + n));
click(document.querySelector(".lib-card"));
check("hadith card opens hadith intro", state.view === "intro" && state.moduleType === "hadith");
check("hadith intro uses Mushaf panel", !!document.querySelector(".hadith-arabic-display"));
click(document.getElementById("lbHome"));

// ---- Life Skills ----
click(document.querySelector('.nav-drop[data-coll="lifeskills"] .nav-browse'));
check("life skills library heading", document.querySelector(".lib-title").textContent.includes("Strong Heart"));
click(document.querySelector('.lib-card[data-entry="lifeskill:2"]'));
check("Lesson 2 opens lifeSkills view", state.view === "lifeSkills" && state.lifeSkillLesson === 2);
const iframe = document.getElementById("lsFrame");
check("lesson2 iframe with accessible title", iframe.getAttribute("src") === "lesson2.html" && iframe.getAttribute("title").includes("Anger"));
check("jump-to-section control present", document.querySelectorAll("#lsJump option").length === 9);
check("LS lesson bar shows the lesson name", document.querySelector(".lb-current").textContent.includes("Anger"));
click(document.getElementById("lbNext"));
check("LS next moves to lesson 3", state.lifeSkillLesson === 3 && document.getElementById("lsFrame").getAttribute("src") === "lesson3.html");
click(document.getElementById("btnLsBack"));
check("back from lesson restores lifeskills library", state.view === "home" && state.activeCollection === "lifeskills");

// ---- Global search panel ----
const g = document.querySelector('.nav-drop[data-coll="__search"]');
click(g.querySelector(".nav-link"));
const gi = g.querySelector(".nav-panel-search");
gi.value = "anger";
gi.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
const titles = [...g.querySelectorAll(".ni-title")].map(t => t.textContent);
check("global search spans collections",
  titles.some(t => /Anger/i.test(t)), titles.join(", "));
click(g.querySelector(".nav-item"));
check("global search result opens a lesson", state.view === "lifeSkills" || state.view === "intro");

// ---- Escape closes panels ----
click(document.querySelector('.nav-drop[data-coll="quran"] .nav-link'));
check("quran panel re-opened for escape test", !document.querySelector('.nav-drop[data-coll="quran"] .nav-panel').hidden);
document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
check("after Escape no panel open", [...document.querySelectorAll(".nav-panel")].every(p => p.hidden));

check("lesson2.html exists at root", existsSync(path.join(ROOT, "lesson2.html")));

console.log(failures === 0 ? "\nTOPNAV WIRING VERIFIED — ALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

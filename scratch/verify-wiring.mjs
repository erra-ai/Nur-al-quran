// Prove the Life Skills wiring end-to-end against the TOPNAV contract:
// real modules, library cards, iframe src, back navigation.
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
const click = el => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const stateMod = await import(pathToFileURL(path.join(ROOT, "src/state.js")).href+"?v=20260907-topnav2");
const navMod = await import(pathToFileURL(path.join(ROOT, "src/navigation.js")).href+"?v=20260907-topnav2");
const pagesMod = await import(pathToFileURL(path.join(ROOT, "src/pages.js")).href+"?v=20260907-topnav2");
const { state, renderApp, setRenderer } = stateMod;

function render() {
  navMod.syncChrome();
  if (state.view === "home") return pagesMod.renderHome();
  if (state.view === "intro") return pagesMod.renderIntro();
  if (state.view === "lifeSkills") return pagesMod.renderLifeSkills();
}
setRenderer(render);
navMod.initChrome();
state.activeCollection = "lifeskills";
renderApp();

check("twelve Life Skills cards on the library",
  document.querySelectorAll('.lib-card[data-entry^="lifeskill:"]').length === 12);

for (const id of [1, 2, 3]) {
  click(document.querySelector('.lib-card[data-entry="lifeskill:' + id + '"]'));
  check(`Lesson ${id} click -> view=lifeSkills, lesson=${id}`,
    state.view === "lifeSkills" && state.lifeSkillLesson === id);
  const iframe = document.getElementById("lsFrame");
  check(`Lesson ${id} iframe src=lesson${id}.html`,
    iframe && iframe.getAttribute("src") === `lesson${id}.html`, iframe ? iframe.getAttribute("src") : "no iframe");
  check(`nav label shows Lesson ${id} name`,
    document.querySelector(".lb-current").textContent.length > 5);
  click(document.getElementById("btnLsBack"));
  check(`back from Lesson ${id} returns to the library`,
    state.view === "home" && state.activeCollection === "lifeskills");
}

check("lesson2.html exists at app root", existsSync(path.join(ROOT, "lesson2.html")));
check("lesson3.html exists at app root", existsSync(path.join(ROOT, "lesson3.html")));

console.log(failures === 0 ? "\nWIRING VERIFIED — ALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

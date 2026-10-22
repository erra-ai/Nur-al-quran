// Verify all Life Skills lessons 4-12 headlessly: structure, interactions, and wiring.
// Run: node scratch/verify-lessons-4-12.mjs
import { JSDOM } from "jsdom";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;
const check = (name, cond, extra = "") => {
  if (!cond) { failures++; console.log("FAIL:", name, extra); }
};

for (let n = 4; n <= 12; n++) {
  const file = path.join(ROOT, "lesson" + n + ".html");
  if (!existsSync(file)) { check("lesson" + n + " exists", false); continue; }
  const dom = new JSDOM(readFileSync(file, "utf8"), {
    runScripts: "dangerously",
    url: "http://localhost:8000/lesson" + n + ".html",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const d = window.document;
  check("L" + n + " title has 'Strong Heart, Wise Mind'", d.title.includes("Strong Heart, Wise Mind"), d.title);
  check("L" + n + " 8 sections", d.querySelectorAll("article.section").length === 8);
  check("L" + n + " >=4 checkpoints", d.querySelectorAll(".checkpoint").length >= 4);
  check("L" + n + " 2 quran boxes", d.querySelectorAll(".quran-box").length === 2);
  check("L" + n + " hadith boxes >=2", d.querySelectorAll(".hadith-box").length >= 2);
  check("L" + n + " 4 scale cards", d.querySelectorAll(".scale-card").length === 4);
  check("L" + n + " 4 skill cards", d.querySelectorAll(".skill-card").length === 4);
  check("L" + n + " 4 order cards", d.querySelectorAll(".order-card").length === 4);
  check("L" + n + " refs have collection numbers", [...d.querySelectorAll(".hadith-ref")].every(e => /\d{3,}|:\d/.test(e.textContent)));

  // interactions
  const cps = d.querySelectorAll(".checkpoint");
  const opt = cps[0].querySelector('.option[data-correct="true"]');
  opt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("L" + n + " checkpoint correct works", opt.classList.contains("correct"));
  const w = cps[1].querySelector('.option[data-correct="false"]');
  w.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("L" + n + " wrong marks + reveals", w.classList.contains("wrong") && cps[1].querySelector('.option[data-correct="true"]').classList.contains("show-correct"));
  const sc = d.querySelector(".scale-card");
  sc.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("L" + n + " scale expands", sc.classList.contains("open"));

  // ordering game in declared order
  const stepNames = [...d.querySelectorAll("#orderGrid .order-card")].map(c => c.textContent);
  const STEPS = window.eval ? null : null;
  // read steps from the script tag (same order the game expects)
  const script = [...d.querySelectorAll("script")].map(s => s.textContent).join("\n");
  const m = script.match(/const steps=\[(.*?)\];/);
  const declared = m ? m[1].split(",").map(s => s.trim().replace(/^"|"$/g, "")) : [];
  check("L" + n + " order cards match declared steps", stepNames.sort().join("|") === declared.slice().sort().join("|"));
  let ok = true;
  declared.forEach(step => {
    const card = [...d.querySelectorAll("#orderGrid .order-card")].find(c => !c.classList.contains("placed") && c.textContent.includes(step));
    if (!card) { ok = false; return; }
    card.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    if (!card.classList.contains("placed")) ok = false;
  });
  check("L" + n + " ordering completes in declared order", ok);
}

// wiring check — home must render 12 lesson buttons; each click sets the right iframe
const shell = new JSDOM("", { url: "http://localhost:8000/app.html", pretendToBeVisual: true });
globalThis.window = shell.window;
globalThis.document = shell.window.document;
Object.defineProperty(globalThis, "navigator", { value: shell.window.navigator, configurable: true });
globalThis.HTMLElement = shell.window.HTMLElement;
globalThis.MouseEvent = shell.window.MouseEvent;
globalThis.Event = shell.window.Event;
globalThis.Node = shell.window.Node;
globalThis.DOMParser = shell.window.DOMParser;
globalThis.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
shell.window.IntersectionObserver = globalThis.IntersectionObserver;
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const appHtml = readFileSync(path.join(ROOT, "app.html"), "utf8");
shell.window.document.documentElement.innerHTML = appHtml.slice(appHtml.indexOf("<body>") + 6, appHtml.indexOf("</body>"));

const toFileUrl = (p) => "file:///" + p.replace(/\\/g, "/");
const stateMod = await import(toFileUrl(path.join(ROOT, "src/state.js"))+"?v=20260907-topnav2");
await import(toFileUrl(path.join(ROOT, "src/navigation.js"))+"?v=20260907-topnav2");
const pagesMod = await import(toFileUrl(path.join(ROOT, "src/pages.js"))+"?v=20260907-topnav2");
const { state, setRenderer, renderApp } = stateMod;
function render() {
  if (state.view === "home") return pagesMod.renderHome();
  if (state.view === "lifeSkills") return pagesMod.renderLifeSkills();
}
setRenderer(render);
renderApp();
state.activeCollection = "lifeskills";
renderApp();
const btns2 = document.querySelectorAll('.lib-card[data-entry^="lifeskill:"]');
check("home shows 12 life-skill cards", btns2.length === 12, "got " + btns2.length);
for (let i = 1; i <= 12; i++) {
  document.querySelector('.lib-card[data-entry="lifeskill:' + i + '"]')
    .dispatchEvent(new shell.window.MouseEvent("click", { bubbles: true }));
  const iframe = document.querySelector("#app iframe");
  check("click Lesson " + i + " loads lesson" + i + ".html", iframe && iframe.getAttribute("src") === "lesson" + i + ".html", iframe ? iframe.getAttribute("src") : "none");
  document.querySelector("#btnLsBack").dispatchEvent(new shell.window.MouseEvent("click", { bubbles: true }));
}
// library heading + collection remembered
check("life skills library heading", document.querySelector(".lib-title").textContent.includes("Strong Heart"));

console.log(failures === 0 ? "ALL LESSONS 4-12 + WIRING VERIFIED" : failures + " FAILURES");
process.exit(failures ? 1 : 0);

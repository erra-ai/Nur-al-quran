import { JSDOM } from "jsdom";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { readFileSync } from "node:fs";

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
globalThis.IntersectionObserver = class { constructor(){} observe(){} unobserve(){} disconnect(){} };
const store={};
globalThis.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}};
globalThis.window.IntersectionObserver = globalThis.IntersectionObserver;

const appHtml = readFileSync(path.join(ROOT,"app.html"),"utf8");
dom.window.document.documentElement.innerHTML = appHtml.slice(appHtml.indexOf("<body>")+6, appHtml.indexOf("</body>"));

let failures=0;
const check=(n,c,e="")=>{console.log((c?"PASS: ":"FAIL: ")+n+(e?" — "+e:""));if(!c)failures++;};

const stateMod=await import(pathToFileURL(path.join(ROOT,"src/state.js")).href+"?v=20260907-topnav2");
await import(pathToFileURL(path.join(ROOT,"src/navigation.js")).href+"?v=20260907-topnav2");
const pagesMod=await import(pathToFileURL(path.join(ROOT,"src/pages.js")).href+"?v=20260907-topnav2");
const {state,setRenderer,renderApp,surahs,hadiths}=stateMod;
function render(){ if(state.view==="intro") return pagesMod.renderIntro(); }
setRenderer(render);

// Hadith intro (a LONG one: 001 has a long text)
state.moduleType="hadith"; state.surahIndex=0; state.view="intro"; renderApp();
let panel=document.querySelector("#app .intro-surah-text");
check("hadith intro has Mushaf panel", panel!==null);
check("panel contains hadith Arabic", panel && panel.querySelector(".intro-mushaf-arabic").textContent.includes(hadiths[0].text.slice(0,20)));
check("panel has ornamental rule", panel && panel.querySelector(".intro-mushaf-rule")!==null);
check("narrator/source in source strip", panel && /عَنْ|رضي|رواه|البخاري/.test(panel.querySelector(".intro-translation-source").textContent), panel ? panel.querySelector(".intro-translation-source").textContent.trim().slice(0,60) : "no panel");
check("heading says Hadith", panel && panel.querySelector(".intro-surah-heading span").textContent.includes("Hadith"));
check("no cramped inline arabic-name in title", !document.querySelector("#app .intro-title .arabic-name"));

// Surah intro unaffected — Al-Fatiha (surah 1) has NO separate basmala (it IS ayah 1),
// so check Fatiha renders its panel, then An-Nas (a surah with separate basmala).
state.moduleType="surah"; state.surahIndex=0; state.view="intro"; renderApp();
panel=document.querySelector("#app .intro-surah-text");
check("surah intro still has panel (Fatiha)", panel!==null);
check("Fatiha shows 7 numbered translations, no separate basmala block",
  panel && panel.querySelectorAll(".intro-translation-row").length===7 && panel.querySelector(".intro-basmala")===null,
  panel ? "rows="+panel.querySelectorAll(".intro-translation-row").length : "no panel");
const nasIdx=surahs.findIndex(s=>s.number===114);
state.surahIndex=nasIdx; state.view="intro"; renderApp();
panel=document.querySelector("#app .intro-surah-text");
check("An-Nas panel has separate basmala + 6 translations",
  panel && panel.querySelector(".intro-basmala")!==null && panel.querySelectorAll(".intro-translation-row").length===6,
  panel ? "rows="+panel.querySelectorAll(".intro-translation-row").length : "no panel");
check("surah arabic name still in title", document.querySelector("#app .intro-title .arabic-name")!==null);

console.log(failures===0?"\nHADITH DISPLAY VERIFIED":"\n"+failures+" FAILED");
process.exit(failures?1:0);

// Headless verification harness for lesson2.html + Life Skills app wiring.
// Run: node scratch/verify-lesson2.js
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "lesson2.html"), "utf8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "http://localhost:8000/lesson2.html",
  pretendToBeVisual: true,
  resources: undefined, // do not fetch external resources (fonts)
});
const { window } = dom;
window.addEventListener("error", (e) => {
  console.log("WINDOW ERROR:", e.message);
});

let failures = 0;
function check(name, cond, extra = "") {
  if (cond) console.log("PASS:", name, extra);
  else { console.log("FAIL:", name, extra); failures++; }
}

// Give the inline IIFE a moment; scripts run synchronously on parse though.
setTimeout(() => {
  const d = window.document;

  // --- Structure ---
  check("title is Anger lesson", d.title.includes("Anger"), d.title);
  check("8 sections present", d.querySelectorAll("article.section").length === 8,
    "got " + d.querySelectorAll("article.section").length);
  const checkpoints = d.querySelectorAll(".checkpoint");
  check("6 checkpoints (3 story + 2 transfer + 1 guide)", checkpoints.length === 6, "got " + checkpoints.length);
  check("scale cards = 4", d.querySelectorAll(".scale-card").length === 4);
  check("order cards = 4", d.querySelectorAll(".order-card").length === 4);
  check("quran box has 3:134 ref", d.querySelector(".quran-box .ref").textContent.includes("3:134"));
  check("hadith boxes = 3", d.querySelectorAll(".hadith-box").length === 3,
    "got " + d.querySelectorAll(".hadith-box").length);

  // Arabic text integrity: the Quran anchor must match the API-verified Uthmani text.
  const EXPECTED_AR = "ٱلَّذِينَ يُنفِقُونَ فِى ٱلسَّرَّآءِ وَٱلضَّرَّآءِ وَٱلْكَـٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ";
  const renderedAr = d.querySelector(".quran-box .arabic").textContent.replace(/\u06D7/g, "").trim();
  check("Quran 3:134 Arabic matches quran.com Uthmani",
    renderedAr.startsWith(EXPECTED_AR.replace(/\u06D7/g, "")),
    renderedAr.slice(0, 60) + "…");

  // la taghDab hadith present with Bukhari ref
  const hadithRefs = [...d.querySelectorAll(".hadith-ref")].map(e => e.textContent);
  check("Bukhari 6116 cited", hadithRefs.some(r => r.includes("6116")), JSON.stringify(hadithRefs));
  check("Abu Dawud 4782 cited", hadithRefs.some(r => r.includes("4782")));

  // --- Interactivity: MCQ checkpoint (correct path) ---
  const cp1 = checkpoints[0];
  const correctOpt = cp1.querySelector('.option[data-correct="true"]');
  correctOpt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("checkpoint correct answer marks green", correctOpt.classList.contains("correct"));
  check("checkpoint feedback shown", cp1.querySelector(".feedback").classList.contains("show"));

  // --- Interactivity: MCQ checkpoint (wrong path + retry) ---
  const cp2 = checkpoints[1];
  const wrongOpt = cp2.querySelector('.option[data-correct="false"]');
  wrongOpt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("wrong answer marked", wrongOpt.classList.contains("wrong"));
  const cp2Correct = cp2.querySelector('.option[data-correct="true"]');
  check("correct answer revealed on wrong click", cp2Correct.classList.contains("show-correct"));
  cp2Correct.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("retry marks correct green", cp2Correct.classList.contains("correct"));

  // --- Anger scale cards expand ---
  const scaleCard = d.querySelector(".scale-card");
  scaleCard.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("scale card opens on click", scaleCard.classList.contains("open"));
  check("scale card aria-expanded true", scaleCard.getAttribute("aria-expanded") === "true");

  // --- Ordering activity ---
  const STEPS = ["Sit Down", "Seek Refuge", "Stay Silent", "Slow Down & Cool"];
  const orderCards = [...d.querySelectorAll("#orderGrid .order-card")];
  check("order cards show all 4 steps",
    orderCards.map(c => c.textContent).sort().join("|") === STEPS.slice().sort().join("|"),
    orderCards.map(c => c.textContent).join("|"));

  // click in correct order
  let progressOk = true;
  STEPS.forEach((step, i) => {
    const card = [...d.querySelectorAll("#orderGrid .order-card")].find(c => c.textContent.includes(step));
    card.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    if (!card.classList.contains("placed")) progressOk = false;
  });
  check("ordering completes in correct sequence", progressOk);
  check("order complete message shown",
    d.querySelector("#orderComplete").style.display === "block");
  check("reset button shown after completion",
    d.querySelector("#orderReset").style.display === "inline-block");

  // wrong-order click before completion (fresh after reset)
  d.querySelector("#orderReset").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const freshCards = [...d.querySelectorAll("#orderGrid .order-card")];
  check("reset restores 4 unplaced cards",
    freshCards.length === 4 && freshCards.every(c => !c.classList.contains("placed")));
  const lastStepCard = freshCards.find(c => c.textContent.includes("Slow Down"));
  lastStepCard.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("wrong-order click rejected with feedback",
    !lastStepCard.classList.contains("placed") &&
    d.querySelector("#orderFeedback").textContent.includes("later"));

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}, 300);

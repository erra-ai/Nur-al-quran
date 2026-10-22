// Headless verification harness for lesson3.html
// Run: node scratch/verify-lesson3.js
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "lesson3.html"), "utf8");

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "http://localhost:8000/lesson3.html",
  pretendToBeVisual: true,
});
const { window } = dom;
window.addEventListener("error", (e) => console.log("WINDOW ERROR:", e.message));

let failures = 0;
function check(name, cond, extra = "") {
  if (cond) console.log("PASS:", name, extra);
  else { console.log("FAIL:", name, extra); failures++; }
}

setTimeout(() => {
  const d = window.document;

  check("title is Sadness lesson", d.title.includes("Sadness and Grief"), d.title);
  check("8 sections present", d.querySelectorAll("article.section").length === 8,
    "got " + d.querySelectorAll("article.section").length);
  check("5 checkpoints (2 story + 2 transfer + 1 guide)", d.querySelectorAll(".checkpoint").length === 5,
    "got " + d.querySelectorAll(".checkpoint").length);
  check("scale cards = 4", d.querySelectorAll(".scale-card").length === 4);
  check("order cards = 4", d.querySelectorAll(".order-card").length === 4);
  check("hadith boxes = 3", d.querySelectorAll(".hadith-box").length === 3);
  check("quran boxes = 3 (12:84, 12:86, 94:5-6)", d.querySelectorAll(".quran-box").length === 3);

  // Arabic integrity — compare against API-verified Uthmani strings
  const EXPECT = {
    "12:84": "وَتَوَلَّىٰ عَنْهُمْ وَقَالَ يَـٰٓأَسَفَىٰ عَلَىٰ يُوسُفَ وَٱبْيَضَّتْ عَيْنَاهُ مِنَ ٱلْحُزْنِ",
    "12:86": "قَالَ إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِىٓ إِلَى ٱللَّهِ وَأَعْلَمُ مِنَ ٱللَّهِ مَا لَا تَعْلَمُونَ",
    "94:5-6": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
  };
  const arBoxes = [...d.querySelectorAll(".quran-box .arabic")].map(e => e.textContent);
  check("12:84 Arabic matches quran.com", arBoxes[0].includes(EXPECT["12:84"]), arBoxes[0].slice(0, 40));
  check("12:86 Arabic matches quran.com", arBoxes[1].includes(EXPECT["12:86"]), arBoxes[1].slice(0, 40));
  check("94:5-6 Arabic matches quran.com", arBoxes[2].includes(EXPECT["94:5-6"]), arBoxes[2].slice(0, 40));

  const hadithRefs = [...d.querySelectorAll(".hadith-ref")].map(e => e.textContent);
  check("Bukhari 1284 cited", hadithRefs.some(r => r.includes("1284")), JSON.stringify(hadithRefs));
  check("Bukhari 6369 cited", hadithRefs.some(r => r.includes("6369")));
  check("Bukhari 5641 / Muslim 2573 cited", hadithRefs.some(r => r.includes("5641") && r.includes("2573")));

  const body = d.body.textContent;
  check("despair distinction stated", body.includes("despair"));
  check("warning against 'don't cry hurts the dead'", body.includes("hurts the dead"));
  check("level 9-10 professional help stated", body.includes("doctor"));

  // --- MCQ interactions ---
  const checkpoints = d.querySelectorAll(".checkpoint");
  const cp1 = checkpoints[0];
  const correctOpt = cp1.querySelector('.option[data-correct="true"]');
  correctOpt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("checkpoint correct marks green", correctOpt.classList.contains("correct"));
  check("checkpoint feedback shown", cp1.querySelector(".feedback").classList.contains("show"));

  const cp2 = checkpoints[1];
  const wrongOpt = cp2.querySelector('.option[data-correct="false"]');
  wrongOpt.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("wrong marked red", wrongOpt.classList.contains("wrong"));
  const cp2c = cp2.querySelector('.option[data-correct="true"]');
  check("correct revealed", cp2c.classList.contains("show-correct"));
  cp2c.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("retry marks correct", cp2c.classList.contains("correct"));

  // --- scale cards ---
  const sc = d.querySelector(".scale-card");
  sc.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("scale card expands", sc.classList.contains("open") && sc.getAttribute("aria-expanded") === "true");

  // --- ordering ---
  const STEPS = ["Name It Honestly", "Tell a Safe Person", "Turn to Allah", "Hope in Action"];
  STEPS.forEach((step, i) => {
    const card = [...d.querySelectorAll("#orderGrid .order-card")]
      .find(c => !c.classList.contains("placed") && c.textContent.includes(step));
    card.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    if (!card.classList.contains("placed")) failures++, console.log("FAIL: order step rejected:", step);
  });
  check("ordering completes", d.querySelector("#orderComplete").style.display === "block");
  d.querySelector("#orderReset").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("reset restores", [...d.querySelectorAll(".order-card")].every(c => !c.classList.contains("placed")));
  const late = [...d.querySelectorAll(".order-card")].find(c => c.textContent.includes("Hope in Action"));
  late.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check("wrong-order rejected", !late.classList.contains("placed"));

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}, 300);

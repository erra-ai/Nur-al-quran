// One-off patch for Surah 97: shorten grammar.english / grammar.arabic on the
// twelve vocabulary cards to the short "tag · tag" shape the rest of the library
// uses, so the full sentences live only in grammar.explanation.
// (scratch/fix-qadr.js is written against the original module and is not
// re-runnable once the module has been rebuilt, so this patches in place.)
//   node scratch/patch-qadr-grammar.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const FILE = path.join(__dirname, "..", "src", "data", "surahs", "097-qadr.js");
const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "qadr");

const TAG = {
  "We sent it down / We revealed it": [
    "Form IV past verb, first person plural, with a third-person object pronoun",
    "فعل ماضٍ المزيد بالهمزة، ونون الفاعلين، والهاء للمفعول",
  ],
  "the night": [
    "Feminine noun, genitive by preposition, governing the next word",
    "اسم مؤنث مجرور بحرف الجر، وهو مضاف",
  ],
  "the Decree / the Power / the Destiny": [
    "Verbal noun, definite, genitive as the governed word",
    "مصدر من ق د ر، مضاف إليه مجرور بالكسرة",
  ],
  "better / greater than": [
    "Comparative noun (ism tafdīl), nominative as the report",
    "اسم تفضيل، خبر مرفوع بالضمة",
  ],
  "a thousand": [
    "Numeral noun, genitive, governing the counted word",
    "اسم مجرور بالكسرة، وهو مضاف",
  ],
  "months": [
    "Singular in wording, genitive as the governed word, plural in meaning",
    "مفرد لفظاً جمع معنى، مضاف إليه مجرور",
  ],
  "they descend / come down": [
    "Form V imperfect verb (intensive), nominative",
    "فعل مضارع على صيغة التفعيل للتكثير، مرفوع بالضمة",
  ],
  "the angels": [
    "Broken plural of مَلَك, definite, nominative as the subject",
    "جمع ملك، معرفة، فاعل مرفوع بالضمة",
  ],
  "the Spirit (Jibril AS)": [
    "Noun with the definite article, conjoined with وَ, nominative",
    "معطوف بالواو مرفوع بالضمة",
  ],
  "by permission / with the leave": [
    "Preposition بِ with the verbal noun إذن, genitive and governing",
    "الباء حرف جر، وإذن اسم مجرور بها وهو مضاف",
  ],
  "peace / safety": [
    "Verbal noun from س-ل-م, indefinite, nominative as the report",
    "مصدر من س ل م، نكرة مرفوعة خبراً",
  ],
  "the dawn / the break of light": [
    "Noun فَجْر ('daybreak'), definite, genitive as the governed word",
    "مضاف إليه مجرور بالكسرة، ومعطوف على ما جرّ بحَتَّى",
  ],
};

let touched = 0;
s.vocabulary.forEach((v) => {
  const row = TAG[v.meaning];
  if (!row) throw new Error("no grammar tag for meaning: " + v.meaning);
  v.grammar.english = row[0];
  v.grammar.arabic = row[1];
  touched++;
});

// same grammar rules the audit applies
const failures = [];
s.vocabulary.forEach((v, i) => {
  ["english", "arabic", "explanation"].forEach((f) => {
    if (!String(v.grammar?.[f] || "").trim()) failures.push(`v${i + 1} missing grammar.${f}`);
  });
  const gt = [v.grammar.english, v.grammar.arabic, v.grammar.explanation].join(" ");
  if (/emphatic prefix l[aā]m|opening لَ|مؤكد باللام/i.test(gt) && !v.arabic.startsWith("ل")) {
    failures.push(`v${i + 1} lam mismatch`);
  }
});
if (touched !== 12) failures.push("touched " + touched);
if (failures.length) {
  console.log("SELF-CHECK FAILED:\n" + failures.join("\n"));
  process.exit(1);
}

fs.writeFileSync(FILE, `// Surah 97 \u00b7 Al-Qadr\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("grammar tags shortened on", touched, "cards");

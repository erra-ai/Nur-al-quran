// Rebuild Surah 81 (At-Takwir) lesson content to pass audit-surah.js.
// Arabic word forms are READ FROM the module's own fillBlanks bank (never
// retyped), so vocabulary and banks cannot drift apart.
//   node scratch/fix-takwir.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const FILE = path.join(__dirname, "..", "src", "data", "surahs", "081-takwir.js");
const DATE = "2026-08-30";
const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "takwir");

const itani = (line, quote) => ({
  status: "verified", by: "ClearQuran (Talal Itani)",
  note: `Quote from translation-notes/81-takwir-itani-teens.md line ${line}: '${quote}'`, checkedAt: DATE,
});
const ik = (verses, quote) => ({
  status: "verified", by: "tafsir Ibn Kathir",
  note: `Ibn Kathir on ${verses}: '${quote}'`, checkedAt: DATE,
});

// --- exact Arabic forms, taken from the file itself ---
const blankByMeaning = new Map();
s.fillBlanks.ayahs.forEach((a) => a.segments.forEach((x) => {
  if (x.b !== undefined) blankByMeaning.set(x.m, x.b);
}));
const wordInAyah = (n, idx) => {
  const text = s.fillBlanks.ayahs.find((a) => a.n === n).segments.map((x) => x.t ?? x.b ?? "").join("");
  return text.trim().split(/\s+/)[idx];
};
const SOULS = wordInAyah(7, 1);      // ٱلنُّفُوسُ
const JANNAH = wordInAyah(13, 1);    // ٱلْجَنَّةُ
const A = (meaning) => blankByMeaning.get(meaning);
if (!A("wrapped up / darkened") || !SOULS || !JANNAH) throw new Error("could not resolve arabic forms");

// [meaning, verse, connection, hint, grammarEN, grammarAR, grammarWhy, verified]
const V = [
  ["wrapped up / darkened", 1, "The first thing to go is the sun's light — it is folded up and darkened.", "Rolling a blanket tight around something.",
   "Perfect verb, third person feminine singular, passive voice", "فعل ماض مبني للمجهول للغائب المفرد المؤنث",
   "The suffix ت marks the passive: the sun does not wrap itself, it IS wrapped. The feminine form agrees with the sun.",
   ik("81:1", "(When the sun is Kuwwirat.) \"This means it will be darkened.\" ... At-Takwir means to gather one part of something with another part of it (i.e., folding).")],
  ["scattered / dimmed", 2, "The stars that looked fixed will pour down and lose their light.", "Water that spills over and goes dark.",
   "Perfect verb, Form VII, third person feminine singular", "فعل ماض لسبعل للغائب المفرد المؤنث",
   "The pattern ٱنفَعَلَ gives the sense of something breaking apart on its own, which suits stars scattering; the final ت agrees with the feminine subject.",
   itani(21, "And when the stars fall, losing their light.")],
  ["moved away", 3, "The mountains that looked permanent are marched off and gone.", "Something carried off on a journey.",
   "Perfect verb, third person feminine singular, passive voice", "فعل ماض مبني للمجهول للمفرد المؤنث",
   "This is the passive of 'to make something travel', so the mountains are made to move — the doubled yaa marks the intensive form.",
   itani(23, "And when the mountains are moved away.")],
  ["set boiling / made to blaze", 6, "Seas that seem endless are turned into blazing fire.", "An oven heated until it glows.",
   "Perfect verb, Form II, third person feminine singular, passive", "فعل ماض للتكثير مبني للمجهول للمفرد المؤنث",
   "The Form II passive shows intensive action done to the seas: they are heated again and again until they blaze.",
   itani(29, "And when the seas burst into flames.")],
  ["souls", 7, "Every soul is matched with its peer, so nothing about a person is lost.", "The inner life of a person — what never dies.",
   "Plural noun, nominative with al-", "اسم جمع مرفوع بالضم ومعروف بأل",
   "This is the plural of نَفْس, 'soul'. It carries al- and a dammah because it is the subject of the verse.",
   ik("81:7", "(And when the souls are joined with their mates.) meaning, every type (of soul) will be gathered with its peer (or mate).")],
  ["the baby girl buried alive", 8, "A victim from the days of ignorance is brought forward and asked a question.", "A child pushed into the ground and left there.",
   "Passive noun on the مَفْعُولَة pattern, nominative", "اسم مفعول على وزن مفعولة مرفوع",
   "The word is built on مَفْعُولَة from the root و-أ-د, to bury, so the word itself means 'the one who has been buried alive'.",
   ik("81:8", "Al-Maw'udah is the female infant that the people of the pre-Islamic time of ignorance would bury in the dirt due to their hatred of girls.")],
  ["sin / fault", 9, "The question asked is: for what fault was she killed?", "Something wrong a person is blamed for.",
   "Indefinite noun, genitive with tanween kasr", "اسم نكرة مجرور بتنوين الكسر",
   "The kasra-tanween shows the word is governed by the preposition in 'for what sin', marking the genitive case.",
   itani(35, "For what crime was she killed?")],
  ["records / pages", 10, "The written pages holding each person's deeds are brought out.", "Sheets of paper rolled out flat.",
   "Plural noun, nominative with al-", "اسم جمع مرفوع ومعروف بأل",
   "This is the plural of صَحِيفَة, a written sheet, and it is the subject of the verse, so it carries a dammah.",
   itani(37, "And when the records of deeds are opened wide.")],
  ["opened / spread out", 10, "Those records are unrolled and spread out where all can see them.", "Spreading a cloth out flat.",
   "Perfect verb, third person feminine singular, passive", "فعل ماض مبني للمجهول للمفرد المؤنث",
   "The passive means the pages are spread out by someone else; the final ت agrees with the feminine subject 'records'.",
   itani(37, "And when the records of deeds are opened wide.")],
  ["stripped away", 11, "The sky that covered the earth is peeled back like a skin.", "Taking a covering off by force.",
   "Perfect verb, third person feminine singular, passive", "فعل ماض مبني للمجهول للمفرد المؤنث",
   "This is the passive of 'to scrape or peel off', so the sky is something peeled away from above the people.",
   itani(39, "And when the sky is stripped away.")],
  ["Paradise", 13, "While Hell is kindled, Paradise is brought right up close to its people.", "A walled garden of shelter.",
   "Noun, nominative with al-", "اسم مرفوع ومعروف بأل",
   "The word is the subject of 'brought near' and carries a dammah; its root ج-ن-ن (to cover) gives the picture of a protected garden.",
   ik("81:13", "(And when Paradise is brought near.) ... \"This means it will be brought near to its inhabitants.\"")],
  ["brought forward", 14, "At last the answer comes: every soul will know what it has produced.", "Presenting something you have saved up.",
   "Perfect verb, Form IV, third person feminine singular", "فعل ماض رباعي للغائب المفرد المؤنث",
   "The Form IV pattern points to what a person has produced and presented, which is why the verse names a soul knowing it.",
   itani(45, "Then each soul will clearly know what it has brought along.")],
  ["noble", 19, "The one who carries this Word is described as noble and honoured.", "Generous in character and rank.",
   "Adjective, indefinite genitive (tanween kasr)", "صفة نكرة مجرورة بالتنوين",
   "The adjective repeats the case ending of the noun before it, which is the sign in Arabic that it is describing that word.",
   ik("81:19", "(Verily, this is the Word of a most honorable messenger.) meaning, indeed this Qur'an is being conveyed by a noble messenger ... and he is Jibril.")],
  ["trustworthy", 21, "The messenger carrying the revelation can be trusted with it completely.", "Someone you can safely leave a secret with.",
   "Adjective, indefinite genitive (tanween kasr)", "صفة نكرة مجرورة بالتنوين",
   "It continues the same genitive chain as 'noble', adding a second quality to the same messenger.",
   ik("81:21", "(trustworthy.) This is a description of Jibril as being trustworthy.")],
  ["rejected / cast away", 25, "The Qur'an is not the speech of a devil driven out from mercy.", "Shouted at and pushed far away.",
   "Intensive adjective, indefinite genitive", "صفة مبالغة مجرورة بالتنوين",
   "The فَعِيل pattern here carries an intensive sense from the root ر-ج-م, to stone or curse, so the devil is one permanently driven off.",
   itani(67, "And this is not the word of a rejected devil.")],
  ["to go straight / be upright", 28, "The choice offered is to take the straight way back to Allah.", "Asking to be set on a straight road.",
   "Imperfect verb, Form X, jussive", "فعل مضارع للاستفعال مجزوم",
   "The pattern يَسْتَفْعِل expresses seeking, so the verb means 'to seek to be straight'. It carries no vowel sign because the word before it puts it in the jussive.",
   ik("81:28", "(To whomsoever among you who wills to walk straight.) meaning, whoever seeks guidance, then he must adhere to this Qur'an")],
];

// Resolve exact Arabic for each row, in verse order.
const ARABIC = V.map((row) => row[0] === "souls" ? SOULS : row[0] === "Paradise" ? JANNAH : A(row[0]));
const M = V.map((r) => r[0]);
ARABIC.forEach((a, i) => { if (!a) throw new Error("unresolved arabic for meaning: " + M[i]); });

// --- practice: generated from the resolved vocabulary so pairings cannot drift ---
// [index, kind, answerPos, 3 distractor indices]
const PD = [
  [0, "ar2en", 2, [11, 9, 7]], [1, "ar2en", 0, [2, 5, 3]], [2, "ar2en", 3, [9, 4, 6]],
  [3, "ar2en", 1, [8, 10, 12]], [4, "ar2en", 2, [2, 1, 15]], [5, "ar2en", 2, [12, 7, 14]],
  [6, "ar2en", 1, [13, 15, 1]], [7, "ar2en", 3, [10, 4, 2]], [8, "en2ar", 0, [9, 7, 1]],
  [9, "ar2en", 0, [1, 13, 6]], [10, "ar2en", 1, [14, 5, 12]], [11, "en2ar", 2, [8, 13, 15]],
  [12, "en2ar", 1, [13, 14, 0]], [13, "en2ar", 2, [12, 14, 4]], [14, "en2ar", 0, [12, 13, 6]],
  [15, "en2ar", 1, [13, 14, 3]],
];
const PRACTICE = PD.map(([i, kind, pos, dis]) => {
  const distractors = kind === "ar2en" ? dis.map((d) => M[d]) : dis.map((d) => ARABIC[d]);
  const options = [...distractors];
  options.splice(pos, 0, kind === "ar2en" ? M[i] : ARABIC[i]);
  if (new Set(options).size !== 4) throw new Error("duplicate practice options at card " + i);
  return {
    type: kind,
    q: kind === "ar2en" ? `What does ${ARABIC[i]} mean?` : `Which word means '${M[i]}'?`,
    options, answer: pos,
    explanation: kind === "ar2en"
      ? `${ARABIC[i]} means '${M[i]}' — ${V[i][2]}`
      : `${ARABIC[i]} means '${M[i]}' — ${V[i][2]}`,
  };
});

// --- English Meaning Bank (Itani teen reference) ---
const B = (b, m) => ({ b, m });
const T = (t) => ({ t });
const EN = [
  [T("When the sun is "), B(M[0], ARABIC[0]), T(" in darkness.")],
  [T("And when the stars "), B(M[1], ARABIC[1]), T(", losing their light.")],
  [T("And when the mountains are "), B(M[2], ARABIC[2]), T(".")],
  [T("And when the camels, ready to give birth, are left alone.")],
  [T("And when wild animals are gathered together.")],
  [T("And when the seas are "), B(M[3], ARABIC[3]), T(".")],
  [T("And when "), B(M[4], ARABIC[4]), T(" are joined with their deeds.")],
  [T("And when "), B(M[5], ARABIC[5]), T(" is asked.")],
  [T("For what "), B(M[6], ARABIC[6]), T(" was she killed?")],
  [T("And when the "), B(M[7], ARABIC[7]), T(" of deeds are "), B(M[8], ARABIC[8]), T(" wide.")],
  [T("And when the sky is "), B(M[9], ARABIC[9]), T(".")],
  [T("And when Hellfire is set blazing fiercely.")],
  [T("And when "), B(M[10], ARABIC[10]), T(" is brought near.")],
  [T("Then each soul will clearly know what it has "), B(M[11], ARABIC[11]), T(".")],
  [T("I swear by the stars that hide away.")],
  [T("Those that move swiftly and disappear.")],
  [T("And by the night as it gently fades.")],
  [T("And by the morning as it softly breathes.")],
  [T("Truly, this is the word brought by a "), B(M[12], ARABIC[12]), T(" messenger.")],
  [T("Who has great strength, honored by the Lord of the Throne.")],
  [T("Obeyed there, and completely "), B(M[13], ARABIC[13]), T(".")],
  [T("And your companion is not crazy.")],
  [T("He certainly saw him on the clear horizon.")],
  [T("And he is not stingy about sharing the unseen.")],
  [T("And this is not the word of a "), B(M[14], ARABIC[14]), T(" devil.")],
  [T("So where are you going?")],
  [T("This is only a reminder for all people.")],
  [T("For whoever among you wishes "), B(M[15], ARABIC[15]), T(".")],
  [T("But you cannot wish it, unless Allah, the Lord of all worlds, wills it.")],
];

// --- assemble vocabulary ---
s.vocabulary = V.map((row, i) => ({
  arabic: ARABIC[i], meaning: row[0], connection: row[2], hint: row[3],
  source: { primary: "Qur'anic Arabic Corpus", ref: `At-Takwir 81:${row[1]} word-by-word morphology`, checkedAt: DATE },
  verified: row[7],
  grammar: { english: row[4], arabic: row[5], explanation: row[6] },
}));

s.introVerified = {
  status: "verified", by: "tafsir Ibn Kathir",
  note: "Summary of 81:1-29 checked against Tafsir Ibn Kathir. On the opening sign: 'At-Takwir means to gather one part of something with another part of it (i.e., folding)... Then it will be rolled up and thrown away. When this is done to it, its light will go away.' On the infant: 'Al-Maw'udah is the female infant that the people of the pre-Islamic time of ignorance would bury in the dirt due to their hatred of girls' and 'This will be a means of frightening her murderer.' On the two ends: 'Removing the Heavens, kindling Hellfire, and Paradise being brought near' and '(And when Paradise is brought near.) ... it will be brought near to its inhabitants.' On the messenger: 'this Qur'an is being conveyed by a noble messenger, which is referring to an honorable angel... and he is Jibril' and '(trustworthy.) This is a description of Jibril as being trustworthy.' On the ending: '(To whomsoever among you who wills to walk straight.) meaning, whoever seeks guidance, then he must adhere to this Qur'an'. The intro's description of the delayed answer at verse 14 is a structural reading of the passage, not a quotation.",
  checkedAt: DATE,
};

s.practice = PRACTICE;

// blank the two new vocabulary words in the Arabic bank
[[7, 1], [13, 1]].forEach(([n]) => {
  const ayah = s.fillBlanks.ayahs.find((a) => a.n === n);
  const text = ayah.segments.map((x) => x.t ?? x.b ?? "").join("").trim();
  const parts = text.split(/\s+/);
  const wordIdx = n === 7 ? 1 : 1;
  const before = parts.slice(0, wordIdx).join(" ") + " ";
  const after = " " + parts.slice(wordIdx + 1).join(" ");
  const meaning = n === 7 ? M[4] : M[10];
  const arabic = n === 7 ? SOULS : JANNAH;
  ayah.segments = [T(before), B(arabic, meaning), T(after)];
});

s.fillBlanksEn = { ayahs: EN.map((segments, i) => ({ n: i + 1, segments })) };

// --- quiz ---
const C_ = (cat, q, o, a, e, v, area) => ({
  category: cat, ...(area ? { rhetoricArea: area } : {}), q, options: o, answer: a, explanation: e, verified: v,
});
const VI = (i, o, a, e, v) => C_("Vocabulary", `What does ${ARABIC[i]} mean?`,
  (() => { const arr = [...o]; arr.splice(a, 0, M[i]); return arr; })(), a, e, v);

const QUIZ = [
  VI(0, ["scattered / dimmed", "moved away", "brought forward"], 2, "It means folded up and darkened — the sun's light is rolled away.", ik("81:1", "(When the sun is Kuwwirat.) \"This means it will be darkened.\"")),
  VI(1, ["moved away", "stripped away", "set boiling / made to blaze"], 0, "It describes the stars falling and losing their light.", itani(21, "And when the stars fall, losing their light.")),
  VI(2, ["stripped away", "opened / spread out", "wrapped up / darkened"], 3, "It means the mountains are carried off and gone.", itani(23, "And when the mountains are moved away.")),
  VI(3, ["made calm and quiet again", "poured out in heavy rain", "carried off into the sky"], 1, "It is the seas made to blaze — an intensive passive, heated again and again.", itani(29, "And when the seas burst into flames.")),
  VI(4, ["records / pages", "markets of the world", "the heavens above"], 2, "It is the plural of نَفْس, 'soul' — here every soul is matched with its like.", ik("81:7", "(And when the souls are joined with their mates.) meaning, every type (of soul) will be gathered with its peer (or mate).")),
  VI(5, ["the old woman of the tribe", "the scribe who writes the scroll", "the traveller far from home"], 2, "It is the infant girl buried alive in the days of ignorance.", ik("81:8", "Al-Maw'udah is the female infant that the people of the pre-Islamic time of ignorance would bury in the dirt")),
  VI(6, ["a debt of money", "a long road", "a tribe of people"], 1, "It means a sin or fault — the question put to the murdered child.", itani(35, "For what crime was she killed?")),
  VI(7, ["the heavens above", "the graves below", "the angels of mercy"], 3, "It is the plural of صَحِيفَة, a written sheet: the records of deeds.", itani(37, "And when the records of deeds are opened wide.")),
  VI(8, ["folded up tightly again", "filled up to the brim", "held back for later use"], 0, "It is what happens to the records: unrolled and spread out where all can see.", itani(37, "And when the records of deeds are opened wide.")),
  VI(9, ["set boiling", "moved away", "made to blaze"], 1, "It means the sky is peeled away from above the people.", itani(39, "And when the sky is stripped away.")),
  VI(10, ["the plain", "the balance", "the horizon"], 0, "It is Paradise, brought near to its inhabitants.", ik("81:13", "(And when Paradise is brought near.)")),
  VI(11, ["carried away", "sent back", "written down"], 2, "It is what each soul will find it has produced and presented.", itani(45, "Then each soul will clearly know what it has brought along.")),

  C_("Comprehension", "What opens the first fourteen verses of the surah?",
    ["A long list of trade rules", "A debate with the idolaters", "A description of Paradise", "A series of 'And when' events"], 3,
      "Verses 1-14 are a chain of events each introduced with 'And when', and only verse 14 tells what all of them lead to.",
      ik("81:1-14", "Removing the Heavens, kindling Hellfire, and Paradise being brought near")),
  C_("Comprehension", "Why is the baby girl buried alive mentioned among these signs?",
    ["To show girls are stronger", "To frighten the one who killed her", "To count the girls of that age", "Because she asked to be saved"], 1,
      "Ibn Kathir explains that the victim being questioned is 'a means of frightening her murderer' — if the wronged one is asked, the wrongdoer has far more to fear.",
      ik("81:8", "This will be a means of frightening her murderer.")),
  C_("Comprehension", "What will each soul come to know, verse 14?",
    ["What it has brought forward", "When the next day begins", "Who its true family were", "How long it will stay"], 0,
      "After thirteen 'And when' clauses the answer arrives: every soul will know what it has produced and presented.",
      itani(45, "Then each soul will clearly know what it has brought along.")),
  C_("Comprehension", "Whom does Ibn Kathir identify as the 'noble messenger' of verse 19?",
    ["Every prophet sent before", "The scribe who writes deeds", "The angel Jibril", "The believer who conveys it"], 2,
      "Ibn Kathir states that the noble messenger here is the honourable angel Jibril, who conveyed the Qur'an to the Prophet ﷺ.",
      ik("81:19", "which is referring to an honorable angel, who has good character and a radiant appearance, and he is Jibril.")),
  C_("Comprehension", "What does Allah swear by in verses 15-18?",
    ["The sun and the moon", "Stars that hide, night and morning", "The sea and the mountain", "The Ka'bah and the day"], 1,
      "The oath is by al-Khunnas — the stars that withdraw by day and sweep the sky at night — then by the night and by the morning.",
      ik("81:15-18", "These are the stars that withdraw (disappear) during the day and sweep across the sky (appear) at night.")),
  C_("Comprehension", "What did the Prophet ﷺ see on the clear horizon, verse 23?",
    ["The written sheets opened wide", "The sea turned into fire", "Paradise brought near", "Jibril in his own form"], 3,
      "Ibn Kathir explains that Muhammad ﷺ saw Jibril, who brought him the Message, in the form Allah created him in.",
      ik("81:23", "meaning, indeed Muhammad ? saw Jibril, who brought him the Message from Allah, in the form that Allah created him in")),
  C_("Comprehension", "What does verse 27 say the Qur'an is?",
    ["A reminder for all people", "A letter for one city", "A song for the night", "A tax for the poor"], 0,
      "Ibn Kathir glosses it as 'a reminder for all of mankind. They are reminded by it and receive admonition from it.'",
      ik("81:27", "meaning, this Qur'an is a reminder for all of mankind.")),

  C_("Critical Thinking", "Why is the baby girl buried alive named instead of any other victim?",
    ["Because infanticide was common then", "To show how grave their sin was", "Because she will enter Paradise", "To explain how children are judged"], 1,
      "Choosing the most defenceless victim shows how serious their crime was: if she is questioned, the powerful wrongdoer has far more to answer for.",
      ik("81:8", "For verily, if the one who was wronged is questioned, what does the wrongdoer")),
  C_("Critical Thinking", "The surah moves from cosmic signs to 'your companion is not crazy'. What does that order do?",
    ["It proves trade must stop", "It shows the stars are angels", "It turns awe into trust", "It lists the days of judgment"], 2,
      "After the hearer is shaken by the signs of verses 1-14, the surah settles the question of the messenger's honesty — awe is turned into confidence in what he brings.",
      ik("81:22", "Jibril descended with the Qur'an and it is not the Result of Insanity")),
  C_("Critical Thinking", "Verse 28 offers the straight way and verse 29 says you cannot wish it unless Allah wills. How do they fit?",
    ["Choice and Allah's will both appear", "Choice is only an illusion", "Allah wills nothing for anyone", "Wishing is forbidden in Islam"], 0,
      "The surah teaches both at once: a person genuinely wills and chooses the straight path, and even that is within Allah's will — so gratitude replaces pride.",
      ik("81:28-29", "Abu Jahl said, \"The matter is up to us. If we wish, we will stand straight")),
  C_("Critical Thinking", "Why is it reassuring that the records are opened wide in verse 10?",
    ["Because records are always lost", "Because nothing is ever written", "Because angels will erase them", "Because the truth will be clear"], 3,
      "What was hidden will be laid open, so the person who was wronged — like the buried infant of verse 8 — finally sees the truth stated plainly.",
      itani(37, "And when the records of deeds are opened wide.")),
  C_("Critical Thinking", "What does the surah leave its listener doing at the end?",
    ["To fear the stars above them", "To take the straight path", "To wait before deciding", "To trade honestly in the market"], 1,
      "It closes by putting the choice in front of every hearer: whoever wills may take the upright road back to his Lord.",
      ik("81:28", "meaning, whoever seeks guidance, then he must adhere to this Qur'an, for verily it is his salvation and guidance.")),

  C_("Rhetoric", "Why is the first word of the surah rendered 'wrapped up / darkened' rather than simply 'turned off'?",
    ["Because the root picture is folding", "Because darkness is not mentioned", "Because the sun will return", "Because it means to rise"], 0,
      "Ibn Kathir explains at-Takwir as gathering one part of a thing into another, like folding a turban, so the translation keeps the folding picture and its result, darkness.",
      ik("81:1", "At-Takwir means to gather one part of something with another part of it (i.e., folding)."), "Meaning Construction"),
  C_("Rhetoric", "Ibn Kathir explains the word in verse 7 as every type of soul gathered with its peer. Why keep the teen word 'souls' plain?",
    ["Because the pairing is not important", "Because souls means only people", "Because the verse is about trade", "Because it is a word they know"], 3,
      "The meaning is rich — each soul matched with its like — but a child holds the plain word 'souls' at once and can carry the fuller idea from there.",
      ik("81:7", "meaning, every type (of soul) will be gathered with its peer (or mate)."), "Meaning Construction"),
  C_("Rhetoric", "Why are thirteen 'And when' clauses held back before verse 14 gives the answer?",
    ["To lengthen the passage without need", "So the listener waits for the point", "Because the events are not certain", "To hide the Day from the hearers"], 1,
      "The hearer is held through sign after sign until verse 14 lands: every soul will know what it brought forward. The delay makes the conclusion feel inevitable.",
      ik("81:12-14", "(And when Paradise is brought near.)"), "Nazm"),
  C_("Rhetoric", "The oath by the hiding stars, the night and the morning comes straight after verse 14. What does that placement do?",
    ["It repeats the first fourteen verses", "It changes the topic to astronomy", "It answers doubt with a solemn oath", "It ends the surah too early"], 2,
      "Having proved the Day, the surah now swears by things that vanish and return — stars, night, dawn — that what follows about the message is certain.",
      ik("81:15", "But nay! I swear by Al-Khunnas, Al-Jawar Al-Kunnas"), "Nazm"),
  C_("Rhetoric", "Verse 26 asks 'So where are you going?' What does that short question do?",
    ["It turns them to face the choice", "It shows the route is unclear", "It asks for travel advice", "It ends the surah abruptly"], 0,
      "Ibn Kathir explains it as 'where has your reason gone, in rejecting this Qur'an' — the question stops the listener and makes them account for their own turning away.",
      ik("81:26", "(Then where are you going) meaning, where has your reason gone, in rejecting this Qur'an"), "Style of Address"),
  C_("Rhetoric", "Why close the surah by saying you cannot wish it unless Allah wills?",
    ["Because no one is allowed to choose", "Because the straight path has two ends", "Because the surah had to end somewhere", "It keeps pride out of the choice"], 3,
      "Ibn Kathir records that a denier said the matter was up to them, so this verse answers: the will to walk straight is itself a gift, which removes self-reliance from the good choice.",
      ik("81:29", "Abu Jahl said, \"The matter is up to us. If we wish, we will stand straight"), "Style of Address"),
];

s.quiz = QUIZ;

// --- self-checks: never write a broken file ---
const spread = [0, 0, 0, 0];
s.quiz.forEach((q) => spread[q.answer]++);
if (spread.join(",") !== "8,8,7,7") throw new Error("answer spread " + spread.join(","));
const want = [...Array(12).fill("Vocabulary"), ...Array(7).fill("Comprehension"), ...Array(5).fill("Critical Thinking"), ...Array(6).fill("Rhetoric")].join(",");
if (s.quiz.map((q) => q.category).join(",") !== want) throw new Error("quiz order wrong");
const areas = {};
s.quiz.filter((q) => q.category === "Rhetoric").forEach((q) => { areas[q.rhetoricArea] = (areas[q.rhetoricArea] || 0) + 1; });
if (JSON.stringify(areas) !== JSON.stringify({ "Meaning Construction": 2, Nazm: 2, "Style of Address": 2 })) throw new Error("rhetoric areas " + JSON.stringify(areas));
const arBank = s.fillBlanks.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
const enBank = s.fillBlanksEn.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
const sj = (a) => [...a].sort().join("|");
if (sj(arBank) !== sj(ARABIC)) throw new Error("arabic bank mismatch " + JSON.stringify({ got: arBank, want: ARABIC }));
if (sj(enBank) !== sj(M)) throw new Error("english bank mismatch " + JSON.stringify({ got: enBank, want: M }));
if (s.fillBlanksEn.ayahs.length !== 29) throw new Error("en ayah count " + s.fillBlanksEn.ayahs.length);
if (s.practice.length !== 16 || s.vocabulary.length !== 16) throw new Error("counts " + s.practice.length + "/" + s.vocabulary.length);
s.vocabulary.forEach((v) => {
  if (!/81:\d+/.test(v.source.ref)) throw new Error("bad source.ref " + v.source.ref);
  const ok = s.practice.some((p) => (p.q.includes(v.arabic) && p.options[p.answer] === v.meaning) || (p.q.includes(v.meaning) && p.options[p.answer] === v.arabic));
  if (!ok) throw new Error("practice does not cover " + v.arabic);
});
const covered = new Set();
s.quiz.filter((q) => q.category === "Vocabulary").forEach((q) => s.vocabulary.forEach((v) => { if (q.q.includes(v.arabic)) covered.add(v.arabic); }));
if (covered.size < 12) throw new Error("vocab quiz coverage only " + covered.size);

fs.writeFileSync(FILE, `// Surah 81 \u00b7 At-Takwir\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("written; vocab:", s.vocabulary.length, "practice:", s.practice.length, "quiz:", s.quiz.length, "spread:", spread.join(","));
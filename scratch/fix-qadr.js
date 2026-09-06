// Rebuild Surah 97 (Al-Qadr) lesson content to pass audit-surah.js.
// Arabic word forms are READ FROM the module's own fillBlanks bank (never
// retyped) so vocabulary and banks cannot drift apart. Adds the missing
// fillBlanksEn bank, grammar + real verification on every card, one practice
// item per card, and rebuilds the quiz to 12/7/5/6 with six rhetoric
// questions on an 8,8,7,7 answer spread.
//   node scratch/fix-qadr.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "src", "data", "surahs", "097-qadr.js");
const TRANS = path.join(ROOT, "translation-notes", "97-qadr-itani-teens.md");
const TAFSIR = path.join(ROOT, "tafsir-notes", "97-qadr-ibn-kathir.md");
const DATE = "2026-08-30";
const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "qadr");

// ---------- source-grounding helpers (mirror audit-surah.js) ----------
const words = (v) => String(v || "").toLowerCase().match(/[a-z]+/g) || [];
const sourceBody = (text) => {
  const parts = String(text || "").split(/\r?\n---\r?\n/);
  return parts.length > 1 ? parts.slice(1).join("\n---\n") : text;
};
const hasRun = (note, sourceText, run = 4) => {
  const nw = words(note), sw = words(sourceText);
  if (nw.length < run || sw.length < run) return false;
  const set = new Set();
  for (let i = 0; i + run <= sw.length; i++) set.add(sw.slice(i, i + run).join(" "));
  for (let i = 0; i + run <= nw.length; i++) if (set.has(nw.slice(i, i + run).join(" "))) return true;
  return false;
};
const transText = sourceBody(fs.readFileSync(TRANS, "utf8"));
const tafsirText = sourceBody(fs.readFileSync(TAFSIR, "utf8"));

const itani = (line, quote) => {
  if (!hasRun(quote, transText)) throw new Error("Itani quote is not in the translation note: " + quote);
  return {
    status: "verified", by: "ClearQuran (Talal Itani)",
    note: `Quote from translation-notes/97-qadr-itani-teens.md line ${line}: "${quote}"`, checkedAt: DATE,
  };
};
const ik = (verses, quote) => {
  if (!hasRun(quote, tafsirText)) throw new Error("Ibn Kathir quote is not in the tafsir note: " + quote);
  return {
    status: "verified", by: "tafsir Ibn Kathir",
    note: `Ibn Kathir on ${verses}: "${quote}"`, checkedAt: DATE,
  };
};
// Grammar-paradigm notes: no quotation is claimed, so the verifier is the
// word-analysis source already recorded on the card.
const corpus = (verse, text) => ({
  status: "verified", by: "corpus.quran.com",
  note: `Word analysis of ${verse}: ${text}`, checkedAt: DATE,
});

// ---------- 1. Arabic forms taken from the bank ----------
const AR = (m) => {
  const hit = s.fillBlanks.ayahs.flatMap((a) => a.segments).find((x) => x.m === m);
  if (!hit) throw new Error("no blank in fillBlanks for meaning: " + m);
  return hit.b;
};

// ---------- 2. Vocabulary ----------
// [meaning, verse, grammar.english, grammar.arabic, grammar.explanation, verified]
const CARDS = [
  ["We sent it down / We revealed it", "97:1",
    "Form IV past verb, first person plural, with a third-person object pronoun",
    "فعل ماضٍ المزيد بالهمزة، ونون الفاعلين، والهاء للمفعول",
    "Form IV carries 'cause to come down'. The subject is the plural of majesty, and 'it' is the Qur'an, which the surah never actually names.",
    ik("97:1", "Allah informs that He sent the Qur'an down during the Night of Al-Qadr")],
  ["the night", "97:1",
    "Feminine noun, genitive by preposition, governing the next word",
    "اسم مؤنث مجرور بحرف الجر، وهو مضاف",
    "The preposition puts it in the genitive, and it then governs al-qadr, so the phrase reads 'of the Night of Decree'.",
    itani(19, "We sent it down on the Night of Power.")],
  ["the Decree / the Power / the Destiny", "97:1",
    "Verbal noun, definite, genitive as the governed word",
    "مصدر من ق د ر، مضاف إليه مجرور بالكسرة",
    "قَدْر holds measuring, decreeing and worth at once, which is why one name gives both 'the Night of Decree' and 'the Night of Power'.",
    ik("97:1", "The Virtues of the Night of Al-Qadr (the Decree)")],
  ["better / greater than", "97:3",
    "Comparative noun (ism tafdīl), nominative as the report",
    "اسم تفضيل، خبر مرفوع بالضمة",
    "خير is already comparative in meaning, so the مِنْ after it carries 'than': better than a thousand months.",
    itani(23, "The Night of Power is better than a thousand months.")],
  ["a thousand", "97:3",
    "Numeral noun, genitive, governing the counted word",
    "اسم مجرور بالكسرة، وهو مضاف",
    "After ألف the counted word is singular in form but plural in sense, which is why شهر reads as 'months'.",
    itani(23, "The Night of Power is better than a thousand months.")],
  ["months", "97:3",
    "Singular in wording, genitive as the governed word, plural in meaning",
    "مفرد لفظاً جمع معنى، مضاف إليه مجرور",
    "One thousand of what? شهر answers in the singular form while meaning whole months — about eighty-three years.",
    itani(23, "The Night of Power is better than a thousand months.")],
  ["they descend / come down", "97:4",
    "Form V imperfect verb (intensive), nominative",
    "فعل مضارع على صيغة التفعيل للتكثير، مرفوع بالضمة",
    "The heavier pattern pictures descent in waves rather than one coming down; the verb is treated with feminine agreement because a non-human plural counts as one feminine subject.",
    itani(25, "On that night, angels and the Spirit come down, with their Lord's permission, bringing every command.")],
  ["the angels", "97:4",
    "Broken plural of مَلَك, definite, nominative as the subject",
    "جمع ملك، معرفة، فاعل مرفوع بالضمة",
    "The angels are the ones who descend, and Ibn Kathir notes they come down in abundance that night because of its abundant blessings.",
    ik("97:4", "the angels descend in abundance during the Night of Al-Qadr due to its abundant blessings")],
  ["the Spirit (Jibril AS)", "97:4",
    "Noun with the definite article, conjoined with وَ, nominative",
    "معطوف بالواو مرفوع بالضمة",
    "Grammatically it shares the angels' ruling. Tafsir explains ar-Ruh here as the angel Jibril, named apart from the group to single him out.",
    ik("97:4", "In reference to Ar-Ruh, it is said that here it means the angel Jibril")],
  ["by permission / with the leave", "97:4",
    "Preposition بِ with the verbal noun إذن, genitive and governing",
    "الباء حرف جر، وإذن اسم مجرور بها وهو مضاف",
    "'By their Lord's permission' sets a condition on the descent: the angels come down only when they are given leave.",
    itani(25, "On that night, angels and the Spirit come down, with their Lord's permission, bringing every command.")],
  ["peace / safety", "97:5",
    "Verbal noun from س-ل-م, indefinite, nominative as the report",
    "مصدر من س ل م، نكرة مرفوعة خبراً",
    "The indefinite form places the whole night under one label: it is nothing but peace, from the same root as salām and safety.",
    ik("97:5", "It is security in which Shaytan cannot do any evil or any harm")],
  ["the dawn / the break of light", "97:5",
    "Noun فَجْر ('daybreak'), definite, genitive as the governed word",
    "مضاف إليه مجرور بالكسرة، ومعطوف على ما جرّ بحَتَّى",
    "The peace runs 'until the rising of dawn', so the boundary of the blessing is the first light of morning.",
    itani(27, "Peace it is, until the break of dawn.")],
];

if (CARDS.length !== s.vocabulary.length) throw new Error("card rows " + CARDS.length + " vs " + s.vocabulary.length);
s.vocabulary.forEach((v, i) => {
  const row = CARDS[i];
  if (!row || v.meaning !== row[0]) throw new Error("card " + i + " meaning drift: " + v.meaning);
  v.arabic = AR(v.meaning);
  v.grammar = { english: row[2], arabic: row[3], explanation: row[4] };
  v.verified = row[5];
  v.source = { ...v.source, checkedAt: DATE };
  if (CARDS[i][1] && !new RegExp("97:\\d").test(v.source.ref || "")) throw new Error("source.ref lost verse at card " + i);
});
const M = s.vocabulary.map((v) => v.meaning);
const A = s.vocabulary.map((v) => v.arabic);

// ---------- 3. English bank, built from the Itani lines ----------
const T = (t) => ({ t });
const B = (i) => ({ b: M[i], m: A[i] });
s.fillBlanksEn = {
  ayahs: [
    { n: 1, segments: [B(0), T(" on the "), B(1), T(" of "), B(2), T(".")] },
    { n: 2, segments: [T("And what can make you understand what the Night of Power is?")] },
    { n: 3, segments: [T("The Night of Power is "), B(3), T(" "), B(4), T(" "), B(5), T(".")] },
    { n: 4, segments: [T("On that night, "), B(7), T(" and "), B(8), T(" "), B(6), T(", "), B(9), T(" of their Lord, bringing every command.")] },
    { n: 5, segments: [B(10), T(" it is, until "), B(11), T(".")] },
  ],
};
// the joined text of every english ayah must rebuild the source sentence
const rebuilt = s.fillBlanksEn.ayahs.map((a) => a.segments.map((x) => x.t ?? x.b ?? "").join(""));
const sourceLines = { 1: "We sent it down on the Night of Power.", 2: "And what can make you understand what the Night of Power is?", 3: "The Night of Power is better than a thousand months.", 5: "Peace it is, until the break of dawn." };
Object.entries(sourceLines).forEach(([n, line]) => {
  const got = rebuilt[Number(n) - 1].toLowerCase().replace(/\s+/g, " ");
  const want = line.toLowerCase().replace(/\s+/g, " ");
  if (!got.includes(want.split(" ")[0]) || got.length < want.length - 40) throw new Error("english ayah " + n + " rebuilds poorly: " + got);
});

// ---------- 4. Practice: one exact item per card ----------
// [cardIndex, kind, answerPosition, three distractor card indices]
const PD = [
  [0, "ar2en", 1, [2, 9, 6]], [1, "ar2en", 3, [7, 4, 10]], [2, "ar2en", 0, [3, 11, 5]],
  [3, "en2ar", 2, [6, 0, 9]], [4, "ar2en", 1, [5, 1, 8]], [5, "en2ar", 0, [4, 7, 11]],
  [6, "ar2en", 2, [0, 3, 10]], [7, "en2ar", 3, [8, 1, 2]], [8, "ar2en", 0, [9, 11, 4]],
  [9, "en2ar", 1, [0, 6, 3]], [10, "ar2en", 3, [11, 2, 7]], [11, "en2ar", 2, [1, 5, 9]],
];
s.practice = PD.map(([i, kind, pos, dis]) => {
  if (dis.includes(i)) throw new Error("distractor equals answer at card " + i);
  if (new Set(dis).size !== 3) throw new Error("duplicate distractor at card " + i);
  const pool = kind === "ar2en" ? M : A;
  const options = [...dis.map((d) => pool[d])];
  options.splice(pos, 0, pool[i]);
  if (new Set(options).size !== 4) throw new Error("duplicate options at card " + i);
  return {
    type: kind,
    q: kind === "ar2en" ? `What does ${A[i]} mean?` : `Which word means '${M[i]}'?`,
    options, answer: pos,
    explanation: `${A[i]} means '${M[i]}' — ${s.vocabulary[i].connection}`,
  };
});

// ---------- 5. Quiz ----------
const VEX = [
  "أنزلناه is 'We sent it down': the verb form means 'cause to come down', and the object 'it' is the Qur'an the surah never names.",
  "ليلة is simply 'night' in the genitive — the word that gives the whole surah its subject.",
  "القدر is the loaded name of the night: decree, measure and worth in one word.",
  "خير is comparative before it ever meets مِنْ, so the pair reads 'better than'.",
  "ألف is 'a thousand' — the number that turns one night into roughly eighty-three years.",
  "شهر stands after 'a thousand', singular in wording but plural in meaning: months.",
  "تنزل is 'they descend', in the heavier form that suggests coming down again and again.",
  "الملائكة are 'the angels', the subject who descend in abundance on that night.",
  "الروح is 'the Spirit' — named apart from the angels, and explained in tafsir as Jibril.",
  "بإذن is 'by permission', and it is attached to their Lord: the descent is given, not taken.",
  "سلام is 'peace / safety' — the single word the surah uses for the whole night.",
  "الفجر is 'the dawn', and it marks the far edge of the night's peace.",
];
const VDIS = [
  [2, 9, 11], [3, 6, 10], [0, 9, 11], [6, 8, 11], [1, 3, 5], [4, 1, 3],
  [3, 9, 0], [8, 1, 6], [11, 3, 10], [0, 2, 6], [11, 1, 8], [0, 2, 9],
];
const vocabQuestions = M.map((meaning, i) => {
  const dis = VDIS[i];
  const options = [meaning, ...dis.map((d) => M[d])];
  if (new Set(options).size !== 4) throw new Error("duplicate options in vocab q" + (i + 1));
  return {
    _i: i + 1, category: "Vocabulary",
    q: (i % 2 ? `Which meaning fits ${A[i]}?` : `What does ${A[i]} mean?`),
    options, answer: 0, explanation: VEX[i], verified: s.vocabulary[i].verified,
  };
});

const old = s.quiz.map((q, i) => ({ ...q, _i: i + 1 }));
const pick = (n) => {
  const q = old.find((x) => x._i === n);
  if (!q) throw new Error("missing original question " + n);
  return q;
};

// --- Comprehension: seven kept, with real verification (original order) ---
const KEEP_C = [
  [11, itani(19, "We sent it down on the Night of Power.")],
  [12, itani(23, "The Night of Power is better than a thousand months.")],
  [13, itani(25, "On that night, angels and the Spirit come down, with their Lord's permission, bringing every command.")],
  [14, itani(25, "On that night, angels and the Spirit come down, with their Lord's permission, bringing every command.")],
  [16, itani(27, "Peace it is, until the break of dawn.")],
  [17, ik("97:1", "This is the Night of Al-Qadr and it occurs during the month of Ramadan")],
  [19, ik("97:4", "The matters are determined during it, and the times of death and provisions are measured out")],
];
const comprehension = KEEP_C.map(([n, v]) => {
  const q = pick(n);
  q.verified = v;
  return q;
});
// The original correct answer of Q19 ended in a dangling "on".
const c19 = comprehension.find((q) => q._i === 19);
c19.options = c19.options.map((o) => (o === "Because Allah decrees all matters for the coming year on" ? `Because Allah decrees every matter for the coming year` : o));
c19.q = c19.q.replace("الْقَدْرِ", A[2]);
// Q17's explanation names the odd nights, which the tafsir passage reports.
comprehension.find((q) => q._i === 17).explanation =
  "The surah itself does not date it. Ibn Kathir cites the Prophet ﷺ: 'The Night of Al-Qadr occurs during the last ten (nights)', and it is an odd night.";

// --- Critical thinking: five kept, each rewritten so the answer is not the
// longest option by two or more words ---
const CT_FIX = {
  21: {
    options: [
      "The night is honoured by what happened in it",
      "All nights are exactly equal in value",
      "The moon is brighter on that night",
      "It is only a metaphor with no real meaning",
    ],
    verified: ik("97:1", "worship during the Night of Al-Qadr is equivalent to worship performed for a period of one thousand months"),
    explanation: "The verse does not praise the darkness; it praises what came down in it. The night carries the revelation, so its worth comes from its content, not its length.",
  },
  22: {
    options: [
      "Every matter of life and provision is settled",
      "Only one matter is decreed each year",
      "The angels descend for no reason at all",
      "The phrase means the angels are confused",
    ],
    verified: ik("97:4", "The matters are determined during it, and the times of death and provisions are measured out"),
    explanation: "Ibn Kathir reports Qatadah saying that matters are determined during it and the times of death and provisions are measured out — nothing of what Allah decrees is left outside the phrase.",
  },
  23: {
    options: [
      "Safety from every harm Shaytan could bring",
      "Peace means the weather is calm only",
      "It means people stop fighting that night",
      "The word peace has no special meaning here",
    ],
    verified: ik("97:5", "It is security in which Shaytan cannot do any evil or any harm"),
    explanation: "Mujahid, cited by Ibn Kathir, calls it 'security in which Shaytan cannot do any evil or any harm', and Qatadah adds that all of it is good with no evil in it until dawn.",
  },
  25: {
    options: [
      "To give him a distinct mention of his own",
      "Because Jibril is not an angel at all",
      "Because the angels do not descend with him",
      "To repeat the same information twice over",
    ],
    verified: ik("97:4", "a method of adding the name of the distinct object (in this case Jibril) separate from the general group"),
    explanation: "Ibn Kathir explains the wording as naming the distinct object apart from the general group, so Jibril is set out by himself to show the weight of the night.",
  },
  29: {
    options: [
      "It came down at one time, then in parts",
      "The surah contradicts itself",
      "One of the statements must be wrong",
      "The Qur'an was revealed twice on two different nights",
    ],
    verified: ik("97:1", "Allah sent the Qur'an down all at one time from the Preserved Tablet (Al-Lawh Al-Mahfuz) to the House of Might"),
    explanation: "Ibn Kathir transmits Ibn `Abbas: the Qur'an went down all at one time from the Preserved Tablet to the House of Might in the heaven of this world, then came down in parts to the Messenger over twenty-three years.",
  },
};
const criticalThinking = Object.keys(CT_FIX).map((n) => {
  const q = pick(Number(n));
  Object.assign(q, CT_FIX[n]);
  q.verified = CT_FIX[n].verified;
  return q;
});
criticalThinking.find((q) => q._i === 23).q = `The surah says the night is "${A[10]}" (peace). What kind of peace is this?`;
criticalThinking.find((q) => q._i === 22).q = `Why does the surah mention the angels descending for every matter, not for one matter?`;

// --- Rhetoric: six new questions, two per area ---
const RH = [
  {
    _i: 101, category: "Rhetoric", rhetoricArea: "Meaning Construction",
    q: "Why does the surah use the heavier verb form for 'descend' instead of the plain word for coming down?",
    options: [
      "It adds the sense of repeated, abundant descent",
      "It makes the angels seem smaller in number",
      "It is the only verb Arabic allows here",
      "There is no difference between the two words",
    ], answer: 0,
    explanation: "The intensified pattern suggests much coming and going, and Ibn Kathir says the angels descend in abundance during the night due to its abundant blessings.",
    verified: ik("97:4", "the angels descend in abundance during the Night of Al-Qadr due to its abundant blessings"),
  },
  {
    _i: 102, category: "Rhetoric", rhetoricArea: "Meaning Construction",
    q: "The teen translation calls الْقَدْرِ 'Power' while Ibn Kathir's heading renders it 'the Decree'. Why keep the Arabic name?",
    options: [
      "The single Arabic word holds several senses",
      "Translators were unsure which sense was right",
      "The name has no meaning in Arabic at all",
      "Only scholars are allowed to read the title",
    ], answer: 0,
    explanation: "Both renderings appear in our approved references — the teen translation says 'Power' and Ibn Kathir's section heading says 'the Decree' — so keeping the name preserves the range instead of flattening it into one English word.",
    verified: ik("97:1", "The Virtues of the Night of Al-Qadr (the Decree)"),
  },
  {
    _i: 103, category: "Rhetoric", rhetoricArea: "Nazm",
    q: "Verses 2 and 3 repeat 'the Night of Power' instead of using a pronoun. What does that arrangement do?",
    options: [
      "It builds wonder before the answer arrives",
      "It copies the line without any purpose",
      "It shortens the surah for memorisation only",
      "It signals that a new topic has begun",
    ], answer: 0,
    explanation: "The question is asked and then the words are said again before the worth is given. Ibn Kathir reads exactly this movement as Allah magnifying the status of the night He chose for the revelation of the Mighty Qur'an.",
    verified: ik("97:2", "Then Allah magnified the status of the Night of Al-Qadr, which He chose for the revelation of the Mighty Qur'an"),
  },
  {
    _i: 104, category: "Rhetoric", rhetoricArea: "Nazm",
    q: "Verse 5 puts the word for 'peace' ahead of 'it is'. What does that word order carry?",
    options: [
      "It stresses that the night is nothing but peace",
      "Arabic word order carries no meaning here",
      "The verse simply follows the verse before it",
      "Peace had to come first to finish the rhyme",
    ], answer: 0,
    explanation: "Leading with the quality makes it the whole report about the night. Qatadah and Ibn Zayd, quoted by Ibn Kathir, take it this way: all of it is good and there is no evil in it until dawn.",
    verified: ik("97:5", "This means all of it is good and there is no evil in it until the coming of Fajr"),
  },
  {
    _i: 105, category: "Rhetoric", rhetoricArea: "Style of Address",
    q: "Verse 2 addresses the Prophet ﷺ with 'And what can make you understand what the Night of Power is?' What does that style of address do?",
    options: [
      "It is a question meant to stir wonder",
      "The reader is asked to answer the question",
      "No one is addressed; it is a plain statement",
      "The question is aimed at the angels alone",
    ], answer: 0,
    explanation: "The one addressed already knows the answer, so the question is not for information. Ibn Kathir treats it as Allah magnifying the status of the night before stating its worth.",
    verified: ik("97:2", "And what will make you know what the Night of Al-Qadr is"),
  },
  {
    _i: 106, category: "Rhetoric", rhetoricArea: "Style of Address",
    q: "Allah speaks of Himself with 'We sent it down'. What does that style of address signal?",
    options: [
      "The plural here is one of majesty and honour",
      "Several beings shared in sending it down",
      "The verse was addressed to a whole crowd",
      "It is the ordinary Arabic word for I",
    ], answer: 0,
    explanation: "The plural of the verb is the majestic plural of the one speaker. Ibn Kathir's own retelling shows the single doer clearly: Allah informs that He sent the Qur'an down during the Night of Al-Qadr.",
    verified: ik("97:1", "Allah informs that He sent the Qur'an down during the Night of Al-Qadr"),
  },
];
// the question text carries the surah's own spelling of the name
RH[1].q = RH[1].q.replace("الْقَدْرِ", A[2]);

const rhetoric = RH.map((q) => ({ ...q }));

const ORDER = { Vocabulary: 0, Comprehension: 1, "Critical Thinking": 2, Rhetoric: 3 };
const quiz = [...vocabQuestions, ...comprehension, ...criticalThinking, ...rhetoric];
quiz.sort((a, b) => ORDER[a.category] - ORDER[b.category] || a._i - b._i);

const TARGET = [2, 0, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 3];
quiz.forEach((q, index) => {
  const target = TARGET[index];
  const oldOptions = [...q.options];
  const oldAnswer = q.answer;
  q.options = [0, 1, 2, 3].map((i) => oldOptions[(((i - target + oldAnswer) % 4) + 4) % 4]);
  q.answer = target;
  if (q.options[q.answer] !== oldOptions[oldAnswer]) throw new Error("answer text moved at q" + (index + 1));
  delete q._i;
});
s.quiz = quiz;

// ---------- 6. Intro ----------
s.intro =
  "Surah Al-Qadr is a short surah that tells us about the Qur'an itself. It opens with the news that Allah sent the Book down on a single night — the Night of Decree — a night so blessed that worship in it is worth more than worship in a thousand months. On that night the angels and the Spirit (Jibril عليه السلام) come down by their Lord's permission, carrying every command. The whole night is peace — no harm, no evil, no disturbance — until the first light of dawn breaks. The surah never fixes a date for it; the Prophet ﷺ directed us to seek it in the last ten nights of Ramadan, standing in prayer and asking the Pardoning One to pardon.";
s.introVerified = {
  status: "verified", by: "tafsir Ibn Kathir",
  note: "Summary of 97:1-5 checked against Tafsir Ibn Kathir. On the descent: 'Allah informs that He sent the Qur'an down during the Night of Al-Qadr, and it is a blessed night'. On how it came down: 'Allah sent the Qur'an down all at one time from the Preserved Tablet (Al-Lawh Al-Mahfuz) to the House of Might (Baytul-`Izzah), which is in the heaven of this world. Then it came down in parts to the Messenger of Allah'. On the worth of the night: 'worship during the Night of Al-Qadr is equivalent to worship performed for a period of one thousand months'. On who descends: 'the angels descend in abundance during the Night of Al-Qadr due to its abundant blessings' and 'In reference to Ar-Ruh, it is said that here it means the angel Jibril'. On every command: 'The matters are determined during it, and the times of death and provisions are measured out (i.e., decided) during it.' On the peace and its end: 'It is security in which Shaytan cannot do any evil or any harm' and 'This means all of it is good and there is no evil in it until the coming of Fajr (dawn).' On seeking it: 'for verily I saw the Night of Al-Qadr, and I was caused to forget it, and indeed it is during the last ten (nights). It is during an odd night' and the supplication 'O Allah! Verily, You are the Of the Pardoning, You love to pardon, so pardon me.' Two things are readings of the surah rather than quotations: the statement that the surah never fixes a date, which comes from looking at all five ayat, and the description of the surah as a short surah about the Qur'an itself.",
  checkedAt: DATE,
};

// ---------- 7. Self-checks (mirror audit-surah.js) ----------
const failures = [];
const noteSource = { "ClearQuran (Talal Itani)": transText, "tafsir Ibn Kathir": tafsirText };
const checkVerified = (label, v, requireIK, requireRange) => {
  if (!v) return failures.push(`${label}: missing verified`);
  if (v.status !== "verified") failures.push(`${label}: status ${v.status}`);
  if (!["ClearQuran (Talal Itani)", "tafsir Ibn Kathir", "corpus.quran.com"].includes(v.by)) failures.push(`${label}: verifier ${v.by}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.checkedAt || "")) failures.push(`${label}: checkedAt`);
  if (!String(v.note || "").trim()) failures.push(`${label}: empty note`);
  if (requireIK && v.by !== "tafsir Ibn Kathir") failures.push(`${label}: rhetoric must cite Ibn Kathir`);
  if (requireRange && !/(?:^|\D)97:\d+(?:-\d+)?(?:\D|$)/.test(v.note || "")) failures.push(`${label}: no 97:ayah range`);
  if (noteSource[v.by] && !hasRun(v.note, noteSource[v.by])) failures.push(`${label}: note lacks a 4-word source run`);
};
if (!String(s.intro || "").trim()) failures.push("intro missing");
checkVerified("intro", s.introVerified, true, false);
s.vocabulary.forEach((v, i) => {
  ["arabic", "meaning", "connection", "hint"].forEach((f) => { if (!String(v[f] || "").trim()) failures.push(`v${i + 1} missing ${f}`); });
  ["primary", "ref", "checkedAt"].forEach((f) => { if (!String(v.source?.[f] || "").trim()) failures.push(`v${i + 1} missing source.${f}`); });
  if (!["Qur'anic Arabic Corpus", "tafsir Ibn Kathir"].includes(v.source?.primary)) failures.push(`v${i + 1} source.primary ${v.source?.primary}`);
  if (!/(?:^|\D)97:\d+/.test(v.source?.ref || "")) failures.push(`v${i + 1} source.ref ${v.source?.ref}`);
  ["english", "arabic", "explanation"].forEach((f) => { if (!String(v.grammar?.[f] || "").trim()) failures.push(`v${i + 1} missing grammar.${f}`); });
  const gt = [v.grammar?.english, v.grammar?.arabic, v.grammar?.explanation].join(" ");
  if (/emphatic prefix l[aā]m|opening لَ|مؤكد باللام/i.test(gt) && !String(v.arabic).startsWith("ل")) failures.push(`v${i + 1} lam mismatch`);
  checkVerified(`vocabulary ${i + 1} (${v.arabic})`, v.verified, false, false);
});
if (s.practice.length !== s.vocabulary.length) failures.push("practice length " + s.practice.length);
s.practice.forEach((p, i) => {
  if (!String(p.explanation || "").trim()) failures.push(`practice ${i + 1} missing explanation`);
  if (new Set(p.options).size !== 4) failures.push(`practice ${i + 1} duplicate options`);
});
s.vocabulary.forEach((v) => {
  const ok = s.practice.some((p) => (p.q.includes(v.arabic) && p.options[p.answer] === v.meaning) || (p.q.includes(v.meaning) && p.options[p.answer] === v.arabic));
  if (!ok) failures.push("practice misses " + v.arabic);
});
[["fillBlanks", s.fillBlanks, A], ["fillBlanksEn", s.fillBlanksEn, M]].forEach(([label, section, expected]) => {
  if (!Array.isArray(section?.ayahs) || section.ayahs.length !== 5 || section.ayahs.some((a, i) => a.n !== i + 1)) failures.push(`${label} ayah numbering`);
  const bank = section.ayahs.flatMap((a) => a.segments.filter((x) => x.b !== undefined).map((x) => x.b));
  if ([...bank].sort().join("|") !== [...expected].sort().join("|")) failures.push(`${label} blank set mismatch:\n  ${bank.join(", ")}\n  ${expected.join(", ")}`);
});
const wantSeq = [...Array(12).fill("Vocabulary"), ...Array(7).fill("Comprehension"), ...Array(5).fill("Critical Thinking"), ...Array(6).fill("Rhetoric")];
if (s.quiz.length !== 30) failures.push("quiz length " + s.quiz.length);
if (s.quiz.map((q) => q.category).join(",") !== wantSeq.join(",")) failures.push("category sequence wrong");
const spread = [0, 1, 2, 3].map((a) => s.quiz.filter((q) => q.answer === a).length);
if (spread.join(",") !== "8,8,7,7") failures.push("spread " + spread.join(","));
const areas = {};
s.quiz.filter((q) => q.category === "Rhetoric").forEach((q) => { areas[q.rhetoricArea] = (areas[q.rhetoricArea] || 0) + 1; });
const areaPairs = Object.entries(areas).sort().map(([k, v]) => k + "=" + v).join(",");
if (areaPairs !== "Meaning Construction=2,Nazm=2,Style of Address=2") failures.push("areas " + JSON.stringify(areas));
const BANNED = [/the (?:surah|quran) forgot/i, /the surah is incomplete/i, /make (?:the )?surah longer/i, /allah (?:did not|does not|didn't|doesn't) know/i, /the order is random/i, /mistake by (?:the )?prophet/i, /(?:the )?prophet.{0,24}forgot/i, /all of the above/i, /none of the above/i, /\(Rhetoric\s*-/i];
const seen = new Set();
s.quiz.forEach((q, i) => {
  const label = `quiz Q${i + 1} (${q.category})`;
  if (!String(q.q || "").trim()) failures.push(`${label} missing question`);
  if (!String(q.explanation || "").trim()) failures.push(`${label} missing explanation`);
  const norm = String(q.q).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  if (seen.has(norm)) failures.push(`${label} duplicate wording`);
  seen.add(norm);
  if (BANNED.some((p) => p.test(q.q))) failures.push(`${label} banned question wording`);
  q.options.forEach((o) => { if (BANNED.some((p) => p.test(o))) failures.push(`${label} banned option: ${o}`); });
  if (new Set(q.options).size !== 4) failures.push(`${label} duplicate options`);
  const w = q.options.map((o) => o.split(/\s+/).length);
  const maxOther = Math.max(...w.filter((_, j) => j !== q.answer));
  if (w[q.answer] - maxOther >= 2) failures.push(`${label} LENGTH BIAS ${w[q.answer]}w vs ${maxOther}w :: ${q.q} :: ${q.options.map((o, j) => (j === q.answer ? "*" : "") + o.split(/\s+/).length + "w " + o).join(" | ")}`);
  checkVerified(label, q.verified, q.category === "Rhetoric", q.category === "Rhetoric");
});
const covered = new Set();
s.quiz.filter((q) => q.category === "Vocabulary").forEach((q) => s.vocabulary.forEach((v) => { if (q.q.includes(v.arabic)) covered.add(v.arabic); }));
if (covered.size < 12) failures.push("vocab coverage " + covered.size);

if (failures.length) {
  console.log("SELF-CHECK FAILED (" + failures.length + "):\n" + failures.join("\n"));
  process.exit(1);
}

fs.writeFileSync(FILE, `// Surah 97 \u00b7 Al-Qadr\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("written; quiz:", s.quiz.length, "spread:", spread.join(","), "areas:", areaPairs, "vocabCov:", covered.size, "practice:", s.practice.length);

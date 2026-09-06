// Rebuild Surah 78 (An-Naba') lesson content to pass audit-surah.js.
// Preserves the existing (already correct) fillBlanks / fillBlanksEn banks and
// the vocabulary Arabic+meaning pairs; adds introVerified, grammar and genuine
// verification for all 16 cards, 16 practice items, and a 30-question quiz in
// the required 12/7/5/6 order with an 8,8,7,7 answer spread.
//   node scratch/fix-naba.js
const fs = require("fs");
const path = require("path");
const { loadLessonData } = require("../lesson-data-loader");

const FILE = path.join(__dirname, "..", "src", "data", "surahs", "078-naba.js");
const DATE = "2026-08-30";

const { surahs } = loadLessonData();
const s = surahs.find((x) => x.id === "naba");

const itani = (line, quote) => ({
  status: "verified",
  by: "ClearQuran (Talal Itani)",
  note: `Quote from translation-notes/78-naba-itani-teens.md line ${line}: '${quote}'`,
  checkedAt: DATE,
});
const ik = (verses, quote) => ({
  status: "verified",
  by: "tafsir Ibn Kathir",
  note: `Ibn Kathir on ${verses}: '${quote}'`,
  checkedAt: DATE,
});

// Per-card grammar + verification, in the existing vocabulary order.
const CARDS = [
  { g: ["Interrogative noun merged with a preposition", "حرف جرّ داخل في اسم الاستفهام",
        "عَمَّ merges the preposition عَن ('about') with the question word مَا ('what'). The shaddah on the meem shows the two words have been pressed into one."],
    v: itani(19, "What are they asking each other about?") },
  { g: ["Imperfect verb, Form VI, third person masculine plural", "فعل مضارع للتفاعل للغائب الجمع المذكر",
        "The ending ون marks 'they', and the Form VI pattern تَفَاعَلَ shows people asking back and forth to one another, not one person asking."],
    v: itani(19, "What are they asking each other about?") },
  { g: ["Definite noun in the genitive case", "اسم معرف مجرور",
        "The al- makes it 'the news', and the kasrah at the end shows it is still governed by the preposition عَن from the verse before."],
    v: itani(21, "About the great news.") },
  { g: ["Definite adjective in the genitive case", "صفة معرف مجرورة",
        "ٱلْعَظِيمِ sits straight after ٱلنَّبَإِ and carries the same kasrah. Matching case is the clue that it describes that noun: the news that is tremendous."],
    v: itani(23, "The great news they disagree about.") },
  { g: ["Noun in the accusative with tanween", "اسم منصوب بالتنوين",
        "The tanween (ـً) marks what the earth was made INTO: a spread-out resting place. Ibn Kathir glosses it as a firm, peaceful resting place."],
    v: ik("78:6", "(Have We not made the earth as a bed,) meaning, an established, firm and peaceful resting place that is subservient to them.") },
  { g: ["Plural noun in the accusative with tanween", "جمع منصوب بالتنوين",
        "أَوْتَاد is the plural of وَتَد, a peg or stake, and the tanween marks what the mountains were made into — pegs that hold the earth firm."],
    v: ik("78:7", "(And the mountains as pegs) meaning, He made them as pegs for the earth to hold it in place, make it stable and firm.") },
  { g: ["Plural noun in the accusative with tanween", "جمع منصوب بالتنوين",
        "The tanween marks the state people were created in: pairs, male and female, so that procreation continues."],
    v: ik("78:8", "(And We have created you in pairs.) meaning, male and female, both of them enjoying each other") },
  { g: ["Noun in the accusative with tanween", "اسم منصوب بالتنوين",
        "سُبَاتًا follows نَوْمَكُمْ ('your sleep') and names what sleep becomes, so it takes the tanween ending."],
    v: ik("78:9", "(And We have made your sleep as a thing for rest.) meaning, a cessation of movement in order to attain rest") },
  { g: ["Noun in the accusative with tanween", "اسم منصوب بالتنوين",
        "Same pattern as the verse before: the night is made INTO a covering, so the word ends in tanween and its shade wraps over the people."],
    v: ik("78:10", "(And We have made the night as a covering,) meaning, its shade and darkness covers the people.") },
  { g: ["Verbal noun in the accusative with tanween", "مصدر منصوب بالتنوين",
        "مَعَاشًا names the purpose of the day — moving about to earn a living — and the tanween marks that purpose."],
    v: ik("78:11", "(And We have made the day for livelihood.) meaning, We made it radiant, luminous, and shining so that the people would be able to move about in it.") },
  { g: ["Intensive adjective in the accusative", "صفة مبالغة منصوبة",
        "The pattern فَعَّال expresses intensity and repetition, so ثَجَّاجًا pictures rain poured out heavily and continuously."],
    v: ik("78:14", "Thajjaj means poured out. ... This contains an evidence for using the word Thajj to mean abundant, continuous and flowing.") },
  { g: ["Noun in construct state followed by a genitive", "مضاف ومضاف إليه",
        "يَوْمَ is joined to ٱلْفَصْلِ in the genitive, so the two lock together as 'the Day OF Decision' — the day judgement is made between people."],
    v: ik("78:17", "Allah says about the Day of Decision -- and it is the Day of Judgement -- that it is at a fixed time, with a set appointment.") },
  { g: ["Noun of place, accusative with tanween", "اسم مكان منصوب بالتنوين",
        "Built on the pattern مِفْعَال from the root ر-ص-د, to lie in wait, so the word itself carries the image of watching and waiting."],
    v: ik("78:21", "(Truly, Hell is a place of ambush) meaning, it is waiting in preparation.") },
  { g: ["Preposition of purpose with a genitive plural", "اللام + جمع مذكر سالم مجرور بالياء",
        "The lam means 'for', and the ending ين is the sign of the genitive for this masculine plural — so it reads 'for the transgressors'."],
    v: ik("78:22", "(for the Taghun) These are the disobedient rejectors who oppose the Messengers.") },
  { g: ["Noun of place or result, accusative with tanween", "اسم مكان أو مصدر منصوب بالتنوين",
        "From the root ف-و-ز, to succeed or be saved. Built on مَفْعَل it can name both the success itself and the place of success."],
    v: ik("78:31", "(Verily, for those who have Taqwa, there will be a success;) ... They are successful and thus, they are saved from the Hellfire.") },
  { g: ["Verbal noun in the accusative with tanween", "مصدر منصوب بالتنوين",
        "حِسَاب covers both 'reckoning' and 'enough'. The tanween marks it as the object of what the deniers did not expect, and later as the gift that is sufficient."],
    v: ik("78:27 and 78:36", "(For verily, they used not to look for a reckoning.) ... It will be sufficient, suitable, comprehensive and abundant.") },
];

const M = s.vocabulary.map((v) => v.meaning);
const A = s.vocabulary.map((v) => v.arabic);

// One practice item per card, testing the exact pairing.
const P = [
  { a: 2, q: `What does ${A[0]} mean?`, o: ["who", "where", M[0], "why"], e: `${A[0]} is the surah's opening question — 'about what' are people arguing?` },
  { a: 0, q: `What does ${A[1]} mean?`, o: [M[1], "they run away", "they give thanks", "they make vows"], e: `${A[1]} is a Form VI verb, so it shows people asking one another back and forth.` },
  { a: 3, q: `What does ${A[2]} mean?`, o: ["the old story", "the hidden fear", "the long journey", M[2]], e: `${A[2]} is the news the surah is about — the great news of the Last Day.` },
  { a: 1, q: `What does ${A[3]} mean?`, o: ["small", M[3], "distant", "gentle"], e: `${A[3]} describes the news: it is tremendous, nothing about it is minor.` },
  { a: 0, q: `What does ${A[4]} mean?`, o: [M[4], "a burning fire", "a tall tower", "a narrow bridge"], e: `${A[4]}: the earth is made a settled resting place for people to live on.` },
  { a: 2, q: `What does ${A[5]} mean?`, o: ["rivers", "clouds", M[5], "stars"], e: `${A[5]} are pegs — the mountains hold the earth firm the way pegs hold a tent.` },
  { a: 1, q: `What does ${A[6]} mean?`, o: ["crowds", M[6], "angels", "seeds"], e: `${A[6]} means pairs, male and female, which is how Allah created people.` },
  { a: 3, q: `What does ${A[7]} mean?`, o: ["hunger", "warning", "strength", M[7]], e: `${A[7]} is rest: sleep stops movement so the body recovers.` },
  { a: 0, q: `What does ${A[8]} mean?`, o: [M[8], "a loud call", "a dry ground", "a bright door"], e: `${A[8]} is a covering — the night wraps over people like a garment.` },
  { a: 1, q: `What does ${A[9]} mean?`, o: ["sleeping", M[9], "nightfall", "judgement"], e: `${A[9]} is livelihood: the day is made for moving about and earning.` },
  { a: 2, q: `What does ${A[10]} mean?`, o: ["barely dripping", "freezing cold", M[10], "slowly fading"], e: `${A[10]} describes rain poured out heavily and continuously from the clouds.` },
  { a: 0, q: `What does ${A[11]} mean?`, o: [M[11], "Day of Forgiveness", "Night of Power", "First of Creation"], e: `${A[11]} is the Day of Decision — the Day of Judgement, which has a fixed appointment.` },
  { a: 3, q: `What does ${A[12]} mean?`, o: ["a wide garden", "a soft bed", "a high gate", M[12]], e: `${A[12]}: Hell lies in wait, ready in advance for those who reject.` },
  { a: 1, q: `What does ${A[13]} mean?`, o: ["for the angels", M[13], "for the prophets", "for the poor"], e: `${A[13]} means for the transgressors — the disobedient who opposed the Messengers.` },
  { a: 0, q: `Which word means '${M[14]}'?`, o: [A[14], A[12], A[4], A[8]], e: `${A[14]} is success and safety — what the mindful are promised in verse 31.` },
  { a: 2, q: `Which word means '${M[15]}'?`, o: [A[9], A[5], A[15], A[6]], e: `${A[15]} carries both senses: a reckoning, and what is sufficient and abundant.` },
];

// ---- Quiz: 12 Vocabulary, 7 Comprehension, 5 Critical Thinking, 6 Rhetoric ----
const V = (q, o, a, e, v) => ({ category: "Vocabulary", q, options: o, answer: a, explanation: e, verified: v });
const C = (q, o, a, e, v) => ({ category: "Comprehension", q, options: o, answer: a, explanation: e, verified: v });
const T = (q, o, a, e, v) => ({ category: "Critical Thinking", q, options: o, answer: a, explanation: e, verified: v });
const R = (area, q, o, a, e, v) => ({ category: "Rhetoric", rhetoricArea: area, q, options: o, answer: a, explanation: e, verified: v });

const QUIZ = [
  V(`What does ${A[0]} mean?`, ["who", "where", M[0], "why"], 2,
    `${A[0]} means 'about what'. The surah opens by exposing how the deniers kept arguing.`, itani(19, "What are they asking each other about?")),
  V(`What does ${A[1]} mean?`, [M[1], "they run away", "they give thanks", "they make vows"], 0,
    `${A[1]} means 'they ask one another' — a back-and-forth debate about the news.`, itani(19, "What are they asking each other about?")),
  V(`What does ${A[2]} mean?`, ["the old story", "the hidden fear", "the long journey", M[2]], 3,
    `${A[2]} is 'the news' — here, the news of resurrection and judgement.`, itani(21, "About the great news.")),
  V(`What does ${A[3]} mean?`, ["very small", M[3], "far away", "soft and gentle"], 1,
    `${A[3]} means 'great / tremendous', showing how huge this news is.`, itani(23, "The great news they disagree about.")),
  V(`What does ${A[4]} mean?`, [M[4], "a burning fire", "a tall tower", "a narrow bridge"], 0,
    `${A[4]} is a resting place — the earth made settled so people can live on it.`, ik("78:6", "(Have We not made the earth as a bed,) meaning, an established, firm and peaceful resting place")),
  V(`What does ${A[5]} mean?`, ["rivers", "clouds", M[5], "stars"], 2,
    `${A[5]} means pegs — the mountains keep the earth firm and steady.`, ik("78:7", "(And the mountains as pegs) meaning, He made them as pegs for the earth to hold it in place")),
  V(`What does ${A[6]} mean?`, ["crowds", M[6], "angels", "seeds"], 1,
    `${A[6]} means pairs, male and female, as Allah created people.`, ik("78:8", "(And We have created you in pairs.) meaning, male and female")),
  V(`What does ${A[7]} mean?`, ["hunger", "warning", "strength", M[7]], 3,
    `${A[7]} is rest — sleep stops a person's movement so they recover.`, ik("78:9", "(And We have made your sleep as a thing for rest.) meaning, a cessation of movement")),
  V(`What does ${A[8]} mean?`, [M[8], "a loud call", "a dry ground", "a bright door"], 0,
    `${A[8]} is a covering: the night's shade and darkness wraps over people.`, ik("78:10", "(And We have made the night as a covering,) meaning, its shade and darkness covers the people.")),
  V(`What does ${A[9]} mean?`, ["sleeping", M[9], "nightfall", "judgement"], 1,
    `${A[9]} means livelihood — the day is lit so people can travel and earn.`, ik("78:11", "(And We have made the day for livelihood.) meaning, We made it radiant, luminous, and shining")),
  V(`What does ${A[10]} mean?`, ["barely dripping", "freezing cold", M[10], "slowly fading"], 2,
    `${A[10]} describes rain poured down heavily and in floods from the clouds.`, ik("78:14", "Thajjaj means poured out")),
  V(`What does ${A[11]} mean?`, ["Day of Forgiveness", "Night of Power", "First of Creation", M[11]], 3,
    `${A[11]} is the Day of Decision, when Allah judges between all people.`, ik("78:17", "Allah says about the Day of Decision -- and it is the Day of Judgement")),

  C("Why does the surah open with a question instead of stating the news at once?",
    ["Because the news is secret and cannot be told", "Because nobody had ever asked about it", "Because a question is shorter to recite", "To show how much people were arguing about it"], 3,
      "The opening question lays the argument bare: people were going back and forth over this news, so Allah exposes their dispute before answering it.",
      ik("78:1", "In rejection of the idolators' questioning about the Day of Judgement, due to their denial of its occurrence")),
  C("What does Allah point to in verses 6-16, just after the question?",
    ["The armies of earlier nations", "The signs He made in creation", "The wealth of the disbelievers", "The rulers who governed Makkah"], 1,
      "Verses 6-16 list the earth, mountains, pairs, sleep, night, day, heavens, sun and rain — created signs that prove the One who made them can raise the dead.",
      ik("78:6-16", "Then, Allah begins to explain His great ability to create strange things and amazing matters.")),
  C("According to verse 17, what about the Day of Decision is already settled?",
    ["Its fixed time has been appointed", "Its punishments have been lessened", "Its length has been doubled", "Its gate has been closed"], 0,
      "The Day has a set appointment that cannot be moved earlier or later, and only Allah knows its exact time.",
      ik("78:17", "it is at a fixed time, with a set appointment. Its time cannot be added to or decreased.")),
  C("What will happen to the mountains on that Day, verse 20?",
    ["They will grow taller than before", "They will turn into green gardens", "They will be moved like a mirage", "They will shelter the believers"], 2,
      "The mountains that were pegs of stability are lifted away and left looking like a mirage — appearing to be something, then nothing.",
      ik("78:20", "(And the mountains shall be moved away from their places and they will be as if they were a mirage.)")),
  C("What will the people of Hell taste there, verse 25?",
    ["Cool water and deep shade", "Boiling water and a bitter drink", "Sweet milk and pure honey", "They will taste nothing at all"], 1,
      "They taste no coolness and no good drink — only hamim, water at its hottest, and ghassaq, a foul freezing fluid.",
      ik("78:25", "Except Hamim, and Ghassaq ... The Ghassaq is gathered from the pus, sweat, tears, and wounds")),
  C("What is promised for those who were mindful of Allah, verse 31?",
    ["A long life in the desert", "Rule over the seven heavens", "Safety from ever dying again", "True success with gardens and vineyards"], 3,
      "Verses 31-34 answer verse 21: where Hell waits in ambush for the transgressors, the mindful have success — gardens, grapevines and cups filled to the brim.",
      ik("78:31", "(Verily, for those who have Taqwa, there will be a success;)")),
  C("What does the disbeliever wish for at the end of the surah, verse 40?",
    ["That he were dust", "That he had been a king", "That the Day had already passed", "That his people had believed"], 0,
      "Seeing what his own hands sent forward, the disbeliever wishes he were dust — that he had never been created at all.",
      itani(97, 'the disbeliever will say, "Oh, I wish I were dust!"')),

  T("Why does the surah list everyday signs like sleep and rain before describing the Last Day?",
    ["Because the signs are easier to recall", "Because the Same power can raise the dead", "Because the Last Day is still far off", "Because rain rewards those who believe"], 1,
      "Ibn Kathir explains that Allah brings these creations as proof of His ability to do whatever He wishes concerning the Hereafter — the One who made all this can rebuild a person.",
      ik("78:6-16", "He brings this as a proof of His ability to do whatever He wishes concerning the matter of the Hereafter")),
  T("Verses 4-5 repeat 'Soon they will know'. What does that repetition carry?",
    ["A doubt about whether it will happen", "A count of how many days remain", "A firm warning repeated for emphasis", "A promise of a sooner relief"], 2,
      "Ibn Kathir calls the doubled statement 'a severe threat and a direct warning' — the repetition fixes the warning so it cannot be waved away.",
      ik("78:4-5", "(Nay, they will come to know! Nay, again, they will come to know!) This is a severe threat and a direct warning.")),
  T("Why is the punishment called 'a fair reward for what they've done' in verse 26?",
    ["It matches the deeds they chose themselves", "Because the angels set the measure daily", "Because the punishment changes every era", "Because their deeds will be forgotten"], 0,
      "Ibn Kathir explains that the punishment comes 'in accordance with their wicked deeds, which they were doing in this life' — the reward fits the work.",
      ik("78:26", "(An exact recompense.) meaning, that which will happen to them of this punishment is in accordance with their wicked deeds")),
  T("Verse 39 says whoever wants may take a path back to his Lord. What does that teach?",
    ["It is hidden from most people", "It needs a long journey abroad", "It opens only for the wealthy", "It stays open for anyone to choose"], 3,
      "After showing both outcomes, the verse leaves the door open: the way back to your Lord is set before anyone who chooses to take it.",
      ik("78:39", "(So, whosoever wills, let him seek a place with His Lord!) meaning, a place of return, a path that leads to Him")),
  T("What is the lesson of ending with each person seeing what their own hands have done?",
    ["Everyone will be judged as a group", "Each person carries their own result", "Only disbelievers will see their deeds", "Deeds are weighed after being forgotten"], 1,
      "Ibn Kathir explains that all of a person's deeds, good and bad, will be presented to them — so the surah closes on personal responsibility, not on blame against others.",
      ik("78:40", "(the Day when man will see that which his hands have sent forth,) meaning, all of his deeds will be presented to him")),

  R("Meaning Construction", `Why does the teen rendering give ${A[12]} as 'Hellfire waits in ambush' rather than simply 'a place'?`,
    ["Because the word names a market", "Because it means a soft resting bed", "Because the word pictures lying in wait", "Because it describes a tall gate"], 2,
      "The word is from the root ر-ص-د, watching and waiting, so the translation keeps the image of a danger already lying in wait rather than an empty location.",
      ik("78:21", "(Truly, Hell is a place of ambush) meaning, it is waiting in preparation.")),
  R("Meaning Construction", "Ibn Kathir explains the sleep word as a cessation of movement. Why is 'rest' the better word for a young reader?",
    ["It names what a child can feel", "It proves that sleep never ends", "It shows that night is harmful", "It counts the hours of sleep"], 0,
      "'Cessation of movement' is the exact meaning, but 'rest' carries the reason sleep was given — recovery — which a ten-year-old recognises from their own experience.",
      ik("78:9", "(And We have made your sleep as a thing for rest.) meaning, a cessation of movement in order to attain rest")),
  R("Nazm", "Why are the creation signs in verses 6-16 placed between the threat and the Day itself?",
    ["To delay the topic until the surah ends", "To describe the heavens only", "Because the list is a legal contract", "So proof of power comes before the judgement"], 3,
      "The order is the argument: the question, then the visible proof that Allah can remake creation, then the Day that the deniers dispute. Ibn Kathir marks the shift by saying Allah brings this as a proof of His ability concerning the Hereafter.",
      ik("78:6-16", "He brings this as a proof of His ability to do whatever He wishes concerning the matter of the Hereafter")),
  R("Nazm", "Verses 31-36 answer verses 21-30. What is the effect of setting the two lists back to back?",
    ["It hides which group is meant", "It sets the two outcomes side by side", "It repeats one warning twice over", "It shortens the surah before its ending"], 1,
      "Hell lying in ambush for the transgressors is followed straight by success for the mindful, so the listener holds both destinations together and can see the choice in verse 39 is real.",
      ik("78:31", "Allah informs about the happy people and what He has prepared for them of esteem, and eternal pleasure.")),
  R("Style of Address", "The surah describes the Day in the third person, then verse 30 says 'So taste this punishment' to them directly. What does the shift do?",
    ["It softens what was said before", "It changes the topic to food", "It makes it land on them directly", "It shows the speaker is unsure"], 2,
      "Ibn Kathir explains that this will be said to the people of the Hellfire, so the switch to direct address makes the sentence reach them face to face at the moment it is spoken.",
      ik("78:30", "This means that it will be said to the people of the Hellfire, \"Taste that which you were in.")),
  R("Style of Address", `Why does the surah keep repeating 'Didn't We make' and 'And We made' across verses 6-16?`,
    ["To make the gifts feel personal and obvious", "To list what must be traded in", "To show that Allah is far away", "To count the days of creation"], 0,
      "The repeated first-person plural keeps pointing at the Giver while the gifts stay ordinary — earth, sleep, night, rain — so the reader feels the favour rather than hearing a list.",
      ik("78:6", "(Have We not made the earth as a bed,) meaning, an established, firm and peaceful resting place")),
];

// ---- Assemble ----
s.introVerified = {
  status: "verified",
  by: "tafsir Ibn Kathir",
  note: "Summary of 78:1-40 checked against Tafsir Ibn Kathir. On the opening: 'In rejection of the idolators' questioning about the Day of Judgement, due to their denial of its occurrence' and 'meaning, what are they asking about They are asking about the matter of the Day of Judgement, and it is the great news.' On the signs: 'Then, Allah begins to explain His great ability to create strange things and amazing matters. He brings this as a proof of His ability to do whatever He wishes concerning the matter of the Hereafter.' On the Day: 'Allah says about the Day of Decision -- and it is the Day of Judgement -- that it is at a fixed time, with a set appointment.' On the two ends: '(Truly, Hell is a place of ambush) meaning, it is waiting in preparation' and '(Verily, for those who have Taqwa, there will be a success;)'. On the closing wish: 'the disbeliever on that Day will wish that he had only been dust in the worldly life.' The intro's ordering of signs before judgement is a structural reading of Ibn Kathir's section headings, stated as the surah's movement rather than as a quotation.",
  checkedAt: DATE,
};

s.vocabulary = s.vocabulary.map((v, i) => ({
  ...v,
  grammar: { english: CARDS[i].g[0], arabic: CARDS[i].g[1], explanation: CARDS[i].g[2] },
  verified: CARDS[i].v,
  source: { ...v.source, checkedAt: DATE },
}));

s.practice = P.map((p) => ({
  type: p.q.startsWith("Which word") ? "en2ar" : "ar2en",
  q: p.q,
  options: p.o,
  answer: p.a,
  explanation: p.e,
}));

s.quiz = QUIZ;

const spread = [0, 0, 0, 0];
s.quiz.forEach((q) => spread[q.answer]++);
if (spread.join(",") !== "8,8,7,7") throw new Error("answer spread is " + spread.join(","));
const order = s.quiz.map((q) => q.category).join(",");
const want = [...Array(12).fill("Vocabulary"), ...Array(7).fill("Comprehension"), ...Array(5).fill("Critical Thinking"), ...Array(6).fill("Rhetoric")].join(",");
if (order !== want) throw new Error("quiz category order wrong");

fs.writeFileSync(FILE, `// Surah 78 \u00b7 An-Naba'\n// Lesson data only. Shared behavior lives in the modules under src/.\nexport default ${JSON.stringify(s, null, 2)};\n`, "utf8");
console.log("written; practice:", s.practice.length, "quiz:", s.quiz.length, "spread:", spread.join(","));
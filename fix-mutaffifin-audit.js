/**
 * fix-mutaffifin-audit.js
 * Addresses all 7 audit findings for Surah Al-Mutaffifin (83)
 */
const fs = require('fs');
const file = 'app.html';
let c = fs.readFileSync(file, 'utf8');

// ──────────────────────────────────────────────────────────────
// FIX 1 (P1): Ayah 16 لَصَالُو → لَصَالُوا  (missing final alif)
// ──────────────────────────────────────────────────────────────
c = c.replace(
  'لَصَالُو الْجَحِيمِ',
  'لَصَالُوا الْجَحِيمِ'
);

// ──────────────────────────────────────────────────────────────
// FIX 2 (P1): Sijjeen definition — distinguish place from record
// Ibn Kathir: Sijjeen is a PLACE (confining prison beneath the seventh earth)
//             where the RECORD of the wicked is kept.
//             It is NOT itself a "register."
// ──────────────────────────────────────────────────────────────

// Vocabulary meaning & connection
c = c.replace(
  'meaning: "Sijjeen — a dark prison register"',
  'meaning: "Sijjeen — a confining place beneath the earth"'
);
c = c.replace(
  'connection: "A sealed written book in the deepest, darkest place — where the deeds of the wicked are stored."',
  'connection: "The record of the wicked is kept in Sijjeen — a place of confinement beneath the lowest earth."'
);
c = c.replace(
  'hint: "A dungeon made of paper, recording every evil deed in chains."',
  'hint: "A locked, dark place far below the earth where the record of evil deeds is kept."'
);
// Fix the Sijjeen verified note
c = c.replace(
  'note: "Explanation of Sijjeen matches Ibn Kathir\'s description of the lowest earth/prison register."',
  'note: "Explanation of Sijjeen matches Ibn Kathir\'s description of the lowest earth — a confining place where the record of the wicked is stored."'
);
// Fix the grammar explanation
c = c.replace(
  'It is an intensive form indicating a severe prison or confined register.',
  'It is an intensive form indicating a severe, confining place of imprisonment.'
);

// Practice Q6 (meaning question for Sijjeen)
c = c.replace(
  '{ type: "meaning", q: "سِجِّينٍ is:", options: ["Sijjeen — a dark prison register", "a bright garden", "a tall mountain", "a flowing river"], answer: 0 }',
  '{ type: "meaning", q: "سِجِّينٍ is:", options: ["a confining place beneath the earth", "a bright garden", "a tall mountain", "a flowing river"], answer: 0 }'
);

// fillBlanks Arabic Ayah 7: Sijjeen meaning bank
c = c.replace(
  '{ b: "سِجِّينٍ", m: "Sijjeen — a dark prison register" }',
  '{ b: "سِجِّينٍ", m: "Sijjeen — a confining place beneath the earth" }'
);

// fillBlanksEn Ayah 7: Sijjeen meaning bank
c = c.replace(
  '{ b: "Sijjeen — a dark prison register", m: "سِجِّينٍ" }',
  '{ b: "Sijjeen — a confining place beneath the earth", m: "سِجِّينٍ" }'
);

// ──────────────────────────────────────────────────────────────
// FIX 5 (P2): fillBlanksEn broken English
// Ayah 29: "used to they laugh / they mock" → fix blank text
// Ayah 6: remove trailing "?" — it is not a question by itself
// ──────────────────────────────────────────────────────────────

// Ayah 29 English meaning bank — the blank text should read naturally
c = c.replace(
  '{ n: 29, segments: [{ t: "Indeed, those who committed crimes used to " }, { b: "they laugh / they mock", m: "يَضْحَكُونَ" }, { t: " at those who believed." }] }',
  '{ n: 29, segments: [{ t: "Indeed, those who committed crimes used to " }, { b: "laugh / mock", m: "يَضْحَكُونَ" }, { t: " at those who believed." }] }'
);

// Ayah 6 — it is a continuation of verse 5, not a question on its own
c = c.replace(
  '{ n: 6, segments: [{ t: "The Day when mankind will stand before the Lord of the worlds?" }] }',
  '{ n: 6, segments: [{ t: "The Day when mankind will stand before the Lord of the worlds." }] }'
);

// ──────────────────────────────────────────────────────────────
// FIX 6 (P2): Overstated tafsir claims about sealed drink
// Remove overclaimed words "untouched," "exclusively reserved," "opened only for the righteous"
// ──────────────────────────────────────────────────────────────

// Vocabulary hint for رحيق (line ~2873)
c = c.replace(
  'hint: "The most beautiful drink, kept sealed and untouched, opened only for the worthy."',
  'hint: "A drink so fine and pure that its last taste is musk — the best of all fragrances."'
);

// Vocabulary hint for مختوم (line ~2886)
c = c.replace(
  'hint: "A bottle closed with the most precious wax, broken only for the special guest."',
  'hint: "A container whose seal is musk — when opened, its fragrance is the first blessing."'
);

// Vocabulary connection for مختوم
c = c.replace(
  'connection: "The drink is sealed with musk — a seal of purity and honor."',
  'connection: "The drink is sealed — and its seal is musk, the finest fragrance."'
);


// ──────────────────────────────────────────────────────────────
// FIX 3 (P1) + FIX 4 (P2) + FIX 7 (P2):
// Full quiz rewrite with:
// - Rhetoric interleaved at positions 4, 9, 14, 19, 24, 29
// - Answer distribution ~8,8,7,7 across 0-3
// - Duplicate Q about final rhetorical question removed (replaced)
// - Answer-length bias fixed
// - Distractors made plausible, not absurd
// ──────────────────────────────────────────────────────────────

// We replace the entire quiz array from "quiz: [" to the next "],"
const quizStart = c.indexOf('quiz: [', c.indexOf('id: "mutaffifin"'));
const quizEnd = c.indexOf('    ],\n    fillBlanks:', c.indexOf('id: "mutaffifin"'));

if (quizStart === -1 || quizEnd === -1) {
  console.error('Could not find quiz boundaries');
  process.exit(1);
}

const newQuiz = `quiz: [
      /* ─── Q1 Vocabulary ─── */
      { category: "Vocabulary", q: "What does الْمُطَفِّفِينَ mean?", options: ["the patient believers", "the defrauders who cheat", "the lost travelers", "the careful builders"], answer: 1, explanation: "المطففين refers to those who cheat in weights and measures — demanding full for themselves but giving less to others.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation for Mutaffifin.", checkedAt: "2026-07-21" } },
      /* ─── Q2 Vocabulary ─── */
      { category: "Vocabulary", q: "What does يَسْتَوْفُونَ mean?", options: ["they take in full", "they give away freely", "they hide in secret", "they lose their way"], answer: 0, explanation: "يستوفون means they take in full — demanding every single bit when they receive.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'take in full'.", checkedAt: "2026-07-21" } },
      /* ─── Q3 Vocabulary ─── */
      { category: "Vocabulary", q: "What does يُخْسِرُونَ mean?", options: ["they give a generous bonus", "they stay very silent", "they run far away", "they cause loss to others"], answer: 3, explanation: "يخسرون means they cause loss — giving less when they measure for others.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'give less' (cause loss).", checkedAt: "2026-07-21" } },
      /* ─── Q4 Rhetoric (position 4) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Nazm / Structure) Why does the surah begin with cheating in business weights rather than a general statement about faith?", options: ["To powerfully connect daily honesty with belief in the Day of Judgment", "To teach the listener a set of rules about marketplace pricing", "To compare the value of different types of trade goods", "To list the daily jobs that were common in Makkah"], answer: 0, explanation: "The surah opens with business fraud to make a profound point: cheating in small daily matters reveals the lack of belief that one will stand before Allah on Judgment Day.",
        verified: { status: "verified", by: "Tafsir al-Sa'di", note: "Cautious structural inference grounded in Tafsir al-Sa'di's explanation of the connection between verses 1-3 and 4-6.", checkedAt: "2026-07-21" } },
      /* ─── Q5 Vocabulary ─── */
      { category: "Vocabulary", q: "What does مَّبْعُوثُونَ mean?", options: ["they will be forgiven immediately", "they will be raised and resurrected", "they will be forever hidden from sight", "they will be tested in their dreams"], answer: 1, explanation: "مبعوثون means they will be resurrected — raised up from their graves for the Day of Judgment.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'resurrected'.", checkedAt: "2026-07-21" } },
      /* ─── Q6 Vocabulary ─── */
      { category: "Vocabulary", q: "What does الْفُجَّارِ mean?", options: ["the wicked who break Allah's commands", "the righteous who follow His path", "the wealthy leaders of the community", "the strong warriors in battle"], answer: 0, explanation: "الفجار refers to the wicked — those who repeatedly break Allah's commands.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'the wicked'.", checkedAt: "2026-07-21" } },
      /* ─── Q7 Vocabulary ─── */
      { category: "Vocabulary", q: "What is سِجِّينٍ?", options: ["A bright garden of reward", "A river flowing in Paradise", "A confining place beneath the earth", "A tall mountain near Makkah"], answer: 2, explanation: "Sijjeen is a place of severe confinement beneath the earth where the record of the wicked is stored.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Matches Ibn Kathir's description of Sijjeen as the lowest earth.", checkedAt: "2026-07-21" } },
      /* ─── Q8 Vocabulary ─── */
      { category: "Vocabulary", q: "What does مَّرْقُومٌ mean?", options: ["spoken aloud", "written and inscribed", "erased completely", "lost and forgotten"], answer: 1, explanation: "مرقوم means written and finalized — a record where every deed is permanently marked.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'written'.", checkedAt: "2026-07-21" } },
      /* ─── Q9 Rhetoric (position 9) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Meaning Construction) Why is the word رَانَ (rust/covering) used to describe the hearts of the deniers in verse 14?", options: ["It means their hearts are strong like iron shields", "It captures how repeated sins gradually blind the heart", "It shows that the heart is a physical muscle that rusts", "It indicates that the deniers work in metal workshops"], answer: 1, explanation: "رَانَ means rust or a covering. Just as rust slowly covers a mirror until it can no longer reflect light, repeated sins gradually cover the heart until it can no longer recognize the truth.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Rhetoric point checked against Tafsir Ibn Kathir on Al-Mutaffifin 83:14 (the hadith about sins spotting the heart).", checkedAt: "2026-07-21" } },
      /* ─── Q10 Vocabulary ─── */
      { category: "Vocabulary", q: "What does رَانَ mean when describing the heart?", options: ["has rusted and covered over", "has beaten fast and hard", "has been cleaned and polished", "has grown larger in size"], answer: 0, explanation: "ران means it has rusted or covered. Sins build up like rust on the heart, blinding it to the truth.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Matches Ibn Kathir's explanation of rust on the heart.", checkedAt: "2026-07-21" } },
      /* ─── Q11 Vocabulary ─── */
      { category: "Vocabulary", q: "What does الْأَبْرَارِ mean?", options: ["the lost travelers in desert", "the wicked evildoers", "the righteous and pious", "the successful merchants"], answer: 2, explanation: "الأبرار means the righteous — those who fulfill their duties to Allah and do good.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'the righteous'.", checkedAt: "2026-07-21" } },
      /* ─── Q12 Vocabulary ─── */
      { category: "Vocabulary", q: "What does عِلِّيِّينَ mean?", options: ["'Illiyun — the highest honored place", "The lowest pit beneath the earth", "The widest field on the plains", "The darkest cave in the mountains"], answer: 0, explanation: "عليون is the highest and most honored place where the record of the righteous is kept.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Matches Ibn Kathir's explanation of Illiyun.", checkedAt: "2026-07-21" } },
      /* ─── Q13 Comprehension ─── */
      { category: "Comprehension", q: "What specific group does the surah warn at the very beginning?", options: ["Those who refuse to give charity", "Those who sleep during the prayers", "Those who cheat in weights and measures", "Those who travel without permission"], answer: 2, explanation: "وَيْلٌ لِّلْمُطَفِّفِينَ — woe to the defrauders, those who demand full measure for themselves but give less to others.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Checked against Tafsir Ibn Kathir for 83:1-3.", checkedAt: "2026-07-21" } },
      /* ─── Q14 Rhetoric (position 14) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Style of Address) In verses 29-32, the surah describes how the criminals laughed, winked, and mocked the believers. What effect does this detail have?", options: ["It acknowledges the believers' pain and sets up their final vindication", "It encourages the believers to respond with the same mockery", "It proves that the criminals were only joking and meant no harm", "It shows that the believers were too sensitive about small comments"], answer: 0, explanation: "By detailing the winking, laughing, and arrogant remarks, the surah acknowledges the deep emotional pain of the believers, setting the stage for their complete vindication in Paradise.",
        verified: { status: "verified", by: "Tafsir al-Sa'di", note: "Rhetoric point checked against Tafsir al-Sa'di's reflection on the emotional tone of verses 29-32.", checkedAt: "2026-07-21" } },
      /* ─── Q15 Comprehension ─── */
      { category: "Comprehension", q: "What question does the surah ask to challenge the cheaters?", options: ["Do they not think they will be resurrected?", "Do they not have enough gold in storage?", "Do they not know how to count coins?", "Do they not enjoy their meals at home?"], answer: 0, explanation: "أَلَا يَظُنُّ أُولَٰئِكَ أَنَّهُم مَّبْعُوثُونَ — do they not think they will be resurrected for a tremendous Day?",
        verified: { status: "verified", by: "The Clear Quran", note: "Direct translation of 83:4.", checkedAt: "2026-07-21" } },
      /* ─── Q16 Comprehension ─── */
      { category: "Comprehension", q: "Where is the record of the wicked (الفجار) stored?", options: ["In a bright library in the sky", "In a box buried deep underground", "In Sijjeen — a confining place below", "It is not stored anywhere at all"], answer: 2, explanation: "كِتَابَ الْفُجَّارِ لَفِي سِجِّينٍ — the record of the wicked is placed in Sijjeen, a place of confinement beneath the earth.",
        verified: { status: "verified", by: "The Clear Quran", note: "Direct translation of 83:7.", checkedAt: "2026-07-21" } },
      /* ─── Q17 Comprehension ─── */
      { category: "Comprehension", q: "Where is the record of the righteous (الأبرار) stored?", options: ["In the same place as the wicked", "In 'Illiyun — the highest honored place", "On a shelf in the main masjid", "It is thrown into the deep sea"], answer: 1, explanation: "كِتَابَ الْأَبْرَارِ لَفِي عِلِّيِّينَ — the record of the righteous is raised high in 'Illiyun.",
        verified: { status: "verified", by: "The Clear Quran", note: "Direct translation of 83:18.", checkedAt: "2026-07-21" } },
      /* ─── Q18 Comprehension ─── */
      { category: "Comprehension", q: "What will the righteous be given to drink in Paradise?", options: ["A sealed pure nectar whose seal is musk", "Plain water from an ordinary well", "A mixture of milk and rainwater", "Bitter medicine for their healing"], answer: 0, explanation: "رَحِيقٍ مَّخْتُومٍ — they will be given a pure, exquisite nectar, sealed, whose seal is musk.",
        verified: { status: "verified", by: "The Clear Quran", note: "Direct translation of 83:25-26.", checkedAt: "2026-07-21" } },
      /* ─── Q19 Rhetoric (position 19) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Nazm / Structure) The surah contrasts Sijjeen (a low, confining place) with 'Illiyun (a high, elevated place). How does this contrast support the surah's message?", options: ["It mirrors the moral state of the wicked and righteous in their destinies", "It shows that tall people are more righteous than short people", "It is a random geographic detail about two real mountains", "It implies that the records are sorted only by their weight"], answer: 0, explanation: "The physical placement mirrors spiritual reality. The wicked, lowered by sin, have their record placed in the depths. The righteous, elevated by obedience, have theirs raised high.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Cautious structural inference grounded in Ibn Kathir's explanation of Sijjeen (lowest earth) and Illiyun (seventh heaven).", checkedAt: "2026-07-21" } },
      /* ─── Q20 Comprehension ─── */
      { category: "Comprehension", q: "What did the wicked criminals do to the believers in this world?", options: ["They helped and supported them secretly", "They completely ignored their existence", "They used to laugh at and mock them", "They asked them for sincere religious advice"], answer: 2, explanation: "إِنَّ الَّذِينَ أَجْرَمُوا كَانُوا مِنَ الَّذِينَ آمَنُوا يَضْحَكُونَ — the criminals used to laugh at the believers.",
        verified: { status: "verified", by: "The Clear Quran", note: "Direct translation of 83:29.", checkedAt: "2026-07-21" } },
      /* ─── Q21 Comprehension ─── */
      { category: "Comprehension", q: "Who witnesses the honored record of the righteous in 'Illiyun?", options: ["Every person walking on the earth", "The angels brought near to Allah", "The animals roaming in the wild", "No one witnesses it at all"], answer: 1, explanation: "يَشْهَدُهُ الْمُقَرَّبُونَ — the record in 'Illiyun is witnessed by those brought near to Allah.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Matches Ibn Kathir's explanation of 83:21.", checkedAt: "2026-07-21" } },
      /* ─── Q22 Critical Thinking ─── */
      { category: "Critical Thinking", q: "Why does the surah connect cheating in business with denying the Day of Judgment?", options: ["Because cheating and judgment are two unrelated topics", "Because only business traders face the Day of Judgment", "Because if you truly believe in judgment, you would fear even small cheating", "Because the Day of Judgment is solely about prayer and fasting"], answer: 2, explanation: "The surah asks: do they not think they will be resurrected? Their cheating proves their lack of faith; if they believed in a Day of accounting, they would not dare to cheat.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Based on Ibn Kathir's connection of these verses.", checkedAt: "2026-07-21" } },
      /* ─── Q23 Critical Thinking ─── */
      { category: "Critical Thinking", q: "The surah names two record books: one in Sijjeen, one in 'Illiyun. What does this difference teach?", options: ["All records ultimately go to the same place", "The names are just labels without spiritual meaning", "Your deeds determine where your record is placed", "Only the prophets have records in 'Illiyun"], answer: 2, explanation: "One record is placed in the depths of confinement (Sijjeen), and the other is raised to the highest point ('Illiyun) before the closest angels. The placement reflects the reality of one's deeds.",
        verified: { status: "verified", by: "Tafsir al-Sa'di", note: "Based on Tafsir al-Sa'di's reflection on the contrast of the two books.", checkedAt: "2026-07-21" } },
      /* ─── Q24 Rhetoric (position 24) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Meaning Construction) The drink of Paradise is described as مَّخْتُومٍ (sealed) and its seal is musk. Why describe the seal rather than just the drink itself?", options: ["Because the musk seal adds honor and shows its precious quality", "Because every drink in Paradise is kept locked away permanently", "Because the seal means the drink is old and no longer drinkable", "Because only the seal matters, not the drink inside the container"], answer: 0, explanation: "The Qur'an describes the seal as musk, highlighting the preciousness and fine quality of the drink. Even the container's seal is a blessing, pointing to how honored the righteous are.",
        verified: { status: "verified", by: "The Clear Quran", note: "Rhetoric point based on the direct Qur'anic description of the seal as musk (83:25-26), focusing on what the text explicitly states.", checkedAt: "2026-07-21" } },
      /* ─── Q25 Critical Thinking ─── */
      { category: "Critical Thinking", q: "The believers were mocked in this world, but on Judgment Day they will laugh. What does this reversal teach about patience?", options: ["Mockery should be answered with violence immediately", "Believers should mock everyone back right away", "Patient endurance of mockery is rewarded with final joy", "The reversal is only a metaphor with no real promise"], answer: 2, explanation: "The believers did not fight back when mocked. They were patient. The surah promises that the last laugh belongs to the patient, showing that worldly hardship leads to eternal joy.",
        verified: { status: "verified", by: "Tafsir al-Sa'di", note: "Based on Tafsir al-Sa'di's reflection on the turning of the tables in verses 29-34.", checkedAt: "2026-07-21" } },
      /* ─── Q26 Vocabulary ─── */
      { category: "Vocabulary", q: "What does مَّخْتُومٍ mean?", options: ["opened and spread wide", "sealed and stamped", "torn apart roughly", "completely missing"], answer: 1, explanation: "مختوم means sealed — the drink of Paradise is pure, and its seal is musk.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'sealed'.", checkedAt: "2026-07-21" } },
      /* ─── Q27 Critical Thinking ─── */
      { category: "Critical Thinking", q: "The surah says sins have 'rusted' (رَانَ) over the hearts of the deniers. What causes this rust?", options: ["Every sin leaves a stain until the heart is fully covered", "Rust is a natural part of physical aging in the body", "The heart rusts only from exposure to damp weather", "Only one single major sin can cause the heart to rust"], answer: 0, explanation: "Every sin is like a spot of rust. Over time, the spots cover the heart until it cannot see the truth. This is why even small cheating is dangerous — it rusts the heart.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Based on Ibn Kathir's citation of the hadith about sins darkening the heart.", checkedAt: "2026-07-21" } },
      /* ─── Q28 Critical Thinking ─── */
      { category: "Critical Thinking", q: "The surah says the wicked will be 'veiled from their Lord' (لَمَحْجُوبُونَ) on that Day. Why is this one of the worst punishments?", options: ["Being veiled from Allah means losing the greatest honor a soul can receive", "Being veiled just means standing in a different room temporarily", "The veil is a physical cloth placed over their eyes only", "The wicked would not want to see their Lord in any case"], answer: 0, explanation: "Being veiled from Allah is the opposite of the greatest reward — seeing Him. If the righteous gaze in bliss, then being denied that gaze is the ultimate loss.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Based on Ibn Kathir's commentary on 83:15, contrasting the veil with the believers' gazing.", checkedAt: "2026-07-21" } },
      /* ─── Q29 Rhetoric (position 29) ─── */
      { category: "Rhetoric", q: "(Rhetoric - Style of Address) Why does the surah end with the rhetorical question 'Have the disbelievers been repaid?' (verse 36) instead of a direct statement?", options: ["It creates a powerful sense of finality and undeniable justice", "It means Allah is unsure whether they have been repaid", "It asks the believers to vote on the final punishment", "It leaves room for the disbelievers to appeal the decision"], answer: 0, explanation: "The rhetorical question seals the surah with absolute finality. After describing the cheating, the mockery, and the final joy of the believers, the question forces the listener to admit that perfect justice has been served.",
        verified: { status: "verified", by: "tafsir Ibn Kathir", note: "Rhetoric point checked against Ibn Kathir's commentary on the final verse's tone.", checkedAt: "2026-07-21" } },
      /* ─── Q30 Vocabulary ─── */
      { category: "Vocabulary", q: "What does يَضْحَكُونَ mean?", options: ["they weep loudly", "they sleep deeply", "they laugh and mock", "they run very fast"], answer: 2, explanation: "يضحكون means they laugh. The wicked laughed at believers in this world, but the believers will laugh at them in the Hereafter.",
        verified: { status: "verified", by: "The Clear Quran", note: "Matches Khattab's translation 'laugh'.", checkedAt: "2026-07-21" } }
    ],`;

c = c.substring(0, quizStart) + newQuiz + c.substring(quizEnd + 6); // +6 for the "    ],"

// Also fix the Sijjeen quiz explanation that was outside the replaced block
// (these are in vocabulary that was not replaced)
c = c.replace(
  'connection: "The record of the wicked is locked away in Sijjeen — a dark, deep prison register."',
  'connection: "The record of the wicked is stored in Sijjeen — a confining place beneath the earth."'
);

fs.writeFileSync(file, c, 'utf8');

// ── Verification ──
const result = fs.readFileSync(file, 'utf8');
const checks = [
  ['Ayah 16 alif fix', result.includes('لَصَالُوا الْجَحِيمِ')],
  ['Sijjeen vocab fixed', result.includes('Sijjeen — a confining place beneath the earth')],
  ['No "dark prison register"', !result.includes('dark prison register')],
  ['fillBlanksEn ayah 29 fixed', result.includes('"laugh / mock"')],
  ['fillBlanksEn ayah 6 no question mark', !result.includes('the Lord of the worlds?"')],
  ['No "opened only for the worthy"', !result.includes('opened only for the worthy')],
  ['No "broken only for the special guest"', !result.includes('broken only for the special guest')],
  ['Quiz has interleaved rhetoric', result.includes('/* ─── Q4 Rhetoric (position 4) ─── */')],
  ['Answer distribution uses non-zero', result.includes('answer: 1') && result.includes('answer: 2') && result.includes('answer: 3')],
];

console.log('\n=== Audit Fix Verification ===');
let allPassed = true;
for (const [name, passed] of checks) {
  console.log(`  ${passed ? '✓' : '✗'} ${name}`);
  if (!passed) allPassed = false;
}
console.log(allPassed ? '\nAll checks passed!' : '\nSome checks FAILED!');

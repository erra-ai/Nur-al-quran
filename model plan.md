# Surah Learning Module Build Specification

## Purpose

This document is the implementation contract for adding or rebuilding a surah in the Nur al-Qur'an app. An AI coder must follow it together with:

- `README-SOURCES.md` for sourcing, verification, reading level, rhetoric, and Meaning Bank rules.
- `TRANSLATION-SOURCES.md` for approved translations, exact source names, and how to fetch the tafsir.
- `preflight.js`, `vocab-audit.js`, and `verify-translations.js` for automated checks.

**Precedence.** Where this document and `README-SOURCES.md` disagree on sourcing, verification, or wording, **`README-SOURCES.md` wins** — it is kept current, and parts of this file are older. Report the contradiction rather than silently following one.

Do not treat an older surah object as automatically correct. Most existing modules do not conform; `preflight.js` reports which. **Use Surah Al-'Alaq (96) as the reference module**, with Al-'Adiyat (100) as a second example. Al-'Alaq was rebuilt from nothing under the current rules and is the closest model for a new build. Al-Buruj, At-Tariq and Al-A'la are structurally sound but predate the single-tafsir and answerable-from-the-module rules — do not copy their sourcing.

## How to build the module object

Do not hand-edit thirty questions into a two-megabyte file. Build the module as a JavaScript object in a scratch script, serialise it, and splice it over the old object. Everything below was learned by getting it wrong at least once.

- **Write every quiz answer at index 0 while drafting**, then spread the indexes afterwards by rotating each question's options. Trying to place answers at varied indexes by hand while also writing the content produces mistakes.
- **Dry-run every scripted edit before writing.** Print what will change, verify it, then re-run with `--apply`. A script that rewrites app.html must prove it changed only what it meant to.
- **After any rewrite, re-evaluate the array and compare against the original**: same module count, same question count, correct-answer *text* unchanged, option sets identical. Rotating options is safe only if you check the correct answer still points at the same string.
- **Back up `app.html` before a scripted write.**
- Regenerate nothing by hand that a check can verify: counts, banks, ayah coverage, category mix.

## Product Goal

The audience is approximately sixth-grade students. Teach Qur'anic Arabic through simple English so the learner understands the surah rather than memorizing quiz answers.

The learning movement is:

`Arabic word -> simple English meaning -> use in the verse -> meaning of the passage -> moral understanding -> thoughtful application`

Student-facing writing must be:

- Clear enough for ages 10-13.
- Respectful and theologically careful.
- Brief without becoming vague.
- Based on the verse, reliable translation, Arabic morphology, and trusted tafsir.
- Free from unsupported claims, dramatic embellishment, and generic filler.

## Technical Boundary

The app is a single-page application in `app.html`, using HTML, CSS, and vanilla JavaScript. The reusable rendering engine already exists. A normal surah-building task should add or replace one object in the `surahs` array and should not create a second engine.

Do not change global UI behavior, CSS, navigation, scoring, or another surah unless the requested module cannot work correctly without a narrowly scoped engine fix.

Every surah object must contain:

```js
{
  id: "buruj",
  number: 85,
  nameArabic: "الْبُرُوجِ",
  nameEnglish: "Al-Buruj",
  title: "The Mansions of the Stars",
  intro: "...",
  vocabulary: [/* vocabulary objects */],
  practice: [/* practice objects */],
  quiz: [/* exactly 30 quiz objects */],
  fillBlanks: { ayahs: [/* complete Arabic ayah data */] },
  fillBlanksEn: { ayahs: [/* complete simple-English ayah data */] }
}
```

Use the exact property names above. The engine derives the following activities from them:

- `vocabulary` -> Vocabulary Cards and Match Words.
- `practice` -> ungraded vocabulary practice.
- `quiz` -> graded 30-question quiz.
- `fillBlanks` -> Arabic Meaning Blanks and Order the Verses.
- `fillBlanksEn` -> English Meaning Bank.

## Required Research Before Writing

Do not draft the module from memory.

1. **Fetch the tafsir first, before writing anything:**

   ```sh
   node fetch-tafsir.js <surah-number> <slug>    # e.g. node fetch-tafsir.js 100 adiyat
   ```

   This writes `tafsir-notes/<number>-<slug>-ibn-kathir.md` from the quran.com API. Every `verified` note you write must quote a line from that file. **Do not scrape tafsir web pages** — a summarised page returns a paraphrase, not his words, and paraphrases drop things silently. See `TRANSLATION-SOURCES.md`.
2. Read the complete surah in at least three trusted English translations:
   - ClearQuran (Talal Itani) for primary student wording. The graded presentation at quranfor.com/teens helps pitch the level for ages 10-12.
   - Saheeh International for closeness to the Arabic.
   - Abdul Haleem for natural English.
3. **Use Tafsir Ibn Kathir only.** It is the single tafsir permitted in `verified.by`. Other tafsirs may inform your reading but must not be cited, and no scholar other than Ibn Kathir is ever named in student-facing text. See the single-tafsir rule in `README-SOURCES.md` for why: the audience is 10-12 and competing readings confuse rather than deepen.
4. Check every selected Arabic vocabulary form in the Qur'anic Arabic Corpus. Confirm the exact spelling, verse location, part of speech, morphology, and grammatical role.
5. For every rhetoric question, locate a specific tafsir-supported point before writing the question or answer.
6. Keep a list of the exact source and verse range used for each claim.

Quran.com word-by-word and the Qur'anic Arabic Corpus support language analysis, but they are not sufficient by themselves for tafsir, nazm, tone, imagery, or theological explanation.

## Chapter-Size Vocabulary Rule

Choose the vocabulary count from the number of ayahs before selecting words. For all newly built or rebuilt modules, use this deterministic table:

| Surah length | Core vocabulary count |
| --- | ---: |
| 3-4 ayahs | 10 |
| 5-6 ayahs | 12 |
| 7-11 ayahs | 14 |
| 12 or more ayahs | 16 |

The maximum is 16 words. A long surah still uses 16 carefully selected core words rather than every difficult word.

Some legacy modules have counts between these targets. Do not copy those exceptions into new work. Normalize an older module to this table when it is explicitly rebuilt.

Select words that carry the main movement of the surah. Cover different passages where possible. Avoid spending several cards on near-duplicate forms when another word would give the student broader understanding.

## Vocabulary Card Contract

Each vocabulary object must use this complete shape:

```js
{
  arabic: "نَقَمُوا",
  meaning: "they resented / found fault",
  connection: "The persecutors found no fault in the believers except their faith in Allah.",
  hint: "They treated something good as if it deserved blame.",
  source: {
    primary: "Qur'anic Arabic Corpus",
    ref: "Al-Buruj 85:8 word-by-word morphology",
    checkedAt: "YYYY-MM-DD"
  },
  verified: {
    status: "verified",
    by: "corpus.quran.com",
    note: "Meaning and grammar checked against the Qur'anic Arabic Corpus word-by-word analysis for Al-Buruj 85:8.",
    checkedAt: "YYYY-MM-DD"
  },
  grammar: {
    english: "Perfect verb, third person masculine plural",
    arabic: "فعل ماض للغائب الجمع المذكر",
    explanation: "نَقَمُوا is a past-tense verb. The ending وا marks the masculine plural subject: 'they resented.'"
  }
}
```

Every card requires all of the following:

- The exact Arabic form as it appears in the ayah, including diacritics used by the app.
- A concise simple-English meaning, not an entire tafsir sentence.
- A verse connection explaining how the word contributes to its ayah.
- A useful memory hint that does not give a quiz answer through unrelated wording.
- Arabic lexical/morphological source metadata.
- Translation or tafsir verification metadata.
- English part of speech or morphology.
- Equivalent Arabic grammar terminology.
- A short grammar explanation showing why that label applies in this verse.

The grammar explanation must teach, not merely repeat the label. Explain a visible clue such as tense, attached pronoun, case ending, definiteness, number, gender, active/passive form, preposition, or syntactic relationship. Keep it suitable for a beginner.

## Practice Contract

Create exactly one practice item per vocabulary card. Therefore:

`practice.length === vocabulary.length`

Every selected vocabulary word must be practiced once. Mix Arabic-to-English and English-to-Arabic recognition where the current engine supports it. Each item has four plausible options and one correct answer.

```js
{
  q: "What does نَقَمُوا mean?",
  options: [
    "they resented / found fault",
    "they returned with joy",
    "they guarded the believers",
    "they prepared the gardens"
  ],
  answer: 0,
  explanation: "نَقَمُوا means they resented or found fault. Verse 8 says the believers were blamed only for believing in Allah."
}
```

Practice is ungraded preparation. It should test vocabulary recognition rather than introduce unsupported interpretation.

## Meaning Blanks, Meaning Bank, and Verse Order

These three activities are mandatory for every newly built or rebuilt surah.

### Arabic Meaning Blanks

`fillBlanks.ayahs` must include every ayah in the surah, in correct order, with the correct ayah number. Split each ayah into segment objects:

- `{ t: "..." }` for normal visible Arabic text.
- `{ b: "...", m: "..." }` for a draggable vocabulary blank.

Example:

```js
fillBlanks: {
  ayahs: [
    {
      n: 1,
      segments: [
        { t: "وَالسَّمَاءِ ذَاتِ " },
        { b: "الْبُرُوجِ", m: "the great stars / constellations" }
      ]
    }
  ]
}
```

Across the complete `fillBlanks.ayahs` array:

- Every `vocabulary[].arabic` value must occur as a `b` value exactly once.
- No other Arabic word may be a `b` value.
- Each paired `m` value must exactly equal that vocabulary card's `meaning`.
- Non-vocabulary Arabic remains in `t` segments and never enters the draggable bank.

The Order the Verses activity is generated from `fillBlanks.ayahs`. Do not create a separate “Your Order,” numbered-position list, or arrow controls. The existing interface lets students drag verse cards vertically. Supplying complete and correctly ordered Arabic ayahs is therefore required for both activities.

### English Meaning Bank

`fillBlanksEn.ayahs` must include every ayah in the surah, in correct order, using clear simple English. Split each ayah into:

- `{ t: "..." }` for normal visible English text.
- `{ b: "...", m: "..." }` for a draggable English meaning.

Example:

```js
fillBlanksEn: {
  ayahs: [
    {
      n: 1,
      segments: [
        { t: "By the sky containing " },
        { b: "the great stars / constellations", m: "الْبُرُوجِ" }
      ]
    }
  ]
}
```

Across the complete `fillBlanksEn.ayahs` array:

- Every `vocabulary[].meaning` value must occur as a `b` value exactly once.
- No extra English meaning may be a `b` value.
- Each paired `m` value must exactly equal the corresponding `vocabulary[].arabic` value.
- Sentence frames must remain grammatical after the blank is filled. Read every completed sentence aloud during review.

The Arabic and English banks must have the same count as the vocabulary target. The sets must match exactly, including punctuation, slashes, articles, and Arabic spelling.

## Main Quiz Contract

Every surah has exactly 30 quiz questions with this category mix:

| Category value | Count |
| --- | ---: |
| `Vocabulary` | 12 |
| `Comprehension` | 7 |
| `Critical Thinking` | 5 |
| `Rhetoric` | 6 |
| **Total** | **30** |

Each question must use:

```js
{
  category: "Comprehension",
  q: "What does the detail that the persecutors sat watching reveal?",
  options: [
    "They had no responsibility because they remained seated",
    "They intended to rescue the believers after the trial",
    "They were unable to see what the fire was doing",
    "They knowingly witnessed and continued their cruelty"
  ],
  answer: 3,
  explanation: "They were present and watched what they did to the believers, so the passage removes any excuse of ignorance or accident.",
  verified: {
    status: "verified",
    by: "tafsir Ibn Kathir",
    note: "Ibn Kathir on Al-Buruj 85:6-7: <quote the sentence relied on, so the sign-off can be checked by someone who was not there>.",
    checkedAt: "YYYY-MM-DD"
  }
}
```

Rules:

- `options` always contains exactly four strings.
- `answer` is the zero-based index of the correct option.
- `explanation` teaches why the answer is correct; it does not merely restate it.
- Every question has valid `verified` metadata, not only rhetoric questions.
- The runtime shuffles both question order and answer choices, so metadata must remain attached to the question object and `answer` must point to the unshuffled source options.

### Vocabulary Questions

Use 12 vocabulary questions. Cover the selected word set broadly and avoid testing the same easy word repeatedly. Questions may test meaning, context-sensitive meaning, or a simple grammar distinction already taught on the card.

### Comprehension Questions

Use 7 questions about what the ayahs say, who is addressed, what happens, and how the main passages relate. The answer must be directly supported by the surah and verified translation or tafsir.

### Critical Thinking Questions

Use 5 questions requiring a reasonable inference, moral connection, contrast, or application grounded in the surah. Do not turn a personal opinion into the only “correct” religious answer.

## Rhetoric Question Contract

Use exactly 6 questions whose `category` is exactly `"Rhetoric"`. Do not label them `Balagha`, `B - ...`, `Critical Thinking`, or another category in the data.

Use exactly two questions from each area:

1. **Meaning Construction and Translation**
   - Why a particular English word was chosen for an Arabic expression.
   - The difference between two plausible translations.
   - How the translation choice changes or sharpens understanding.
2. **Nazm (Structure) and Logical Order**
   - Why one verse or passage follows another.
   - How an opening, example, warning, promise, or conclusion connects to the surrounding passage.
   - Why information is delayed, repeated, contrasted, or returned to later.
3. **Style of Address and Contextual Suitability**
   - Why a particular image, oath, question, command, example, tone, or repetition suits the context.
   - What effect the style has on the listener.

Do not pin rhetoric questions to fixed source positions. The rule is simply **6 rhetoric questions**, and **all 30 questions mixed** so no category is clustered together.

Mixed means, in the source array:

- No two rhetoric questions sit next to each other.
- No more than 4 questions in a row share the same category.
- The 6 rhetoric questions are spread across the whole array, not bunched into one half.

The engine also shuffles question order at runtime, so a student meets them randomly regardless. Mixing the source as well keeps the file readable as a lesson rather than as four separate blocks.

The limit of 4 targets modules that are genuinely blocked rather than merely uneven. Thirteen legacy modules run 10 questions of one category back to back; that is a different shape, not a small drift. A single run of 4 in an otherwise mixed quiz is acceptable.

Each rhetoric question must:

- Be understandable to ages 10-13 without specialist Arabic knowledge.
- Name or quote the exact word, phrase, image, or passage being examined.
- Ask one explicit question rather than an ambiguous “What is true?” prompt.
- Have one clearly best answer and three plausible but textually wrong distractors.
- Be supported by trusted tafsir, with the tafsir and verse range named in `verified.note`.
- Explain the deeper connection in the feedback without overclaiming that tafsir states an inference word-for-word.

If the point is a careful inference from tafsir rather than an explicit tafsir statement, say so in the note: `Cautious structural inference grounded in ...`.

Never populate or preserve generic filler such as:

- “which misses the deeper connection the surah makes”
- “to make the surah longer”
- “because the surah is incomplete”
- “Allah did not know them”
- absurd denials included only to make the answer obvious

## Anti-Guessing and No-Giveaway Rules

The learner should need understanding, not test-taking tricks.

- Keep option lengths reasonably balanced.
- The correct answer must not be the only detailed, grammatical, respectful, or positive option.
- The correct answer must not exceed every distractor by two or more words.
- Include some short correct answers and some longer distractors across the quiz.
- Distribute source answer indexes approximately evenly. For 30 questions, use a distribution close to `8, 8, 7, 7` across indexes 0-3.
- Avoid repeated answer patterns.
- Distractors must be plausible enough to require reading, but clearly wrong after understanding the lesson.
- Do not use wording from the explanation only in the correct option.
- Do not reveal the answer to one question in another question.
- Do not ask theology through obviously disrespectful distractors.
- Do not use “all of the above” or “none of the above.”

## Introduction Contract

Write one coherent paragraph that introduces the complete movement of the surah. It should normally mention:

- The opening image, oath, question, or command.
- The main passage or argument.
- The central warning and/or promise.
- The ending and how it completes the message.

Do not turn the introduction into a verse-by-verse commentary. Do not disclose quiz answers using identical wording. Verify all interpretive statements against Ibn Kathir.

The intro is the first text a student reads, so it carries its own sign-off. Every module with an `intro` must also have an `introVerified` block, in the same shape as `verified`, as a sibling field on the surah object:

```js
intro: "...",
introVerified: {
  status: "verified",
  by: "tafsir Ibn Kathir",
  note: "Summary of <surah> checked against Tafsir Ibn Kathir. <Anything deliberately left out, and why.>",
  checkedAt: "YYYY-MM-DD"
},
```

`verify-translations.js` reports missing intro sign-offs in their own section.

Watch for wording copied between modules. A summary of Al-'Adiyat 100:9 once read "the graves will be overturned" — that is Al-Infitar 82:4, where the graves are the subject. In 100:9 the verb acts on **what is in** the graves. Two surahs with similar imagery is where this class of error comes from.

## Content Assembly Workflow

Follow this order for each surah:

1. Inspect the existing surah object and engine behavior.
2. Confirm the surah's ayah count and choose the vocabulary target from the table.
3. Research the complete surah using approved translations, Corpus morphology, and trusted tafsir.
4. Select the exact core vocabulary set.
5. Build and verify all vocabulary cards, including grammar.
6. Build one practice item per vocabulary card.
7. Build complete `fillBlanks` Arabic ayahs with exactly the selected words blanked.
8. Build complete `fillBlanksEn` English ayahs with exactly the selected meanings blanked.
9. Build the 30-question quiz using the exact category mix.
10. Write the 6 tafsir-grounded rhetoric questions and interleave them at the required source positions.
11. Audit answer balance, option length, clarity, and theological respect.
12. Run automated checks.
13. Test every activity in the browser on desktop and mobile.
14. Leave the app on the completed surah's introduction screen.

Do not stop after adding vocabulary or quiz data. A surah is not complete until every required activity and verification step passes.

## Required Automated Checks

Run:

```sh
node preflight.js
node vocab-audit.js
node verify-translations.js
```

Also run a direct module-specific data validation that confirms:

- Vocabulary count equals the chapter-size target.
- Every vocabulary card has `source`, `verified`, and complete `grammar` fields.
- Practice count equals vocabulary count.
- Quiz count is exactly 30.
- Category counts are exactly 12 Vocabulary, 7 Comprehension, 5 Critical Thinking, and 6 Rhetoric.
- Exactly 6 rhetoric questions, and all 30 questions mixed: no two rhetoric adjacent, no more than 3 consecutive questions of one category, rhetoric spread across both halves.
- The six rhetoric items contain exactly two questions from each required area.
- Every quiz item has four options, a valid answer index, explanation, and verified metadata.
- Correct-answer source indexes are balanced near `8, 8, 7, 7`.
- No correct answer has obvious length bias.
- No banned generic filler remains.
- Arabic blank set exactly equals `vocabulary[].arabic`.
- English blank set exactly equals `vocabulary[].meaning`.
- Every Arabic and English ayah number appears once and in order.

The three repository-wide audits may expose older unrelated modules. Record those separately, but the newly built module itself must have no warnings or unverified content.

## Required Browser Verification

Use the running app, not only static inspection. Test at minimum:

1. Open the surah from the Surahs menu.
2. Confirm the title, Arabic name, introduction, and all activity buttons render.
3. Open Vocabulary Cards and inspect the first, middle, and last cards.
4. Confirm English grammar, Arabic grammar, and the explanation fit without clipping.
5. Complete or sample Vocabulary Practice and verify answer feedback.
6. Open Meaning Bank and confirm all target words are present and completed English sentences are grammatical.
7. Open Meaning Blanks and confirm all target Arabic words are present.
8. Open Order the Verses and confirm cards drag vertically without arrow controls or a separate “Your Order” panel.
9. Start the quiz, answer at least one question correctly and one incorrectly, and inspect feedback.
10. Repeat the key screens at a mobile viewport around 390 x 844.
11. Check browser console errors and warnings.

Fix overflow, overlap, broken text, missing data, awkward blank sentence frames, and console errors before reporting completion.

## Build Checklist

Follow in order. Al-'Adiyat (100) in `app.html` is the worked example of every step.

1. **Fetch the sources.** Do not write a word before both files exist.

   ```sh
   node fetch-tafsir.js <number> <slug>        # tafsir-notes/
   node fetch-translation.js <number> <slug>   # translation-notes/
   ```

   Never scrape a tafsir page by hand.
2. **Read** the surah in ClearQuran (Talal Itani), Saheeh International and Abdul Haleem, and read the whole tafsir file.
3. **Count the ayahs** and take the vocabulary target from the chapter-size table. Fix this number before choosing any words.
4. **Choose vocabulary** carrying the surah's main movement. Check each form in the Qur'anic Arabic Corpus for spelling, location, morphology and role.
5. **Write vocabulary cards** with `source`, `verified`, and complete bilingual `grammar`.
6. **Write one practice item per card.** `practice.length === vocabulary.length`.
7. **Write the intro** plus its `introVerified` block.
8. **Write 30 quiz questions**: 12 Vocabulary, 7 Comprehension, 5 Critical Thinking, 6 Rhetoric. Give every rhetoric question a `rhetoricArea`, two from each of the three areas.
9. **Check every question is answerable from the module** — surah, intro, translation, vocabulary cards. Nothing else. Tafsir verifies the answer; it is not something the student has read.
10. **Spread the source answer indexes** to ~8,8,7,7 with the tool — never by hand:

    ```sh
    node redistribute-answers.js <slug> --apply
    ```

    It rotates each question's options and moves the `answer` index to match, so the correct answer text is unchanged. Then **mix the categories** so no more than 4 of one category sit in a row and no two rhetoric are adjacent.
11. **Build** Meaning Blanks and Meaning Bank. Include **every ayah of the surah** in `fillBlanks.ayahs` and `fillBlanksEn.ayahs`, numbered from 1 with no gaps. Ayahs carrying no vocabulary word still appear, as plain `{ t: "..." }` segments. Order the Verses is generated from `fillBlanks.ayahs`, so an ayah omitted here vanishes from that activity too, silently. `preflight.js` checks this.
12. **Run the audits.** The new module must be clean even though older modules are not:

    ```sh
    node vocab-audit.js
    node verify-translations.js
    PREFLIGHT_STRICT_CONTRACT=1 PREFLIGHT_STRICT_LENGTH=1 node preflight.js
    node verify-quotes.js <slug>     # reviewer aid — read its list by eye
    ```

    `verify-quotes.js` is not a pass/fail gate. It lists the Ibn-Kathir/Itani
    notes that do not share verbatim wording with the source files. Read each
    one: it is an accurate paraphrase, an honestly-labelled inference, or an
    invented claim, and only reading tells you which. A script cannot decide
    this, so it is never skipped by trusting a green result — there is no green.

13. **Do NOT run `pad-bias.js`.** It is still in the repo. It pads distractor
    options with generic filler ("in this world", "as a whole") — the exact weak
    wording the rules tell you to remove. Same for `fix-distractors.js` and
    `fix-final.js`. Leave all three alone.

14. **Browser-verify** per the section above, desktop and mobile, no console errors.
15. **Remove temporary scripts** unless they are being added deliberately as permanent tooling.

## Definition of Done

A surah is complete only when:

- Its full data object follows the current schema.
- Its vocabulary count follows the chapter-size table, and `practice.length === vocabulary.length`.
- Vocabulary cards include beginner-friendly bilingual grammar teaching.
- Practice, both banks, blanks, and verse order use the same vocabulary set.
- The quiz has exactly 30 questions with the mix 12 / 7 / 5 / 6.
- Exactly 6 Rhetoric questions, tagged `rhetoricArea`, two from each of the three areas, none labelled in the question text.
- Every question is answerable from the module alone.
- Every `verified` and `introVerified` note quotes the source line it rests on, and cites Ibn Kathir as the only tafsir.
- No answer is exposed by length, tone, absurd distractors, or repeated filler.
- Source answer indexes are spread ~8,8,7,7 and the categories are mixed.
- All three audits pass for this module, with `PREFLIGHT_STRICT_CONTRACT=1` and `PREFLIGHT_STRICT_LENGTH=1`.
- Desktop and mobile browser checks pass without console errors.
- Temporary generation or validation scripts have been removed unless intentionally added as permanent project tooling.

When reporting completion, name the surah, summarize the counts, confirm Ibn Kathir was the tafsir and name the `tafsir-notes/` file, report the automated and browser checks, and identify the next surah in sequence.

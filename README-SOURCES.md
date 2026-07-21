# Source-Citation Rule (Two Layers)

Every new vocabulary entry, practice question, and quiz explanation
added to a surah **must** be backed by real authoritative sources. This
is enforced by `vocab-audit.js` and `verify-translations.js`.

## Why two layers

A Qur'an learning app has two kinds of accuracy that can go wrong:

1. **The Arabic word's meaning** — what does this word actually mean in
   this verse? The 3-layer method (root + lexicon + Qur'anic Arabic
   Corpus) covers this.
2. **The English wording** — when we write a gloss, a hint, a question,
   or a feedback explanation in English, is that what The Clear Quran,
   Saheeh International, and Abdul Haleem say? The 3-layer translation
   method covers this.

The vocab `source` field covers layer 1. A new `verified` field on every
vocab entry AND every quiz explanation covers layer 2.

## Layer 1 — Arabic root meaning (existing rule)

Every object in a surah's `vocabulary[]` array must have a `source` field:

```js
source: {
  primary: "<one of: Qur'anic Arabic Corpus | Lane Lexicon | Hans Wehr Dict. 4e | Tafsir al-Sa'di | Tafsir al-Jalalayn | The Noble Qur'an (Muhsin Khan | Pickthall | Yusuf Ali)>",
  ref:     "<root and form, or surah:verse>",
  checkedAt: "<YYYY-MM-DD>",
  note:    "<optional>"
}
```

Enforced by `vocab-audit.js`. Currently **50/50** entries pass.

## Layer 2 — English translation accuracy (new rule)

Every vocab entry AND every quiz question `explanation` must have a
`verified` field:

```js
verified: {
  status:   "verified" | "unverified",
  by:       "<Clear Quran | Saheeh International | Abdul Haleem | tafsir Ibn Kathir | tafsir al-Sa'di | tafsir al-Jalalayn | corpus.quran.com | multiple>",
  note:     "<optional, e.g. 'paraphrase — direct translation is closer to X'>",
  checkedAt: "<YYYY-MM-DD>"   // when the reviewer signed it off
}
```

`status: "unverified"` is allowed and required when:

- The English wording was written from memory by the author, OR
- The wording is a paraphrase, simplification, or lesson-level reflection
  that goes beyond what the verse directly says.

A `verified` tag without a reviewer signature is **not valid**. The
`checkedAt` field is the date the reviewer confirmed it. Until then,
keep `status: "unverified"`.

## The 3-layer method for translations

When writing or reviewing English wording:

1. **Layer 1 — Student wording (The Clear Quran, Dr. Mustafa Khattab)**
   Use as the main student-facing base. Modern, smooth, easy for
   6th-graders.
2. **Layer 2 — Accuracy check (Saheeh International)**
   Use to keep wording close to Arabic structure. Catch over-explanation.
3. **Layer 3 — Natural meaning (Abdul Haleem)**
   Use to make English flow naturally, preserve the message.
4. **Layer 4 — Tafsir check (Ibn Kathir or similar)**
   For deeper explanations, moral lessons, and critical-thinking answers,
   verify against a tafsir.

If the three translations differ, choose the meaning most clearly
supported by the Arabic and the tafsir — not the most dramatic wording.

## Editorial rules (must be followed in any student-facing text)

- Use "Easy English Meaning" or "Simple Meaning" — never "Exact
  Translation" or "Perfect Translation."
- Distinguish **meaning** from **reflection** in the text itself.
  A lesson is a lesson, not the direct meaning of the verse.
- Feedback should explain *why* the answer is correct in simple words.
  Avoid "Correct! The repetition is mercy." → "Correct! The word
  'mankind' is repeated to show that all people need Allah's protection.
  Allah is the Lord, King, and God of mankind."
- Do not add ideas that are not in the verse or tafsir.
- Use respectful Islamic wording: Allah, Prophet Muhammad ﷺ, Jibrīl
  عليه السلام, Day of Judgment, Qur'an.

## Rhetoric / Balagha question rule

Any AI or editor adding a `Rhetoric` question must check trusted tafsir
before writing or finalizing the question. Do not create rhetoric,
balagha, nazm, style-of-address, or translation-choice questions from
intuition alone.

Required sources:

- Prefer tafsir Ibn Kathir, Tafsir al-Sa'di, Tafsir al-Jalalayn, or
  Ma'arif al-Qur'an.
- Use Quran.com word-by-word or corpus.quran.com only as supporting
  language evidence, not as the only basis for a rhetoric explanation.
- If the question asks about translation choice, check both the Arabic
  word meaning and at least one trusted tafsir explanation of the verse.
- If the question asks about verse order, structure, or nazm, the answer
  must be supported by a tafsir explanation of the passage connection or
  by a cautious inference directly grounded in tafsir.
- If the question asks about tone, warning, gentleness, repetition, or
  imagery, the answer must be tied to how tafsir explains that wording,
  image, or repeated phrase.
- When adding `Rhetoric` questions, first replace weak repeated filler
  items in the student-facing quiz, especially generic distractors such
  as "which misses the deeper connection the surah makes..." Rhetoric
  work should improve the deeper connection of the surah, not leave that
  placeholder wording populated on the website.

Every `Rhetoric` quiz explanation must include a `verified` note naming
the tafsir and verse range used, for example:

```js
verified: {
  status: "verified",
  by: "tafsir Ibn Kathir",
  note: "Rhetoric point checked against Tafsir Ibn Kathir on 78:4-5: the repeated warning is described as a severe threat and direct warning.",
  checkedAt: "YYYY-MM-DD"
}
```

If a trusted tafsir source has not been checked yet, keep the item out of
the app or mark it clearly as a draft outside the student-facing quiz.

## Meaning Bank / Meaning Blanks vocabulary scope rule

For every surah, choose the number of core vocabulary words from the
surah's size first. The `vocabulary[]` cards, `Meaning Blanks`, and
`Meaning Bank` must then all use that same selected set. Do not choose
the bank size by whatever happens to already exist in `vocabulary[]`.

This extends the original app rule in `model plan.md`: future surahs
should use a focused set of core vocabulary cards, not every difficult
word in the surah.

Current sizing rule for every newly built or rebuilt module:

| Surah length | Core vocabulary count |
| --- | ---: |
| 3-4 ayahs | 10 |
| 5-6 ayahs | 12 |
| 7-11 ayahs | 14 |
| 12 or more ayahs | 16 |

The maximum is 16 core words, including for a long surah such as
An-Naba'. Some legacy modules use counts between these targets. Do not
copy a legacy exception into new work; normalize it when that module is
explicitly rebuilt. See `model plan.md` for the complete implementation
contract.

After the chapter-size target is chosen, the banks must not add extra
blank words from the ayahs just because they are available in the verse
text.

Required behavior:

- The Arabic `Meaning Blanks` word bank must contain exactly the Arabic
  words from `vocabulary[].arabic`.
- The English `Meaning Bank` word bank must contain exactly the meanings
  from `vocabulary[].meaning`.
- The two banks must have the same count as the chapter-size target and
  the same count as the final `vocabulary[]` cards.
- Do not use alternate spellings, partial words, or extra tafsir words in
  either bank.
- It is acceptable for non-vocabulary words to appear as normal verse
  text, but they must not become draggable blanks.

Before finishing a new surah, run a direct data check confirming:

- no missing vocabulary words
- no extra blank-bank words
- no Arabic spelling mismatches
- no English meaning mismatches

## How to run the audits

```sh
node vocab-audit.js          # Layer 1 — Arabic root sources
node verify-translations.js  # Layer 2 — translation verification tags
```

Both must exit `0` before committing. `verify-translations.js` will
fail if any entry or quiz explanation is missing the `verified` field
or has `status: "unverified"`. The intent: every English word a student
sees has been signed off.

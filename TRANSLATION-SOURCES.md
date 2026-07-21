# Translation Sources — Edition Reference

The `verified.by` field on every vocab entry and quiz explanation must
reference one of these editions. Use the exact string from the list so
the audit script recognizes it.

## Primary student-facing English

- **The Clear Quran** — Dr. Mustafa Khattab. ISBN-13: 978-0977301966.
  Used as the **main student wording** for vocabulary meanings, hints,
  and quiz questions.

## Accuracy check translations

- **Saheeh International** — Used to confirm the wording is close to
  the Arabic structure and not over-explained.
- **The Noble Qur'an (Muhsin Khan)** — Cross-check alternative.
- **The Noble Qur'an (Pickthall)** — Classical English, useful for
  short vocabulary meanings.
- **The Noble Qur'an (Yusuf Ali)** — Cross-check alternative.

## Natural meaning

- **Abdul Haleem** — *The Qur'an: English meaning with parallel Arabic
  text*. ISBN-13: 978-0143031387. Used to confirm the English flows
  naturally and carries the right message.

## Tafsir (deeper explanation)

- **tafsir Ibn Kathir** — Abridged English edition (Darussalam / Al-
  Manhal). Used for the deeper meaning, context, and any theological
  claim.
- **Tafsir al-Sa'di** — English translation by T.B. Irving (Dar Al-
  Ghad). Used for simpler lessons and reflection prompts.
- **Tafsir al-Jalalayn** — English translation by Feras Hamza. Used as
  a second tafsir for cross-checking.

## Arabic root references (Layer 1 only — not for translations)

- **Qur'anic Arabic Corpus** — https://corpus.quran.com. Word-by-word
  morphology, root, and verse location.
- **Lane Lexicon** — Edward William Lane, *An Arabic–English Lexicon*
  (1863).
- **Hans Wehr Dict. 4e** — J.M. Cowan ed., 4th edition.

## How to use this list

When you (the reviewer) check a `verified` field, change
`status: "unverified"` to `status: "verified"` and put the date in
`checkedAt`. Example:

```js
verified: {
  status: "verified",
  by: "The Clear Quran",
  note: "matches Khattab's 'He is the Lord of mankind' phrasing",
  checkedAt: "2026-07-01"
}
```

If the wording is a paraphrase, the note should say so. If a reflection
is being added (e.g. "Allah's protection is a mercy"), the note should
say **"reflection, not direct verse meaning"** so future reviewers know
it's a lesson-level statement.

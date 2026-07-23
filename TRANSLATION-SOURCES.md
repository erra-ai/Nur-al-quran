# Translation Sources — Edition Reference

The `verified.by` field on every vocab entry and quiz explanation must
reference one of these editions. Use the exact string from the list so
the audit script recognizes it.

## Primary student-facing English

- **ClearQuran (Talal Itani)** — published 2012, clearquran.com. Used as
  the **main student wording** for vocabulary meanings, hints, and quiz
  questions. Use this exact string in `verified.by`.

  Released under a Creative Commons licence rather than copyright, which
  is why it was chosen: the app can quote it freely and at length.

  Talal Itani is an electronics engineer who studied the Qur'an for
  fifteen years and translated it himself over four years, working alone.
  He states plainly that he had no formal Islamic schooling and taught
  himself. The translation carries no interpretations, explanations or
  footnotes — it is translation only. Know what that means in practice:
  there is no scholarly reviewing body behind the wording, so anything
  load-bearing should also be checked against Saheeh International below,
  and every meaning-level claim still goes to Ibn Kathir.

### Which rendering to use

Itani's project publishes several reading levels. Use the **teen level at
quranfor.com/teens** — it is his own adaptation for this age group, and it
matches the app's audience of 10-12 year olds.

Two things to know about it:

- It uses **"Allah"**, not "God". The main clearquran.com edition renders
  الله as "God" throughout, which conflicts with the editorial rule in
  `README-SOURCES.md` requiring "Allah". The teen level does not, so it is
  the better fit as well as the simpler one.
- It is a **different wording** from clearquran.com, not a reformatting.
  Al-Fatihah 1:1 reads "In the name of God, the Gracious, the Merciful"
  there against "In the name of Allah, the Most Merciful, the Most Kind"
  on the teen level. So quote the teen file, and do not assume a line from
  clearquran.com appears in the same words.

### Fetching it

```sh
node fetch-translation.js 100 adiyat    # -> translation-notes/100-adiyat-itani-teens.md
node fetch-translation.js --all         # every surah the app teaches
```

`--all` reads the surah list out of `app.html` and fetches only those. Do
not mirror the whole Qur'an; the project has no use for the rest.

All 38 were fetched on 2026-07-22. The bismillah arrives as verse 0,
except in Al-Fatihah where it is ayah 1 — which is correct in both cases.
Highest verse number was checked against each module's own ayah count:
37 of 38 agree, and the exception is Al-'Alaq, which has no ayah data in
`app.html` to compare against.

### Replaced 2026-07-22

**The Clear Quran** by Dr. Mustafa Khattab (ISBN 978-0977301966) was the
previous primary source and has been withdrawn. Note the near-identical
names — "The Clear Quran" (Khattab) and "ClearQuran" (Itani) are two
different translations by two different people. Never write "The Clear
Quran" in a `verified.by`; the audit rejects it.

39 entries had been signed off against Khattab's wording. Because the two
translations word things differently, those were returned to
`status: "unverified"` rather than relabelled — their notes record what
they used to rest on and ask for a check against Itani.

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

## Tafsir (deeper explanation) — Ibn Kathir only

- **tafsir Ibn Kathir** — Abridged English edition. Used for the deeper
  meaning, context, and any theological claim. This is the **only**
  tafsir permitted in `verified.by` for new or rebuilt work. See the
  single-tafsir rule in `README-SOURCES.md` for why.

Retrieve it from the quran.com API, never by scraping a tafsir web page:

```sh
node fetch-tafsir.js 100 adiyat     # -> tafsir-notes/100-adiyat-ibn-kathir.md
```

It calls `api.quran.com/api/v4/tafsirs/169/by_ayah/<surah>:<ayah>`, where
resource **169** is "Ibn Kathir (Abridged)", english — the same abridged
work named above. Confirm the id against
`/api/v4/resources/tafsirs?language=en` if it ever changes.

A long surah's tafsir is split across several passages, and **one call
returns only one of them**. An early version of this script fetched ayah 1
and stopped: for An-Naba' that returned 7,450 characters of a 37,322
character tafsir, about a fifth, with nothing to indicate the rest was
missing. The API's `verses` field cannot be used to find the boundaries
either — asking for 78:11 returns a later passage while still reporting
verses 78:1-78:10. The script therefore walks every ayah of the surah and
de-duplicates on the text itself, and the file header states how many
ayahs were looked up. Check that header.

Scraping returns a *paraphrase*, not his words, and paraphrases drop
things silently. Two points were lost that way before this rule existed:
Ibn Kathir's second accepted meaning of 100:8 (stingy because of the
love of wealth, not only severe in it), and the closing line of 100:11
that Allah "does not do even the slightest amount of injustice."

The API text is the abridged edition, not a scan of one printing. If a
claim ever matters enough to be disputed, confirm it in a printed
Darussalam copy.

### Removed from the project (2026-07-22)

Tafsir Maududi, Ma'arif al-Qur'an, Tafsir al-Sa'di, Tafsir al-Jalalayn and
Tafsir Ibn Ashur have been removed everywhere — 0 occurrences remain in
`app.html`. `verify-translations.js` now rejects them in a `by` field, in
a `note`, and anywhere in student-facing text.

Ibn Kathir (Abridged), fetched from the quran.com API, is the only tafsir.

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
  by: "ClearQuran (Talal Itani)",
  note: "matches Itani's 'He is the Lord of mankind' phrasing",
  checkedAt: "2026-07-01"
}
```

If the wording is a paraphrase, the note should say so. If a reflection
is being added (e.g. "Allah's protection is a mercy"), the note should
say **"reflection, not direct verse meaning"** so future reviewers know
it's a lesson-level statement.

## What a valid sign-off looks like

A `verified` tag is a claim that someone read a source and checked this
wording against it. To be checkable by the next person, the `note` must
**quote or closely restate the actual sentence relied on** — not just
name the source and verse.

Not valid:

```js
note: "Checked against Ibn Kathir on 100:2."
```

Valid:

```js
note: "Ibn Kathir on 100:2: the striking of their hooves on the rocks, which causes sparks of fire to fly from them."
```

The second one can be disproved by anyone with the text. The first
cannot, which makes it worth nothing.

Rules that follow from this:

- The quoted line must be findable in the module's `tafsir-notes/` file.
- If a point is **not** in the source, say so and keep
  `status: "unverified"` — "looked for in Ibn Kathir 100:1-6 and not
  there" is a genuinely useful note; it stops the next person repeating
  the search.
- Narrowing a `by` field (e.g. "Maududi and Ibn Kathir" down to
  "Ibn Kathir") is only honest when the source you keep was genuinely one
  of the sources checked, **and** the note records that the claim has not
  been re-read since. If the source being removed was the only one
  checked, the entry goes back to `status: "unverified"` — relabelling it
  would assert a check nobody performed.
- The same applies to student-facing text. If an explanation said
  "Maududi explains that...", the content is Maududi's; deleting his name
  does not make it Ibn Kathir's. Keep the wording, remove the name, and
  set the entry `unverified` until someone re-reads it.
- Record what changed and when: "earlier wording said 'metal
  horseshoes', a detail not found in the tafsir; removed 2026-07-21."

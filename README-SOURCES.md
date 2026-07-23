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
   or a feedback explanation in English, is that what ClearQuran (Talal
   Itani), Saheeh International, and Abdul Haleem say? The 3-layer
   translation method covers this.

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
  by:       "<ClearQuran (Talal Itani) | Saheeh International | Abdul Haleem | tafsir Ibn Kathir | corpus.quran.com | self>",
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

1. **Layer 1 — Student wording (ClearQuran, Talal Itani)**
   Use as the main student-facing base. Modern, plain, Creative Commons
   licensed so it can be quoted freely. The graded presentation at
   quranfor.com/teens is a useful guide for pitching English at ages
   10-12.
2. **Layer 2 — Accuracy check (Saheeh International)**
   Use to keep wording close to Arabic structure. Catch over-explanation.
   This layer matters more than it used to: Itani's translation has no
   scholarly reviewing body behind it, so Saheeh International is now the
   check that catches a wording that has drifted.
3. **Layer 3 — Natural meaning (Abdul Haleem)**
   Use to make English flow naturally, preserve the message.
4. **Layer 4 — Tafsir check (Ibn Kathir)**
   For deeper explanations, moral lessons, and critical-thinking answers,
   verify against Ibn Kathir — the only tafsir in the project.

If the three translations differ, choose the meaning most clearly
supported by the Arabic and the tafsir — not the most dramatic wording.

## A question must be answerable from the module

**The student must be able to answer every question using only what the
module gave them**: the surah text, the intro, the translation, and the
vocabulary cards. Nothing else.

Tafsir decides whether an answer is *correct*. It is not material the
student is expected to have read. Those are two different jobs and
mixing them up produces questions no child in the class can answer:

| Not allowed | Why |
| --- | --- |
| "Al-Hasan explained what an ungrateful person is like. What did he say?" | The student has never read Al-Hasan. |
| "Ibn Kathir says the Prophet ﷺ would listen for the Adhan before a dawn raid. Why?" | The Adhan detail is in the tafsir, not in the surah or the intro. |
| "Ibn Kathir gives two meanings for verse 8. What are they?" | Asks what a book says, not what the verse means. |

Each of those was a real question in Al-'Adiyat, added while fixing the
sourcing. The content was accurate and properly cited — and still wrong
to ask, because the student had no way to reach it.

The test to apply: **could a student who read this module, and only this
module, answer this?** If not, either rewrite the question or move the
information into the intro or a vocabulary card first, so it becomes
material the student actually has.

Good tafsir material is not wasted — put it in the `explanation`, where
it teaches after the answer instead of gatekeeping it.

A useful side effect: when a question has to be answerable from the
module, vocabulary cards are the natural source. Al-'Adiyat had 6 of its
14 cards never tested in the quiz while carrying questions about things
students had never read. Replacing the second with the first fixed both.

## Reading level — write for ages 10-12

Every student-facing string (vocab `meaning`, `connection`, `hint`,
quiz `q`, `options`, `explanation`, and the surah `intro`) is written
for a child of about 10 to 12. Accuracy comes first, but a true sentence
a child cannot read has not taught anything.

**Sentences.** Short, one idea each. Break a long sentence rather than
joining clauses with semicolons and dashes.

**Words.** Prefer the plain word. Translation-ese and tafsir vocabulary
are the usual offenders:

| Don't write | Write |
| --- | --- |
| obtained, made manifest | brought out, made plain |
| recompense | repay, reward |
| abstinence from worldly things | turning away from this world |
| covetous | greedy |
| severe in his love of wealth | he loves wealth so much |
| the contents of the graves | what is inside the graves |
| penetrating into the midst | charging into the middle |

**Arabic and Islamic terms stay.** Do not simplify away الْعَادِيَاتِ,
كَنُودٌ, Adhan, or Day of Judgment. Gloss them the first time instead.

**Keep the force of the verse.** Simple does not mean softened. 100:6
says the human being **is** ungrateful to his Lord; writing "people can
sometimes be ungrateful" is easier to read and no longer what the verse
says. Simplify the vocabulary, never the claim.

**Do not add colour to make it vivid.** This is where invented detail
gets in. Writing for children creates pressure to picture the scene, and
picturing is how "metal horseshoes hitting hard rock" ended up in a
verse where Ibn Kathir says only that hooves strike rocks. If a detail
makes the sentence livelier and no source supplies it, cut it. The
tafsir usually has something better anyway — Al-Hasan's "counts his
troubles and forgets Allah's favours" is more vivid than anything
invented for that verse, and it is sourced.

**Questions must have one defensible answer.** A prompt like "If today
you looked honestly at your own heart, what would you find?" marks a
child wrong for answering honestly. Reflection belongs outside the
scored quiz.

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

## Single-tafsir rule (student-facing text)

The audience for this app is children roughly 10-12 years old. Classical
tafsirs sometimes differ slightly on a verse, and presenting two or three
readings to a 10-year-old creates confusion rather than depth.

**Use Tafsir Ibn Kathir as the single tafsir for all student-facing
explanation text.** That means:

- Every `explanation`, `connection`, `hint`, and `intro` that rests on
  tafsir must be traceable to Ibn Kathir.
- Never name a scholar in a question `q` or in its `options`. Ibn Kathir
  may be named in an `explanation`, which the student reads *after*
  answering — that shows where a meaning comes from without requiring
  the student to have known it. No other scholar is named anywhere in
  student-facing text.
- When Ibn Kathir himself reports more than one reading, teach the one he
  treats as more apparent and leave the other out. Record the omission in
  the `verified.note` so a future reviewer knows it was a deliberate
  choice, not an oversight.
- Other tafsirs may be consulted privately while researching, but they
  must not appear in `verified.by` and their distinctive reasoning must
  not be what an explanation depends on.

**Done 2026-07-22.** Maududi, Ma'arif al-Qur'an, al-Sa'di, al-Jalalayn and
Ibn Ashur have been removed from the project entirely — 0 occurrences
remain. How each case was handled, since the distinction matters:

| Situation | Action | Count |
| --- | --- | ---: |
| `by` also named Ibn Kathir | narrowed to `tafsir Ibn Kathir`, sign-off kept | 275 |
| `by` also named the corpus | narrowed to `corpus.quran.com`, sign-off kept | 27 |
| A removed tafsir was the **only** source checked | returned to `unverified` | 44 |
| Student-facing text said "Maududi explains that..." | name removed, wording kept, **returned to `unverified`** | 12 |

The last row is the important one. Where the teaching itself came from a
removed tafsir, relabelling it "Ibn Kathir" would assert a check nobody
performed. Those 12 keep their wording so nothing is lost, but the
sign-off is honest about never having been re-read. Every narrowed entry
also carries a note saying so.

**56 entries therefore need re-reading against Ibn Kathir** (44 + 12).
They are findable by their notes, which all say "re-check against
tafsir-notes/".

Al-'Adiyat (100) was fully worked through on 2026-07-21/22 and is the
reference example of what "done" looks like: **all 30** quiz explanations
are signed to Ibn Kathir or the Arabic corpus, each with the specific
source line quoted in the note. Nothing in the module is `unverified`.

Five questions rested on points that are not in Ibn Kathir and were
replaced rather than left flagged. Note what replaced them — the tafsir
itself supplied better material than the invented reflections did:

- the Prophet's practice of listening for the Adhan before a dawn raid
  (100:3)
- Al-Hasan's definition of al-Kanud, the one who counts his calamities
  and forgets Allah's favours (100:6)
- Ibn Kathir's two accepted meanings of 100:8, severe in love of wealth
  and stingy because of it
- his framing of the turn at 100:9, that Allah now encourages turning
  from worldly things toward the Hereafter
- his own section heading as a whole-surah summary

When a question has no basis in the tafsir, look in the tafsir for what
to put there instead.

Checking against the tafsir removes invented detail. Two examples caught
in Al-'Adiyat: an explanation described "metal horseshoes hitting hard
rock" when Ibn Kathir says only that the hooves strike the rocks, and
another listed specific hidden feelings ("the jealousy you hid, the
gratitude you never spoke") that no source supplies.

## How to get the source texts

Two fetchers, one per layer. Both write a local file that a `verified`
note must quote from.

```sh
node fetch-tafsir.js 100 adiyat        # -> tafsir-notes/100-adiyat-ibn-kathir.md
node fetch-translation.js 100 adiyat   # -> translation-notes/100-adiyat-itani-teens.md
node fetch-translation.js --all        # every surah the app teaches
```

Do **not** scrape tafsir web pages by hand — a summarised page gives you
a paraphrase, not his words.

Full details of the endpoint, the resource id, and what scraping cost us
are in `TRANSLATION-SOURCES.md`, which is the single place those live.
Every `verified: { by: "tafsir Ibn Kathir" }` tag must be traceable to
the module's file in `tafsir-notes/`.

## Duplicate and unscored questions

Two problems found in Al-'Adiyat on 2026-07-21, both since fixed there,
both worth checking for in every other module:

1. **The same unsourced moral repeated across several questions.** Three
   of the 30 Al-'Adiyat questions taught "the horse obeys its master but
   the human does not obey his Lord." That contrast is not in Ibn Kathir.
   Three slots spent on one invented idea.
2. **Reflection prompts sitting in a scored quiz.** "If today you looked
   honestly at your own heart, what would you find?" has no objectively
   correct option, so a student is marked wrong for answering honestly.
   Reflection belongs outside the scored quiz.

Also check for **truncated options**. Two Al-'Adiyat questions had correct
answers that were cut-off fragments ("If a horse obeys its master fully",
"One day, every hidden feeling and secret will be brought"). They read as
generation artefacts and no audit script catches them, because a broken
string is still a valid string.

## Surah intro paragraph rule

The `intro` paragraph is the first text a student reads, and until now
nothing audited it. Every module with an `intro` must carry an
`introVerified` block using the same shape as `verified`:

```js
introVerified: {
  status: "verified",
  by: "tafsir Ibn Kathir",
  note: "<what was checked, and anything deliberately left out>",
  checkedAt: "YYYY-MM-DD"
}
```

Enforced by `verify-translations.js`, which lists intro problems in their
own section. Currently **1/60** intros signed.

Watch specifically for wording copied between modules. A summary of
Al-'Adiyat 100:9 once said "the graves will be overturned" — that is the
wording of Al-Infitar 82:4, where the graves are the subject. In 100:9
the verb acts on **what is in** the graves. Copied phrasing between two
surahs with similar imagery is the most likely source of this class of
error.

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

## Lessons from the 2026-07-22 pass

Written down because every one of them cost real time or produced a real
error. A future builder should not have to rediscover them.

**A rule with no check behind it has already drifted.** Every documented
rule this project had was being broken somewhere: vocabulary sourcing,
intro sign-offs, the quiz contract, practice counts, the Meaning Bank
rules. Not through carelessness — nobody could see the breakage. If you
add a rule, add the check in the same pass or it will not hold.

**A broken check is worse than no check.** The audits scanned the file
with regular expressions, so entries written with quoted keys
(`"verified": {`) were skipped entirely — not reported missing, never
seen. They also missed the whole `hadiths` array, and produced false
failures. Anything that inspects module data must **evaluate the arrays
and read real objects**, never pattern-match the source text.

**Do not relabel a source you have not re-read.** When Maududi and then
Khattab were withdrawn, the tempting move was to rewrite `by` to the
surviving source. Where that source had genuinely been checked, narrowing
is honest and the note must say it has not been re-read. Where the
removed source was the only one checked, the entry goes back to
`unverified`. Deleting a scholar's name from an explanation does not make
its content someone else's.

**Tafsir verifies an answer; it is not material the student has read.**
Questions like "what did Al-Hasan say?" are unanswerable from the module
no matter how well sourced. Put tafsir in the `explanation`, where it
teaches after the answer.

**Writing for children is where invented detail gets in.** The pressure
to make a scene vivid produced "metal horseshoes striking rock" in a
verse where Ibn Kathir says only that hooves strike rocks. If a detail
makes the sentence livelier and no source supplies it, cut it.

**Check a claim before reporting it.** Two numbers in this project's own
history were wrong when first stated — a module blamed for 190 Maududi
citations had none, and a "length bias" alarm turned out to be below
chance. Measure, then report.

**One activity's data can feed another.** Order the Verses is built from
`fillBlanks.ayahs`. Nothing in the field name says so.

## How to run the audits

```sh
node vocab-audit.js          # Layer 1 — Arabic root sources
node verify-translations.js  # Layer 2 — translation verification tags
node preflight.js            # question structure + Main Quiz Contract
node verify-quotes.js <slug> # reviewer aid — notes to read by eye (see below)
```

Helper tools (not audits):

```sh
node redistribute-answers.js <slug> --apply   # spread answers to ~8,8,7,7
node fetch-tafsir.js <num> <slug>             # Ibn Kathir -> tafsir-notes/
node fetch-translation.js <num> <slug>        # Itani teen -> translation-notes/
```

**Do not run `pad-bias.js`, `fix-distractors.js`, or `fix-final.js`.** They
are leftover scripts that pad quiz options with generic filler — the weak
wording the rules exist to remove. They will quietly damage a good module.

### `verify-quotes.js` is a reviewer aid, not a gate

It lists the Ibn-Kathir and Itani sign-offs whose note shares no run of four
consecutive words with the source files. Each flagged note is one of three
things, and only reading it tells you which:

1. an accurate paraphrase of the source — fine
2. an honestly-labelled cautious inference — fine
3. an invented or altered claim — must be fixed

A script cannot tell a paraphrase from a fabrication; both lack verbatim
overlap. So this tool does not pass or fail — it shrinks the reading pass from
"every note" to "just these few", and it will always catch a wholly invented
note (which shares nothing with the source). When the four reference modules
were checked, every flagged note was category 1 or 2 — the tool found no
fabrication, which is the result to expect from an honest build.

### The audits used to lie — how, and what changed

Until 2026-07-22 all three scripts searched the file with regular
expressions for text like `verified: {`. Two things followed from that,
and both were invisible:

1. **Entries written with quoted keys** (`"verified": {`) were skipped
   entirely — not reported missing, never seen. Both spellings are valid
   JavaScript and the app treats them identically.
2. **The `hadiths` array was never scanned at all** by `vocab-audit.js`,
   so 30 hadith modules were exempt from every rule.

The scripts also produced *false* failures: `vocab-audit.js` reported 57
entries as "missing source" when they simply used a spelling its regex
could not read.

All three now **evaluate the data and inspect real objects**, and load
both `surahs` and `hadiths`. Key quoting cannot hide anything again. The
numbers moved a lot as a result — 400 vocab entries became 705, not
because anything was added, but because 305 were finally visible.

If you add a third module array to `app.html`, add it to `loadArray` in
both scripts or it will be silently exempt.

`vocab-audit.js` and `verify-translations.js` must exit `0` before
committing. `verify-translations.js` fails if any entry, quiz
explanation, or surah intro is missing the `verified` / `introVerified`
field or has `status: "unverified"`. The intent: every English word a
student sees has been signed off.

`preflight.js` has three levels:

| Level | Behaviour |
| --- | --- |
| Hard blockers | Always exit `1`. Wrong option count, duplicate options, an `answer` index pointing at nothing, empty options, banned filler wording. These are bugs, not style. |
| Contract warnings | Reported, exit `0`. Category mix, answer-index spread, rhetoric positions, `(B - ...)` scaffolding in question text. |
| Length-bias warnings | Reported, exit `0`. |

Make either warning class blocking when a module is meant to be finished:

```sh
PREFLIGHT_STRICT_CONTRACT=1 node preflight.js
PREFLIGHT_STRICT_LENGTH=1   node preflight.js
```

They default to warnings because most existing modules do not conform
yet — see below. Turning them into hard failures today would just block
every commit. A module you have finished should pass both strict modes.

### The three count rules

Module size is set by three separate rules, decided three different ways.
They are easy to confuse, so state them plainly:

| What | How the number is decided |
| --- | --- |
| `vocabulary` | From the **number of ayahs**, via the chapter-size table above. 3-4 → 10, 5-6 → 12, 7-11 → 14, 12+ → 16. Maximum 16, however long the surah. |
| `practice` | **Exactly one item per vocabulary card.** `practice.length === vocabulary.length`. |
| `quiz` | **Always exactly 30**, whatever the surah's length. |

Only the vocabulary count varies with the surah. Practice follows
vocabulary; the quiz never moves.

### Current conformance (2026-07-22)

**2 of 38** modules conform: **Al-'Adiyat (100)** and **Al-'Alaq (96)**.
These are the reference modules — the only two built end to end under the
current rules, and what `model plan.md` tells a new build to imitate.

Al-'Alaq is the better example to copy, because it was built from nothing
under the current rules: it had no `fillBlanks`, no `fillBlanksEn`, no
intro sign-off, 10 practice items against 15 vocabulary cards, and a
10/10/10 quiz with zero rhetoric questions. Al-'Adiyat was repaired
rather than rebuilt.

| Rule | Modules failing |
| --- | ---: |
| Quiz is exactly 30 | 0 |
| Vocabulary matches chapter-size table | 2 |
| **Practice has one item per vocabulary card** | **11** |
| Category mix | 31 |
| ...of which have **no rhetoric questions at all** | 12 |
| Answer-index spread | 29 |
| Mixing (no category clustered) | 13 |
| **`rhetoricArea` field missing** | **23** |
| **Meaning Blanks / Meaning Bank problems** | **13** |

## Meaning Blanks and Meaning Bank — now checked

`preflight.js` enforces three things that `model plan.md` has always
required but nothing verified:

1. **Every ayah must appear in `fillBlanks.ayahs`**, numbered from 1 with
   no gaps and in ascending order. Ayahs that contain no vocabulary word
   still appear, as plain `{ t: "..." }` segments with no blank.
2. The **Arabic blank bank must equal `vocabulary[].arabic` exactly** —
   every card appears once, nothing else is draggable.
3. The **English blank bank must equal `vocabulary[].meaning` exactly**.

Rule 1 is the one that bites. **Order the Verses is generated from
`fillBlanks.ayahs`**, so an ayah left out of that array silently
disappears from a completely different activity. Al-'Alaq was first
rebuilt with only the 14 ayahs that carry a vocabulary word; the other
five were missing and Order the Verses would have shown 14 of 19 verses
with nothing to indicate the loss. The check now catches that.

What it found across the project:

- **8 modules have no `fillBlanksEn` at all** — 'Abasa, At-Takwir,
  Al-Infitar, Al-Layl, Ad-Duhaa, Ash-Sharh, Al-Qadr, Al-Bayyinah,
  Az-Zalzalah. The English Meaning Bank activity does not exist for them.
- **At-Tin** has 11 vocabulary words that never appear as a blank.
- **Al-Ikhlas** has 3; **Al-Fatiha** and **Al-Mutaffifin** have gaps in
  the English bank.

The count went from 4 conforming to 1 because `rhetoricArea` is a new
required field — those modules did not get worse, the bar moved. That is
the honest reading, and the migration is mechanical.

Rough order of work, by how much it affects a student:

1. **11 modules with missing practice items** — vocabulary taught on a
   card and never practised before the graded quiz. A real hole in the
   learning path.
2. **13 modules with no rhetoric questions** — each needs 6 written
   against tafsir. The largest single job.
3. **24 modules needing the `rhetoricArea` migration**, which also
   removes the `(B - ...)` text students currently read.
4. **Answer-index spread** — cosmetic. The runtime shuffles options
   (`shuffleOptions` in app.html), so no student sees the source order.

### Rhetoric: 6 questions, and the 30 mixed

The old rule pinned rhetoric to source positions 4, 9, 14, 19, 24, 29.
That is **withdrawn**. The rule is now: exactly 6 rhetoric questions, and
all 30 mixed so no category is clustered. Checked as:

- no two rhetoric questions adjacent
- no more than **4** questions in a row sharing a category
- rhetoric not all bunched into one half

The limit of 4 was chosen from the data. Longest same-category run per
module falls into two groups with nothing in between: 7 modules run 1-2,
17 run exactly 4, one runs 7, and 13 run 10. A limit of 4 flags the 14
that are genuinely blocked; a limit of 3 would have flagged 31 and buried
the signal.

### Rhetoric areas live in a field, not in the question text

The contract requires exactly two rhetoric questions from each of the
three areas. That area now lives in a `rhetoricArea` field:

```js
category: "Rhetoric",
rhetoricArea: "Nazm",          // or "Meaning Construction" | "Style of Address"
q: "Why do the final verses move from opened graves, to exposed hearts, ...",
```

It used to live in the question text as a `(B - Nazm / Structure):`
prefix, which a 10-12 year old had to read and could not understand.
Al-'Adiyat has been migrated; the prefixes are gone and the areas are in
the field. `preflight.js` checks two-per-area and reports any rhetoric
question missing the field.

**24 modules still need this migration.** Move the area out of the
question text and into the field in the same edit — deleting the prefix
first destroys the only record of which area a question belongs to.

The practice failures matter more than the number suggests. Eleven
modules have exactly 10 practice items against 12-16 vocabulary cards,
so between 2 and 6 words per module are taught on a card and then never
practised. That is a gap in the learning path, not a formatting problem.
The pattern — always exactly 10 — says these predate the chapter-size
rule, when practice was a fixed set.

Al-'Alaq has no `fillBlanks.ayahs`, so its vocabulary count cannot be
checked against the table at all.

Two things this reveals. First, thirteen modules were built on an older
10/10/10 template with zero rhetoric questions — that is a different
shape, not a small drift, and each needs 6 rhetoric questions written
against tafsir. Second, the answer-index failures are cosmetic: the
runtime shuffles options (`shuffleOptions`, app.html), so a student never
sees the source order. Fix it for auditability, not urgency.

# AI Builder: Sequential Surah Display Workflow

Use the following instruction to extend the Mushaf-style Quran display to the remaining surahs in this project.

## Builder instruction

Apply the Mushaf-style Quran display already implemented for Surah An-Nas to every other surah registered in `src/data/surahs/index.js`.

Work strictly one surah at a time, in ascending numerical order, continuing automatically until Surah 114.

Do not convert several surahs simultaneously. Do not stop or ask for approval after completing a surah. Verify the current surah, mark it complete in your working checklist, and immediately continue to the next one.

### Sequential workflow for each surah

For each surah:

1. Inspect its module in `src/data/surahs/`.
2. Find its verified Itani teen reference in `translation-notes/`.
3. Confirm the reference contains the correct number of ayahs.
4. Connect the surah to the shared Quran.com API renderer.
5. Add its exact Itani teen English translation.
6. Render and inspect the introduction page.
7. Verify the Arabic, translation count, Basmala handling, responsive layout, and browser console.
8. Fix any problems before moving forward.
9. Continue immediately to the next surah.

### Goal

Every registered surah must display its complete Quran text and English translation directly on its introduction page using the same concept as An-Nas.

Use the current An-Nas implementation as the reference:

- `src/quran-api.js`
- `introSurahText()` and `hydrateIntroQuranText()` in `src/pages.js`
- The `.intro-surah-*` and `.intro-mushaf-*` styles in `src/styles/interface.css`

### Architecture

Generalize the An-Nas implementation before processing the remaining surahs:

- Replace `fetchAnNasFromQuranCom()` with a reusable function such as `fetchSurahFromQuranCom(chapterNumber)`.
- Remove chapter-114-specific conditions from the shared renderer.
- Store Itani teen translations in a maintainable per-surah structure.
- Use one shared Quran renderer for every surah.
- Do not duplicate fetching, sanitization, rendering, or error-handling code for individual surahs.
- Fetch only the surah currently being viewed.
- Cache successful Quran.com responses in memory.
- Support API pagination for longer surahs.

### Arabic requirements

Use the Quran.com API as the primary Arabic source:

- Request Uthmani Tajweed text.
- Preserve Quran.com Tajweed markup and colors.
- Sanitize all remote markup before inserting it.
- Allow only the required `tajweed`, `rule`, and ayah-ending elements.
- Never insert unsanitized API HTML.
- Include ornamental ayah markers.
- Display the Quran.com page number returned by the API.

### English requirements

Use the verified Itani teen files located at:

`translation-notes/<surah-number>-<slug>-itani-teens.md`

Rules:

- Copy the English wording verbatim.
- Do not paraphrase, summarize, improve, or generate a translation.
- Confirm the translation count matches the Arabic ayah count.
- Display `ClearQuran (Talal Itani) · teen reference`.
- If a reference is missing, use the existing `fetch-translation.js` workflow and verify the result before continuing.
- Never invent missing Quran text or translation wording.

### Basmala rules

- Al-Fatiha: the Basmala is verse 1, so do not display it twice.
- At-Tawbah: do not display a Basmala.
- Every other surah: display the Basmala separately without an ayah marker.

### Visual requirements

Preserve the existing project theme:

- Cream background
- Green text and accents
- Gold ornaments
- No dark theme

Match the An-Nas concept:

- Centered Basmala
- English Basmala translation
- Continuous centered Arabic text
- Quran.com Tajweed colors
- Ornamental ayah-number markers
- Itani teen translations underneath
- Source information at the bottom
- Responsive mobile and desktop layout

Do not add a **Read Surah** button. The Quran display belongs directly on the introduction page.

### Fallback behavior

If Quran.com is unavailable:

- Use complete verified Arabic already stored in the surah module when available.
- Never fabricate missing Arabic.
- Show a quiet fallback-source message.
- Keep the rest of the lesson functional.
- Retry only reasonable transient failures.

### Do not modify

Do not change unrelated content, including:

- Vocabulary
- Quizzes
- Tafsir introductions
- Meaning-bank activities
- Hadith lessons
- Navigation
- Unrelated styling

### Per-surah acceptance checks

A surah is complete only when:

- The Quran.com response contains the expected number of verses.
- The Itani teen reference contains the same number of translations.
- Every Arabic ayah is rendered.
- Every English translation is rendered.
- Basmala behavior is correct.
- The Quran.com source status appears after a successful request.
- Fallback behavior does not crash.
- There are no browser console errors.
- The page has been visually inspected.
- The layout works on mobile and desktop.
- No **Read Surah** button appears.

After a surah passes every check, continue automatically to the next surah.

### Final verification

After reaching Surah 114:

- Run JavaScript syntax checks.
- Run the project preflight.
- Verify every registered surah uses the shared renderer.
- Check that no surah-specific duplicate API functions remain.
- Test Al-Fatiha separately.
- Test one short, one medium, and one long surah.
- Verify the Quran.com API, local fallback, translations, and responsive layout.
- Confirm there are no browser console errors.

### Stopping rule

Do not finish after demonstrating a few surahs.

Do not stop between surahs.

Do not ask the user whether to continue.

Only finish when every surah registered in `src/data/surahs/index.js` has been processed through Surah 114 and the final verification has passed.

If genuinely blocked by a missing or invalid source, report the exact surah, missing file, attempted checks, and required correction. Do not silently skip that surah.

## Continuation instruction

If a builder run ends before all surahs are complete, send this follow-up:

> Continue from the first unconverted surah. Do not redo completed modules. Work one surah at a time in ascending numerical order, verify each surah before moving forward, and continue automatically through Surah 114. Finish with the complete validation checklist in `AI-BUILDER-SURAH-WORKFLOW.md`.

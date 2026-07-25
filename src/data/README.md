# Lesson Data

The application shell and lesson content are deliberately separate.

- `surahs/` contains one file per surah.
- `hadiths/` contains one file per hadith lesson.
- Each directory has an `index.js` registry that controls lesson order.
- `../app.js` routes views, while shared state, navigation, and activity
  behavior live in the neighboring `src/` modules.

## Editing a Surah

1. Open only the target file, such as `surahs/105-fil.js`.
2. Follow `model plan.md`, `README-SOURCES.md`, and
   `TRANSLATION-SOURCES.md`.
3. Do not copy a legacy lesson as proof that a rule is optional.
4. Add a new import and registry entry in `surahs/index.js` only when adding
   a new surah.
5. Run `node audit-surah.js <slug-or-number>` and do not report completion
   unless it exits `0` with `READY`.
6. Run the repository-wide audits and report any legacy failures separately.

Do not place lesson objects back in `app.html` or `src/app.js`.

## Reusable AI Handoff

Use this request for any chapter:

> Read `model plan.md`, `README-SOURCES.md`, `TRANSLATION-SOURCES.md`, and
> `src/data/README.md` completely. Build or rebuild Surah [NUMBER] -
> [ENGLISH NAME] in its own file under `src/data/surahs/`. Follow the written
> contract even if an existing surah differs. Run
> `node audit-surah.js [SLUG OR NUMBER]`, fix every reported issue, complete
> the required source double-check and desktop/mobile browser checks, and do
> not report completion until the target audit exits `0` with `READY`.

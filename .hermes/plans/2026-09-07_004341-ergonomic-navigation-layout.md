# Ergonomic Navigation and Lesson Library Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task. If that skill is unavailable, follow the same test-first sequence directly; do not assume it is installed.

**Goal:** Make every Quran, Hadith and Life Skills lesson easy to find and open without navigating long pages or competing menus.

**Architecture:** Replace the separate side menus and home tabs with one persistent top navbar. Combine searchable dropdowns for direct access with a paginated lesson library for browsing. Keep the existing vanilla-JavaScript application and lesson content; share lesson-opening logic between navigation, search and cards.

**Tech Stack:** HTML, CSS, JavaScript ES modules, existing jsdom tests, and real-browser verification over local HTTP. No new UI framework or backend is required.

**Project root:** `C:/Users/Dell/Downloads/Quran and Hadith lesson`

**Status:** Proposal saved for review. This document does not authorize implementation, commits or publishing. All paths below are relative to the project root unless stated otherwise.

---

## 1. Current context

Inspected files: `app.html`, `src/pages.js`, `src/navigation.js`, and sidebar styles in `src/styles/base.css`.

The current application has:
- A left Quran sidebar and a separate right Hadith sidebar.
- Home-page tabs for Quran, Hadith and Life Skills, below a decorative welcome section.
- A Quran search and a first-twelve/show-all arrangement.
- Hadith category chips, but no equivalent search control on that library section.
- Compact cards whose titles can be truncated.
- Standalone Life Skills lessons rendered in an iframe, with a back-to-home control.

Specific observed behavior to replace:
- `renderHome()` recreates its local tab/filter state, so returning to the library loses context.
- `renderSurahList()` hides the show-all button after expansion; the advertised show-fewer action cannot then be reached.
- Life Skills hides the left sidebar by directly changing shell styles. A persistent shared shell should not need these per-view exceptions.

These findings are based on source inspection, not a completed visual audit. Earlier jsdom tests do not prove viewport fit, title readability or ergonomic success.

## 2. Recommended design decision

**Primary surface: Explore — a lesson library.** Finding a lesson takes priority over a large welcome banner.

Use a hybrid:
1. Persistent top navigation for moving between collections from any view.
2. Searchable dropdown panels for jumping directly to a lesson.
3. A paginated library for browsing and comparing lessons.
4. A small lesson toolbar for switching lessons or jumping to a section while studying.

Do not replace one long page with one giant dropdown. Do not retain the old side menus and home tabs alongside the new navbar.

### Alternatives considered

| Approach | Benefit | Limitation | Decision |
|---|---|---|---|
| Smaller cards only | Reduces page height | Still splits navigation and can hide titles | Not sufficient |
| One dropdown containing everything | Central entry point | Creates a long, hard-to-scan menu | Reject |
| Top navbar plus searchable panels and paginated library | Direct access and clear browsing | Needs shared state and careful accessibility | Recommended |

## 3. Page structure

### Desktop shell

```text
Nur al-Qur'an     Home     Quran v     Hadith v     Life Skills v     Search
--------------------------------------------------------------------------
Quran
Choose a surah to study.

[ Search by name or number...                                  ]
[ Optional collection filter ]               Showing ... of ...

[ Lesson card ]          [ Lesson card ]          [ Lesson card ]
[ Lesson card ]          [ Lesson card ]          [ Lesson card ]

                    Previous    Page ...    Next
```

- Keep the navbar visible while scrolling; reserve its space so it never covers content.
- Brand/Home returns to the library with the last collection and browsing state restored. First visit defaults to Quran.
- Remove the tall hero and decorative statistics from the browsing area. Retain the app identity and, if appropriate, a small basmala without making it another large banner.
- Show only one collection at a time.
- Highlight the current collection in the navbar on both library and lesson views.
- Keep cream, green and gold, existing Arabic fonts, and restrained heading typography.

### Top navigation panels

**Quran:** search by Arabic name, English name or chapter number; compact full-title results; Browse all surahs.

**Hadith:** search by number, title or topic; topic filter; Browse all hadith.

**Life Skills:** numbered lesson links in curriculum order, readable full titles and search; Browse all Life Skills.

**Global Search:** one search surface spanning all collections, with each result labelled by collection. Reuse the same catalog and matching logic rather than building a separate index manually.

Interaction rules:
- Click/tap to open; never require hover.
- Only one panel open at a time.
- Escape and outside click close it; closing restores focus to its trigger.
- Use native buttons, inputs and links with explicit labels, `aria-expanded` and `aria-controls`.
- Use ordinary disclosure-navigation semantics rather than `role=menu` unless the full menu keyboard pattern is implemented.
- Keep search and Browse all visible within the panel. Use a bounded results area when required, never a panel taller than the viewport.
- Search covers the entire selected collection, not just rendered results.
- Selecting a result opens the lesson and closes the panel.

### Library organization

- Default page size: 12 lessons, applied consistently across collections. This is a browsing limit, not a claim that twelve cards fit every screen.
- Previous/Next and a visible page indicator replace Show all.
- Reset to the first page when a search or filter changes.
- Hide unnecessary pagination when results fit on one page; disable unavailable navigation buttons.
- Derive result counts from the actual matching records.
- Show a useful empty state and a Clear search/filter action.
- Quran remains in chapter order; Hadith retains its registered order and existing topic categories; Life Skills retains the user's exact curriculum order.
- Remember each collection's query, filter and page while navigating within the app. Persisting across browser restarts is optional and not required for the initial implementation.

### Cards

- Use consistent spacing, title hierarchy and alignment across collections.
- Let titles wrap; do not use ellipsis on the primary lesson name.
- Keep Arabic readable and correctly directed.
- Show the lesson number, title, optional short subtitle, and progress only where genuine stored progress exists.
- Do not invent Life Skills completion or compare unlike quiz scores.
- Make the primary action large and keyboard-accessible; preferably a single full-card action without nested interactive controls.
- Ensure touch controls are at least 44 by 44 CSS pixels.
- Use fewer columns as space narrows. At narrow mobile widths use a readable single-column layout instead of squeezing two tiny cards together.

### Lesson views

```text
[Persistent top navbar]
Home / Life Skills / Anger: Pause Before Harm

[ Choose lesson v ]                           [ Previous ] [ Next ]

[Lesson content]
```

- Use the same shared opener for dropdown results, cards and Previous/Next.
- Keep lesson navigation separate from activity navigation: Previous/Next here means lessons, not quiz questions.
- At collection boundaries disable the unavailable action; do not silently wrap to a different collection.
- Restore library context on Back to library.
- Inspect existing quiz/activity state before adding navigation; require confirmation before abandoning an active attempt where work would be lost.
- Never overwrite progress storage as part of this redesign.

### Life Skills section navigation

Add a labelled Jump to section control using each lesson's actual headings and stable IDs. Expected targets include Story, Quran, Prophetic guidance, Skill tool, Practice and Parent guide, but inspect all lesson files rather than assuming identical headings or anchors.

Avoid the current combination of a tall outer page and a separately scrolling iframe:
- Preferred approach: same-origin iframe reports content height so the outer document becomes the normal scrolling surface.
- Use `ResizeObserver` with guarded height updates to handle expanding checkpoints and loaded fonts without resize loops.
- The parent toolbar scrolls to measured section positions inside the iframe, accounting for the sticky navbar height.
- Provide a safe fallback if measurement is unavailable; do not leave lesson content clipped.
- Verify interactive activities and standalone lesson use are unchanged.

This is navigation work only. Preserve all stories, religious quotations, exercises, answer keys and parent guidance.

### Mobile behavior

- Compact brand plus one clearly labelled Menu button.
- Open a single navigation panel containing the same collections and search features.
- No competing left/right drawers or multiple horizontal navigation rows.
- Search remains easy to reach; lesson titles wrap.
- If using a modal drawer, trap focus, prevent background interaction, close with Escape, and restore focus. Otherwise use an in-flow disclosure without pretending it is modal.

## 4. Implementation sequence

For each code-producing task: write the focused failing test, run it and confirm the intended failure, implement the smallest change, then rerun the focused test and relevant regressions. Do not weaken assertions merely to make a redesigned page pass.

### Task 1: Establish the baseline

**Files:** Read `src/app.js`, `src/state.js`, `src/navigation.js`, `src/pages.js`, all three imported CSS files, and existing harnesses under `scratch/`.

- Record the current working-tree changes without overwriting unrelated work.
- Run existing navigation, home-layout and lesson suites.
- Capture the current home and an embedded Life Skills lesson at desktop and mobile widths.
- Record baseline failures separately from regressions.

**Validation:** A baseline record distinguishes source behavior, real-browser observations and known failures.

### Task 2: Create one catalog and lesson-opening path

**Files:** Create `src/catalog.js`; modify `src/pages.js`, `src/state.js`; create `scratch/verify-navigation-layout.mjs`.

- Move the Life Skills registry into one shared module, preserving every field and its order.
- Build uniform catalog entries from the actual surah, hadith and Life Skills registries. Avoid circular imports with `state.js`.
- Define stable identities independent of filtered list indices.
- Centralize opening behavior, resetting activity indices as appropriate and preserving library state.

**Tests:** Unique catalog identities; counts match source registries; every opener maps to the correct original record/file; Arabic/English/number search; mixed-case and whitespace normalization; no progress writes caused by browsing.

### Task 3: Add library state and pagination

**Files:** Modify `src/state.js`, `src/pages.js`; extend `scratch/verify-navigation-layout.mjs`.

- Store active collection and per-collection query/filter/page outside `renderHome()` locals.
- Implement filter, sort-in-original-order, count and page slicing as reusable logic.
- Clamp pages after filtering and restore previous browsing state on return.

**Tests:** First/last page, empty results, query reset, filter/search combination, results from beyond the first page, collection switching, and return-from-lesson restoration.

### Task 4: Build persistent desktop navigation

**Files:** Modify `app.html`, `src/navigation.js`, `src/app.js`; create `src/styles/navigation.css`; modify `src/styles/app.css`.

- Place the shared header outside `#app` so view changes do not destroy it.
- Implement collection disclosure panels and global search using the shared catalog.
- Wire active-collection state and direct lesson opening through one path.
- Keep custom modal behavior available when replacing sidebar code.

**Tests:** One open panel; Escape/outside click; focus restoration; correct result opening from home, intro and activity views; no duplicated listeners after repeated renders.

### Task 5: Add mobile navigation

**Files:** Modify `src/navigation.js`, `src/styles/navigation.css`; extend the navigation harness and browser checks.

- Present the same navigation through one mobile menu.
- Implement the selected disclosure/dialog accessibility pattern completely.
- Prevent hidden desktop controls from remaining keyboard-focusable.

**Tests:** Keyboard traversal, focus containment if modal, open/close after orientation/viewport changes, no horizontal overflow, usable targets on small screens.

### Task 6: Replace the home layout

**Files:** Modify `src/pages.js`, `src/styles/interface.css`, `src/styles/activities.css`; update `scratch/verify-home-layout.mjs`.

- Replace the hero and duplicate tabs with the compact collection heading and library toolbar.
- Render the selected paginated collection using shared card markup.
- Add results summary, empty state, clear controls and pagination.
- Remove primary-title truncation and tiny action targets.

**Tests:** Correct card/page counts; readable full labels; search across all records; filters; all opener types; no hidden collection exposed to keyboard users.

### Task 7: Integrate lesson-level navigation

**Files:** Modify `src/pages.js`, `src/navigation.js`, `src/app.js`; inspect activity modules before changing leave-confirmation handling.

- Add breadcrumbs, lesson chooser and Previous/Next without duplicating lesson metadata.
- Maintain the header through all views and restore library position on return.
- Reuse the existing confirmation modal where leaving an unfinished activity would lose work.

**Tests:** Collection boundaries; direct lesson switching; correct resets; cancel/stay retains activity; confirm/leave navigates; no accidental quiz submission or progress loss.

### Task 8: Fix Life Skills reading navigation

**Files:** Modify `src/pages.js`; create `src/life-skills-frame.js`; modify `lesson1.html` through `lesson12.html` only if stable section anchors are missing.

- Inspect actual section headings and create reliable section targets.
- Add the section chooser and guarded iframe sizing/section-position handling.
- Add an accessible iframe title and visible loading/failure handling.
- Remove old left-sidebar style overrides from `renderLifeSkills()` once the shell no longer uses those elements.

**Tests:** Open each registered lesson through the app; section selector reaches the correct heading; expanding activities updates height; no clipping; Previous/Next and Back work; standalone lesson interactions still pass.

### Task 9: Remove obsolete navigation safely

**Files:** Modify `app.html`, `src/navigation.js`, `src/styles/base.css`, `src/styles/activities.css`, and affected harnesses.

- Remove the old sidebar nodes, toggles, overlays, listeners and unused styles together.
- Search for all removed IDs before deletion to avoid null-element crashes.
- Remove obsolete home-tab and show-all code/styles.
- Update tests to check the new navigation contracts, retaining meaningful opener and content regressions.

**Tests:** Clean boot with no missing-element errors; no old navigation visible or focusable; existing modals and lesson activities still work.

### Task 10: Cache handling and final verification

**Files:** Modify relevant resource version strings in `app.html`, `src/app.js`, and `src/styles/app.css` after the final module graph is known.

- Version changed direct and nested resources consistently. If a shared module is imported in multiple places, use exactly the same URL to avoid duplicate stateful module instances.
- Run all syntax checks and regression suites without piping away exit statuses.
- Inspect the actual app in a real browser, not only standalone lessons or jsdom.
- Present screenshots and a short verification report for user review. Do not commit or push without authorization.

## 5. Validation commands

Run from `C:/Users/Dell/Downloads/Quran and Hadith lesson` after the relevant files exist:

```bash
node --check src/app.js
node --check src/pages.js
node --check src/navigation.js
node --check src/state.js
node --check src/catalog.js
node --check src/life-skills-frame.js
node scratch/verify-navigation-layout.mjs
node scratch/verify-home-layout.mjs
node scratch/verify-wiring.mjs
node scratch/verify-hadith-display.mjs
node scratch/verify-lesson2.js
node scratch/verify-lesson3.js
node scratch/verify-lessons-4-12.mjs
node preflight.js
```

Expected after implementation: each command exits successfully, with any pre-existing preflight warnings documented. These are future verification targets, not results already obtained.

Use an existing verified local HTTP server, or start one from the project root if needed. Check that it serves this project's `app.html` before browser testing. Do not change launch scripts or weaken browser security as part of this plan.

### Real-browser acceptance checks

- Desktop: test at 1366×768 and 1440×900.
- Mobile: test at 390×844 and 320×568, plus landscape.
- Zoom: test readable reflow at 200%.
- Top navigation remains reachable without scrolling back to the beginning.
- Library search and initial cards appear without a tall decorative section in front of them.
- No horizontally clipped page, unreadable title ellipsis or overlapping sticky controls.
- Collection navigation, global search, pagination, lesson chooser and return-to-library all work through visible clicks.
- Keyboard-only opening, selection, closing and focus return work.
- Inspect all registered Life Skills iframe loads, and representative short/long Quran and Hadith intros.
- Exercise expanding Life Skills activities and verify section jumps after their heights change.
- Check for application console errors; distinguish optional remote font/Quran API failures from navigation failures.
- Record actual screenshots and measurements. jsdom passing alone is not visual acceptance.

## 6. Risks and tradeoffs

- **Dropdown overload:** Keep panels searchable and bounded, with Browse all always available.
- **Over-compaction:** Do not chase a fixed number of cards per screen at the expense of readable titles or touch targets.
- **Duplicated state:** Use one catalog/opener and consistent ES-module URLs.
- **Accidental loss of work:** Inspect activity state and confirm navigation away from active attempts where necessary.
- **Iframe resizing:** Observe content changes carefully; test fonts, collapsed sections and viewport changes; avoid resize loops.
- **Old selector dependencies:** Update the shell, listeners and tests together when removing sidebar IDs.
- **Pagination friction:** Offset the extra page action with search covering the entire collection and direct navbar access.
- **False verification:** Report headless behavior and real-browser layout checks separately. Do not assume server downtime explains design complaints.

## 7. Scope boundaries

Included: page organization, shared navigation, lesson discovery, readable cards, browsing state, mobile/keyboard access, and Life Skills section navigation.

Excluded: religious content changes, new lessons, rewritten exercises, a new framework, progress-system redesign, deployment, and changing file-versus-server startup behavior.

## 8. Approval and completion checklist

- [ ] User approves replacing both side menus and the duplicate home tabs.
- [ ] One shared navbar works throughout the app.
- [ ] All collections are searchable and reachable without a long catalog scroll.
- [ ] Library pagination and restored browsing state work.
- [ ] Full lesson titles remain readable.
- [ ] Lesson switching and section navigation work without losing work unexpectedly.
- [ ] Existing lesson content and progress are preserved.
- [ ] Updated automated tests pass.
- [ ] Desktop, mobile and keyboard behavior are verified in the real app.
- [ ] User reviews the implemented design before any push.

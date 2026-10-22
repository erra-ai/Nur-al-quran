import {
  app,
  getModule,
  getSurahProgress,
  hadiths,
  renderApp,
  state,
  surahs,
} from "./state.js?v=20260907-topnav2";
import { startQuiz } from "./activities/quiz.js?v=20260907-topnav2";
import { startVerseOrder } from "./activities/verse-order.js?v=20260907-topnav2";
import { fetchSurahFromQuranCom } from "./quran-api.js?v=20260907-topnav2";
import { ITANI_TEEN_TRANSLATIONS } from "./data/translations/itani-teens.js?v=20260907-topnav2";
import { UTHMANI_FALLBACK } from "./data/quran-fallback.js?v=20260907-topnav2";
import { LIFE_SKILL_LESSONS, LIFE_SKILL_SECTIONS } from "./data/life-skills.js?v=20260907-topnav2";
import {
  PAGE_SIZE, catalog, categoriesOf, filterCatalog, browse,
  pageOf, setPage, setQuery, setCategory, openEntry, openByIdentity,
  neighborOfCurrent, goHome,
} from "./catalog.js?v=20260907-topnav2";

/* ---------- small helpers ---------- */
function attrEsc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const COLLECTION_META = {
  quran: {
    title: "Quran",
    lead: "Choose a surah to study — read the words, learn the meanings, then test yourself.",
  },
  hadith: {
    title: "Hadith",
    lead: "Thirty Prophetic lessons, ﷺ. Filter by topic or search, then open one to study.",
  },
  lifeskills: {
    title: "Strong Heart, Wise Mind",
    lead: "Twelve life-skill lessons in order. Each opens a full guided lesson.",
  },
};

/* ===========================================================
   LESSON BAR — breadcrumbs + lesson chooser + prev/next,
   shared by surah/hadith intros and Life Skills lessons.
   =========================================================== */
function currentCollectionKey() {
  if (state.view === "lifeSkills") return "lifeskills";
  return state.moduleType === "hadith" ? "hadith" : "quran";
}

function lessonBarHtml() {
  const key = currentCollectionKey();
  const meta = COLLECTION_META[key];
  const list = catalog(key);
  const currentNumber = key === "lifeskills" ? state.lifeSkillLesson
    : (list[state.surahIndex] ? list[state.surahIndex].number : null);
  const entry = list.find(e => e.number === currentNumber);
  const label = entry ? `${entry.kind} · ${entry.title}` : "—";
  const canPrev = !!neighborOfCurrent(-1);
  const canNext = !!neighborOfCurrent(1);
  return `
    <div class="lesson-bar">
      <button class="lb-crumb" id="lbHome">Home</button>
      <span class="lb-sep">/</span>
      <span class="lb-crumb dim">${meta.title}</span>
      <span class="lb-sep">/</span>
      <span class="lb-current">${label}</span>
      <div class="lb-actions">
        <select id="lbChooser" class="lb-chooser" aria-label="Choose another lesson">
          ${list.map(e => `<option value="${e.number}" ${e.number === currentNumber ? "selected" : ""}>${e.number}. ${attrEsc(e.title)}</option>`).join("")}
        </select>
        <button class="ghost lb-step" id="lbPrev" ${canPrev ? "" : "disabled"} title="Previous lesson">←</button>
        <button class="ghost lb-step" id="lbNext" ${canNext ? "" : "disabled"} title="Next lesson">→</button>
      </div>
    </div>`;
}

function wireLessonBar() {
  const key = currentCollectionKey();
  document.getElementById("lbHome")?.addEventListener("click", () => { state.view = "home"; renderApp(); });
  document.getElementById("lbPrev")?.addEventListener("click", () => {
    const n = neighborOfCurrent(-1);
    if (n) openEntry(n);
  });
  document.getElementById("lbNext")?.addEventListener("click", () => {
    const n = neighborOfCurrent(1);
    if (n) openEntry(n);
  });
  document.getElementById("lbChooser")?.addEventListener("change", (e) => {
    openByIdentity(key, Number(e.target.value));
  });
}

/* ---------- LIFESKILLS ---------- */
function renderLifeSkills() {
  const lesson = LIFE_SKILL_LESSONS.find(l => l.id === state.lifeSkillLesson) || LIFE_SKILL_LESSONS[0];
  app.innerHTML = `
    ${lessonBarHtml()}
    <div class="fb-nav">
      <span class="fb-nav-title">Strong Heart, Wise Mind · ${lesson.name}</span>
      <div class="fb-nav-tools">
        <select id="lsJump" class="lb-chooser" aria-label="Jump to section in this lesson">
          <option value="">Jump to section…</option>
          ${LIFE_SKILL_SECTIONS.map(s => `<option value="${s.id}">${s.label}</option>`).join("")}
        </select>
        <button class="ghost" id="btnLsBack">← Back to library</button>
      </div>
    </div>
    <iframe id="lsFrame" title="${attrEsc(lesson.name)} — Life Skills lesson" src="${lesson.file}"></iframe>
  `;
  wireLessonBar();
  document.getElementById("btnLsBack").addEventListener("click", goHome);
  document.getElementById("lsJump").addEventListener("change", (ev) => {
    const id = ev.target.value;
    if (!id) return;
    try {
      const doc = ev.currentTarget.closest("#app").querySelector("#lsFrame").contentDocument;
      const el = doc && doc.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { /* cross-frame guard */ }
    ev.target.selectedIndex = 0;
  });
  fitLifeSkillsFrame();
}

// Grow the iframe to its content height so the outer page is the single
// scroll surface (content grows as checkpoints expand). Same-origin only;
// failures fall back to the tall-frame default.
function fitLifeSkillsFrame() {
  const frame = document.getElementById("lsFrame");
  if (!frame) return;
  let ro = null;
  const fit = () => {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement) return;
      const h = doc.documentElement.scrollHeight;
      if (h > 200) frame.style.height = (h + 28) + "px";
    } catch (e) { /* keep default height */ }
  };
  frame.addEventListener("load", () => {
    fit();
    setTimeout(fit, 800);
    setTimeout(fit, 2500); // web fonts landing
    try {
      const win = frame.contentWindow;
      if (win && win.ResizeObserver) {
        ro = new win.ResizeObserver(fit);
        ro.observe(frame.contentDocument.documentElement);
      }
    } catch (e) { /* observer optional */ }
  });
}

/* ---------- HOME (library) ---------- */
function renderHome() {
  const key = state.activeCollection in COLLECTION_META ? state.activeCollection : "quran";
  const meta = COLLECTION_META[key];
  const b = browse[key];
  const chipsHtml = key === "hadith"
    ? `<div class="cat-chips" id="libChips"></div>` : "";

  app.innerHTML = `
    <div class="lib-head">
      <h1 class="lib-title">${meta.title}</h1>
      <p class="lib-lead">${meta.lead}</p>
    </div>
    <div class="home-toolbar">
      <input id="libSearch" class="search-input" type="search" placeholder="Search ${meta.title.toLowerCase()} by name, number or topic…" aria-label="Search ${meta.title}" value="${attrEsc(b.query)}">
      ${chipsHtml}
      <button class="clear-filters" id="libClear" ${b.query || b.category !== "All" ? "" : "hidden"}>Clear ✕</button>
    </div>
    <p class="lib-meta" id="libMeta" aria-live="polite"></p>
    <div class="surah-grid dense-grid" id="libGrid"></div>
    <div class="lib-pager" id="libPager" hidden>
      <button class="show-more" id="pgPrev">← Previous</button>
      <span class="pg-label" id="pgLabel"></span>
      <button class="show-more" id="pgNext">Next →</button>
    </div>
  `;

  const grid = document.getElementById("libGrid");
  const search = document.getElementById("libSearch");
  const clearBtn = document.getElementById("libClear");
  const pager = document.getElementById("libPager");
  const chipsWrap = document.getElementById("libChips");

  function renderGrid() {
    const bb = browse[key];
    let entries = filterCatalog(key, { query: bb.query, category: bb.category });
    const total = entries.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    bb.page = Math.min(Math.max(1, bb.page), totalPages);
    const start = (bb.page - 1) * PAGE_SIZE;
    const visible = entries.slice(start, start + PAGE_SIZE);

    grid.innerHTML = visible.map(e => {
      let status = "";
      if (e.coll === "quran") {
        const prog = getSurahProgress(e.ref.id);
        status = prog.completed
          ? `<span class="badge done">✓ ${prog.bestScore}/30</span>`
          : (prog.lastScore ? `<span class="badge">▸ ${prog.lastScore}/30</span>` : `<span class="badge idle">—</span>`);
      }
      const arabicLine = e.arabic ? `<span class="arabic dc-ar">${e.arabic}</span>`
        : `<span class="lc-kind">${e.coll === "hadith" ? "ﷺ" : e.kind}</span>`;
      const catLine = e.coll === "hadith" && e.category ? `<span class="dc-cat">${e.category}</span>` : "";
      return `
      <button class="surah-card dense lib-card" data-entry="${e.key}" aria-label="Open ${attrEsc(e.title)}">
        <div class="dc-top"><span class="num">${e.number}</span>${arabicLine}${status}</div>
        <div class="dc-name lc-title">${e.title}</div>
        <div class="dc-title lc-sub">${e.sub}</div>
        <div class="dc-catrow">${catLine}<span class="dc-num">${e.coll === "hadith" ? "Hadith " + e.number : ""}</span></div>
        <span class="dc-go">Open →</span>
      </button>`;
    }).join("") || `<div class="lib-empty">Nothing matches your search. <button class="clear-filters" id="emptyClear">Clear search ✕</button></div>`;

    document.getElementById("libMeta").textContent =
      total ? `Showing ${start + 1}–${start + visible.length} of ${total} ${key === "lifeskills" ? "lessons" : key}` : "No results.";
    document.getElementById("pgLabel").textContent = `Page ${bb.page} of ${totalPages}`;
    pager.hidden = totalPages <= 1;
    document.getElementById("pgPrev").disabled = bb.page <= 1;
    document.getElementById("pgNext").disabled = bb.page >= totalPages;
    clearBtn.hidden = !(bb.query || bb.category !== "All");

    if (chipsWrap) {
      const cats = ["All", ...categoriesOf("hadith")];
      chipsWrap.innerHTML = cats.map(c => {
        const n = filterCatalog("hadith", c === "All" ? {} : { category: c }).length;
        return `<button class="cat-chip${bb.category === c ? " active" : ""}" data-cat="${c}">${c}<span>${n}</span></button>`;
      }).join("");
    }
    document.getElementById("emptyClear")?.addEventListener("click", () => {
      setQuery(key, ""); setCategory(key, "All"); search.value = ""; renderGrid();
    });
  }

  search.addEventListener("input", () => { setQuery(key, search.value); renderGrid(); });
  clearBtn.addEventListener("click", () => {
    setQuery(key, ""); setCategory(key, "All"); search.value = ""; renderGrid();
  });
  document.getElementById("pgPrev").addEventListener("click", () => { setPage(key, pageOf(key) - 1); renderGrid(); });
  document.getElementById("pgNext").addEventListener("click", () => { setPage(key, pageOf(key) + 1); renderGrid(); });
  if (chipsWrap) {
    chipsWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".cat-chip");
      if (!chip) return;
      setCategory(key, chip.dataset.cat);
      renderGrid();
    });
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".lib-card");
    if (!card) return;
    const found = catalog(key).find(x => x.key === card.dataset.entry);
    if (found) openEntry(found);
  });

  renderGrid();
}

/* ---------- INTRO (surah / hadith) ---------- */
/* ---------- HERO REMOVED: the library heading above carries identity ---------- */
const LOCAL_BASMALA_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toArabicIndic(number) {
  return String(number).replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]);
}

// The offline Arabic comes from the dedicated verified Uthmani fallback
// (src/data/quran-fallback.js) — never reconstructed from fillBlanks.
function fallbackArabicVerses(ayahTexts) {
  return ayahTexts
    .map((text, index) => `<span class="intro-api-verse">${text} <span class="ayah-end">${toArabicIndic(index + 1)}</span></span>`)
    .join(" ");
}

// The shared Mushaf-style panel: rendered for every surah with the local
// verified text, then upgraded in a second pass (hydrateIntroQuranText) with
// sanitised Quran.com Uthmani Tajweed text.
function introSurahText(module) {
  const fallback = UTHMANI_FALLBACK[module.number];
  const arabicAyahs = fallback?.ayahs;
  if (!Array.isArray(arabicAyahs) || arabicAyahs.length === 0) return "";

  const translation = ITANI_TEEN_TRANSLATIONS[module.number];
  if (!translation || !Array.isArray(translation.ayahs) || translation.ayahs.length !== arabicAyahs.length) return "";

  // Al-Fatiha: the basmala is ayah 1 (never shown separately). At-Tawbah: none.
  const showBasmala = module.number !== 1 && module.number !== 9 && fallback.basmala != null;
  const basmalaBlock = showBasmala
    ? `
      <div class="intro-basmala arabic" dir="rtl">${fallback.basmala}</div>
      <div class="intro-basmala-english">${translation.basmala}</div>`
    : "";

  const translations = translation.ayahs.map((text, index) => {
    return `
      <div class="intro-translation-row">
        <span class="intro-translation-number">${index + 1}</span>
        <span>${text}</span>
      </div>`;
  }).join("");

  return `
    <section class="intro-surah-text" data-quran-chapter="${module.number}" aria-label="${module.nameEnglish} Arabic text and English translation">
      <div class="intro-surah-heading">
        <span>Surah ${module.number} · ${module.nameEnglish}</span>
        <span>Recite with meaning</span>
      </div>
      ${basmalaBlock}
      <div class="intro-mushaf-rule" aria-hidden="true"><span></span><i></i><span></span></div>
      <div class="intro-mushaf-arabic arabic" dir="rtl">
        ${fallbackArabicVerses(arabicAyahs)}
      </div>
      <div class="intro-mushaf-translations">${translations}</div>
      <div class="intro-translation-source">
        <span class="intro-quran-status">Loading Uthmani Tajweed text from Quran.com…</span>
        <span>English: ClearQuran (Talal Itani) · teen reference</span>
      </div>
    </section>`;
}

async function hydrateIntroQuranText(module) {
  const chapter = module.number;
  const panel = document.querySelector(`[data-quran-chapter="${chapter}"]`);
  if (!panel) return;

  const basmalaEl = panel.querySelector(".intro-basmala");
  const arabicEl = panel.querySelector(".intro-mushaf-arabic");
  const statusEl = panel.querySelector(".intro-quran-status");
  const expected = ITANI_TEEN_TRANSLATIONS[chapter]?.ayahs?.length ?? 0;

  try {
    const quran = await fetchSurahFromQuranCom(chapter);
    if (!document.body.contains(panel)) return;
    if (expected && quran.verseCount !== expected) {
      throw new Error(`Quran.com returned ${quran.verseCount} verses for surah ${chapter}, expected ${expected}`);
    }
    arabicEl.innerHTML = quran.verses
      .map((verse) => `<span class="intro-api-verse" data-verse-key="${verse.key}">${verse.html}</span>`)
      .join(" ");
    if (basmalaEl) basmalaEl.innerHTML = quran.basmalaHtml ?? "";
    statusEl.textContent = `Arabic: Quran.com API · Uthmani Tajweed · Page ${quran.pageLabel}`;
    panel.classList.add("quran-api-ready");
  } catch (error) {
    if (!document.body.contains(panel)) return;
    statusEl.textContent = "Arabic: local verified fallback · Quran.com temporarily unavailable";
    panel.classList.add("quran-api-fallback");
    console.warn(`Could not load Quran.com text for surah ${chapter}; using the local verified fallback.`, error);
  }
}

// Hadith intros use the same ornamental Mushaf-style panel as surah intros so
// the Prophetic text is displayed, not crammed into the title row.
function introHadithText(m) {
  return `
    <section class="intro-surah-text" aria-label="${m.nameEnglish} hadith Arabic text">
      <div class="intro-surah-heading">
        <span>Hadith ${m.number} · ${m.nameEnglish}</span>
        <span>الحديث النبوي</span>
      </div>
      <div class="intro-mushaf-rule" aria-hidden="true"><span></span><i></i><span></span></div>
      <div class="intro-mushaf-arabic hadith-arabic-display arabic" dir="rtl">
        ${m.text}
      </div>
      <div class="intro-translation-source">
        <span>${m.narrator}</span>
        <span>${m.source}</span>
      </div>
    </section>`;
}

function renderIntro() {
  const m = getModule();
  const isHadith = state.moduleType === "hadith";
  const label = isHadith ? `Hadith ${m.number}` : `Surah ${m.number}`;
  app.innerHTML = `
    ${lessonBarHtml()}
    <div class="card intro-card elevated">
       <div class="ribbon">${isHadith ? 'Learn the sayings of the Prophet \uFDFA. One hadith at a time, the way the companions learned.' : 'Learn Qur\'anic Arabic with understanding.'}</div>
      <div class="intro-title">
        <div class="intro-title-main">
          <div class="meta">${isHadith ? `${label} · ${m.title}` : label}</div>
          <h2>${isHadith ? m.nameEnglish : m.title}</h2>
        </div>
        ${isHadith ? "" : `<div class="arabic arabic-name">${m.nameArabic}</div>`}
      </div>
      ${isHadith ? introHadithText(m) : introSurahText(m)}
      <p class="intro-body">${m.intro}</p>
      <div class="intro-actions">
        <button id="btnVocab">Start Vocabulary Cards →</button>
        <button class="secondary" id="btnSkipQuiz">Skip to Quiz</button>
        <button class="ghost" id="btnMatchVocab">Match Words</button>
        <button class="ghost" id="btnMeaningBank">Meaning Bank</button>
        <button class="ghost" id="btnVerseOrder">Order the Verses</button>
        <button class="ghost" id="btnFillBlanks">Meaning Blanks</button>
        <button class="ghost" id="btnBack">← Back to library</button>
      </div>
    </div>
  `;
  wireLessonBar();
  hydrateIntroQuranText(m);
  document.getElementById("btnVocab").addEventListener("click", () => {
    state.vocabIndex = 0;
    state.view = "vocab";
    renderApp();
  });
  document.getElementById("btnSkipQuiz").addEventListener("click", startQuiz);
  const mbBtn2=document.getElementById("btnMeaningBank");
  if(mbBtn2)mbBtn2.addEventListener("click",()=>{state.view="meaningBank";renderApp();});
  const mvBtn=document.getElementById("btnMatchVocab");
  if(mvBtn)mvBtn.addEventListener("click",()=>{state.matchAr=[];state.matchEn=[];state.matchSelected=null;state.view="matchVocab";renderApp();});
  const fbBtn = document.getElementById("btnFillBlanks");
  if (fbBtn) fbBtn.addEventListener("click", () => { state.view = "fillBlanks"; renderApp(); });
  const voBtn = document.getElementById("btnVerseOrder");
  if (voBtn) voBtn.addEventListener("click", startVerseOrder);
  const ovBtn = document.getElementById("btnOrderVerses");
  if (ovBtn) ovBtn.addEventListener("click", () => { state.view = "orderVerses"; renderApp(); });
  document.getElementById("btnBack").addEventListener("click", () => {
    state.view = "home";
    state.surahIndex = null;
    state.moduleType = "surah";
    renderApp();
  });
}

export { renderHome, renderIntro, renderLifeSkills };

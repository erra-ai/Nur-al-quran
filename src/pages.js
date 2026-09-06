import {
  app,
  getModule,
  getSurahProgress,
  hadiths,
  renderApp,
  state,
  surahs,
} from "./state.js";
import { startQuiz } from "./activities/quiz.js";
import { startVerseOrder } from "./activities/verse-order.js";
import { fetchSurahFromQuranCom } from "./quran-api.js?v=20260830-tajweed-ikhafa";
import { ITANI_TEEN_TRANSLATIONS } from "./data/translations/itani-teens.js";
import { UTHMANI_FALLBACK } from "./data/quran-fallback.js";

/* ---------- LIFESKILLS ---------- */
function renderLifeSkills() {
  // Hide left sidebar to give iframe more space
  document.getElementById("sidebar").style.display = "none";
  document.getElementById("sidebarToggle").style.display = "none";
  app.style.marginLeft = "0";

  app.innerHTML = `
    <div class="fb-nav">
      <span>Strong Heart, Wise Mind</span>
      <button class="ghost" id="btnLsBack">← Back to Home</button>
    </div>
    <iframe src="lesson1.html" style="width:100%;height:calc(100vh - 70px);border:none;border-radius:var(--radius-lg);box-shadow:var(--shadow);"></iframe>
  `;
  document.getElementById("btnLsBack").addEventListener("click", () => {
    // Restore left sidebar
    document.getElementById("sidebar").style.display = "";
    document.getElementById("sidebarToggle").style.display = "";
    app.style.marginLeft = "";
    state.view = "home";
    renderApp();
  });
}

/* ---------- HOME ---------- */
function hero() {
  const vocabCount = Math.max(...surahs.map(s => s.vocabulary.length));
  return `
    <section class="hero">
      <div class="hero-pattern"></div>
      <div class="hero-frame"></div>
      <div class="hero-glow"></div>
      <div class="basmala">بسم الله الرحمن الرحيم</div>
      <div class="title-kicker">Qur'an Arabic for Understanding</div>
      <h1>Nur <span class="accent">al-Qur'an</span></h1>
      <div class="hero-divider">
        <span class="hd-line"></span>
        <span class="hd-diamond"></span>
        <span class="hd-dot"></span>
        <span class="hd-diamond"></span>
        <span class="hd-line"></span>
      </div>
      <p>Read the words, learn the meanings, and connect each surah to reflection and action.</p>
      <div class="stats">
        <span><b>${surahs.length}</b> Surah${surahs.length === 1 ? "" : "s"} available</span>
        <span><b>30</b> questions per quiz</span>
        <span><b>${vocabCount}</b> core vocabulary cards</span>
      </div>
    </section>`;
}

function renderHome() {
  const cards = surahs.map((s, idx) => {
    const prog = getSurahProgress(s.id);
    const status = prog.completed
      ? `<span class="badge done">Completed</span><span class="badge">Best ${prog.bestScore}/30</span>`
      : (prog.lastScore
          ? `<span class="badge">In progress</span><span class="badge">Last ${prog.lastScore}/30</span>`
          : `<span class="badge">Not started</span>`);
    return `
      <div class="surah-card">
        <div class="row">
          <span class="num">Surah ${s.number}</span>
          <span class="english-name">${s.nameEnglish}</span>
        </div>
        <div class="arabic arabic-name">${s.nameArabic}</div>
        <div class="title">${s.title}</div>
        <div class="desc">${s.intro.split('. ')[0]}.</div>
        <div class="status">${status}</div>
        <div class="actions">
          <button data-action="start" data-idx="${idx}">Start Learning →</button>
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    ${hero()}
    <nav class="home-tabs" id="homeTabs">
      <button class="ht-tab active" data-target="sec-quran">Quran</button>
      <button class="ht-tab" data-target="sec-hadith">Hadith</button>
      <button class="ht-tab" data-target="sec-lifeskills">Life Skills <span class="ht-badge">1</span></button>
    </nav>
    <section class="home-section" id="sec-quran">
      <div class="section-title">
        <h2>Surahs</h2>
        <div class="line"></div>
      </div>
      <p class="lede">Pick a surah to begin. Each surah includes a short introduction, vocabulary cards, practice, and a quiz.</p>
      <div class="surah-grid">${cards}</div>
    </section>
    <section class="home-section" id="sec-hadith" style="margin-top:28px;">
      <div class="section-title">
        <h2>Hadith Lessons</h2>
        <div class="line"></div>
      </div>
      <p class="lede">Learn the sayings of the Prophet ﷺ — one hadith at a time, following the way he taught his companions.</p>
      <div class="surah-grid" id="hadith-grid"></div>
    </section>
    <section class="life-skills-section" id="sec-lifeskills">
      <div class="section-title">
        <h2>Strong Heart, Wise Mind</h2>
        <div class="line"></div>
      </div>
      <p class="lede">Quranic Life Skills for Muslim Kids — stories, reflection tools, and prophetic guidance for real-life situations.</p>
      <div class="surah-grid" id="life-skills-grid"></div>
    </section>
  `;

  // Render hadith cards
  const hGrid = document.getElementById("hadith-grid");
  hGrid.innerHTML = hadiths.map((h, idx) => `
    <div class="surah-card" style="border-left: 3px solid var(--gold);">
      <div class="row">
        <span class="num">ﷺ Hadith</span>
        <span class="english-name">${h.nameEnglish}</span>
      </div>
      <div class="arabic arabic-name" style="font-size:1.3rem; line-height:1.8;">${h.text}</div>
      <div class="title">${h.title}</div>
      <div class="desc">${h.narrator} — ${h.source}</div>
      <div class="actions">
        <button data-action="start-hadith" data-idx="${idx}">Start Lesson →</button>
      </div>
    </div>
  `).join("");

  app.querySelectorAll("button[data-action='start']").forEach(b => {
    b.addEventListener("click", e => {
      state.surahIndex = Number(e.currentTarget.getAttribute("data-idx"));
      state.moduleType = "surah";
      state.view = "intro";
      renderApp();
    });
  });
  hGrid.querySelectorAll("button[data-action='start-hadith']").forEach(b => {
    b.addEventListener("click", e => {
      state.surahIndex = Number(e.currentTarget.getAttribute("data-idx"));
      state.moduleType = "hadith";
      state.view = "intro";
      renderApp();
    });
  });

  const lsGrid = document.getElementById("life-skills-grid");
  lsGrid.innerHTML = `
    <div class="surah-card" style="border-left: 3px solid #0f766e;">
      <div class="row">
        <span class="num" style="color:#0f766e;">Lesson 1</span>
        <span class="english-name">My Heart Feels, But My Feelings Do Not Lead Me</span>
      </div>
      <div class="title">Understanding feelings and learning self-control</div>
      <div class="desc">Ages 10–13 · Story-centered lesson about anger, patience, and choosing what pleases Allah.</div>
      <div class="actions">
        <button data-action="start-lifeskill" data-idx="0">Start Lesson →</button>
      </div>
    </div>
    <div class="surah-card" style="border-left: 3px solid #d4a24c; opacity:0.5;">
      <div class="row">
        <span class="num" style="color:#d4a24c;">Lesson 2</span>
        <span class="english-name">Coming Soon</span>
      </div>
      <div class="title">More lessons coming inshaAllah</div>
      <div class="desc">11 more lessons planned in this series.</div>
    </div>
  `;

  // Life Skills button listeners
  document.querySelectorAll("button[data-action='start-lifeskill']").forEach(b => {
    b.addEventListener("click", e => {
      state.view = "lifeSkills";
      renderApp();
    });
  });

  // Tab bar — click to scroll
  document.querySelectorAll('.ht-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ht-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Tab bar — highlight active on scroll
  const tabObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.ht-tab').forEach(t => t.classList.remove('active'));
        const tab = document.querySelector('.ht-tab[data-target="' + e.target.id + '"]');
        if (tab) tab.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });
  ['sec-quran', 'sec-hadith', 'sec-lifeskills'].forEach(id => {
    const el = document.getElementById(id);
    if (el) tabObserver.observe(el);
  });
}

/* ---------- INTRO ---------- */
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

function renderIntro() {
  const m = getModule();
  const isHadith = state.moduleType === "hadith";
  const label = isHadith ? `Hadith ${m.number}` : `Surah ${m.number}`;
  app.innerHTML = `
    <div class="card intro-card elevated">
       <div class="ribbon">${isHadith ? 'Learn the sayings of the Prophet \uFDFA. One hadith at a time, the way the companions learned.' : 'Learn Qur\'anic Arabic with understanding.'}</div>
      <div class="intro-title">
        <div class="intro-title-main">
          <div class="meta">${isHadith ? `${label} · ${m.title}` : label}</div>
          <h2>${isHadith ? m.nameEnglish : m.title}</h2>
          ${isHadith ? `<div class="arabic arabic-name" style="font-size:1.6rem; color:var(--green-deep); margin-top:8px; text-align:left; direction:rtl;">${m.text}</div>
          <div class="muted small" style="margin-top:4px;">${m.narrator} — ${m.source}</div>` : ""}
        </div>
        ${isHadith ? "" : `<div class="arabic arabic-name">${m.nameArabic}</div>`}
      </div>
      ${isHadith ? "" : introSurahText(m)}
      <p class="intro-body">${m.intro}</p>
      <div class="intro-actions">
        <button id="btnVocab">Start Vocabulary Cards →</button>
        <button class="secondary" id="btnSkipQuiz">Skip to Quiz</button>
        <button class="ghost" id="btnMatchVocab">Match Words</button>
        <button class="ghost" id="btnMeaningBank">Meaning Bank</button>
        <button class="ghost" id="btnVerseOrder">Order the Verses</button>
        <button class="ghost" id="btnFillBlanks">Meaning Blanks</button>
        <button class="ghost" id="btnBack">← Back to Home</button>
      </div>
    </div>
  `;
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

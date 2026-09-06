import { app, getModule, renderApp, state } from "../state.js";
import { fetchSurahFromQuranCom } from "../quran-api.js?v=20260830-tajweed-ikhafa";
import { ITANI_TEEN_TRANSLATIONS } from "../data/translations/itani-teens.js";
import { ayahText } from "./meaning-banks.js";
import { startQuiz } from "./quiz.js";

// English line for an ayah, rebuilt verbatim from the verified fillBlanksEn
// segments so the wording always tracks src/data/surahs/<surah>.js.
function enText(ayah) {
  return (ayah.segments || []).map(s => s.t ?? s.b ?? "").join("");
}

async function hydrateRecitation(module) {
  const list = app.querySelector(".rc-list");
  if (!list) return;

  try {
    const quran = await fetchSurahFromQuranCom(module.number);
    if (!document.body.contains(list)) return;
    const cards = Array.from(list.querySelectorAll(".rc-ayah"));
    const translation = ITANI_TEEN_TRANSLATIONS[module.number];
    quran.verses.forEach((verse, index) => {
      const card = cards[index];
      if (!card) return;
      card.querySelector(".rc-ar").innerHTML = verse.html;
      card.querySelector(".rc-en").textContent = translation?.ayahs?.[index] ?? card.querySelector(".rc-en").textContent;
      card.dataset.verseKey = verse.key;
    });
    const basmalaEl = app.querySelector(".rc-basmala");
    if (basmalaEl && quran.basmalaHtml) basmalaEl.innerHTML = quran.basmalaHtml;
    app.querySelector(".rc-source-note").innerHTML =
      `Arabic: Quran.com API · Uthmani Tajweed · Page ${quran.pageLabel} · English: ClearQuran (Talal Itani), teen reference.`;
  } catch (error) {
    console.warn("Could not hydrate the reading view from Quran.com; using local verified text.", error);
  }
}

function renderRecite() {
  const m = getModule();
  if (!m || !m.fillBlanks || !Array.isArray(m.fillBlanks.ayahs)) {
    state.view = "intro";
    renderApp();
    return;
  }

  const translation = ITANI_TEEN_TRANSLATIONS[m.number];
  const arAyahs = m.fillBlanks.ayahs;
  const enAyahs = m.fillBlanksEn?.ayahs || [];
  const byN = {};
  enAyahs.forEach(a => { byN[a.n] = a; });
  const showBasmala = m.number !== 1 && translation?.basmala != null;

  const ayahsHtml = arAyahs.map((a) => {
    const arText = ayahText(a);
    const enAyah = byN[a.n] || enAyahs[a.n - 1];
    const enTxt = translation?.ayahs?.[a.n - 1] ?? (enAyah ? enText(enAyah) : "");
    return `
      <article class="rc-ayah">
        <div class="rc-ayah-head">
          <span class="rc-ayah-num">${a.n}</span>
          <span class="rc-ayah-tag">Ayah ${a.n} of ${arAyahs.length}</span>
        </div>
        <div class="rc-ar arabic">${arText}</div>
        <div class="rc-en">${enTxt}</div>
      </article>`;
  }).join("");

  app.innerHTML = `
    <section class="rc-banner">
      <div class="rc-banner-glow"></div>
      ${showBasmala ? `<div class="rc-basmala arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : ""}
      <div class="rc-kicker">Surah ${m.number} · Recite with Meaning</div>
      <h2>${m.nameEnglish}</h2>
      <div class="rc-ar-name arabic">${m.nameArabic}</div>
      <div class="rc-title">${m.title}</div>
      <div class="hero-divider">
        <span class="hd-line"></span>
        <span class="hd-diamond"></span>
        <span class="hd-dot"></span>
        <span class="hd-diamond"></span>
        <span class="hd-line"></span>
      </div>
    </section>
    <div class="rc-list">${ayahsHtml}</div>
    <p class="rc-source-note">English wording: ClearQuran (Talal Itani) · teen level — pulled from the verified <code>translation-notes/${m.number}-${m.id}-itani-teens.md</code> reference.</p>
    <div class="rc-actions">
      <button id="rcBack">\u2190 Back to Intro</button>
      <button class="secondary" id="rcVocab">Vocabulary Cards \u2192</button>
      <button class="ghost" id="rcQuiz">Skip to Quiz</button>
    </div>
  `;
  hydrateRecitation(m);

  document.getElementById("rcBack").addEventListener("click", () => {
    state.view = "intro";
    renderApp();
  });
  document.getElementById("rcVocab").addEventListener("click", () => {
    state.vocabIndex = 0;
    state.view = "vocab";
    renderApp();
  });
  const quizBtn = document.getElementById("rcQuiz");
  if (quizBtn) quizBtn.addEventListener("click", startQuiz);
}

export { renderRecite };

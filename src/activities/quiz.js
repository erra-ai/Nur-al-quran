import {
  app,
  buildProgressiveQuiz,
  getModule,
  getSurahProgress,
  hadiths,
  renderApp,
  setSurahProgress,
  shuffleOptions,
  state,
  surahs,
} from "../state.js";
import { showModal } from "../navigation.js";

/* ---------- QUIZ (scored) ---------- */
function startQuiz() {
  const m = getModule();
  state.quizOrder = buildProgressiveQuiz(m.quiz).map(shuffleOptions);
  state.quizIndex = 0;
  state.score = 0;
  state.answers = [];
  state.selected = null;
  state.checked = false;
  state.view = "quiz";
  renderApp();
}

function renderQuiz() {
  const m = getModule();
  const total = state.quizOrder.length;
  const q = state.quizOrder[state.quizIndex];
  const progressPct = (state.quizIndex / total) * 100;

  app.innerHTML = `
    <div class="quiz-meta">
      <span>Question ${state.quizIndex + 1} of ${total}</span>
      <span class="category">${q.category}</span>
      <span class="score">Score: ${state.score}</span>
    </div>
    <div class="progress"><div style="width: ${progressPct}%"></div></div>
    <div class="card">
      <div class="arabic-q">${q.q}</div>
      <div class="options" id="opts">
        ${q.options.map((o, i) => `
          <button class="option" data-i="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span>${o}</button>
        `).join("")}
      </div>
      <div id="fbSlot"></div>
      <div class="quiz-controls">
        <button class="ghost" id="btnBackIntro2">← Back to Intro</button>
        <button id="btnNext" class="hidden">Next Question →</button>
      </div>
    </div>
  `;

  const optsEl = document.getElementById("opts");
  const nextBtn = document.getElementById("btnNext");

  // Auto-check on click (no Check Answer button).
  optsEl.querySelectorAll(".option").forEach(b => {
    b.addEventListener("click", () => {
      if (state.checked) return;
      state.selected = Number(b.getAttribute("data-i"));
      state.checked = true;

      const correct = state.selected === q.answer;
      if (correct) state.score++;
      state.answers.push({ q, chosen: state.selected, correct });

      optsEl.querySelectorAll(".option").forEach((x, i) => {
        x.disabled = true;
        if (i === q.answer) x.classList.add("correct");
        if (i === state.selected && !correct) x.classList.add("wrong");
      });
      document.getElementById("fbSlot").innerHTML = correct
        ? `<div class="feedback good"><b>Correct!</b> ${q.explanation}</div>`
        : `<div class="feedback bad"><b>Not quite.</b> Correct answer: <em>${q.options[q.answer]}</em>. ${q.explanation}</div>`;

      nextBtn.classList.remove("hidden");
      nextBtn.textContent = state.quizIndex === total - 1 ? "See Results →" : "Next Question →";
    });
  });

  nextBtn.addEventListener("click", () => {
    if (!state.checked) return;
    if (state.quizIndex === total - 1) {
      finishQuiz();
    } else {
      state.quizIndex++;
      state.selected = null;
      state.checked = false;
      renderApp();
    }
  });

  document.getElementById("btnBackIntro2").addEventListener("click", () => {
    showModal("Leave the quiz? Your current progress for this attempt will be lost.", () => {
      state.view = "intro";
      renderApp();
    });
  });
}

function finishQuiz() {
  const m = getModule();
  const prev = getSurahProgress(m.id);
  const best = Math.max(prev.bestScore || 0, state.score);
  setSurahProgress(m.id, {
    lastScore: state.score,
    bestScore: best,
    completed: (prev.completed || best >= 18) // mark completed if they did decently OR were already completed
  });
  // Mark completed only after first attempt? Keep simple: completed only when finished.
  // (We set best/last; completed stays false until we re-evaluate.)
  state.view = "result";
  renderApp();
}

/* ---------- RESULT ---------- */
function scoreLevel(score, total) {
  if (score >= total * 0.9) return { label: "Excellent understanding", pct: Math.round((score / total) * 100) };
  if (score >= total * 0.75) return { label: "Very good", pct: Math.round((score / total) * 100) };
  if (score >= total * 0.6) return { label: "Good, but review needed", pct: Math.round((score / total) * 100) };
  return { label: "Needs more practice", pct: Math.round((score / total) * 100) };
}

function renderResult() {
  const m = getModule();
  const isHadith = state.moduleType === "hadith";
  const total = m.quiz.length;
  const level = scoreLevel(state.score, total);
  const missed = state.answers.filter(a => !a.correct);

  // Mark completed
  setSurahProgress(m.id, { completed: true });

  const review = missed.length === 0
    ? `<div class="card center"><p class="muted" style="margin:0;">No missed questions — mashaAllah!</p></div>`
    : `<div class="review-list">
        ${missed.map(a => `
          <div class="card review-item">
            <div class="qi-row">
              <span class="category" style="background:linear-gradient(135deg, var(--green-deep), var(--green-soft)); color:#fff; padding:4px 12px; border-radius:999px; font-size:0.78rem; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">${a.q.category}</span>
              <span class="muted small">Question</span>
            </div>
            <div class="qi-q">${a.q.q}</div>
            <div class="qi-row-answers">
              <span class="you"><b>Your answer:</b> ${a.q.options[a.chosen]}</span>
              <span class="right"><b>Correct:</b> ${a.q.options[a.q.answer]}</span>
            </div>
            <div class="muted small" style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--cream-3);">${a.q.explanation}</div>
          </div>
        `).join("")}
      </div>`;

  app.innerHTML = `
    <div class="card result-headline elevated">
      <div class="trophy">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
      </div>
      <h2>Your Result</h2>
      <div class="pct">${state.score}/${total} &nbsp;·&nbsp; ${level.pct}%</div>
      <div class="level">${level.label}</div>
      <div class="surah-meta">${isHadith ? 'Hadith' : 'Surah'} ${m.number} · ${m.nameEnglish}</div>
    </div>
    <div class="section-title" style="margin-top:22px;">
      <h2>Review — Questions You Missed</h2>
      <div class="line"></div>
    </div>
    ${review}
    <div class="actions-center">
      <button id="btnRestart">Restart Quiz</button>
      <button class="secondary" id="btnReviewVocab">Review Vocabulary Cards</button>
      <button class="secondary" id="btnNextSurah">Next Surah →</button>
      <button class="ghost" id="btnHome">← Back to Home</button>
    </div>
  `;

  document.getElementById("btnRestart").addEventListener("click", startQuiz);
  document.getElementById("btnReviewVocab").addEventListener("click", () => {
    state.vocabIndex = 0;
    state.view = "vocab";
    renderApp();
  });
  document.getElementById("btnHome").addEventListener("click", () => {
    state.view = "home";
    state.surahIndex = null;
    renderApp();
  });
  const nextBtn = document.getElementById("btnNextSurah");
  if (nextBtn) {
    const list = state.moduleType === "hadith" ? hadiths : surahs;
    const currentIdx = state.surahIndex;
    if (currentIdx !== null && currentIdx < list.length - 1) {
      nextBtn.addEventListener("click", () => {
        state.surahIndex = currentIdx + 1;
        state.view = "intro";
        state.vocabIndex = 0;
        state.practiceIndex = 0;
        renderApp();
      });
      nextBtn.textContent = "Next " + (state.moduleType === "hadith" ? "Hadith" : "Surah") + " →";
    } else {
      nextBtn.textContent = "← Back to Home";
      nextBtn.addEventListener("click", () => {
        state.view = "home";
        state.surahIndex = null;
        renderApp();
      });
    }
  }
}

export { renderQuiz, renderResult, startQuiz };

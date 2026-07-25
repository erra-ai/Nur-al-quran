import {
  renderFillBlanks,
  renderMeaningBank,
  renderOrderVerses,
  renderReadMeaning,
} from "./activities/meaning-banks.js";
import { renderQuiz, renderResult } from "./activities/quiz.js";
import { renderVerseOrder } from "./activities/verse-order.js";
import {
  renderMatchVocab,
  renderPractice,
  renderVocab,
} from "./activities/vocabulary.js";
import { renderSidebar } from "./navigation.js";
import { renderHome, renderIntro, renderLifeSkills } from "./pages.js";
import { setRenderer, state } from "./state.js";

function render() {
  renderSidebar();
  if (state.view === "home") return renderHome();
  if (state.view === "intro") return renderIntro();
  if (state.view === "vocab") return renderVocab();
  if (state.view === "practice") return renderPractice();
  if (state.view === "quiz") return renderQuiz();
  if (state.view === "result") return renderResult();
  if (state.view === "readMeaning") return renderReadMeaning();
  if (state.view === "fillBlanks") return renderFillBlanks();
  if (state.view === "orderVerses") return renderOrderVerses();
  if (state.view === "verseOrder") return renderVerseOrder();
  if (state.view === "lifeSkills") return renderLifeSkills();
  if (state.view === "matchVocab") return renderMatchVocab();
  if (state.view === "meaningBank") return renderMeaningBank();
}

setRenderer(render);
render();

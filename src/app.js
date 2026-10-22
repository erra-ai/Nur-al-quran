import {
  renderFillBlanks,
  renderMeaningBank,
  renderOrderVerses,
  renderReadMeaning,
} from "./activities/meaning-banks.js?v=20260907-topnav2";
import { renderQuiz, renderResult } from "./activities/quiz.js?v=20260907-topnav2";
import { renderRecite } from "./activities/recite.js?v=20260907-topnav2";
import { renderVerseOrder } from "./activities/verse-order.js?v=20260907-topnav2";
import {
  renderMatchVocab,
  renderPractice,
  renderVocab,
} from "./activities/vocabulary.js?v=20260907-topnav2";
import { initChrome, syncChrome } from "./navigation.js?v=20260907-topnav2";
import { renderHome, renderIntro, renderLifeSkills } from "./pages.js?v=20260907-topnav2";
import { setRenderer, state } from "./state.js?v=20260907-topnav2";

function render() {
  syncChrome();
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
  if (state.view === "recite") return renderRecite();
  if (state.view === "lifeSkills") return renderLifeSkills();
  if (state.view === "matchVocab") return renderMatchVocab();
  if (state.view === "meaningBank") return renderMeaningBank();
}

setRenderer(render);
initChrome();
render();

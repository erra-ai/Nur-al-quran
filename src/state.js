import { surahs } from "./data/surahs/index.js";
import { hadiths } from "./data/hadiths/index.js";

/* ===========================================================
   STATE
   =========================================================== */
export const state = {
  view: "home",         // home | intro | vocab | practice | quiz | result | readMeaning | fillBlanks | verseOrder
  moduleType: "surah",  // "surah" | "hadith"
  surahIndex: null,
  vocabIndex: 0,
  practiceIndex: 0,
  quizIndex: 0,
  quizOrder: [],        // shuffled question indices
  score: 0,
  answers: [],          // {qIdx, chosen, correct}
  selected: null,
  checked: false,
  verseOrder: [],
  verseBank: [],
  verseCards: [],
  matchAr: [],
  matchEn: [],
  matchSelected: null,
  verseChecked: false
};

/* ===========================================================
   PERSISTENCE (localStorage)
   =========================================================== */
const STORAGE_KEY = "quranLearningRoom.v1";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { /* ignore */ }
}
export function getSurahProgress(id) {
  const all = loadProgress();
  return all[id] || { completed: false, bestScore: 0, lastScore: 0, practiceDone: false, lastDate: null };
}
export function setSurahProgress(id, patch) {
  const all = loadProgress();
  const cur = all[id] || {};
  all[id] = { ...cur, ...patch, lastDate: new Date().toISOString().slice(0, 10) };
  saveProgress(all);
}

/* ===========================================================
   UTILITIES
   =========================================================== */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Build a question object with shuffled options and an updated answer index.
export function shuffleOptions(q) {
  const indices = q.options.map((_, i) => i);
  const shuffled = shuffle(indices);
  const newOptions = shuffled.map(i => q.options[i]);
  const newAnswer = shuffled.indexOf(q.answer);
  return { ...q, options: newOptions, answer: newAnswer };
}

const QUIZ_LEARNING_STAGES = ["Vocabulary", "Comprehension", "Critical Thinking", "Rhetoric"];

// Preserve the learning progression while keeping each stage varied.
export function buildProgressiveQuiz(quiz) {
  const staged = QUIZ_LEARNING_STAGES.flatMap(category =>
    shuffle(quiz.filter(q => q.category === category))
  );
  const uncategorized = shuffle(quiz.filter(q => !QUIZ_LEARNING_STAGES.includes(q.category)));
  return [...staged, ...uncategorized];
}

export { hadiths, surahs };
export const app = document.getElementById("app");

let renderer = null;

export function setRenderer(nextRenderer) {
  renderer = nextRenderer;
}

export function renderApp() {
  if (!renderer) throw new Error("Application renderer has not been registered.");
  return renderer();
}

export function getModuleList() {
  return state.moduleType === "hadith" ? hadiths : surahs;
}

export function getModule() {
  return getModuleList()[state.surahIndex];
}

import { app, getModule, renderApp, state } from "../state.js";
import { ayahText } from "./meaning-banks.js";

function startVerseOrder() {
  const m = getModule();
  if (!m.fillBlanks) { state.view = "intro"; renderApp(); return; }
  state.verseCards = [];
  state.verseChecked = false;
  state.view = "verseOrder";
  renderApp();
}

function renderVerseOrder() {
  const m = getModule();
  if (!m.fillBlanks) { state.view = "intro"; renderApp(); return; }
  const ayahs = m.fillBlanks.ayahs.map(ayah => ({ n: ayah.n, text: ayahText(ayah) }));
  const correctOrder = ayahs.map(a => a.n);

  if (!state.verseCards || state.verseCards.length !== ayahs.length) {
    state.verseCards = [...ayahs].sort(() => Math.random() - 0.5);
  }

  const cardsHtml = state.verseCards.map((ayah, i) => `
    <div class="vo-card" draggable="true" data-n="${ayah.n}">
      <span class="vo-grip">⋮⋮</span>
      <span class="vo-text">${ayah.text}</span>
    </div>`).join('');

  app.innerHTML = `
    <div class="fb-nav"><span>Verse Order · ${m.nameEnglish}</span><button class="ghost" id="btnVoBack">← Back to Intro</button></div>
    <p class="vo-instructions">Drag the verses to put them in the correct order</p>
    <div class="card">
      <div class="vo-list" id="voList">${cardsHtml}</div>
      <div class="quiz-controls" style="margin-top:18px;">
        <button class="ghost" id="btnReset">Reset</button>
        <button id="btnCheck">Check Order</button>
      </div>
      <div class="fb-status" id="voStatus"></div>
    </div>
  `;

  let dragIdx = null;
  const list = document.getElementById('voList');

  list.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.vo-card');
    if (!card) return;
    dragIdx = [...list.children].indexOf(card);
    card.classList.add('dragging');
  });
  list.addEventListener('dragend', (e) => {
    const card = e.target.closest('.vo-card');
    if (card) card.classList.remove('dragging');
    dragIdx = null;
  });
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const card = e.target.closest('.vo-card');
    if (card && card !== list.querySelector('.dragging')) card.classList.add('over');
  });
  list.addEventListener('dragleave', (e) => {
    const card = e.target.closest('.vo-card');
    if (card) card.classList.remove('over');
  });
  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.vo-card');
    if (!target || dragIdx === null) return;
    target.classList.remove('over');
    const toIdx = [...list.children].indexOf(target);
    if (dragIdx === toIdx) return;
    const children = [...list.children];
    if (dragIdx < toIdx) list.insertBefore(children[dragIdx], children[toIdx].nextSibling);
    else list.insertBefore(children[dragIdx], children[toIdx]);
    state.verseCards = [...list.children].map(c => ({ n: +c.getAttribute('data-n'), text: c.querySelector('.vo-text').textContent }));
    dragIdx = null;
    state.verseChecked = false;
    document.getElementById('voStatus').innerHTML = '';
  });

  document.getElementById('btnCheck').addEventListener('click', () => {
    const order = [...document.getElementById('voList').children].map(c => +c.getAttribute('data-n'));
    const ok = order.every((n, i) => n === correctOrder[i]);
    state.verseChecked = true;
    if (ok) {
      document.getElementById('voStatus').innerHTML = '<div class="feedback good">MashaAllah! The verses are in the correct order!</div>';
      document.querySelectorAll('.vo-card').forEach(c => c.classList.add('correct'));
    } else {
      document.getElementById('voStatus').innerHTML = '<div class="feedback bad">Not yet — some verses are out of order. Try again.</div>';
    }
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    state.verseCards = [...ayahs].sort(() => Math.random() - 0.5);
    state.verseChecked = false;
    renderApp();
  });

  document.getElementById('btnVoBack').addEventListener('click', () => {
    state.verseCards = [];
    state.view = "intro";
    renderApp();
  });
}

export { renderVerseOrder, startVerseOrder };

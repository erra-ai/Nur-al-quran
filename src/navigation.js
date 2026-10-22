import { state } from "./state.js?v=20260907-topnav2";
import { COLLECTIONS, catalog, filterCatalog, openEntry, goHome } from "./catalog.js?v=20260907-topnav2";

/* ===========================================================
   TOP NAVBAR — one persistent chrome for the whole app.
   Brand/Home · collection buttons (each opens a searchable
   panel) · global Search panel. Replaces the old dual sidebars.
   showModal() is kept for the quiz leave-guard.
   =========================================================== */

const SECTIONS = [
  { key: "quran",      label: "Quran",       hint: "Browse all surahs" },
  { key: "hadith",     label: "Hadith",      hint: "Browse all hadith" },
  { key: "lifeskills", label: "Life Skills", hint: "Browse all lessons" },
];

function topbarHtml() {
  return `
    <div class="tb-row">
      <button class="tb-brand" id="navHome" title="Go to library home">
        <span class="tb-mark">N</span>
        <span class="tb-name">Nur <em>al-Qur'an</em></span>
      </button>
      <button class="tb-menu" id="navMenuBtn" aria-expanded="false" aria-controls="navCollections" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <nav class="tb-nav" id="navCollections" aria-label="Lesson collections">
        ${SECTIONS.map(s => `
          <span class="nav-drop" data-coll="${s.key}">
            <button class="nav-link" data-action="panel" aria-expanded="false" aria-haspopup="true">${s.label}<i class="caret" aria-hidden="true"></i></button>
            <div class="nav-panel" role="region" aria-label="${s.label} search and list" hidden>
              <input class="nav-panel-search search-input" type="search" placeholder="Search ${s.label}…" aria-label="Search ${s.label}">
              <div class="nav-results" tabindex="0"></div>
              <button class="nav-browse" data-action="browse" data-coll="${s.key}">${s.hint} →</button>
            </div>
          </span>`).join("")}
        <span class="nav-drop" data-coll="__search">
          <button class="nav-link nav-search-link" data-action="panel" aria-expanded="false" aria-haspopup="true" aria-label="Search all lessons">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
            <span class="nav-search-word">Search</span>
          </button>
          <div class="nav-panel" role="region" aria-label="Search all lessons" hidden>
            <input class="nav-panel-search search-input" type="search" placeholder="Search Quran, Hadith, Life Skills…" aria-label="Search all lessons">
            <div class="nav-results" tabindex="0"></div>
          </div>
        </span>
      </nav>
    </div>`;
}

let topbarEl = null;
let lastTrigger = null;

function closeAllPanels({ focusTrigger } = {}) {
  if (!topbarEl) return;
  topbarEl.querySelectorAll(".nav-panel").forEach(p => { p.hidden = true; });
  topbarEl.querySelectorAll(".nav-link").forEach(l => l.setAttribute("aria-expanded", "false"));
  topbarEl.classList.remove("menu-open");
  const mb = topbarEl.querySelector("#navMenuBtn");
  if (mb) mb.setAttribute("aria-expanded", "false");
  if (focusTrigger && lastTrigger) lastTrigger.focus();
  lastTrigger = null;
}

function panelOpen(drop) {
  return drop.querySelector(".nav-panel") && !drop.querySelector(".nav-panel").hidden;
}

function renderResults(drop, key, query) {
  const resultsEl = drop.querySelector(".nav-results");
  const input = drop.querySelector(".nav-panel-search");
  const q = (input ? input.value : "").trim();
  let entries;
  if (key === "__search") {
    entries = ["quran", "hadith", "lifeskills"].flatMap(k => filterCatalog(k, { query: q })).slice(0, 24);
  } else {
    entries = filterCatalog(key, { query: q });
  }
  if (!q && key !== "__search") entries = entries.slice(0, 8);
  resultsEl.innerHTML = entries.length
    ? entries.map(e => `
        <button class="nav-item" data-entry="${e.key}">
          <span class="ni-num">${e.number}</span>
          <span class="ni-body"><span class="ni-title">${e.title}</span><span class="ni-sub">${e.kind}${e.coll === "hadith" && e.category ? " · " + e.category : ""}</span></span>
          ${e.arabic ? `<span class="ni-ar arabic">${e.arabic}</span>` : ""}
        </button>`).join("")
    : `<div class="nav-empty">${q ? "Nothing matches “" + q + "”." : "Nothing here yet."}</div>`;
}

function openPanel(drop, trigger) {
  const wasOpen = panelOpen(drop);
  closeAllPanels();
  if (wasOpen) return;
  lastTrigger = trigger;
  drop.querySelector(".nav-panel").hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  const key = drop.dataset.coll;
  renderResults(drop, key);
  const input = drop.querySelector(".nav-panel-search");
  if (input) { input.value = ""; input.focus(); }
}

// Navigate, but ask first when leaving an active quiz attempt.
function guardedNavigate(fn) {
  if (state.view === "quiz") {
    showModal("Leave the quiz? Your current progress for this attempt will be lost.", () => fn(), null);
  } else {
    fn();
  }
}

function initChrome() {
  topbarEl = document.getElementById("topbar");
  if (!topbarEl || topbarEl.dataset.ready === "1") return;
  topbarEl.dataset.ready = "1";
  topbarEl.innerHTML = topbarHtml();

  topbarEl.addEventListener("click", (ev) => {
    const actionBtn = ev.target.closest("[data-action]");
    const item = ev.target.closest(".nav-item");
    const drop = ev.target.closest(".nav-drop");

    if (actionBtn && actionBtn.dataset.action === "panel" && drop) {
      openPanel(drop, actionBtn);
      return;
    }
    if (actionBtn && actionBtn.dataset.action === "browse") {
      const coll = actionBtn.dataset.coll;
      closeAllPanels();
      guardedNavigate(() => { state.activeCollection = coll; goHome(); });
      return;
    }
    if (item && drop) {
      const key = item.dataset.entry;
      const all = [...catalog("quran"), ...catalog("hadith"), ...catalog("lifeskills")];
      const found = all.find(e => e.key === key);
      if (found) { closeAllPanels(); guardedNavigate(() => openEntry(found)); }
      return;
    }
    if (ev.target.closest("#navHome")) { closeAllPanels(); guardedNavigate(goHome); return; }
    if (ev.target.closest("#navMenuBtn")) {
      const nav = topbarEl.querySelector("#navCollections");
      const open = topbarEl.classList.toggle("menu-open");
      ev.target.closest("#navMenuBtn").setAttribute("aria-expanded", String(open));
      return;
    }
    if (!ev.target.closest(".nav-panel")) closeAllPanels();
  });

  topbarEl.addEventListener("input", (ev) => {
    if (!ev.target.classList.contains("nav-panel-search")) return;
    const drop = ev.target.closest(".nav-drop");
    renderResults(drop, drop.dataset.coll, ev.target.value);
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeAllPanels({ focusTrigger: true });
  });

  // Click anywhere outside the topbar closes open panels.
  document.addEventListener("click", (ev) => {
    if (topbarEl && !topbarEl.contains(ev.target)) closeAllPanels();
  });

  // Mobile: a panel opened from the stacked menu stays in-flow.
  window.addEventListener("resize", () => closeAllPanels());
}

function syncChrome() {
  if (!topbarEl) return;
  const inHome = state.view === "home";
  topbarEl.querySelectorAll(".nav-drop[data-coll]").forEach(drop => {
    const k = drop.dataset.coll;
    if (k === "__search") return;
    const active = inHome && state.activeCollection === k;
    drop.querySelector(".nav-link").classList.toggle("active", active);
  });
  const brand = topbarEl.querySelector("#navHome");
  if (brand) brand.classList.toggle("active", inHome);
}

/* ===========================================================
   CUSTOM MODAL (kept from the old navigation; quiz.js uses it)
   =========================================================== */
function showModal(message, onConfirm, onCancel) {
  document.getElementById("appModalBody").textContent = message;
  const actions = document.getElementById("appModalActions");
  actions.innerHTML = `
    <button class="modal-cancel" id="modalCancel">Stay</button>
    <button id="modalConfirm">Leave</button>
  `;
  document.getElementById("appModal").classList.add("open");
  document.getElementById("modalConfirm").addEventListener("click", () => {
    document.getElementById("appModal").classList.remove("open");
    if (onConfirm) onConfirm();
  });
  document.getElementById("modalCancel").addEventListener("click", () => {
    document.getElementById("appModal").classList.remove("open");
    if (onCancel) onCancel();
  });
}

export { initChrome, syncChrome, showModal, COLLECTIONS };

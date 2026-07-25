import {
  getModuleList,
  hadiths,
  renderApp,
  state,
  surahs,
} from "./state.js";

/* ===========================================================
   SIDEBAR
   =========================================================== */
function renderSidebar() {
  // LEFT SIDEBAR — Surahs only
  const surahList = document.getElementById("sidebarList");
  if (surahList) {
    let html = "";
    surahs.forEach((s) => {
      const active = state.moduleType === "surah" && state.surahIndex !== null && getModuleList()[state.surahIndex]?.id === s.id;
      html += `
        <button class="sidebar-item${active ? " active" : ""}" data-sid="${s.id}" data-type="surah">
          <span class="si-num">${s.number}</span>
          <span class="si-ar">${s.nameArabic}</span>
          <span class="si-en">${s.title}</span>
        </button>`;
    });
    surahList.innerHTML = html;
    surahList.querySelectorAll(".sidebar-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sid = btn.getAttribute("data-sid");
        const idx = surahs.findIndex((s) => s.id === sid);
        if (idx >= 0) {
          state.surahIndex = idx;
          state.moduleType = "surah";
          state.view = "intro";
          state.vocabIndex = 0;
          state.practiceIndex = 0;
          renderApp();
          closeLeftSidebar();
        }
      });
    });
  }

  // RIGHT SIDEBAR — Hadith only
  const hadithList = document.getElementById("hadithList");
  if (hadithList) {
    let html = "";
    hadiths.forEach((h) => {
      const active = state.moduleType === "hadith" && state.surahIndex !== null && getModuleList()[state.surahIndex]?.id === h.id;
      html += `
        <button class="sidebar-item${active ? " active" : ""}" data-sid="${h.id}" data-type="hadith">
          <span class="si-num">ﷺ</span>
          <span class="si-ar" style="font-size:0.72rem;">${h.text.substring(0, 40)}...</span>
          <span class="si-en">${h.title}</span>
        </button>`;
    });
    hadithList.innerHTML = html;
    hadithList.querySelectorAll(".sidebar-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sid = btn.getAttribute("data-sid");
        const idx = hadiths.findIndex((h) => h.id === sid);
        if (idx >= 0) {
          state.surahIndex = idx;
          state.moduleType = "hadith";
          state.view = "intro";
          state.vocabIndex = 0;
          state.practiceIndex = 0;
          renderApp();
          closeRightSidebar();
        }
      });
    });
  }
}

// LEFT SIDEBAR
function openLeftSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarToggle").classList.add("open");
  document.getElementById("overlay").classList.add("visible");
}
function closeLeftSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarToggle").classList.remove("open");
  document.getElementById("overlay").classList.remove("visible");
}
function toggleLeftSidebar() {
  if (document.getElementById("sidebar").classList.contains("open")) closeLeftSidebar();
  else openLeftSidebar();
}

// RIGHT SIDEBAR
function openRightSidebar() {
  document.getElementById("hadithSidebar").classList.add("open");
  document.getElementById("hadithToggle").classList.add("open");
  document.getElementById("hadithOverlay").classList.add("visible");
}
function closeRightSidebar() {
  document.getElementById("hadithSidebar").classList.remove("open");
  document.getElementById("hadithToggle").classList.remove("open");
  document.getElementById("hadithOverlay").classList.remove("visible");
}
function toggleRightSidebar() {
  if (document.getElementById("hadithSidebar").classList.contains("open")) closeRightSidebar();
  else openRightSidebar();
}

// Attach listeners
document.getElementById("sidebarToggle").addEventListener("click", toggleLeftSidebar);
document.getElementById("sidebarClose").addEventListener("click", closeLeftSidebar);
document.getElementById("overlay").addEventListener("click", closeLeftSidebar);
document.getElementById("hadithToggle").addEventListener("click", toggleRightSidebar);
document.getElementById("hadithClose").addEventListener("click", closeRightSidebar);
document.getElementById("hadithOverlay").addEventListener("click", closeRightSidebar);

/* ===========================================================
   CUSTOM MODAL
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

export { renderSidebar, showModal };

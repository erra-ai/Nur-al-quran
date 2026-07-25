import {
  app,
  getModule,
  renderApp,
  setSurahProgress,
  shuffleOptions,
  state,
} from "../state.js";
import { startQuiz } from "./quiz.js";

function renderMatchVocab(){
  const m=getModule();
  const pairs=m.vocabulary.map(v=>({ar:v.arabic,en:v.meaning}));
  if(!state.matchAr||state.matchAr.length!==pairs.length){
    state.matchAr=[...pairs].sort(()=>Math.random()-0.5);
    state.matchEn=[...pairs].sort(()=>Math.random()-0.5);
    state.matchSelected=null;
  }
  const arList=state.matchAr,enList=state.matchEn;

  function isMatched(idx,col){
    if(col==='ar')return arList[idx].matched===true;
    return enList[idx].matched===true;
  }

  function redrawLines(){
    const svg=document.getElementById('matchSv');
    const wrap=document.querySelector('.match-wrap');
    if(!svg||!wrap)return;
    const wr=wrap.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+wr.width+' '+wr.height);
    svg.style.width=wr.width+'px';svg.style.height=wr.height+'px';
    let html='';
    for(let i=0;i<arList.length;i++){
      if(!arList[i].matched)continue;
      const enIdx=enList.findIndex(e=>e.matched&&enList.indexOf(e)===arList[i].matchEnIdx);
      const arEl=document.querySelector('.match-ar-item[data-i="'+i+'"]');
      const enEl=document.querySelector('.match-en-item[data-i="'+arList[i].matchEnIdx+'"]');
      if(!arEl||!enEl)continue;
      const arR=arEl.getBoundingClientRect(),enR=enEl.getBoundingClientRect();
      const x1=enR.right-wr.left-4,y1=enR.top+enR.height/2-wr.top;
      const x2=arR.left-wr.left+4,y2=arR.top+arR.height/2-wr.top;
      html+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#4caf84" stroke-width="2" stroke-linecap="round" opacity="0.7"/>';
    }
    svg.innerHTML=html;
  }

  function checkComplete(){
    const done=arList.filter(a=>a.matched).length;
    if(done===pairs.length){
      document.getElementById('matchSt').innerHTML='<div class="feedback good">MashaAllah! All '+pairs.length+' pairs matched correctly!</div>';
    }
  }

  app.innerHTML=`
    <div class="match-nav"><span>Match Arabic to English · ${m.nameEnglish}</span><button class="ghost" id="btnMatchBack">← Back to Intro</button></div>
    <div class="match-wrap" id="matchWrap">
      <div class="match-col match-en">${enList.map((p,i)=>`
        <div class="match-item match-en-item${p.matched?' matched':''}" data-i="${i}" data-pair="${p.en}">${p.en}</div>
      `).join('')}</div>
      <svg class="match-lines" id="matchSv" style="position:absolute;top:0;left:0;pointer-events:none;z-index:0;"></svg>
      <div class="match-col match-ar">${arList.map((p,i)=>`
        <div class="match-item match-ar-item${p.matched?' matched':''}" data-i="${i}" data-pair="${p.ar}">${p.ar}${p.matched?`<span class="match-meaning">${enList[p.matchEnIdx]?.en||''}</span>`:''}</div>
      `).join('')}</div>
    </div>
    <div class="match-status" id="matchSt"></div>
  `;

  // Click Arabic word
  document.querySelectorAll('.match-ar-item:not(.matched)').forEach(el=>{
    el.addEventListener('click',()=>{
      document.querySelectorAll('.match-item.selected').forEach(e=>e.classList.remove('selected'));
      el.classList.add('selected');
      state.matchSelected={col:'ar',idx:parseInt(el.dataset.i)};
    });
  });

  // Click English word
  document.querySelectorAll('.match-en-item:not(.matched)').forEach(el=>{
    el.addEventListener('click',()=>{
      if(!state.matchSelected){el.classList.add('wrong-flash');setTimeout(()=>el.classList.remove('wrong-flash'),400);return;}
      const enIdx=parseInt(el.dataset.i);
      const arIdx=state.matchSelected.idx;
      if(state.matchSelected.col!=='ar')return; // only match ar->en direction

      const arPair=arList[arIdx];
      const enPair=enList[enIdx];
      // Check if this is the correct match
      const correct=pairs.some(p=>p.ar===arPair.ar&&p.en===enPair.en);
      
      if(correct){
        arPair.matched=true;arPair.matchEnIdx=enIdx;
        enPair.matched=true;
        state.matchSelected=null;
        renderApp(); // re-render to show matched state
      } else {
        el.classList.add('wrong-flash');
        setTimeout(()=>el.classList.remove('wrong-flash'),400);
        document.getElementById('matchSt').innerHTML='<div class="feedback bad">Not a match — try again!</div>';
      }
    });
  });

  // Redraw SVG lines after render
  setTimeout(redrawLines,50);
  window.addEventListener('resize',redrawLines);

  document.getElementById('btnMatchBack').addEventListener('click',()=>{
    state.matchAr=[];state.matchEn=[];state.matchSelected=null;
    state.view='intro';renderApp();
  });

  checkComplete();
}

/* ---------- VOCAB ---------- */
function renderVocab() {
  const m = getModule();
  const v = m.vocabulary[state.vocabIndex];
  const total = m.vocabulary.length;
  const isLast = state.vocabIndex === total - 1;
  const grammarHtml = v.grammar ? `
    <div class="vocab-grammar">
      <div class="vocab-grammar-title">${v.grammar.english} · <span class="arabic-grammar" lang="ar" dir="rtl">${v.grammar.arabic}</span></div>
      <div class="vocab-grammar-note">${v.grammar.explanation}</div>
    </div>` : "";

  // Progress dots
  const dots = m.vocabulary.map((_, i) => `
    <span style="
      display:inline-block;
      width:${i === state.vocabIndex ? "22px" : "8px"};
      height:8px;
      border-radius:999px;
      background:${i <= state.vocabIndex ? "var(--gold)" : "var(--cream-3)"};
      transition:width 0.3s ease, background 0.3s ease;
      margin:0 3px;
    "></span>
  `).join("");

  app.innerHTML = `
    <div class="vocab-nav">
      <span>Vocabulary · Card ${state.vocabIndex + 1} of ${total}</span>
      <button class="ghost" id="btnBackIntro">← Back to Intro</button>
    </div>
    <div style="text-align:center; margin-bottom:14px;">${dots}</div>
    <div class="vocab-wrap">
      <div class="vocab-card${v.grammar ? " has-grammar" : ""}" id="vocabCard">
        <div class="vocab-face front">
          <div class="label gold">Arabic Word</div>
          <div class="arabic-word">${v.arabic}</div>
          <div class="label">English Meaning</div>
          <div class="meaning">${v.meaning}</div>
          ${grammarHtml}
          <div style="margin-top:14px; color:var(--muted); font-size:0.85rem;">Tap card to see verse &amp; hint</div>
        </div>
        <div class="vocab-face back">
          <div class="label gold">Verse Connection</div>
          <div class="verse">"${v.connection}"</div>
          <div class="label gold" style="margin-top:18px;">Memory Hint</div>
          <div class="hint">${v.hint}</div>
          <div style="margin-top:14px; color:#f3ead4; opacity:0.7; font-size:0.85rem;">Tap card to flip back</div>
        </div>
      </div>
    </div>
    <div class="vocab-controls">
      <button class="secondary" id="btnPrev" ${state.vocabIndex === 0 ? "disabled" : ""}>← Previous</button>
      ${isLast
        ? `<button id="btnNextPractice">Start Practice →</button>`
        : `<button id="btnNext">Next Card →</button>`
      }
    </div>
  `;

  // Flip on click
  const card = document.getElementById("vocabCard");
  card.addEventListener("click", () => card.classList.toggle("flipped"));

  const prev = document.getElementById("btnPrev");
  if (prev) prev.addEventListener("click", e => {
    e.stopPropagation();
    if (state.vocabIndex > 0) { state.vocabIndex--; renderApp(); }
  });
  const next = document.getElementById("btnNext");
  if (next) next.addEventListener("click", e => {
    e.stopPropagation();
    if (state.vocabIndex < total - 1) { state.vocabIndex++; renderApp(); }
  });
  const nextPractice = document.getElementById("btnNextPractice");
  if (nextPractice) nextPractice.addEventListener("click", e => {
    e.stopPropagation();
    state.practiceIndex = 0;
    state.selected = null;
    state.checked = false;
    state.view = "practice";
    renderApp();
  });
  document.getElementById("btnBackIntro").addEventListener("click", e => {
    e.stopPropagation();
    state.view = "intro";
    renderApp();
  });
}

/* ---------- PRACTICE (unscored) ---------- */
function renderPractice() {
  const m = getModule();
  const total = m.practice.length;
  // Shuffle options each time a new practice question is shown
  const p = shuffleOptions(m.practice[state.practiceIndex]);

  app.innerHTML = `
    <div class="quiz-meta">
      <span>Practice ${state.practiceIndex + 1} of ${total}</span>
      <span class="category">Vocabulary Practice</span>
    </div>
    <div class="progress"><div style="width: ${((state.practiceIndex) / total) * 100}%"></div></div>
    <div class="card">
      <div class="question-text">${p.q}</div>
      <div class="options" id="opts">
        ${p.options.map((o, i) => `
          <button class="option" data-i="${i}"><span class="letter">${String.fromCharCode(65 + i)}</span>${o}</button>
        `).join("")}
      </div>
      <div id="fbSlot"></div>
      <div class="quiz-controls">
        <button class="ghost" id="btnBackVocab">← Back to Cards</button>
        <button id="btnNext" class="hidden">Next Practice →</button>
      </div>
    </div>
  `;

  const optsEl = document.getElementById("opts");
  const nextBtn = document.getElementById("btnNext");

  const advance = () => {
    if (state.practiceIndex < total - 1) {
      state.practiceIndex++;
      state.selected = null;
      state.checked = false;
      renderApp();
    } else {
      setSurahProgress(m.id, { practiceDone: true });
      if (m.id === "fatiha" && m.fillBlanks) {
        state.view = "fillBlanks";
        renderApp();
      } else {
        startQuiz();
      }
    }
  };

  // Auto-check on click (no Check button needed).
  optsEl.querySelectorAll(".option").forEach(b => {
    b.addEventListener("click", () => {
      if (state.checked) return;
      state.selected = Number(b.getAttribute("data-i"));
      state.checked = true;

      const correct = state.selected === p.answer;
      optsEl.querySelectorAll(".option").forEach((x, i) => {
        x.disabled = true;
        if (i === p.answer) x.classList.add("correct");
        if (i === state.selected && !correct) x.classList.add("wrong");
      });
      document.getElementById("fbSlot").innerHTML = correct
        ? `<div class="feedback good"><b>Correct!</b> Good job noticing the meaning.</div>`
        : `<div class="feedback bad"><b>Not quite.</b> Look at the correct meaning again and try to remember it.</div>`;

      nextBtn.classList.remove("hidden");
      nextBtn.textContent = state.practiceIndex === total - 1 && m.id === "fatiha" && m.fillBlanks ? "Start Meaning Blanks →" : (state.practiceIndex === total - 1 ? "Start Main Quiz →" : "Next Practice →");
    });
  });
  nextBtn.addEventListener("click", advance);

  document.getElementById("btnBackVocab").addEventListener("click", () => {
    state.view = "vocab";
    renderApp();
  });
}

export { renderMatchVocab, renderPractice, renderVocab };

import {
  app,
  getModule,
  renderApp,
  shuffle,
  state,
} from "../state.js";

function ayahText(ayah) {
  return ayah.segments.map(seg => seg.t || seg.b || "").join("");
}

function renderFillBlanks() {
  const m = getModule();
  if (!m.fillBlanks) { state.view = "intro"; renderApp(); return; }
  const fb = m.fillBlanks;
  const mixedAyahs = shuffle(fb.ayahs);

  // Build ayah HTML in mixed order so the learner must use meaning, not sequence memory.
  const ayahsHtml = mixedAyahs.map((ayah, ai) => {
    const segs = ayah.segments.map((seg, si) => {
      if (seg.t) return '<span class="fb-text">' + seg.t + '</span>';
      if (seg.b) return '<span class="fb-blank" data-word="' + seg.b + '" data-meaning="' + seg.m + '"><span class="fb-hint">' + seg.m + '</span></span>';
      return '';
    }).join('');
    return '<span class="fb-ayah">' + segs + '<span class="fb-num">' + (ai + 1) + '</span></span>';
  }).join('');

  // Build word bank (shuffled)
  const allWords = [];
  fb.ayahs.forEach(a => a.segments.forEach(s => { if (s.b) allWords.push(s.b); }));
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  const bankHtml = shuffled.map((w, i) =>
    '<div class="fb-chip" draggable="true" data-word="' + w + '" data-idx="' + i + '">' + w + '</div>'
  ).join('');

  app.innerHTML = `
    <div class="fb-nav"><span>Meaning Blanks \u00B7 ${m.nameEnglish}</span><button class="ghost" id="btnFbBack">\u2190 Back to Intro</button></div>
    <div class="fb-bank-label">Mixed verses \u2014 use the English meaning hint to place each Arabic word</div>
    <div class="fb-bank" id="fbBank">${bankHtml}</div>
    <div class="card fb-card"><div class="fb-surah">${ayahsHtml}</div></div>
    <div class="fb-status" id="fbStatus"></div>
  `;

  let selectedChip = null;

  document.querySelectorAll('.fb-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('used')) return;
      document.querySelectorAll('.fb-chip.selected').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedChip = chip;
    });
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.getAttribute('data-word'));
      chip.classList.add('dragging');
      selectedChip = chip;
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
  });

  document.querySelectorAll('.fb-blank').forEach(blank => {
    blank.addEventListener('click', () => {
      if (!selectedChip || blank.classList.contains('correct')) return;
      placeWord(selectedChip, blank);
    });
    blank.addEventListener('dragover', (e) => { e.preventDefault(); blank.classList.add('over'); });
    blank.addEventListener('dragleave', () => blank.classList.remove('over'));
    blank.addEventListener('drop', (e) => {
      e.preventDefault();
      blank.classList.remove('over');
      if (blank.classList.contains('correct')) return;
      const word = e.dataTransfer.getData('text/plain');
      const chip = document.querySelector('.fb-chip[data-word="' + word + '"]:not(.used)');
      if (chip) placeWord(chip, blank);
    });
  });

  function placeWord(chip, blank) {
    const chipWord = chip.getAttribute('data-word');
    const blankWord = blank.getAttribute('data-word');
    if (chipWord === blankWord) {
      blank.classList.add('correct');
      blank.innerHTML = '<span class="fb-placed">' + chipWord + '</span>';
      chip.classList.add('used');
      chip.classList.remove('selected');
      chip.setAttribute('draggable', 'false');
      selectedChip = null;
      const total = document.querySelectorAll('.fb-blank').length;
      const done = document.querySelectorAll('.fb-blank.correct').length;
      const el = document.getElementById('fbStatus');
      if (done === total) {
        el.innerHTML = '<div class="feedback good"><b>MashaAllah!</b> You completed the meaning blanks.</div><div style="margin-top:12px;"><button id="btnVerseOrder">Put Verses in Order \u2192</button></div>';
        document.getElementById('btnVerseOrder').addEventListener('click', startVerseOrder);
      } else {
        el.innerHTML = '<div class="feedback good">Correct! ' + done + '/' + total + ' placed.</div>';
      }
    } else {
      blank.classList.add('wrong');
      setTimeout(() => blank.classList.remove('wrong'), 500);
      document.getElementById('fbStatus').innerHTML = '<div class="feedback bad">Not quite \u2014 try again!</div>';
    }
  }

  document.getElementById('btnFbBack').addEventListener('click', () => {
    state.view = 'intro';
    renderApp();
  });
}

function readMeaningSegment(seg) {
  if (seg.b) {
    return `
      <span class="rm-word key">
        <span class="rm-ar">${seg.b}</span>
        <span class="rm-en">${seg.m || ""}</span>
      </span>`;
  }
  const text = (seg.t || "").trim();
  if (!text) return "";
  return `
    <span class="rm-word">
      <span class="rm-ar">${text}</span>
      <span class="rm-en">&nbsp;</span>
    </span>`;
}

function renderReadMeaning() {
  const m = getModule();
  const fb = m.fillBlanks;
  if (!fb || !Array.isArray(fb.ayahs) || fb.ayahs.length === 0) {
    app.innerHTML = `
      <div class="card elevated">
        <div class="section-title"><h2>Read with Meaning</h2><div class="line"></div></div>
        <p class="muted">Read with Meaning is not available for this lesson yet.</p>
        <button class="ghost" id="btnRmBack">← Back to Intro</button>
      </div>
    `;
    document.getElementById("btnRmBack").addEventListener("click", () => {
      state.view = "intro";
      renderApp();
    });
    return;
  }

  const ayahsHtml = fb.ayahs.map(ayah => `
    <article class="rm-ayah">
      <div class="rm-num">${ayah.n}</div>
      <div class="rm-line">
        ${ayah.segments.map(readMeaningSegment).join("")}
      </div>
    </article>
  `).join("");

  app.innerHTML = `
    <div class="rm-header">
      <span>Read with Meaning · ${m.nameEnglish}</span>
      <button class="ghost" id="btnRmBack">← Back to Intro</button>
    </div>
    <div class="rm-list">${ayahsHtml}</div>
    <div class="actions-center">
      <button id="btnRmVocab">Vocabulary Cards →</button>
      <button class="secondary" id="btnRmBlanks">Meaning Blanks</button>
      <button class="ghost" id="btnRmQuiz">Skip to Quiz</button>
    </div>
  `;

  document.getElementById("btnRmBack").addEventListener("click", () => {
    state.view = "intro";
    renderApp();
  });
  document.getElementById("btnRmVocab").addEventListener("click", () => {
    state.vocabIndex = 0;
    state.view = "vocab";
    renderApp();
  });
  document.getElementById("btnRmBlanks").addEventListener("click", () => {
    state.view = "fillBlanks";
    renderApp();
  });
  document.getElementById("btnRmQuiz").addEventListener("click", startQuiz);
}


/* ---------- VERSE ORDER ---------- */
function renderOrderVerses(){
  const m=getModule();
  if(!m.verseOrder){state.view="intro";renderApp();return;}

  const verses=[...m.verseOrder].sort(()=>Math.random()-0.5);
  let dragIdx=null;

  function checkComplete(){
    const allOk=verses.every((v,i)=>v.id===i+1);
    if(!allOk)return;
    document.getElementById('ovStatus').innerHTML='<div class="feedback good">MashaAllah! Verses in correct order!</div>';
    document.querySelectorAll('.ov-card').forEach((c,i)=>{
      c.classList.add('correct');
      c.setAttribute('draggable','false');
      c.querySelector('.ov-handle').textContent=String(i+1);
    });
  }

  function reorder(fromIdx,toIdx){
    const moved=verses.splice(fromIdx,1)[0];
    verses.splice(toIdx,0,moved);
    const c=document.getElementById('ovSortable');
    const kids=[...c.children];
    if(fromIdx<toIdx)c.insertBefore(kids[fromIdx],kids[toIdx].nextSibling);
    else c.insertBefore(kids[fromIdx],kids[toIdx]);
    checkComplete();
  }

  function buildHTML(){
    return verses.map((v,i)=>`
      <div class="ov-card" data-idx="${i}" draggable="true">
        <span class="ov-handle">☰</span>
        <span class="ov-ayah">${v.text}</span>
      </div>`
    ).join('');
  }

  app.innerHTML=`
    <div class="ov-nav"><span>Order the Verses · ${m.nameEnglish}</span><button class="ghost" id="btnOvBack">← Back to Intro</button></div>
    <div class="card">
      <p class="muted" style="text-align:center;margin:0 0 20px;">Drag the verses to put them in the correct order</p>
      <div class="ov-sortable" id="ovSortable">${buildHTML()}</div>
    </div>
    <div class="ov-status" id="ovStatus"></div>
  `;

  const container=document.getElementById('ovSortable');

  container.addEventListener('dragstart',(e)=>{
    const card=e.target.closest('.ov-card');
    if(!card)return;
    dragIdx=[...container.children].indexOf(card);
    card.classList.add('dragging');
  });

  container.addEventListener('dragend',(e)=>{
    const card=e.target.closest('.ov-card');
    if(card)card.classList.remove('dragging');
    dragIdx=null;
  });

  container.addEventListener('dragover',(e)=>{
    e.preventDefault();
    const card=e.target.closest('.ov-card');
    if(card&&card!==container.querySelector('.dragging'))card.classList.add('over');
  });

  container.addEventListener('dragleave',(e)=>{
    const card=e.target.closest('.ov-card');
    if(card)card.classList.remove('over');
  });

  container.addEventListener('drop',(e)=>{
    e.preventDefault();
    const targetCard=e.target.closest('.ov-card');
    if(!targetCard||dragIdx===null)return;
    targetCard.classList.remove('over');
    const toIdx=[...container.children].indexOf(targetCard);
    if(dragIdx===toIdx)return;
    reorder(dragIdx,toIdx);
    dragIdx=null;
  });

  // Click-to-move fallback (mobile)
  let selectedIdx=null;
  container.addEventListener('click',(e)=>{
    const card=e.target.closest('.ov-card');
    if(!card||card.classList.contains('correct'))return;
    const idx=[...container.children].indexOf(card);
    if(selectedIdx===null||selectedIdx===idx){
      document.querySelectorAll('.ov-card.selected').forEach(c=>c.classList.remove('selected'));
      selectedIdx=null;
      if(!card.classList.contains('correct')){card.classList.add('selected');selectedIdx=idx;}
    }else{
      reorder(selectedIdx,idx);
      document.querySelectorAll('.ov-card.selected').forEach(c=>c.classList.remove('selected'));
      selectedIdx=null;
    }
  });

  document.getElementById('btnOvBack').addEventListener('click',()=>{state.view='intro';renderApp();});
}


/* ---------- MATCH VOCAB ---------- */

/* ---------- MEANING BANK (English text + English blanks + Arabic hints) ---------- */
function renderMeaningBank(){
  const m=getModule();
  if(!m.fillBlanksEn){state.view="intro";renderApp();return;}
  const fb=m.fillBlanksEn;
  const ayahsHtml=fb.ayahs.map((ayah,ai)=>{
    const segs=ayah.segments.map(seg=>{
      if(seg.t)return '<span class="fb-text">'+seg.t+'</span>';
      if(seg.b)return '<span class="fb-blank" data-word="'+seg.b+'" data-meaning="'+seg.m+'"><span class="fb-hint">'+seg.m+'</span></span>';
      return '';
    }).join('');
    return '<span class="fb-ayah">'+segs+'<span class="fb-num">'+(ai+1)+'</span></span>';
  }).join('');
  const allWords=[];
  fb.ayahs.forEach(a=>a.segments.forEach(s=>{if(s.b)allWords.push(s.b);}));
  const shuffled=[...allWords].sort(()=>Math.random()-.5);
  const bankHtml=shuffled.map((w,i)=>'<div class="fb-chip" draggable="true" data-word="'+w+'" data-idx="'+i+'">'+w+'</div>').join('');
  app.innerHTML='<div class="fb-nav"><span>Meaning Bank \u00B7 '+ m.nameEnglish +'</span><button class="ghost" id="btnMbBack">\u2190 Back to Intro</button></div><div class="fb-bank-label">Word Bank \u2014 drag or tap an English word, then tap the matching blank</div><div class="fb-bank" id="fbBank">'+bankHtml+'</div><div class="card fb-card"><div class="fb-surah" style="direction:ltr;text-align:left;">'+ayahsHtml+'</div></div><div class="fb-status" id="fbStatus"></div>';
  let selectedChip=null;
  document.querySelectorAll('.fb-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      if(chip.classList.contains('used'))return;
      document.querySelectorAll('.fb-chip.selected').forEach(c=>c.classList.remove('selected'));
      chip.classList.add('selected');selectedChip=chip;
    });
    chip.addEventListener('dragstart',(e)=>{e.dataTransfer.setData('text/plain',chip.getAttribute('data-word'));chip.classList.add('dragging');selectedChip=chip;});
    chip.addEventListener('dragend',()=>chip.classList.remove('dragging'));
  });
  document.querySelectorAll('.fb-blank').forEach(blank=>{
    blank.addEventListener('click',()=>{if(!selectedChip||blank.classList.contains('correct'))return;placeWord(selectedChip,blank);});
    blank.addEventListener('dragover',(e)=>{e.preventDefault();blank.classList.add('over');});
    blank.addEventListener('dragleave',()=>blank.classList.remove('over'));
    blank.addEventListener('drop',(e)=>{e.preventDefault();blank.classList.remove('over');if(blank.classList.contains('correct'))return;const word=e.dataTransfer.getData('text/plain');const chip=document.querySelector('.fb-chip[data-word="'+word+'"]:not(.used)');if(chip)placeWord(chip,blank);});
  });
  function placeWord(chip,blank){const cw=chip.getAttribute('data-word'),bw=blank.getAttribute('data-word');if(cw===bw){blank.classList.add('correct');blank.innerHTML='<span class="fb-placed">'+cw+'</span>';chip.classList.add('used');chip.classList.remove('selected');chip.setAttribute('draggable','false');selectedChip=null;const total=document.querySelectorAll('.fb-blank').length,done=document.querySelectorAll('.fb-blank.correct').length;const el=document.getElementById('fbStatus');if(done===total)el.innerHTML='<div class="feedback good"><b>MashaAllah!</b> You completed the English meaning bank!</div>';else el.innerHTML='<div class="feedback good">Correct! '+done+'/'+total+' placed.</div>';}else{blank.classList.add('wrong');setTimeout(()=>blank.classList.remove('wrong'),500);document.getElementById('fbStatus').innerHTML='<div class="feedback bad">Not quite \u2014 try again!</div>';}}
  document.getElementById('btnMbBack').addEventListener('click',()=>{state.view='intro';renderApp();});
}

export {
  ayahText,
  renderFillBlanks,
  renderMeaningBank,
  renderOrderVerses,
  renderReadMeaning,
};

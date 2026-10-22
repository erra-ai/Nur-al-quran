# Builder for Life Skills lesson HTML files (lesson4..12).
# Content dicts live in scratch/lessons_data.py. Run scratch/build_lessons.py.
import html as H
import json

TMPL_HEAD_SRC = "lesson3.html"   # provides the shared <head> (CSS)

JS_TMPL = """
<script>
(function(){
document.querySelectorAll('.checkpoint').forEach(cp=>{
  cp.querySelectorAll('.option').forEach(opt=>{
    opt.addEventListener('click',function(){
      const allOpts=cp.querySelectorAll('.option');
      const fb=cp.querySelector('.feedback');
      const isCorrect=this.dataset.correct==='true';
      allOpts.forEach(o=>{o.classList.remove('correct','wrong','show-correct');o.disabled=false;});
      if(isCorrect){
        this.classList.add('correct');fb.className='feedback show good';
        fb.textContent='\\u2705 '+this.dataset.feedback;allOpts.forEach(o=>o.disabled=true);
      }else{
        this.classList.add('wrong');
        allOpts.forEach(o=>{if(o.dataset.correct==='true')o.classList.add('show-correct');});
        fb.className='feedback show bad';
        fb.textContent='The correct answer is highlighted in green. Click it to continue.';
        const correctOpt=cp.querySelector('.option[data-correct=\\"true\\"]');
        allOpts.forEach(o=>{if(o.dataset.correct!=='true')o.disabled=true;});
        correctOpt.addEventListener('click',function retry(){
          allOpts.forEach(o=>{o.classList.remove('correct','wrong','show-correct');o.disabled=false;});
          this.classList.add('correct');fb.className='feedback show good';
          fb.textContent='\\u2705 '+this.dataset.feedback;allOpts.forEach(o=>o.disabled=true);
          correctOpt.removeEventListener('click',retry);
        });
      }
    });
  });
});
document.querySelectorAll('.scale-card').forEach(card=>{
  card.addEventListener('click',function(){
    const isOpen=this.classList.toggle('open');
    this.setAttribute('aria-expanded',isOpen?'true':'false');
  });
});
const steps=__STEPS__;
let shuffled=[],orderIdx=1;
const orderGrid=document.getElementById('orderGrid');
const orderFeedback=document.getElementById('orderFeedback');
const orderReset=document.getElementById('orderReset');
const orderComplete=document.getElementById('orderComplete');
function initOrder(){
  shuffled=[...steps].sort(()=>Math.random()-.5);
  orderIdx=1;
  orderComplete.style.display='none';
  orderReset.style.display='none';
  orderFeedback.textContent='';
  orderGrid.innerHTML=shuffled.map(s=>'<button class="order-card">'+s+'</button>').join('');
  orderGrid.querySelectorAll('.order-card').forEach(card=>{
    card.addEventListener('click',function(){
      if(this.classList.contains('placed'))return;
      const stepName=this.textContent;
      const correctPos=steps.indexOf(stepName);
      if(correctPos===orderIdx-1){
        this.classList.add('placed');
        this.innerHTML='<span class="oc-num">'+orderIdx+'</span> '+stepName;
        orderIdx++;
        if(orderIdx>steps.length){
          orderComplete.style.display='block';
          orderFeedback.textContent='';
          orderReset.style.display='inline-block';
        }else{
          orderFeedback.textContent='\\u2705 Step '+orderIdx+' of '+steps.length+' placed correctly.';
          orderFeedback.style.color='#065f46';
        }
      }else{
        orderFeedback.textContent=__WRONG__;
        orderFeedback.style.color='#991b1b';
      }
    });
  });
}
orderReset.addEventListener('click',initOrder);
initOrder();
})();
</script>
</body>
</html>
"""

def cp_html(cp):
    s = '<div class="checkpoint"><h4>'+cp["q"]+'</h4>'
    for o in cp["o"]:
        ok = "true" if o[1] else "false"
        s += '<button class="option" data-correct="%s" data-feedback="%s">%s</button>' % (ok, H.escape(o[2]), H.escape(o[0]))
    return s + '<div class="feedback"></div></div>'

def blocks_html(blocks):
    out = ""
    for b in blocks:
        if b["t"] == "box":
            out += '<div class="story-box">' + "".join("<p>%s</p>" % p for p in b["p"]) + "</div>"
        elif b["t"] in ("harmful", "wise"):
            out += '<div class="thought %s">%s</div>' % (b["t"], b["p"][0])
        elif b["t"] == "cp":
            out += cp_html(b["c"])
    return out

def head_for(title):
    raw = open(TMPL_HEAD_SRC, encoding="utf-8").read()
    head = raw[: raw.index('<div class="container">')]
    head = head.replace("Sadness and Grief · Strong Heart, Wise Mind",
                        title + " · Strong Heart, Wise Mind")
    return head

def build(L):
    head = head_for(L["title"])
    body = []
    body.append(
        '<header class="header">'
        '<div class="part">%s</div><h1>%s</h1><div class="rule">%s</div>'
        '<p class="subtitle">%s</p>'
        '<div class="meta">'
        '<div class="meta-card"><strong>Age</strong><span>10–13</span></div>'
        '<div class="meta-card"><strong>Time</strong><span>25–30 min</span></div>'
        '<div class="meta-card"><strong>SEL Skill</strong><span>%s</span></div>'
        '<div class="meta-card"><strong>Main Tool</strong><span>%s</span></div>'
        '</div></header>' % (L["part"], L["title"], L["rule"], L["subtitle"], L["sel"], L["tool"]))
    body.append('<article class="section %s" id="story"><h2>%s</h2>%s</article>'
                % (L["theme"], L["story_h"], blocks_html(L["story"])))
    b = '<article class="section gold" id="quran"><h2>2. Quran Anchor</h2>'
    for p in L["quran_pre"]: b += "<p>%s</p>" % p
    for qb in L["quran_boxes"]:
        b += ('<div class="quran-box"><p class="arabic">%s</p><p class="trans">&ldquo;%s&rdquo;</p>'
              '<p class="ref">%s</p></div>' % (qb["ar"], qb["en"], qb["ref"]))
    for p in L["quran_post"]: b += "<p>%s</p>" % p
    b += '<div class="balance-card"><p>%s</p></div></article>' % L["balance"]
    body.append(b)
    b = '<article class="section gold" id="prophetic"><h2>3. Prophetic Lens</h2>'
    for p in L["proph_intro"]: b += "<p>%s</p>" % p
    for hd in L["hadiths"]:
        b += ('<div class="hadith-box"><p class="hadith-arabic">%s</p><p class="hadith-en">%s</p>'
              '<p class="hadith-ref">%s</p></div>' % (hd["ar"], hd["en"], hd["ref"]))
    for p in L["proph_post"]: b += "<p>%s</p>" % p
    b += '<div class="grid-2">' + "".join(
        '<div class="card emerald" style="text-align:center;"><h4 style="color:var(--emerald);margin-top:0;">%s</h4><p style="margin:0;font-size:.9rem;">%s</p></div>' % (c["h"], c["p"])
        for c in L["grid2"]) + "</div>"
    b += '<p style="text-align:center;font-weight:600;color:#3a3333;">%s</p></article>' % L["proph_tail"]
    body.append(b)
    b = '<article class="section" id="difference"><h2>4. Understand the Difference</h2><div class="grid-3">'
    b += '<div class="signal-col"><h4 style="margin-top:0;font-size:.95rem;color:#0f766e;">Signal</h4><p style="margin:0;font-size:.88rem;font-weight:500;">%s</p></div>' % L["signal"]
    b += '<div class="thought-col"><h4 style="margin-top:0;font-size:.95rem;color:#9f1239;">Unhelpful Thought or Urge</h4><p style="margin:0;font-size:.88rem;font-weight:500;">%s</p></div>' % L["urge"]
    b += '<div class="choice-col"><h4 style="margin-top:0;font-size:.95rem;color:#065f46;">Wise Choice</h4><p style="margin:0;font-size:.88rem;font-weight:500;">%s</p></div></div>' % L["choice"]
    b += '<div class="warning"><p style="margin:0;color:#991b1b;"><strong>Do not teach:</strong> %s</p></div>' % L["warn"]
    if L.get("note"):
        b += '<div class="card" style="background:var(--cream);text-align:center;"><p style="font-size:.9rem;color:var(--ink-soft);margin:0;">%s</p></div>' % L["note"]
    b += "</article>"
    body.append(b)
    b = '<article class="section %s" id="skill"><h2>5. %s</h2><div class="skill-grid">' % (L["theme"], L["tool_h"])
    for i, sk in enumerate(L["skills"]):
        b += ('<div class="skill-card s%d"><div class="step-num">%d</div><h4>%s</h4>'
              '<div class="ar-step">%s</div><p style="font-size:.82rem;color:var(--ink-soft);text-align:left;line-height:1.6;margin:0;">%s</p></div>'
              % (i + 1, i + 1, sk["h"], sk["ar"], sk["p"]))
    b += "</div>"
    b += '<div class="rule-card"><p>%s</p></div>' % L["rule_card"]
    b += '<h3>%s</h3><p>Click each level to see the plan.</p><div class="scale-grid">' % L["scale_h"]
    for sc in L["scale"]:
        b += ('<button class="scale-card" aria-expanded="false"><div class="sc-level">%s</div>'
              '<div class="sc-name">%s</div><div class="sc-do">%s</div></button>' % (sc[0], sc[1], sc[2]))
    b += "</div></article>"
    body.append(b)
    body.append('<article class="section" id="transfer"><h2>%s</h2>%s</article>'
                % (L["transfer_h"], blocks_html(L["transfer"])))
    b = '<article class="section gold" id="challenge"><h2>7. %s</h2><div class="challenge-card"><h3>%s</h3><ol>' % (L["ch_h"], L["ch_intro"])
    for it in L["ch_items"]: b += "<li>%s</li>" % it
    b += '</ol><p style="margin-top:12px;font-weight:600;text-align:center;color:var(--emerald-dark);">%s</p></div>' % L["ch_mission"]
    b += '<div class="balance-card"><p>%s</p></div></article>' % L["ch_note"]
    body.append(b)
    b = '<article class="section" id="guide"><h2>8. Parent / Teacher Guide</h2><div class="grid-2">'
    b += '<div class="card" style="border-top:4px solid var(--rose);"><h4 style="color:#991b1b;margin-top:0;">Avoid saying</h4><ul style="padding-left:18px;color:var(--ink-soft);font-size:.9rem;line-height:1.8;">' + "".join("<li>%s</li>" % x for x in L["avoid"]) + "</ul></div>"
    b += '<div class="card" style="border-top:4px solid var(--emerald);"><h4 style="color:var(--emerald);margin-top:0;">Say instead</h4><ul style="padding-left:18px;color:var(--ink-soft);font-size:.9rem;line-height:1.8;">' + "".join("<li>%s</li>" % x for x in L["say"]) + "</ul></div></div>"
    b += ('<h3>Interactive Teach-Back: %s</h3><p>Click the steps in order.</p>'
          '<div class="order-grid" id="orderGrid"></div><p class="order-feedback" id="orderFeedback"></p>'
          '<button class="order-reset" id="orderReset" style="display:none;">🔄 Reset Order</button>'
          '<div class="order-complete" id="orderComplete">%s</div>' % (L["order_h"], L["order_done"]))
    b += '<div class="checkpoint" style="margin-top:24px;">' + cp_html(L["scenario"]).replace('<div class="checkpoint">', "").replace("</div><div class=\"feedback\"></div></div>", "") + "</div>" if False else cp_html(L["scenario"])
    b = b.replace('<div class="checkpoint">', '<div class="checkpoint" style="margin-top:24px;">', 1)
    b += '<div class="card" style="background:var(--cream);text-align:center;margin-top:16px;"><p style="font-size:.9rem;color:var(--ink-soft);margin:0;">%s</p></div></article>' % L["guide_note"]
    body.append(b)
    script = (JS_TMPL.replace("__STEPS__", json.dumps([s["step"] for s in L["skills"]]))
                    .replace("__WRONG__", json.dumps(L["order_wrong"])))
    doc = head + '<div class="container">\n' + "\n\n".join(body) + "\n</div>\n" + script
    fn = "lesson%d.html" % L["n"]
    open(fn, "w", encoding="utf-8").write(doc)
    return fn, len(doc)

# Restyle lesson1..12.html to the Nur al-Qur'an app design (Quran-chapter look):
# app palette (green/gold/cream), app fonts (Inter body, Cormorant headings),
# app background texture, app card borders. Inserted as an override style block,
# so it wins over the original lesson CSS without touching lesson content.
import glob, re

MARKER = "/* APP-RESTYLE */"

OVERRIDE = """
/* APP-RESTYLE */
:root{
  --cream:#fbf7ec; --cream-dark:#f3ead4;
  --emerald:#1f5132; --emerald-light:#eef4ee; --emerald-dark:#143824;
  --gold:#b08a3e; --gold-light:#f8f1e0; --gold-line:#d9b96b;
  --rose:#a83a3a; --rose-light:#f7eeee; --rose-line:#e0c8c0;
  --sky:#2e6b48; --sky-light:#eef4ef; --sky-line:#c8dccc;
  --ink:#2a2a26; --ink-soft:#4b5563; --ink-muted:#6b6b62;
  --shadow:0 8px 28px rgba(31,81,50,.10);
}
body{
  font-family:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;
  background:var(--cream);
  background-image:
    radial-gradient(1200px 600px at 10% -10%, rgba(176,138,62,.10), transparent 60%),
    radial-gradient(900px 500px at 100% 10%, rgba(31,81,50,.10), transparent 60%),
    repeating-linear-gradient(45deg, rgba(176,138,62,.025) 0 2px, transparent 2px 18px);
  background-attachment:fixed;
}
.header .part{color:var(--gold-deep, #8a6a2a);letter-spacing:.2em;}
.header h1{font-family:"Cormorant Garamond","Amiri",serif;font-weight:700;color:#143824;letter-spacing:0;}
.header .rule{background:#f8f1e0;color:#8a6a2a;border-color:var(--gold-line);}
.header .meta{max-width:760px;}
.header .meta-card{background:rgba(255,255,255,.92);border:1px solid #ede0c2;border-radius:12px;}
.header .meta-card strong{color:var(--gold);}
.header .subtitle{color:var(--ink-soft);}
.section{background:#fff;border:1px solid #ede0c2;border-radius:22px;}
.section h2{font-family:"Cormorant Garamond","Amiri",serif;color:#143824;font-weight:700;}
.section h2::after{background:var(--gold);}
.section.gold h2::after,.section.rose h2::after,.section.emerald h2::after{background:var(--gold);}
.section h3{color:#2a2a26;}
.section h4{color:var(--emerald);}
.quran-box{background:linear-gradient(180deg,#fffdf8,#f8f1e0);border-color:rgba(176,138,62,.42);border-radius:22px;}
.quran-box .arabic{font-family:"Scheherazade New","Amiri",serif;color:#143824;text-shadow:0 1px 0 #fff;}
.quran-box .trans{color:#5c5454;}
.quran-box .ref{color:#8a6a2a;}
.hadith-box{background:#fffdf6;border-color:#e6d5ae;border-radius:22px;}
.hadith-box .hadith-arabic{font-family:"Scheherazade New","Amiri",serif;color:#143824;}
.hadith-box .hadith-en{color:#5c5454;}
.hadith-box .hadith-ref{color:#8a6a2a;}
.story-box{background:#fbf7ec;border-color:#ede0c2;}
.checkpoint{background:#fbf7ec;border-color:#ede0c2;}
.option{border-color:#ede0c2;}
.option:hover{border-color:var(--gold);background:#f8f1e0;}
.option.correct,.option.show-correct{border-color:#2e7d4f!important;background:#eef6ee!important;color:#143824;}
.option.wrong{border-color:#a83a3a!important;background:#f7eeee!important;color:#7a2626;}
.feedback.good{background:#eef6ee;border-left-color:#2e7d4f;color:#1f5132;}
.feedback.bad{background:#f7eeee;border-left-color:#a83a3a;color:#7a2626;}
.thought.harmful{border-color:#a83a3a;background:#f7eeee;color:#7a2626;}
.thought.wise{border-color:#1f5132;background:#eef6ee;color:#143824;}
.signal-col{background:#eef4ee;border-color:#c8dccc;}
.signal-col h4{color:#1f5132!important;}
.thought-col h4{color:#7a2626!important;}
.card.emerald{border-left-color:var(--emerald);}
.card.sky{border-left-color:var(--emerald-soft,#2e6b48)!important;}
.card h4,.card .h4{color:#143824;}
.balance-card{background:#f8f1e0;border-color:var(--gold-line);}
.balance-card p{color:#8a6a2a;}
.rule-card{background:linear-gradient(135deg,#f8f1e0,#f0e2bc);border-color:var(--gold-line);}
.rule-card p{color:#5c3d1a;}
.warning{background:#f7eeee;border-left-color:#a83a3a;}
.warning p{color:#7a2626!important;}
.challenge-card{background:#eef4ee;border-color:#c8dccc;}
.challenge-card h3{color:#143824;}
.skill-card{border-color:#ede0c2;}
.skill-card:hover{border-color:var(--gold);}
.skill-card.s1 .step-num{background:#8a6a2a;}
.skill-card.s2 .step-num{background:#b08a3e;}
.skill-card.s3 .step-num{background:#1f5132;}
.skill-card.s4 .step-num{background:#143824;}
.skill-card .ar-step{font-family:"Scheherazade New","Amiri",serif;color:#143824;}
.scale-card{border-color:#ede0c2;background:#fff;}
.scale-card:hover{border-color:var(--gold);}
.scale-card.open{border-color:var(--gold);background:#f8f1e0;}
.scale-card .sc-level{color:#8a6a2a;}
.order-card{border-color:#ede0c2;background:#fff;}
.order-card:hover{border-color:var(--gold);background:#f8f1e0;}
.order-card.placed{border-color:#2e7d4f!important;background:#eef6ee!important;}
.order-card.placed .oc-num{background:#2e7d4f;}
.order-complete{background:#eef4ee;color:#143824;}
.order-reset{background:#f3ead4;}
.order-reset:hover{background:#ede0c2;}
button:focus-visible,.option:focus-visible,.order-card:focus-visible,.scale-card:focus-visible{outline:3px solid var(--gold);}
.header .meta-card strong{color:#8a6a2a;}
.grid-2 .card h4,.grid-2 .card strong{color:#143824;}
@media print{body{background:#fff;}}
"""

FONT_OLD = re.compile(r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">')
FONT_NEW = ('<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400'
            '&family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700;800'
            '&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">')

changed = []
for f in sorted(glob.glob("lesson*.html"), key=lambda p: int(re.search(r"(\d+)", p).group(1))):
    raw = open(f, encoding="utf-8").read()
    if MARKER in raw:
        changed.append((f, "skipped (already restyled)")); continue
    raw2 = FONT_OLD.sub(FONT_NEW, raw, count=1)
    idx = raw2.rindex("</style>")
    raw2 = raw2[:idx] + OVERRIDE + "\n" + raw2[idx:]
    open(f, "w", encoding="utf-8").write(raw2)
    changed.append((f, "restyled"))

for c in changed: print(c)

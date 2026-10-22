import re
pat = re.compile(r'const steps=\[.*?\]')
ok_all = True
for n in range(4, 13):
    raw = open("lesson%d.html" % n, encoding="utf-8").read()
    m = pat.search(raw)
    counts = dict(
        sections=raw.count('<article class="section'),
        cp=raw.count('class="checkpoint"'),
        qb=raw.count('class="quran-box"'),
        hb=raw.count('class="hadith-box"'),
        sc=raw.count('class="scale-card"'),
        sk=raw.count('skill-card s'),
        oc=raw.count('class="order-card"'),
    )
    leaks = [b for b in ("__STEPS__", "__WRONG__", "dict(", "None,", "],",  ")") if False]
    for bad in ("__STEPS__", "__WRONG__", "dict(", "t2="):
        if bad in raw:
            counts.setdefault("LEAK", []).append(bad)
    steps = m.group(0)[:70] if m else "MISSING"
    bad_struct = counts["sections"] != 8 or counts["cp"] < 4 or counts["sc"] != 4 or counts["sk"] != 4
    ok_all = ok_all and not bad_struct
    print("lesson%-2d %s %s" % (n, "OK " if not bad_struct else "BAD", counts))
    print("       ", steps)
print("\nALL STRUCTURES OK" if ok_all else "\nSOME FILES BAD")

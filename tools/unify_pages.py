"""Bring the three sales pages (EN + HE) in line with the home page: gold palette, the same header
(MWP logo, Help, My downloads and cart icons, language toggle) and the same RAW / FINAL wording on
the comparison sliders. Page content and layout stay as Matan designed them. Safe to run again."""
import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from brand import gold

PAGES = {
    "presets/index.html": "en", "presets/he.html": "he",
    "panel/index.html": "en", "panel/he.html": "he",
    "field-guides/index.html": "en", "field-guides/he.html": "he",
}
HELP = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/></svg>'
DL = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
CART = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>'

def navr(lang, btn=""):
    he = lang == "he"
    t = (lambda e, h: h if he else e)
    toggle = ('<div class="lang-toggle" role="group" aria-label="שפה"><a href="./" hreflang="en" lang="en">EN</a><span class="on" aria-current="true" lang="he">עב</span></div>'
              if he else
              '<div class="lang-toggle" role="group" aria-label="Language"><span class="on" aria-current="true">EN</span><a href="he.html" hreflang="he" lang="he">עב</a></div>')
    return (f'<div class="navr">'
            f'<div class="nav-icons">'
            f'<a class="nav-ico" href="../support.html" aria-label="{t("Help", "עזרה")}">{HELP}<span class="tip">{t("Help", "עזרה")}</span></a>'
            f'<a class="nav-ico" href="../account.html" aria-label="{t("My downloads", "ההורדות שלי")}">{DL}<span class="tip">{t("My downloads", "ההורדות שלי")}</span></a>'
            f'<button class="nav-ico" type="button" data-cart aria-label="{t("Cart", "עגלה")}" aria-haspopup="dialog">{CART}<span class="count" hidden>0</span><span class="tip">{t("Cart", "עגלה")}</span></button>'
            f'</div>{toggle}{btn}</div>')

# Same header look as the home page. "html " prefix so it wins over the page styles the runtime moves into <head>.
CSS = """<style id="mwp-unify">
html .nav .wrap{justify-content:flex-start;height:72px}
html .nav .links{margin-inline:auto}
html .navr{display:flex;align-items:center;gap:10px;margin-inline-start:auto}
html .navr .nav-icons{gap:2px;margin-inline-end:4px}
html .nav .links + .navr{margin-inline-start:0}
html .navr .btn.sm{white-space:nowrap}
html .ba{direction:ltr}
html .nav .links{gap:26px}
html .nav .links a{white-space:nowrap;font-size:14px;font-weight:500;color:#CDD7DD;letter-spacing:.01em}
html .nav .links a:hover{color:#FEFBF1}
html .navr .btn.sm{min-height:40px;padding:0 18px;font-size:14px}
@media (max-width:1280px){html .nav .links a{font-size:13px}html .nav .links{gap:18px}}
@media (max-width:600px){html .navr .btn.sm{display:none}html .navr{gap:8px}}
html .brand span{display:inline}
html .navr a.nl{color:#CDD7DD;text-decoration:none;font-weight:600;font-size:15px}
html .navr a.nl:hover{color:#FEFBF1}
html .lang-toggle{display:inline-flex;align-items:center;flex:none;height:32px;padding:3px;border-radius:64px;border:1px solid rgba(156,177,194,.35);direction:ltr}
html .lang-toggle span,html .lang-toggle a{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:26px;padding:0 10px;border-radius:64px;font:600 12px/1 Montserrat,Heebo,sans-serif;letter-spacing:.06em;color:#9CB1C2;text-decoration:none}
html .lang-toggle a:hover{color:#FEFBF1}
html .lang-toggle .on{background:#FEFBF1;color:#0A0908}
@media (max-width:600px){html .nav .wrap{height:60px}html .navr a.nl.hide-sm{display:none}html .brand span{display:none}}
</style>"""

SCRIPT = """<script type="module">
import { initCart } from "../assets/js/lib/cart.js";
const go = () => initCart();
document.readyState === "complete" ? go() : addEventListener("load", go);
</script>"""

WORDS = {
    "en": [(">BEFORE<", ">RAW<"), (">AFTER · MWP PRESET<", ">FINAL · MWP PRESET<"), (">AFTER<", ">FINAL · MWP PANEL<"),
           (">Before and after<", ">From RAW to final<"), (">See before and after<", ">Compare RAW and final<"), (">See before and after →<", ">Compare RAW and final →<"), ("'BEFORE'", "'RAW'"), ("'AFTER'", "'FINAL · MWP PANEL'"), ("'AFTER · MWP PRESET'", "'FINAL · MWP PRESET'")],
    "he": [(">לפני<", ">RAW<"), (">אחרי · פריסט MWP<", ">סופי · פריסט MWP<"), (">אחרי<", ">סופי · MWP Panel<"),
           (">לפני ואחרי<", ">מ-RAW לתמונה הסופית<"), (">לראות לפני ואחרי ←<", ">מ-RAW לתמונה הסופית ←<")],
}

for path, lang in PAGES.items():
    s = open(path, encoding="utf-8").read()
    s = gold(s)
    # header: home-page brand (logo + MWP, links home), Help + icons + language toggle
    s = re.sub(r'<a class="brand" href="[^"]*"[^>]*><img src="[^"]+" alt="[^"]*"><span>[^<]*</span></a>',
               r'<a class="brand" href="../" aria-label="MWP, home"><img src="../assets/pages/img/2dd3356528167ddf9a64c0c7301c8aa3.png" alt=""><span>MWP</span></a>', s, count=1)
    s = re.sub(r'<div class="navr">.*?</a></div>(?=\s*</div>\s*</nav>)', lambda m: navr(lang, (re.search(r'<a class="btn sm"[^>]*>.*?</a>', m.group(0)) or [''])[0]), s, count=1, flags=re.S)
    for a, b in WORDS[lang]:
        s = s.replace(a, b)
    if 'id="mwp-unify"' not in s:
        s = s.replace("</head>", CSS + "\n</head>", 1)
    if "initCart" not in s:
        s = s.replace("</body>", SCRIPT + "\n</body>", 1)
    open(path, "w", encoding="utf-8").write(s)
    print("unified", path)

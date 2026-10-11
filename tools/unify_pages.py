"""Bring the three sales pages (EN + HE) in line with the home page: gold palette, the same header
(MWP logo, Help, My downloads and cart icons, language toggle) and the same RAW / FINAL wording on
the comparison sliders. Page content and layout stay as Matan designed them. Safe to run again."""
import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from brand import gold, NAV_CSS

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
html .ba{direction:ltr}
""" + NAV_CSS + """</style>"""

SCRIPT = """<script src="../assets/js/lib/nav.js" defer></script>
<script type="module">
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

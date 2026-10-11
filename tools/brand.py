"""Shared brand values. mw.photography's gold (--gold #F4AF56, --goldsoft #E4AA7C) replaces the designs' orange everywhere."""
GOLD = [
    ("linear-gradient(90deg,#C4471C 0%,#E8832F 45%,#FFD08A 100%)", "linear-gradient(90deg,#E4AA7C 0%,#F4AF56 55%,#F8D29C 100%)"),
    ("linear-gradient(90deg,#D9581F,#F2A541)", "linear-gradient(90deg,#E4AA7C,#F4AF56)"),
    ("linear-gradient(90deg,#DA5A22,#F2A541)", "linear-gradient(90deg,#E4AA7C,#F4AF56)"),
    ("#F2A541", "#F4AF56"), ("#FFD08A", "#F8D29C"), ("#E8832F", "#F4AF56"), ("#D9581F", "#E4AA7C"), ("#C4471C", "#E4AA7C"), ("#DA5A22", "#E4AA7C"),
    ("rgba(242,165,65,", "rgba(244,175,86,"), ("rgba(232,131,47,", "rgba(244,175,86,"),
]

def gold(html):
    for a, b in GOLD:
        html = html.replace(a, b)
    return html

# Premium header, shared by the home page and the sales pages (selectors start with "html" so they win
# over each page's own styles). Transparent at the top, frosted glass once you scroll, quiet links with a
# gold underline, a hairline before the language switch, compact gold call to action.
NAV_CSS = """
html .nav{position:sticky;top:0;z-index:40;background:rgba(10,9,8,0);border-bottom:1px solid rgba(254,251,241,0);backdrop-filter:none;-webkit-backdrop-filter:none;transition:background .35s ease,border-color .35s ease,backdrop-filter .35s ease}
html.nav-scrolled .nav{background:rgba(10,9,8,.66);border-bottom-color:rgba(254,251,241,.08);backdrop-filter:saturate(160%) blur(18px);-webkit-backdrop-filter:saturate(160%) blur(18px)}
html .nav .wrap{display:flex;align-items:center;justify-content:flex-start;gap:28px;height:80px;transition:height .35s ease}
html.nav-scrolled .nav .wrap{height:64px}
html .nav .brand{display:flex;align-items:center;gap:12px;color:#FEFBF1;text-decoration:none;direction:ltr;flex:none}
html .nav .brand img{width:30px;height:30px;object-fit:contain;opacity:.95}
html .nav .brand span{display:inline;font:700 12px/1 Montserrat,Heebo,sans-serif;letter-spacing:.34em}
html .nav .links{display:flex;align-items:center;gap:34px;margin-inline:auto}
html .nav .links a{position:relative;padding:8px 0;color:rgba(254,251,241,.66);text-decoration:none;white-space:nowrap;font:500 13px/1 Montserrat,Heebo,sans-serif;letter-spacing:.06em;transition:color .25s ease}
html .nav .links a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);transform:scaleX(0);transform-origin:center;transition:transform .35s cubic-bezier(.2,.7,.2,1)}
html .nav .links a:hover,html .nav .links a.is-active{color:#FEFBF1}
html .nav .links a:hover::after,html .nav .links a.is-active::after{transform:scaleX(1)}
html .nav .navr{display:flex;align-items:center;gap:6px;margin-inline-start:0;flex:none}
html .nav .navr .nl{display:none}
html .nav .nav-icons{display:flex;align-items:center;gap:0}
html .nav .nav-ico{width:40px;height:40px;color:rgba(254,251,241,.78);transition:color .2s ease,background .2s ease}
html .nav .nav-ico:hover{color:#F4AF56;background:rgba(254,251,241,.05)}
html .nav .nav-ico svg{width:20px;height:20px;stroke-width:1.6}
html .nav .lang-toggle{display:inline-flex;align-items:center;gap:2px;height:28px;margin-inline-start:6px;padding:0 0 0 14px;border:0;border-left:1px solid rgba(254,251,241,.14);border-radius:0;background:none;direction:ltr}
html .nav .lang-toggle span,html .nav .lang-toggle a,html .nav .lang-toggle button{display:inline-flex;align-items:center;justify-content:center;min-width:0;height:28px;padding:0 7px;border:0;border-radius:0;background:none;font:600 12px/1 Montserrat,Heebo,sans-serif;letter-spacing:.12em;color:rgba(254,251,241,.42);text-decoration:none;cursor:pointer;transition:color .2s ease}
html[lang=he] .nav .lang-toggle{border-left:0;border-right:1px solid rgba(254,251,241,.14);padding:0 14px 0 0}
html .nav .lang-toggle a:hover,html .nav .lang-toggle button:hover{color:#FEFBF1}
html .nav .lang-toggle .on{color:#FEFBF1;background:none;cursor:default}
html .nav .navr .btn.sm{display:inline-flex;align-items:center;min-height:38px;margin-inline-start:14px;padding:0 20px;border-radius:999px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);color:#0A0908;font:700 13px/1 Montserrat,Heebo,sans-serif;letter-spacing:.02em;white-space:nowrap;box-shadow:0 6px 20px rgba(244,175,86,.18);transition:transform .25s ease,box-shadow .25s ease,filter .25s ease}
html .nav .navr .btn.sm:hover{transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 10px 28px rgba(244,175,86,.28)}
@media (max-width:1280px){html .nav .links{gap:24px}html .nav .links a{font-size:12px}}
html .nav .links + .navr{margin-inline-start:0}
@media (max-width:1100px){html .nav .links{display:none}html .nav .navr,html .nav .links + .navr{margin-inline-start:auto}}
@media (max-width:600px){html .nav .wrap{height:64px;gap:10px}html.nav-scrolled .nav .wrap{height:58px}html .nav .brand span{display:none}html .nav .navr .btn.sm{display:none}html .nav .nav-ico{width:38px;height:38px}html .nav .lang-toggle{padding-left:10px;margin-inline-start:2px}html[lang=he] .nav .lang-toggle{padding:0 10px 0 0}}
"""

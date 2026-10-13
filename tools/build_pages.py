"""Generates the MWP's static pages with one shared head, header and footer."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from brand import FONTS
ROOT = sys.argv[1]
SITE = "https://shop.mw.photography"

ICON = {
 "download": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
 "lock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 "refresh": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/></svg>',
 "chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 18l-1 3 4-2h8a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6a4 4 0 0 0 1 3z"/></svg>',
 "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
 "user": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
}

def head(title, desc, path, extra=""):
    return f"""<!doctype html>
<html lang="en" dir="ltr" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#0A0908">
  <link rel="canonical" href="{SITE}/{path}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="MWP">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@200..800&display=swap">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/styles.css">{extra}
{FONTS}
</head>"""

HEADER = f"""<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="announce">
  <div class="container">
    <span>{ICON['download']}Instant download after payment</span>
    <span>{ICON['lock']}Secure card checkout</span>
    <span>{ICON['refresh']}Free updates to everything you buy</span>
  </div>
</div>
<header class="site-header">
  <div class="container">
    <a class="brand" href="index.html" aria-label="MWP, home">MWP</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu"><span></span><span></span></button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <div class="nav__links">
        <a href="shop.html">All products</a>
        <a href="presets/">Presets</a>
        <a href="panel/">Plugin</a>
        <a href="field-guides/">Guides &amp; PDFs</a>
      </div>
      <div class="nav__end">
      </div>
    </nav>
  </div>
</header>"""

FOOTER = f"""<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <div class="stack">
        <a class="brand" href="index.html">MWP</a>
        <p class="muted" style="max-width:34ch">Editing tools and guides from wildlife photographer Matan Wild.</p>
      </div>
      <div>
        <h3>Shop</h3>
        <ul role="list">
          <li><a href="shop.html">All products</a></li>
          <li><a href="presets/">Presets</a></li>
          <li><a href="panel/">Plugin</a></li>
          <li><a href="field-guides/">Guides &amp; PDFs</a></li>
          <li><a href="shop.html?cat=bundle">Bundles</a></li>
        </ul>
      </div>
      <div>
        <h3>Help</h3>
        <ul role="list">
          <li><a href="account.html">My downloads</a></li>
          <li><a href="support.html">Contact support</a></li>
          <li><a href="index.html#faq">Questions</a></li>
          <li><a href="legal.html#refunds">Refunds</a></li>
          <li><a href="legal.html#licence">Licence</a></li>
        </ul>
      </div>
      <div>
        <h3>MWP</h3>
        <ul role="list">
          <li><a href="https://mw.photography" rel="noopener">Matan Wild</a></li>
          <li><a href="https://mw-phototours.com" rel="noopener">MW Photo Tours</a></li>
          <li><a href="https://www.instagram.com/mw_phototours" rel="noopener">Instagram</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p class="meta">© <span data-year>2026</span> Matan Wild Photography</p>
      <p class="meta pay-note">{ICON['lock']}Payments processed securely by Lemon Squeezy · <a href="legal.html#terms">Terms</a> · <a href="legal.html#privacy">Privacy</a></p>
    </div>
  </div>
</footer>"""

def ver(script):
    """Short fingerprint of a page script, so browsers fetch the new one after every change."""
    import hashlib
    h = hashlib.sha1()
    for f in [os.path.join(ROOT, "assets/js/pages", script)] + sorted(
            os.path.join(ROOT, "assets/js/lib", n) for n in os.listdir(os.path.join(ROOT, "assets/js/lib"))):
        h.update(open(f, "rb").read())
    return h.hexdigest()[:8]

def page(name, title, desc, body, script, extra_head=""):
    if name == "index.html":
        return  # the home page is hand-built in the sales-page look (index.html)
    html = f"""{head(title, desc, name if name != 'index.html' else '', extra_head)}
{HEADER}
<main id="main">
{body}
</main>
{FOOTER}
<script type="module" src="assets/js/pages/{script}?v={ver(script)}"></script>
</body>
</html>
"""
    open(os.path.join(ROOT, name), "w").write(html)

SAMPLER_FORM = """<form class="stack" id="sampler-form" data-source="free-sampler" novalidate>
            <label class="visually-hidden" for="sampler-email">Email address</label>
            <div class="inline-form">
              <input class="input" id="sampler-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
              <button class="btn" type="submit">Send me the presets</button>
            </div>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <label class="check"><input type="checkbox" name="consent" value="1"> Email me the free presets and occasional news. Unsubscribe anytime.</label>
            <p class="form-status" role="status"></p>
          </form>"""

page("index.html",
 "MWP · Presets, guides and tools by Matan Wild",
 "Lightroom presets, a Photoshop plugin and editing guides from wildlife photographer Matan Wild. Instant download, secure checkout.",
 f"""  <section class="hero-shop" aria-labelledby="hero-title">
    <div class="container hero-shop__inner">
      <div>
        <h1 class="display" id="hero-title">Editing tools from the field.</h1>
        <p class="lead">Presets, guides and an editing plugin made by wildlife photographer Matan Wild, for photographers who edit what they shoot outdoors.</p>
      </div>
      <div class="hero-shop__aside">
        <form class="search" id="hero-search" role="search">
          {ICON['search']}
          <label class="visually-hidden" for="hero-q">Search the shop</label>
          <input id="hero-q" name="q" type="search" placeholder="Search presets, guides and more" autocomplete="off">
          <button class="btn btn--sm btn--dark" type="submit">Search</button>
        </form>
        <div class="quick-cats" aria-label="Popular searches">
          <a class="chip" href="shop.html?q=snow">Snow</a>
          <a class="chip" href="shop.html?q=forest">Forest light</a>
          <a class="chip" href="shop.html?q=birds">Birds</a>
          <a class="chip" href="shop.html?q=safari">Safari</a>
          <a class="chip" href="shop.html?q=black%20and%20white">Black and white</a>
        </div>
      </div>
    </div>
  </section>

  <section aria-labelledby="shelf-title">
    <div class="container">
      <h2 class="visually-hidden" id="shelf-title">Shop by category</h2>
      <div class="shelf" id="shelf"></div>
    </div>
  </section>

  <section class="section" aria-labelledby="featured-title">
    <div class="container">
      <div class="section-head">
        <div><h2 class="h2" id="featured-title">New and featured</h2></div>
        <a class="btn btn--ghost btn--sm" href="shop.html">View all products</a>
      </div>
      <div class="grid grid--3" id="featured-grid" aria-live="polite"></div>
    </div>
  </section>

  <section aria-label="Why buy here">
    <div class="container">
      <div class="trust">
        <div class="trust__item">{ICON['download']}<p><b>Instant download</b><span>Your files are ready the moment you pay.</span></p></div>
        <div class="trust__item">{ICON['lock']}<p><b>Secure checkout</b><span>Card payment through Lemon Squeezy. We never see your card.</span></p></div>
        <div class="trust__item">{ICON['refresh']}<p><b>Free updates</b><span>New versions land in your downloads at no cost.</span></p></div>
        <div class="trust__item">{ICON['chat']}<p><b>Real support</b><span>A person replies within one business day.</span></p></div>
      </div>
    </div>
  </section>

  <section class="section" id="how" aria-labelledby="how-title">
    <div class="container">
      <div class="section-head"><div><h2 class="h2" id="how-title">How buying works</h2></div></div>
      <ol class="steps">
        <li class="step"><span class="step__num">1</span><p class="step__title">Choose</p><p class="muted">Pick a product and check what it works with.</p></li>
        <li class="step"><span class="step__num">2</span><p class="step__title">Pay</p><p class="muted">Card checkout opens on this page. A receipt arrives by email.</p></li>
        <li class="step"><span class="step__num">3</span><p class="step__title">Download</p><p class="muted">Sign in with the link we email you and download any time.</p></li>
        <li class="step"><span class="step__num">4</span><p class="step__title">Install</p><p class="muted">Every download includes a short install guide.</p></li>
      </ol>
    </div>
  </section>

  <section id="sampler" aria-labelledby="sampler-title">
    <div class="container">
      <div class="sampler">
        <div class="stack">
          <h2 class="h2" id="sampler-title">Try two presets free</h2>
          <p class="lead">See how they work on your own photos before you buy. They arrive by email in a minute.</p>
        </div>
        {SAMPLER_FORM}
      </div>
    </div>
  </section>

  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="container container--text">
      <h2 class="h2" id="faq-title" style="margin-bottom:var(--s-5)">Questions</h2>
      <div class="faq">
        <details><summary>Which programs do the products work with?</summary><div>Every product page lists what it works with under "Works with". Presets work in Lightroom Classic, Lightroom and Photoshop's Camera Raw; the plugin and the guides state their own requirements.</div></details>
        <details><summary>How do I get my files after paying?</summary><div>You get an email straight away. Open <a class="link" href="account.html">My downloads</a>, enter the email you paid with, and click the sign-in link we send. Everything you bought is there.</div></details>
        <details><summary>Can I download again later?</summary><div>Yes. Sign in to My downloads any time, including for future updates to products you own.</div></details>
        <details><summary>Do I need an account?</summary><div>No password to create. Your purchases are tied to your email, and you sign in with a one-time link.</div></details>
        <details><summary>What if something doesn't work for me?</summary><div>Write to <a class="link" href="support.html">support</a> and we'll help. Our <a class="link" href="legal.html#refunds">refund policy</a> has the details.</div></details>
      </div>
    </div>
  </section>""", "home.js")

page("shop.html", "All products · MWP",
 "Lightroom presets, a Photoshop plugin, guides and bundles from wildlife photographer Matan Wild.",
 f"""  <section class="page-hero" style="padding-bottom:var(--s-4)">
    <div class="container">
      <h1 class="display" id="shop-title">All products</h1>
    </div>
  </section>
  <section class="section--tight" aria-labelledby="shop-title">
    <div class="container">
      <div class="shop-toolbar">
        <div class="quick-cats" id="shop-cats" role="group" aria-label="Category"></div>
        <div class="shop-toolbar__end">
          <form class="search" id="shop-search" role="search">
            {ICON['search']}
            <label class="visually-hidden" for="shop-q">Search products</label>
            <input id="shop-q" type="search" placeholder="Search" autocomplete="off">
          </form>
          <label class="visually-hidden" for="shop-sort">Sort by</label>
          <select class="select-inline" id="shop-sort">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
      <p class="result-count" id="shop-count" aria-live="polite" style="margin-bottom:var(--s-4)"></p>
      <div class="grid grid--3" id="shop-grid"></div>
    </div>
  </section>""", "shop.js")

page("product.html", "MWP",
 "A digital product by Matan Wild for Lightroom and Photoshop.",
 """  <div class="container"><nav class="crumbs" id="crumbs" aria-label="Breadcrumb"><a href="shop.html">Shop</a></nav></div>
  <section class="section--tight" style="padding-top:var(--s-5)">
    <div class="container" id="product-root" aria-live="polite">
      <div class="product-layout" aria-hidden="true">
        <div class="skeleton" style="aspect-ratio:3/2"></div>
        <div class="skeleton" style="height:420px"></div>
      </div>
    </div>
  </section>""", "product.js")

ACCOUNT_CSS = """
<style id="acct">
.acct-hero{position:relative;overflow:hidden;padding:clamp(90px,12vw,150px) 0 clamp(70px,8vw,110px)}
.acct-hero .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5;transform:scale(1.05);animation:acbg 2.4s cubic-bezier(.2,.7,.1,1) both}
@keyframes acbg{to{transform:none}}
.acct-hero .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,9,8,.55),rgba(10,9,8,.7) 50%,#0A0908)}
.acct-hero .container{position:relative}
.acct-kick{margin:0;font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#9CB1C2}
.acct-h1{margin:16px 0 0;font-size:clamp(48px,7vw,104px);line-height:.98;font-weight:400;letter-spacing:-.04em}
.grad{background:linear-gradient(90deg,#E4AA7C 0%,#F4AF56 55%,#F8D29C 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:600}
.acct-lead{margin:20px 0 0;max-width:520px;font-size:18px;line-height:1.6;color:#CDD7DD}
.acct{padding-bottom:110px}
.glass{position:relative;border-radius:24px;background:linear-gradient(180deg,rgba(254,251,241,.06),rgba(254,251,241,.015));border:1px solid rgba(254,251,241,.1);box-shadow:0 50px 100px -50px rgba(0,0,0,.9),inset 0 1px 0 rgba(254,251,241,.07)}
.glass::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:linear-gradient(90deg,transparent,rgba(244,175,86,.55),transparent)}
#signed-out.glass{padding:40px;max-width:560px}
.auth{display:flex;flex-direction:column;gap:22px}
.auth-tabs{display:grid;grid-template-columns:1fr 1fr;padding:5px;border-radius:64px;background:rgba(10,9,8,.5);border:1px solid rgba(254,251,241,.1)}
.auth-tabs button{min-height:44px;border:0;border-radius:64px;background:none;color:#9CB1C2;font:inherit;font-weight:700;font-size:15px;cursor:pointer;transition:background .3s,color .3s}
.auth-tabs button[aria-selected=true]{background:linear-gradient(90deg,#E4AA7C,#F4AF56);color:#0A0908;box-shadow:0 10px 26px -12px rgba(244,175,86,.7)}
.auth-view{display:flex;flex-direction:column;gap:16px;animation:authin .45s cubic-bezier(.16,1,.3,1) both}
@keyframes authin{from{opacity:0;transform:translateY(8px)}}
.auth-view .btn{width:100%}
.pw{position:relative}
.pw .input{padding-inline-end:52px}
.pw-eye{position:absolute;top:50%;inset-inline-end:8px;transform:translateY(-50%);display:grid;place-items:center;width:38px;height:38px;border:0;border-radius:50%;background:none;color:#9CB1C2;cursor:pointer}
.pw-eye:hover,.pw-eye[aria-pressed=true]{color:#F4AF56;background:rgba(254,251,241,.06)}
.auth-row{display:flex;justify-content:flex-end;margin-top:-6px}
.auth-link{align-self:center;border:0;background:none;padding:4px 0;color:#F4AF56;font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(244,175,86,.4);text-underline-offset:3px}
.auth-link:hover{text-decoration-color:#F4AF56}
.auth-or{display:flex;align-items:center;gap:14px;color:#7E8A93;font-size:13px}
.auth-or::before,.auth-or::after{content:"";flex:1;height:1px;background:rgba(254,251,241,.1)}
.auth-note,.auth-why{margin:0;padding:14px 16px;border-radius:14px;background:rgba(244,175,86,.07);border:1px solid rgba(244,175,86,.25);color:#E9DCC6;font-size:14.5px;line-height:1.55}
.auth-hint{margin:-8px 0 0;font-size:13px;color:#7E8A93}
.auth-sent{align-items:center;text-align:center;padding:10px 0}
.auth-sent .seal{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;color:#F4AF56;background:rgba(244,175,86,.1);box-shadow:inset 0 0 0 1px rgba(244,175,86,.35)}
.btn--ghost.auth-alt{background:rgba(10,9,8,.25);border:1px solid rgba(254,251,241,.32);color:#FEFBF1;box-shadow:none}
.who{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 22px}
.who-l{display:flex;align-items:center;gap:14px;min-width:0}
.avatar{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#E4AA7C,#F4AF56);color:#0A0908;font-weight:700;font-size:18px;text-transform:uppercase}
.who p{margin:0;font-size:13px;color:#9CB1C2}.who b{display:block;font-size:16px;color:#FEFBF1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.library{display:flex;flex-direction:column;gap:18px}
.lib{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr) auto;align-items:center;gap:30px;padding:16px 26px 16px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(254,251,241,.05),rgba(254,251,241,.015));border:1px solid rgba(254,251,241,.08);transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .5s;opacity:0;transform:translateY(20px);animation:libin .9s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--i,0) * .1s)}
@keyframes libin{to{opacity:1;transform:none}}
.lib:hover{transform:translateY(-4px);border-color:rgba(244,175,86,.35);box-shadow:0 40px 80px -40px rgba(244,175,86,.25)}
.lib .ph{aspect-ratio:3/2;border-radius:16px;overflow:hidden;background:#1b1916}
.lib .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.1,1)}
.lib:hover .ph img{transform:scale(1.06)}
.lib .tg{margin:0;font-size:11.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9CB1C2}
.lib .nm{margin:8px 0 0;font-size:clamp(24px,2.4vw,32px);font-weight:400;letter-spacing:-.02em;line-height:1.1}
.acct .container--text,.acct-hero .container--text{max-width:980px}
.lib .chips{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}
.lib .chips span{display:inline-block;width:auto;padding:5px 11px;border-radius:64px;border:1px solid rgba(254,251,241,.12);font-size:12.5px;color:#AEB9C1}
.dl{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 26px;border:0;border-radius:64px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);color:#0A0908;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 14px 34px -12px rgba(244,175,86,.6);transition:transform .25s,box-shadow .25s}
.dl:hover{transform:translateY(-1px);box-shadow:0 18px 44px -12px rgba(244,175,86,.75)}
.dl svg{transition:transform .3s}.dl:hover svg{transform:translateY(2px)}
.lib-empty{padding:48px 32px;text-align:center}
.devices-box{margin-top:26px}
.devices-box .devices{padding:28px 30px;border-radius:24px;background:linear-gradient(180deg,rgba(254,251,241,.05),rgba(254,251,241,.015));border:1px solid rgba(254,251,241,.08)}
.devices-box .h3{font-size:22px;font-weight:500}
.acct-note{margin-top:26px;font-size:13px;color:#7E8A93}
html[lang=he] .acct-kick,html[lang=he] .lib .tg{letter-spacing:.04em}
@media (max-width:820px){.lib{grid-template-columns:minmax(0,1fr);gap:18px;padding:14px 14px 22px}.lib .ph{aspect-ratio:16/9}.lib > div:nth-child(2),.lib .dl{margin:0 10px}.dl{justify-content:center}.who{flex-wrap:wrap}#signed-out.glass{padding:28px 22px}}
@media (prefers-reduced-motion:reduce){.lib,.acct-hero .bg{animation:none;opacity:1;transform:none}}
</style>"""

page("account.html", "My downloads · MWP",
 "Sign in with your email to download what you've bought.",
 """  <section class="acct-hero">
    <img class="bg" src="assets/pages/img/5275cc7bcd4fb7560d8f7163592e3122.jpg" alt="">
    <div class="shade"></div>
    <div class="container container--text">
      <p class="acct-kick">Your library</p>
      <h1 class="acct-h1">My <span class="grad">downloads</span></h1>
      <p class="acct-lead">Everything you own, ready to download. New versions appear here at no cost.</p>
    </div>
  </section>
  <section class="acct">
    <div class="container container--text">
      <div id="signed-out" class="glass auth">
        <p class="auth-why" id="auth-why" hidden>Create your MWP account (or sign in) to check out. Everything you buy lives in your account: download it anytime, and get every future update free.</p>
        <div class="auth-tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" data-tab="signin" aria-selected="true">Sign in</button>
          <button type="button" role="tab" data-tab="signup" aria-selected="false">Create account</button>
        </div>
        <form class="form auth-view" data-view="signin" id="signin-form" novalidate>
          <div class="field"><label for="si-email">Email</label><input class="input" id="si-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
          <div class="field"><label for="si-pw">Password</label><div class="pw"><input class="input" id="si-pw" name="password" type="password" autocomplete="current-password" minlength="8" required><button class="pw-eye" type="button" data-eye aria-label="Show password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>
          <div class="auth-row"><button class="auth-link" type="button" data-go="forgot">Forgot password?</button></div>
          <button class="btn" type="submit">Sign in</button>
          <p class="form-status" role="status"></p>
          <div class="auth-or"><span>or</span></div>
          <button class="btn btn--ghost auth-alt" type="button" data-go="link">Email me a sign-in link</button>
        </form>
        <form class="form auth-view" data-view="signup" id="signup-form" novalidate hidden>
          <p class="auth-note">Your account keeps everything you buy: download it anytime, on any computer, and get every future update free.</p>
          <div class="field"><label for="su-name">Name</label><input class="input" id="su-name" name="name" autocomplete="name"></div>
          <div class="field"><label for="su-email">Email</label><input class="input" id="su-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
          <div class="field"><label for="su-pw">Password</label><div class="pw"><input class="input" id="su-pw" name="password" type="password" autocomplete="new-password" minlength="8" required><button class="pw-eye" type="button" data-eye aria-label="Show password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>
          <p class="auth-hint">At least 8 characters.</p>
          <button class="btn" type="submit">Create account</button>
          <p class="form-status" role="status"></p>
        </form>
        <form class="form auth-view" data-view="link" id="login-form" novalidate hidden>
          <h2 class="h3">Email me a sign-in link</h2>
          <p class="muted">We'll send a one-time link to your email. No password needed.</p>
          <div class="field"><label for="login-email">Email</label><input class="input" id="login-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
          <button class="btn" type="submit">Send the link</button>
          <p class="form-status" role="status"></p>
          <button class="auth-link" type="button" data-go="signin">Back to sign in</button>
        </form>
        <form class="form auth-view" data-view="forgot" id="forgot-form" novalidate hidden>
          <h2 class="h3">Reset your password</h2>
          <p class="muted">We'll email you a link to choose a new password.</p>
          <div class="field"><label for="fp-email">Email</label><input class="input" id="fp-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
          <button class="btn" type="submit">Email me a reset link</button>
          <p class="form-status" role="status"></p>
          <button class="auth-link" type="button" data-go="signin">Back to sign in</button>
        </form>
        <form class="form auth-view" data-view="reset" id="reset-form" novalidate hidden>
          <h2 class="h3">Choose a new password</h2>
          <div class="field"><label for="rp-pw">New password</label><div class="pw"><input class="input" id="rp-pw" name="password" type="password" autocomplete="new-password" minlength="8" required><button class="pw-eye" type="button" data-eye aria-label="Show password"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>
          <p class="auth-hint">At least 8 characters.</p>
          <button class="btn" type="submit">Save password</button>
          <p class="form-status" role="status"></p>
        </form>
        <div class="auth-view auth-sent" data-view="sent" hidden>
          <span class="seal"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg></span>
          <h2 class="h3" id="sent-h">Check your inbox</h2>
          <p class="muted" id="sent-text"></p>
          <button class="auth-link" type="button" data-go="signin">Back to sign in</button>
        </div>
      </div>
      <div id="signed-in" class="stack-lg" hidden>
        <div class="library" id="library" aria-live="polite"></div>
        <div class="devices-box" id="devices" hidden></div>
        <p class="acct-note">Download links are created when you click and expire after 5 minutes. Trouble? <a class="link" href="support.html?topic=download">Contact support</a>.</p>
      </div>
    </div>
  </section>""", "account.js", extra_head='\n  <meta name="robots" content="noindex">' + ACCOUNT_CSS)

page("support.html", "Help · MWP",
 "Help with downloading, installing or using MWP products.",
 """  <section class="page-hero">
    <div class="container container--text stack">
      <h1 class="display">How can we help?</h1>
      <p class="lead">A person answers within one business day.</p>
    </div>
  </section>
  <section class="section--tight">
    <div class="container container--text">
      <form class="form panel" id="support-form" novalidate>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
          <div class="field"><label for="s-name">Name</label><input class="input" id="s-name" name="name" autocomplete="name" required><span class="field__error" data-error-for="name"></span></div>
          <div class="field"><label for="s-email">Email</label><input class="input" id="s-email" name="email" type="email" autocomplete="email" required><span class="field__error" data-error-for="email"></span></div>
        </div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
          <div class="field"><label for="s-category">Topic</label>
            <select class="select" id="s-category" name="category">
              <option value="download">Downloading my files</option>
              <option value="install">Installing or using a product</option>
              <option value="refund">Refund request</option>
              <option value="other" selected>Something else</option>
            </select></div>
          <div class="field"><label for="s-order">Order number (optional)</label><input class="input" id="s-order" name="order_number" inputmode="numeric"></div>
        </div>
        <div class="field"><label for="s-subject">Subject</label><input class="input" id="s-subject" name="subject" maxlength="140" required><span class="field__error" data-error-for="subject"></span></div>
        <div class="field"><label for="s-message">Message</label><textarea class="textarea" id="s-message" name="message" maxlength="5000" required></textarea><span class="field__error" data-error-for="message"></span></div>
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn" type="submit">Send message</button>
        <p class="form-status" role="status"></p>
      </form>
    </div>
  </section>""", "support.js")

page("thank-you.html", "Thank you · MWP", "Your order is confirmed.",
 """  <section class="page-hero">
    <div class="container container--text stack-lg">
      <div class="stack">
        <h1 class="display">Thank you. Your order is confirmed.</h1>
        <p class="lead">Your files are ready in My downloads. We've also emailed you a link<span id="sent-to-wrap" hidden> at <b id="sent-to"></b></span>.</p>
      </div>
      <div class="row">
        <a class="btn" id="to-downloads" href="account.html">Go to my downloads</a>
        <a class="btn btn--ghost" href="index.html#faq">Installation help</a>
      </div>
      <ol class="steps">
        <li class="step"><span class="step__num">1</span><p class="step__title">Sign in</p><p class="muted">With the email you paid with.</p></li>
        <li class="step"><span class="step__num">2</span><p class="step__title">Download</p><p class="muted">One .zip per product.</p></li>
        <li class="step"><span class="step__num">3</span><p class="step__title">Install</p><p class="muted">Follow the guide inside the zip.</p></li>
      </ol>
    </div>
  </section>""", "thank-you.js", extra_head='\n  <meta name="robots" content="noindex">')

page("legal.html", "Terms, licence, refunds and privacy · MWP",
 "Terms of sale, licence, refund policy and privacy notice for MWP.",
 """  <!-- DRAFT FOR APPROVAL: every section below must be approved by Matan (refunds and terms are money terms) before launch. -->
  <section class="page-hero">
    <div class="container container--text stack">
      <h1 class="display">Terms and policies</h1>
      <p class="meta">Last updated <span data-year>2026</span></p>
    </div>
  </section>
  <section class="section--tight" data-no-i18n lang="en" dir="ltr">
    <div class="container container--text prose">
      <h2 id="licence">Licence</h2>
      <p>When you buy a product you get a personal, non-transferable licence to use it in your own work and in work you do for clients.</p>
      <ul>
        <li>Allowed: personal work, client work, social media, prints and publications you create.</li>
        <li>Not allowed: sharing, reselling, giving away or repackaging the files, alone or bundled with other products.</li>
      </ul>
      <p>Sample photographs in our products and on this site remain the property of Matan Wild Photography and may not be used without written permission.</p>

      <h2 id="refunds">Refunds</h2>
      <p>Our products are digital files delivered instantly. If a product doesn't work for you, write to <a href="support.html?topic=refund">support</a> within 14 days of purchase. We'll help you get it working, and if we can't, we'll refund you. Refunded orders lose access to the files.</p>

      <h2 id="terms">Terms of sale</h2>
      <p>Orders are processed by our online reseller, Lemon Squeezy, which is the merchant of record and handles payment, invoicing and sales tax. Prices are shown in the currency listed on each product page. You'll receive a receipt by email after every purchase.</p>
      <p>Products you buy include free updates to that product. We may add, change or retire products at any time; anything you've already bought stays in your downloads.</p>

      <h2 id="privacy">Privacy</h2>
      <p>We collect only what we need to sell and deliver your products: your name, email, country and what you bought. Payment details are handled by the checkout provider and never reach us.</p>
      <p>We use your email to deliver your files, answer support requests and, if you agreed, send occasional news and new releases. You can unsubscribe from any email.</p>
      <p>Our service providers: Supabase (database, sign-in and file storage), Lemon Squeezy (checkout), MailerLite (email), Make.com and monday.com (order handling). To see, correct or delete your data, write to support.</p>
    </div>
  </section>""", "static.js")

page("404.html", "Page not found · MWP", "This page doesn't exist.",
 """  <section class="page-hero section">
    <div class="container container--text stack-lg">
      <div class="stack">
        <h1 class="display">This page doesn't exist.</h1>
        <p class="lead">The link may be old or mistyped. Everything in the shop is one click away.</p>
      </div>
      <div class="row"><a class="btn" href="shop.html">Browse all products</a><a class="btn btn--ghost" href="index.html">Home</a></div>
    </div>
  </section>""", "static.js")
print("pages written")


# The not-found page is served at any address (e.g. /old/path/), so its links must resolve from the site root.
_p = os.path.join(ROOT, "404.html")
_h = open(_p).read().replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">', 1)
open(_p, "w").write(_h)

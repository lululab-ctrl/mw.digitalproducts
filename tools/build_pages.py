"""Generates the MWP's static pages with one shared head, header and footer."""
import os, sys
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
        <a href="shop.html?cat=bundle">Bundles</a>
      </div>
      <div class="nav__end">
        <a href="support.html">Help</a>
        <a class="icon-link" href="account.html">{ICON['user']}My downloads</a>
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

def page(name, title, desc, body, script, extra_head=""):
    if name == "index.html":
        return  # the home page is hand-built in the sales-page look (index.html)
    html = f"""{head(title, desc, name if name != 'index.html' else '', extra_head)}
{HEADER}
<main id="main">
{body}
</main>
{FOOTER}
<script type="module" src="assets/js/pages/{script}"></script>
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

page("account.html", "My downloads · MWP",
 "Sign in with your email to download what you've bought.",
 """  <section class="page-hero">
    <div class="container container--text">
      <h1 class="display">My downloads</h1>
    </div>
  </section>
  <section class="section--tight">
    <div class="container container--text">
      <div id="signed-out" class="panel stack-lg">
        <div class="stack">
          <h2 class="h3">Sign in with your email</h2>
          <p class="muted">Use the email you paid with. We'll send a one-time sign-in link; there's no password.</p>
        </div>
        <form class="form" id="login-form" novalidate>
          <div class="field">
            <label for="login-email">Email</label>
            <input class="input" id="login-email" name="email" type="email" autocomplete="email" required>
          </div>
          <button class="btn" type="submit">Email me a sign-in link</button>
          <p class="form-status" role="status"></p>
        </form>
      </div>
      <div id="signed-in" class="stack-lg" hidden>
        <div class="row row--between">
          <p class="muted">Signed in as <b id="who"></b></p>
          <button class="btn btn--sm btn--ghost" id="sign-out" type="button">Sign out</button>
        </div>
        <div class="library" id="library" aria-live="polite"></div>
        <p class="meta">Download links are created when you click and expire after 5 minutes. Trouble? <a class="link" href="support.html?topic=download">Contact support</a>.</p>
      </div>
    </div>
  </section>""", "account.js", extra_head='\n  <meta name="robots" content="noindex">')

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

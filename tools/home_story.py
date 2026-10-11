"""The landing page's own look, different from the sales pages: a cinematic viewfinder hero, a pinned
"Shoot · Edit · Finish" story that walks through the three products as you scroll, and a closing line.
All wording comes from the existing home copy (drafts for Matan); facts are the ones on the sales pages."""

IMG = "assets/pages/img/"
CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4AF56" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>'
ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

CHAPTERS = [
    dict(step="Shoot", tag="PDF field guides", name="Field Guides", href="field-guides/",
         img="5275cc7bcd4fb7560d8f7163592e3122.jpg", alt="Mountains at dusk, photographed by Matan Wild",
         line="See the photo before you press the shutter.",
         points=["4 PDF guides, 137 lessons", "Composition, colour, light and planning", "English and Hebrew"],
         cta="See the Field Guides"),
    dict(step="Edit", tag="Lightroom presets", name="Presets", href="presets/",
         img="8cb56471dbe5940badc7a93cad5c8bf1.jpg", alt="MWP Presets box",
         line="The look behind every MWP frame.",
         points=["50 Lightroom presets, 12 adaptive", "50 mobile files and 33 LUTs", "Install guide for every program"],
         cta="See MWP Presets"),
    dict(step="Finish", tag="Photoshop plugin", name="Panel", href="panel/",
         img="866c1bdb5cf29c21c1a04f6fc87b03e9.jpg", alt="A tiger, photographed by Matan Wild",
         line="You were there. Now make the photo show it.",
         points=["8 one-click effects", "11 looks and 4 painted lights", "User manual and install guide"],
         cta="See MWP Panel"),
]

HERO = f"""<section class="st-hero" id="top">
<img class="st-hero-img" src="{IMG}1a2e3ed3f44db1f671babb09a599b29f.jpg" alt="A male lion roaring, photographed by Matan Wild">
<div class="st-hero-shade"></div>
<div class="st-vf" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<div class="wrap st-hero-in">
<p class="kick st-in" style="--i:0">MWP · by Matan Wild</p>
<h1 class="st-h1"><span class="st-l"><span style="--i:1">Editing tools</span></span> <span class="st-l"><span class="grad" style="--i:2">from the field.</span></span></h1>
<p class="lead st-in" style="--i:3">Lightroom presets, a Photoshop plugin and field guides from wildlife photographer Matan Wild. Instant download, secure checkout.</p>
<div class="ctas st-in" style="--i:4"><a class="btn" href="#shop">Shop the collection</a><a class="ghost" href="#try">Try the tools</a></div>
</div>
<div class="wrap st-hero-foot st-in" style="--i:5">
<a class="st-scroll" href="#shop"><span class="st-scroll-line" aria-hidden="true"></span><span>Scroll</span></a>
<p class="small">English and Hebrew · Mac and Windows · Download right after payment</p>
</div>
</section>"""


def _chapter_text(i, c):
    lis = "".join(f"<li>{CHECK}<span>{p}</span></li>" for p in c["points"])
    return f"""<article class="st-art" data-i="{i}">
<p class="st-step"><span class="st-num">0{i + 1}</span><span>{c["step"]}</span></p>
<p class="st-tag">{c["tag"]}</p>
<h3 class="st-name" data-no-i18n>MWP <span class="grad">{c["name"]}</span></h3>
<p class="st-line">{c["line"]}</p>
<ul class="st-pts">{lis}</ul>
<div class="st-acts"><a class="btn" href="{c["href"]}">{c["cta"]} {ARROW}</a><a class="ghost" href="{c["href"]}#buy">[YOUR PRICE]</a></div>
<img class="st-art-img" src="{IMG}{c["img"]}" alt="{c["alt"]}" loading="lazy">
</article>"""


STORY = f"""<section class="st-ch" id="shop" aria-label="The collection">
<div class="wrap st-ch-head">
<p class="kick">The collection</p>
<h2 class="h2">Shoot it, edit it, <span class="b grad">finish it.</span></h2>
<p class="lead">Three products, one look. Each one works on its own, and together they take a photo from the field to the share.</p>
</div>
<div class="st-track">
<div class="st-sticky">
<div class="wrap st-grid">
<div class="st-media" aria-hidden="true">
{"".join(f'<img class="st-mimg" data-i="{i}" src="{IMG}{c["img"]}" alt="" loading="lazy">' for i, c in enumerate(CHAPTERS))}
<div class="st-vf st-vf-sm"><span></span><span></span><span></span><span></span></div>
<div class="st-count"><span class="st-cur">01</span><span class="st-of">/ 03</span></div>
</div>
<div class="st-texts">
<div class="st-prog" aria-hidden="true">{"".join(f'<span data-i="{i}">{c["step"]}</span>' for i, c in enumerate(CHAPTERS))}</div>
{"".join(_chapter_text(i, c) for i, c in enumerate(CHAPTERS))}
</div>
</div>
</div>
</div>
</section>"""

CLOSE = """<section class="st-close">
<div class="wrap">
<p class="kick">MWP · by Matan Wild</p>
<h2 class="st-big"><span>Shoot it. Edit it.</span> <span class="grad">Finish it.</span></h2>
<div class="ctas"><a class="btn" href="#shop">Shop the collection</a><a class="ghost" href="#try">Try the tools</a></div>
</div>
</section>"""

CSS = """
/* ---------- landing: cinematic hero ---------- */
.st-hero{position:relative;min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;background:#0A0908;isolation:isolate}
.st-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 35%;z-index:-2;animation:stkb 24s cubic-bezier(.2,.6,.2,1) both;transform-origin:65% 40%}
@keyframes stkb{from{transform:scale(1.14)}to{transform:scale(1)}}
.st-hero-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(10,9,8,.92) 0%,rgba(10,9,8,.55) 42%,rgba(10,9,8,.1) 75%),linear-gradient(0deg,#0A0908 0%,rgba(10,9,8,0) 38%)}
[dir=rtl] .st-hero-shade{background:linear-gradient(270deg,rgba(10,9,8,.92) 0%,rgba(10,9,8,.55) 42%,rgba(10,9,8,.1) 75%),linear-gradient(0deg,#0A0908 0%,rgba(10,9,8,0) 38%)}
[dir=rtl] .st-hero-img{transform-origin:35% 40%}
.st-vf{position:absolute;inset:clamp(18px,3.4vw,44px);pointer-events:none;z-index:0}
.st-hero .st-vf{top:calc(clamp(18px,3.4vw,44px) + 80px)}
.st-vf span{position:absolute;width:26px;height:26px;border-color:rgba(254,251,241,.45);border-style:solid;border-width:0}
.st-vf span:nth-child(1){top:0;left:0;border-top-width:1px;border-left-width:1px}
.st-vf span:nth-child(2){top:0;right:0;border-top-width:1px;border-right-width:1px}
.st-vf span:nth-child(3){bottom:0;left:0;border-bottom-width:1px;border-left-width:1px}
.st-vf span:nth-child(4){bottom:0;right:0;border-bottom-width:1px;border-right-width:1px}
.st-hero-in{position:relative;width:100%;padding-top:140px}
.st-hero-in .lead{max-width:520px;margin-top:28px}
.st-hero-in .ctas{margin-top:36px}
.st-h1{margin:18px 0 0;font-size:clamp(52px,8.4vw,132px);line-height:.94;font-weight:400;letter-spacing:-.04em;color:#FEFBF1}
.st-h1 .grad{font-weight:600}
.st-l{display:block;overflow:hidden;padding-bottom:.06em}
.st-l > span{display:inline-block;animation:strise 1.2s cubic-bezier(.2,.7,.1,1) both;animation-delay:calc(var(--i) * .12s + .2s)}
@keyframes strise{from{transform:translateY(105%)}to{transform:none}}
.st-in{animation:stfade 1.1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * .12s + .25s)}
@keyframes stfade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.st-hero-foot{position:relative;width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:56px;padding-bottom:clamp(36px,6vh,64px)}
.st-scroll{display:inline-flex;align-items:center;gap:14px;color:rgba(254,251,241,.7);text-decoration:none;font-size:12px;font-weight:600;letter-spacing:.24em;text-transform:uppercase}
.st-scroll-line{position:relative;width:56px;height:1px;background:rgba(254,251,241,.25);overflow:hidden}
.st-scroll-line::after{content:"";position:absolute;inset:0;background:#F4AF56;transform:translateX(-100%);animation:stline 2.4s cubic-bezier(.6,0,.2,1) infinite}
@keyframes stline{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}

/* ---------- landing: pinned story ---------- */
.st-ch{position:relative;background:#0A0908}
.st-ch-head{display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center;max-width:720px;margin:0 auto;padding-top:clamp(96px,14vh,160px)}
.st-track{position:relative;height:300vh}
.st-sticky{position:sticky;top:0;height:100vh;display:flex;align-items:center;overflow:hidden}
.st-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(40px,6vw,96px);align-items:center;width:100%}
.st-media{position:relative;aspect-ratio:4/5;max-height:76vh;border-radius:6px;overflow:hidden;background:#141210}
.st-mimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(100% 0 0 0);will-change:clip-path,transform}
.st-mimg:first-of-type{clip-path:inset(0 0 0 0)}

.st-media .st-vf{inset:22px;z-index:2}
.st-count{position:absolute;left:28px;bottom:24px;z-index:2;display:flex;align-items:baseline;gap:8px;color:#FEFBF1;direction:ltr}
.st-cur{font-size:56px;font-weight:500;letter-spacing:-.03em;line-height:1}
.st-of{font-size:14px;color:rgba(254,251,241,.6);letter-spacing:.1em}
.st-texts{position:relative;min-height:520px}
.st-prog{display:flex;gap:22px;margin-bottom:40px}
.st-prog span{position:relative;padding-bottom:10px;font-size:12px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:rgba(254,251,241,.38);transition:color .5s}
.st-prog span::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
[dir=rtl] .st-prog span::after{transform-origin:right}
.st-prog span.on{color:#FEFBF1}
.st-prog span.on::after,.st-prog span.done::after{transform:scaleX(1)}
.st-art{position:absolute;inset:auto 0 auto 0;top:70px;opacity:0;pointer-events:none;will-change:opacity,transform}
.st-art.on{pointer-events:auto}
.st-art:first-of-type{opacity:1}
.st-step{display:flex;align-items:baseline;gap:14px;margin:0;color:#9CB1C2;font-size:13px;font-weight:600;letter-spacing:.22em;text-transform:uppercase}
.st-num{color:#F4AF56}
.st-tag{margin:18px 0 0;color:#9CB1C2;font-size:14px}
.st-name{margin:10px 0 0;font-size:clamp(34px,3.7vw,58px);line-height:1;font-weight:400;letter-spacing:-.03em;color:#FEFBF1;white-space:nowrap}
.st-name .grad{font-weight:600}
.st-line{margin:22px 0 0;font-size:clamp(18px,1.5vw,22px);line-height:1.5;color:#CDD7DD;max-width:460px}
.st-pts{list-style:none;margin:28px 0 0;padding:24px 0 0;border-top:1px solid rgba(254,251,241,.1);display:grid;gap:12px}
.st-pts li{display:flex;gap:12px;align-items:flex-start;font-size:16px;color:#CDD7DD}
.st-pts svg{flex:none;margin-top:4px}
.st-acts{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
.st-acts .btn svg{margin-inline-start:6px}
[dir=rtl] .st-acts .btn svg{transform:scaleX(-1)}
.st-art-img{display:none}

/* ---------- landing: closing line ---------- */
.st-close{padding:clamp(120px,18vh,200px) 0;text-align:center;background:radial-gradient(80% 60% at 50% 100%,rgba(244,175,86,.08),transparent 70%),#0A0908}
.st-close .wrap{display:flex;flex-direction:column;align-items:center;gap:28px}
.st-big{margin:0;font-size:clamp(44px,7.4vw,112px);line-height:.98;font-weight:400;letter-spacing:-.04em;color:#FEFBF1}
.st-big span{display:block}
.st-big .grad{font-weight:600}

/* ---------- smaller screens: the story becomes a simple list ---------- */
@media (max-width:900px){
  .st-track{height:auto}
  .st-sticky{position:static;height:auto;display:block;padding:40px 0 24px}
  .st-grid{display:block}
  .st-media,.st-prog{display:none}
  .st-texts{min-height:0;display:grid;gap:72px}
  .st-art{position:static;opacity:1!important;transform:none!important;pointer-events:auto}
  .st-name{white-space:normal}
  .st-art-img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px;margin-top:28px;order:-1}
  .st-art{display:flex;flex-direction:column}
  .st-art-img{order:-1;margin:0 0 26px}
  .st-hero-foot .small{display:none}
}
@media (max-width:600px){
  .st-hero-in{padding-top:120px}
  .st-h1{font-size:clamp(46px,13vw,64px)}
  .st-hero-shade{background:linear-gradient(0deg,#0A0908 0%,rgba(10,9,8,.7) 55%,rgba(10,9,8,.35) 100%)}
}
@media (prefers-reduced-motion:reduce){
  .st-hero-img,.st-l > span,.st-in,.st-scroll-line::after{animation:none}
  .st-mimg,.st-art,.st-prog span::after{transition:none}
}
"""

JS = """<script>
// Pinned story, scroll-linked: the next photo wipes up and the text cross-fades in step with the scroll,
// eased toward the scroll position every frame so it glides rather than jumps.
(function () {
  var track = document.querySelector(".st-track"); if (!track) return;
  var imgs = track.querySelectorAll(".st-mimg"), arts = track.querySelectorAll(".st-art"), prog = track.querySelectorAll(".st-prog span");
  var cur = track.querySelector(".st-cur"), n = arts.length;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var target = 0, shown = 0, running = false, lastIdx = -1;
  var ss = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function measure() {
    if (window.innerWidth <= 900) return null;
    var r = track.getBoundingClientRect(), total = r.height - window.innerHeight;
    return Math.min(n - 1, Math.max(0, (-r.top / total) * n - 0.5));   // 0 … n-1, chapter centres
  }
  function paint(v) {
    for (var i = 0; i < n; i++) {
      var d = v - i;                                   // <0: upcoming, 0: on screen, >0: already passed
      // photos: each one wipes up over the one before as the scroll reaches it
      var reveal = i === 0 ? 1 : ss(-0.78, -0.22, d);
      imgs[i].style.clipPath = "inset(" + ((1 - reveal) * 100).toFixed(2) + "% 0 0 0)";
      imgs[i].style.transform = "scale(" + (1 + 0.08 * (1 - reveal) + 0.03 * ss(0, 1, d)).toFixed(4) + ")";
      // text: fade and drift; out upward, in from below
      var op = 1 - ss(0.18, 0.5, Math.abs(d));
      arts[i].style.opacity = op.toFixed(3);
      arts[i].style.transform = "translateY(" + (-d * 40).toFixed(1) + "px)";
    }
    var k = Math.round(v);
    if (k !== lastIdx) {
      lastIdx = k;
      arts.forEach(function (a, i) { a.classList.toggle("on", i === k); a.setAttribute("aria-hidden", i === k ? "false" : "true"); });
      prog.forEach(function (p, i) { p.classList.toggle("on", i === k); p.classList.toggle("done", i < k); });
      if (cur) cur.textContent = "0" + (k + 1);
    }
  }
  function loop() {
    shown += (target - shown) * (reduce ? 1 : 0.12);
    if (Math.abs(target - shown) < 0.0005) shown = target;
    paint(shown);
    if (shown !== target) requestAnimationFrame(loop); else running = false;
  }
  function onScroll() {
    var m = measure();
    if (m === null) { arts.forEach(function (a) { a.removeAttribute("aria-hidden"); a.style.opacity = ""; a.style.transform = ""; }); imgs.forEach(function (im) { im.style.clipPath = ""; im.style.transform = ""; }); return; }
    target = m;
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  shown = target = measure() || 0; if (measure() !== null) paint(shown);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
</script>"""

"""'From RAW to final' on the home page: two of Matan's photos, one per editing product, each shown
straight from the camera and finished. No panel and no container: just the photo, large, with a
compare handle that sweeps once on its own when it comes into view and then follows the visitor.
The pairs are the ones on Matan's sales pages (RAW / FINAL · MWP PRESET and FINAL · MWP PANEL)."""

IMG = "assets/pages/img/"
ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

PAIRS = [
    dict(n="01", tag="Lightroom presets", first="MWP", last="Presets", line="The look behind every MWP frame.",
         cta="See MWP Presets", href="presets/", final="FINAL · MWP PRESET",
         points=["50 Lightroom presets, 12 adaptive", "50 mobile files and 33 LUTs", "Install guide for every program"],
         before="try-raw-clean.jpg", after="fbaf19aea2af10f26b2949ab31fff094.jpg", pos="50% 62%",
         alt="Ibex on a rocky slope, photographed by Matan Wild"),
    dict(n="02", tag="Photoshop plugin", first="MWP", last="Panel", line="You were there. Now make the photo show it.",
         cta="See MWP Panel", href="panel/", final="FINAL · MWP PANEL",
         points=["8 one-click effects", "11 looks and 4 painted lights", "User manual and install guide"],
         before="c339384fe0c6d91e7b1388d0fed7d1ae.jpg", after="52e0c3d2c90942f72d31faa689449bd0.jpg", pos="50% 70%",
         alt="A herd beneath the mountains at sunset, photographed by Matan Wild"),
]

CSS = """
.cmps{display:flex;flex-direction:column;gap:clamp(88px,11vw,140px);margin-top:clamp(56px,7vw,96px)}
.cmp{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:center;gap:clamp(40px,6vw,88px)}
.cmp.flip{grid-template-columns:minmax(0,1fr) minmax(0,1.45fr)}
.cmp.flip .ba2{order:2}
.cmp-text{max-width:420px}
.cmp-tag{display:flex;align-items:center;gap:14px;margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#8C979F}
.cmp-tag .n{color:#F2A541;font-variant-numeric:tabular-nums}
.cmp-tag .n::after{content:"";display:inline-block;width:28px;height:1px;margin-inline-start:14px;vertical-align:middle;background:rgba(242,165,65,.5)}
.cmp-name{margin:0;font-size:clamp(34px,3.6vw,52px);line-height:1.02;font-weight:400;letter-spacing:-.035em;color:#FEFBF1}
.cmp-name .grad{font-weight:700}
.cmp-line{margin:16px 0 0;font-size:17px;line-height:1.55;color:#CDD7DD}
.cmp-pts{list-style:none;margin:28px 0 0;padding:0;border-top:1px solid rgba(254,251,241,.08)}
.cmp-pts li{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(254,251,241,.08);font-size:15px;color:#AEB9C1}
.cmp-pts li::before{content:"";flex:none;width:6px;height:6px;border-radius:50%;background:#F2A541;box-shadow:0 0 0 4px rgba(242,165,65,.14)}
.cmp-cta{display:inline-flex;align-items:center;gap:10px;margin-top:30px;padding:12px 4px;color:#FEFBF1;font-weight:700;font-size:15px;text-decoration:none;border-bottom:1px solid rgba(242,165,65,.5);transition:gap .3s,border-color .3s,color .3s}
.cmp-cta:hover{gap:16px;color:#F2A541;border-color:#F2A541}
[dir=rtl] .cmp-cta svg{transform:scaleX(-1)}
.ba2{position:relative;aspect-ratio:16/10;border-radius:22px;overflow:hidden;background:#111;direction:ltr;touch-action:pan-y;box-shadow:0 60px 120px -50px rgba(0,0,0,.9),0 0 0 1px rgba(254,251,241,.07);--s:50%}
.ba2 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.04);transition:transform 1.6s cubic-bezier(.2,.7,.1,1)}
.ba2.seen img{transform:none}
.ba2 .aft{clip-path:inset(0 0 0 var(--s))}
.ba2::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(0deg,rgba(10,9,8,.5),transparent 28%);box-shadow:inset 0 0 0 1px rgba(254,251,241,.05)}
.ba2 .line{position:absolute;top:0;bottom:0;left:var(--s);width:2px;margin-left:-1px;background:#FEFBF1;box-shadow:0 0 24px rgba(254,251,241,.4);pointer-events:none;z-index:2}
.ba2 .knob{position:absolute;top:50%;left:var(--s);width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#FEFBF1;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px rgba(254,251,241,.14),0 14px 40px rgba(0,0,0,.5);pointer-events:none;z-index:2;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.ba2:hover .knob{transform:scale(1.08)}
.ba2 input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0;z-index:3}
.ba2:has(input:focus-visible){outline:2px solid #F2A541;outline-offset:4px}
.ba2 .lbl{position:absolute;bottom:20px;z-index:2;display:inline-flex;align-items:center;gap:12px;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(254,251,241,.92);text-shadow:0 1px 14px rgba(0,0,0,.6);pointer-events:none;white-space:nowrap;transition:opacity .3s}
.ba2 .lbl::before{content:"";width:22px;height:1px;background:currentColor;opacity:.6}
.ba2 .lbl.l{left:22px}.ba2 .lbl.r{right:22px;color:#F2A541}
.ba2 .lbl.hide{opacity:0}
html[lang=he] .cmp-tag,html[lang=he] .ba2 .lbl{letter-spacing:.04em}
@media (max-width:960px){.cmp,.cmp.flip{grid-template-columns:minmax(0,1fr);gap:32px}.cmp.flip .ba2{order:0}.cmp-text{max-width:560px}}
@media (max-width:600px){.ba2{aspect-ratio:4/3;border-radius:18px}.ba2 .knob{width:40px;height:40px;margin:-20px 0 0 -20px}.ba2 .lbl{bottom:14px;font-size:10px}.ba2 .lbl.l{left:14px}.ba2 .lbl.r{right:14px}.ba2 .lbl::before{width:12px}.cmp-line{font-size:16px}}
@media (prefers-reduced-motion:reduce){.ba2 img{transform:none;transition:none}}
"""


def _pair(p):
    knob = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0908" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6"/><path d="M15 6l6 6-6 6"/></svg>'
    return f"""<article class="cmp{" flip" if p["n"] == "02" else ""}">
<div class="ba2">
<img class="bef" src="{IMG}{p["before"]}" alt="" loading="lazy" style="object-position: {p["pos"]}">
<img class="aft" src="{IMG}{p["after"]}" alt="{p["alt"]}" loading="lazy" style="object-position: {p["pos"]}">
<div class="line"></div>
<div class="knob" aria-hidden="true">{knob}</div>
<span class="lbl l">RAW</span>
<span class="lbl r">{p["final"]}</span>
<input type="range" min="0" max="100" value="50" step="0.1" aria-label="Drag to compare the RAW file with the final photo">
</div>
<div class="cmp-text">
<p class="cmp-tag"><span class="n">{p["n"]}</span><span>{p["tag"]}</span></p>
<h3 class="cmp-name" data-no-i18n>{p["first"]} <span class="grad">{p["last"]}</span></h3>
<p class="cmp-line">{p["line"]}</p>
<ul class="cmp-pts">{"".join(f"<li>{t}</li>" for t in p["points"])}</ul>
<a class="cmp-cta" href="{p["href"]}"><span>{p["cta"]}</span>{ARROW}</a>
</div>
</article>"""


def html():
    return f"""<section class="sec alt" id="try">
<div class="wrap">
<div class="head">
<p class="kick">From RAW to final</p>
<h2 class="h2">See what the tools <span class="b grad">do to a photo.</span></h2>
<p class="lead">Two of Matan's photos, straight from the camera and finished with the tools. Drag across each one to compare.</p>
</div>
<div class="cmps">
{"".join(_pair(p) for p in PAIRS)}
</div>
</div>
</section>"""


def js():
    return """<script>
// From RAW to final: each photo sweeps once when it comes into view, then follows the pointer or a drag.
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".ba2").forEach(function (box) {
    var input = box.querySelector("input"), l = box.querySelector(".lbl.l"), r = box.querySelector(".lbl.r");
    var cur = 50, target = 50, raf = 0, touched = false;
    function set(v) {
      cur = v; box.style.setProperty("--s", v + "%");
      l.classList.toggle("hide", v < 16); r.classList.toggle("hide", v > 84);
    }
    function ease() {   // glide toward the pointer instead of jumping
      set(cur + (target - cur) * 0.14);
      raf = Math.abs(target - cur) > 0.05 ? requestAnimationFrame(ease) : (set(target), 0);
    }
    function go(v) { target = v; if (!raf) raf = requestAnimationFrame(ease); }
    input.addEventListener("input", function () { touched = true; target = +input.value; set(target); });
    box.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      touched = true; var b = box.getBoundingClientRect();
      var v = Math.max(0, Math.min(100, (e.clientX - b.left) / b.width * 100)); input.value = v; go(v);
    });
    function sweep() {   // 50 -> 82 -> 18 -> 50, smoothly, unless the visitor takes over
      var keys = [[0, 50], [900, 82], [2100, 18], [3000, 50]], t0 = performance.now();
      (function step(now) {
        if (touched) return;
        var t = now - t0, i = 1;
        while (i < keys.length - 1 && t > keys[i][0]) i++;
        var a = keys[i - 1], b = keys[i], k = Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
        k = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        set(a[1] + (b[1] - a[1]) * k); input.value = cur; target = cur;
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(step);
      })(t0);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        box.classList.add("seen"); io.disconnect();
        if (!reduce) setTimeout(sweep, 500);
      });
    }, { threshold: 0.45 });
    io.observe(box); set(50);
  });
})();
</script>"""

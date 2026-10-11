"""Field Guides-style motion for the home page: sections fade up as they enter, numbers count up,
a slow wall of Matan's photos, a soft spotlight that follows the cursor on cards, and gentle depth
on the hero. Everything switches off for people who ask their system for reduced motion."""

IMG = "assets/pages/img/"
# Real photos by Matan, the same set the Field Guides page uses for its photo wall.
ROW1 = ["2c79f949f816ee693322cfce98f61afc", "9583692af9aca77b648b4e2ff3733f72", "aaa6b678f12b2bc6866e736281498d1c",
        "070e7608dbefe0693b217fc9c0a64234", "cff5b2d414538979bb1efe787e67de9f"]
ROW2 = ["32909dca904452841a5b6ea7a187f4aa", "b7cfa28802573f545067cc876c19f44e", "a7adf42375708a6165c1498e3e170f8e",
        "5578f8776625aac5bc0ebc1673fe549a", "3c19b4355bad5a4a5cf99bf0881b4e8b"]

def _row(ids, rev=False):
    imgs = "".join(f'<img src="{IMG}{i}.jpg" alt="" loading="lazy">' for i in ids * 2)
    return f'<div class="mqt{" rev" if rev else ""}" aria-hidden="true">{imgs}</div>'

WALL = f"""<section class="wallsec" aria-label="Photos by Matan Wild">
<p class="kick wall-kick">Every photo by Matan Wild</p>
<div class="mq">{_row(ROW1)}{_row(ROW2, True)}</div>
</section>"""

CSS = """
.wallsec{padding:72px 0 8px;overflow:hidden;width:100%;min-width:0;max-width:100vw;contain:inline-size}
.wallsec .mq{width:100%;min-width:0;overflow:hidden}
.wall-kick{text-align:center}
.wallsec .mq{margin-top:28px;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.wallsec .mqt img{width:220px;transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s}
.wallsec .mqt img:hover{transform:scale(1.04);filter:saturate(1.1)}
[dir=rtl] .wallsec .mq{direction:ltr}
/* cursor spotlight on cards and plans */
.card,.plan{position:relative;--mx:50%;--my:0%}
.card::before,.plan::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(244,175,86,.12),transparent 45%);z-index:1}
.card:hover::before,.plan:hover::before{opacity:1}
.fx .card.rv.in:hover{transform:translateY(-6px)}
/* hero depth */
.hero-bg{transform:translate3d(0,var(--py,0px),0) scale(1.06);will-change:transform}
.fly4{transform:perspective(1400px) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg));transition:transform .6s cubic-bezier(.2,.7,.2,1)}
@media (max-width:600px){.wallsec{padding-top:56px}.wallsec .mqt img{width:150px}}
@media (prefers-reduced-motion:reduce){.hero-bg{transform:none}.fly4{transform:none}.card::before,.plan::before{display:none}}
"""

JS = """<script>
// Home motion, in the Field Guides style.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (!("IntersectionObserver" in window) || reduce) { root.classList.add("nofx"); return; }
  root.classList.add("fx");
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseInt(el.dataset.to || el.textContent, 10); if (isNaN(to)) return;
    el.dataset.to = to; var t0 = null, dur = 1700;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); }
    el.textContent = "0"; requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; var el = e.target; el.classList.add("in"); io.unobserve(el);
    if (el.classList.contains("stat")) { var n = el.querySelector(".n"); setTimeout(function () { count(n); }, parseFloat(getComputedStyle(el).getPropertyValue("--d") || 0) * 1000); }
  }); }, { threshold: .2, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".stat").forEach(function (s, i) { s.style.setProperty("--d", (i * 0.15) + "s"); io.observe(s); });
  var SEL = ".hero-copy,.head,.card,.try,.wall-kick,.mq,.plan,.trust > *,.faq details,.foot-cta";
  document.querySelectorAll(SEL).forEach(function (el) {
    el.classList.add("rv");
    if (/card|plan/.test(el.className) || el.parentElement.classList.contains("trust")) {
      var i = Array.prototype.indexOf.call(el.parentElement.children, el); el.style.setProperty("--d", (i * 0.12) + "s");
    }
    io.observe(el);
  });
  // spotlight follows the cursor on cards and plans
  document.addEventListener("pointermove", function (e) {
    var t = e.target.closest && e.target.closest(".card,.plan"); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty("--mx", (e.clientX - r.left) + "px"); t.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
  // hero depth: background drifts on scroll, the product boxes lean toward the cursor
  var hero = document.querySelector(".hero"), bg = document.querySelector(".hero-bg"), fly = document.querySelector(".fly4");
  if (hero && bg) window.addEventListener("scroll", function () { var y = window.scrollY; if (y < 1200) bg.style.setProperty("--py", (y * 0.25) + "px"); }, { passive: true });
  if (hero && fly && matchMedia("(hover:hover)").matches) {
    hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      fly.style.setProperty("--ry", (x * 8) + "deg"); fly.style.setProperty("--rx", (-y * 6) + "deg"); });
    hero.addEventListener("pointerleave", function () { fly.style.setProperty("--ry", "0deg"); fly.style.setProperty("--rx", "0deg"); });
  }
})();
</script>"""

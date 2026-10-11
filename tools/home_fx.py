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
.plan{position:relative;--mx:50%;--my:0%}
.plan::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(244,175,86,.12),transparent 45%);z-index:1}
.plan:hover::before{opacity:1}
/* bundles: premium cards. Subgrid lines up titles, prices, lists and buttons across the row. */
#bundles .plans{grid-template-rows:none;gap:20px;margin-top:72px}
#bundles .plan{display:grid;grid-row:span 4;grid-template-rows:subgrid;row-gap:0;padding:36px 30px 30px;border-radius:26px;background:linear-gradient(180deg,rgba(254,251,241,.055),rgba(254,251,241,.015) 55%,rgba(254,251,241,.03));border:1px solid rgba(254,251,241,.08);box-shadow:inset 0 1px 0 rgba(254,251,241,.06),0 30px 60px -40px rgba(0,0,0,.8);transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .5s}
#bundles .plan:hover{transform:translateY(-6px);border-color:rgba(254,251,241,.16);box-shadow:inset 0 1px 0 rgba(254,251,241,.08),0 40px 80px -40px rgba(0,0,0,.9)}
#bundles .plan > div:first-of-type{padding-bottom:26px}
#bundles .plan .h3{font-size:21px;font-weight:600;letter-spacing:-.015em;line-height:1.25;color:#FEFBF1;text-wrap:balance}
#bundles .plan .small{margin-top:8px !important;font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C979F}
#bundles .plan .price{padding:22px 0;border-top:1px solid rgba(254,251,241,.08);border-bottom:1px solid rgba(254,251,241,.08);font-size:clamp(30px,2.6vw,38px);font-weight:300;letter-spacing:-.03em;line-height:1;color:#FEFBF1;font-variant-numeric:tabular-nums;white-space:normal}
#bundles .plan ul{padding:24px 0 30px;gap:14px}
#bundles .plan li{gap:12px;font-size:14.5px;line-height:1.5;color:#AEB9C1}
#bundles .plan li svg{width:18px;height:18px;padding:4px;margin-top:1px;border-radius:50%;background:rgba(242,165,65,.12);box-shadow:inset 0 0 0 1px rgba(242,165,65,.3)}
#bundles .plan .ghost{border-radius:14px;min-height:48px;border-color:rgba(254,251,241,.16);transition:border-color .3s,color .3s,background .3s}
#bundles .plan .ghost:hover{border-color:#F2A541;color:#F2A541;background:rgba(242,165,65,.06)}
#bundles .plan .btn{border-radius:14px;min-height:48px;box-shadow:0 14px 34px -12px rgba(242,165,65,.6)}
#bundles .plan.hi{border:1px solid transparent;background:linear-gradient(180deg,#1a1510,#0f0d0b) padding-box,linear-gradient(180deg,rgba(242,165,65,.85),rgba(242,165,65,.15) 60%,rgba(242,165,65,.45)) border-box;box-shadow:0 40px 90px -40px rgba(242,165,65,.35),0 30px 60px -40px rgba(0,0,0,.8)}
#bundles .plan.hi .price{color:#F2C27F}
#bundles .plan .tagx{top:-12px;left:auto;inset-inline-start:30px;padding:6px 14px;border-radius:64px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);font-size:10.5px;font-weight:800;letter-spacing:.18em;box-shadow:0 8px 20px -6px rgba(242,165,65,.6)}
html[lang=he] #bundles .plan .small,html[lang=he] #bundles .plan .tagx{letter-spacing:.03em}
@media (prefers-reduced-motion:reduce){#bundles .plan{transition:none}#bundles .plan:hover{transform:none}}
/* the landing hero sits under the transparent top bar */
.st-hero{margin-top:-80px}
@media (max-width:600px){.st-hero{margin-top:-64px}}
@media (prefers-reduced-motion:reduce){.plan::before{display:none}}
"""

JS = """<script>
// Landing motion: sections fade up as they come into view; a soft spotlight follows the cursor on cards.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (!("IntersectionObserver" in window) || reduce) { root.classList.add("nofx"); return; }
  root.classList.add("fx");
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target);
  }); }, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
  var SEL = ".st-ch-head,#bundles .head,#faq .head,.plan,.trust > *,.faq details";
  document.querySelectorAll(SEL).forEach(function (el) {
    el.classList.add("rv");
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    if (/plan/.test(el.className) || el.parentElement.classList.contains("trust")) el.style.setProperty("--d", (i * 0.1) + "s");
    io.observe(el);
  });
  document.addEventListener("pointermove", function (e) {
    var t = e.target.closest && e.target.closest(".plan"); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty("--mx", (e.clientX - r.left) + "px"); t.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();
</script>"""

"""'Try it yourself' playground for the home page: a small, honest taste of MWP Presets and MWP Panel, all on one photo.
Every look shown is a real before/after pair from Matan's sales pages. The Amount slider fades
between the RAW file and the finished frame; the handle on the photo compares with the RAW file."""

IMG = "assets/pages/img/"
LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'

# One photo for everything, so visitors see each look change the same frame.
# BASE is the RAW export; each look is the same RAW exported with that preset or effect only.
# None = waiting for Matan's export of that look on this photo (shown as a placeholder slot).
BASE = "3c14b23dbb00f051684ad60fb205ed10.jpg"
LOOKS = [
    ("presets", "Blue Hour", "fbaf19aea2af10f26b2949ab31fff094.jpg"),
    ("presets", "[Preset 2]", None),
    ("presets", "[Preset 3]", None),
    ("presets", "[Preset 4]", None),
    ("panel", "Subject · Pop", None),
    ("panel", "Background · Darken", None),
    ("panel", "Sky", None),
]
# The Panel's Edit tab, as listed in the Presets sales page. Tools without an export stay locked.
PANEL_EDIT = ["Subject · Pop", "Eye", "Sky", "Background · Darken", "Lights", "Darks", "Dodge & Burn", "Vignette"]

CSS = """
.try{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;margin-top:48px;align-items:stretch}
.tstage{position:relative;border-radius:24px;overflow:hidden;background:#111;aspect-ratio:16/10;box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);touch-action:pan-y}
.tstage img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.tstage #try-after{transition:opacity .25s}
.tstage .line{position:absolute;top:0;bottom:0;width:2px;background:#FEFBF1;transform:translateX(-1px);pointer-events:none}
.tstage .knob{position:absolute;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#FEFBF1;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(0,0,0,.5);pointer-events:none}
.tstage input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.tstage:has(input:focus-visible){outline:3px solid #F2A541;outline-offset:4px}
.tstage .lbl{position:absolute;top:18px;padding:7px 12px;border-radius:30px;background:rgba(10,9,8,.72);backdrop-filter:blur(6px);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;pointer-events:none}
.tstage .lbl.l{left:18px;color:#FEFBF1}.tstage .lbl.r{right:18px;color:#F2A541}
.tstage .note{position:absolute;left:18px;right:18px;bottom:16px;font-size:12px;line-height:1.4;color:#CDD7DD;background:rgba(10,9,8,.7);padding:8px 12px;border-radius:10px;pointer-events:none}
.app{display:flex;flex-direction:column;gap:18px;padding:22px;border-radius:24px;background:#141210;border:1px solid rgba(156,177,194,.16)}
.seg{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:14px;background:#0A0908;border:1px solid rgba(156,177,194,.16)}
.seg button{min-height:56px;padding:0 4px;text-align:center;border:0;border-radius:10px;background:none;color:#9CB1C2;font:700 14px/1.2 inherit;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.seg button small{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.8}
.seg button.on{background:#FEFBF1;color:#0A0908}
.grp{margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9CB1C2}
.looks{display:grid;gap:8px}
.look{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:46px;padding:0 16px;border-radius:12px;border:1px solid rgba(156,177,194,.22);background:#1b1916;color:#FEFBF1;font:600 15px inherit;font-family:inherit;cursor:pointer;text-align:start}
.look:hover{border-color:#FEFBF1}
.look.on{border-color:#F2A541;background:rgba(242,165,65,.1)}
.look .dot{width:9px;height:9px;border-radius:50%;background:rgba(156,177,194,.35)}
.look.on .dot{background:#F2A541;box-shadow:0 0 0 4px rgba(242,165,65,.2)}
.fx{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fx .look{min-height:44px;padding:0 12px;font-size:14px}
.fx .look.locked{color:#6f7a82;border-style:dashed;background:none;cursor:not-allowed}
.fx .look.locked:hover{border-color:rgba(156,177,194,.22)}
.more{margin:12px 0 0;font-size:13px;line-height:1.5;color:#9CB1C2;transition:color .2s}
.more.nudge{color:#F2A541}
.amt{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;font-weight:700;font-size:14px}
.amt output{font-variant-numeric:tabular-nums;color:#F2A541}
.amt input{grid-column:1/-1;width:100%;accent-color:#F2A541;height:28px;margin:0;cursor:pointer}
.app .go{margin-top:auto;display:flex;align-items:center;justify-content:center;min-height:50px;border-radius:30px;background:linear-gradient(90deg,#DA5A22,#F2A541);color:#0A0908;font-weight:800;text-decoration:none}
.try-hint{text-align:center;margin-top:16px}
.tstage .wait{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:24px;text-align:center;font-weight:700;color:#FEFBF1;background:rgba(10,9,8,.55);pointer-events:none}
.tstage.waiting .wait{display:flex}
.look.soon{border-style:dashed}
.amt.off{opacity:.4;pointer-events:none}
@media (min-width:981px){.tstage{aspect-ratio:auto;width:100%;height:100%;min-height:520px}}
@media (max-width:980px){.try{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.tstage{aspect-ratio:4/5;border-radius:18px}.app{padding:18px}}
"""


def _btn(i, name, file, on=False):
    cls = "look" + (" on" if on else "") + ("" if file else " soon")
    return f'<button type="button" class="{cls}" data-look="{i}" aria-pressed="{"true" if on else "false"}"><span data-no-i18n>{name}</span><span class="dot" aria-hidden="true"></span></button>'


def html():
    looks = "".join(_btn(i, n, f, i == 0) for i, (t, n, f) in enumerate(LOOKS) if t == "presets")
    fx = []
    for label in PANEL_EDIT:
        idx = next((i for i, l in enumerate(LOOKS) if l[0] == "panel" and l[1] == label), None)
        if idx is None:
            fx.append(f'<button type="button" class="look locked" data-locked aria-disabled="true"><span data-no-i18n>{label}</span>{LOCK}</button>')
        else:
            fx.append(_btn(idx, label, LOOKS[idx][2]))
    first = LOOKS[0]
    return f"""<section class="sec alt" id="try">
<div class="wrap">
<div class="head">
<p class="kick">Try it yourself</p>
<h2 class="h2">Get your hands <span class="b grad">on the tools.</span></h2>
<p class="lead">One photo, straight from the camera. Try a preset or a Panel effect on it, set the amount, then drag across the photo to see where it started.</p>
</div>
<div class="try">
<div class="tstage" id="try-stage">
<img id="try-before" src="{IMG}{BASE}" alt="The RAW file as shot">
<img id="try-after" src="{IMG}{first[2]}" alt="The same photo with the selected MWP look" style="clip-path: inset(0 0 0 50%)">
<div class="line" style="left: 50%"></div>
<div class="knob" style="left: 50%" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A0908" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6"></path><path d="M15 6l6 6-6 6"></path></svg></div>
<span class="lbl l">RAW</span>
<span class="lbl r" id="try-tag" data-no-i18n>MWP · {first[1]}</span>
<input type="range" id="try-split" min="0" max="100" value="50" aria-label="Drag to compare with the RAW file">
<p class="wait">PLACEHOLDER: this look needs Matan's export of the same photo.</p>
<p class="note">PLACEHOLDER: Blue Hour here is Matan's finished edit. Replace with the same RAW edited only with the preset before launch.</p>
</div>
<aside class="app" aria-label="Try the tools">
<div class="seg" role="group" aria-label="Choose a tool">
<button type="button" class="on" data-tool="presets" aria-pressed="true"><small>Lightroom</small><span data-no-i18n>MWP Presets</span></button>
<button type="button" data-tool="panel" aria-pressed="false"><small>Photoshop</small><span data-no-i18n>MWP Panel</span></button>
</div>
<div data-pane="presets">
<p class="grp">Presets</p>
<div class="looks">{looks}</div>
<p class="more">The full pack: 50 Lightroom presets, 50 mobile files and 33 LUTs.</p>
</div>
<div data-pane="panel" hidden>
<p class="grp">Edit</p>
<div class="fx">{"".join(fx)}</div>
<p class="more" id="try-more">A few effects are open to try. The full plugin has 8 one-click effects, 11 looks and 4 painted lights.</p>
</div>
<div class="amt"><label for="try-amount">Amount</label><output id="try-amt" for="try-amount">100%</output><input type="range" id="try-amount" min="0" max="100" value="100"></div>
<a class="go" id="try-cta" href="presets/">Get MWP Presets</a>
</aside>
</div>
<p class="small try-hint">Drag across the photo to compare with the RAW file.</p>
</div>
</section>"""


def js():
    data = [[t, n, (IMG + f) if f else ""] for (t, n, f) in LOOKS]
    return """<script>
// Try it yourself: one photo; each preset or Panel effect swaps in that look on the same frame.
(function () {
  var L = %s;
  var he = function () { return document.documentElement.lang === "he"; };
  var stage = document.getElementById("try-stage");
  var after = document.getElementById("try-after");
  var line = stage.querySelector(".line"), knob = stage.querySelector(".knob"), split = document.getElementById("try-split");
  var amount = document.getElementById("try-amount"), out = document.getElementById("try-amt"), tag = document.getElementById("try-tag");
  var amt = document.querySelector("#try .amt"), cta = document.getElementById("try-cta");
  var CTA = { presets: ["presets/", "Get MWP Presets", "לפריסטים"], panel: ["panel/", "Get MWP Panel", "לפאנל"] };
  function setSplit(v) { after.style.clipPath = "inset(0 0 0 " + v + "%%)"; line.style.left = v + "%%"; knob.style.left = v + "%%"; }
  function setAmount(v) { after.style.opacity = v / 100; out.textContent = v + "%%"; }
  function pick(i) {
    var l = L[i], ready = !!l[2];
    stage.classList.toggle("waiting", !ready); amt.classList.toggle("off", !ready);
    after.style.display = ready ? "" : "none";
    if (ready) { var im = new Image(); im.onload = function () { after.src = l[2]; }; im.src = l[2]; }
    tag.textContent = "MWP · " + l[1];
    document.querySelectorAll("#try .look[data-look]").forEach(function (o) { var on = +o.dataset.look === i; o.classList.toggle("on", on); o.setAttribute("aria-pressed", on); });
    amount.value = 100; setAmount(100);
  }
  function tool(t) {
    document.querySelectorAll("#try .seg button").forEach(function (b) { var on = b.dataset.tool === t; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    document.querySelectorAll("#try [data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== t; });
    cta.href = CTA[t][0]; cta.textContent = he() ? CTA[t][2] : CTA[t][1];
    for (var i = 0; i < L.length; i++) if (L[i][0] === t) { pick(i); break; }
  }
  split.addEventListener("input", function () { setSplit(split.value); });
  amount.addEventListener("input", function () { setAmount(amount.value); });
  document.querySelectorAll("#try .seg button").forEach(function (b) { b.addEventListener("click", function () { tool(b.dataset.tool); }); });
  document.querySelectorAll("#try .look[data-look]").forEach(function (b) { b.addEventListener("click", function () { pick(+b.dataset.look); }); });
  var more = document.getElementById("try-more"), tmr;
  document.querySelectorAll("#try [data-locked]").forEach(function (b) { b.addEventListener("click", function () {
    more.classList.add("nudge"); clearTimeout(tmr); tmr = setTimeout(function () { more.classList.remove("nudge"); }, 1400);
  }); });
})();
</script>""" % data

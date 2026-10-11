"""'Try it yourself' playground for the home page: a small, honest taste of MWP Presets, MWP Panel and the Field Guides.
Every look shown is a real before/after pair from Matan's sales pages. The Amount slider fades
between the RAW file and the finished frame; the handle on the photo compares with the RAW file."""

IMG = "assets/pages/img/"
LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'

# (tool, group, name, before, after)
LOOKS = [
    ("presets", "Light and Scene", "Blue Hour", "3c14b23dbb00f051684ad60fb205ed10.jpg", "fbaf19aea2af10f26b2949ab31fff094.jpg"),
    ("presets", "Light and Scene", "Macro Ground", "7c359a77f23f632596ebda32f1e9a72f.jpg", "84c2340ddf79f1f703f8c905e9b986be.jpg"),
    ("panel", "Subject", "Pop", "c339384fe0c6d91e7b1388d0fed7d1ae.jpg", "52e0c3d2c90942f72d31faa689449bd0.jpg"),
    ("panel", "Background", "Darken", "af0d1799831d0417d338c0b162975a7b.jpg", "95e0579188ba924ac89563eb21facef6.jpg"),
    # Field Guides: real sample pages from the Field Guides sales page (no before/after).
    ("guides", "", "Rule of thirds", None, "b8dddf776b0555122fbe159c327fb896.jpg"),
    ("guides", "", "Fix white balance first", None, "349a280dc465d732b2db94a66d8bda5f.jpg"),
    ("guides", "", "Side light", None, "4e5149d41f2cb2860f2e76848243a157.jpg"),
    ("guides", "", "Light under the storm", None, "b49a68a97187304be4385b9dacfa7a8b.jpg"),
]
# The Panel's Edit tab, as listed in the Presets sales page. Only Subject and Background are open in the demo.
PANEL_EDIT = ["Subject", "Eye", "Sky", "Background", "Lights", "Darks", "Dodge & Burn", "Vignette"]

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
.seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:4px;border-radius:14px;background:#0A0908;border:1px solid rgba(156,177,194,.16)}
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
.tstage.page{background:#0A0908}
.tstage.page img{object-fit:contain}
.tstage.page #try-after{clip-path:none!important;opacity:1!important}
.tstage.page #try-before,.tstage.page .line,.tstage.page .knob,.tstage.page .lbl.l,.tstage.page #try-split,.tstage.page .note{display:none}
.try.pages .amt,.try.pages + .try-hint{visibility:hidden}
.pager{display:none;position:absolute;bottom:16px;left:50%;transform:translateX(-50%);gap:8px}
.tstage.page .pager{display:flex}
.pager button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(254,251,241,.92);color:#0A0908;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
@media (min-width:981px){.tstage{aspect-ratio:auto;width:100%;height:100%;min-height:520px}}
@media (max-width:980px){.try{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.tstage{aspect-ratio:4/5;border-radius:18px}.app{padding:18px}}
"""


def html():
    looks = "".join(
        f'<button type="button" class="look{" on" if i == 0 else ""}" data-look="{i}" aria-pressed="{"true" if i == 0 else "false"}"><span data-no-i18n>{name}</span><span class="dot" aria-hidden="true"></span></button>'
        for i, (tool, group, name, b, a) in enumerate(LOOKS) if tool == "presets")
    pages = "".join(
        f'<button type="button" class="look" data-look="{i}" aria-pressed="false"><span>{name}</span><span class="dot" aria-hidden="true"></span></button>'
        for i, (tool, group, name, b, a) in enumerate(LOOKS) if tool == "guides")
    fx = []
    for label in PANEL_EDIT:
        idx = next((i for i, l in enumerate(LOOKS) if l[0] == "panel" and l[1] == label), None)
        if idx is None:
            fx.append(f'<button type="button" class="look locked" data-locked aria-disabled="true"><span data-no-i18n>{label}</span>{LOCK}</button>')
        else:
            fx.append(f'<button type="button" class="look" data-look="{idx}" aria-pressed="false"><span data-no-i18n>{label} · {LOOKS[idx][2]}</span><span class="dot" aria-hidden="true"></span></button>')
    first = LOOKS[0]
    return f"""<section class="sec alt" id="try">
<div class="wrap">
<div class="head">
<p class="kick">Try it yourself</p>
<h2 class="h2">Get your hands <span class="b grad">on the tools.</span></h2>
<p class="lead">Pick a tool, tap a look and set the amount. Then drag across the photo to see where it started. A small taste of what's inside.</p>
</div>
<div class="try">
<div class="tstage" id="try-stage">
<img id="try-before" src="{IMG}{first[3]}" alt="The RAW file as shot">
<img id="try-after" src="{IMG}{first[4]}" alt="The same photo with the selected MWP look" style="clip-path: inset(0 0 0 50%)">
<div class="line" style="left: 50%"></div>
<div class="knob" style="left: 50%" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A0908" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6"></path><path d="M15 6l6 6-6 6"></path></svg></div>
<span class="lbl l">RAW</span>
<span class="lbl r" id="try-tag" data-no-i18n>MWP · {first[2]}</span>
<input type="range" id="try-split" min="0" max="100" value="50" aria-label="Drag to compare with the RAW file">
<div class="pager"><button type="button" data-step="-1" aria-label="Previous page"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" data-step="1" aria-label="Next page"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div>
<p class="note">PLACEHOLDER: the finished frames are Matan's full edits. Replace with the same RAW edited only with the preset or effect before launch.</p>
</div>
<aside class="app" aria-label="Try the tools">
<div class="seg" role="group" aria-label="Choose a tool">
<button type="button" class="on" data-tool="presets" aria-pressed="true"><small>Lightroom</small><span data-no-i18n>MWP Presets</span></button>
<button type="button" data-tool="panel" aria-pressed="false"><small>Photoshop</small><span data-no-i18n>MWP Panel</span></button>
<button type="button" data-tool="guides" aria-pressed="false"><small>PDF</small><span>Field Guides</span></button>
</div>
<div data-pane="presets">
<p class="grp">Light and Scene</p>
<div class="looks">{looks}</div>
<p class="more">The full pack: 50 Lightroom presets, 50 mobile files and 33 LUTs.</p>
</div>
<div data-pane="panel" hidden>
<p class="grp">Edit</p>
<div class="fx">{"".join(fx)}</div>
<p class="more" id="try-more">Two effects are open to try. The full plugin has 8 one-click effects, 11 looks and 4 painted lights.</p>
</div>
<div data-pane="guides" hidden>
<p class="grp">Sample pages</p>
<div class="looks">{pages}</div>
<p class="more">The full set: 4 PDF guides, 137 lessons on 229 pages, in English and Hebrew.</p>
</div>
<div class="amt"><label for="try-amount">Amount</label><output id="try-amt" for="try-amount">100%</output><input type="range" id="try-amount" min="0" max="100" value="100"></div>
<a class="go" id="try-cta" href="presets/">Get MWP Presets</a>
</aside>
</div>
<p class="small try-hint">Drag across the photo to compare with the RAW file.</p>
</div>
</section>"""


def js():
    data = [[t, (IMG + b) if b else "", IMG + a, n] for (t, g, n, b, a) in LOOKS]
    return """<script>
// Try it yourself: choose a tool and a look, set the amount, drag to compare with the RAW file.
(function () {
  var L = %s;
  var he = function () { return document.documentElement.lang === "he"; };
  var stage = document.getElementById("try-stage");
  var before = document.getElementById("try-before"), after = document.getElementById("try-after");
  var line = stage.querySelector(".line"), knob = stage.querySelector(".knob"), split = document.getElementById("try-split");
  var amount = document.getElementById("try-amount"), out = document.getElementById("try-amt"), tag = document.getElementById("try-tag");
  var cta = document.getElementById("try-cta");
  var CTA = { presets: ["presets/", "Get MWP Presets", "לפריסטים"], panel: ["panel/", "Get MWP Panel", "לפאנל"], guides: ["field-guides/", "Get the Field Guides", "למדריכי השטח"] };
  var wrap = document.querySelector("#try .try"), cur = 0;
  function setSplit(v) { after.style.clipPath = "inset(0 0 0 " + v + "%%)"; line.style.left = v + "%%"; knob.style.left = v + "%%"; }
  function setAmount(v) { after.style.opacity = v / 100; out.textContent = v + "%%"; }
  function pick(i) {
    var l = L[i]; cur = i;
    var page = !l[1];
    stage.classList.toggle("page", page); wrap.classList.toggle("pages", page);
    // preload, then swap both frames together so they never mismatch
    var a = new Image(), b = new Image(), n = 0;
    function done() { if (++n < 2) return; if (l[1]) before.src = l[1]; after.src = l[2]; }
    a.onload = b.onload = a.onerror = b.onerror = done; a.src = l[1] || l[2]; b.src = l[2];
    tag.textContent = page ? (he() ? "מדריכי השטח" : "MWP · Field Guides") : "MWP · " + l[3];
    document.querySelectorAll("#try .look[data-look]").forEach(function (o) { var on = +o.dataset.look === i; o.classList.toggle("on", on); o.setAttribute("aria-pressed", on); });
    amount.value = 100; setAmount(100); split.value = 50; setSplit(50);
  }
  function tool(t) {
    document.querySelectorAll("#try .seg button").forEach(function (b) { var on = b.dataset.tool === t; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    document.querySelectorAll("#try [data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== t; });
    cta.href = CTA[t][0]; cta.textContent = he() ? CTA[t][2] : CTA[t][1];
    for (var i = 0; i < L.length; i++) if (L[i][0] === t) { pick(i); break; }
  }
  stage.querySelectorAll("[data-step]").forEach(function (b) { b.addEventListener("click", function () {
    var same = []; for (var k = 0; k < L.length; k++) if (L[k][0] === L[cur][0]) same.push(k);
    var at = same.indexOf(cur); pick(same[(at + +b.dataset.step + same.length) %% same.length]);
  }); });
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

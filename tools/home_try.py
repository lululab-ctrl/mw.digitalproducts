"""'Try it yourself' on the home page: one of Matan's photos, edited live in the browser.
Visitors pick a look and switch on Panel-style effects; everything is drawn on the same photo with a
canvas, so nothing has to be exported or uploaded. These are browser previews of the kinds of edits
the products make, not the actual preset or plugin output, and the page says so."""

IMG = "assets/pages/img/"
RAW = "try-raw-clean.jpg"   # Matan's RAW of this frame (3c14b23d…), lightly denoised once so brightening it stays clean
BASE = "fbaf19aea2af10f26b2949ab31fff094.jpg"   # Matan's high-quality ibex photo from the Presets design, 1800 x 1125
LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'

# Looks: e exposure (stops), t temperature, g tint, c contrast, s shadows, h highlights,
# sat saturation, f fade, sc / hc split-tone colour for shadows / highlights.
LOOKS = [
    # The other looks are colour grades on top of Matan's finished frame, faded in from the RAW by Amount.
    ("Golden Hour", dict(e=.05, t=.4, g=.02, c=.1, s=.06, h=.1, sat=.1, f=0, sc=[.012, .004, -.025], hc=[.04, .02, -.03])),
    ("Cool Dusk", dict(e=0, t=-.25, g=0, c=.1, s=.05, h=.08, sat=.08, f=0, sc=[-.012, 0, .03], hc=[0, .008, .02])),
    ("Matte Earth", dict(e=.02, t=.15, g=.01, c=-.04, s=.1, h=.1, sat=-.12, f=.3, sc=[.014, .007, 0], hc=[.018, .012, 0])),
    ("Deep Contrast", dict(e=-.03, t=.04, g=0, c=.24, s=-.04, h=.06, sat=.1, f=0, sc=[0, 0, .01], hc=[.012, .006, 0])),
    ("Soft Light", dict(e=.1, t=.08, g=0, c=-.05, s=.18, h=.22, sat=.03, f=.06, sc=[0, 0, .012], hc=[.015, .012, .008])),
]
# Panel's Edit tab (names from the Panel sales page). Open ones can be stacked; the rest are a teaser.
EFFECTS = [("pop", "Subject · Pop"), ("bg", "Background · Darken"), ("sky", "Sky"), ("lights", "Lights"),
           ("darks", "Darks"), ("vig", "Vignette")]
LOCKED = ["Eye", "Dodge & Burn"]

CSS = """
.try{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;margin-top:48px;align-items:stretch}
.tstage{position:relative;border-radius:24px;overflow:hidden;background:#111;aspect-ratio:16/10;box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);touch-action:pan-y}
.tstage img,.tstage canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.tstage img[hidden]{display:none}
.tstage .line{position:absolute;top:0;bottom:0;width:2px;background:#FEFBF1;transform:translateX(-1px);pointer-events:none}
.tstage .knob{position:absolute;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#FEFBF1;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(0,0,0,.5);pointer-events:none}
.tstage{direction:ltr}
.tstage input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.tstage:has(input:focus-visible){outline:3px solid #F2A541;outline-offset:4px}
.tstage .lbl{position:absolute;top:18px;padding:7px 12px;border-radius:30px;background:rgba(10,9,8,.72);backdrop-filter:blur(6px);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;pointer-events:none;max-width:45%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tstage .lbl.l{left:18px;color:#FEFBF1}.tstage .lbl.r{right:18px;color:#F2A541}
.tstage .note{position:absolute;left:18px;right:18px;bottom:16px;margin:0;font-size:12px;line-height:1.4;color:#CDD7DD;background:rgba(10,9,8,.7);padding:8px 12px;border-radius:10px;pointer-events:none}
.app{display:flex;flex-direction:column;gap:14px;padding:20px;border-radius:24px;background:#141210;border:1px solid rgba(156,177,194,.16)}
.seg{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:14px;background:#0A0908;border:1px solid rgba(156,177,194,.16)}
.seg button{min-height:48px;padding:0 4px;text-align:center;border:0;border-radius:10px;background:none;color:#9CB1C2;font-weight:700;font-size:14px;line-height:1.2;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.seg button small{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.8}
.seg button.on{background:#FEFBF1;color:#0A0908}
.grp{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9CB1C2}
.looks{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.looks .look:last-child:nth-child(odd){grid-column:1/-1}
.look{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px;padding:0 12px;border-radius:12px;border:1px solid rgba(156,177,194,.22);background:#1b1916;color:#FEFBF1;font-weight:600;font-size:14px;line-height:1.2;font-family:inherit;cursor:pointer;text-align:start}
.look:hover{border-color:#FEFBF1}
.look.on{border-color:#F2A541;background:rgba(242,165,65,.1)}
.look.cur{box-shadow:0 0 0 2px rgba(242,165,65,.35)}
.look .dot{flex:none;width:9px;height:9px;border-radius:50%;background:rgba(156,177,194,.35)}
.look.on .dot{background:#F2A541;box-shadow:0 0 0 4px rgba(242,165,65,.2)}
.fx{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fx .look{min-height:36px;padding:3px 10px;font-size:13px}
.fx .look.locked{color:#6f7a82;border-style:dashed;background:none;cursor:not-allowed}
.fx .look.locked:hover{border-color:rgba(156,177,194,.22)}
.more{margin:8px 0 0;font-size:12px;line-height:1.5;color:#9CB1C2;transition:color .2s}
.more.nudge{color:#F2A541}
.amt{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;font-weight:700;font-size:14px}
.amt output{font-variant-numeric:tabular-nums;color:#F2A541}
.amt input{grid-column:1/-1;width:100%;accent-color:#F2A541;height:22px;margin:0;cursor:pointer}
.amt.off{opacity:.4;pointer-events:none}
.reset{justify-self:start;align-self:flex-start;border:0;background:none;color:#9CB1C2;font-family:inherit;font-size:13px;font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:0}
.app .go{margin-top:auto;display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:30px;background:linear-gradient(90deg,#DA5A22,#F2A541);color:#0A0908;font-weight:800;text-decoration:none}
.try-hint{text-align:center;margin-top:16px}
@media (min-width:1181px){.tstage{align-self:start}}
@media (max-width:1180px){.try{grid-template-columns:minmax(0,1fr)}.tstage{align-self:auto}}
@media (max-width:600px){.tstage{aspect-ratio:4/5;border-radius:18px}.app{padding:18px}}
"""


def html():
    looks = "".join(
        f'<button type="button" class="look" data-look="{i}" aria-pressed="false"><span>{name}</span><span class="dot" aria-hidden="true"></span></button>'
        for i, (name, _) in enumerate(LOOKS))
    fx = "".join(
        f'<button type="button" class="look" data-fx="{key}" aria-pressed="false"><span data-no-i18n>{label}</span><span class="dot" aria-hidden="true"></span></button>'
        for key, label in EFFECTS)
    fx += "".join(
        f'<button type="button" class="look locked" data-locked aria-disabled="true"><span data-no-i18n>{label}</span>{LOCK}</button>'
        for label in LOCKED)
    return f"""<section class="sec alt" id="try">
<div class="wrap">
<div class="head">
<p class="kick">Try it yourself</p>
<h2 class="h2">Get your hands <span class="b grad">on the tools.</span></h2>
<p class="lead">One photo, straight from the camera. Try a look, stack a few Panel effects, set the amount, then drag across the photo to see where it started.</p>
</div>
<div class="try">
<div class="tstage" id="try-stage">
<img id="try-before" src="{IMG}{RAW}" alt="The RAW file as shot">
<img id="try-base" src="{IMG}{BASE}" alt="" hidden>
<canvas id="try-after" role="img" aria-label="The same photo with your edits" style="clip-path: inset(0 0 0 50%)"></canvas>
<div class="line" style="left: 50%"></div>
<div class="knob" style="left: 50%" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A0908" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6"></path><path d="M15 6l6 6-6 6"></path></svg></div>
<span class="lbl l">RAW</span>
<span class="lbl r" id="try-tag" data-no-i18n>Your edit</span>
<input type="range" id="try-split" min="0" max="100" value="50" aria-label="Drag to compare with the RAW file">
<p class="note">Live preview in your browser. The real presets and plugin go further, with masks, detail and colour work on every frame.</p>
</div>
<aside class="app" aria-label="Try the tools">
<div class="seg" role="group" aria-label="Choose a tool">
<button type="button" class="on" data-tool="presets" aria-pressed="true"><small>Lightroom</small><span data-no-i18n>MWP Presets</span></button>
<button type="button" data-tool="panel" aria-pressed="false"><small>Photoshop</small><span data-no-i18n>MWP Panel</span></button>
</div>
<div data-pane="presets">
<p class="grp">Looks</p>
<div class="looks">{looks}</div>
<p class="more">The full pack: 50 Lightroom presets, 50 mobile files and 33 LUTs.</p>
</div>
<div data-pane="panel" hidden>
<p class="grp">Edit · tap to stack</p>
<div class="fx">{fx}</div>
<p class="more" id="try-more">The full plugin has 8 one-click effects, 11 looks and 4 painted lights.</p>
</div>
<div class="amt off"><label for="try-amount" id="try-amt-name" data-no-i18n>Amount</label><output id="try-amt" for="try-amount">0%</output><input type="range" id="try-amount" min="0" max="100" value="0"></div>
<button type="button" class="reset" id="try-reset">Start again</button>
<a class="go" id="try-cta" href="presets/">Get MWP Presets</a>
</aside>
</div>
<p class="small try-hint">Drag across the photo to compare with the RAW file.</p>
</div>
</section>"""


def js():
    import json
    looks = json.dumps([p for _, p in LOOKS])
    names = json.dumps([n for n, _ in LOOKS])
    fx = json.dumps({k: l for k, l in EFFECTS})
    return """<script>
// Try it yourself: one photo, edited live on a canvas. A look (presets) plus stackable effects (Panel).
(function () {
  var LOOKS = %(looks)s, NAMES = %(names)s, FX = %(fx)s;
  var HE_NAMES = {"Matan's edit": "העריכה של מתן", "Golden Hour": "שעת זהב", "Cool Dusk": "דמדומים קרים", "Matte Earth": "אדמה מט", "Deep Contrast": "ניגודיות עמוקה", "Soft Light": "אור רך"};
  var he = function () { return document.documentElement.lang === "he"; };
  var stage = document.getElementById("try-stage"), before = document.getElementById("try-before"), base = document.getElementById("try-base");
  var cv = document.getElementById("try-after"), ctx = cv.getContext("2d", { willReadFrequently: true });
  var line = stage.querySelector(".line"), knob = stage.querySelector(".knob"), split = document.getElementById("try-split");
  var amount = document.getElementById("try-amount"), out = document.getElementById("try-amt"), amtName = document.getElementById("try-amt-name");
  var amtBox = document.querySelector("#try .amt"), tag = document.getElementById("try-tag"), cta = document.getElementById("try-cta");
  var CTA = { presets: ["presets/", "Get MWP Presets", "לפריסטים"], panel: ["panel/", "Get MWP Panel", "לפאנל"] };
  var state = { look: -1, lookAmt: 100, fx: {}, cur: null };   // fx: key -> amount (0-100)
  var FULL = null, FAST = null, idle = 0;
  function setSplit(v) { cv.style.clipPath = "inset(0 0 0 " + v + "%%)"; line.style.left = v + "%%"; knob.style.left = v + "%%"; }   // full-resolution and quick preview buffers

  function layer(w, h) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var x2 = c.getContext("2d", { willReadFrequently: true });
    x2.drawImage(base, 0, 0, w, h); var edit = x2.getImageData(0, 0, w, h).data.slice();
    x2.drawImage(before, 0, 0, w, h);
    var L = { W: w, H: h, c: c, x: x2, src: x2.getImageData(0, 0, w, h).data.slice(), edit: edit,
      subj: new Uint8Array(w * h), sky: new Uint8Array(w * h), vig: new Uint8Array(w * h) };
    // masks: subject (soft ellipse around the animals), sky (top of frame), vignette (edges)
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = y * w + x, nx = x / w, ny = y / h;
      var dx = (nx - 0.48) / 0.5, dy = (ny - 0.6) / 0.3, d = Math.sqrt(dx * dx + dy * dy);
      var q = Math.max(0, Math.min(1, (1.6 - d) / 1.2)); L.subj[i] = 255 * q * q * (3 - 2 * q);
      L.sky[i] = 255 * Math.max(0, Math.min(1, (0.55 - ny) / 0.3));
      var vx = nx - 0.5, vy = (ny - 0.5) * 0.8, v = Math.sqrt(vx * vx + vy * vy) / 0.64;
      L.vig[i] = 255 * Math.max(0, Math.min(1, (v - 0.45) / 0.55));
    }
    return L;
  }
  function prepare() {
    // Full resolution so the photo stays as sharp as the original beside it; a smaller copy keeps sliders smooth.
    var w = before.naturalWidth, h = before.naturalHeight;
    cv.width = w; cv.height = h;
    FULL = layer(w, h);
    FAST = layer(Math.round(w / 2), Math.round(h / 2));
  }

  var queued = false, wantFast = false;
  function render(fast) {
    wantFast = !!fast;
    if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; draw(wantFast ? FAST : FULL); }); }
    clearTimeout(idle);
    if (fast) idle = setTimeout(function () { render(false); }, 160);
  }
  function draw(Lr) {
    if (!Lr) return;
    var src = Lr.src, W = Lr.W, H = Lr.H, M = { subj: Lr.subj, sky: Lr.sky, vig: Lr.vig };
    var p = state.look >= 0 ? LOOKS[state.look] : null, a = state.lookAmt / 100;
    var f = state.fx, fp = (f.pop || 0) / 100, fb = (f.bg || 0) / 100, fs = (f.sky || 0) / 100, fl = (f.lights || 0) / 100, fd = (f.darks || 0) / 100, fv = (f.vig || 0) / 100;
    var q = p && !p.img, e = q ? Math.pow(2, p.e) : 1, t = q ? p.t : 0, g = q ? p.g : 0, c = q ? p.c : 0, s = q ? p.s : 0, h = q ? p.h : 0;
    var sat = q ? p.sat : 0, fade = q ? p.f : 0, sc = p && !p.img ? p.sc : [0, 0, 0], hc = p && !p.img ? p.hc : [0, 0, 0];
    var im = Lr.x.createImageData(W, H), o = im.data, n = W * H;
    for (var i = 0; i < n; i++) {
      var k = i * 4, r = src[k] / 255, gg = src[k + 1] / 255, b = src[k + 2] / 255, L;
      if (p && p.img) {
        r += (Lr.edit[k] / 255 - r) * a; gg += (Lr.edit[k + 1] / 255 - gg) * a; b += (Lr.edit[k + 2] / 255 - b) * a;
      } else if (p) {
        var r0 = r, g0 = gg, b0 = b;
        r = Lr.edit[k] / 255; gg = Lr.edit[k + 1] / 255; b = Lr.edit[k + 2] / 255;
        r *= e; gg *= e; b *= e;
        r += t * 0.07; b -= t * 0.07; gg -= g * 0.04;
        L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        var lift = s * 0.32 * (1 - L) * (1 - L), roll = h * 0.3 * L * L;
        r += lift - roll; gg += lift - roll; b += lift - roll;
        r = (r - 0.45) * (1 + c) + 0.45; gg = (gg - 0.45) * (1 + c) + 0.45; b = (b - 0.45) * (1 + c) + 0.45;
        L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        r = L + (r - L) * (1 + sat); gg = L + (gg - L) * (1 + sat); b = L + (b - L) * (1 + sat);
        r += (1 - L) * sc[0] + L * hc[0]; gg += (1 - L) * sc[1] + L * hc[1]; b += (1 - L) * sc[2] + L * hc[2];
        var fd0 = fade * 0.1; r = r * (1 - fd0) + fd0; gg = gg * (1 - fd0) + fd0; b = b * (1 - fd0) + fd0;
        r = r0 + (r - r0) * a; gg = g0 + (gg - g0) * a; b = b0 + (b - b0) * a;
      }
      L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
      if (fl) { var up = fl * (0.5 * L * L + 0.12 * L); r += up; gg += up; b += up; }
      if (fd) { var dn = fd * 0.6 * (1 - L) * L; r -= dn; gg -= dn; b -= dn; }
      if (fs) { var m = M.sky[i] / 255 * fs, Ls; r *= 1 - 0.3 * m; gg *= 1 - 0.2 * m; b *= 1 - 0.06 * m; Ls = 0.2126 * r + 0.7152 * gg + 0.0722 * b; r = Ls + (r - Ls) * (1 + 0.6 * m); gg = Ls + (gg - Ls) * (1 + 0.6 * m); b = Ls + (b - Ls) * (1 + 0.6 * m); }
      if (fb) { var mb = 1 - 0.5 * (1 - M.subj[i] / 255) * fb; r *= mb; gg *= mb; b *= mb; }
      if (fp) { var mp = M.subj[i] / 255 * fp, Lp = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        r = Lp + (r - Lp) * (1 + 0.5 * mp); gg = Lp + (gg - Lp) * (1 + 0.5 * mp); b = Lp + (b - Lp) * (1 + 0.5 * mp);
        r = (r - 0.45) * (1 + 0.3 * mp) + 0.45 + 0.1 * mp; gg = (gg - 0.45) * (1 + 0.3 * mp) + 0.45 + 0.1 * mp; b = (b - 0.45) * (1 + 0.3 * mp) + 0.45 + 0.1 * mp; }
      if (fv) { var mv = 1 - 0.65 * (M.vig[i] / 255) * (M.vig[i] / 255) * fv; r *= mv; gg *= mv; b *= mv; }
      o[k] = r * 255; o[k + 1] = gg * 255; o[k + 2] = b * 255; o[k + 3] = 255;
    }
    if (Lr === FULL) ctx.putImageData(im, 0, 0);
    else { Lr.x.putImageData(im, 0, 0); ctx.imageSmoothingQuality = "high"; ctx.drawImage(Lr.c, 0, 0, cv.width, cv.height); }
  }

  function lookName(i) { return he() ? (HE_NAMES[NAMES[i]] || NAMES[i]) : NAMES[i]; }
  function fxName(k) { return FX[k].split(" · ")[0]; }
  function label() {
    var parts = [];
    if (state.look >= 0) parts.push(lookName(state.look));
    Object.keys(state.fx).forEach(function (k) { parts.push(fxName(k)); });
    tag.textContent = parts.length ? parts.join(" + ") : (he() ? "העריכה שלך" : "Your edit");
  }
  function sync() {
    document.querySelectorAll("#try .look[data-look]").forEach(function (b) { var on = +b.dataset.look === state.look; b.classList.toggle("on", on); b.classList.toggle("cur", on && state.cur === "look"); b.setAttribute("aria-pressed", on); });
    document.querySelectorAll("#try .look[data-fx]").forEach(function (b) { var k = b.dataset.fx, on = k in state.fx; b.classList.toggle("on", on); b.classList.toggle("cur", state.cur === k); b.setAttribute("aria-pressed", on); });
    var v = state.cur === "look" ? state.lookAmt : (state.cur ? state.fx[state.cur] : 0);
    amtBox.classList.toggle("off", !state.cur);
    amount.value = v; out.textContent = v + "%%";
    amtName.textContent = (he() ? "עוצמה" : "Amount") + (state.cur ? " · " + (state.cur === "look" ? lookName(state.look) : fxName(state.cur)) : "");
    label(); render();
  }
  function tool(t) {
    document.querySelectorAll("#try .seg button").forEach(function (b) { var on = b.dataset.tool === t; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    document.querySelectorAll("#try [data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== t; });
    cta.href = CTA[t][0]; cta.textContent = he() ? CTA[t][2] : CTA[t][1];
  }

  document.querySelectorAll("#try .look[data-look]").forEach(function (b) { b.addEventListener("click", function () {
    var i = +b.dataset.look;
    if (state.look === i) { state.look = -1; if (state.cur === "look") state.cur = null; } else { state.look = i; state.lookAmt = 100; state.cur = "look"; }
    sync();
  }); });
  document.querySelectorAll("#try .look[data-fx]").forEach(function (b) { b.addEventListener("click", function () {
    var k = b.dataset.fx;
    if (k in state.fx && state.cur === k) { delete state.fx[k]; state.cur = null; }
    else { if (!(k in state.fx)) state.fx[k] = 70; state.cur = k; }
    sync();
  }); });
  amount.addEventListener("input", function () {
    var v = +amount.value;
    if (state.cur === "look") state.lookAmt = v; else if (state.cur) state.fx[state.cur] = v;
    out.textContent = v + "%%"; render(true);
  });
  document.getElementById("try-reset").addEventListener("click", function () { state.look = -1; state.fx = {}; state.cur = null; sync(); });
  split.addEventListener("input", function () { setSplit(split.value); });
  document.querySelectorAll("#try .seg button").forEach(function (b) { b.addEventListener("click", function () { tool(b.dataset.tool); }); });
  var more = document.getElementById("try-more"), tmr;
  document.querySelectorAll("#try [data-locked]").forEach(function (b) { b.addEventListener("click", function () {
    more.classList.add("nudge"); clearTimeout(tmr); tmr = setTimeout(function () { more.classList.remove("nudge"); }, 1400);
  }); });

  // Start with a look on, so the first thing people see is the photo changing.
  function start() { prepare(); state.look = 0; state.lookAmt = 100; state.cur = "look"; sync(); }
  function boot() {
    var ready = function (im) { return im.complete && im.naturalWidth; };
    var go = function () { if (ready(base) && ready(before) && !FULL) start(); };
    go(); base.addEventListener("load", go); before.addEventListener("load", go);
  }
  // wait for the language to be set (i18n runs as a module, after this script)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
</script>""" % dict(looks=looks, names=names, fx=fx)

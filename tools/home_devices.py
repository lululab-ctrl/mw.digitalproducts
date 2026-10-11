"""Product scenes for the landing story, one different object per chapter, built from Matan's real material:
- Shoot: the four Field Guides as printed hardcover books (covers from the Field Guides page) that fan out.
- Edit: a laptop, straight on, in a Lightroom-style layout (preset groups from the Presets page) where the
  RAW turns into Matan's finished frame as you scroll.
- Finish: a desktop monitor, straight on, in a Photoshop-style layout with the real MWP Panel docked,
  applying Subject · Pop.
Calm, centred, symmetric compositions; everything moves with the story's scroll-linked transition."""

IMG = "assets/pages/img/"

# The four guides, as named on the Field Guides page.
BOOKS = [("01", "Composition", "d5f6d2a7c84cc3346ef45e4922528351"),
         ("02", "Colour", "6d84bcea4206fe4c622103d7d3aea920"),
         ("03", "Light", "ce73f34a054f9959d99fd850c1df9ce5"),
         ("04", "Planning", "2f9794f404a12b19c251a68288a8f543")]
PRESET_GROUPS = ["MWP 1 Signature", "MWP 2 Light &amp; Scene", "MWP 3 Mono", "MWP 4 Adaptive", "MWP 5 Tools"]
SLIDERS = [("Exposure", 62), ("Contrast", 58), ("Highlights", 24), ("Shadows", 66), ("Clarity", 59), ("Vibrance", 57)]


def shoot():
    books = "".join(f"""<div class="bk" style="--k:{k}">
<div class="bk-f bk-front"><img src="{IMG}{img}.jpg" alt=""><div class="bk-lab"><span class="bk-brand">MWP FIELD GUIDES</span><span class="bk-num">{n}</span><b>{t}</b></div></div>
<div class="bk-f bk-back"></div>
<div class="bk-f bk-spine"><span>{t}</span></div>
<div class="bk-f bk-pages"></div>
<div class="bk-f bk-top"></div>
</div>""" for k, (n, t, img) in enumerate(BOOKS))
    return f'<div class="st-dev st-dev-shoot" data-i="0"><div class="bk-row">{books}</div><div class="st-floor"></div></div>'


def edit():
    groups = "".join(f'<span class="{"on" if k == 1 else ""}">{g}</span>' for k, g in enumerate(PRESET_GROUPS))
    rows = "".join(f'<div class="st-sl"><span>{n}</span><div class="st-bar"><i style="--to:{v}%"></i></div></div>' for n, v in SLIDERS)
    return f"""<div class="st-dev st-dev-edit" data-i="1">
<div class="st-lap">
<div class="st-lap-scr"><div class="st-app st-lr">
<div class="st-pane"><b>PRESETS</b>{groups}</div>
<div class="st-canvas"><img src="{IMG}try-raw-clean.jpg" alt=""><img class="st-wipe" src="{IMG}fbaf19aea2af10f26b2949ab31fff094.jpg" alt=""><i class="st-wline"></i><em class="st-chip l">MWP</em><em class="st-chip r">RAW</em></div>
<div class="st-pane st-pane-r"><b>BASIC</b>{rows}</div>
</div><i class="st-glare"></i></div>
<div class="st-lap-base"></div>
</div>
<div class="st-floor"></div>
</div>"""


def finish():
    tools = "<i></i>" * 9
    return f"""<div class="st-dev st-dev-finish" data-i="2">
<div class="st-mon">
<div class="st-mon-scr"><div class="st-app st-ps">
<div class="st-tools">{tools}</div>
<div class="st-canvas"><img src="{IMG}c339384fe0c6d91e7b1388d0fed7d1ae.jpg" alt=""><img class="st-wipe" src="{IMG}52e0c3d2c90942f72d31faa689449bd0.jpg" alt=""><i class="st-wline"></i><em class="st-chip l">SUBJECT · POP</em><em class="st-chip r">BEFORE</em></div>
<div class="st-dock"><div class="st-dock-in"><img src="{IMG}0f68e9846bf802d72ca616b1da7a3b4c.png" alt=""><i class="st-ring st-ring-a"></i><i class="st-ring st-ring-b"></i></div></div>
</div><i class="st-glare"></i></div>
<div class="st-mon-neck"></div><div class="st-mon-foot"></div>
</div>
</div>"""


HTML = '<div class="st-devs" aria-hidden="true">' + shoot() + edit() + finish() + "</div>"

CSS = """
/* ---------- landing: product scenes ---------- */
.st-media::before{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(70% 60% at 50% 55%,rgba(10,9,8,.45),rgba(10,9,8,.82));backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.st-devs{position:absolute;inset:0;z-index:2;pointer-events:none}
.st-dev{position:absolute;inset:88px 0 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;will-change:opacity,transform;perspective:1600px}
.st-dev:first-child{opacity:1}
.st-floor{width:70%;height:40px;margin-top:-6px;background:radial-gradient(closest-side,rgba(0,0,0,.7),rgba(0,0,0,0));filter:blur(4px)}

/* hardcover books */
.bk-row{position:relative;width:100%;height:min(46vh,380px);transform-style:preserve-3d;--w:min(10.4vw,168px);--h:calc(var(--w) * 1.38);--d:calc(var(--w) * .17);--gap:calc(var(--w) * 1.16)}
.bk{position:absolute;left:50%;top:50%;width:var(--w);height:var(--h);margin:calc(var(--h) / -2) 0 0 calc(var(--w) / -2);transform-style:preserve-3d;
  transform:translateX(calc((var(--k) - 1.5) * var(--gap) * (.18 + .82 * var(--e,0)))) translateZ(calc((var(--k) - 1.5) * -14px * (1 - var(--e,0)))) rotateY(calc(34deg - 16deg * var(--e,0)))}
[dir=rtl] .bk{direction:ltr}
.bk-f{position:absolute;top:0;left:50%;height:100%;backface-visibility:hidden}
.bk-front,.bk-back{width:var(--w);margin-left:calc(var(--w) / -2)}
.bk-front{transform:translateZ(calc(var(--d) / 2));border-radius:2px 5px 5px 2px;overflow:hidden;background:#0C2925;box-shadow:inset 3px 0 6px rgba(0,0,0,.35)}
.bk-front img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bk-front::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.35) 0,rgba(255,255,255,.08) 2.5%,rgba(0,0,0,0) 6%),linear-gradient(0deg,rgba(10,9,8,.85) 0,rgba(10,9,8,0) 45%)}
.bk-lab{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;justify-content:flex-end;padding:12% 10%;color:#FEFBF1}
.bk-brand{position:absolute;top:8%;left:10%;font-size:max(7px,.5vw);font-weight:700;letter-spacing:.24em;opacity:.9}
.bk-num{font-size:max(9px,.62vw);font-weight:700;letter-spacing:.2em;color:#F4AF56}
.bk-lab b{font-size:max(15px,1.15vw);font-weight:600;letter-spacing:-.01em;line-height:1.1}
.bk-back{transform:rotateY(180deg) translateZ(calc(var(--d) / 2));background:#0C2925}
.bk-spine,.bk-pages{width:var(--d);margin-left:calc(var(--d) / -2)}
.bk-spine{transform:rotateY(-90deg) translateZ(calc(var(--w) / 2));background:linear-gradient(90deg,#08201d,#0f332e 50%,#08201d);display:flex;align-items:center;justify-content:center}
.bk-spine span{writing-mode:vertical-rl;transform:rotate(180deg);font-size:max(7px,.5vw);font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#F4AF56}
.bk-pages{transform:rotateY(90deg) translateZ(calc(var(--w) / 2 - 2px));height:calc(100% - 6px);top:3px;background:repeating-linear-gradient(90deg,#f3efe6 0,#f3efe6 1px,#d9d3c6 1px,#d9d3c6 2px)}
.bk-top{width:var(--w);height:var(--d);margin:0 0 0 calc(var(--w) / -2);top:calc(var(--d) / -2);transform:rotateX(90deg);background:repeating-linear-gradient(0deg,#f3efe6 0,#f3efe6 1px,#d9d3c6 1px,#d9d3c6 2px)}

/* laptop, straight on */
.st-lap{position:relative;z-index:2;width:min(86%,640px)}
.st-lap-scr{position:relative;aspect-ratio:16/10;padding:1.8% 1.8% 2.4%;border-radius:18px 18px 6px 6px;background:linear-gradient(180deg,#2a2a2a,#111);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 50px 100px rgba(0,0,0,.55)}
.st-lap-base{position:relative;height:16px;margin:0 -7%;border-radius:2px 2px 16px 16px;background:linear-gradient(180deg,#d6d6d6 0,#9a9a9a 45%,#4a4a4a 100%)}
.st-lap-base::before{content:"";position:absolute;left:50%;top:0;width:15%;height:6px;margin-left:-7.5%;border-radius:0 0 8px 8px;background:rgba(0,0,0,.28)}

/* desktop monitor, straight on */
.st-mon{position:relative;z-index:2;width:min(88%,660px);display:flex;flex-direction:column;align-items:center}
.st-mon-scr{position:relative;width:100%;aspect-ratio:16/9.6;padding:1.4%;border-radius:12px;background:linear-gradient(180deg,#232323,#0d0d0d);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 50px 100px rgba(0,0,0,.55)}
.st-mon-neck{width:16%;height:70px;background:linear-gradient(90deg,#8d8d8d,#d0d0d0 45%,#8d8d8d);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)}
.st-mon-foot{width:34%;height:10px;border-radius:3px 3px 10px 10px;background:linear-gradient(180deg,#d8d8d8,#7a7a7a);box-shadow:0 22px 40px rgba(0,0,0,.6)}

.st-glare{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 38%)}
.st-app{direction:ltr;position:relative;display:grid;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#1d1d1d;font-size:9px;color:#bbb}
.st-lr{grid-template-columns:20% 1fr 22%}
.st-ps{grid-template-columns:5% 1fr 25%}
.st-pane{display:flex;flex-direction:column;gap:7px;padding:12px 10px;background:#252525;border-right:1px solid #111}
.st-pane-r{border-right:0;border-left:1px solid #111}
.st-pane b{font-size:8px;letter-spacing:.18em;color:#888;margin-bottom:4px}
.st-pane span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:4px 6px;border-radius:4px}
.st-pane span.on{background:rgba(244,175,86,.14);color:#F4AF56}
.st-sl{display:grid;gap:4px}
.st-sl span{padding:0}
.st-bar{position:relative;height:3px;border-radius:2px;background:#3a3a3a}
.st-bar i{position:absolute;top:50%;left:var(--at,50%);width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#ddd}
.st-canvas{position:relative;overflow:hidden;background:#111}
.st-canvas img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.st-wipe{clip-path:inset(0 100% 0 0)}
.st-wline{position:absolute;top:0;bottom:0;left:0;width:1.5px;background:#FEFBF1;box-shadow:0 0 12px rgba(254,251,241,.6)}
.st-chip{position:absolute;top:8px;padding:3px 7px;border-radius:20px;background:rgba(10,9,8,.6);font-style:normal;font-size:7px;font-weight:700;letter-spacing:.14em;color:#FEFBF1}
.st-chip.l{left:8px;color:#F4AF56}.st-chip.r{right:8px}
.st-tools{display:flex;flex-direction:column;align-items:center;gap:9px;padding-top:12px;background:#262626;border-right:1px solid #111}
.st-tools i{width:12px;height:12px;border-radius:3px;background:#3d3d3d}
.st-tools i:nth-child(3){background:#5a5a5a}
.st-dock{position:relative;overflow:hidden;background:#2b2b2b;border-left:1px solid #111}
.st-dock-in{position:relative}
.st-dock-in img{display:block;width:100%}
.st-ring{position:absolute;border:1.5px solid #F4AF56;border-radius:5px;box-shadow:0 0 0 3px rgba(244,175,86,.18);opacity:0;transition:opacity .4s}
.st-ring-a{left:3%;top:14.6%;width:23%;height:2.9%}
.st-ring-b{left:3%;top:46.4%;width:45.5%;height:3.9%}
.st-ring.on{opacity:1}
@media (max-width:1200px){.st-app{font-size:8px}}
"""

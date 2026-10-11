"""Device scenes for the landing story, built only from Matan's real material:
- Shoot: a tablet paging through real Field Guides spreads, with printed pages on the table behind it.
- Edit: a laptop in a Lightroom-style layout (preset groups from the Presets page) where the RAW turns into
  Matan's finished frame as you scroll, plus a phone with the mobile edit.
- Finish: a laptop in a Photoshop-style layout with the real MWP Panel docked on the right, applying
  Subject · Pop to the photo as you scroll.
Everything moves with the same scroll-linked transition as the rest of the story."""

IMG = "assets/pages/img/"

GUIDE_PAGES = ["57095d3323fffc9a993dadd87fa8eef6", "4b4b1d77192fcd2ea1858e6d4c864f43",
               "c6bf9db365b03b5d171be787de9a6006", "dbe1d96b0ef4c197e1393ec558d40bef"]
PRINTS = ["acbee3ba9c48ef5249fe1568d91215f6", "b8dddf776b0555122fbe159c327fb896"]
PRESET_GROUPS = ["MWP 1 Signature", "MWP 2 Light &amp; Scene", "MWP 3 Mono", "MWP 4 Adaptive", "MWP 5 Tools"]
SLIDERS = [("Exposure", 62), ("Contrast", 58), ("Highlights", 24), ("Shadows", 66), ("Clarity", 59), ("Vibrance", 57)]


def shoot():
    pages = "".join(f'<img class="st-pg" data-k="{k}" src="{IMG}{p}.jpg" alt="">' for k, p in enumerate(GUIDE_PAGES))
    prints = "".join(f'<img class="st-print p{k}" src="{IMG}{p}.jpg" alt="">' for k, p in enumerate(PRINTS))
    dots = "".join(f'<i data-k="{k}"></i>' for k in range(len(GUIDE_PAGES)))
    return f"""<div class="st-dev st-dev-shoot" data-i="0">
<div class="st-prints">{prints}</div>
<div class="st-tab"><div class="st-tab-scr">{pages}</div><div class="st-tab-dots">{dots}</div></div>
</div>"""


def edit():
    groups = "".join(f'<span class="{"on" if k == 1 else ""}">{g}</span>' for k, g in enumerate(PRESET_GROUPS))
    rows = "".join(f'<div class="st-sl"><span>{n}</span><div class="st-bar"><i style="--to:{v}%"></i></div></div>' for n, v in SLIDERS)
    return f"""<div class="st-dev st-dev-edit" data-i="1">
<div class="st-lap">
<div class="st-lap-scr"><div class="st-app st-lr">
<div class="st-pane"><b>PRESETS</b>{groups}</div>
<div class="st-canvas"><img src="{IMG}try-raw-clean.jpg" alt=""><img class="st-wipe" src="{IMG}fbaf19aea2af10f26b2949ab31fff094.jpg" alt=""><i class="st-wline"></i><em class="st-chip l">MWP</em><em class="st-chip r">RAW</em></div>
<div class="st-pane st-pane-r"><b>BASIC</b>{rows}</div>
</div></div>
<div class="st-lap-base"></div>
</div>
<div class="st-phone"><img src="{IMG}49caac68a148e8a94f554155c537cf56.jpg" alt=""></div>
</div>"""


def finish():
    tools = "<i></i>" * 9
    return f"""<div class="st-dev st-dev-finish" data-i="2">
<div class="st-lap">
<div class="st-lap-scr"><div class="st-app st-ps">
<div class="st-tools">{tools}</div>
<div class="st-canvas"><img src="{IMG}c339384fe0c6d91e7b1388d0fed7d1ae.jpg" alt=""><img class="st-wipe" src="{IMG}52e0c3d2c90942f72d31faa689449bd0.jpg" alt=""><i class="st-wline"></i><em class="st-chip l">SUBJECT · POP</em><em class="st-chip r">BEFORE</em></div>
<div class="st-dock"><div class="st-dock-in"><img src="{IMG}0f68e9846bf802d72ca616b1da7a3b4c.png" alt=""><i class="st-ring st-ring-a"></i><i class="st-ring st-ring-b"></i></div></div>
</div></div>
<div class="st-lap-base"></div>
</div>
</div>"""


HTML = '<div class="st-devs" aria-hidden="true">' + shoot() + edit() + finish() + "</div>"

CSS = """
/* ---------- landing: device scenes ---------- */
.st-media::before{content:"";position:absolute;inset:0;z-index:1;background:rgba(10,9,8,.58);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.st-devs{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;padding:96px 6% 40px;perspective:1800px;pointer-events:none}
.st-dev{position:absolute;inset:96px 6% 40px;display:flex;align-items:center;justify-content:center;opacity:0;will-change:opacity,transform}
.st-dev:first-child{opacity:1}
/* tablet + prints */
.st-tab{position:relative;z-index:2;width:min(88%,640px);aspect-ratio:16/10.6;padding:2.2%;border-radius:22px;background:linear-gradient(145deg,#2a2a2a,#121212);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 50px 100px rgba(0,0,0,.65),0 18px 40px rgba(0,0,0,.45);transform:rotateX(10deg) rotateY(-12deg) rotateZ(1deg)}
[dir=rtl] .st-tab{transform:rotateX(10deg) rotateY(12deg) rotateZ(-1deg)}
.st-tab-scr{position:relative;width:100%;height:100%;border-radius:12px;overflow:hidden;background:#000}
.st-pg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .8s ease,transform 1.2s cubic-bezier(.2,.7,.2,1);transform:scale(1.03)}
.st-pg.on{opacity:1;transform:none}
.st-tab-dots{position:absolute;left:50%;bottom:-26px;transform:translateX(-50%);display:flex;gap:8px}
.st-tab-dots i{width:6px;height:6px;border-radius:50%;background:rgba(254,251,241,.25);transition:background .4s,width .4s}
.st-tab-dots i.on{width:18px;border-radius:4px;background:#F4AF56}
.st-prints{position:absolute;inset:0;z-index:1}
.st-print{position:absolute;width:52%;aspect-ratio:16/10;object-fit:cover;border-radius:4px;box-shadow:0 30px 60px rgba(0,0,0,.55);border:6px solid #F4F1EA}
.st-print.p0{left:2%;top:8%;transform:rotate(-9deg)}
.st-print.p1{right:0;bottom:6%;transform:rotate(7deg)}
/* laptop */
.st-lap{position:relative;z-index:2;width:min(90%,620px);transform:rotateX(8deg) rotateY(-10deg);transform-style:preserve-3d}
[dir=rtl] .st-lap{transform:rotateX(8deg) rotateY(10deg)}
.st-lap-scr{position:relative;aspect-ratio:16/10;padding:1.6% 1.6% 2.2%;border-radius:16px 16px 4px 4px;background:linear-gradient(160deg,#2b2b2b,#0f0f0f);box-shadow:0 0 0 1px rgba(255,255,255,.07) inset,0 60px 120px rgba(0,0,0,.6)}
.st-lap-base{height:14px;margin:0 -6%;border-radius:0 0 14px 14px;background:linear-gradient(180deg,#bfbfbf,#6e6e6e 70%,#3d3d3d);box-shadow:0 30px 50px rgba(0,0,0,.55)}
.st-lap-base::before{content:"";display:block;width:16%;height:5px;margin:0 auto;border-radius:0 0 6px 6px;background:rgba(0,0,0,.25)}
.st-app{direction:ltr;position:relative;display:grid;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#1d1d1d;font-size:9px;color:#bbb}
.st-lr{grid-template-columns:20% 1fr 22%}
.st-ps{grid-template-columns:5% 1fr 26%}
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
/* phone */
.st-phone{position:absolute;z-index:3;right:4%;bottom:8%;width:min(22%,150px);aspect-ratio:9/19;padding:6px;border-radius:26px;background:linear-gradient(160deg,#2c2c2c,#0d0d0d);box-shadow:0 0 0 1px rgba(255,255,255,.08) inset,0 40px 80px rgba(0,0,0,.6);transform:rotate(6deg)}
[dir=rtl] .st-phone{right:auto;left:2%;transform:rotate(-6deg)}
.st-phone img{width:100%;height:100%;object-fit:cover;border-radius:20px}
@media (max-width:1200px){.st-app{font-size:8px}.st-phone{width:20%}}
@media (prefers-reduced-motion:reduce){.st-pg{transition:none}}
"""

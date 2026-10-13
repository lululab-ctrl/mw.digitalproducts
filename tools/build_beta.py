"""Builds beta/index.html: the invite-only beta page.
Behind a password (checked by the `beta` Edge Function, never in this page), invited photographers get
MWP Presets, MWP Panel and the Field Guides free in exchange for content tagging @mw_phototours.
Access is per person, like a purchase: their email gets the products in My downloads, and Panel unlocks
with their own email sign-in. Same look as the home page (dark, gold, Google Sans / Heebo).
Run: python3 tools/build_beta.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from brand import NAV_CSS, FONTS

IMG = "../assets/pages/img/"
HERO = "5275cc7bcd4fb7560d8f7163592e3122.jpg"
LOGO = "2dd3356528167ddf9a64c0c7301c8aa3.png"
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4AF56" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
LOCK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>'

PRODUCTS = [
    ("Lightroom presets", "MWP", "Presets", "c88e041b857fb964607aaec43ad1753d.jpg",
     ["50 Lightroom presets, 12 adaptive", "50 mobile files and 33 LUTs", "Install guide for every program"]),
    ("Photoshop plugin", "MWP", "Panel", "8f730b9bb76b93ca707cae719a309479.jpg",
     ["8 one-click effects", "11 looks and 4 painted lights", "User manual and install guide"]),
    ("PDF field guides", "MWP", "Field Guides", "0cf44582c4078749d18156eec10c90d3.jpg",
     ["4 PDF guides, 137 lessons", "Composition, colour, light and planning", "English and Hebrew"]),
]

ASKS = [
    ("01", "Create with it", "Edit your photos with MWP and share the results: stories, reels and posts."),
    ("02", "Tag us", "Tag @mw_phototours in everything you post with MWP, so we can see it and share it."),
    ("03", "Keep it personal", "Your access is yours alone. Use it on your own computers, but don't share the files or your sign-in."),
    ("04", "Tell us what you think", "Reply to our emails with what works and what doesn't. Beta feedback shapes the launch."),
]

CSS = """
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:#0A0908;color:#FEFBF1;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit}
.wrap{max-width:1200px;margin:0 auto;padding:0 40px}
.kick{margin:0;font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#9CB1C2}
.grad{background:linear-gradient(90deg,#E4AA7C 0%,#F4AF56 55%,#F8D29C 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:600}
.h1{margin:18px 0 0;font-size:clamp(44px,6.4vw,96px);line-height:.98;font-weight:400;letter-spacing:-.04em}
.h2{margin:14px 0 0;font-size:clamp(30px,3.6vw,52px);line-height:1.06;font-weight:400;letter-spacing:-.025em;text-wrap:balance}
.lead{margin:22px 0 0;max-width:560px;font-size:clamp(16px,1.3vw,18px);line-height:1.65;color:#CDD7DD;text-wrap:pretty}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:0 30px;border:0;border-radius:64px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);color:#0A0908;font-weight:700;font-size:16px;cursor:pointer;text-decoration:none;box-shadow:0 14px 34px -12px rgba(244,175,86,.6);transition:transform .25s,box-shadow .25s,opacity .25s}
.btn:hover{transform:translateY(-1px);box-shadow:0 18px 44px -12px rgba(244,175,86,.75)}
.btn[disabled]{opacity:.6;cursor:progress;transform:none}
.field{display:flex;flex-direction:column;gap:8px}
.field label{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9CB1C2}
.input{width:100%;height:54px;padding:0 18px;border-radius:14px;border:1px solid rgba(254,251,241,.14);background:rgba(10,9,8,.55);color:#FEFBF1;font-size:16px;outline:none;transition:border-color .25s,box-shadow .25s}
.input::placeholder{color:#6f7a82}
html[dir=rtl] .input[dir=ltr]{text-align:right}
.input:focus{border-color:rgba(244,175,86,.7);box-shadow:0 0 0 4px rgba(244,175,86,.12)}
.msg{min-height:22px;margin:14px 0 0;font-size:14px;color:#F4AF56}
.msg.err{color:#F2A0A0}

/* gate: full-screen photo, viewfinder corners, glass card */
.gate{position:relative;min-height:100svh;margin-top:-80px;display:flex;align-items:center;justify-content:center;padding:120px 20px 60px;overflow:hidden}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.06);animation:bgin 2.4s cubic-bezier(.2,.7,.1,1) both}
@keyframes bgin{to{transform:none}}
.shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(10,9,8,.35),rgba(10,9,8,.85) 70%),linear-gradient(180deg,rgba(10,9,8,.6),rgba(10,9,8,.2) 40%,#0A0908)}
.vf span{position:absolute;width:26px;height:26px;border:solid rgba(254,251,241,.5)}
.vf span:nth-child(1){top:110px;left:44px;border-width:1px 0 0 1px}.vf span:nth-child(2){top:110px;right:44px;border-width:1px 1px 0 0}
.vf span:nth-child(3){bottom:44px;left:44px;border-width:0 0 1px 1px}.vf span:nth-child(4){bottom:44px;right:44px;border-width:0 1px 1px 0}
.glass{position:relative;width:100%;max-width:520px;padding:44px 40px 36px;border-radius:28px;background:linear-gradient(180deg,rgba(254,251,241,.08),rgba(254,251,241,.02));border:1px solid rgba(254,251,241,.12);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);box-shadow:0 60px 120px -40px rgba(0,0,0,.9),inset 0 1px 0 rgba(254,251,241,.1);text-align:center;animation:rise 1.2s cubic-bezier(.16,1,.3,1) .2s both}
.glass::before{content:"";position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(244,175,86,.7),transparent)}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.seal{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;color:#F4AF56;background:rgba(244,175,86,.1);box-shadow:inset 0 0 0 1px rgba(244,175,86,.35),0 0 40px rgba(244,175,86,.2)}
.glass .kick{margin-top:22px}
.glass .h2{font-size:clamp(30px,3.4vw,42px)}
.glass .lead{margin:16px auto 0;font-size:16px}
.gate form{display:flex;flex-direction:column;gap:12px;margin-top:30px;text-align:start}
.gate .btn{width:100%}
.shake{animation:shake .45s}
@keyframes shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}

/* after unlocking */
.in{display:none}
html.beta-open .gate{display:none}
html.beta-open .in{display:block}
.reveal{opacity:0;transform:translateY(28px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1);transition-delay:var(--d,0s)}
.reveal.on{opacity:1;transform:none}
.top{position:relative;margin-top:-80px;padding:200px 0 120px;overflow:hidden}
.top .bg{opacity:.45}
.top .shade{background:linear-gradient(180deg,rgba(10,9,8,.55),rgba(10,9,8,.75) 55%,#0A0908)}
.top .wrap{position:relative}
.badge{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:64px;background:rgba(244,175,86,.1);border:1px solid rgba(244,175,86,.4);color:#F4AF56;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.badge::before{content:"";width:7px;height:7px;border-radius:50%;background:#F4AF56;box-shadow:0 0 12px #F4AF56}
.sec{padding:110px 0}
.sec.alt{background:linear-gradient(180deg,#0A0908,#0f1f1c 30%,#0f1f1c 70%,#0A0908)}
.head{max-width:720px}
.gifts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:56px}
.gift{position:relative;display:flex;flex-direction:column;border-radius:26px;overflow:hidden;background:linear-gradient(180deg,rgba(254,251,241,.055),rgba(254,251,241,.015));border:1px solid rgba(254,251,241,.08);box-shadow:0 40px 80px -50px rgba(0,0,0,.9);transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s}
.gift:hover{transform:translateY(-6px);border-color:rgba(244,175,86,.35)}
.gift .ph{aspect-ratio:4/3;overflow:hidden}
.gift .ph img{width:100%;height:100%;object-fit:cover;object-position:50% 30%;transition:transform 1.2s cubic-bezier(.2,.7,.1,1)}
.gift:hover .ph img{transform:scale(1.05)}
.gift .cb{padding:26px 26px 30px}
.gift .tg{margin:0;font-size:11.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9CB1C2}
.gift .nm{margin:8px 0 0;font-size:28px;font-weight:400;letter-spacing:-.02em}
.gift ul{list-style:none;margin:20px 0 0;padding:18px 0 0;border-top:1px solid rgba(254,251,241,.08);display:flex;flex-direction:column;gap:12px}
.gift li{display:flex;gap:12px;align-items:flex-start;font-size:15px;line-height:1.5;color:#AEB9C1}
.gift li svg{flex:none;width:18px;height:18px;padding:4px;margin-top:1px;border-radius:50%;background:rgba(244,175,86,.12);box-shadow:inset 0 0 0 1px rgba(244,175,86,.3)}
.free{position:absolute;top:16px;inset-inline-end:16px;padding:6px 12px;border-radius:64px;background:rgba(10,9,8,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(244,175,86,.45);color:#F4AF56;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
.asks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin-top:56px;border-top:1px solid rgba(254,251,241,.08)}
.ask{display:grid;grid-template-columns:72px 1fr;gap:18px;padding:34px 28px 34px 0;border-bottom:1px solid rgba(254,251,241,.08)}
.ask:nth-child(odd){border-inline-end:1px solid rgba(254,251,241,.08)}
.ask:nth-child(even){padding-inline-start:36px}
.ask .n{font-size:15px;font-weight:700;color:#F4AF56;font-variant-numeric:tabular-nums;padding-top:6px}
.ask h3{margin:0;font-size:22px;font-weight:500;letter-spacing:-.01em}
.ask p{margin:10px 0 0;font-size:15.5px;line-height:1.6;color:#AEB9C1}
.ask .tag{color:#F4AF56;font-weight:600}
.join{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:64px;align-items:start}
.join .glass{max-width:none;text-align:start;animation:none;padding:40px}
.join form{display:flex;flex-direction:column;gap:18px}
.check{display:flex;gap:14px;align-items:flex-start;font-size:14.5px;line-height:1.55;color:#CDD7DD;cursor:pointer}
.check input{flex:none;width:20px;height:20px;margin:2px 0 0;accent-color:#F4AF56;cursor:pointer}
.join .btn{width:100%;margin-top:6px}
.steps{list-style:none;margin:30px 0 0;padding:0;display:flex;flex-direction:column;gap:18px}
.steps li{display:grid;grid-template-columns:36px 1fr;gap:14px;font-size:15.5px;line-height:1.55;color:#CDD7DD}
.steps .n{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(244,175,86,.45);color:#F4AF56;font-size:13px;font-weight:700}
.done{text-align:center;padding:20px 0 6px}
.done .seal{margin:0 auto}
.done h3{margin:22px 0 0;font-size:30px;font-weight:400;letter-spacing:-.02em}
.done p{margin:14px auto 0;max-width:420px;font-size:16px;line-height:1.6;color:#CDD7DD}
.done .btn{margin-top:26px;width:auto}
.foot{padding:56px 0 70px;border-top:1px solid rgba(254,251,241,.06);font-size:13px;color:#7E8A93;text-align:center}
html[lang=he] .kick,html[lang=he] .field label,html[lang=he] .gift .tg,html[lang=he] .badge,html[lang=he] .free{letter-spacing:.04em}
@media (max-width:980px){.gifts{grid-template-columns:minmax(0,1fr);max-width:520px}.join{grid-template-columns:minmax(0,1fr);gap:40px}.asks{grid-template-columns:minmax(0,1fr)}.ask:nth-child(odd){border-inline-end:0}.ask:nth-child(even){padding-inline-start:0}}
@media (max-width:600px){.wrap{padding:0 20px}.gate{margin-top:-64px}.vf span:nth-child(1),.vf span:nth-child(2){top:84px}.vf span:nth-child(1),.vf span:nth-child(3){left:16px}.vf span:nth-child(2),.vf span:nth-child(4){right:16px}.glass{padding:34px 22px 28px;border-radius:22px}.top{margin-top:-64px;padding:150px 0 80px}.sec{padding:80px 0}.ask{grid-template-columns:48px 1fr;padding-inline-end:0}.join .glass{padding:28px 20px}}
@media (prefers-reduced-motion:reduce){.bg,.glass{animation:none}.reveal{opacity:1;transform:none;transition:none}}
"""


def gift(tag, first, last, img, points):
    lis = "".join(f"<li>{CHECK}<span>{p}</span></li>" for p in points)
    return f"""<article class="gift reveal">
<div class="ph"><img src="{IMG}{img}" alt="" loading="lazy"></div>
<span class="free">Free for beta</span>
<div class="cb"><p class="tg">{tag}</p><h3 class="nm" data-no-i18n>{first} <span class="grad">{last}</span></h3><ul>{lis}</ul></div>
</article>"""


def ask(n, title, text):
    text = text.replace("@mw_phototours", '<span class="tag" data-no-i18n>@mw_phototours</span>')
    return f'<div class="ask reveal"><span class="n">{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>'


html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MWP Beta · Early access</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#0A0908">
<link rel="icon" href="{IMG}{LOGO}">
<style>
{CSS}
{NAV_CSS}
</style>
{FONTS}
</head>
<body>
<nav class="nav site-header" aria-label="Main">
<div class="wrap container">
<a class="brand" href="../" aria-label="MWP, home"><img src="{IMG}{LOGO}" alt=""><span>MWP</span></a>
<div class="navr"></div>
</div>
</nav>

<main id="main">
<section class="gate" aria-labelledby="gate-h">
<img class="bg" src="{IMG}{HERO}" alt="">
<div class="shade"></div>
<div class="vf" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<div class="glass">
<span class="seal">{LOCK}</span>
<p class="kick">MWP · Beta</p>
<h1 class="h2" id="gate-h">Early access, <span class="grad">by invitation.</span></h1>
<p class="lead">Enter the password from your invitation to open the beta.</p>
<form id="gate-form" novalidate>
<div class="field"><label for="gate-pw">Beta password</label><input class="input" id="gate-pw" name="password" type="password" autocomplete="off" required></div>
<button class="btn" type="submit">Enter the beta</button>
<p class="msg" id="gate-msg" role="status"></p>
</form>
</div>
</section>

<div class="in">
<section class="top">
<img class="bg" src="{IMG}{HERO}" alt="">
<div class="shade"></div>
<div class="wrap">
<span class="badge reveal">You're in</span>
<h1 class="h1 reveal" style="--d:.08s">The full MWP toolkit, <span class="grad">on us.</span></h1>
<p class="lead reveal" style="--d:.16s">As a beta member you get MWP Presets, MWP Panel and the Field Guides free, before launch. In return, show us what you make with them.</p>
<p class="reveal" style="--d:.24s;margin-top:34px"><a class="btn" href="#join">Join the beta</a></p>
</div>
</section>

<section class="sec">
<div class="wrap">
<div class="head reveal"><p class="kick">What you get</p><h2 class="h2">Everything we make. <span class="grad">Free.</span></h2></div>
<div class="gifts">{"".join(gift(*p) for p in PRODUCTS)}</div>
</div>
</section>

<section class="sec alt">
<div class="wrap">
<div class="head reveal"><p class="kick">What we ask</p><h2 class="h2">Use it. Share it. <span class="grad">Tag us.</span></h2></div>
<div class="asks">{"".join(ask(*a) for a in ASKS)}</div>
</div>
</section>

<section class="sec" id="join">
<div class="wrap join">
<div class="reveal">
<p class="kick">Join</p>
<h2 class="h2">Your tools, <span class="grad">in two minutes.</span></h2>
<ol class="steps">
<li><span class="n">1</span><span>Fill in your details and agree to the beta terms.</span></li>
<li><span class="n">2</span><span>Open the sign-in link we email you. My downloads opens with all three tools.</span></li>
<li><span class="n">3</span><span>In Photoshop, open MWP Panel and sign in with the same email.</span></li>
</ol>
</div>
<div class="glass reveal" style="--d:.1s">
<form id="join-form" novalidate>
<div class="field"><label for="j-name">Name</label><input class="input" id="j-name" name="name" autocomplete="name" required></div>
<div class="field"><label for="j-email">Email</label><input class="input" id="j-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
<div class="field"><label for="j-ig">Instagram</label><input class="input" id="j-ig" name="instagram" dir="ltr" placeholder="@yourhandle" autocomplete="off"></div>
<label class="check"><input type="checkbox" name="agree" required><span>I'll share content made with MWP and tag <b data-no-i18n>@mw_phototours</b>. I'll keep the files and my access to myself.</span></label>
<button class="btn" type="submit">Join the beta</button>
<p class="msg" id="join-msg" role="status"></p>
</form>
<div class="done" id="join-done" hidden>
<span class="seal"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
<h3>Check your inbox</h3>
<p id="done-text">We've sent you a sign-in link. Open it to download everything from My downloads.</p>
<a class="btn" href="../account.html">Go to My downloads</a>
</div>
</div>
</div>
</section>

<footer class="foot"><div class="wrap">MWP · by Matan Wild · Beta access is personal and can be removed if the terms aren't kept.</div></footer>
</div>
</main>

<script src="../assets/js/lib/nav.js" defer></script>
<script type="module" src="../assets/js/pages/beta.js"></script>
</body>
</html>
"""

os.makedirs("beta", exist_ok=True)
open("beta/index.html", "w", encoding="utf-8").write(html)
print("beta/index.html written", len(html))

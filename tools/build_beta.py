"""Builds beta/index.html: the MWP Ambassador Program page (shared by link, not indexed, no password).
Photographers read Matan's Ambassador Program terms, accept them and get MWP Presets, MWP Panel and the
Field Guides free. Joining (the `beta` Edge Function) adds them to monday.com (Shop Ambassadors) through
Make and emails them a link to My downloads. Panel works with their own email sign-in on up to 2 computers.
The terms text below is Matan's, word for word: change it only with his OK, and bump TERMS_VERSION in
supabase/functions/beta/index.ts when it changes. Same look as the home page (dark, gold, Google Sans / Heebo).
Run: python3 tools/build_beta.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from brand import NAV_CSS, FONTS

IMG = "../assets/pages/img/"
HERO = "5275cc7bcd4fb7560d8f7163592e3122.jpg"
LOGO = "2dd3356528167ddf9a64c0c7301c8aa3.png"
CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4AF56" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'

PRODUCTS = [
    ("Lightroom presets", "MWP", "Presets", "c88e041b857fb964607aaec43ad1753d.jpg", "45% 6%",
     ["50 Lightroom presets, 12 adaptive", "50 mobile files and 33 LUTs", "Install guide for every program"]),
    ("Photoshop plugin", "MWP", "Panel", "8f730b9bb76b93ca707cae719a309479.jpg", "50% 40%",
     ["8 one-click effects", "11 looks and 4 painted lights", "User manual and install guide"]),
    ("PDF field guides", "MWP", "Field Guides", "0cf44582c4078749d18156eec10c90d3.jpg", "62% 30%",
     ["4 PDF guides, 137 lessons", "Composition, colour, light and planning", "English and Hebrew"]),
]

ASKS = [
    ("01", "Create and share", "In your first 3 months: at least 3 posts and 1 reel a month, and 1 story a week. After that, tag us whenever you use the tools and love the results."),
    ("02", "Tag and disclose", "Tag @mw_phototours and Matan Wild, use our hashtags, and mark your posts as gifted. The terms explain how."),
    ("03", "Keep it personal", "Your licence is yours alone, on up to 2 computers. Don't share the files or your access."),
    ("04", "Tell us what you think", "Share honest feedback and report bugs as you find them. You'll have a direct line to our team and to Matan."),
]

# ---------------------------------------------------------------- Ambassador Program terms (Matan's text)
TERMS_DATE = "Oct 13, 2026"
TERMS_INTRO = [
    "The MWP Ambassador Program gives a small group of selected photographers free access to the MWP - PS Panel and the MWP - Signature Preset Pack. In return, we ask ambassadors to create with them, share their work, tell their audience about the experience, and send us feedback and bug reports that help us improve the tools. These terms explain what you get, what we ask, and how we both use the content.",
    "By accepting your access, you agree to these terms.",
]
TERMS = [
    ("Your free license", [
        ("p", 'MW Photo Tours ("MWP", "we") grants you a free, personal, non-exclusive, non-transferable, lifetime license to use:'),
        ("ul", ["MWP - PS Panel", "MWP - Signature Preset Pack", "All future updates to both, for life"]),
        ("p", "You may use them on your own photos, for personal and professional work, including paid client work. The license is for you only. It covers up to 2 devices."),
    ]),
    ("What we invite you to do", [
        ("p", "We want you to use the tools freely and show what they can do. You're welcome to:"),
        ("ul", ["Edit and publish your photos made with the panel and presets",
                "Share before/after comparisons and editing walkthroughs",
                "Post feed posts, reels, stories and carousels about your workflow",
                "Create Instagram collaborative posts with @mw_phototours",
                "Write about your honest experience: reviews, blog posts, newsletters, YouTube"]),
        ("p", "<strong>What we ask in return:</strong> during your first 3 months, at least 3 posts and 1 reel per month, plus at least 1 story per week, all tagging MWP as described in section 3. After that, for the rest of the year, simply tag and mention us whenever you use the tools and are happy with the results. These are minimums: if you love the results, we'd love to see you share more of everything. Your opinions are your own. We never ask for a positive review, only an honest one."),
    ]),
    ("Tagging and disclosure", [
        ("p", "When you publish work made with the panel or presets:"),
        ("ul", ["Tag @mw_phototours on Instagram and Matan Wild on Facebook, in the post and on the image",
                "Use #mwppanel #mwppresets #jointhewildsideofphotography",
                "Mention the panel or preset by name when you talk about your edit"]),
        ("p", "Because you received the tools for free, your audience must know that. Mark sponsored or gifted content clearly, using the platform's \"Paid partnership\" label or #ad / #gifted at the start of the caption. This is required by consumer-protection rules in Israel and most other countries, and it protects both of us."),
    ]),
    ("Your content and how we use it", [
        ("p", "Your photos, videos and texts remain yours. You keep full copyright."),
        ("p", "You give MWP a free, non-exclusive, worldwide license to reshare content you publish about the panel or presets, always with credit to you. This covers:"),
        ("ul", ["Reposting on MWP social media, stories and highlights",
                "Showing it on the MWP website, product pages and newsletter",
                "Quoting short parts of your written reviews"]),
        ("p", "For paid ads or printed materials, we will ask you first and get your written OK. You can ask us to stop using a specific piece at any time; we'll remove it from new uses within 14 days."),
    ]),
    ("Feedback and your direct line", [
        ("p", "Feedback is a core part of the program. Ambassadors help us find issues, fix them and shape what comes next. As an ambassador, you commit to:"),
        ("ul", ["Share honest feedback on the panel and presets: what works, what's missing, what you'd change",
                "Report bugs and glitches to our team as soon as you hit them, with a screenshot and your version and setup, so we can run fixes quickly",
                "Try new updates and tell us what you think"]),
        ("p", "In return, you'll be in regular contact with our team through Emilya, and you'll have a direct line to Matan. MWP may use your feedback and suggestions to improve its tools, with no payment owed."),
    ]),
    ("What's not allowed", [
        ("ul", ["Sharing, selling, giving away or uploading the panel or preset files, or your access, to anyone",
                "Copying, modifying or repackaging the presets as your own product",
                "Reverse-engineering the panel",
                "Claiming the presets are your own creation",
                "Using MWP's name or logo outside posts about your experience, or in a way that suggests you speak for MWP",
                "Publishing content that is offensive, misleading, or harms wildlife or nature for a photo"]),
        ("p", "If you're unsure whether something is OK, just ask us first."),
    ]),
    ("Duration and ending the program", [
        ("p", "The ambassadorship runs for 12 months from the day you accept, and can be renewed by mutual agreement."),
        ("p", "Either side can end it at any time with written notice (email or WhatsApp is enough). MWP may end it immediately if these terms are broken."),
        ("p", "When it ends:"),
        ("ul", ["Your license to the panel and presets stays with you for life, including future updates, unless the program ended because of a breach of section 6",
                "Content you already published can stay up",
                "MWP may keep content it already reshared, but won't start new uses"]),
    ]),
    ("General", [
        ("ul", ["<strong>No payment, no employment.</strong> The free license is the full benefit. You're an independent creator, not an MWP employee, agent or partner.",
                "<strong>As is.</strong> The panel and presets are provided as is. MWP isn't liable for lost files, edits or software issues; please keep backups.",
                "<strong>Changes.</strong> We may update these terms. We'll let you know, and continuing in the program means you accept the update.",
                '<strong>Contact.</strong> Day-to-day contact is with Emilya from our team, and you have a direct line to Matan. General address: <a href="mailto:contact@matanwildphotography.com">contact@matanwildphotography.com</a>.']),
    ]),
]


import re as _re

# Small line icons for the eight chapters, in order.
T_ICONS = [
    '<path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6z"/><path d="M9 12l2 2 4-4"/>',            # licence
    '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',                              # create
    '<path d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16"/>',                                                     # tags
    '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="m4 16 5-5 4 4 3-3 4 4"/><circle cx="15.5" cy="9" r="1.4"/>',  # content
    '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',                                             # feedback
    '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',                                            # not allowed
    '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',                # duration
    '<path d="M12 4v16M5 8h14M7 8l-3 7h6zM17 8l-3 7h6z"/>',                                                # general
]
SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
TICK = '<svg class="mk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
CROSS = '<svg class="mk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
COPY = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>'


def chips(html):
    """The handle and hashtags become tap-to-copy chips (the words themselves stay exactly as written)."""
    return _re.sub(r"(@mw_phototours|#mwppanel|#mwppresets|#jointhewildsideofphotography)",
                   lambda m: f'<button type="button" class="cp" data-copy="{m.group(1)}" title="Copy">{m.group(1)}{COPY}</button>', html)


def terms_block(kind, body, chapter):
    if kind == "ul":
        cls, mark = {2: ("ok", TICK), 6: ("no", CROSS)}.get(chapter, ("", ""))
        return f'<ul class="{cls}">' + "".join(f"<li>{mark}<span>{chips(i)}</span></li>" for i in body) + "</ul>"
    return f"<p>{chips(body)}</p>"


T_NAV = "".join(
    f'<a href="#t{i}" data-t="{i}"><span class="dot"><b>{i}</b>{TICK}</span><span class="tt">{title}</span></a>'
    for i, (title, _) in enumerate(TERMS, 1))

T_SECTIONS = "".join(
    f'<article class="t-sec" id="t{i}" data-t="{i}"><header><span class="ic">{SVG.format(T_ICONS[i - 1])}</span>'
    f'<span class="num">{i:02d}</span><h3>{title}</h3></header>'
    f'<div class="tb">{"".join(terms_block(k, body, i) for k, body in blocks)}</div></article>'
    for i, (title, blocks) in enumerate(TERMS, 1))

# The terms at a glance: each fact jumps to the chapter it comes from.
FACTS = [
    ("Lifetime", "licence, with every future update", 1),
    ("2", "devices, for you only", 1),
    ("3 + 1", "posts and a reel a month, first 3 months", 2),
    ("1", "story a week, first 3 months", 2),
    ("100%", "your copyright, always", 4),
    ("12", "months, renewable", 7),
]
FACTS_HTML = "".join(
    f'<a class="fact reveal" style="--d:{n * .05:.2f}s" href="#t{t}"><b>{v}</b><span>{label}</span></a>'
    for n, (v, label, t) in enumerate(FACTS))


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

.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.06);animation:bgin 2.4s cubic-bezier(.2,.7,.1,1) both}
@keyframes bgin{to{transform:none}}
.shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(10,9,8,.35),rgba(10,9,8,.85) 70%),linear-gradient(180deg,rgba(10,9,8,.6),rgba(10,9,8,.2) 40%,#0A0908)}
.glass{position:relative;width:100%;max-width:520px;padding:44px 40px 36px;border-radius:28px;background:linear-gradient(180deg,rgba(254,251,241,.08),rgba(254,251,241,.02));border:1px solid rgba(254,251,241,.12);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);box-shadow:0 60px 120px -40px rgba(0,0,0,.9),inset 0 1px 0 rgba(254,251,241,.1);text-align:center;animation:rise 1.2s cubic-bezier(.16,1,.3,1) .2s both}
.glass::before{content:"";position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(244,175,86,.7),transparent)}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.seal{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;color:#F4AF56;background:rgba(244,175,86,.1);box-shadow:inset 0 0 0 1px rgba(244,175,86,.35),0 0 40px rgba(244,175,86,.2)}

/* after unlocking */
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
.gift .ph img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s cubic-bezier(.2,.7,.1,1)}
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
.facts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin-top:44px}
.fact{display:flex;flex-direction:column;gap:6px;padding:20px 18px;border-radius:20px;text-decoration:none;background:linear-gradient(180deg,rgba(254,251,241,.06),rgba(254,251,241,.015));border:1px solid rgba(254,251,241,.09);transition:transform .45s cubic-bezier(.2,.8,.2,1),border-color .3s,background .3s}
.fact:hover{transform:translateY(-4px);border-color:rgba(244,175,86,.45);background:linear-gradient(180deg,rgba(244,175,86,.1),rgba(254,251,241,.02))}
.fact b{font-size:28px;font-weight:500;letter-spacing:-.02em;background:linear-gradient(90deg,#E4AA7C,#F4AF56 55%,#F8D29C);-webkit-background-clip:text;background-clip:text;color:transparent}
.fact span{font-size:13px;line-height:1.45;color:#9CB1C2}
.t-layout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:56px;align-items:start;margin-top:64px}
.t-nav{position:sticky;top:100px;display:flex;flex-direction:column;gap:4px}
.t-nav .prog{margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9CB1C2}
.t-nav .bar{height:3px;border-radius:3px;background:rgba(254,251,241,.08);overflow:hidden;margin:-4px 0 18px}
.t-nav .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#E4AA7C,#F4AF56);box-shadow:0 0 12px rgba(244,175,86,.6);transition:width .6s cubic-bezier(.2,.8,.2,1)}
.t-nav a{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.35;color:#7E8A93;text-decoration:none;transition:color .25s,background .25s}
.t-nav a:hover{color:#FEFBF1;background:rgba(254,251,241,.04)}
.t-nav a.on{color:#FEFBF1;background:rgba(244,175,86,.08)}
.t-nav .dot{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;border:1px solid rgba(254,251,241,.16);font-size:11.5px;font-weight:700;color:inherit;transition:all .35s}
.t-nav .dot .mk{position:absolute;opacity:0;transform:scale(.4);transition:all .35s cubic-bezier(.2,.8,.2,1)}
.t-nav a.on .dot{border-color:#F4AF56;color:#F4AF56}
.t-nav a.read .dot{background:linear-gradient(135deg,#E4AA7C,#F4AF56);border-color:transparent;color:#0A0908}
.t-nav a.read .dot b{opacity:0}
.t-nav a.read .dot .mk{opacity:1;transform:none}
.t-nav .go{margin-top:18px;align-self:flex-start}
.t-nav a.btn{min-height:48px;padding:0 26px;border-radius:64px;color:#0A0908;font-size:15px;font-weight:700;background:linear-gradient(90deg,#E4AA7C,#F4AF56)}
.t-nav a.btn:hover{color:#0A0908;background:linear-gradient(90deg,#E4AA7C,#F4AF56)}
.t-doc{min-width:0}
.t-by{margin:0;font-size:13px;color:#7E8A93;letter-spacing:.04em}
.t-intro{position:relative;padding:34px 36px;border-radius:26px;background:radial-gradient(120% 140% at 0% 0%,rgba(244,175,86,.12),transparent 55%),linear-gradient(180deg,rgba(254,251,241,.06),rgba(254,251,241,.015));border:1px solid rgba(244,175,86,.22)}
.t-intro p{margin:14px 0 0;font-size:17px;line-height:1.72;color:#E3E9EC}
.t-intro p.agree{display:inline-flex;align-items:center;gap:10px;margin-top:20px;padding:8px 16px;border-radius:64px;background:rgba(244,175,86,.1);border:1px solid rgba(244,175,86,.35);color:#F4AF56;font-size:14.5px;font-weight:600}
.t-sec{margin-top:18px;padding:30px 34px 32px;border-radius:24px;background:linear-gradient(180deg,rgba(254,251,241,.045),rgba(254,251,241,.012));border:1px solid rgba(254,251,241,.08);scroll-margin-top:96px;transition:border-color .5s,box-shadow .5s,transform .5s}
.t-sec.on{border-color:rgba(244,175,86,.32);box-shadow:0 30px 70px -40px rgba(244,175,86,.25)}
.t-sec header{display:flex;align-items:center;gap:14px}
.t-sec .ic{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;color:#F4AF56;background:rgba(244,175,86,.1);box-shadow:inset 0 0 0 1px rgba(244,175,86,.28)}
.t-sec .num{font-size:13px;font-weight:700;color:#F4AF56;font-variant-numeric:tabular-nums;letter-spacing:.08em}
.t-sec h3{margin:0;font-size:23px;font-weight:500;letter-spacing:-.015em}
.t-sec .tb{padding-left:58px}
.t-sec p{margin:14px 0 0;font-size:16px;line-height:1.72;color:#AEB9C1}
.t-sec strong{color:#FEFBF1;font-weight:600}
.t-sec a{color:#F4AF56}
.t-sec ul{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}
.t-sec li{position:relative;display:flex;gap:12px;align-items:flex-start;font-size:16px;line-height:1.6;color:#CDD7DD}
.t-sec ul:not(.ok):not(.no) li::before{content:"";flex:none;width:6px;height:6px;margin:.6em 6px 0 4px;border-radius:50%;background:#F4AF56;box-shadow:0 0 10px rgba(244,175,86,.5)}
.t-sec li .mk{flex:none;width:22px;height:22px;padding:4px;margin-top:1px;border-radius:50%}
.t-sec ul.ok li .mk{color:#F4AF56;background:rgba(244,175,86,.12);box-shadow:inset 0 0 0 1px rgba(244,175,86,.3)}
.t-sec ul.no li .mk{color:#F2A0A0;background:rgba(242,160,160,.1);box-shadow:inset 0 0 0 1px rgba(242,160,160,.3)}
.cp{display:inline-flex;align-items:center;gap:6px;margin:2px 1px;padding:2px 10px;border-radius:64px;border:1px solid rgba(244,175,86,.4);background:rgba(244,175,86,.08);color:#F4AF56;font:inherit;font-size:.92em;font-weight:600;cursor:pointer;vertical-align:baseline;transition:background .25s,transform .2s}
.cp:hover{background:rgba(244,175,86,.18)}
.cp:active{transform:scale(.96)}
.cp svg{opacity:.7}
.cp.done{background:#F4AF56;color:#0A0908}
.copied{position:fixed;left:50%;bottom:28px;z-index:60;transform:translate(-50%,20px);opacity:0;padding:10px 18px;border-radius:64px;background:#FEFBF1;color:#0A0908;font-size:14px;font-weight:600;pointer-events:none;transition:all .35s cubic-bezier(.2,.8,.2,1)}
.copied.show{opacity:1;transform:translate(-50%,0)}
.accept{padding-top:40px}
.acc{max-width:640px;margin:0 auto;scroll-margin-top:96px;padding:48px 48px 44px;text-align:center}
.acc .kick{margin-top:20px}
.acc .h2{font-size:clamp(30px,3.4vw,44px)}
.acc .lead{margin:16px auto 0;font-size:16.5px}
.acc-actions{display:flex;flex-direction:column;align-items:center;gap:18px;margin-top:32px}
.acc-actions .btn{min-width:min(100%,340px)}
.acc-step{animation:stepin .7s cubic-bezier(.16,1,.3,1) both}
@keyframes stepin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
#step-details .kick{margin-top:0}
#join-form{display:flex;flex-direction:column;gap:18px;margin-top:30px;text-align:start}
#join-form .btn{width:100%;margin-top:4px}
.acc-ok{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#F4AF56}
.acc-ok::before{content:"";width:8px;height:8px;border-radius:50%;background:#F4AF56;box-shadow:0 0 10px #F4AF56}
.meta-note{font-size:14.5px!important;color:#9CB1C2!important}
.acc-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:4px}
.acc-head .kick{margin:0}
.acc-date{font-size:13px;color:#9CB1C2}
.sig{position:relative;padding:18px 18px 16px;border-radius:16px;border:1px dashed rgba(254,251,241,.18);background:rgba(10,9,8,.35);transition:border-color .4s,background .4s}
.sig-l{display:block;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#7E8A93}
.sig-name{position:relative;display:inline-block;margin-top:8px;font-size:26px;font-style:italic;font-weight:300;letter-spacing:-.01em;color:#6f7a82;transition:color .3s}
.sig-name::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;border-radius:2px;background:linear-gradient(90deg,#E4AA7C,#F4AF56);transform:scaleX(0);transform-origin:left;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
html[dir=rtl] .sig-name::after{transform-origin:right}
.sig.typed .sig-name{color:#FEFBF1}
.sig-meta{display:block;margin-top:10px;font-size:13px;color:#9CB1C2;min-height:18px}
.sig .stamp{position:absolute;top:14px;inset-inline-end:14px;padding:5px 11px;border-radius:64px;border:1px solid rgba(244,175,86,.6);color:#F4AF56;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;opacity:0;transform:rotate(-8deg) scale(1.4);transition:all .45s cubic-bezier(.2,.8,.2,1)}
.sig.signed{border-style:solid;border-color:rgba(244,175,86,.45);background:rgba(244,175,86,.05)}
.sig.signed .sig-name::after{transform:scaleX(1)}
.sig.signed .stamp{opacity:1;transform:rotate(-8deg) scale(1)}
@media (max-width:1100px){.facts{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:900px){
 .t-layout{grid-template-columns:minmax(0,1fr);gap:20px;margin-top:40px}
 .t-nav{top:64px;z-index:5;flex-direction:row;gap:6px;overflow-x:auto;margin:0 -20px;padding:12px 20px;background:rgba(10,9,8,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(254,251,241,.06);scrollbar-width:none}
 .t-nav::-webkit-scrollbar{display:none}
 .t-nav .prog,.t-nav .bar,.t-nav .go{display:none}
 .t-nav a{flex:none;padding:6px 12px 6px 6px;border:1px solid rgba(254,251,241,.1);border-radius:64px;font-size:13px;white-space:nowrap}
 .t-nav a .tt{max-width:150px;overflow:hidden;text-overflow:ellipsis}
}
@media (max-width:600px){.facts{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.fact{padding:16px 14px}.fact b{font-size:24px}.t-intro{padding:24px 20px}.t-intro p{font-size:16px}.t-sec{padding:22px 18px 24px;border-radius:20px}.t-sec .tb{padding-left:0}.t-sec h3{font-size:20px}.t-sec .ic{width:38px;height:38px;border-radius:12px}}
.he-note{display:none;margin:16px 0 0;font-size:15px;color:#9CB1C2}
html[lang=he] .he-note{display:block}
.link-gold{color:#F4AF56;text-decoration:underline;text-decoration-color:rgba(244,175,86,.4);text-underline-offset:3px}
.link-gold:hover{text-decoration-color:#F4AF56}
.foot{padding:56px 0 70px;border-top:1px solid rgba(254,251,241,.06);font-size:13px;color:#7E8A93;text-align:center}
html[lang=he] .kick,html[lang=he] .field label,html[lang=he] .gift .tg,html[lang=he] .badge,html[lang=he] .free{letter-spacing:.04em}
@media (max-width:980px){.gifts{grid-template-columns:minmax(0,1fr);max-width:520px}.join{grid-template-columns:minmax(0,1fr);gap:40px}.asks{grid-template-columns:minmax(0,1fr)}.ask:nth-child(odd){border-inline-end:0}.ask:nth-child(even){padding-inline-start:0}}
@media (max-width:600px){.wrap{padding:0 20px}.glass{padding:34px 22px 28px;border-radius:22px}.top{margin-top:-64px;padding:150px 0 80px}.sec{padding:80px 0}.ask{grid-template-columns:48px 1fr;padding-inline-end:0}.acc{padding:34px 22px 30px}}
@media (prefers-reduced-motion:reduce){.bg,.glass{animation:none}.reveal{opacity:1;transform:none;transition:none}}
"""


def gift(tag, first, last, img, pos, points):
    lis = "".join(f"<li>{CHECK}<span>{p}</span></li>" for p in points)
    return f"""<article class="gift reveal">
<div class="ph"><img src="{IMG}{img}" alt="" loading="lazy" style="object-position:{pos}"></div>
<span class="free">Free for ambassadors</span>
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
<title>MWP Ambassador Program</title>
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
<div class="in">
<section class="top">
<img class="bg" src="{IMG}{HERO}" alt="">
<div class="shade"></div>
<div class="wrap">
<span class="badge reveal">MWP Ambassador Program</span>
<h1 class="h1 reveal" style="--d:.08s">Create with MWP. <span class="grad">On us.</span></h1>
<p class="lead reveal" style="--d:.16s">A small group of selected photographers gets MWP Presets, MWP Panel and the Field Guides free. In return, create with them, share your work and tell us what you think.</p>
<p class="reveal" style="--d:.24s;margin-top:34px"><a class="btn" href="#terms">Read the terms</a></p>
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

<section class="sec" id="terms">
<div class="wrap">
<div class="head reveal"><p class="kick">The terms</p><h2 class="h2">Ambassador Program <span class="grad">Terms of Use.</span></h2>
<p class="he-note" lang="he" dir="rtl" data-no-i18n>התנאים זמינים כרגע באנגלית.</p></div>
<div class="facts">{FACTS_HTML}</div>
<div class="t-layout" lang="en" dir="ltr">
<nav class="t-nav" aria-label="Chapters" data-no-i18n>
<p class="prog" id="t-prog">0 of {len(TERMS)} read</p>
<div class="bar"><i id="t-bar"></i></div>
{T_NAV}
<a class="btn go" href="#join">Accept and join</a>
</nav>
<div class="t-doc" data-no-i18n>
<div class="t-intro reveal">
<p class="t-by">{TERMS_DATE} · @Matan Wild</p>
<p>{TERMS_INTRO[0]}</p>
<p class="agree">{TERMS_INTRO[1]}</p>
</div>
{T_SECTIONS}
</div>
</div>
</div>
</section>

<section class="sec accept" id="join">
<div class="wrap">
<div class="acc glass reveal" id="acc">
<div class="acc-step" id="step-agree">
<span class="seal"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6z"/><path d="M9 12l2 2 4-4"/></svg></span>
<p class="kick">Step 1 of 2 · Acceptance</p>
<h2 class="h2">Do you accept <span class="grad">the terms?</span></h2>
<p class="lead">To join, accept the MWP Ambassador Program Terms of Use above. Then you'll fill in your details and get your tools.</p>
<div class="acc-actions">
<button class="btn" type="button" id="agree-btn">I've read and accept the terms</button>
<a class="link-gold" href="#terms">Read the terms</a>
</div>
</div>
<div class="acc-step" id="step-details" hidden>
<p class="kick">Step 2 of 2 · Your details</p>
<h2 class="h2">You're <span class="grad">in.</span></h2>
<p class="lead">Tell us who you are. We'll email you a link to download your tools.</p>
<form id="join-form" novalidate>
<div class="acc-head"><span class="acc-ok">Terms accepted</span><span class="acc-date" id="acc-date"></span></div>
<div class="field"><label for="j-name">Name</label><input class="input" id="j-name" name="name" autocomplete="name" required></div>
<div class="field"><label for="j-email">Email</label><input class="input" id="j-email" name="email" type="email" dir="ltr" autocomplete="email" required></div>
<div class="field"><label for="j-ig">Instagram</label><input class="input" id="j-ig" name="instagram" dir="ltr" placeholder="@yourhandle" autocomplete="off"></div>
<div class="sig signed" id="sig" aria-live="polite"><span class="stamp">I agree</span><span class="sig-l">Signature</span><span class="sig-name" id="sig-name">Your name</span><span class="sig-meta" id="sig-meta"></span></div>
<button class="btn" type="submit">Get my tools</button>
<p class="msg" id="join-msg" role="status"></p>
</form>
</div>
<div class="done" id="join-done" hidden>
<span class="seal"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
<h3>Check your inbox</h3>
<p id="done-text">We've sent you a link. Open it to download your tools.</p>
<p class="meta-note">Then, in Photoshop, open MWP Panel and sign in with the same email.</p>
<a class="btn" href="/account.html">Go to My downloads</a>
</div>
</div>
</div>
</section>

<footer class="foot"><div class="wrap">MWP · by Matan Wild · Ambassador access is personal.</div></footer>
</div>
</main>

<script src="../assets/js/lib/nav.js" defer></script>
<script type="module" src="../assets/js/pages/beta.js"></script>
</body>
</html>
"""

os.makedirs("beta", exist_ok=True)
open("beta/index.html", "w", encoding="utf-8").write(html)
# Safety net: anything that lands on /beta/account.html (an old link, a relative redirect) goes to the
# real My downloads page, keeping the sign-in details in the address.
open("beta/account.html", "w", encoding="utf-8").write("""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>My downloads · MWP</title>
<script>location.replace("/account.html" + location.search + location.hash);</script></head>
<body style="background:#0A0908"><a href="/account.html" style="color:#F4AF56">Go to My downloads</a></body></html>
""")
print("beta/index.html written", len(html))

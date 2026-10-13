"""MWP Ambassador Program terms: Matan's text, shared by the page (tools/build_beta.py) and the signed-terms
PDF (tools/personalize/terms_pdf.py), so the PDF always matches what the person accepted.
Change the wording only with Matan's OK, and when you do, bump TERMS_VERSION here AND in
supabase/functions/beta/index.ts (each acceptance records the version).
Blocks: ("p", html) a paragraph, ("ul", [html, ...]) a list. Only <strong> and <a> tags are used."""

TERMS_VERSION = "2026-10-13.2"   # .2: the Field Guides are included; Facebook page is MW Photo Tours

TERMS_DATE = "Oct 13, 2026"
TERMS_INTRO = [
    "The MWP Ambassador Program gives a small group of selected photographers free access to the MWP - PS Panel, the MWP - Signature Preset Pack and the MWP Field Guides. In return, we ask ambassadors to create with them, share their work, tell their audience about the experience, and send us feedback and bug reports that help us improve the tools. These terms explain what you get, what we ask, and how we both use the content.",
    "By accepting your access, you agree to these terms.",
]
TERMS = [
    ("Your free license", [
        ("p", 'MW Photo Tours ("MWP", "we") grants you a free, personal, non-exclusive, non-transferable, lifetime license to use:'),
        ("ul", ["MWP - PS Panel", "MWP - Signature Preset Pack", "MWP Field Guides", "All future updates to all three, for life"]),
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
        ("ul", ["Tag @mw_phototours on Instagram and MW Photo Tours on Facebook, in the post and on the image",
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
        ("ul", ["Sharing, selling, giving away or uploading the panel, preset or guide files, or your access, to anyone",
                "Copying, modifying or repackaging the presets or guides as your own product",
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
        ("ul", ["Your license to the panel, presets and guides stays with you for life, including future updates, unless the program ended because of a breach of section 6",
                "Content you already published can stay up",
                "MWP may keep content it already reshared, but won't start new uses"]),
    ]),
    ("General", [
        ("ul", ["<strong>No payment, no employment.</strong> The free license is the full benefit. You're an independent creator, not an MWP employee, agent or partner.",
                "<strong>As is.</strong> The panel, presets and guides are provided as is. MWP isn't liable for lost files, edits or software issues; please keep backups.",
                "<strong>Changes.</strong> We may update these terms. We'll let you know, and continuing in the program means you accept the update.",
                '<strong>Contact.</strong> Day-to-day contact is with Emilya from our team, and you have a direct line to Matan. General address: <a href="mailto:contact@matanwildphotography.com">contact@matanwildphotography.com</a>.']),
    ]),
]



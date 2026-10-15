// Every kind of problem the checks can report, in plain English:
// what it is, why it matters, and how to fix it. Severity can be overridden per finding.
export const SEVERITIES = ["Critical", "High", "Medium", "Low"];

export const CATEGORIES = {
  errors: "Bugs and errors",
  devices: "Phones, tablets and browsers",
  flows: "Things visitors do",
  accessibility: "Accessibility",
  seo: "Search engines and sharing",
  security: "Security",
  performance: "Speed",
};

export const RULES = {
  // ── Bugs and errors ─────────────────────────────────────────────
  "js-crash": {
    category: "errors", severity: "High", title: "The page's code crashes",
    why: "When a script crashes, whatever it was meant to do (a button, a menu, the cart, prices) silently stops working for that visitor. They usually don't report it; they just leave.",
    fix: "Open the page, press F12, and look in the Console tab for the red error. The message and file name show which script and line failed.",
  },
  "console-error": {
    category: "errors", severity: "Medium", title: "The browser reports an error",
    why: "Errors in the browser console often mean something on the page didn't load or run as intended, even if the page looks fine at first glance.",
    fix: "Open the page, press F12 and read the Console tab. Fix the cause, or remove the code that triggers it if it's left over.",
  },
  "request-failed": {
    category: "errors", severity: "High", title: "A file or server request failed",
    why: "The page asked for something (a script, style, image, font, or data from the server) and didn't get it. Missing scripts and styles break the page; missing data shows empty or wrong content.",
    fix: "Check the address listed. If the file moved or was renamed, update the link; if it's a server call, check the server function is deployed and working.",
  },
  "broken-link": {
    category: "errors", severity: "High", title: "A link leads nowhere",
    why: "Visitors who click it land on an error page. Broken links also make search engines trust the site less.",
    fix: "Update the link to the right address, or remove it.",
  },
  "visible-placeholder": {
    category: "errors", severity: "High", title: "Visitors can see unfinished text",
    why: "Notes meant for the team, filler text or template fields look unprofessional and make visitors doubt the shop is real or finished.",
    fix: "Replace the text (or the image or price it refers to) with the final version, then check the page again.",
  },
  "broken-image": {
    category: "errors", severity: "Medium", title: "An image doesn't show",
    why: "Visitors see an empty box or a broken-image icon, which looks unfinished and can hide important content.",
    fix: "Check the image path and file name (they're case-sensitive online), and that the file is included in what gets published.",
  },

  // ── Phones, tablets and browsers ────────────────────────────────
  "horizontal-scroll": {
    category: "devices", severity: "Medium", title: "The page is wider than the screen",
    why: "On this screen size, visitors can drag the page sideways and part of it is cut off. It feels broken on phones and makes text hard to read.",
    fix: "Find the element listed (it's the widest one) and stop it overflowing: usually a fixed width, a long unbroken word or link, or an image without max-width: 100%.",
  },
  "viewport-missing": {
    category: "devices", severity: "High", title: "The page isn't set up for phones",
    why: "Without the viewport setting, phones show a shrunken desktop version that visitors have to pinch and zoom.",
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.',
  },
  "wrong-direction": {
    category: "devices", severity: "High", title: "The page is in the wrong reading direction",
    why: "A right-to-left language shown left-to-right (or the reverse) scrambles punctuation, numbers and layout for those readers.",
    fix: "Make sure the language switch sets dir on the <html> element for this page.",
  },

  // ── Things visitors do ──────────────────────────────────────────
  "flow-failed": {
    category: "flows", severity: "High", title: "Something a visitor does doesn't work",
    why: "This is one of the site's key actions. If it fails here, it fails for real visitors too.",
    fix: "Follow the same steps yourself on the device listed. The step that failed is shown; the screenshot shows what the page looked like at that moment.",
  },

  // ── Accessibility (from axe-core) ───────────────────────────────
  "a11y": {
    category: "accessibility", severity: "Medium", title: "Accessibility barrier",
    why: "Some visitors can't use this part of the page: people using screen readers, keyboard only, zoom, or with low vision or colour blindness. Accessibility is also a legal requirement in many countries, including Israel's accessibility regulations for websites.",
    fix: "See the specific rule below; each one links to a guide with the exact fix.",
  },

  // ── Search engines and sharing ──────────────────────────────────
  "robots-blocks-all": {
    category: "seo", severity: "High", title: "Search engines are told to stay away from the whole site",
    why: "robots.txt tells Google and others not to read any page, so the site won't appear in search results at all.",
    fix: "If the site is launched, replace robots.txt with the launch version (block only private pages, and point to the sitemap).",
  },
  "title-missing": {
    category: "seo", severity: "Medium", title: "The page has no title",
    why: "The title is the blue headline in Google results and the name on the browser tab. Without it, the page looks unfinished in search and when bookmarked.",
    fix: "Add a short, specific <title> to the page (about 30–60 characters).",
  },
  "title-length": {
    category: "seo", severity: "Low", title: "The page title is too short or too long",
    why: "Google cuts titles over about 60 characters, and very short titles don't say enough to earn the click.",
    fix: "Aim for 30–60 characters that say what the page is and who it's from.",
  },
  "title-duplicate": {
    category: "seo", severity: "Low", title: "Several pages share the same title",
    why: "Search engines and visitors can't tell these pages apart in results or browser tabs.",
    fix: "Give each page its own title.",
  },
  "description-missing": {
    category: "seo", severity: "Medium", title: "The page has no search description",
    why: "The description is the grey text under the title in Google. Without one, Google picks random text from the page, which usually sells it badly.",
    fix: 'Add <meta name="description" content="…"> with one or two sentences (about 70–160 characters).',
  },
  "h1-missing": {
    category: "seo", severity: "Low", title: "The page has no main heading",
    why: "The main heading (<h1>) tells search engines and screen-reader users what the page is about.",
    fix: "Make the page's main headline an <h1>.",
  },
  "h1-multiple": {
    category: "seo", severity: "Low", title: "The page has several main headings",
    why: "More than one <h1> makes it less clear what the page is mainly about.",
    fix: "Keep one <h1> and make the others <h2>.",
  },
  "lang-missing": {
    category: "seo", severity: "Medium", title: "The page doesn't say what language it's in",
    why: "Screen readers read it with the wrong accent and search engines may show it to the wrong audience.",
    fix: 'Add lang="en" (or "he", etc.) to the <html> tag.',
  },
  "canonical-missing": {
    category: "seo", severity: "Low", title: "The page doesn't name its main address",
    why: "Pages reachable at several addresses (with and without .html, with tracking codes) can be counted as duplicates by search engines.",
    fix: 'Add <link rel="canonical" href="https://…/page/"> with the page\'s preferred address.',
  },
  "social-preview-missing": {
    category: "seo", severity: "Low", title: "Links to this page share without a preview",
    why: "When someone shares the page on WhatsApp, Facebook or LinkedIn, it appears as a bare link instead of a card with an image and title.",
    fix: "Add Open Graph tags: og:title, og:description, og:image (1200×630) and og:url.",
  },
  "private-page-indexable": {
    category: "seo", severity: "Low", title: "A private page can appear in Google",
    why: "Pages like accounts, admin or link-only programs aren't meant to be found by searching.",
    fix: 'Add <meta name="robots" content="noindex"> to the page and list it as Disallow in robots.txt.',
  },

  // ── Security ────────────────────────────────────────────────────
  "secret-exposed": {
    category: "security", severity: "Critical", title: "A secret key is published on the website",
    why: "Anyone can view the site's files and copy this key. Depending on the key, it can give full access to the database, send emails or charge money in your name.",
    fix: "Revoke the key at the service that issued it NOW and create a new one, then keep it only in GitHub Secrets / server settings, never in site files.",
  },
  "mixed-content": {
    category: "security", severity: "High", title: "The secure page loads something insecurely",
    why: "Loading anything over http:// on an https:// page lets someone on the same Wi-Fi tamper with it. Browsers block or warn about it.",
    fix: "Change the address to https://.",
  },
  "insecure-form": {
    category: "security", severity: "High", title: "A form sends its data without encryption",
    why: "Whatever is typed into it can be read by anyone on the network.",
    fix: "Make the form's action an https:// address.",
  },
  "header-hsts": {
    category: "security", severity: "Medium", title: "Browsers aren't told to always use the secure address",
    why: "Without HSTS, a visitor's very first request can be sent unencrypted and redirected by an attacker on public Wi-Fi.",
    fix: "Send the Strict-Transport-Security header (max-age of at least six months). Most hosts have a switch for this.",
  },
  "header-csp": {
    category: "security", severity: "Medium", title: "No Content Security Policy",
    why: "A CSP is a whitelist of where scripts may come from. If any bug ever lets someone inject a script, the CSP stops it from running. It's the main safety net against account-stealing attacks.",
    fix: "Add a Content-Security-Policy header, or a <meta http-equiv=\"Content-Security-Policy\"> tag when the host can't set headers. Start in report-only mode and tighten it.",
  },
  "header-frame": {
    category: "security", severity: "Medium", title: "Other sites can embed this page invisibly",
    why: "An attacker can load the page inside an invisible frame on their own site and trick visitors into clicking buttons (\"clickjacking\").",
    fix: "Send X-Frame-Options: DENY or a CSP with frame-ancestors 'none'. (This one can't be set with a <meta> tag.)",
  },
  "header-nosniff": {
    category: "security", severity: "Low", title: "Missing X-Content-Type-Options",
    why: "Without it, some browsers guess file types, which can turn an uploaded file into running code.",
    fix: "Send X-Content-Type-Options: nosniff.",
  },
  "header-referrer": {
    category: "security", severity: "Low", title: "No referrer policy",
    why: "Full page addresses (which can include sign-in tokens or order details) may be passed to other sites the visitor goes to.",
    fix: 'Send Referrer-Policy: strict-origin-when-cross-origin, or add <meta name="referrer" content="strict-origin-when-cross-origin">.',
  },
  "script-no-integrity": {
    category: "security", severity: "Low", title: "A script from another company's server isn't locked to a version",
    why: "If that server is ever hacked or the library publishes a bad update, the changed code runs on your site with your visitors' sessions.",
    fix: "Pin the exact version in the address and add an integrity hash, or copy the file into your own site.",
  },
  "code-review": {
    category: "security", severity: "High", title: "Security issue found in the code review",
    why: "See details.",
    fix: "See details.",
  },
  "dependency-vuln": {
    category: "security", severity: "High", title: "A software library has a known security hole",
    why: "Attackers scan for sites using versions with published weaknesses.",
    fix: "Update the library to the fixed version shown.",
  },

  // ── Speed (from Lighthouse) ─────────────────────────────────────
  "perf-score": {
    category: "performance", severity: "Medium", title: "The page is slow on phones",
    why: "Google measures this score on a mid-range phone. Slow pages lose visitors (most leave after about 3 seconds) and rank lower.",
    fix: "Start with the biggest savings listed for this page.",
  },
  "perf-lcp": {
    category: "performance", severity: "Medium", title: "The main content appears late (LCP)",
    why: "Largest Contentful Paint is when the biggest thing on screen (usually the hero image) appears. Google's target is under 2.5 seconds.",
    fix: "Compress and resize the hero image (WebP/AVIF, no wider than it's shown), and preload it.",
  },
  "perf-cls": {
    category: "performance", severity: "Medium", title: "The page jumps around while loading (CLS)",
    why: "Content shifting as it loads makes visitors tap the wrong thing. Google's target is under 0.1.",
    fix: "Give images and embeds a width and height (or aspect-ratio), and reserve space for things that load in later, like prices.",
  },
  "perf-tbt": {
    category: "performance", severity: "Low", title: "The page is unresponsive while it loads",
    why: "Heavy scripts keep the phone busy, so taps and scrolling lag in the first seconds.",
    fix: "Load non-essential scripts later (defer), and split or trim large scripts.",
  },
};

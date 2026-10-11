// ============================================================================
// EN / עב switch for the shop pages. English is the source text; this file
// holds the Hebrew. With Hebrew chosen, the page flips to right-to-left and
// every known string (including text the scripts add later) is shown in
// Hebrew. Product names and descriptions come from the database as written.
// The choice is remembered and shared with the sales pages.
// ============================================================================
const KEY = "mwp_lang";

export function getLang() {
  try { return localStorage.getItem(KEY) === "he" ? "he" : "en"; } catch { return "en"; }
}
function setLang(lang) {
  try { localStorage.setItem(KEY, lang); } catch { /* private mode: still switches this page */ }
}

const HE = {
  // header, banner, footer
  "Skip to content": "דילוג לתוכן",
  "Instant download after payment": "הורדה מיידית אחרי התשלום",
  "Secure card checkout": "תשלום מאובטח בכרטיס",
  "Free updates to everything you buy": "עדכונים חינם לכל מה שקונים",
  "MWP, home": "MWP, דף הבית",
  "Menu": "תפריט",
  "Main": "ראשי",
  "All products": "כל המוצרים",
  "Presets": "פריסטים",
  "Plugin": "פלאגין",
  "Guides & PDFs": "מדריכים ו-PDF",
  "Bundles": "חבילות",
  "Help": "עזרה",
  "My downloads": "ההורדות שלי",
  "Editing tools and guides from wildlife photographer Matan Wild.": "כלי עריכה ומדריכים מצלם חיות הבר מתן וויילד.",
  "Shop": "חנות",
  "Contact support": "פנייה לתמיכה",
  "Refunds": "החזרים",
  "Licence": "רישיון",
  "Matan Wild": "מתן וויילד",
  "Payments processed securely by Lemon Squeezy ·": "התשלומים מעובדים בצורה מאובטחת על ידי Lemon Squeezy ·",
  "Terms": "תנאים",
  "Privacy": "פרטיות",
  "Language": "שפה",

  // home
  "MWP · Presets, guides and tools by Matan Wild": "MWP · פריסטים, מדריכים וכלים מאת מתן וויילד",
  "Editing tools from the field.": "כלי עריכה מהשטח.",
  "Presets, guides and an editing plugin made by wildlife photographer Matan Wild, for photographers who edit what they shoot outdoors.":
    "פריסטים, מדריכים ופלאגין לעריכה מאת צלם חיות הבר מתן וויילד, לצלמים שעורכים את מה שהם מצלמים בטבע.",
  "Search the shop": "חיפוש בחנות",
  "Search presets, guides and more": "חיפוש פריסטים, מדריכים ועוד",
  "Search": "חיפוש",
  "Popular searches": "חיפושים פופולריים",
  "Snow": "שלג",
  "Forest light": "אור ביער",
  "Birds": "ציפורים",
  "Safari": "ספארי",
  "Black and white": "שחור-לבן",
  "Shop by category": "קנייה לפי קטגוריה",
  "New and featured": "חדש ומומלץ",
  "View all products": "לכל המוצרים",
  "Why buy here": "למה לקנות כאן",
  "Instant download": "הורדה מיידית",
  "Your files are ready the moment you pay.": "הקבצים מוכנים ברגע שמשלמים.",
  "Secure checkout": "תשלום מאובטח",
  "Card payment through Lemon Squeezy. We never see your card.": "תשלום בכרטיס דרך Lemon Squeezy. אנחנו אף פעם לא רואים את פרטי הכרטיס.",
  "Free updates": "עדכונים חינם",
  "New versions land in your downloads at no cost.": "גרסאות חדשות מגיעות להורדות שלכם בלי עלות.",
  "Real support": "תמיכה אמיתית",
  "A person replies within one business day.": "אדם אמיתי עונה תוך יום עסקים אחד.",
  "How buying works": "איך קונים",
  "Choose": "בוחרים",
  "Pick a product and check what it works with.": "בוחרים מוצר ובודקים עם מה הוא עובד.",
  "Pay": "משלמים",
  "Card checkout opens on this page. A receipt arrives by email.": "התשלום בכרטיס נפתח בעמוד הזה. הקבלה מגיעה במייל.",
  "Download": "מורידים",
  "Sign in with the link we email you and download any time.": "נכנסים עם הקישור שנשלח במייל ומורידים מתי שרוצים.",
  "Install": "מתקינים",
  "Every download includes a short install guide.": "כל הורדה כוללת מדריך התקנה קצר.",
  "Try two presets free": "שני פריסטים במתנה",
  "See how they work on your own photos before you buy. They arrive by email in a minute.": "תראו איך הם עובדים על התמונות שלכם לפני שקונים. הם מגיעים במייל תוך דקה.",
  "Email address": "כתובת מייל",
  "Send me the presets": "שלחו לי את הפריסטים",
  "Email me the free presets and occasional news. Unsubscribe anytime.": "שלחו לי את הפריסטים החינמיים ועדכונים מדי פעם. אפשר להסיר את עצמי בכל רגע.",
  "Questions": "שאלות",
  "Which programs do the products work with?": "עם אילו תוכנות המוצרים עובדים?",
  "Every product page lists what it works with under \"Works with\". Presets work in Lightroom Classic, Lightroom and Photoshop's Camera Raw; the plugin and the guides state their own requirements.":
    "בכל עמוד מוצר מופיע תחת \"עובד עם\" עם מה הוא עובד. הפריסטים עובדים ב-Lightroom Classic, ב-Lightroom וב-Camera Raw של פוטושופ. לפלאגין ולמדריכים יש דרישות משלהם, שמפורטות בעמוד שלהם.",
  "How do I get my files after paying?": "איך מקבלים את הקבצים אחרי התשלום?",
  "You get an email straight away. Open": "מקבלים מייל מיד. פותחים את",
  ", enter the email you paid with, and click the sign-in link we send. Everything you bought is there.":
    ", מזינים את המייל שאיתו שילמתם ולוחצים על קישור הכניסה שנשלח. כל מה שקניתם נמצא שם.",
  "Can I download again later?": "אפשר להוריד שוב אחר כך?",
  "Yes. Sign in to My downloads any time, including for future updates to products you own.": "כן. נכנסים להורדות שלי מתי שרוצים, גם בשביל עדכונים עתידיים למוצרים שכבר קניתם.",
  "Do I need an account?": "צריך לפתוח חשבון?",
  "No password to create. Your purchases are tied to your email, and you sign in with a one-time link.": "אין סיסמה. הרכישות שלכם קשורות למייל, ונכנסים עם קישור חד־פעמי.",
  "What if something doesn't work for me?": "ומה אם משהו לא עובד?",
  "Write to": "כתבו ל",
  "support": "תמיכה",
  "and we'll help. Our": "ונעזור. ב",
  "refund policy": "מדיניות ההחזרים",
  "has the details.": "יש את כל הפרטים.",
  "Lightroom presets, a Photoshop plugin and editing guides from wildlife photographer Matan Wild. Instant download, secure checkout.":
    "פריסטים ללייטרום, פלאגין לפוטושופ ומדריכי עריכה מצלם חיות הבר מתן וויילד. הורדה מיידית ותשלום מאובטח.",
  "The first products are being prepared. Get the free sampler below and you'll hear the moment they're out.":
    "המוצרים הראשונים בהכנה. הירשמו לפריסטים החינמיים למטה ותשמעו ברגע שהם יוצאים.",
  "Coming soon": "בקרוב",

  // home (in the sales-page look)
  "MWP · by Matan Wild": "MWP · מאת מתן וויילד",
  "Products": "מוצרים",
  "MWP Presets · Lightroom": "MWP Presets · לייטרום",
  "The look behind every MWP frame.": "המראה של כל פריים של MWP.",
  "Now one click away.": "עכשיו בקליק אחד.",
  "50 presets, 12 of them adaptive · 33 LUTs for video": "50 פריסטים, 12 מהם אדפטיביים · 33 קובצי LUT לווידאו",
  "See MWP Presets": "ל-MWP Presets",
  "MWP Panel · Photoshop": "MWP Panel · פוטושופ",
  "You were there.": "הייתם שם.",
  "Now make the photo show it.": "עכשיו תנו לתמונה להראות את זה.",
  "8 one-click effects · 11 looks · 4 painted lights": "8 אפקטים בלחיצה · 11 לוקים · 4 תאורות מצוירות",
  "See MWP Panel": "ל-MWP Panel",
  "MWP Field Guides · PDF": "MWP Field Guides · PDF",
  "See the photo": "לראות את התמונה",
  "before you press the shutter.": "לפני שלוחצים.",
  "4 guides · 137 lessons · 229 pages · English and Hebrew": "4 מדריכים · 137 שיעורים · 229 עמודים · עברית ואנגלית",
  "See the Field Guides": "למדריכי השטח",
  "Before you buy": "לפני שקונים",
  "Lightroom presets": "פריסטים ללייטרום",
  "Photoshop plugin": "פלאגין לפוטושופ",
  "PDF field guides": "מדריכי שטח ב-PDF",
  "The look behind every MWP frame.": "המראה של כל פריים של MWP.",
  "You were there. Now make the photo show it.": "הייתם שם. עכשיו תנו לתמונה להראות את זה.",
  "See the photo before you press the shutter.": "לראות את התמונה לפני שלוחצים.",
  "Footer": "קישורים",
  "All photos: Matan Wild · contact@matanwildphotography.com": "כל הצילומים: מתן וויילד · contact@matanwildphotography.com",

  // categories
  "Preset pack": "חבילת פריסטים",
  "Guide": "מדריך",
  "Bundle": "חבילה",
  "Product": "מוצר",
  "More": "עוד",
  "Lightroom and Camera Raw looks for real field light": "מראות ללייטרום ול-Camera Raw לאור אמיתי בשטח",
  "Our photo editing plugin": "פלאגין העריכה שלנו",
  "Field guides and editing workflows to read and keep": "מדריכי שטח ותהליכי עריכה לקרוא ולשמור",
  "Several products together for less": "כמה מוצרים יחד, במחיר נמוך יותר",
  "Everything else": "כל השאר",

  // shop
  "All products · MWP": "כל המוצרים · MWP",
  "Lightroom presets, a Photoshop plugin, guides and bundles from wildlife photographer Matan Wild.": "פריסטים ללייטרום, פלאגין לפוטושופ, מדריכים וחבילות מצלם חיות הבר מתן וויילד.",
  "Category": "קטגוריה",
  "Search products": "חיפוש מוצרים",
  "Sort by": "מיון לפי",
  "Featured": "מומלצים",
  "Newest": "החדשים ביותר",
  "Price: low to high": "מחיר: מהנמוך לגבוה",
  "Price: high to low": "מחיר: מהגבוה לנמוך",
  "Show all products": "להצגת כל המוצרים",

  // product
  "A digital product by Matan Wild for Lightroom and Photoshop.": "מוצר דיגיטלי מאת מתן וויילד ללייטרום ולפוטושופ.",
  "Breadcrumb": "נתיב ניווט",
  "Buy now": "לקנייה",
  "Available soon": "בקרוב",
  "Download right after payment": "הורדה מיד אחרי התשלום",
  "Secure card checkout by Lemon Squeezy": "תשלום מאובטח בכרטיס דרך Lemon Squeezy",
  "Free updates to this product": "עדכונים חינם למוצר הזה",
  "Contents": "תכולה",
  "Works with": "עובד עם",
  "Version": "גרסה",
  "Personal and client work (": "לעבודה אישית ולעבודה עבור לקוחות (",
  "details": "פרטים",
  "About this product": "על המוצר",
  "This product isn't available.": "המוצר הזה לא זמין.",
  "See all products": "לכל המוצרים",
  "Before": "לפני",
  "After": "אחרי",
  "Choose an example": "בחירת דוגמה",
  "Preset comparison": "השוואת פריסט",

  // account
  "My downloads · MWP": "ההורדות שלי · MWP",
  "Sign in with your email to download what you've bought.": "נכנסים עם המייל כדי להוריד את מה שקניתם.",
  "Sign in with your email": "כניסה עם המייל",
  "Use the email you paid with. We'll send a one-time sign-in link; there's no password.": "השתמשו במייל שאיתו שילמתם. נשלח קישור כניסה חד־פעמי, בלי סיסמה.",
  "Email": "מייל",
  "Email me a sign-in link": "שלחו לי קישור כניסה",
  "Signed in as": "מחוברים בתור",
  "Sign out": "התנתקות",
  "Download links are created when you click and expire after 5 minutes. Trouble?": "קישורי ההורדה נוצרים כשלוחצים ותקפים ל-5 דקות. יש בעיה?",
  "Download .zip": "הורדת קובץ zip.",
  "Nothing on this email yet.": "עדיין אין רכישות במייל הזה.",
  "Bought with a different email? Sign out and use that one, or": "קניתם עם מייל אחר? התנתקו והיכנסו איתו, או",
  "contact support": "פנו לתמיכה",
  "with your order number.": "עם מספר ההזמנה.",
  "Please enter the email you used at checkout.": "הזינו את המייל שאיתו שילמתם.",
  "Too many requests. Please wait a minute and try again.": "יותר מדי בקשות. חכו דקה ונסו שוב.",
  "Your download has started. The link is valid for 5 minutes.": "ההורדה התחילה. הקישור תקף ל-5 דקות.",
  "Please sign in first.": "צריך להיכנס קודם.",
  "Preparing…": "מכינים…",

  // support
  "Help · MWP": "עזרה · MWP",
  "Help with downloading, installing or using MWP products.": "עזרה בהורדה, בהתקנה או בשימוש במוצרי MWP.",
  "How can we help?": "איך אפשר לעזור?",
  "A person answers within one business day.": "אדם אמיתי עונה תוך יום עסקים אחד.",
  "Name": "שם",
  "Topic": "נושא",
  "Downloading my files": "הורדת הקבצים שלי",
  "Installing or using a product": "התקנה או שימוש במוצר",
  "Refund request": "בקשת החזר",
  "Something else": "משהו אחר",
  "Order number (optional)": "מספר הזמנה (לא חובה)",
  "Subject": "כותרת",
  "Message": "הודעה",
  "Send message": "שליחת ההודעה",
  "Sending…": "שולחים…",
  "Please add your name.": "נא להוסיף שם.",
  "Please enter a valid email.": "נא להזין מייל תקין.",
  "Please enter a valid email address.": "נא להזין כתובת מייל תקינה.",
  "A few words, please.": "כמה מילים, בבקשה.",
  "Tell us a little more (10 characters or more).": "ספרו לנו עוד קצת (10 תווים לפחות).",
  "Thanks, we've got it. You'll hear back within one business day.": "תודה, קיבלנו. נחזור אליכם תוך יום עסקים אחד.",
  "Please tick the box so we can email you the presets.": "סמנו את התיבה כדי שנוכל לשלוח לכם את הפריסטים.",
  "Check your inbox: the free presets are on their way.": "בדקו את תיבת המייל: הפריסטים החינמיים בדרך.",

  // thank you
  "Thank you · MWP": "תודה · MWP",
  "Your order is confirmed.": "ההזמנה אושרה.",
  "Thank you. Your order is confirmed.": "תודה. ההזמנה אושרה.",
  "Your files are ready in My downloads. We've also emailed you a link": "הקבצים מחכים בהורדות שלי. שלחנו גם קישור במייל",
  "at": "לכתובת",
  "Go to my downloads": "להורדות שלי",
  "Installation help": "עזרה בהתקנה",
  "Sign in": "נכנסים",
  "With the email you paid with.": "עם המייל שאיתו שילמתם.",
  "One .zip per product.": "קובץ zip אחד לכל מוצר.",
  "Follow the guide inside the zip.": "לפי המדריך שבתוך קובץ ה-zip.",

  // legal (the terms themselves stay in English until Matan approves a Hebrew version)
  "Terms and policies": "תנאים ומדיניות",
  "Last updated": "עודכן לאחרונה",

  // 404
  "Page not found · MWP": "העמוד לא נמצא · MWP",
  "This page doesn't exist.": "העמוד הזה לא קיים.",
  "The link may be old or mistyped. Everything in the shop is one click away.": "ייתכן שהקישור ישן או שגוי. כל מה שבחנות נמצא במרחק לחיצה.",
  "Browse all products": "לכל המוצרים",
  "Home": "דף הבית",
};

// Text built from numbers or names.
const PATTERNS = [
  [/^1 product$/, () => "מוצר אחד"],
  [/^(\d+) products$/, (m) => `${m[1]} מוצרים`],
  [/^(\d+) presets$/, (m) => `${m[1]} פריסטים`],
  [/^(\d+) pages$/, (m) => `${m[1]} עמודים`],
  [/^([A-Z]{3}), one-time payment$/, (m) => `${m[1]}, תשלום חד־פעמי`],
  [/^Example (\d+)$/, (m) => `דוגמה ${m[1]}`],
  [/^Compare before and after: (.*)$/, (m) => `השוואת לפני ואחרי: ${m[1]}`],
  [/^We've sent a sign-in link to (.+)\. Open it on this device\.$/, (m) => `שלחנו קישור כניסה אל ${m[1]}. פתחו אותו במכשיר הזה.`],
  [/^Nothing matches "(.*)" here\.$/, (m) => `אין תוצאות עבור "${m[1]}" כאן.`],
  [/^Nothing matches here\.$/, () => "אין כאן תוצאות."],
];

const SALES = { "presets/": "presets/he.html", "panel/": "panel/he.html", "field-guides/": "field-guides/he.html" };

function translate(text) {
  const core = text.replace(/\s+/g, " ").trim();
  if (!core) return null;
  let out = HE[core];
  if (out === undefined) {
    for (const [re, fn] of PATTERNS) { const m = core.match(re); if (m) { out = fn(m); break; } }
  }
  if (out === undefined) return null;
  const lead = /^\s/.test(text) ? " " : "";
  const trail = /\s$/.test(text) ? " " : "";
  return lead + out + trail;
}

const ATTRS = ["placeholder", "aria-label", "title"];
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "TEXTAREA"]);

function walk(root) {
  if (root.nodeType === 3) {
    const t = translate(root.nodeValue);
    if (t !== null && t !== root.nodeValue) root.nodeValue = t;
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (root.nodeType === 1) {
    if (SKIP.has(root.tagName) || root.closest("[data-no-i18n], .prose--legal")) return;
    for (const a of ATTRS) {
      const v = root.getAttribute(a);
      if (v) { const t = translate(v); if (t !== null) root.setAttribute(a, t.trim()); }
    }
    if (root.tagName === "A") {
      const href = root.getAttribute("href") || "";
      for (const [en, he] of Object.entries(SALES)) {
        if (href === en || href.endsWith("/" + en)) root.setAttribute("href", href.slice(0, href.length - en.length) + he);
      }
    }
  }
  for (const c of Array.from(root.childNodes)) walk(c);
}

function toggleHTML(lang) {
  const en = lang === "en";
  return `<div class="lang-toggle" role="group" aria-label="${en ? "Language" : "שפה"}">
    ${en ? `<span class="on" aria-current="true">EN</span><button type="button" data-lang="he" lang="he">עב</button>`
         : `<button type="button" data-lang="en" lang="en">EN</button><span class="on" aria-current="true">עב</span>`}
  </div>`;
}

export function initI18n() {
  const lang = getLang();
  const header = document.querySelector(".site-header .container");
  if (header && !header.querySelector(".lang-toggle")) {
    header.insertAdjacentHTML("beforeend", toggleHTML(lang));
    header.querySelector(".lang-toggle").addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (!b) return;
      setLang(b.dataset.lang);
      location.reload();
    });
  }
  if (lang !== "he") return;

  document.documentElement.lang = "he";
  document.documentElement.dir = "rtl";
  if (!document.querySelector('link[data-heebo]')) {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.dataset.heebo = "";
    l.href = "https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  const t = translate(document.title); if (t) document.title = t.trim();
  walk(document.body);
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "characterData") walk(r.target);
      else for (const n of r.addedNodes) walk(n);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}

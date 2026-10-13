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
  "See MWP Presets": "לפריסטים",
  "MWP Panel · Photoshop": "MWP Panel · פוטושופ",
  "You were there.": "הייתם שם.",
  "Now make the photo show it.": "עכשיו תנו לתמונה להראות את זה.",
  "8 one-click effects · 11 looks · 4 painted lights": "8 אפקטים בלחיצה · 11 לוקים · 4 תאורות מצוירות",
  "See MWP Panel": "לפאנל",
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
  // Personal copies (drafts for Matan)
  "We're making your personal copy. It's usually ready in a few minutes; this page will start the download when it is.": "אנחנו מכינים עותק אישי בשבילכם. בדרך כלל זה לוקח כמה דקות, וההורדה תתחיל מהעמוד הזה ברגע שהוא מוכן.",
  "Your personal copy is still being made. Please come back in a little while and download it from here.": "העותק האישי שלכם עדיין בהכנה. חזרו בעוד קצת זמן והורידו אותו מכאן.",
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
  // home: interactive shop
  // My downloads (drafts for Matan)
  "Your library": "הספרייה שלכם",
  "Everything you own, ready to download. New versions appear here at no cost.": "כל מה שבבעלותכם, מוכן להורדה. גרסאות חדשות מופיעות כאן ללא עלות.",
  "My": "ההורדות",
  "downloads": "שלי",
  // Ambassador Program page, /beta/ (drafts for Matan)
  "MWP Ambassador Program": "תוכנית השגרירים של MWP",
  "Create with MWP.": "יוצרים עם MWP.",
  "On us.": "עלינו.",
  "A small group of selected photographers gets MWP Presets, MWP Panel and the Field Guides free. In return, create with them, share your work and tell us what you think.": "קבוצה קטנה של צלמים נבחרים מקבלת את MWP Presets, ‏MWP Panel ומדריכי השטח בחינם. בתמורה, יוצרים איתם, משתפים את העבודות ומספרים לנו מה דעתכם.",
  "Join the program": "הצטרפות לתוכנית",
  "What you get": "מה מקבלים",
  "Everything we make.": "כל מה שאנחנו יוצרים.",
  "Free.": "בחינם.",
  "Free for ambassadors": "חינם לשגרירים",
  "What we ask": "מה אנחנו מבקשים",
  "Use it. Share it.": "משתמשים. משתפים.",
  "Tag us.": "מתייגים אותנו.",
  "Create and share": "יוצרים ומשתפים",
  "In your first 3 months: at least 3 posts and 1 reel a month, and 1 story a week. After that, tag us whenever you use the tools and love the results.": "ב־3 החודשים הראשונים: לפחות 3 פוסטים ורילס אחד בחודש, וסטורי אחד בשבוע. אחר כך, מתייגים אותנו בכל פעם שאתם משתמשים בכלים ואוהבים את התוצאה.",
  "Tag and disclose": "מתייגים ומציינים",
  "Tag": "תייגו את",
  "and Matan Wild, use our hashtags, and mark your posts as gifted. The terms explain how.": "ואת מתן וויילד, השתמשו בהאשטגים שלנו וסמנו את הפוסטים כתוכן שקיבלתם במתנה. התנאים מסבירים איך.",
  "Keep it personal": "שומרים את זה אישי",
  "Your licence is yours alone, on up to 2 computers. Don't share the files or your access.": "הרישיון אישי שלכם, בעד 2 מחשבים. אל תשתפו את הקבצים או את הגישה.",
  "Tell us what you think": "ספרו לנו מה דעתכם",
  "Share honest feedback and report bugs as you find them. You'll have a direct line to our team and to Matan.": "שתפו משוב כן ודווחו על באגים כשאתם נתקלים בהם. יהיה לכם קשר ישיר לצוות שלנו ולמתן.",
  "The terms": "התנאים",
  "Ambassador Program": "תוכנית השגרירים",
  "Terms of Use.": "תנאי שימוש.",
  "Terms of Use": "תנאי שימוש",
  "Read them through, then accept them below.": "קראו אותם עד הסוף, ואשרו אותם למטה.",
  "Join": "הצטרפות",
  "Your tools,": "הכלים שלכם,",
  "in two minutes.": "בתוך שתי דקות.",
  "Fill in your details and accept the terms.": "ממלאים פרטים ומאשרים את התנאים.",
  "We email you a link. Open it to download all three tools.": "אנחנו שולחים לכם קישור במייל. פותחים אותו ומורידים את שלושת הכלים.",
  "In Photoshop, open MWP Panel and sign in with the same email.": "בפוטושופ, פותחים את MWP Panel ומתחברים עם אותו מייל.",
  "Instagram": "אינסטגרם",
  "I've read and accept the": "קראתי ואני מאשר/ת את",
  "MWP Ambassador Program Terms of Use": "תנאי השימוש של תוכנית השגרירים של MWP",
  "Check your inbox": "בדקו את תיבת הדואר",
  "We've sent you a link. Open it to download your tools.": "שלחנו לכם קישור. פתחו אותו כדי להוריד את הכלים.",
  "Go to My downloads": "להורדות שלי",
  "MWP · by Matan Wild · Ambassador access is personal.": "MWP · מאת מתן וויילד · הגישה לשגרירים אישית.",
  "Lifetime": "לכל החיים",
  "licence, with every future update": "רישיון, כולל כל עדכון עתידי",
  "devices, for you only": "מכשירים, רק בשבילכם",
  "posts and a reel a month, first 3 months": "פוסטים ורילס בחודש, ב־3 החודשים הראשונים",
  "story a week, first 3 months": "סטורי בשבוע, ב־3 החודשים הראשונים",
  "your copyright, always": "זכויות היוצרים שלכם, תמיד",
  "months, renewable": "חודשים, עם אפשרות לחידוש",
  "Acceptance": "אישור",
  "Signature": "חתימה",
  "Your name": "השם שלכם",
  "I agree": "אני מסכים/ה",
  "Read the terms": "לקריאת התנאים",
  "Step 1 of 2 · Acceptance": "שלב 1 מתוך 2 · אישור התנאים",
  "Do you accept": "האם אתם מאשרים",
  "the terms?": "את התנאים?",
  "To join, accept the MWP Ambassador Program Terms of Use above. Then you'll fill in your details and get your tools.": "כדי להצטרף, אשרו את תנאי השימוש של תוכנית השגרירים של MWP שלמעלה. אחר כך תמלאו פרטים ותקבלו את הכלים.",
  "I've read and accept the terms": "קראתי ואני מאשר/ת את התנאים",
  "Step 2 of 2 · Your details": "שלב 2 מתוך 2 · הפרטים שלכם",
  "You're": "אתם",
  "in.": "בפנים.",
  "Tell us who you are. We'll email you a link to download your tools.": "ספרו לנו מי אתם. נשלח לכם במייל קישור להורדת הכלים.",
  "Terms accepted": "התנאים אושרו",
  "Get my tools": "קבלת הכלים",
  "Then, in Photoshop, open MWP Panel and sign in with the same email.": "אחר כך, בפוטושופ, פותחים את MWP Panel ומתחברים עם אותו מייל.",
  "Please agree to the Ambassador Program terms.": "נא לאשר את תנאי תוכנית השגרירים.",
  "Couldn't save your details. Please try again.": "לא הצלחנו לשמור את הפרטים. נסו שוב.",
  "Couldn't add the tools to your library. Please try again.": "לא הצלחנו להוסיף את הכלים לספרייה. נסו שוב.",
  // My downloads: MWP Panel computers (drafts for Matan)
  "MWP Panel on your computers": "MWP Panel במחשבים שלכם",
  "Computer": "מחשב",
  "Remove": "הסרה",
  "Removing…": "מסירים…",
  "Computer removed. You can now sign in to MWP Panel on another one.": "המחשב הוסר. אפשר עכשיו להתחבר ל-MWP Panel במחשב אחר.",
  "No computers yet. Open MWP Panel in Photoshop and sign in with this email.": "עדיין אין מחשבים. פתחו את MWP Panel בפוטושופ והתחברו עם המייל הזה.",
  "SUBJECT · POP": "SUBJECT · POP",
  "Shoot": "צילום",
  "Finish": "גימור",
  "Scroll": "גללו",
  "Shoot it. Edit it.": "מצלמים. עורכים.",
  "Finish it.": "מסיימים.",
  "/ 03": "/ 03",
  "Every photo by Matan Wild": "כל התמונות של מתן וויילד",
  "Photos by Matan Wild": "תמונות של מתן וויילד",
  "Matan's edit": "העריכה של מתן",
  "One photo by Matan. Try a look, stack a few Panel effects, set the amount, then drag across the photo to compare with the original.": "תמונה אחת של מתן. נסו מראה, הוסיפו כמה אפקטים של הפאנל, כוונו את העוצמה, ואז גררו על התמונה כדי להשוות למקור.",
  "The original photo by Matan Wild": "התמונה המקורית של מתן וויילד",
  "Original": "מקור",
  "Drag to compare with the original": "גררו כדי להשוות למקור",
  "Drag across the photo to compare with the original.": "גררו על התמונה כדי להשוות למקור.",
  "One photo, straight from the camera. Try a look, stack a few Panel effects, set the amount, then drag across the photo to see where it started.": "תמונה אחת, ישר מהמצלמה. נסו מראה, הוסיפו כמה אפקטים של הפאנל, כוונו את העוצמה, ואז גררו על התמונה כדי לראות מאיפה היא התחילה.",
  "The same photo with your edits": "אותה תמונה עם העריכה שלכם",
  "Live preview in your browser. The real presets and plugin go further, with masks, detail and colour work on every frame.": "תצוגה חיה בדפדפן. הפריסטים והפלאגין האמיתיים הולכים רחוק יותר, עם מסכות, פרטים ועבודת צבע בכל פריים.",
  "Looks": "מראות",
  "Edit · tap to stack": "עריכה · אפשר לשלב כמה",
  "The full plugin has 8 one-click effects, 11 looks and 4 painted lights.": "בפלאגין המלא יש 8 אפקטים בקליק, 11 מראות ו-4 תאורות מצוירות.",
  "Start again": "להתחיל מחדש",
  "Golden Hour": "שעת זהב",
  "Cool Dusk": "דמדומים קרים",
  "Matte Earth": "אדמה מט",
  "Deep Contrast": "ניגודיות עמוקה",
  "Soft Light": "אור רך",
  "One photo, straight from the camera. Try a preset or a Panel effect on it, set the amount, then drag across the photo to see where it started.": "תמונה אחת, ישר מהמצלמה. נסו עליה פריסט או אפקט של הפאנל, כוונו את העוצמה, ואז גררו על התמונה כדי לראות מאיפה היא התחילה.",
  "PLACEHOLDER: this look needs Matan's export of the same photo.": "ממלא מקום: למראה הזה צריך את הייצוא של מתן על אותה תמונה.",
  "PLACEHOLDER: Blue Hour here is Matan's finished edit. Replace with the same RAW edited only with the preset before launch.": "ממלא מקום: Blue Hour כאן הוא העריכה הסופית של מתן. לפני ההשקה מחליפים באותו RAW עם הפריסט בלבד.",
  "A few effects are open to try. The full plugin has 8 one-click effects, 11 looks and 4 painted lights.": "כמה אפקטים פתוחים לניסיון. בפלאגין המלא יש 8 אפקטים בקליק, 11 מראות ו-4 תאורות מצוירות.",
  "Previous page": "העמוד הקודם",
  "Next page": "העמוד הבא",
  "PDF": "PDF",
  "Field Guides": "מדריכי השטח",
  "Sample pages": "עמודים לדוגמה",
  "Rule of thirds": "חוק השלישים",
  "Fix white balance first": "קודם איזון לבן",
  "Side light": "אור צידי",
  "Light under the storm": "אור מתוך הסערה",
  "The full set: 4 PDF guides, 137 lessons on 229 pages, in English and Hebrew.": "הסט המלא: 4 מדריכי PDF, ‏137 שיעורים ב-229 עמודים, בעברית ובאנגלית.",
  "Get the Field Guides": "למדריכי השטח",
  "Try it": "נסו בעצמכם",
  "Try the tools": "נסו את הכלים",
  "Try it yourself": "נסו בעצמכם",
  "Get your hands": "הכלים",
  "on the tools.": "בידיים שלכם.",
  "Pick a tool, tap a look and set the amount. Then drag across the photo to see where it started. A small taste of what's inside.": "בחרו כלי, לחצו על מראה וכוונו את העוצמה. אחר כך גררו על התמונה כדי לראות מאיפה היא התחילה. טעימה קטנה ממה שיש בפנים.",
  "The same photo with the selected MWP look": "אותה תמונה עם המראה שנבחר",
  "Drag to compare with the RAW file": "גררו כדי להשוות לקובץ ה-RAW",
  "PLACEHOLDER: the finished frames are Matan's full edits. Replace with the same RAW edited only with the preset or effect before launch.": "ממלא מקום: הפריימים הסופיים הם העריכות המלאות של מתן. לפני ההשקה מחליפים באותו RAW עם הפריסט או האפקט בלבד.",
  "Choose a tool": "בחרו כלי",
  "Lightroom": "לייטרום",
  "Photoshop": "פוטושופ",
  "Light and Scene": "אור וסצנה",
  "Edit": "עריכה",
  "The full pack: 50 Lightroom presets, 50 mobile files and 33 LUTs.": "החבילה המלאה: 50 פריסטים ללייטרום, 50 קבצים לנייד ו-33 קובצי LUT.",
  "Two effects are open to try. The full plugin has 8 one-click effects, 11 looks and 4 painted lights.": "שני אפקטים פתוחים לניסיון. בפלאגין המלא יש 8 אפקטים בקליק, 11 מראות ו-4 תאורות מצוירות.",
  "Amount": "עוצמה",
  "Get MWP Presets": "לפריסטים",
  "Get MWP Panel": "לפאנל",
  "Drag across the photo to compare with the RAW file.": "גררו על התמונה כדי להשוות לקובץ ה-RAW.",
  "Add to cart": "הוספה לעגלה",
  "The edits": "העריכות",
  "See the edits": "לצפייה בעריכות",
  "From RAW to final": "מ-RAW לתמונה הסופית",
  "The RAW file as shot": "קובץ ה-RAW כפי שצולם",
  "The final edit, finished with MWP": "העריכה הסופית עם MWP",
  "FINAL · MWP PRESET": "סופי · פריסט MWP",
  "FINAL · MWP PANEL": "סופי · MWP Panel",
  "Drag to compare the RAW file and the final edit": "גררו כדי להשוות בין קובץ ה-RAW לעריכה הסופית",
  "PLACEHOLDER: the final frame here is Matan's finished edit. Replace with the same RAW edited only with the preset before launch.": "ממלא מקום: הפריים הסופי כאן הוא העריכה של מתן. לפני ההשקה מחליפים באותו RAW עם הפריסט בלבד.",
  "Before and after": "לפני ואחרי",
  "A male lion roaring, photographed by Matan Wild": "אריה שואג, צילום: מתן וויילד",
  "Editing tools": "כלי עריכה",
  "from the field.": "מהשטח.",
  "Lightroom presets, a Photoshop plugin and field guides from wildlife photographer Matan Wild. Instant download, secure checkout.": "פריסטים ללייטרום, פלאגין לפוטושופ ומדריכי שטח מצלם חיות הבר מתן וויילד. הורדה מיידית ותשלום מאובטח.",
  "Shop the collection": "לכל המוצרים",
  "See before and after": "לפני ואחרי",
  "English and Hebrew · Mac and Windows · Download right after payment": "עברית ואנגלית · Mac ו-Windows · הורדה מיד אחרי התשלום",
  "The MWP collection": "הקולקציה של MWP",
  "50 presets · 33 LUTs": "50 פריסטים · 33 קובצי LUT",
  "8 effects · 11 looks": "8 אפקטים · 11 מראות",
  "4 guides · 229 pages": "4 מדריכים · 229 עמודים",
  "In numbers": "במספרים",
  "LUTs for video": "קובצי LUT לווידאו",
  "One-click effects": "אפקטים בקליק",
  "Lessons": "שיעורים",
  "The collection": "הקולקציה",
  "Three tools.": "שלושה כלים.",
  "One workflow.": "תהליך אחד.",
  "Field guides for the shoot. Presets and a plugin for the edit. Use one, or all three.": "מדריכי שטח לצילום. פריסטים ופלאגין לעריכה. אפשר אחד, ואפשר את שלושתם.",
  "MWP Presets box": "הקופסה של MWP Presets",
  "50 Lightroom presets, 12 adaptive": "50 פריסטים ללייטרום, 12 אדפטיביים",
  "50 mobile files and 33 LUTs": "50 קבצים לנייד ו-33 קובצי LUT",
  "Install guide for every program": "מדריך התקנה לכל תוכנה",
  "A tiger, photographed by Matan Wild": "טיגריס, צילום: מתן וויילד",
  "8 one-click effects": "8 אפקטים בקליק",
  "11 looks and 4 painted lights": "11 מראות ו-4 תאורות מצוירות",
  "User manual and install guide": "מדריך משתמש ומדריך התקנה",
  "Mountains at dusk, photographed by Matan Wild": "הרים בדמדומים, צילום: מתן וויילד",
  "4 PDF guides, 137 lessons": "4 מדריכי PDF, ‏137 שיעורים",
  "Composition, colour, light and planning": "קומפוזיציה, צבע, אור ותכנון",
  "English and Hebrew": "עברית ואנגלית",
  "Your RAW file.": "קובץ ה-RAW שלכם.",
  "In MWP light.": "באור של MWP.",
  "Pick an example and drag the handle: the RAW file on one side, the same photo finished with MWP on the other.": "בחרו דוגמה וגררו את הידית: קובץ ה-RAW בצד אחד, ואותה תמונה אחרי MWP בצד השני.",
  "Before: the RAW file as shot": "לפני: קובץ ה-RAW כפי שצולם",
  "After: finished with MWP": "אחרי: מעובד עם MWP",
  "BEFORE": "לפני",
  "AFTER · MWP PRESET": "אחרי · פריסט MWP",
  "Drag to compare before and after": "גררו כדי להשוות לפני ואחרי",
  "PLACEHOLDER: the \"after\" here is Matan's finished edit. Replace with the same RAW edited only with the preset before launch.": "ממלא מקום: ה\"אחרי\" כאן הוא העריכה הסופית של מתן. לפני ההשקה מחליפים באותו RAW עם הפריסט בלבד.",
  "Drag the handle to compare.": "גררו את הידית כדי להשוות.",
  "Shoot with the guides.": "מצלמים עם המדריכים.",
  "Finish with the tools.": "מסיימים עם הכלים.",
  "MWP Field Guides teach what happens before the click: composition, colour, light and planning, in 4 PDF guides in English and Hebrew. The presets and the Panel carry it on into the edit, in the same look.": "מדריכי השטח של MWP מלמדים מה קורה לפני הקליק: קומפוזיציה, צבע, אור ותכנון, ב-4 מדריכי PDF בעברית ובאנגלית. הפריסטים והפאנל ממשיכים מאותה נקודה אל העריכה, באותו מראה.",
  "Edit in Lightroom": "עורכים בלייטרום",
  "Get the presets": "לפריסטים",
  "Presets + Field Guides": "Presets + מדריכי השטח",
  "Shoot it, then edit it": "מצלמים, ואז עורכים",
  "MWP Presets: 50 presets and 33 LUTs": "MWP Presets: ‏50 פריסטים ו-33 קובצי LUT",
  "MWP Field Guides: 4 PDF guides, 137 lessons": "מדריכי השטח: 4 מדריכי PDF, ‏137 שיעורים",
  "Get the bundle": "לחבילה",
  "Lightroom and Photoshop": "לייטרום ופוטושופ",
  "MWP Panel: the Photoshop plugin": "MWP Panel: הפלאגין לפוטושופ",
  "EVERYTHING": "כל המוצרים",
  "The full set": "הסט המלא",
  "From the shot to the share": "מהצילום ועד השיתוף",
  "Get the full set": "לסט המלא",
  "[Bundle prices and discounts: Matan to decide]": "[מחירים והנחות לחבילות: לקביעת מתן]",
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
  [/^Version (.+)$/, (m) => `גרסה ${m[1]}`],
  [/^Added (.+)$/, (m) => `נוסף ${m[1]}`],
  [/^Last used (.+)$/, (m) => `שימוש אחרון: ${m[1]}`],
  [/^Your licence is personal: Panel works when you sign in to it with this email\. You can use it on up to (\d+) computers at a time\. Changed computer\? Remove the old one here\.$/,
    (m) => `הרישיון אישי: הפאנל עובד כשמתחברים אליו עם המייל הזה. אפשר להשתמש בו בעד ${m[1]} מחשבים בו־זמנית. החלפתם מחשב? הסירו את הישן כאן.`],
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

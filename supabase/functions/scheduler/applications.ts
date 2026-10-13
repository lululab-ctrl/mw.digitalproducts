// Ambassador applications: decisions made in monday.com come back to the shop.
//
// applications          → (cron, every 10 minutes) if any application is waiting, asks Make to read the
//                         Shop Ambassador Applications board and post it back here with a one-time nonce.
// applicationsCallback  → for every waiting application whose Decision is now Approved or Declined:
//                         Approved → grantAmbassador() (tools, beta_members, Shop Ambassadors), then Make sets
//                                    Shop result = Access given and emails the welcome message;
//                                    the program is full (26) → Shop result = Program full, no email.
//                         Declined → Make sets Shop result = Declined and emails the decline message.
// The emails are written here (English or Hebrew, the language they applied in) and sent by Make from
// contact@matanwildphotography.com. The texts are Matan's approved drafts, signed by Emilya.
import { notifyMake } from "../_shared/http.ts";
import { grantAmbassador } from "../_shared/ambassador.ts";

// Shop Ambassador Applications column ids (docs/monday-map.json)
const COL_APP_ID = "application_id";
const COL_DECISION = "decision";

// deno-lint-ignore no-explicit-any
type Db = any;

export async function applications(db: Db, self: string) {
  const { count } = await db.from("ambassador_applications").select("id", { count: "exact", head: true }).eq("status", "new");
  if (!count) return { skipped: "no applications waiting" };
  const nonce = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
  const { error } = await db.from("sync_nonces").insert({ nonce, purpose: "applications" });
  if (error) throw error;
  await notifyMake("MAKE_WEBHOOK_URL", { type: "applications_request", callback_url: self, nonce });
  return { ok: true, waiting: count };
}

// Make posts back: { job, nonce, data: <monday GraphQL "data" for Shop Ambassador Applications> }
// deno-lint-ignore no-explicit-any
export async function applicationsCallback(db: Db, body: Record<string, any>) {
  const nonce = String(body.nonce ?? "");
  if (nonce.length < 32) return { error: "unauthorized" };
  const { data: used, error: nErr } = await db.from("sync_nonces")
    .update({ used_at: new Date().toISOString() })
    .eq("nonce", nonce).eq("purpose", "applications").is("used_at", null)
    .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .select("nonce");
  if (nErr) throw nErr;
  if (!used?.length) return { error: "unauthorized" };

  let data = body.data;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = null; } }
  // deno-lint-ignore no-explicit-any
  const items: any[] = data?.boards?.[0]?.items_page?.items ?? [];
  const decided = new Map<string, "Approved" | "Declined">();
  for (const it of items) {
    const cols: Record<string, string> = {};
    for (const c of it.column_values ?? []) cols[c.id] = c.text ?? "";
    const id = (cols[COL_APP_ID] ?? "").trim();
    const d = (cols[COL_DECISION] ?? "").trim();
    if (/^[0-9a-f-]{36}$/.test(id) && (d === "Approved" || d === "Declined")) decided.set(id, d);
  }
  if (!decided.size) return { ok: true, decided: 0 };

  const { data: apps, error } = await db.from("ambassador_applications")
    .select("id, email, name, lang, instagram, facebook, terms_version, agreed_at, ip_hash")
    .in("id", [...decided.keys()]).eq("status", "new");
  if (error) throw error;

  const done: Record<string, string> = {};
  for (const a of apps ?? []) {
    const lang = a.lang === "he" ? "he" : "en";
    // Claim it first, so two callbacks close together can't act twice.
    const next = decided.get(a.id) === "Approved" ? "approved" : "declined";
    const { data: claimed } = await db.from("ambassador_applications")
      .update({ status: next, decided_at: new Date().toISOString() }).eq("id", a.id).eq("status", "new").select("id");
    if (!claimed?.length) continue;

    if (next === "approved") {
      let r;
      try {
        r = await grantAmbassador(db, { email: a.email, name: a.name, instagram: a.instagram, facebook: a.facebook,
          lang, termsVersion: a.terms_version, agreedAt: a.agreed_at, ipHash: a.ip_hash });
      } catch (err) {
        console.error("grant failed", a.id, err);
        await db.from("ambassador_applications").update({ status: "new", decided_at: null }).eq("id", a.id);   // try again next round
        continue;
      }
      if ("full" in r) {
        await db.from("ambassador_applications").update({ status: "full" }).eq("id", a.id);
        await notifyMake("MAKE_WEBHOOK_URL", { type: "application_decided", application_id: a.id, result: "Program full",
          send_email: "no", email: a.email, subject: "", body_html: "" });
        done[a.id] = "full";
        continue;
      }
      await db.from("ambassador_applications").update({ member_id: r.memberId }).eq("id", a.id);
      const m = welcome(lang, a.name);
      await notifyMake("MAKE_WEBHOOK_URL", { type: "application_decided", application_id: a.id, result: "Access given",
        send_email: "yes", email: a.email, subject: m.subject, body_html: m.html });
      done[a.id] = "approved";
    } else {
      const m = decline(lang, a.name);
      await notifyMake("MAKE_WEBHOOK_URL", { type: "application_decided", application_id: a.id, result: "Declined",
        send_email: "yes", email: a.email, subject: m.subject, body_html: m.html });
      done[a.id] = "declined";
    }
  }
  return { ok: true, done };
}

// ---------------------------------------------------------------- the emails
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const first = (name: string) => esc(name.trim().split(/\s+/)[0] || name.trim());
const ACCOUNT = "https://shop.mw.photography/account/";

function wrap(lang: "en" | "he", inner: string) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const font = lang === "he" ? "Heebo, Arial, sans-serif" : "'Google Sans', Arial, sans-serif";
  return `<div dir="${dir}" style="font-family:${font};font-size:15px;line-height:1.6;color:#1a1a1a;text-align:${lang === "he" ? "right" : "left"}">${inner}</div>`;
}

function welcome(lang: "en" | "he", name: string) {
  if (lang === "he") {
    return {
      subject: "ברוכים הבאים לתוכנית השגרירים של MWP",
      html: wrap("he", `<p>היי ${first(name)},</p>
<p>איזה כיף! ברוכים הבאים לתוכנית השגרירים של MWP.</p>
<p>כל מה שצריך כדי להתחיל:</p>
<ul>
<li><b>הכלים:</b> נכנסים ל<a href="${ACCOUNT}?lang=he">הורדות שלי</a> עם המייל הזה (או פותחים איתו חשבון) ומורידים את הפריסטים של MWP ואת הפאנל של MWP. בפוטושופ פותחים את הפאנל ומתחברים עם אותו מייל. הרישיון לכל החיים, כולל כל העדכונים, על עד 2 מכשירים.</li>
<li><b>שלושת החודשים הראשונים:</b> 3 פוסטים ורילס אחד בחודש, וגם סטורי אחד בשבוע.</li>
<li><b>תיוג:</b> @mw_phototours באינסטגרם ו-Matan Wild בפייסבוק, עם #mwppanel #mwppresets #jointhewildsideofphotography. חשוב לסמן את הפוסטים בתווית "שותפות בתשלום" או ב-#פרסומת.</li>
<li><b>פידבק ובאגים:</b> כל הערה עוזרת לנו להשתפר. אפשר לשלוח אותן ישר אליי, ויש גם קו ישיר למתן.</li>
</ul>
<p><b>ועוד דבר אחד:</b> נשמח לתמונת פרופיל ולכמה מילים עליך (2–3 משפטים) לעמוד השגרירים באתר שלנו.</p>
<p>מחכים לראות מה יצא לך!</p>
<p>אמיליה | MW Photo Tours</p>`),
    };
  }
  return {
    subject: "Welcome to the MWP Ambassador Program",
    html: wrap("en", `<p>Hi ${first(name)},</p>
<p>Great news: you're in! Welcome to the MWP Ambassador Program.</p>
<p>Here's everything you need to get started:</p>
<ul>
<li><b>Your tools:</b> sign in to <a href="${ACCOUNT}">My downloads</a> with this email (or create your account with it) and download the MWP - Signature Preset Pack and the MWP - PS Panel. In Photoshop, open the panel and sign in with the same email. Your license is for life, with all future updates, on up to 2 devices.</li>
<li><b>Your first 3 months:</b> 3 posts and 1 reel a month, plus 1 story a week.</li>
<li><b>Tagging:</b> @mw_phototours on Instagram and Matan Wild on Facebook, with #mwppanel #mwppresets #jointhewildsideofphotography. Please mark posts with the "Paid partnership" label or #ad.</li>
<li><b>Feedback and bugs:</b> every note helps us improve. Send them straight to me, and you also have a direct line to Matan.</li>
</ul>
<p><b>One more thing:</b> please send me a profile photo and a few words about yourself (2–3 sentences) for the ambassadors page on our website.</p>
<p>We can't wait to see what you create!</p>
<p>Emilya | MW Photo Tours</p>`),
  };
}

function decline(lang: "en" | "he", name: string) {
  if (lang === "he") {
    return {
      subject: "ההרשמה שלך לתוכנית השגרירים של MWP",
      html: wrap("he", `<p>היי ${first(name)},</p>
<p>תודה רבה על ההרשמה לתוכנית השגרירים של MWP, ועל ששיתפת אותנו בצילום שלך. היה ממש כיף להכיר.</p>
<p>אנחנו שומרים על קבוצת שגרירים קטנה מאוד, כדי שנוכל לעבוד מקרוב עם כל אחד ואחת, ולכן לא נוכל לצרף את כולם בסבב הזה.</p>
<p>נשמח מאוד להישאר בקשר. קהילת MWP והמגזין The Wild Side of Photography תמיד פתוחים בשבילך.</p>
<p>אמיליה | MW Photo Tours</p>`),
    };
  }
  return {
    subject: "Your MWP Ambassador Program application",
    html: wrap("en", `<p>Hi ${first(name)},</p>
<p>Thank you so much for applying to the MWP Ambassador Program and for sharing a bit about yourself and your photography. We really enjoyed getting to know you.</p>
<p>We keep our ambassador group very small so we can work closely with each person, which means we can't take everyone in this round.</p>
<p>We'd love to stay in touch. You're always welcome in the MWP community and in The Wild Side of Photography.</p>
<p>Emilya | MW Photo Tours</p>`),
  };
}

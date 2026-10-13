// ============================================================================
// beta — the MWP Ambassador Program page (shop.mw.photography/beta/).
//   status {}                              → { open }: is the program still taking people? (26 at most)
//   signed_terms (signed in)               → { url } of their signed-terms PDF, or 202 while it's being made
//   apply { name, email, ..., agree, lang } → { ok }: an application. The person accepted the terms (step 1)
//         and answered the questionnaire (step 2). It's saved and sent to monday.com (Shop Ambassador
//         Applications) through Make. Nothing is given yet: the team decides in monday, and the scheduler
//         (job "applications") gives approved people their tools and has Make email the answer.
// No password: the page is open to anyone with the link. Applications are limited per IP.
// (Joining on the spot, the old "join" action, is gone: access now needs the team's approval.)
// ============================================================================
import { admin, clientIp, cors, EMAIL_RE, fail, json, notifyMake, requestPersonalCopies, sha256Hex } from "../_shared/http.ts";

const TERMS_VERSION = "2026-10-13.4";   // must match TERMS_VERSION in tools/ambassador_terms.py
const MAX_APPLICATIONS_PER_HOUR = 5;  // per IP

// The questionnaire (same order and wording as the page). Answers are kept in English labels for the team.
const QUESTIONS: [string, string, boolean][] = [   // [key, label, required]
  ["phone", "Phone (WhatsApp)", true],
  ["based", "Where are you based?", true],
  ["language", "Do you prefer English or Hebrew?", true],
  ["platforms", "Other platforms they share on (Instagram and Facebook are above)", false],
  ["shoot", "What do you love to photograph?", true],
  ["years", "How long have you been photographing?", true],
  ["role", "Is photography a hobby, a side income or your profession?", true],
  ["work", "Where can we see your work?", true],
  ["software", "Which software do you edit with?", true],
  ["apps", "Photoshop, Lightroom Classic, Lightroom mobile?", true],
  ["devices", "On which devices?", true],
  ["used_before", "Have you used editing panels or presets before?", true],
  ["why", "Why would you like to be an MWP ambassador?", true],
  ["values", "What values are important to you in your photography and in the way you share it?", true],
  ["sounds_good", "Does this sound good to you?", true],
  ["feedback", "Happy to send feedback and report bugs?", true],
  ["anything_else", "Anything you'd like to ask us, or anything else you'd like to share?", false],
];

// Free text: no control characters, trimmed, capped. Double quotes become typographic ones (it travels inside JSON to monday).
const text = (v: unknown, max = 1500) =>
  String(v ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").replace(/"/g, "”").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty */ }
  const db = admin();
  const FULL = "The Ambassador Program is full. Thank you for your interest.";

  if (body.action === "status") {
    const { data: open, error } = await db.rpc("ambassador_program_open");
    if (error) { console.error(error); return fail(req, "Couldn't check the program. Please try again.", 500); }
    return json(req, { open: Boolean(open) });
  }
  if (body.action === "signed_terms") return signedTerms(req, db);
  if (body.action !== "apply") return fail(req, "Unknown action.", 400);

  const salt = Deno.env.get("IP_HASH_SALT") ?? "";
  const ipHash = clientIp(req) ? await sha256Hex(salt + clientIp(req)) : null;
  if (ipHash) {
    const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count } = await db.from("beta_attempts").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", hourAgo);
    if ((count ?? 0) >= MAX_APPLICATIONS_PER_HOUR) return fail(req, "Too many requests. Please wait a minute and try again.", 429);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const name = text(body.name, 80);
  const lang = body.lang === "he" ? "he" : "en";   // the language they read the terms in (their signed copy matches)
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 60);
  const facebook = text(body.facebook, 100);
  if (!EMAIL_RE.test(email)) return fail(req, "Please enter a valid email.", 400);
  if (!name) return fail(req, "Please enter your name.", 400);
  if (!instagram) return fail(req, "Please enter your Instagram handle.", 400);
  if (body.agree !== true) return fail(req, "Please accept the Ambassador Program terms.", 400);

  const raw = (body.answers ?? {}) as Record<string, unknown>;
  const answers: Record<string, string> = {};
  for (const [key, , required] of QUESTIONS) {
    const v = text(raw[key]);
    if (required && !v) return fail(req, "Please answer every question (only the last one is optional).", 400);
    answers[key] = v;
  }

  await db.from("beta_attempts").insert({ ip_hash: ipHash });

  // Already in, or already waiting for an answer?
  const { data: known } = await db.from("customers").select("id, beta_members(status)").eq("email", email).maybeSingle();
  const bm = Array.isArray(known?.beta_members) ? known?.beta_members[0] : known?.beta_members;
  if (bm && bm.status === "active") return json(req, { ok: true, already: "member" });
  const { data: waiting } = await db.from("ambassador_applications").select("id").eq("email", email).eq("status", "new").limit(1);
  if (waiting?.length) return json(req, { ok: true, already: "waiting" });
  if (!bm) {
    const { data: open } = await db.rpc("ambassador_program_open");
    if (open === false) return fail(req, FULL, 409);
  }

  const { data: app, error } = await db.from("ambassador_applications").insert({
    email, name, lang, instagram: instagram || null, facebook: facebook || null, answers,
    terms_version: TERMS_VERSION, ip_hash: ipHash,
  }).select("id, created_at").single();
  if (error) { console.error(error); return fail(req, "Couldn't send your application. Please try again.", 500); }

  // To monday (Shop Ambassador Applications). Line breaks are written as \n so the text fits inside Make's JSON.
  const lines = [`Name: ${name}`, `Email: ${email}`, ...QUESTIONS.map(([k, label], i) => `${i + 2}. ${label}\n${answers[k] || "-"}`)];
  const esc = (s: string) => JSON.stringify(s).slice(1, -1);
  const sent = await notifyMake("MAKE_WEBHOOK_URL", {
    type: "ambassador_application",
    application_id: app.id,
    name, email,
    language: lang === "he" ? "Hebrew" : "English",
    platforms: esc(`@${instagram}${facebook ? ` · Facebook: ${facebook}` : ""} · ${answers.platforms}`.slice(0, 900)),
    work: esc(answers.work.slice(0, 900)),
    applied_on: app.created_at.slice(0, 10),
    sounds_good: esc(answers.sounds_good),
    feedback: esc(answers.feedback),
    answers_text: esc(lines.join("\n\n")),
  });
  if (!sent) console.error("application not sent to Make", app.id);
  return json(req, { ok: true });
});

// The ambassador's own signed-terms PDF, signed in.
// deno-lint-ignore no-explicit-any
async function signedTerms(req: Request, db: any): Promise<Response> {
  let member: { agreed_at: string; terms_pdf_path: string | null; terms_pdf_made_at: string | null } | null = null;
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await db.auth.getUser(jwt);
  const email = auth?.user?.email?.toLowerCase();
  if (email) {
    const { data } = await db.from("customers")
      .select("beta_members(agreed_at, terms_pdf_path, terms_pdf_made_at)").eq("email", email).maybeSingle();
    const b = data?.beta_members;
    member = (Array.isArray(b) ? b[0] : b) ?? null;
  }
  if (!member) return fail(req, "No signed terms found.", 404);
  const ready = member.terms_pdf_path && member.terms_pdf_made_at && member.terms_pdf_made_at >= member.agreed_at;
  if (!ready) {
    await requestPersonalCopies();
    return json(req, { preparing: true }, 202);
  }
  const day = member.agreed_at.slice(0, 10);
  const { data: signed, error } = await db.storage.from("documents")
    .createSignedUrl(member.terms_pdf_path, 300, { download: `MWP Ambassador terms - signed ${day}.pdf` });
  if (error || !signed) { console.error(error); return fail(req, "Couldn't prepare your copy. Please try again.", 500); }
  return json(req, { url: signed.signedUrl });
}

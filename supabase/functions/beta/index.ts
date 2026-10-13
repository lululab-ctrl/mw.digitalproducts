// ============================================================================
// beta — the MWP Ambassador Program page (shop.mw.photography/beta/).
//   status {}                              → { open }: is the program still taking people? (26 at most)
//   signed_terms { receipt } or signed in   → { url } of their signed-terms PDF, or 202 while it's being made
//   join { name, email, instagram, facebook, agree } → { ok, receipt }: records that this person accepted
//         the Ambassador Program terms, gives their email MWP Presets, MWP Panel
//         and the Field Guides (the guides to read online only), and sends them to
//         monday.com (Shop Ambassadors) through Make. The page then emails them
//         a link to My downloads.
// No password: the page is open to anyone with the link. Sign-ups are limited
// per IP, and real protection is per person: every Presets and Field Guides
// download is stamped with their name, and MWP Panel works only with their own
// email sign-in, on up to 2 computers.
// ============================================================================
import { admin, clientIp, cors, EMAIL_RE, fail, json, notifyMake, requestPersonalCopies, sha256Hex } from "../_shared/http.ts";

const PRODUCTS = ["mwp-presets", "mwp-panel", "mwp-field-guides"];
const TERMS_VERSION = "2026-10-13.3";   // must match TERMS_VERSION in tools/ambassador_terms.py
const MAX_JOINS_PER_HOUR = 5;         // per IP

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
  if (body.action === "signed_terms") return signedTerms(req, db, body);
  if (body.action !== "join") return fail(req, "Unknown action.", 400);

  const salt = Deno.env.get("IP_HASH_SALT") ?? "";
  const ipHash = clientIp(req) ? await sha256Hex(salt + clientIp(req)) : null;

  if (ipHash) {
    const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count } = await db.from("beta_attempts").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", hourAgo);
    if ((count ?? 0) >= MAX_JOINS_PER_HOUR) return fail(req, "Too many requests. Please wait a minute and try again.", 429);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim().slice(0, 80);
  // Facebook: a name or a profile link. No quotes, angle brackets or line breaks (it goes into monday and a PDF).
  const facebook = String(body.facebook ?? "").replace(/[\u0000-\u001f"\\<>]/g, "").trim().slice(0, 100);
  const termsLang = body.lang === "he" ? "he" : "en";   // the language they read the terms in (their signed copy matches)
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 60);
  if (!EMAIL_RE.test(email)) return fail(req, "Please enter a valid email.", 400);
  if (!name) return fail(req, "Please enter your name.", 400);
  if (body.agree !== true) return fail(req, "Please agree to the Ambassador Program terms.", 400);

  await db.from("beta_attempts").insert({ ip_hash: ipHash });

  // Full? Only people who are already members can still come in (no new place taken).
  const { data: known } = await db.from("customers").select("id, beta_members(id)").eq("email", email).maybeSingle();
  const isMember = Boolean(known && (Array.isArray(known.beta_members) ? known.beta_members.length : known.beta_members));
  if (!isMember) {
    const { data: open } = await db.rpc("ambassador_program_open");
    if (open === false) return fail(req, FULL, 409);
  }

  const { data: customer, error: cErr } = await db.from("customers")
    .upsert({ email, name }, { onConflict: "email" }).select("id").single();
  if (cErr) { console.error(cErr); return fail(req, "Couldn't save your details. Please try again.", 500); }

  const { data: before } = await db.from("beta_members").select("id").eq("customer_id", customer.id).maybeSingle();
  const agreedAt = new Date();
  // A one-time receipt lets this page download their signed copy as soon as it's made (only its hash is kept).
  const receipt = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const { error: mErr } = await db.from("beta_members").upsert(
    { customer_id: customer.id, instagram: instagram || null, facebook: facebook || null, ip_hash: ipHash,
      agreed_at: agreedAt.toISOString(), terms_version: TERMS_VERSION, terms_lang: termsLang,
      receipt_hash: await sha256Hex(receipt) },
    { onConflict: "customer_id" });
  if (mErr) {
    if (/ambassador_program_full/.test(mErr.message)) return fail(req, FULL, 409);   // filled up a moment ago
    console.error(mErr); return fail(req, "Couldn't save your details. Please try again.", 500);
  }

  const { data: products } = await db.from("products").select("id, slug").in("slug", PRODUCTS);
  for (const p of products ?? []) {
    const { data: owned } = await db.from("entitlements").select("id, revoked_at")
      .eq("customer_id", customer.id).eq("product_id", p.id).maybeSingle();
    if (owned) continue;   // already has it (bought, or joined before); a revoked one stays revoked
    // Ambassadors read the Field Guides online only (see guide-view); presets and panel download as usual.
    const { error } = await db.from("entitlements").insert({
      customer_id: customer.id, product_id: p.id, view_only: p.slug === "mwp-field-guides" });
    if (error) { console.error(error); return fail(req, "Couldn't add the tools to your library. Please try again.", 500); }
  }

  await requestPersonalCopies();   // start making their marked copies right away

  // To monday.com (Shop Ambassadors). The program runs 12 months from acceptance.
  const ends = new Date(agreedAt); ends.setFullYear(ends.getFullYear() + 1);
  const firstMonths = new Date(agreedAt); firstMonths.setMonth(firstMonths.getMonth() + 3);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  await notifyMake("MAKE_WEBHOOK_URL", {
    type: "ambassador",
    rejoined: Boolean(before),
    name, email, instagram: instagram ? `@${instagram}` : "", facebook,
    agreed_on: day(agreedAt), first_months_end: day(firstMonths), ends_on: day(ends),
    terms_version: TERMS_VERSION,
    products: "MWP Presets, MWP Panel, MWP Field Guides (read online)",
  });

  return json(req, { ok: true, receipt });
});

// The ambassador's own signed-terms PDF: with the receipt from joining (good for a day), or signed in.
// deno-lint-ignore no-explicit-any
async function signedTerms(req: Request, db: any, body: Record<string, unknown>): Promise<Response> {
  let member: { agreed_at: string; terms_pdf_path: string | null; terms_pdf_made_at: string | null } | null = null;
  const receipt = String(body.receipt ?? "");
  if (/^[a-f0-9]{64}$/.test(receipt)) {
    const { data } = await db.from("beta_members").select("agreed_at, terms_pdf_path, terms_pdf_made_at")
      .eq("receipt_hash", await sha256Hex(receipt)).maybeSingle();
    if (data && Date.now() - Date.parse(data.agreed_at) < 24 * 3600 * 1000) member = data;
  } else {
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await db.auth.getUser(jwt);
    const email = auth?.user?.email?.toLowerCase();
    if (email) {
      const { data } = await db.from("customers")
        .select("beta_members(agreed_at, terms_pdf_path, terms_pdf_made_at)").eq("email", email).maybeSingle();
      const b = data?.beta_members;
      member = (Array.isArray(b) ? b[0] : b) ?? null;
    }
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

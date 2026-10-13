// ============================================================================
// beta — the MWP Ambassador Program page (shop.mw.photography/beta/).
//   status {}                              → { open }: is the program still taking people? (26 at most)
//   join { name, email, instagram, agree } → records that this person accepted
//         the Ambassador Program terms, gives their email MWP Presets, MWP Panel
//         and the Field Guides (exactly like a purchase), and sends them to
//         monday.com (Shop Ambassadors) through Make. The page then emails them
//         a link to My downloads.
// No password: the page is open to anyone with the link. Sign-ups are limited
// per IP, and real protection is per person: every Presets and Field Guides
// download is stamped with their name, and MWP Panel works only with their own
// email sign-in, on up to 2 computers.
// ============================================================================
import { admin, clientIp, cors, EMAIL_RE, fail, json, notifyMake, requestPersonalCopies, sha256Hex } from "../_shared/http.ts";

const PRODUCTS = ["mwp-presets", "mwp-panel", "mwp-field-guides"];
const TERMS_VERSION = "2026-10-13";   // date of Matan's Ambassador Program terms; change when the terms change
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
  const { error: mErr } = await db.from("beta_members").upsert(
    { customer_id: customer.id, instagram: instagram || null, ip_hash: ipHash,
      agreed_at: agreedAt.toISOString(), terms_version: TERMS_VERSION },
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
    const { error } = await db.from("entitlements").insert({ customer_id: customer.id, product_id: p.id });
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
    name, email, instagram: instagram ? `@${instagram}` : "",
    agreed_on: day(agreedAt), first_months_end: day(firstMonths), ends_on: day(ends),
    terms_version: TERMS_VERSION,
    products: "MWP Presets, MWP Panel, MWP Field Guides",
  });

  return json(req, { ok: true });
});

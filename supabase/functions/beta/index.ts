// ============================================================================
// beta — the invite-only beta page.
//   check { password }                              → is the beta password right?
//   join  { password, name, email, instagram, agree } → gives this email MWP Presets,
//         MWP Panel and the Field Guides, exactly like a purchase. The page then
//         emails them a sign-in link to My downloads.
// The password is stored only as a salted PBKDF2 hash, and wrong guesses are
// limited per IP. Real protection is per person: downloads and the Panel licence
// need the member's own email inbox.
// ============================================================================
import { admin, clientIp, cors, EMAIL_RE, fail, json, safeEqual, sha256Hex } from "../_shared/http.ts";

const SALT = "8c6faab7b9d7f0e0efaba8ecbc9ea9a8";
const ITERATIONS = 310000;
const HASH = "1edd962e3a603254e23f33afd4a24af6ce7398cbe92d5971ca0d2ff50c3a2d45";
const PRODUCTS = ["mwp-presets", "mwp-panel", "mwp-field-guides"];
const MAX_FAILS_PER_HOUR = 10;

async function passwordOk(password: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = new Uint8Array(SALT.match(/../g)!.map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, key, 256);
  const hex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return safeEqual(hex, HASH);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty */ }
  const db = admin();
  const salt = Deno.env.get("IP_HASH_SALT") ?? "";
  const ipHash = clientIp(req) ? await sha256Hex(salt + clientIp(req)) : null;

  // slow down guessing
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  if (ipHash) {
    const { count } = await db.from("beta_attempts").select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", hourAgo);
    if ((count ?? 0) >= MAX_FAILS_PER_HOUR) return fail(req, "Too many tries. Please wait an hour and try again.", 429);
  }

  const password = String(body.password ?? "").trim();
  if (!password || password.length > 100 || !(await passwordOk(password))) {
    await db.from("beta_attempts").insert({ ip_hash: ipHash });
    return fail(req, "That password isn't right.", 403);
  }

  if (body.action === "check") return json(req, { ok: true });
  if (body.action !== "join") return fail(req, "Unknown action.", 400);

  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").slice(0, 60);
  if (!EMAIL_RE.test(email)) return fail(req, "Please enter a valid email.", 400);
  if (!name) return fail(req, "Please enter your name.", 400);
  if (body.agree !== true) return fail(req, "Please agree to the beta terms.", 400);

  const { data: customer, error: cErr } = await db.from("customers")
    .upsert({ email, name }, { onConflict: "email" }).select("id").single();
  if (cErr) { console.error(cErr); return fail(req, "Couldn't save your details. Please try again.", 500); }

  await db.from("beta_members").upsert(
    { customer_id: customer.id, instagram: instagram || null, ip_hash: ipHash },
    { onConflict: "customer_id" });

  const { data: products } = await db.from("products").select("id, slug").in("slug", PRODUCTS);
  for (const p of products ?? []) {
    const { data: owned } = await db.from("entitlements").select("id, revoked_at")
      .eq("customer_id", customer.id).eq("product_id", p.id).maybeSingle();
    if (owned) continue;   // already has it (bought, or joined before); a revoked one stays revoked
    const { error } = await db.from("entitlements").insert({ customer_id: customer.id, product_id: p.id });
    if (error) { console.error(error); return fail(req, "Couldn't add the tools to your library. Please try again.", 500); }
  }

  return json(req, { ok: true });
});

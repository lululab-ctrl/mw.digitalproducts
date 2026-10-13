// ============================================================================
// tester — the testers page (shop.mw.photography/testers/), shared by link only.
//   link { email, lang } → if this email is an approved tester, emails them a one-time sign-in link back
//                    to the page. The answer is the same either way (it doesn't reveal who's a tester).
//   me (signed in) → { tester, name, products } so the page can show their downloads.
// Testers are approved in the shop admin (at most 10). Their downloads go through get-download like
// everyone's: stamped personal copies, 5-minute links, a daily limit; MWP Panel needs its licence sign-in.
// ============================================================================
import { admin, clientIp, cors, EMAIL_RE, fail, json, sha256Hex } from "../_shared/http.ts";

const SITE = Deno.env.get("SITE_URL") ?? "https://shop.mw.photography";
const MAX_LINKS_PER_HOUR = 5;   // per IP
const SLUGS = ["mwp-presets", "mwp-panel", "mwp-field-guides"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty */ }
  const db = admin();

  if (body.action === "link") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail(req, "Please enter a valid email.", 400);
    const salt = Deno.env.get("IP_HASH_SALT") ?? "";
    const ipHash = clientIp(req) ? await sha256Hex(salt + clientIp(req)) : null;
    if (ipHash) {
      const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
      const { count } = await db.from("beta_attempts").select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash).gte("created_at", hourAgo);
      if ((count ?? 0) >= MAX_LINKS_PER_HOUR) return fail(req, "Too many requests. Please wait a minute and try again.", 429);
      await db.from("beta_attempts").insert({ ip_hash: ipHash });
    }
    const { data: c } = await db.from("customers").select("id, testers(removed_at)").eq("email", email).maybeSingle();
    const t = Array.isArray(c?.testers) ? c?.testers[0] : c?.testers;
    if (t && !t.removed_at) {
      const lang = body.lang === "he" ? "he" : "en";
      const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: `${SITE}/testers/${lang === "he" ? "?lang=he" : ""}`, shouldCreateUser: true } });
      if (error) { console.error("tester link", error); return fail(req, "Couldn't send the link. Please try again in a minute.", 500); }
    }
    return json(req, { ok: true });
  }

  if (body.action === "me") {
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await db.auth.getUser(jwt);
    const email = auth?.user?.email?.toLowerCase();
    if (!email) return fail(req, "Please sign in again.", 401);
    const { data: c } = await db.from("customers").select("id, name, auth_user_id, testers(removed_at)").eq("email", email).maybeSingle();
    const t = Array.isArray(c?.testers) ? c?.testers[0] : c?.testers;
    if (!c || !t || t.removed_at) return json(req, { tester: false });
    if (!c.auth_user_id) await db.from("customers").update({ auth_user_id: auth!.user!.id }).eq("id", c.id);
    const { data: ents } = await db.from("entitlements")
      .select("revoked_at, products!inner(slug, name, name_emphasis, category, version)")
      .eq("customer_id", c.id).in("products.slug", SLUGS).is("revoked_at", null);
    // deno-lint-ignore no-explicit-any
    const products = (ents ?? []).map((e: any) => e.products).sort((a: any, b: any) => SLUGS.indexOf(a.slug) - SLUGS.indexOf(b.slug));
    return json(req, { tester: true, name: c.name, email, products });
  }

  return fail(req, "Unknown action.", 400);
});

// ============================================================================
// get-download — returns a 5-minute signed link to a pack the caller owns.
// Called from My downloads with the customer's Supabase session token.
// Checks: signed in → owns the product → access not revoked → under the daily
// limit. Every download is logged with a salted IP hash (no raw IPs stored).
// ============================================================================
// Self-contained copy for pasting into the Supabase dashboard
// (Edge Functions → Deploy a new function → Via Editor). Function name: get-download
// Generated from supabase/functions/get-download/index.ts and _shared/http.ts.
// ============================================================================
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------- shared helpers
// Browsers may call these functions only from the shop's own address.
// ALLOWED_ORIGINS is optional: without it, the origin of SITE_URL is used.
function originOf(url: string): string {
  try { return new URL(url).origin; } catch { return ""; }
}
const allowed = (Deno.env.get("ALLOWED_ORIGINS") || originOf(Deno.env.get("SITE_URL") ?? ""))
  .split(",").map((s) => s.trim()).filter(Boolean);

/** CORS headers that echo the caller's origin only if it is on the allow-list. */
export function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] ?? "",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "content-type": "application/json; charset=utf-8" },
  });
}

export const fail = (req: Request, error: string, status = 400) => json(req, { error }, status);

/** Service-role client: bypasses RLS. Only ever used server-side. */
export function admin(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Sends an event to a Make.com custom webhook. Never throws: Supabase is the
 * system of record, so a Make outage must not fail a sale or a support request.
 * The shared secret travels in the body (`secret`) and the x-mwp-secret header;
 * each Make scenario's first filter checks it.
 */
export async function notifyMake(envName: string, payload: Record<string, unknown>): Promise<boolean> {
  const url = Deno.env.get(envName);
  if (!url) { console.warn(`${envName} not set; skipped Make.com notification`); return false; }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mwp-secret": Deno.env.get("MAKE_SHARED_SECRET") ?? "" },
      body: JSON.stringify({ ...payload, secret: Deno.env.get("MAKE_SHARED_SECRET") ?? "", sent_at: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`${envName} responded ${res.status}`);
    return res.ok;
  } catch (err) {
    console.error(`${envName} failed`, err);
    return false;
  }
}

// ---------------------------------------------------------------- the function
const DAILY_LIMIT = Number(Deno.env.get("DOWNLOAD_DAILY_LIMIT") ?? "5");
const LINK_SECONDS = 300;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);

  const db = admin();
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await db.auth.getUser(jwt);
  const user = auth?.user;
  if (!user?.email) return fail(req, "Please sign in again.", 401);

  let slug = "";
  try { slug = String((await req.json()).slug ?? ""); } catch { /* handled below */ }
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return fail(req, "Unknown product.", 400);

  const email = user.email.toLowerCase();
  const { data: customer } = await db.from("customers")
    .select("id, auth_user_id").eq("email", email).maybeSingle();
  if (!customer) return fail(req, "We couldn't find a purchase on this email.", 403);
  if (!customer.auth_user_id) {
    // First sign-in: link the login to the customer record so RLS shows their library.
    await db.from("customers").update({ auth_user_id: user.id }).eq("id", customer.id);
  }

  const { data: product } = await db.from("products").select("id, name").eq("slug", slug).maybeSingle();
  if (!product) return fail(req, "Unknown product.", 404);

  const { data: ent } = await db.from("entitlements")
    .select("id, revoked_at").eq("customer_id", customer.id).eq("product_id", product.id).maybeSingle();
  if (!ent) return fail(req, "This pack isn't in your library.", 403);
  if (ent.revoked_at) return fail(req, "Access to this pack was removed after a refund.", 403);

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await db.from("downloads").select("id", { count: "exact", head: true })
    .eq("entitlement_id", ent.id).gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return fail(req, "You've reached today's download limit for this pack. Please try tomorrow or contact support.", 429);
  }

  const { data: file } = await db.from("product_files").select("path").eq("product_id", product.id).maybeSingle();
  if (!file) return fail(req, "This pack's file is being updated. Please try again shortly.", 503);

  const fileName = file.path.split("/").pop();
  const { data: signed, error } = await db.storage.from("presets")
    .createSignedUrl(file.path, LINK_SECONDS, { download: fileName });
  if (error || !signed) {
    console.error("sign failed", error);
    return fail(req, "Couldn't prepare the download. Please try again.", 500);
  }

  const salt = Deno.env.get("IP_HASH_SALT") ?? "";
  await db.from("downloads").insert({
    entitlement_id: ent.id,
    ip_hash: clientIp(req) ? await sha256Hex(salt + clientIp(req)) : null,
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  });

  return json(req, { url: signed.signedUrl, expires_in: LINK_SECONDS });
});

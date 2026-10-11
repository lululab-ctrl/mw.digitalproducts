// ============================================================================
// support — stores a support request, then hands it to Make.com, which creates
// the monday.com item and sends the auto-reply. Public (no sign-in needed).
// Abuse controls: honeypot, field limits, max 5 requests per email per hour.
// ============================================================================
// Self-contained copy for pasting into the Supabase dashboard
// (Edge Functions → Deploy a new function → Via Editor). Function name: support
// Generated from supabase/functions/support/index.ts and _shared/http.ts.
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

/** Text that Make drops into monday JSON: no quotes, backslashes or line breaks. */
export const plain = (v: unknown) => String(v ?? "").replace(/["\\\r\n]+/g, " ").trim();

/** Escapes text for the HTML body of a monday update. */
export const html = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, "<br>");

/**
 * Sends an event to a Make.com custom webhook. Never throws: Supabase is the
 * system of record, so a Make outage must not fail a sale or a support request.
 * The shared secret travels in the body (`secret`) and the x-mwp-secret header;
 * each Make scenario's first filter checks it.
 */
export async function notifyMake(envName: string, payload: Record<string, unknown>): Promise<boolean> {
  const url = Deno.env.get(envName) || Deno.env.get("MAKE_WEBHOOK_URL");
  if (!url) { console.warn(`${envName} / MAKE_WEBHOOK_URL not set; skipped Make.com notification`); return false; }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-mwp-secret": Deno.env.get("MAKE_SHARED_SECRET") ?? "" },
      body: JSON.stringify({ ...payload, sent_at: new Date().toISOString() }),
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
const CATEGORIES = new Set(["download", "install", "refund", "other"]);
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(req, "Invalid request."); }

  if (body.website) return json(req, { ok: true }); // honeypot: pretend success, store nothing

  const ticket = {
    name: clip(body.name, 120),
    email: clip(body.email, 254).toLowerCase(),
    category: CATEGORIES.has(String(body.category)) ? String(body.category) : "other",
    subject: clip(body.subject, 140),
    message: clip(body.message, 5000),
    order_number: clip(body.order_number, 40) || null,
  };
  if (!ticket.name) return fail(req, "Please add your name.");
  if (!EMAIL_RE.test(ticket.email)) return fail(req, "Please enter a valid email.");
  if (ticket.subject.length < 3) return fail(req, "Please add a subject.");
  if (ticket.message.length < 10) return fail(req, "Please tell us a little more.");

  const db = admin();
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count } = await db.from("support_tickets").select("id", { count: "exact", head: true })
    .eq("email", ticket.email).gte("created_at", hourAgo);
  if ((count ?? 0) >= 5) return fail(req, "We've received several messages from you already. We'll reply soon.", 429);

  const { data: saved, error } = await db.from("support_tickets").insert(ticket).select("id, created_at").single();
  if (error) {
    console.error(error);
    return fail(req, "Couldn't send your message. Please email us directly.", 500);
  }

  // Give whoever answers the context: what this person owns and how often they've downloaded.
  const { data: customer } = await db.from("customers")
    .select("id, name, entitlements(revoked_at, products(name), downloads(count))")
    .eq("email", ticket.email).maybeSingle();
  const owned = (customer?.entitlements ?? []).map((e: any) => ({
    product: e.products?.name, revoked: !!e.revoked_at, downloads: e.downloads?.[0]?.count ?? 0,
  }));

  await notifyMake("MAKE_SUPPORT_WEBHOOK", {
    type: "support",
    ticket_id: saved.id,
    ...ticket,
    subject: plain(ticket.subject),
    is_customer: !!customer,
    owned,
    // Ready-made body for the monday update: who wrote, what they own, and the message.
    message_html: [
      `<p><b>From:</b> ${html(ticket.name)} &lt;${html(ticket.email)}&gt;<br>`,
      `<b>Order number:</b> ${html(ticket.order_number ?? "not given")}<br>`,
      `<b>Owns:</b> ${owned.length ? owned.map((o: { product?: string; revoked: boolean; downloads: number }) =>
        `${html(o.product)}${o.revoked ? " (refunded)" : ""}, ${o.downloads} download${o.downloads === 1 ? "" : "s"}`).join("; ") : "nothing yet"}</p>`,
      `<p>${html(ticket.message)}</p>`,
    ].join(""),
    created_at: saved.created_at,
  });

  return json(req, { ok: true, id: saved.id });
});

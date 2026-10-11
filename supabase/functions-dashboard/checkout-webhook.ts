// ============================================================================
// checkout-webhook — receives Lemon Squeezy order events.
// Deploy with JWT verification OFF (the checkout provider can't send a Supabase token):
//   supabase functions deploy checkout-webhook --no-verify-jwt
// Events handled: order_created (status paid) and order_refunded.
// Idempotent: each event is recorded in webhook_events after it succeeds, and a
// repeat delivery of the same event returns 200 without doing anything twice.
// ============================================================================
// Self-contained copy for pasting into the Supabase dashboard
// (Edge Functions → Deploy a new function → Via Editor). Function name: checkout-webhook
// Generated from supabase/functions/checkout-webhook/index.ts and _shared/http.ts.
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
const SECRET = Deno.env.get("CHECKOUT_WEBHOOK_SECRET") ?? "";

type LsOrder = {
  meta: { event_name: string; test_mode?: boolean; custom_data?: Record<string, string> };
  data: {
    id: string;
    attributes: {
      order_number: number; identifier: string; status: string;
      user_email: string; user_name: string; currency: string;
      subtotal: number; tax: number; total: number;
      discount_total?: number; refunded?: boolean; refunded_at?: string | null; refunded_amount?: number;
      created_at?: string; urls?: { receipt?: string };
      first_order_item: { variant_id: number; product_name: string; variant_name: string; price: number };
    };
  };
};

const text = (body: string, status = 200) => new Response(body, { status });

Deno.serve(async (req) => {
  if (req.method !== "POST") return text("method not allowed", 405);
  if (!SECRET) return text("webhook secret not configured", 500);

  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  if (!signature || !safeEqual(await hmacHex(SECRET, raw), signature)) return text("bad signature", 401);

  let body: LsOrder;
  try { body = JSON.parse(raw); } catch { return text("bad json", 400); }

  const db = admin();
  const event = body.meta?.event_name;
  const orderId = String(body.data?.id ?? "");
  const a = body.data?.attributes;
  if (!event || !orderId || !a) return text("unexpected payload", 400);

  const eventId = event === "order_refunded" ? `${event}:${orderId}:${a.refunded_at ?? ""}` : `${event}:${orderId}`;
  const { data: seen } = await db.from("webhook_events").select("event_id").eq("event_id", eventId).maybeSingle();
  if (seen) return text("already processed");

  try {
    if (event === "order_created") {
      if (a.status !== "paid") return text(`ignored status ${a.status}`);
      await handlePaid(db, orderId, a, body.meta.custom_data ?? {}, body.meta.test_mode === true);
    } else if (event === "order_refunded") {
      await handleRefund(db, orderId, a.refunded !== false, a, body.meta.test_mode === true);
    } else {
      return text(`ignored ${event}`);
    }
    await db.from("webhook_events").insert({ event_id: eventId, provider: "lemonsqueezy", payload: body });
    return text("ok");
  } catch (err) {
    // Non-2xx makes Lemon Squeezy retry later; nothing is half-recorded as processed.
    console.error(eventId, err);
    return text("processing failed", 500);
  }
});

async function handlePaid(
  db: SupabaseClient, orderId: string, a: LsOrder["data"]["attributes"], custom: Record<string, string>, testMode: boolean,
) {
  const email = a.user_email.trim().toLowerCase();

  const { data: product, error: pErr } = await db.from("products")
    .select("id, name, name_emphasis, slug")
    .eq("checkout_variant_id", String(a.first_order_item.variant_id)).maybeSingle();
  if (pErr) throw pErr;
  if (!product) throw new Error(`no product for variant ${a.first_order_item.variant_id}`);

  const { data: customer, error: cErr } = await db.from("customers")
    .upsert({ email, name: a.user_name || null }, { onConflict: "email" })
    .select("id, email, name, created_at").single();
  if (cErr) throw cErr;

  const { data: order, error: oErr } = await db.from("orders").upsert({
    checkout_order_id: orderId,
    order_number: String(a.order_number),
    customer_id: customer.id,
    subtotal_cents: a.subtotal,
    tax_cents: a.tax,
    total_cents: a.total,
    currency: a.currency,
    status: "paid",
    source: custom.source?.slice(0, 64) ?? null,
  }, { onConflict: "checkout_order_id" }).select("id").single();
  if (oErr) throw oErr;

  const { error: iErr } = await db.from("order_items")
    .upsert({ order_id: order.id, product_id: product.id, price_cents: a.subtotal }, { onConflict: "order_id,product_id" });
  if (iErr) throw iErr;

  const { error: eErr } = await db.from("entitlements").upsert(
    { customer_id: customer.id, product_id: product.id, order_id: order.id, revoked_at: null },
    { onConflict: "customer_id,product_id" });
  if (eErr) throw eErr;

  const { count } = await db.from("orders").select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id).eq("status", "paid");

  await notifyMake("MAKE_ORDER_WEBHOOK", {
    type: "order",
    order_id: order.id,
    checkout_order_id: orderId,
    order_number: String(a.order_number),
    order_date: (a.created_at ?? new Date().toISOString()).slice(0, 10),
    test_mode: testMode,
    email,
    name: a.user_name,
    product: [product.name, product.name_emphasis].filter(Boolean).join(" "),
    product_slug: product.slug,
    subtotal: a.subtotal / 100,
    discount: (a.discount_total ?? 0) / 100,
    tax: a.tax / 100,
    total: a.total / 100,
    currency: a.currency,
    receipt_url: a.urls?.receipt ?? null,
    source: custom.source ?? null,
    repeat_customer: (count ?? 1) > 1,
    downloads_url: `${Deno.env.get("SITE_URL")}/account.html?email=${encodeURIComponent(email)}`,
  });
}

// A full refund revokes access; a partial refund (a goodwill partial credit) keeps it.
async function handleRefund(
  db: SupabaseClient, orderId: string, full: boolean, a: LsOrder["data"]["attributes"], testMode: boolean,
) {
  const { data: order, error } = await db.from("orders")
    .update({ status: full ? "refunded" : "partially_refunded", refunded_at: new Date().toISOString() })
    .eq("checkout_order_id", orderId).select("id, order_number, customer_id").maybeSingle();
  if (error) throw error;
  if (!order) throw new Error(`refund for unknown order ${orderId}`); // retried until the order exists

  if (full) {
    const { error: rErr } = await db.from("entitlements")
      .update({ revoked_at: new Date().toISOString() }).eq("order_id", order.id);
    if (rErr) throw rErr;
  }

  const { data: customer } = await db.from("customers").select("email").eq("id", order.customer_id).single();
  await notifyMake("MAKE_ORDER_WEBHOOK", {
    type: full ? "refund" : "partial_refund", order_id: order.id, checkout_order_id: orderId,
    order_number: order.order_number, email: customer?.email, test_mode: testMode,
    refunded_amount: (a.refunded_amount ?? (full ? a.total : 0)) / 100, currency: a.currency,
  });
}

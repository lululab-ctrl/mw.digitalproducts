// ============================================================================
// support — stores a support request, then hands it to Make.com, which creates
// the monday.com item and sends the auto-reply. Public (no sign-in needed).
// Abuse controls: honeypot, field limits, max 5 requests per email per hour.
// ============================================================================
import { admin, cors, EMAIL_RE, fail, json, notifyMake } from "../_shared/http.ts";

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
    is_customer: !!customer,
    owned,
    created_at: saved.created_at,
  });

  return json(req, { ok: true, id: saved.id });
});

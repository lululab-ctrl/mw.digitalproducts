// ============================================================================
// subscribe — free sampler / newsletter sign-up. Stores the address with its
// consent, then Make.com adds it to the MailerLite group that sends the sampler.
// Repeat sign-ups are harmless (upsert) and still re-send the sampler via Make.
// ============================================================================
import { admin, cors, EMAIL_RE, fail, json, notifyMake } from "../_shared/http.ts";

const SOURCES = new Set(["free-sampler", "newsletter", "launch-waitlist"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "Method not allowed", 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(req, "Invalid request."); }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  const source = SOURCES.has(String(body.source)) ? String(body.source) : "free-sampler";
  if (!EMAIL_RE.test(email)) return fail(req, "Please enter a valid email address.");

  const db = admin();
  const { error } = await db.from("subscribers")
    .upsert({ email, source, consent: true }, { onConflict: "email", ignoreDuplicates: false });
  if (error) {
    console.error(error);
    return fail(req, "Couldn't sign you up just now. Please try again.", 500);
  }

  await notifyMake("MAKE_SUBSCRIBE_WEBHOOK", { type: "subscribe", email, source });
  return json(req, { ok: true });
});

// Ambassadors who are signed in start at My downloads when they come back to the site.
// Only when they arrive (a new visit, not when they click around the site), so the home page is still
// one click away. An ambassador is someone whose Field Guides are read-only (entitlements.view_only).
import { supabase, currentUser } from "./api.js";

export async function ambassadorLanding() {
  try {
    if (sessionStorage.getItem("mwp_landed")) return;   // once per visit
    sessionStorage.setItem("mwp_landed", "1");
  } catch { return; }
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin) return;   // moving around the site
  } catch { /* odd referrer: treat as arriving */ }
  if (!supabase) return;
  const user = await currentUser().catch(() => null);
  if (!user) return;
  const { data } = await supabase.from("entitlements").select("id").eq("view_only", true).is("revoked_at", null).limit(1);
  if (data && data.length) location.replace("/account.html");
}

// Prices on the home and sales pages. Every price spot is <span data-price="slug"> (plus data-was for a
// struck-out "before" price). They read the prices set in the admin; until a product has a price there,
// the spot shows 0.00. English shows dollars, Hebrew shows shekels.
import { CONFIG } from "../config.js";

let rows = null;

const he = () => document.documentElement.lang === "he";
const fmt = (cents, cur) => {
  const n = (cents || 0) / 100;
  const num = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (cur === "ILS") return "₪" + num;
  if (cur === "USD") return "$" + num;
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(n); } catch { return num + " " + cur; }
};

function textFor(el) {
  const r = rows && rows[el.dataset.price];
  const was = el.hasAttribute("data-was");
  if (he()) {
    const c = r ? (was ? r.compare_at_ils_cents : r.price_ils_cents) : null;
    return fmt(c, "ILS");
  }
  const c = r ? (was ? r.compare_at_cents : r.price_cents) : null;
  return fmt(c, r?.currency || "USD");
}

function paint(root = document) {
  root.querySelectorAll("[data-price]").forEach((el) => {
    const t = textFor(el);
    if (el.textContent !== t) el.textContent = t;
  });
}

async function load() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) return;
  try {
    const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/page_prices?select=*`, {
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return;
    rows = {};
    (await res.json()).forEach((r) => { rows[r.slug] = r; });
    paint();
  } catch { /* offline or not set up yet: the 0.00 placeholders stay */ }
}

export function initPrices() {
  paint();
  load();
  // the sales pages re-render parts of the page, and the home page switches language in place
  let queued = false;
  new MutationObserver(() => {
    if (queued) return; queued = true;
    requestAnimationFrame(() => { queued = false; paint(); });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["lang"] });
}

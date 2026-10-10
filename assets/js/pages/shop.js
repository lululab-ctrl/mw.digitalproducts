// Shop: every live product, with category chips, search and sort. State lives in the URL
// (?cat=plugin&q=snow&sort=price-asc) so filtered views can be shared and bookmarked.
import { initChrome, productCardHTML, skeletonCards } from "../lib/ui.js";
import { listProducts, esc } from "../lib/api.js";
import { CATEGORIES, categoryOf } from "../lib/catalog.js";

initChrome();

const grid = document.getElementById("shop-grid");
const chips = document.getElementById("shop-cats");
const search = document.getElementById("shop-q");
const sort = document.getElementById("shop-sort");
const count = document.getElementById("shop-count");
const title = document.getElementById("shop-title");

const params = new URLSearchParams(location.search);
const state = {
  cat: CATEGORIES[params.get("cat")] ? params.get("cat") : "all",
  q: (params.get("q") || "").slice(0, 80),
  sort: ["featured", "newest", "price-asc", "price-desc"].includes(params.get("sort")) ? params.get("sort") : "featured",
};
search.value = state.q;
sort.value = state.sort;

let all = [];

function syncUrl() {
  const p = new URLSearchParams();
  if (state.cat !== "all") p.set("cat", state.cat);
  if (state.q) p.set("q", state.q);
  if (state.sort !== "featured") p.set("sort", state.sort);
  history.replaceState(null, "", `${location.pathname}${p.toString() ? "?" + p : ""}`);
}

function renderChips() {
  const present = new Set(all.map(categoryOf));
  const keys = ["all", ...Object.keys(CATEGORIES).filter((k) => present.has(k))];
  chips.innerHTML = keys.map((k) => `
    <button type="button" class="chip" data-cat="${k}" aria-pressed="${state.cat === k}">
      ${k === "all" ? "All products" : esc(CATEGORIES[k].label)}
    </button>`).join("");
}

function render() {
  const q = state.q.toLowerCase();
  let list = all.filter((p) =>
    (state.cat === "all" || categoryOf(p) === state.cat) &&
    (!q || `${p.name} ${p.name_emphasis || ""} ${p.tagline || ""} ${p.description || ""}`.toLowerCase().includes(q)));
  const by = {
    featured: (a, b) => (b.is_featured - a.is_featured) || (a.sort_order - b.sort_order),
    newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    "price-asc": (a, b) => a.price_cents - b.price_cents,
    "price-desc": (a, b) => b.price_cents - a.price_cents,
  }[state.sort];
  list = [...list].sort(by);

  title.textContent = state.cat === "all" ? "All products" : CATEGORIES[state.cat].label;
  count.textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join("")
    : `<div class="empty">${all.length
        ? `Nothing matches${state.q ? ` "${esc(state.q)}"` : ""} here. <button type="button" class="link" data-reset style="background:none;border:0;padding:0">Show all products</button>`
        : "The first products are being prepared. Check back soon."}</div>`;
  chips.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
  syncUrl();
}

chips.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.cat = b.dataset.cat;
  render();
});
let t;
search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value.trim(); render(); }, 150); });
document.getElementById("shop-search").addEventListener("submit", (e) => e.preventDefault());
sort.addEventListener("change", () => { state.sort = sort.value; render(); });
grid.addEventListener("click", (e) => {
  if (!e.target.closest("[data-reset]")) return;
  Object.assign(state, { cat: "all", q: "" });
  search.value = "";
  render();
});

async function load() {
  grid.innerHTML = skeletonCards(8);
  try {
    all = await listProducts();
    renderChips();
    render();
  } catch (err) {
    grid.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

load();

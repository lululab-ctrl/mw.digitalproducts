// Home: category shelf with live counts, featured products, free sampler sign-up.
import { initChrome, productCardHTML, skeletonCards, toast } from "../lib/ui.js";
import { listProducts, subscribe, esc } from "../lib/api.js";
import { CATEGORIES, ICONS, SHELF_ORDER, categoryOf } from "../lib/catalog.js";
import { bindSubscribeForm } from "./shared-forms.js";

initChrome();

const shelf = document.getElementById("shelf");
const grid = document.getElementById("featured-grid");

// A category with exactly one product (the plugin, for now) opens that product directly.
function shelfHTML(counts, only = {}) {
  return SHELF_ORDER.map((key, i) => {
    const c = CATEGORIES[key];
    const n = counts[key] || 0;
    const href = n === 1 && only[key] ? `product.html?p=${encodeURIComponent(only[key])}` : `shop.html?cat=${key}`;
    return `
      <a class="shelf__tile${i === 0 ? " shelf__tile--feature" : ""}" href="${href}">
        <span class="shelf__icon">${ICONS[key]}</span>
        <span class="shelf__count">${n ? `${n} ${n === 1 ? "product" : "products"}` : "Coming soon"}</span>
        <span class="shelf__name">${esc(c.label)}</span>
        <span class="shelf__desc">${esc(c.desc)}</span>
      </a>`;
  }).join("");
}

// Show the shelf straight away, then fill in the counts
shelf.innerHTML = shelfHTML({});

async function load() {
  grid.innerHTML = skeletonCards(4);
  try {
    const all = await listProducts();
    const counts = all.reduce((acc, p) => { acc[categoryOf(p)] = (acc[categoryOf(p)] || 0) + 1; return acc; }, {});
    const only = Object.fromEntries(all.map((p) => [categoryOf(p), p.slug]));
    shelf.innerHTML = shelfHTML(counts, only);
    const featured = all.filter((p) => p.is_featured);
    const show = (featured.length ? featured : all).slice(0, 8);
    grid.innerHTML = show.length
      ? show.map(productCardHTML).join("")
      : `<p class="empty">The first products are being prepared. Get the free sampler below and you'll hear the moment they're out.</p>`;
  } catch (err) {
    grid.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

load();
bindSubscribeForm(document.getElementById("sampler-form"), subscribe, toast);

// Hero search sends people to the shop with their query
document.getElementById("hero-search")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = new FormData(e.currentTarget).get("q")?.toString().trim();
  location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
});

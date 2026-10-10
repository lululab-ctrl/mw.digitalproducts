// Shop: every active pack, filterable by compatibility.
import { initChrome, initReveal, productCardHTML, skeletonCards } from "../lib/ui.js";
import { listProducts, esc } from "../lib/api.js";

initChrome();

const grid = document.getElementById("shop-grid");
const filters = document.getElementById("shop-filters");
let all = [];

function render(filter) {
  const list = filter === "all" ? all : all.filter((p) => p.compatibility.includes(filter));
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join("")
    : `<p class="empty">No packs for this program yet.</p>`;
  initReveal(grid);
}

async function load() {
  grid.innerHTML = skeletonCards(6);
  try {
    all = await listProducts();
    if (!all.length) {
      grid.innerHTML = `<p class="empty">The first collection is on its way. <a class="link" href="index.html#sampler">Get the free sampler</a> meanwhile.</p>`;
      return;
    }
    const programs = [...new Set(all.flatMap((p) => p.compatibility))].sort();
    if (programs.length > 1) {
      filters.innerHTML = ["all", ...programs].map((p, i) =>
        `<button type="button" class="btn btn--sm ${i ? "btn--ghost" : ""}" data-filter="${esc(p)}" aria-pressed="${i === 0}">${p === "all" ? "All packs" : esc(p)}</button>`).join("");
      filters.hidden = false;
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        filters.querySelectorAll("button").forEach((b) => {
          const on = b === btn;
          b.setAttribute("aria-pressed", String(on));
          b.classList.toggle("btn--ghost", !on);
        });
        render(btn.dataset.filter);
      });
    }
    render("all");
  } catch (err) {
    grid.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

load();

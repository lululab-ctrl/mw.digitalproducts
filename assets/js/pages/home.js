// Home: featured packs, a hero before/after from the first featured pack, sampler sign-up.
import { initChrome, initReveal, initBeforeAfter, productCardHTML, skeletonCards, beforeAfterHTML, toast } from "../lib/ui.js";
import { listProducts, getProduct, splitMedia, subscribe, esc } from "../lib/api.js";
import { bindSubscribeForm } from "./shared-forms.js";

initChrome();

const grid = document.getElementById("featured-grid");
const compare = document.getElementById("home-compare");

async function loadFeatured() {
  grid.innerHTML = skeletonCards(3);
  try {
    let products = await listProducts({ featuredOnly: true });
    if (!products.length) products = (await listProducts()).slice(0, 3);
    if (!products.length) {
      grid.innerHTML = `<p class="empty">The first collection is on its way. Join the list below to hear first.</p>`;
      return;
    }
    grid.innerHTML = products.map(productCardHTML).join("");
    initReveal(grid);

    // Show the first real before/after we can find
    for (const p of products) {
      const full = await getProduct(p.slug);
      const { pairs } = splitMedia(full?.product_media);
      if (pairs.length) {
        compare.innerHTML = beforeAfterHTML(pairs[0]);
        document.getElementById("compare-section").hidden = false;
        initBeforeAfter(compare);
        break;
      }
    }
  } catch (err) {
    grid.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

loadFeatured();
bindSubscribeForm(document.getElementById("sampler-form"), subscribe, toast);

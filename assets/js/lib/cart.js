// Header icons (cart + my downloads) and the cart drawer. Standalone: no imports, works on every shop page.
// Icons show no text; the label appears only on hover, keyboard focus, or when tapped/clicked.
const KEY = "mwp_cart";
const he = () => document.documentElement.lang === "he";
const T = (en, hb) => (he() ? hb : en);

const SVG = {
  cart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/></svg>',
  dl: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

const CSS = `
.nav-icons,.cart-panel,.cart-panel button{font-family:Montserrat,"Google Sans Flex",Heebo,system-ui,sans-serif}
[dir=rtl] .cart-panel,[dir=rtl] .cart-panel button,[dir=rtl] .nav-icons{font-family:Heebo,Montserrat,system-ui,sans-serif}
.nav-icons{display:inline-flex;align-items:center;gap:4px;flex:none}
.nav-ico{position:relative;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;border:0;background:none;color:inherit;cursor:pointer;text-decoration:none;padding:0;-webkit-tap-highlight-color:transparent}
.nav-ico:hover,.nav-ico.show-tip{background:rgba(254,251,241,.08)}
.nav-ico:focus-visible{outline:2px solid #F4AF56;outline-offset:2px}
.nav-ico .tip{position:absolute;top:calc(100% + 8px);left:50%;transform:translate(-50%,-4px);white-space:nowrap;padding:6px 10px;border-radius:8px;background:#FEFBF1;color:#0A0908;font-weight:600;font-size:12px;line-height:1.2;;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s;z-index:5}
.nav-ico.show-tip .tip{opacity:1;transform:translate(-50%,0)}
@media (hover:hover){.nav-ico:hover .tip{opacity:1;transform:translate(-50%,0)}}
.nav-ico:focus-visible .tip{opacity:1;transform:translate(-50%,0)}
.nav-ico .count{position:absolute;top:4px;right:3px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#F4AF56;color:#0A0908;font-weight:700;font-size:11px;line-height:17px;;text-align:center}
.nav-ico .count[hidden]{display:none}
.cart-scrim{position:fixed;inset:0;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .2s;z-index:90}
.cart-panel{position:fixed;top:0;bottom:0;inset-inline-end:0;width:min(420px,100vw);background:#141210;color:#FEFBF1;border-inline-start:1px solid rgba(156,177,194,.18);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s cubic-bezier(.16,1,.3,1);z-index:91;}
[dir=rtl] .cart-panel{transform:translateX(-100%)}
.cart-open .cart-scrim{opacity:1;pointer-events:auto}
.cart-open .cart-panel{transform:none}
.cart-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid rgba(156,177,194,.15)}
.cart-head h2{margin:0;font-size:20px;font-weight:800}
.cart-x{width:40px;height:40px;border-radius:50%;border:0;background:none;color:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.cart-x:hover{background:rgba(254,251,241,.08)}
.cart-body{flex:1;overflow:auto;padding:8px 22px}
.cart-empty{padding:48px 0;text-align:center;color:#CDD7DD}
.cart-empty a{display:inline-block;margin-top:14px;color:#F4AF56;font-weight:700}
.cart-row{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(156,177,194,.12)}
.cart-row img,.cart-row .cart-ph{width:64px;height:64px;border-radius:10px;object-fit:cover;background:#262626}
.cart-row .nm{font-weight:700;line-height:1.3}
.cart-row .pr{font-size:14px;color:#CDD7DD;margin-top:2px}
.cart-row .acts{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.cart-row button,.cart-row a.pay{border:0;background:none;color:#9CB1C2;font-weight:600;font-size:13px;;cursor:pointer;padding:4px 0;text-decoration:underline;text-underline-offset:3px}
.cart-row a.pay{color:#F4AF56}
.cart-foot{padding:18px 22px 24px;border-top:1px solid rgba(156,177,194,.15);display:grid;gap:12px}
.cart-total{display:flex;justify-content:space-between;font-weight:800;font-size:17px}
.cart-go{display:flex;align-items:center;justify-content:center;min-height:50px;border-radius:30px;border:0;background:linear-gradient(90deg,#E4AA7C,#F4AF56);color:#0A0908;font-weight:800;font-size:16px;;text-decoration:none;cursor:pointer}
.cart-go[aria-disabled=true]{opacity:.45;pointer-events:none}
.cart-note{margin:0;font-size:13px;color:#9CB1C2;text-align:center}
@media (max-width:900px){.site-header .nav-icons{margin-inline-start:auto}.site-header .nav-icons + .lang-toggle{margin-inline-start:0}}
`;

export function getCart() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
}
function save(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode: cart lives for this page only */ }
  memory = items;
  refresh();
}
let memory = null;
const items = () => memory || (memory = getCart());

export function addToCart(p) {
  const list = items().filter((i) => i.slug !== p.slug);
  list.push({ slug: p.slug, name: p.name, price_cents: p.price_cents ?? null, currency: p.currency || "USD", checkout_url: p.checkout_url || null, image: p.image || null });
  save(list);
  openCart();
}
function removeFromCart(slug) { save(items().filter((i) => i.slug !== slug)); }

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function money(cents, cur) {
  if (cents == null) return "";
  try { return new Intl.NumberFormat(he() ? "he-IL" : "en-US", { style: "currency", currency: cur || "USD" }).format(cents / 100); }
  catch { return (cents / 100).toFixed(2) + " " + cur; }
}

function render() {
  const body = document.querySelector(".cart-body"), foot = document.querySelector(".cart-foot");
  if (!body) return;
  const list = items();
  if (!list.length) {
    body.innerHTML = `<div class="cart-empty"><p>${T("Your cart is empty.", "העגלה ריקה.")}</p><a href="${base()}index.html#shop">${T("Browse the products", "לכל המוצרים")}</a></div>`;
    foot.hidden = true;
    return;
  }
  foot.hidden = false;
  const several = list.length > 1;
  body.innerHTML = list.map((i) => `<div class="cart-row">
      ${i.image ? `<img src="${esc(i.image)}" alt="">` : `<span class="cart-ph"></span>`}
      <div><div class="nm" data-no-i18n>${esc(i.name)}</div><div class="pr">${money(i.price_cents, i.currency)}</div></div>
      <div class="acts">${several && i.checkout_url ? `<a class="pay" href="${esc(i.checkout_url)}">${T("Pay", "לתשלום")}</a>` : ""}<button type="button" data-remove="${esc(i.slug)}">${T("Remove", "הסרה")}</button></div>
    </div>`).join("");
  const cur = list[0].currency;
  const known = list.every((i) => i.price_cents != null);
  const total = list.reduce((s, i) => s + (i.price_cents || 0), 0);
  const ready = list.filter((i) => i.checkout_url);
  let go, note = "";
  if (!ready.length) {
    go = `<a class="cart-go" aria-disabled="true">${T("Checkout", "לתשלום")}</a>`;
    note = T("Checkout opens at launch.", "התשלום ייפתח בהשקה.");
  } else if (!several) {
    go = `<a class="cart-go" href="${esc(ready[0].checkout_url)}">${T("Checkout", "לתשלום")}</a>`;
  } else {
    go = "";
    note = T("Each product has its own secure checkout. Tap Pay next to each one.", "לכל מוצר יש תשלום מאובטח משלו. לחצו על \"לתשלום\" ליד כל מוצר.");
  }
  foot.innerHTML = `${known ? `<div class="cart-total"><span>${T("Total", "סה״כ")}</span><span>${money(total, cur)}</span></div>` : ""}${go}${note ? `<p class="cart-note">${note}</p>` : ""}`;
}

function refresh() {
  const n = items().length;
  document.querySelectorAll(".nav-ico .count").forEach((c) => { c.textContent = n; c.hidden = !n; });
  const btn = document.querySelector(".nav-ico[data-cart]");
  if (btn) btn.setAttribute("aria-label", n ? T(`Cart, ${n} items`, `עגלה, ${n} פריטים`) : T("Cart", "עגלה"));
  render();
}

let lastFocus = null;
export function openCart() {
  lastFocus = document.activeElement;
  document.documentElement.classList.add("cart-open");
  document.querySelector(".cart-panel")?.removeAttribute("inert");
  render();
  document.querySelector(".cart-x")?.focus();
}
function closeCart() {
  document.documentElement.classList.remove("cart-open");
  document.querySelector(".cart-panel")?.setAttribute("inert", "");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

// Pages live at the root or one folder down (presets/, panel/...); links need the right prefix.
function base() { return document.querySelector("base") ? "" : (/\/(presets|panel|field-guides)\//.test(location.pathname) ? "../" : ""); }

function showTip(el) {
  el.classList.add("show-tip");
  clearTimeout(el.__tip);
  el.__tip = setTimeout(() => el.classList.remove("show-tip"), 1600);
}

export function navIconsInner() {
  return `<a class="nav-ico" href="${base()}account.html" aria-label="${T("My downloads", "ההורדות שלי")}">${SVG.dl}<span class="tip">${T("My downloads", "ההורדות שלי")}</span></a>
    <button class="nav-ico" type="button" data-cart aria-label="${T("Cart", "עגלה")}" aria-haspopup="dialog">${SVG.cart}<span class="count" hidden>0</span><span class="tip">${T("Cart", "עגלה")}</span></button>`;
}

export function initCart() {
  if (document.querySelector(".cart-panel")) return;
  // Pages can ship the icons in their own markup (the sales pages do); otherwise they are added to the header.
  let wrap = document.querySelector(".nav-icons");
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  if (!wrap) {
    const host = document.querySelector(".site-header .container") || document.querySelector(".site-header");
    if (!host) return;
    wrap = document.createElement("div");
    wrap.className = "nav-icons";
    wrap.innerHTML = navIconsInner();
    wrap.setAttribute("data-no-i18n", "");
    // Sit with the other right-hand links when the page has a group for them (home), else just before the language switch.
    const group = host.querySelector(".navr");
    if (group) group.appendChild(wrap);
    else host.insertBefore(wrap, host.querySelector(".lang-toggle"));
  } else {
    // Sales pages re-render their markup in place; put the cart count back if a re-render resets it.
    new MutationObserver(() => {
      const n = items().length, c = wrap.querySelector(".count");
      if (c && (c.textContent !== String(n) || c.hidden !== !n)) { c.textContent = n; c.hidden = !n; }
    }).observe(wrap, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden"] });
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-scrim" data-close></div>
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" inert data-no-i18n>
      <div class="cart-head"><h2 id="cart-title">${T("Cart", "עגלה")}</h2><button class="cart-x" type="button" data-close aria-label="${T("Close", "סגירה")}">${SVG.x}</button></div>
      <div class="cart-body"></div>
      <div class="cart-foot" hidden></div>
    </aside>`);

  // The label shows when the icon is tapped or clicked (and on hover / keyboard focus).
  wrap.querySelectorAll(".nav-ico").forEach((el) => el.addEventListener("pointerdown", () => showTip(el)));
  wrap.querySelector("[data-cart]").addEventListener("click", (e) => { showTip(e.currentTarget); openCart(); });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeCart();
    const rm = e.target.closest("[data-remove]");
    if (rm) removeFromCart(rm.getAttribute("data-remove"));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.documentElement.classList.contains("cart-open")) closeCart(); });
  window.addEventListener("storage", (e) => { if (e.key === KEY) { memory = null; refresh(); } });
  refresh();
}

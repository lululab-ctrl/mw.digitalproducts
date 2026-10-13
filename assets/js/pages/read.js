// Read online: the MWP Field Guides, page by page (shop.mw.photography/read/).
// Ambassadors can only read the guides here; buyers can too. The pages come from the guide-view function
// as private links that last 10 minutes, drawn on a canvas. No download, no print.
import { initChrome } from "../lib/ui.js";
import { currentUser, guideView, esc } from "../lib/api.js";

initChrome();

const body = document.getElementById("rd-body");
const he = () => document.documentElement.lang === "he";
const T = (en, hb) => (he() ? hb : en);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LINKS_GOOD_FOR = 9 * 60000;   // the server's links last 10 minutes; ask again a little before

function message(html) { body.innerHTML = `<div class="rd-msg">${html}</div>`; }

let data = null, fetchedAt = 0, current = 0, refreshing = null;

async function load() {
  const started = Date.now();
  let r = await guideView();
  while (r.preparing && Date.now() - started < 15 * 60000) {
    message(`<p>${esc(T("We're getting the guides ready to read online. This page will open them as soon as they're ready (usually a few minutes).",
      "אנחנו מכינים את המדריכים לקריאה אונליין. הדף יפתח אותם ברגע שיהיו מוכנים (בדרך כלל כמה דקות)."))}</p>`);
    await wait(15000);
    r = await guideView();
  }
  if (r.preparing) throw new Error(T("The guides are still being prepared. Please come back in a little while.", "המדריכים עדיין בהכנה. חזרו בעוד קצת."));
  data = r; fetchedAt = Date.now();
}

// Fresh links when the current ones are about to run out.
async function fresh() {
  if (Date.now() - fetchedAt < LINKS_GOOD_FOR) return;
  refreshing ??= guideView().then((r) => { if (!r.preparing) { data = r; fetchedAt = Date.now(); } }).finally(() => { refreshing = null; });
  await refreshing;
}

async function draw(el) {
  if (el.dataset.drawn) return;
  el.dataset.drawn = "1";
  const [g, p] = el.dataset.page.split(":").map(Number);
  for (let attempt = 0; attempt < 2; attempt++) {
    await fresh();
    const page = data.guides[g]?.pages[p];
    if (!page?.url) return;
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = page.url;
      await img.decode();
      const c = el.querySelector("canvas");
      c.width = page.w; c.height = page.h;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, page.w, page.h);
      return;
    } catch {
      fetchedAt = 0;   // the link may have run out: get new ones and try once more
    }
  }
  delete el.dataset.drawn;
}

// ---------------------------------------------------------------- the reader
// A guide picker, Scroll or Page-by-page, arrows (and arrow keys, swipe), and full screen.
// English pages show the English guides, Hebrew pages the Hebrew ones.
const ICONS = {
  prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  full: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  exit: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
};
const MODE_KEY = "mwp_read_mode";
let mode = (() => { try { return localStorage.getItem(MODE_KEY) === "pages" ? "pages" : "scroll"; } catch { return "scroll"; } })();
let page = 0, list = [];   // list: indexes into data.guides for this language

const nearby = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) draw(e.target); }), { rootMargin: "1200px 0px" })
  : null;
// in Scroll mode, the current page is the one at the top of the screen, just under the toolbar
function trackScroll() {
  if (mode !== "scroll" || !document.getElementById("rd-bar")) return;
  const line = document.getElementById("rd-bar").getBoundingClientRect().bottom + 60;
  const els = allPages();
  let k = 0;
  els.forEach((el, n) => { if (el.getBoundingClientRect().top <= line) k = n; });
  if (k !== page) { page = k; counter(); }
}
let ticking = false;
const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; trackScroll(); }); } };
window.addEventListener("scroll", onScroll, { passive: true });
document.addEventListener("scroll", onScroll, { passive: true, capture: true });   // also inside full screen

const pagesEl = () => document.getElementById("rd-pages");
const allPages = () => [...pagesEl().querySelectorAll(".rd-page")];

function counter() {
  const n = allPages().length;
  document.getElementById("rd-count").textContent = `${page + 1} / ${n}`;
  document.getElementById("rd-prev").disabled = page <= 0;
  document.getElementById("rd-next").disabled = page >= n - 1;
}

function go(i, smooth = true) {
  const els = allPages();
  page = Math.max(0, Math.min(els.length - 1, i));
  if (mode === "pages") {
    els.forEach((el, k) => el.classList.toggle("cur", k === page));
    [page, page + 1, page - 1].forEach((k) => els[k] && draw(els[k]));   // this page, and the ones either side ready
    viewer().scrollTo?.({ top: 0 });
    if (!document.querySelector(".rd-viewer.fs")) window.scrollTo({ top: viewer().offsetTop - 70, behavior: smooth ? "smooth" : "auto" });
  } else {
    els[page].scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }
  counter();
}

function show(g) {
  current = g;
  const guide = data.guides[g];
  pagesEl().innerHTML = guide.pages.map((p, i) => `
    <div class="rd-page" data-page="${g}:${i}" style="aspect-ratio:${p.w}/${p.h};--ar:${p.w / p.h}">
      <canvas aria-label="${esc(T(`${guide.title}, page ${i + 1}`, `${guide.title}, עמוד ${i + 1}`))}"></canvas>
      <span class="rd-n" dir="ltr">${i + 1} / ${guide.pages.length}</span>
      <button type="button" class="rd-fs" data-full aria-label="${esc(fullLabel())}">${isFull() ? ICONS.exit : ICONS.full}</button>
    </div>`).join("");
  allPages().forEach((el) => { nearby ? nearby.observe(el) : draw(el); });
  page = 0;
  go(0, false);
}

function setMode(m) {
  mode = m;
  try { localStorage.setItem(MODE_KEY, m); } catch { /* fine: just not remembered */ }
  viewer().classList.toggle("paged", m === "pages");
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  go(page, false);
}

const viewer = () => document.querySelector(".rd-viewer");
function toggleFull() {
  const v = viewer();
  const native = document.fullscreenElement || document.webkitFullscreenElement;
  if (native) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
  if (v.classList.contains("fs")) { setFull(false); return; }
  const req = v.requestFullscreen || v.webkitRequestFullscreen;
  if (!req) { setFull(true); return; }   // iPhone: no real full screen for pages, so fill the window instead
  try {
    const r = req.call(v);               // fullscreenchange then turns the full-screen layout on
    if (r && r.catch) r.catch(() => setFull(true));
  } catch { setFull(true); }
}
const isFull = () => Boolean(viewer()?.classList.contains("fs"));
const fullLabel = () => (isFull() ? T("Exit full screen", "יציאה ממסך מלא") : T("Full screen", "מסך מלא"));
function setFull(on) {
  viewer().classList.toggle("fs", on);
  document.documentElement.classList.toggle("rd-fs-on", on);
  document.querySelectorAll("[data-full]").forEach((b) => { b.innerHTML = on ? ICONS.exit : ICONS.full; b.setAttribute("aria-label", fullLabel()); });
  go(page, false);
}
document.addEventListener("fullscreenchange", () => setFull(Boolean(document.fullscreenElement)));
document.addEventListener("webkitfullscreenchange", () => setFull(Boolean(document.webkitFullscreenElement)));

function render() {
  const all = data.guides || [];
  const lang = he() ? "he" : "en";
  list = all.map((g, i) => i).filter((i) => all[i].lang === lang);
  if (!list.length) list = all.map((g, i) => i);   // languages not marked yet: show them all
  if (!list.length) { message(`<p>${esc(T("The guides aren't ready to read online yet.", "המדריכים עוד לא מוכנים לקריאה אונליין."))}</p>`); return; }
  body.innerHTML = `
    <p class="rd-note">${esc(T("For your eyes only: please don't share screenshots of the guides.", "לשימושכם בלבד: נא לא לשתף צילומי מסך של המדריכים."))}</p>
    <div class="rd-viewer${mode === "pages" ? " paged" : ""}">
      <div class="rd-bar" id="rd-bar">
        <label class="rd-pick"><span class="visually-hidden">${esc(T("Guide", "מדריך"))}</span>
          <select id="rd-guide" data-no-i18n>${list.map((i) => `<option value="${i}">${esc(all[i].title)}</option>`).join("")}</select>
        </label>
        <div class="rd-modes" role="group" aria-label="${esc(T("How to read", "איך לקרוא"))}">
          <button type="button" data-mode="scroll" aria-pressed="${mode === "scroll"}">${esc(T("Scroll", "גלילה"))}</button>
          <button type="button" data-mode="pages" aria-pressed="${mode === "pages"}">${esc(T("Page by page", "עמוד אחר עמוד"))}</button>
        </div>
        <div class="rd-nav">
          <button type="button" class="rd-ic rd-flip" id="rd-prev" aria-label="${esc(T("Previous page", "העמוד הקודם"))}">${ICONS.prev}</button>
          <span class="rd-count" id="rd-count" dir="ltr">1 / 1</span>
          <button type="button" class="rd-ic rd-flip" id="rd-next" aria-label="${esc(T("Next page", "העמוד הבא"))}">${ICONS.next}</button>
        </div>
      </div>
      <div class="rd-pages" id="rd-pages"></div>
    </div>`;
  document.getElementById("rd-guide").addEventListener("change", (e) => show(Number(e.target.value)));
  body.querySelector(".rd-modes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (b && b.dataset.mode !== mode) setMode(b.dataset.mode);
  });
  document.getElementById("rd-prev").addEventListener("click", () => go(page - 1));
  document.getElementById("rd-next").addEventListener("click", () => go(page + 1));
  pagesEl().addEventListener("click", (e) => { if (e.target.closest("[data-full]")) toggleFull(); });
  // swipe between pages (Page by page)
  let x0 = null;
  pagesEl().addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  pagesEl().addEventListener("touchend", (e) => {
    if (mode !== "pages" || x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) < 50) return;
    const forward = he() ? dx > 0 : dx < 0;
    go(page + (forward ? 1 : -1));
  });
  show(list[0]);
}

document.addEventListener("keydown", (e) => {
  if (!document.getElementById("rd-pages") || e.target.closest("input, select, textarea")) return;
  const fwd = he() ? "ArrowLeft" : "ArrowRight", back = he() ? "ArrowRight" : "ArrowLeft";
  if (e.key === fwd || (mode === "pages" && (e.key === "PageDown" || e.key === " "))) { e.preventDefault(); go(page + 1); }
  else if (e.key === back || (mode === "pages" && e.key === "PageUp")) { e.preventDefault(); go(page - 1); }
  else if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey) toggleFull();
  else if (e.key === "Escape" && viewer()?.classList.contains("fs") && !document.fullscreenElement) setFull(false);
});

// No saving, dragging or printing the pages from here.
document.addEventListener("contextmenu", (e) => { if (e.target.closest(".rd-pages")) e.preventDefault(); });
document.addEventListener("dragstart", (e) => { if (e.target.closest(".rd-pages")) e.preventDefault(); });
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
});

(async () => {
  const user = await currentUser().catch(() => null);
  if (!user) {
    message(`<p>${esc(T("Sign in to read your Field Guides.", "התחברו כדי לקרוא את המדריכים שלכם."))}</p>
      <a class="btn" href="/account/?next=${encodeURIComponent("/read/")}">${esc(T("Sign in", "התחברות"))}</a>`);
    return;
  }
  try {
    await load();
    render();
  } catch (err) {
    message(`<p>${esc(err.message)}</p><a class="btn" href="/account/">${esc(T("Go to My downloads", "להורדות שלי"))}</a>`);
  }
})();

// Read online: the MWP Field Guides, page by page (shop.mw.photography/read.html).
// Ambassadors can only read the guides here; buyers can too. The pages come from the guide-view function
// as private links that last 10 minutes. Each page is drawn on a canvas with the reader's name, email
// and licence ID across it, so a screenshot still says whose copy it was. No download, no print.
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
    await wait(30000);
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

function stampPage(ctx, w, h, line) {
  ctx.save();
  // across the page, faintly, so it can't be cropped out
  ctx.globalAlpha = 0.085;
  ctx.fillStyle = "#6b6f73";
  ctx.font = `600 ${Math.round(w / 52)}px "Google Sans", Heebo, Arial, sans-serif`;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6);
  const tw = ctx.measureText(line).width, across = tw + w / 8, down = Math.round(w / 9);
  for (let row = 0, y = -h; y < h; y += down, row++) {
    for (let x = -w * 1.4 + (row % 2) * across / 2; x < w * 1.4; x += across) ctx.fillText(line, x, y);
  }
  ctx.restore();
  // and plainly at the foot
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#6b6f73";
  ctx.font = `${Math.round(w / 110)}px "Google Sans", Heebo, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`Licensed to ${line} · Read online only`, w / 2, h - Math.round(h / 140));
  ctx.restore();
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
      stampPage(ctx, page.w, page.h, data.stamp);
      return;
    } catch {
      fetchedAt = 0;   // the link may have run out: get new ones and try once more
    }
  }
  delete el.dataset.drawn;
}

const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) draw(e.target); }), { rootMargin: "1200px 0px" })
  : null;

function show(g) {
  current = g;
  const guide = data.guides[g];
  document.querySelectorAll(".rd-tabs button").forEach((b, i) => b.setAttribute("aria-selected", String(i === g)));
  const pages = document.getElementById("rd-pages");
  pages.innerHTML = guide.pages.map((p, i) => `
    <div class="rd-page" data-page="${g}:${i}" style="aspect-ratio:${p.w}/${p.h}">
      <canvas aria-label="${esc(`${guide.title}, page ${i + 1}`)}"></canvas>
      <span class="rd-n" dir="ltr">${i + 1} / ${guide.pages.length}</span>
    </div>`).join("");
  pages.querySelectorAll(".rd-page").forEach((el) => (io ? io.observe(el) : draw(el)));
  window.scrollTo({ top: document.querySelector(".rd").offsetTop - 70, behavior: "smooth" });
}

function render() {
  if (!data.guides?.length) { message(`<p>${esc(T("The guides aren't ready to read online yet.", "המדריכים עוד לא מוכנים לקריאה אונליין."))}</p>`); return; }
  body.innerHTML = `
    <p class="rd-note">${esc(T("For your eyes only: please don't share screenshots of the guides.", "לשימושכם בלבד: נא לא לשתף צילומי מסך של המדריכים."))}</p>
    <div class="rd-tabs" role="tablist">${data.guides.map((g, i) =>
      `<button type="button" role="tab" data-g="${i}" aria-selected="${i === 0}" data-no-i18n>${esc(g.title)}</button>`).join("")}</div>
    <div class="rd-pages" id="rd-pages"></div>`;
  body.querySelector(".rd-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-g]");
    if (b && Number(b.dataset.g) !== current) show(Number(b.dataset.g));
  });
  show(0);
}

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
      <a class="btn" href="account.html?next=${encodeURIComponent("/read.html")}">${esc(T("Sign in", "התחברות"))}</a>`);
    return;
  }
  try {
    await load();
    render();
  } catch (err) {
    message(`<p>${esc(err.message)}</p><a class="btn" href="account.html">${esc(T("Go to My downloads", "להורדות שלי"))}</a>`);
  }
})();

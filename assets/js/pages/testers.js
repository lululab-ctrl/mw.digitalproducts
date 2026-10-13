// Testers page (shop.mw.photography/testers/), shared by link only. Approved testers (at most 10, added
// in the admin) sign in with a one-time email link and download MWP Presets, MWP Panel and the Field Guides.
// Same protection as buyers: get-download gives stamped personal copies on 5-minute links, with a daily limit.
import { initChrome, toast } from "../lib/ui.js";
import { currentUser, signOut, requestDownload, testerLink, testerMe, esc } from "../lib/api.js";
import { EMAIL_RE, setBusy, setStatus } from "./shared-forms.js";

// a sign-in link sent from the Hebrew page brings them back in Hebrew
try { if (new URLSearchParams(location.search).get("lang") === "he") localStorage.setItem("mwp_lang", "he"); } catch { /* fine */ }
initChrome();

const he = () => document.documentElement.lang === "he";
const T = (en, hb) => (he() ? hb : en);
const $ = (id) => document.getElementById(id);
const COVERS = {
  "mwp-presets": ["assets/pages/img/c88e041b857fb964607aaec43ad1753d.jpg", "45% 6%"],
  "mwp-panel": ["assets/pages/img/8f730b9bb76b93ca707cae719a309479.jpg", "50% 40%"],
  "mwp-field-guides": ["assets/pages/img/0cf44582c4078749d18156eec10c90d3.jpg", "62% 30%"],
};
const TAGS = { preset: "Lightroom presets", plugin: "Photoshop plugin", guide: "PDF field guides" };
const DL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';

function show(id) { ["t-out", "t-no", "t-in"].forEach((x) => { $(x).hidden = x !== id; }); }

async function start() {
  const user = await currentUser().catch(() => null);
  if (!user) { show("t-out"); return; }
  let me;
  try { me = await testerMe(); } catch (err) { show("t-out"); toast(err.message, { type: "error" }); return; }
  if (!me.tester) { show("t-no"); return; }
  show("t-in");
  $("t-hi").textContent = T(`Hi ${me.name || me.email}. Your downloads are ready.`, `היי ${me.name || me.email}. ההורדות שלכם מוכנות.`);
  $("t-lib").innerHTML = me.products.map((p, i) => {
    const [img, pos] = COVERS[p.slug] || [];
    return `<article class="lib" style="--i:${i}">
      <div class="ph">${img ? `<img src="${esc(img)}" alt="" loading="lazy" style="object-position:${pos}">` : ""}</div>
      <div><p class="tg">${esc(TAGS[p.category] || "")}</p>
        <h3 class="nm" data-no-i18n>${esc(p.name)}${p.name_emphasis ? ` <span class="grad">${esc(p.name_emphasis)}</span>` : ""}</h3>
        <div class="chips"><span>Version ${esc(p.version)}</span></div></div>
      <button class="dl" type="button" data-download="${esc(p.slug)}">${DL}<span>Download</span></button>
    </article>`;
  }).join("");
}

// the sign-in link
$("t-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.elements.email.value.trim().toLowerCase();
  const status = form.querySelector(".form-status");
  if (!EMAIL_RE.test(email)) { setStatus(status, T("Please enter a valid email.", "נא למלא מייל תקין."), "error"); return; }
  const btn = form.querySelector("button[type=submit]");
  setBusy(btn, true, T("Sending…", "שולחים…"));
  try {
    await testerLink(email, he() ? "he" : "en");
    form.hidden = true; $("t-sent").hidden = false;
  } catch (err) {
    setStatus(status, err.message, "error");
  } finally { setBusy(btn, false); }
});

document.addEventListener("click", async (e) => {
  if (e.target.closest("[data-signout]")) { await signOut(); location.reload(); }
});

// downloads: the stamped copy is made when they're approved; if it's still being made, wait and start it
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
$("t-lib").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-download]");
  if (!btn || btn.disabled) return;
  const label = btn.querySelector("span"); const was = label.textContent;
  const busy = (on, text) => { btn.disabled = on; label.textContent = on ? text : was; };
  busy(true, T("Preparing…", "מכינים…"));
  try {
    const started = Date.now();
    let res = await requestDownload(btn.dataset.download);
    while (res.preparing && Date.now() - started < 12 * 60000) {
      busy(true, T("Making your copy…", "מכינים את העותק שלכם…"));
      await wait(15000);
      res = await requestDownload(btn.dataset.download);
    }
    if (res.preparing) { toast(T("Your copy is still being made. Please try again in a few minutes.", "העותק שלכם עוד בהכנה. נסו שוב בעוד כמה דקות.")); return; }
    location.href = res.url;
    toast(T("Your download has started.", "ההורדה התחילה."));
  } catch (err) {
    toast(err.message, { type: "error", timeout: 7000 });
  } finally { setTimeout(() => busy(false), 1200); }
});

start();

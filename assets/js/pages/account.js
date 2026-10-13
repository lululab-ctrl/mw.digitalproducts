// My downloads: magic-link sign-in, then the customer's library with secure download buttons.
import { initChrome, toast } from "../lib/ui.js";
import { supabase, currentUser, sendMagicLink, signOut, myLibrary, requestDownload, panelDevices, removePanelDevice, mediaUrl, esc, shortDate } from "../lib/api.js";
import { EMAIL_RE, setBusy, setStatus } from "./shared-forms.js";
import { countLabel } from "../lib/catalog.js";

initChrome();

const signedOut = document.getElementById("signed-out");
const signedIn = document.getElementById("signed-in");
const library = document.getElementById("library");
const who = document.getElementById("who");

// Cover photos for the MWP products (used when a product has no cover uploaded in the admin).
// Each with its focus point, so the crop always keeps the animal's head and body in frame.
const COVERS = {
  "mwp-presets": ["assets/pages/img/c88e041b857fb964607aaec43ad1753d.jpg", "45% 6%"],   // eagle: head and chest
  "mwp-panel": ["assets/pages/img/8f730b9bb76b93ca707cae719a309479.jpg", "50% 40%"],     // tiger: face and stride
  "mwp-field-guides": ["assets/pages/img/0cf44582c4078749d18156eec10c90d3.jpg", "62% 30%"], // lioness: face
};
const TAGS = { preset: "Lightroom presets", plugin: "Photoshop plugin", guide: "PDF field guides", bundle: "Bundle" };
const DL_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';

function libraryHTML(items) {
  items = items.filter((i) => i.products);   // a product that can't be shown is skipped, not fatal
  if (!items.length) {
    return `<div class="glass lib-empty stack">
      <p>Nothing on this email yet.</p>
      <p class="meta">Bought with a different email? Sign out and use that one, or <a class="link" href="support.html">contact support</a> with your order number.</p>
    </div>`;
  }
  return items.map(({ granted_at, products: p }, i) => {
    const [img, pos] = p.cover_path ? [mediaUrl(p.cover_path, { width: 600 }), "50% 40%"] : (COVERS[p.slug] || []);
    const count = countLabel(p);
    return `
    <article class="lib" style="--i:${i}">
      <div class="ph">${img ? `<img src="${esc(img)}" alt="" loading="lazy" style="object-position:${pos}">` : ""}</div>
      <div>
        <p class="tg">${esc(TAGS[p.category] || "")}</p>
        <h3 class="nm" data-no-i18n>${esc(p.name)}${p.name_emphasis ? ` <span class="grad">${esc(p.name_emphasis)}</span>` : ""}</h3>
        <div class="chips"><span>Version ${esc(p.version)}</span>${count ? `<span>${esc(count)}</span>` : ""}<span>Added ${shortDate(granted_at)}</span></div>
      </div>
      <button class="dl" type="button" data-download="${esc(p.slug)}">${DL_ICON}<span>Download</span></button>
    </article>`;
  }).join("");
}

// MWP Panel works only for the buyer: each computer they sign in on is listed here, and they can
// free one up when they change computers.
const PANEL_SLUGS = ["mwp-panel", "presets-panel", "field-guides-panel", "full-set"];

function devicesHTML({ devices, max }) {
  const rows = devices.map((d) => `
    <li class="device">
      <div><strong>${esc(d.device_name || "Computer")}</strong>
      <p class="meta">Last used ${shortDate(d.last_seen_at)}</p></div>
      <button class="btn btn--ghost btn--sm" type="button" data-remove-device="${esc(d.device_id)}">Remove</button>
    </li>`).join("");
  return `<section class="devices stack" aria-labelledby="devices-h">
    <h2 class="h3" id="devices-h">MWP Panel on your computers</h2>
    <p class="meta">Your licence is personal: Panel works when you sign in to it with this email. You can use it on up to ${max} computers at a time. Changed computer? Remove the old one here.</p>
    ${devices.length ? `<ul class="device-list">${rows}</ul>` : `<p class="meta">No computers yet. Open MWP Panel in Photoshop and sign in with this email.</p>`}
  </section>`;
}

async function showDevices() {
  const box = document.getElementById("devices");
  if (!box) return;
  try { box.innerHTML = devicesHTML(await panelDevices()); box.hidden = false; }
  catch { box.hidden = true; }
}

async function showLibrary(user) {
  signedOut.hidden = true;
  signedIn.hidden = false;
  if (who) who.textContent = user.email;
  library.innerHTML = `<div class="skeleton" style="height:96px"></div>`;
  try {
    const items = await myLibrary();
    library.innerHTML = libraryHTML(items);
    if (items.some((i) => PANEL_SLUGS.includes(i.products?.slug))) showDevices();
  } catch (err) {
    library.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

document.addEventListener("click", async (e) => {
  const rm = e.target.closest("[data-remove-device]");
  if (!rm) return;
  setBusy(rm, true, "Removing…");
  try {
    document.getElementById("devices").innerHTML = devicesHTML(await removePanelDevice(rm.dataset.removeDevice));
    toast("Computer removed. You can now sign in to MWP Panel on another one.");
  } catch (err) {
    toast(err.message, { type: "error", timeout: 7000 });
    setBusy(rm, false);
  }
});

library.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-download]");
  if (!btn) return;
  const label = btn.querySelector("span");
  const was = label ? label.textContent : "";
  const busy = (on) => { btn.disabled = on; btn.setAttribute("aria-busy", String(on)); if (label) label.textContent = on ? (document.documentElement.lang === "he" ? "מכינים…" : "Preparing…") : was; };
  busy(true);
  try {
    const { url } = await requestDownload(btn.dataset.download);
    // A same-tab navigation to a Content-Disposition: attachment URL downloads without leaving the page.
    location.href = url;
    toast("Your download has started. The link is valid for 5 minutes.");
  } catch (err) {
    toast(err.message, { type: "error", timeout: 7000 });
  } finally {
    setTimeout(() => busy(false), 1200);
  }
});

const form = document.getElementById("login-form");
const status = form.querySelector(".form-status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = form.elements.email;
  const email = input.value.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    input.setAttribute("aria-invalid", "true");
    setStatus(status, "Please enter the email you used at checkout.", "error");
    return;
  }
  input.removeAttribute("aria-invalid");
  const btn = form.querySelector("button[type=submit]");
  setBusy(btn, true);
  try {
    await sendMagicLink(email);
    setStatus(status, `We've sent a sign-in link to ${email}. Open it on this device.`, "ok");
  } catch (err) {
    setStatus(status, err.status === 429 ? "Too many requests. Please wait a minute and try again." : err.message, "error");
  } finally {
    setBusy(btn, false);
  }
});

document.getElementById("sign-out")?.addEventListener("click", async () => {
  await signOut();
  location.reload();
});

// Prefill from the thank-you page or the delivery email (?email=)
const preset = new URLSearchParams(location.search).get("email");
if (preset && EMAIL_RE.test(preset)) form.elements.email.value = preset;

const user = await currentUser();
if (user) showLibrary(user);
supabase?.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user) showLibrary(session.user);
});

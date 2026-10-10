// My downloads: magic-link sign-in, then the customer's library with secure download buttons.
import { initChrome, toast } from "../lib/ui.js";
import { supabase, currentUser, sendMagicLink, signOut, myLibrary, requestDownload, mediaUrl, esc, shortDate } from "../lib/api.js";
import { EMAIL_RE, setBusy, setStatus } from "./shared-forms.js";
import { countLabel } from "../lib/catalog.js";

initChrome();

const signedOut = document.getElementById("signed-out");
const signedIn = document.getElementById("signed-in");
const library = document.getElementById("library");
const who = document.getElementById("who");

function libraryHTML(items) {
  if (!items.length) {
    return `<div class="empty stack">
      <p>Nothing on this email yet.</p>
      <p class="meta">Bought with a different email? Sign out and use that one, or <a class="link" href="support.html">contact support</a> with your order number.</p>
    </div>`;
  }
  return items.map(({ id, granted_at, products: p }) => `
    <article class="library-item">
      ${p.cover_path ? `<img src="${esc(mediaUrl(p.cover_path, { width: 240 }))}" alt="" loading="lazy">` : `<span class="thumb" aria-hidden="true"></span>`}
      <div>
        <h3 class="library-item__title">${esc(p.name)}${p.name_emphasis ? " " + esc(p.name_emphasis) : ""}</h3>
        <p class="meta">Version ${esc(p.version)}${countLabel(p) ? `, ${esc(countLabel(p))}` : ""}. Added ${shortDate(granted_at)}</p>
      </div>
      <button class="btn btn--sm" type="button" data-download="${esc(p.slug)}">Download .zip</button>
    </article>`).join("");
}

async function showLibrary(user) {
  signedOut.hidden = true;
  signedIn.hidden = false;
  who.textContent = user.email;
  library.innerHTML = `<div class="skeleton" style="height:96px"></div>`;
  try {
    library.innerHTML = libraryHTML(await myLibrary());
  } catch (err) {
    library.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
  }
}

library.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-download]");
  if (!btn) return;
  setBusy(btn, true, "Preparing…");
  try {
    const { url } = await requestDownload(btn.dataset.download);
    // A same-tab navigation to a Content-Disposition: attachment URL downloads without leaving the page.
    location.href = url;
    toast("Your download has started. The link is valid for 5 minutes.");
  } catch (err) {
    toast(err.message, { type: "error", timeout: 7000 });
  } finally {
    setTimeout(() => setBusy(btn, false), 1200);
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

document.getElementById("sign-out").addEventListener("click", async () => {
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

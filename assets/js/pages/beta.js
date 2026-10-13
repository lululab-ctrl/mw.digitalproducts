// MWP Ambassador Program page: open to anyone with the link (no password). Accepting the terms in the
// join form gives the member's email MWP Presets, MWP Panel and the Field Guides, adds them to monday.com
// (through the beta Edge Function and Make), and emails them a link to My downloads.
import { initI18n } from "../i18n.js";
import { initCart } from "../lib/cart.js";
import { betaJoin, betaStatus, sendMagicLink, signedTerms, signUpWithPassword } from "../lib/api.js";

initI18n();
initCart();

const he = () => document.documentElement.lang === "he";
const T = (en, hebrew) => (he() ? hebrew : en);

// ---------------------------------------------------------------- reveal on scroll
const els = document.querySelectorAll(".reveal");
if (!("IntersectionObserver" in window)) {
  els.forEach((e) => e.classList.add("on"));
} else {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

// ---------------------------------------------------------------- terms: one document to read through
// The contents list and the key facts jump to their chapter (handled with the pop-ups below).

// ---------------------------------------------------------------- tap to copy the handle and hashtags
const copied = document.createElement("div");
copied.className = "copied"; copied.setAttribute("role", "status");
document.body.append(copied);
let copiedTimer;
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button.cp[data-copy]");
  if (!b) return;
  const text = b.dataset.copy;
  try { await navigator.clipboard.writeText(text); } catch {
    const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
    try { document.execCommand("copy"); } catch { /* nothing else to try */ } t.remove();
  }
  b.classList.add("done"); setTimeout(() => b.classList.remove("done"), 900);
  copied.textContent = T(`Copied ${text}`, `הועתק: ${text}`);
  copied.classList.add("show"); clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => copied.classList.remove("show"), 1600);
});

// ---------------------------------------------------------------- acceptance card: fills in as they type
const sig = document.getElementById("sig");
const sigName = document.getElementById("sig-name");
const sigMeta = document.getElementById("sig-meta");
const accDate = document.getElementById("acc-date");
const today = new Intl.DateTimeFormat(he() ? "he-IL" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
if (accDate) accDate.textContent = today;
function showSignature() {
  const f = document.getElementById("join-form").elements;
  const name = f.name.value.trim();
  const ig = f.instagram.value.trim().replace(/^@+/, "").replace(/[^A-Za-z0-9._]/g, "");
  sigName.textContent = name || T("Your name", "השם שלכם");
  sig.classList.toggle("typed", Boolean(name));
  // each piece isolated, so a handle and a Hebrew date don't run into each other
  sigMeta.innerHTML = [ig && `<bdi dir="ltr">@${ig}</bdi>`, `<bdi>${today}</bdi>`].filter(Boolean).join(" · ");
  sig.classList.toggle("signed", Boolean(name));
}
document.getElementById("join-form").addEventListener("input", showSignature);
document.getElementById("join-form").addEventListener("change", showSignature);
showSignature();

// ---------------------------------------------------------------- pop-ups: the terms (step 1), then the details form (step 2)
let agreed = false;
const termsModal = document.getElementById("terms-modal");
const joinModal = document.getElementById("join-modal");
let lastFocus = null;
function openModal(m, focusEl) {
  if (!document.querySelector(".modal:not([hidden])")) lastFocus = document.activeElement;
  document.querySelectorAll(".modal").forEach((x) => { if (x !== m) x.hidden = true; });
  m.hidden = false;
  m.scrollTop = 0;
  document.documentElement.classList.add("modal-on");
  setTimeout(() => (focusEl || m.querySelector(".modal-x")).focus({ preventScroll: true }), 60);
}
function closeModal(m) {
  m.hidden = true;
  if (!document.querySelector(".modal:not([hidden])")) {
    document.documentElement.classList.remove("modal-on");
    lastFocus?.focus?.({ preventScroll: true });
  }
}
document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeModal(m);
}));
document.addEventListener("keydown", (e) => {
  const open = document.querySelector(".modal:not([hidden])");
  if (e.key === "Escape" && open) closeModal(open);
});
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-terms]")) { e.preventDefault(); openModal(termsModal); }
});
// a key fact or a contents line jumps to its chapter inside the terms
document.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById(`${he() ? "h" : "t"}${a.dataset.open}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}));
document.getElementById("agree-btn").addEventListener("click", () => {
  agreed = true;
  closeModal(termsModal);
  openModal(joinModal, document.getElementById("join-done").hidden ? document.getElementById("j-name") : null);
});
// a refresh always starts at the top ("Create with MWP"), never inside the terms
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (location.hash) history.replaceState(null, "", location.pathname + location.search);
window.scrollTo(0, 0);

// ---------------------------------------------------------------- full? (26 ambassadors at most; the server enforces it)
function showFull() {
  document.querySelectorAll(".hero-cta").forEach((el) => { el.hidden = true; });
  const note = document.getElementById("full-note");
  if (note) { note.hidden = false; note.classList.add("on"); }
  document.querySelectorAll(".modal").forEach((m) => { if (!m.hidden) closeModal(m); });
}
betaStatus().then((r) => { if (r && r.open === false) showFull(); }).catch(() => { /* can't tell: leave it open, the server still checks */ });

// ---------------------------------------------------------------- show / hide password
document.addEventListener("click", (e) => {
  const eye = e.target.closest("[data-eye]");
  if (!eye) return;
  const input = eye.parentElement.querySelector("input");
  const on = input.type === "password";
  input.type = on ? "text" : "password";
  eye.setAttribute("aria-pressed", String(on));
});

// ---------------------------------------------------------------- step 2: details, then the download link
const form = document.getElementById("join-form");
const msg = document.getElementById("join-msg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = form.elements;
  const data = {
    name: f.name.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    instagram: f.instagram.value.trim(),
    facebook: f.facebook.value.trim(),
    agree: agreed,
    lang: he() ? "he" : "en",   // the terms they read; their signed copy comes in the same language
  };
  const password = f.password.value;
  msg.className = "msg err";
  if (!data.name) { msg.textContent = T("Please enter your name.", "נא למלא שם."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { msg.textContent = T("Please enter a valid email.", "נא למלא מייל תקין."); return; }
  if (password.length < 8) { f.password.focus(); msg.textContent = T("Your password needs at least 8 characters.", "הסיסמה צריכה לפחות 8 תווים."); return; }
  if (!data.agree) { msg.textContent = T("Please accept the Ambassador Program terms.", "נא לאשר את תנאי תוכנית השגרירים."); return; }   // can't happen: the form opens only after accepting

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  msg.className = "msg"; msg.textContent = T("Creating your account…", "יוצרים את החשבון…");
  try {
    const joined = await betaJoin(data);   // the tools go to this email first (the password never goes to our server)
    const r = await signUpWithPassword(data.email, password, { name: data.name, redirectPath: "/account.html" });
    const title = document.querySelector("#join-done h3");
    const text = document.getElementById("done-text");
    if (r === "signed-in") {
      title.textContent = T("You're all set", "הכול מוכן");
      text.textContent = T("Your account is ready and your tools are in it.", "החשבון מוכן והכלים כבר בתוכו.");
    } else if (r === "exists") {
      await sendMagicLink(data.email, "/account.html").catch(() => {});
      title.textContent = T("Your tools are in your account", "הכלים נמצאים בחשבון שלכם");
      text.textContent = T(`${data.email} already has an MWP account, so we added the tools to it. Sign in with your password, or open the sign-in link we just emailed you.`,
        `ל־${data.email} כבר יש חשבון MWP, אז הוספנו אליו את הכלים. התחברו עם הסיסמה, או פתחו את קישור הכניסה ששלחנו עכשיו במייל.`);
    } else {
      title.textContent = T("Confirm your email", "אשרו את המייל");
      text.textContent = T(`We've sent a link to ${data.email}. Open it to confirm your account, and your tools will be waiting.`,
        `שלחנו קישור אל ${data.email}. פתחו אותו כדי לאשר את החשבון, והכלים כבר יחכו לכם.`);
    }
    document.getElementById("step-details").hidden = true;
    document.getElementById("join-done").hidden = false;
    if (joined?.receipt) downloadSignedTerms(joined.receipt);
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.status === 429 ? T("Too many requests. Please wait a minute and try again.", "יותר מדי בקשות. המתינו דקה ונסו שוב.") : err.message;
    if (err.status === 409) setTimeout(showFull, 2500);   // filled up while they were filling in the form
  } finally {
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------- their own signed copy of the terms
// The PDF is made on our side a moment after joining; we check every 10 seconds and download it to
// their computer as soon as it's ready. It also stays in My downloads.
async function downloadSignedTerms(receipt) {
  const state = document.getElementById("terms-copy-state");
  const again = document.getElementById("terms-copy-btn");
  const started = Date.now();
  const fetchUrl = async () => {
    while (Date.now() - started < 5 * 60000) {
      try {
        const r = await signedTerms(receipt);
        if (r.url) return r.url;
      } catch { /* try again in a moment */ }
      await new Promise((ok) => setTimeout(ok, 10000));
    }
    return null;
  };
  const save = (url) => {
    const f = document.createElement("iframe");   // downloads without leaving the page
    f.hidden = true; f.src = url; document.body.append(f);
    setTimeout(() => f.remove(), 60000);
  };
  const url = await fetchUrl();
  if (!url) {
    state.textContent = T("It's taking a little longer. You'll find it in My downloads in a few minutes.",
      "זה לוקח קצת יותר זמן. תמצאו אותו בהורדות שלי בעוד כמה דקות.");
    return;
  }
  save(url);
  state.textContent = T("Downloaded to your computer. Keep it with your records.", "ירד למחשב שלכם. שמרו אותו אצלכם.");
  again.hidden = false;
  again.onclick = async () => {
    again.disabled = true;
    try { const r = await signedTerms(receipt); if (r.url) save(r.url); } catch { /* the copy in My downloads still works */ }
    again.disabled = false;
  };
}

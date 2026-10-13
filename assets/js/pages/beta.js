// MWP Ambassador Program page: open to anyone with the link (no password). Accepting the terms in the
// join form gives the member's email MWP Presets, MWP Panel and the Field Guides, adds them to monday.com
// (through the beta Edge Function and Make), and emails them a link to My downloads.
import { initI18n } from "../i18n.js";
import { initCart } from "../lib/cart.js";
import { betaJoin, sendMagicLink, signUpWithPassword } from "../lib/api.js";

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

// ---------------------------------------------------------------- terms: chapters open and close
const chapters = [...document.querySelectorAll(".ch")];
const allBtn = document.getElementById("ch-all");
function setOpen(ch, open) {
  ch.classList.toggle("open", open);
  ch.querySelector(".ch-b").setAttribute("aria-expanded", String(open));
}
function syncAll() {
  const allOpen = chapters.every((c) => c.classList.contains("open"));
  if (allBtn) { allBtn.textContent = allOpen ? "Collapse all" : "Expand all"; allBtn.setAttribute("aria-expanded", String(allOpen)); }
}
chapters.forEach((ch) => ch.querySelector(".ch-b").addEventListener("click", () => {
  setOpen(ch, !ch.classList.contains("open")); syncAll();
}));
allBtn?.addEventListener("click", () => {
  const open = !chapters.every((c) => c.classList.contains("open"));
  chapters.forEach((c) => setOpen(c, open)); syncAll();
});
// a key fact opens its chapter
document.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", () => {
  const ch = document.getElementById(`t${a.dataset.open}`);
  if (ch) { setOpen(ch, true); syncAll(); }
}));   // (scrolling to it is handled with the pop-ups below)
// every chapter starts closed; visitors open the ones they want

// ---------------------------------------------------------------- tap to copy the handle and hashtags
const copied = document.createElement("div");
copied.className = "copied"; copied.setAttribute("role", "status");
document.body.append(copied);
let copiedTimer;
document.addEventListener("click", async (e) => {
  const b = e.target.closest(".cp");
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
// a key fact jumps to its chapter inside the terms
document.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById(`t${a.dataset.open}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    agree: agreed,
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
    await betaJoin(data);   // the tools go to this email first (the password never goes to our server)
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
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.status === 429 ? T("Too many requests. Please wait a minute and try again.", "יותר מדי בקשות. המתינו דקה ונסו שוב.") : err.message;
  } finally {
    btn.disabled = false;
  }
});

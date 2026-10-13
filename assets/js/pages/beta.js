// MWP Ambassador Program page: open to anyone with the link (no password). Step 1: read and accept the
// terms. Step 2: a short questionnaire. The application goes to the team in monday.com (through the beta
// Edge Function and Make); the shop gives the tools and emails the answer once they decide.
import { initI18n } from "../i18n.js";
import { initCart } from "../lib/cart.js";
import { betaApply, betaStatus } from "../lib/api.js";
import { ambassadorLanding } from "../lib/landing.js";

ambassadorLanding();   // already an ambassador and signed in: straight to My downloads
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

// ---------------------------------------------------------------- step 2: the questionnaire, then "Thank you"
// Nothing is given on the spot: the application goes to the team in monday.com, and the shop emails the
// answer (welcome with the tools, or a kind no) once they decide.
const form = document.getElementById("join-form");
const msg = document.getElementById("join-msg");
const REQUIRED = ["shoot", "years", "role", "work", "software", "apps", "devices", "used_before", "why", "values", "sounds_good", "feedback"];
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = form.elements;
  const val = (n) => {
    const el = f[n];
    if (!el) return "";
    if (el instanceof RadioNodeList || el.length > 1) {
      const picked = [...form.querySelectorAll(`input[name="${n}"]:checked`)].map((x) => x.value);
      return picked.join(", ");
    }
    return (el.value || "").trim();
  };
  const answers = {};
  for (const n of [...REQUIRED, "platforms", "anything_else"]) answers[n] = val(n);
  const data = {
    name: val("name"),
    email: val("email").toLowerCase(),
    instagram: val("instagram"),
    facebook: val("facebook"),
    answers,
    agree: agreed,
    lang: he() ? "he" : "en",   // the terms they read; their signed copy comes in the same language
  };
  msg.className = "msg err";
  if (!data.name) { f.name.focus(); msg.textContent = T("Please enter your name.", "נא למלא שם."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { f.email.focus(); msg.textContent = T("Please enter a valid email.", "נא למלא מייל תקין."); return; }
  if (!data.instagram.replace(/^@+/, "")) { f.instagram.focus(); msg.textContent = T("Please enter your Instagram handle.", "נא למלא את שם המשתמש באינסטגרם."); return; }
  const missing = REQUIRED.find((n) => !answers[n]);
  if (missing) {
    const el = form.querySelector(`[name="${missing}"]`);
    el?.closest(".field")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el && el.type !== "radio" && el.type !== "checkbox") el.focus({ preventScroll: true });
    msg.textContent = T("Please answer every question (only the last one is optional).", "נא לענות על כל השאלות (רק האחרונה אופציונלית).");
    return;
  }
  if (!data.agree) { msg.textContent = T("Please accept the Ambassador Program terms.", "נא לאשר את תנאי תוכנית השגרירים."); return; }   // can't happen: the form opens only after accepting

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  msg.className = "msg"; msg.textContent = T("Sending your application…", "שולחים את הבקשה…");
  try {
    const r = await betaApply(data);
    const title = document.getElementById("done-h");
    const text = document.getElementById("done-text");
    if (r?.already === "member") {
      title.textContent = T("You're already an ambassador", "אתם כבר שגרירים");
      text.textContent = T("Your tools are in My downloads. Sign in with this email.", "הכלים שלכם נמצאים בהורדות שלי. התחברו עם המייל הזה.");
    } else if (r?.already === "waiting") {
      title.textContent = T("We already have your application", "הבקשה שלכם כבר אצלנו");
      text.textContent = T("We read every application personally, so it may take us a few days to get back to you.", "אנחנו קוראים כל טופס בעצמנו, אז ייתכן שייקח לנו כמה ימים לחזור אליכם.");
    }
    document.getElementById("step-details").hidden = true;
    document.getElementById("join-done").hidden = false;
    msg.textContent = "";
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.status === 429 ? T("Too many requests. Please wait a minute and try again.", "יותר מדי בקשות. המתינו דקה ונסו שוב.") : err.message;
    if (err.status === 409) setTimeout(showFull, 2500);   // filled up while they were filling in the form
  } finally {
    btn.disabled = false;
  }
});

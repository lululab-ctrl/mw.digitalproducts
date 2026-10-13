// MWP Ambassador Program page: open to anyone with the link (no password). Accepting the terms in the
// join form gives the member's email MWP Presets, MWP Panel and the Field Guides, adds them to monday.com
// (through the beta Edge Function and Make), and emails them a link to My downloads.
import { initI18n } from "../i18n.js";
import { initCart } from "../lib/cart.js";
import { betaJoin, sendMagicLink } from "../lib/api.js";

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

// ---------------------------------------------------------------- terms: chapters, reading progress
const chapters = [...document.querySelectorAll(".t-sec")];
const navLinks = new Map([...document.querySelectorAll(".t-nav a[data-t]")].map((a) => [a.dataset.t, a]));
const prog = document.getElementById("t-prog");
const bar = document.getElementById("t-bar");
const read = new Set();
function showProgress() {
  const n = read.size, all = chapters.length;
  if (prog) prog.textContent = n === all ? "All read · ready to accept" : `${n} of ${all} read`;
  if (bar) bar.style.width = `${(n / all) * 100}%`;
}
function setActive(id) {
  chapters.forEach((c) => c.classList.toggle("on", c.dataset.t === id));
  navLinks.forEach((a, k) => a.classList.toggle("on", k === id));
  const a = navLinks.get(id);   // keep the active chip in view on phones
  if (a && a.parentElement.scrollWidth > a.parentElement.clientWidth) {
    a.parentElement.scrollTo({ left: a.offsetLeft - 20, behavior: "smooth" });
  }
}
if ("IntersectionObserver" in window && chapters.length) {
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.intersectionRatio >= 0.55 || (e.isIntersecting && e.boundingClientRect.height > innerHeight * 0.9)) {
      const id = e.target.dataset.t;
      if (!read.has(id)) { read.add(id); navLinks.get(id)?.classList.add("read"); showProgress(); }
    }
  }), { threshold: [0.2, 0.55] });
  const focus = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) setActive(e.target.dataset.t);
  }), { rootMargin: "-45% 0px -50% 0px" });
  chapters.forEach((c) => { seen.observe(c); focus.observe(c); });
}
showProgress();

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

// ---------------------------------------------------------------- step 1: accept the terms (nothing else is asked first)
let agreed = false;
document.getElementById("agree-btn").addEventListener("click", () => {
  agreed = true;
  document.getElementById("step-agree").hidden = true;
  document.getElementById("step-details").hidden = false;
  document.getElementById("acc").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => document.getElementById("j-name").focus({ preventScroll: true }), 500);
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
  msg.className = "msg err";
  if (!data.name) { msg.textContent = T("Please enter your name.", "נא למלא שם."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { msg.textContent = T("Please enter a valid email.", "נא למלא מייל תקין."); return; }
  if (!data.agree) { msg.textContent = T("Please accept the Ambassador Program terms.", "נא לאשר את תנאי תוכנית השגרירים."); return; }   // can't happen: the form opens only after accepting

  const btn = form.querySelector("button");
  btn.disabled = true;
  msg.className = "msg"; msg.textContent = T("Adding the tools to your library…", "מוסיפים את הכלים לספרייה שלכם…");
  try {
    await betaJoin(data);
    await sendMagicLink(data.email, "/account.html");
    document.getElementById("step-details").hidden = true;
    document.getElementById("done-text").textContent = T(
      `We've sent a link to ${data.email}. Open it to download your tools.`,
      `שלחנו קישור אל ${data.email}. פתחו אותו כדי להוריד את הכלים.`);
    document.getElementById("join-done").hidden = false;
  } catch (err) {
    msg.className = "msg err";
    msg.textContent = err.status === 429 ? T("Too many requests. Please wait a minute and try again.", "יותר מדי בקשות. המתינו דקה ונסו שוב.") : err.message;
  } finally {
    btn.disabled = false;
  }
});

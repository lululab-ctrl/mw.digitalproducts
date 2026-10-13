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

// ---------------------------------------------------------------- join
const form = document.getElementById("join-form");
const msg = document.getElementById("join-msg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = form.elements;
  const data = {
    name: f.name.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    instagram: f.instagram.value.trim(),
    agree: f.agree.checked,
  };
  msg.className = "msg err";
  if (!data.name) { msg.textContent = T("Please enter your name.", "נא למלא שם."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { msg.textContent = T("Please enter a valid email.", "נא למלא מייל תקין."); return; }
  if (!data.agree) { msg.textContent = T("Please accept the Ambassador Program terms.", "נא לאשר את תנאי תוכנית השגרירים."); return; }

  const btn = form.querySelector("button");
  btn.disabled = true;
  msg.className = "msg"; msg.textContent = T("Adding the tools to your library…", "מוסיפים את הכלים לספרייה שלכם…");
  try {
    await betaJoin(data);
    await sendMagicLink(data.email, "/account.html");
    form.hidden = true;
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

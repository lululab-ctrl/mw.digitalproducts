// Beta page: the password opens the page (checked by the server), then the join form gives the
// member's email all three tools and emails them a sign-in link to My downloads.
import { initI18n } from "../i18n.js";
import { initCart } from "../lib/cart.js";
import { betaCheck, betaJoin, sendMagicLink } from "../lib/api.js";

initI18n();
initCart();

const KEY = "mwp_beta_pw";
const he = () => document.documentElement.lang === "he";
const T = (en, hebrew) => (he() ? hebrew : en);
const store = {
  get: () => { try { return sessionStorage.getItem(KEY) || ""; } catch { return ""; } },
  set: (v) => { try { sessionStorage.setItem(KEY, v); } catch { /* private mode: fine */ } },
};

function reveal() {
  const els = document.querySelectorAll(".in .reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("on")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  els.forEach((e) => io.observe(e));
}

function open() {
  document.documentElement.classList.add("beta-open");
  window.scrollTo(0, 0);
  reveal();
}

// ---------------------------------------------------------------- gate
const gate = document.getElementById("gate-form");
const gateMsg = document.getElementById("gate-msg");
gate.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pw = gate.elements.password.value.trim();
  if (!pw) return;
  const btn = gate.querySelector("button");
  btn.disabled = true;
  gateMsg.className = "msg"; gateMsg.textContent = T("Checking…", "בודקים…");
  try {
    await betaCheck(pw);
    store.set(pw);
    gateMsg.textContent = "";
    open();
  } catch (err) {
    gateMsg.className = "msg err";
    gateMsg.textContent = err.status === 429 ? T("Too many tries. Please wait an hour and try again.", "יותר מדי ניסיונות. נסו שוב בעוד שעה.")
      : T("That password isn't right.", "הסיסמה לא נכונה.");
    const card = gate.closest(".glass");
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  } finally {
    btn.disabled = false;
  }
});

if (store.get()) open();

// ---------------------------------------------------------------- join
const form = document.getElementById("join-form");
const msg = document.getElementById("join-msg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = form.elements;
  const data = {
    password: store.get(),
    name: f.name.value.trim(),
    email: f.email.value.trim().toLowerCase(),
    instagram: f.instagram.value.trim(),
    agree: f.agree.checked,
  };
  msg.className = "msg err";
  if (!data.name) { msg.textContent = T("Please enter your name.", "נא למלא שם."); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { msg.textContent = T("Please enter a valid email.", "נא למלא מייל תקין."); return; }
  if (!data.agree) { msg.textContent = T("Please agree to the beta terms.", "נא לאשר את תנאי הבטא."); return; }

  const btn = form.querySelector("button");
  btn.disabled = true;
  msg.className = "msg"; msg.textContent = T("Adding the tools to your library…", "מוסיפים את הכלים לספרייה שלכם…");
  try {
    await betaJoin(data);
    await sendMagicLink(data.email, "/account.html");
    form.hidden = true;
    document.getElementById("done-text").textContent = `We've sent a sign-in link to ${data.email}. Open it on this device.`;
    document.getElementById("join-done").hidden = false;
  } catch (err) {
    msg.className = "msg err";
    if (err.status === 403) {   // password changed or session lost: back to the gate
      try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
      document.documentElement.classList.remove("beta-open");
    }
    msg.textContent = err.status === 429 ? T("Too many requests. Please wait a minute and try again.", "יותר מדי בקשות. המתינו דקה ונסו שוב.") : err.message;
  } finally {
    btn.disabled = false;
  }
});

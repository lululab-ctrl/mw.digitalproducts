// Small form helpers shared by several pages.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function setBusy(button, busy, busyText = "Sending…") {
  if (!button) return;
  if (busy) { button.dataset.label = button.textContent; button.textContent = busyText; }
  else if (button.dataset.label) button.textContent = button.dataset.label;
  button.setAttribute("aria-busy", String(busy));
  button.disabled = busy;
}

export function setStatus(el, message, state = "") {
  if (!el) return;
  el.textContent = message;
  el.dataset.state = state;
}

/** Free-sampler / newsletter form: email + consent checkbox + honeypot. */
export function bindSubscribeForm(form, subscribe, toast) {
  if (!form) return;
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get("website")) return;                       // honeypot filled = bot
    const email = String(data.get("email") || "").trim().toLowerCase();
    const input = form.querySelector("[name=email]");
    if (!EMAIL_RE.test(email)) {
      input.setAttribute("aria-invalid", "true");
      setStatus(status, "Please enter a valid email address.", "error");
      input.focus();
      return;
    }
    if (!data.get("consent")) {
      setStatus(status, "Please tick the box so we can email you the presets.", "error");
      return;
    }
    input.removeAttribute("aria-invalid");
    const button = form.querySelector("button[type=submit]");
    setBusy(button, true);
    try {
      await subscribe(email, form.dataset.source || "free-sampler");
      form.reset();
      setStatus(status, "Check your inbox: the free presets are on their way.", "ok");
    } catch (err) {
      setStatus(status, err.message, "error");
      toast(err.message, { type: "error" });
    } finally {
      setBusy(button, false);
    }
  });
}

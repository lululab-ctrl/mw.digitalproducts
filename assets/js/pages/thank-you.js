// Thank-you page: the checkout redirects here. Passes the buyer's email on to My downloads.
import { initChrome } from "../lib/ui.js";
import { EMAIL_RE } from "./shared-forms.js";

initChrome();

const email = new URLSearchParams(location.search).get("email");
const link = document.getElementById("to-downloads");
if (email && EMAIL_RE.test(email)) {
  link.href = `/account/?email=${encodeURIComponent(email)}`;
  document.getElementById("sent-to").textContent = email;
  document.getElementById("sent-to-wrap").hidden = false;
}

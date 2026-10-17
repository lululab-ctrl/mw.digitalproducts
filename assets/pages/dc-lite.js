/* ============================================================================
   dc-lite: runs the MWP sales pages exactly as they were designed.
   The pages are Design Component files (<x-dc> markup + a Component class).
   This small runtime renders that markup as-is: {{holes}}, <sc-for>, <sc-if>,
   onClick / onChange handlers and setState, with an in-place DOM patch so
   sliders keep working while you drag. No page markup is altered.
   ============================================================================ */
(function () {
  "use strict";

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; this.__dc = null; }
    setState(update) {
      const next = typeof update === "function" ? update(this.state, this.props) : update;
      this.state = Object.assign({}, this.state, next);
      if (this.__dc) this.__dc.schedule();
    }
    forceUpdate() { if (this.__dc) this.__dc.schedule(); }
  }
  window.DCLogic = DCLogic;

  const HOLE = /{{\s*([^}]*?)\s*}}/g;
  const WHOLE = /^\s*{{\s*([^}]*?)\s*}}\s*$/;

  function lookup(path, scope) {
    if (path === "true") return true;
    if (path === "false") return false;
    if (path === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    let v = scope;
    for (const key of path.split(".")) {
      if (v == null) return undefined;
      v = v[key];
    }
    return v;
  }
  const str = (v) => (v == null || v === false ? "" : String(v));
  const interp = (text, scope) => text.replace(HOLE, (_, p) => str(lookup(p, scope)));

  const EVENT = { onclick: "click", onchange: "input", oninput: "input", onsubmit: "submit",
    onkeydown: "keydown", onkeyup: "keyup", onfocus: "focus", onblur: "blur",
    onmouseenter: "mouseenter", onmouseleave: "mouseleave", onpointerdown: "pointerdown",
    onpointerup: "pointerup", onpointermove: "pointermove" };

  // Build a fresh DOM tree from the template for the current values.
  function build(tpl, scope, out) {
    for (const node of tpl.childNodes) {
      if (node.nodeType === 3) {
        out.appendChild(document.createTextNode(node.nodeValue.indexOf("{{") < 0 ? node.nodeValue : interp(node.nodeValue, scope)));
        continue;
      }
      if (node.nodeType !== 1) continue;
      const tag = node.tagName.toLowerCase();
      if (tag === "sc-for") {
        const m = WHOLE.exec(node.getAttribute("list") || "");
        const list = m ? lookup(m[1], scope) : null;
        const as = node.getAttribute("as") || "item";
        (Array.isArray(list) ? list : []).forEach((item, i) => {
          const inner = Object.create(scope);
          inner[as] = item;
          inner.$index = i;
          build(node, inner, out);
        });
        continue;
      }
      if (tag === "sc-if") {
        const m = WHOLE.exec(node.getAttribute("value") || "");
        if (m && lookup(m[1], scope)) build(node, scope, out);
        continue;
      }
      const el = node.namespaceURI === "http://www.w3.org/2000/svg"
        ? document.createElementNS(node.namespaceURI, node.tagName)
        : document.createElement(node.tagName);
      el.__dcEvents = {};
      for (const a of node.attributes) {
        const name = a.name;
        if (name.startsWith("hint-")) continue;
        const ev = EVENT[name.toLowerCase()];
        if (ev) {
          const m = WHOLE.exec(a.value);
          const fn = m ? lookup(m[1], scope) : null;
          if (typeof fn === "function") el.__dcEvents[ev] = fn;
          continue;
        }
        if (a.value.indexOf("{{") < 0) { el.setAttribute(name, a.value); continue; }
        const whole = WHOLE.exec(a.value);
        const v = whole ? lookup(whole[1], scope) : interp(a.value, scope);
        if (v === false || v == null) continue;
        // data-dc-src="{{…}}" (see tools/unify_pages.py) becomes the real src once the value is known
        el.setAttribute(name === "data-dc-src" ? "src" : name, v === true ? "" : String(v));
      }
      if (tag === "template") el.innerHTML = node.innerHTML;
      else build(node, scope, el);
      out.appendChild(el);
    }
    return out;
  }

  function listen(el) {
    if (!el.__dcBound) el.__dcBound = {};
    for (const type of Object.keys(el.__dcEvents || {})) {
      if (el.__dcBound[type]) continue;
      el.__dcBound[type] = true;
      el.addEventListener(type, (e) => { const fn = el.__dcEvents && el.__dcEvents[type]; if (fn) fn(e); });
    }
  }
  function bindTree(el) {
    if (el.nodeType !== 1) return;
    if (el.__dcCls == null) el.__dcCls = Array.from(el.classList);
    listen(el);
    if ("value" in el && el.hasAttribute("value") && el.value !== el.getAttribute("value")) el.value = el.getAttribute("value");
    for (const c of el.children) bindTree(c);
  }

  // Patch the live DOM to match the freshly built one, keeping elements in place.
  function patch(live, next) {
    const a = live.childNodes, b = next.childNodes;
    let i = 0;
    for (; i < b.length; i++) {
      const want = b[i];
      const have = a[i];
      if (!have) { live.appendChild(want.cloneNode(true)); copyEvents(want, live.lastChild); bindTree(live.lastChild); continue; }
      if (have.nodeType !== want.nodeType || (have.nodeType === 1 && have.tagName !== want.tagName)) {
        const fresh = want.cloneNode(true); copyEvents(want, fresh); bindTree(fresh);
        live.replaceChild(fresh, have);
        continue;
      }
      if (have.nodeType === 3) { if (have.nodeValue !== want.nodeValue) have.nodeValue = want.nodeValue; continue; }
      if (have.nodeType !== 1) continue;
      // Keep what page scripts add at runtime (reveal classes, CSS variables), so a re-render doesn't undo it.
      const extraCls = have.__dcCls == null ? [] : Array.from(have.classList).filter((c) => !have.__dcCls.includes(c));
      const extraVars = [];
      for (let k = 0; k < have.style.length; k++) { const p = have.style[k]; if (p.startsWith("--")) extraVars.push([p, have.style.getPropertyValue(p)]); }
      for (const at of Array.from(have.attributes)) if (!want.hasAttribute(at.name) && !(at.name === "class" && extraCls.length) && !(at.name === "style" && extraVars.length)) have.removeAttribute(at.name);
      for (const at of want.attributes) if (have.getAttribute(at.name) !== at.value) have.setAttribute(at.name, at.value);
      have.__dcCls = (want.getAttribute("class") || "").split(/\s+/).filter(Boolean);
      extraCls.forEach((c) => have.classList.add(c));
      extraVars.forEach(([p, v]) => { if (!have.style.getPropertyValue(p)) have.style.setProperty(p, v); });
      if ("value" in have && want.hasAttribute("value") && have.value !== want.getAttribute("value") && document.activeElement !== have) {
        have.value = want.getAttribute("value");
      }
      have.__dcEvents = want.__dcEvents;
      listen(have);
      patch(have, want);
    }
    while (a.length > b.length) live.removeChild(live.lastChild);
  }
  function copyEvents(src, dst) {
    if (src.nodeType !== 1) return;
    dst.__dcEvents = src.__dcEvents;
    for (let i = 0; i < src.children.length; i++) copyEvents(src.children[i], dst.children[i]);
  }

  function mount() {
    // Remember the language so the rest of the shop opens in it too.
    try { localStorage.setItem("mwp_lang", document.documentElement.lang === "he" ? "he" : "en"); } catch (e) { /* private mode */ }
    const host = document.querySelector("x-dc");
    const script = document.querySelector('script[data-dc-script]');
    if (!host || !script) return;

    // <helmet>: fonts and page styles go to <head>, as in the design editor.
    const helmet = host.querySelector("helmet");
    if (helmet) {
      for (const n of Array.from(helmet.children)) document.head.appendChild(n);
      helmet.remove();
    }

    const tpl = document.createElement("div");
    while (host.firstChild) tpl.appendChild(host.firstChild);
    host.style.display = "block";

    let props = {};
    try {
      const spec = JSON.parse(script.getAttribute("data-props") || "{}");
      for (const [k, v] of Object.entries(spec)) if (k[0] !== "$" && v && "default" in v) props[k] = v.default;
    } catch (e) { /* no tweakable props */ }

    const Component = new Function("DCLogic", script.textContent + "\n;return Component;")(DCLogic);
    const comp = new Component(props);
    if (!comp.state) comp.state = {};

    let queued = false;
    const render = () => {
      queued = false;
      const next = build(tpl, comp.renderVals() || {}, document.createElement("div"));
      patch(host, next);
    };
    comp.__dc = { schedule() { if (!queued) { queued = true; Promise.resolve().then(render); } } };

    const first = build(tpl, comp.renderVals() || {}, document.createElement("div"));
    while (first.firstChild) host.appendChild(first.firstChild);
    // Events were attached to the built nodes; carry them over after the move.
    bindTree(host);
    if (typeof comp.componentDidMount === "function") comp.componentDidMount();

    // In-page anchors (#buy, #faq) still scroll as designed.
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  // Mount as soon as the page markup and its script have been parsed, before any later page scripts run,
  // so those scripts (reveal effects, counters) work on the rendered page rather than the raw template.
  let mounted = false;
  const tryMount = () => {
    if (mounted) return true;
    if (!document.querySelector("x-dc") || !document.querySelector("script[data-dc-script]")) return false;
    mounted = true; mount(); return true;
  };
  if (!tryMount()) {
    const mo = new MutationObserver(() => { if (tryMount()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => { tryMount(); mo.disconnect(); });
  }
})();

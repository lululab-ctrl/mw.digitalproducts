// Opens every page on every screen size and browser, and records what goes wrong:
// crashes, console errors, failed requests, broken images, sideways scrolling,
// wrong reading direction. Also collects links (for the link check) and takes screenshots.
import fs from "node:fs";
import path from "node:path";
import { AxeBuilder } from "@axe-core/playwright";

const SAME = (u, base) => { try { return new URL(u).origin === new URL(base).origin; } catch { return false; } };
const short = (u, base) => (SAME(u, base) ? new URL(u).pathname + new URL(u).search : u);

export async function newContext(browser, { device, lang, base, offline }) {
  const ctx = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    isMobile: browser.browserType().name() !== "firefox" && !!device.mobile,
    hasTouch: !!device.mobile,
    deviceScaleFactor: 1,
    locale: lang.code === "he" ? "he-IL" : "en-US",
  });
  if (lang.localStorage) {
    await ctx.addInitScript((pairs) => { for (const [k, v] of Object.entries(pairs)) try { localStorage.setItem(k, v); } catch {} }, lang.localStorage);
  }
  if (offline) {
    // This machine can't reach the internet: skip outside requests instead of reporting them as failures.
    await ctx.route((url) => !SAME(url.href, base), (route) => route.abort("blockedbyclient"));
  }
  return ctx;
}

/** Visit one page in one setup and return findings + data for other checks. */
export async function visit(ctx, { url, base, device, lang, browserName, shotDir, deep }) {
  const page = await ctx.newPage();
  const found = [];
  const where = { page: short(url, base), device: device.name, browser: browserName, lang: lang.label };
  const add = (rule, detail, extra = {}) => found.push({ rule, detail, ...where, ...extra });

  page.on("pageerror", (err) => add("js-crash", String(err.message || err).split("\n")[0].slice(0, 300)));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/net::ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(text)) return; // reported as request-failed
    add("console-error", text.split("\n")[0].slice(0, 300));
  });
  page.on("requestfailed", (req) => {
    const err = req.failure()?.errorText ?? "";
    // Requests the browser itself cancelled (the page moved on, e.g. a language redirect) aren't failures.
    if (/BLOCKED_BY_CLIENT|blockedbyclient|ERR_ABORTED|NS_BINDING_ABORTED|NS_ERROR_ABORT|cancelled|Load cannot follow|interrupted/i.test(err)) return;
    const own = SAME(req.url(), base);
    add("request-failed", `${short(req.url(), base)} (${err})`, { severity: own ? "High" : "Medium" });
  });
  page.on("response", (res) => {
    const s = res.status();
    if (s < 400 || res.url() === url) return;
    const own = SAME(res.url(), base);
    const type = res.request().resourceType();
    const sev = own && ["script", "stylesheet", "document", "fetch", "xhr"].includes(type) ? "High" : "Medium";
    add("request-failed", `${short(res.url(), base)} answered ${s} (${type})`, { severity: sev });
  });

  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
    status = res?.status() ?? 0;
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(400);
  } catch (e) {
    add("request-failed", `The page didn't load: ${String(e.message).split("\n")[0]}`, { severity: "High" });
    await page.close();
    return { found, links: [], status };
  }

  const info = await page.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    // widest element that pokes out of the screen (ignoring hidden / clipped ones)
    let worst = null;
    if (de.scrollWidth > vw + 2) {
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (!r.width || getComputedStyle(el).position === "fixed") continue;
        const over = Math.max(r.right - vw, -r.left);
        if (over > 2 && (!worst || over > worst.over)) {
          const id = el.id ? `#${el.id}` : "";
          const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
          worst = { over: Math.round(over), sel: `${el.tagName.toLowerCase()}${id}${cls}`, text: (el.textContent || "").trim().slice(0, 40) };
        }
      }
    }
    const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src") && i.loading !== "lazy").map((i) => i.currentSrc || i.src);
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => /^https?:/.test(h));
    return {
      scrollWidth: de.scrollWidth, vw, worst, imgs, links,
      dir: (de.getAttribute("dir") || getComputedStyle(de).direction || "ltr").toLowerCase(),
      viewport: !!document.querySelector('meta[name="viewport"]'),
    };
  });

  if (info.worst) add("horizontal-scroll", `${info.scrollWidth - info.vw}px too wide; widest part: ${info.worst.sel}${info.worst.text ? ` ("${info.worst.text}")` : ""}`);
  for (const src of info.imgs) add("broken-image", short(src, base));
  if (!info.viewport && device.mobile) add("viewport-missing", "No viewport tag");
  if (lang.expectDir && info.dir !== lang.expectDir && status < 400) add("wrong-direction", `Expected ${lang.expectDir}, page is ${info.dir}`);

  let dom = null;
  if (deep) {
    // Accessibility, search and security checks only need to run once per page and language.
    try {
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
      const sev = { critical: "High", serious: "Medium", moderate: "Low", minor: "Low" };
      for (const v of axe.violations) {
        const targets = v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" · ");
        add("a11y", `${v.help} (${v.nodes.length} place${v.nodes.length === 1 ? "" : "s"}: ${targets})`, {
          severity: sev[v.impact] ?? "Low", ruleTitle: v.help, learnMore: v.helpUrl, axeId: v.id,
        });
      }
    } catch (e) { add("console-error", `Accessibility scan couldn't run: ${e.message.split("\n")[0]}`, { severity: "Low" }); }

    dom = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content")?.trim() ?? null;
      return {
        title: document.title.trim(),
        description: meta('meta[name="description"]'),
        robots: meta('meta[name="robots"]'),
        h1: document.querySelectorAll("h1").length,
        lang: document.documentElement.getAttribute("lang"),
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        og: ["og:title", "og:description", "og:image"].filter((p) => !document.querySelector(`meta[property="${p}"]`)),
        csp: meta('meta[http-equiv="Content-Security-Policy" i]'),
        referrer: meta('meta[name="referrer"]'),
        scripts: [...document.scripts].filter((s) => s.src).map((s) => ({ src: s.src, integrity: !!s.integrity })),
        imports: [...document.querySelectorAll("script[type=module]")].map((s) => s.textContent.match(/https?:\/\/[^"'\s)]+/g) || []).flat(),
        insecure: [...document.querySelectorAll("[src^='http:'], link[href^='http:'][rel=stylesheet]")].map((e) => e.getAttribute("src") || e.getAttribute("href")),
        forms: [...document.forms].map((f) => f.getAttribute("action")).filter((a) => a && a.startsWith("http:")),
      };
    });
  }

  if (shotDir) {
    fs.mkdirSync(shotDir, { recursive: true });
    const name = `${where.page.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}__${lang.code}__${device.name.replace(/\s+/g, "-")}__${browserName}.jpg`;
    await page.screenshot({ path: path.join(shotDir, name), type: "jpeg", quality: 55 }).catch(() => {});
    where.shot = name;
  }

  const finalPath = short(page.url(), base);
  await page.close();
  return { found, links: info.links, status, dom, shot: where.shot, finalPath };
}

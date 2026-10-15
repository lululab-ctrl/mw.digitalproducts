#!/usr/bin/env node
// ============================================================================
// Site QA: one command that tests a website the way a QA team would, and
// explains every problem in plain English.
//
//   node qa/run.mjs                      build the site, serve it locally, test everything
//   node qa/run.mjs --url https://…      test a site that's already online (e.g. a preview)
//   node qa/run.mjs --quick              Chrome only, three screen sizes, no speed test
//   node qa/run.mjs --update-baseline    accept today's serious issues as "known"
//
// Run from the repository root. Settings: qa/qa.config.json.
// Output: qa/report/report.html (+ results.json, summary.md, screenshots/).
// Exit code 1 = a new Critical/High issue was found (the deploy should stop).
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import { startServer } from "./lib/server.mjs";
import { newContext, visit } from "./lib/checks/pages.mjs";
import { checkLinks } from "./lib/checks/links.mjs";
import { runFlows } from "./lib/checks/flows.mjs";
import { seoChecks } from "./lib/checks/seo.mjs";
import { scanSecrets, domSecurityChecks, headerChecks, dependencyAudit } from "./lib/checks/security.mjs";
import { RULES, SEVERITIES } from "./lib/rules.mjs";
import { writeReport } from "./lib/report.mjs";

const QA = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(QA, "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };

const config = JSON.parse(fs.readFileSync(opt("--config") ?? path.join(QA, "qa.config.json"), "utf8"));
const OUT = path.resolve(opt("--out") ?? path.join(QA, "report"));
const SHOTS = path.join(OUT, "screenshots");
const offline = process.env.QA_OFFLINE === "1";
const quick = flag("--quick");
const started = Date.now();
const log = (...m) => console.log(`[${((Date.now() - started) / 1000).toFixed(0).padStart(4)}s]`, ...m);
const notes = [];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });

// ── 1. Get a copy of the site to test ─────────────────────────────────────
let base = opt("--url");
let server;
let siteDir = config.serveDir ? path.join(ROOT, config.serveDir) : null;
if (!base) {
  if (config.build) { log("Building the site…"); execSync(config.build, { cwd: ROOT, stdio: "inherit", shell: "/bin/bash" }); }
  server = await startServer(siteDir);
  base = server.url;
  log(`Serving ${config.serveDir} at ${base}`);
}
base = base.replace(/\/$/, "");
if (offline) notes.push("Run without internet access: outside services (fonts, the database, payment links, outside links) weren't reached, so problems involving them can't show up in this run. The GitHub run tests them.");

// ── 2. Browsers ───────────────────────────────────────────────────────────
const wanted = quick ? ["chromium"] : (config.browsers ?? ["chromium"]);
const engines = { chromium, firefox, webkit };
const label = { chromium: "Chrome / Edge", firefox: "Firefox", webkit: "Safari (iPhone, Mac)" };
const browsers = {};
for (const name of wanted) {
  try { browsers[name] = await engines[name].launch(); }
  catch { notes.push(`${label[name]} isn't installed on this machine, so it was skipped. The GitHub run includes it.`); }
}
if (!browsers.chromium) throw new Error("Chromium is required: run `npx playwright install chromium`.");

const langs = config.languages?.length ? config.languages : [{ code: "en", label: "English" }];
const devices = quick ? [config.devices.find((d) => d.mobile && d.width < 500), config.devices.find((d) => d.width >= 700 && d.width < 1100), config.devices.find((d) => !d.mobile && d.width >= 1200)].filter(Boolean) : config.devices;
const desktop = devices.find((d) => !d.mobile) ?? devices.at(-1);
const phones = devices.filter((d) => d.mobile && d.width < 500);
const phone = phones.find((d) => d.width >= 380) ?? phones[0] ?? devices[0];
const tablet = devices.find((d) => d.width >= 700 && d.width < 1100);

const findings = [];
const linkMap = new Map(); // link → pages it appears on
const pagesDom = [];
const visited = [];
const isPageLink = (u) => !/\.(pdf|zip|jpe?g|png|webp|gif|svg|mp4|cube|xmp|dng)$/i.test(u.pathname) && !(config.crawl?.exclude ?? []).some((x) => u.pathname.startsWith(x));

async function pool(items, size, fn) {
  const q = [...items];
  await Promise.all(Array.from({ length: size }, async () => { while (q.length) await fn(q.shift()); }));
}

async function pass(browserName, devs, { deep = false, shotsOn = [] } = {}, pages) {
  const b = browsers[browserName];
  const jobs = pages.flatMap((p) => langs.flatMap((lang) => devs.map((device) => ({ p, lang, device }))));
  await pool(jobs, 4, async ({ p, lang, device }) => {
    const ctx = await newContext(b, { device, lang, base, offline });
    const r = await visit(ctx, {
      url: base + p, base, device, lang, browserName, deep,
      shotDir: shotsOn.includes(device.name) ? SHOTS : null,
    });
    await ctx.close();
    findings.push(...r.found);
    if (deep) {
      // A page that sends this language elsewhere (e.g. to its Hebrew version) is judged at its destination.
      const redirectedTo = r.finalPath && r.finalPath.split("?")[0] !== p.split("?")[0] ? r.finalPath : null;
      if (!redirectedTo) pagesDom.push({ page: p, lang: lang.label, dom: r.dom });
      visited.push({ page: p, lang: lang.label, status: r.status, shot: r.shot, redirectedTo });
      for (const l of r.links) {
        const set = linkMap.get(l) ?? new Set(); set.add(p); linkMap.set(l, set);
      }
    }
  });
}

// ── 3. Every page: deep check on desktop Chrome (and find more pages) ────
let pages = [...new Set(config.pages ?? ["/"])];
log(`Checking ${pages.length} pages × ${langs.length} languages in depth…`);
await pass("chromium", [desktop], { deep: true, shotsOn: [desktop.name] }, pages);
if (config.crawl?.enabled) {
  const more = [];
  for (const l of linkMap.keys()) {
    const u = new URL(l);
    if (u.origin !== base && !(config.liveUrl && u.origin === new URL(config.liveUrl).origin)) continue;
    const p = u.pathname.replace(/\/index\.html$/, "/") + u.search;
    if (isPageLink(u) && !pages.includes(p) && !more.includes(p)) more.push(p);
  }
  const extra = more.slice(0, Math.max(0, (config.crawl.maxPages ?? 40) - pages.length));
  if (extra.length) {
    log(`Found ${extra.length} more pages through links: ${extra.join(", ")}`);
    await pass("chromium", [desktop], { deep: true, shotsOn: [desktop.name] }, extra);
    pages = [...pages, ...extra];
  }
}

// ── 4. Every page on every screen size, then other browsers ──────────────
log(`Checking ${pages.length} pages on ${devices.length - 1} more screen sizes…`);
await pass("chromium", devices.filter((d) => d !== desktop), { shotsOn: [phone.name, tablet?.name].filter(Boolean) }, pages);
for (const name of ["firefox", "webkit"]) {
  if (!browsers[name]) continue;
  log(`Checking ${pages.length} pages in ${label[name]}…`);
  await pass(name, [phone, desktop], { shotsOn: name === "webkit" ? [phone.name] : [] }, pages);
}

// ── 5. Visitor journeys ───────────────────────────────────────────────────
const flowsPassed = [];
for (const [name, b] of Object.entries(browsers)) {
  log(`Running ${config.flows?.length ?? 0} visitor journeys in ${label[name]}…`);
  const r = await runFlows(b, name, { config, base, offline, shotDir: SHOTS });
  findings.push(...r.found);
  flowsPassed.push(...r.passed);
}
for (const b of Object.values(browsers)) await b.close();

// ── 6. Links, search engines, security ───────────────────────────────────
log(`Checking ${linkMap.size} links…`);
const linkRes = await checkLinks(linkMap, { base, offline, liveUrl: config.liveUrl });
findings.push(...linkRes.found);

let robotsTxt = null;
try { const r = await fetch(base + "/robots.txt"); if (r.ok) robotsTxt = await r.text(); } catch {}
findings.push(...seoChecks(pagesDom, { robotsTxt, config }));

log("Security checks…");
findings.push(...domSecurityChecks(pagesDom, base));
if (siteDir && fs.existsSync(siteDir)) findings.push(...scanSecrets(siteDir));
else notes.push("The published files weren't available locally, so the secret-key scan was skipped.");
findings.push(...dependencyAudit(ROOT));
let headers = { checked: [] };
if (config.liveUrl && !offline) {
  headers = await headerChecks(config.liveUrl, pages);
  findings.push(...headers.found);
} else notes.push("Security headers are a property of the live host, so they're checked against the live site in the GitHub run.");

// Issues found by a person or by Claude reading the code. Pass the file with --review <file>.
// Keep it OUT of a public repository: it describes weaknesses before they're fixed.
const reviewFile = opt("--review") ?? process.env.QA_REVIEW_FILE ?? path.join(QA, "code-review.json");
const review = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile, "utf8")) : [];
for (const r of review.filter((x) => x.status !== "fixed")) {
  findings.push({ rule: "code-review", severity: r.severity, page: r.where, detail: r.detail, custom: { title: r.title, why: r.why, fix: r.fix }, id: r.id });
}

// ── 7. Speed ──────────────────────────────────────────────────────────────
let perf = { scores: [] };
if (!quick && !flag("--skip-perf")) {
  log(`Speed test on ${config.performancePages?.length ?? 0} pages…`);
  const { runPerformance } = await import("./lib/checks/performance.mjs");
  perf = await runPerformance(config.performancePages ?? ["/"], { base, budget: config.performanceBudget ?? { score: 70, lcpMs: 2500, cls: 0.1, tbtMs: 300 } });
  findings.push(...perf.found);
  if (offline || server) notes.push("Speed was measured on a local copy of the site. Real visitors also wait for the host, so live numbers are usually somewhat slower.");
}
if (server) await server.close();

// ── 8. Group, compare with known issues, decide ──────────────────────────
const groups = new Map();
for (const f of findings) {
  const rule = RULES[f.rule];
  const severity = f.severity ?? rule.severity;
  const sameness = f.axeId ? `axe:${f.axeId}` : f.id ? `review:${f.id}` : f.detail.replace(/\d+px too wide/, "").replace(/\(\d+ places?:.*$/, "");
  const key = `${f.rule}|${severity}|${sameness}`;
  const g = groups.get(key) ?? { key, rule: f.rule, severity, category: rule.category, title: f.custom?.title ?? f.ruleTitle ?? rule.title,
    ruleTitle: rule.title, why: f.custom?.why ?? rule.why, fix: f.custom?.fix ?? rule.fix, learnMore: f.learnMore,
    details: new Set(), pages: new Set(), devices: new Set(), browsers: new Set(), langs: new Set(), shots: new Set() };
  g.details.add(f.detail);
  if (f.page) g.pages.add(f.page);
  for (const p of f.alsoOn ?? []) g.pages.add(p);
  if (f.device) g.devices.add(f.device);
  if (f.browser) g.browsers.add(label[f.browser] ?? f.browser);
  if (f.lang) g.langs.add(f.lang);
  if (f.shot) g.shots.add(f.shot);
  groups.set(key, g);
}
const issues = [...groups.values()].map((g) => ({
  ...g, id: crypto.createHash("sha1").update(g.key).digest("hex").slice(0, 10),
  details: [...g.details].slice(0, 8), moreDetails: Math.max(0, g.details.size - 8),
  pages: [...g.pages], devices: [...g.devices], browsers: [...g.browsers], langs: [...g.langs], shots: [...g.shots].slice(0, 4),
})).sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.category.localeCompare(b.category));

const baselineFile = path.join(QA, "baseline.json");
const blockOn = config.gate?.blockOn ?? ["Critical", "High"];
if (flag("--update-baseline")) {
  const known = issues.filter((i) => blockOn.includes(i.severity)).map((i) => ({ id: i.id, title: i.title, severity: i.severity }));
  fs.writeFileSync(baselineFile, JSON.stringify({ updated: new Date().toISOString(), known }, null, 2) + "\n");
  log(`Saved ${known.length} serious issues as known in qa/baseline.json`);
}
const known = new Set(fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, "utf8")).known.map((k) => k.id) : []);
for (const i of issues) {
  i.known = known.has(i.id);
  i.blocking = blockOn.includes(i.severity) && !i.known;
}
const blocking = issues.filter((i) => i.blocking);

const result = {
  site: config.site, tested: base, liveUrl: config.liveUrl, when: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? (() => { try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch { return null; } })(),
  durationS: Math.round((Date.now() - started) / 1000), mode: quick ? "quick" : "full",
  coverage: {
    pages: pages.length, languages: langs.map((l) => l.label), devices: devices.map((d) => `${d.name} (${d.width}×${d.height})`),
    browsers: Object.keys(browsers).map((b) => label[b]), links: linkRes.checked, flows: config.flows?.length ?? 0,
  },
  verdict: blocking.length ? "blocked" : "pass", blockOn,
  counts: Object.fromEntries(SEVERITIES.map((s) => [s, issues.filter((i) => i.severity === s).length])),
  issues, flowsPassed, visited, perf: perf.scores, headers: headers.checked, notes,
};
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(result, null, 2));
writeReport(result, OUT);
log(`Done: ${issues.length} issues (${SEVERITIES.map((s) => `${result.counts[s]} ${s}`).join(", ")}). ${blocking.length ? `${blocking.length} NEW serious issue(s): deploy should stop.` : "Nothing new that blocks a deploy."}`);
log(`Report: ${path.relative(ROOT, path.join(OUT, "report.html"))}`);
process.exit(blocking.length ? 1 : 0);

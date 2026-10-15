// Security checks that are safe to run against any site: nothing is attacked or submitted.
//  - secrets published in the site's files
//  - insecure (http://) content and forms
//  - outside scripts that aren't version-locked
//  - security headers on the live site
//  - known holes in the site's npm libraries
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const SECRET_PATTERNS = [
  ["Stripe live secret key", /\bsk_live_[0-9a-zA-Z]{20,}/],
  ["Stripe restricted key", /\brk_live_[0-9a-zA-Z]{20,}/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\b(ghp|gho|ghs|ghu|github_pat)_[0-9A-Za-z_]{30,}/],
  ["Private key", /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Slack token", /\bxox[abpr]-[0-9A-Za-z-]{10,}/],
  ["OpenAI / Anthropic key", /\bsk-(ant-|proj-)?[A-Za-z0-9_-]{32,}/],
  ["SendGrid key", /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/],
  ["Make.com webhook address", /https:\/\/hook\.[a-z0-9]+\.make\.com\/[a-z0-9]{20,}/i],
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(html?|js|mjs|cjs|json|css|txt|xml|map|env)$/i.test(e.name) || e.name.startsWith(".env")) yield p;
  }
}

export function scanSecrets(siteDir) {
  const found = [];
  for (const file of walk(siteDir)) {
    const text = fs.readFileSync(file, "utf8");
    const rel = "/" + path.relative(siteDir, file).split(path.sep).join("/");
    for (const [name, re] of SECRET_PATTERNS) {
      const m = text.match(re);
      if (m) found.push({ rule: "secret-exposed", detail: `${name} in ${rel}: ${m[0].slice(0, 12)}…`, page: rel });
    }
    // Supabase / JWT keys: the "anon" key is public by design; the "service_role" key must never be in the site.
    for (const jwt of text.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g) ?? []) {
      try {
        const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
        if (claims.role === "service_role") found.push({ rule: "secret-exposed", detail: `Supabase service_role key in ${rel}`, page: rel });
      } catch { /* not a JWT */ }
    }
    if (/sb_secret_[A-Za-z0-9_-]{20,}/.test(text)) found.push({ rule: "secret-exposed", detail: `Supabase secret key in ${rel}`, page: rel });
  }
  return found;
}

export function domSecurityChecks(pagesDom, base) {
  const found = [];
  const seen = new Set();
  for (const { page, dom } of pagesDom) {
    if (!dom) continue;
    for (const u of dom.insecure) found.push({ rule: "mixed-content", detail: u, page });
    for (const a of dom.forms) found.push({ rule: "insecure-form", detail: `Form sends to ${a}`, page });
    const outside = [
      ...dom.scripts.filter((s) => !s.integrity && !s.src.startsWith(base)).map((s) => s.src),
      ...dom.imports.filter((u) => /\.(js|mjs)|\/\+esm|npm\//.test(u)),
    ];
    for (const src of outside) {
      if (seen.has(src)) continue;
      seen.add(src);
      const floating = /@\d+(\/|$|\+)|@latest|@\^|@~/.test(src) || !/@\d+\.\d+\.\d+/.test(src);
      found.push({ rule: "script-no-integrity", detail: `${src}${floating ? " (version not pinned: updates automatically)" : ""}`, page });
    }
  }
  return found;
}

export async function headerChecks(liveUrl, pages) {
  const found = [];
  const checked = [];
  for (const p of pages.slice(0, 6)) {
    const url = new URL(p, liveUrl).href;
    let res;
    try { res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) }); }
    catch (e) { checked.push({ page: p, error: e.message }); continue; }
    const h = (n) => res.headers.get(n);
    const html = (res.headers.get("content-type") ?? "").includes("html") ? await res.text() : "";
    const metaCsp = /<meta[^>]+http-equiv=["']?content-security-policy/i.test(html);
    const metaRef = /<meta[^>]+name=["']?referrer/i.test(html);
    const where = { page: p, browser: "live site" };
    const server = h("server") ?? "";
    const note = /github\.com/i.test(server) ? " (GitHub Pages can't send custom headers; see the fix for the workaround or a host that can)" : "";
    if (!h("strict-transport-security")) found.push({ rule: "header-hsts", detail: `No Strict-Transport-Security header${note}`, ...where });
    if (!h("content-security-policy") && !metaCsp) found.push({ rule: "header-csp", detail: `No CSP header or meta tag${note}`, ...where });
    if (!h("x-frame-options") && !/frame-ancestors/i.test(h("content-security-policy") ?? "")) found.push({ rule: "header-frame", detail: `No X-Frame-Options or frame-ancestors${note}`, ...where });
    if (!/nosniff/i.test(h("x-content-type-options") ?? "")) found.push({ rule: "header-nosniff", detail: `Missing${note}`, ...where });
    if (!h("referrer-policy") && !metaRef) found.push({ rule: "header-referrer", detail: "No Referrer-Policy header or meta tag", ...where });
    checked.push({ page: p, status: res.status, server });
  }
  return { found, checked };
}

export function dependencyAudit(repoRoot) {
  const found = [];
  if (!fs.existsSync(path.join(repoRoot, "package-lock.json"))) return found;
  let out;
  try { out = execSync("npm audit --json --omit=dev", { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] }).toString(); }
  catch (e) { out = e.stdout?.toString() ?? "{}"; }
  const sev = { critical: "Critical", high: "High", moderate: "Medium", low: "Low" };
  for (const [name, v] of Object.entries(JSON.parse(out).vulnerabilities ?? {})) {
    const fix = v.fixAvailable ? (typeof v.fixAvailable === "object" ? `update to ${v.fixAvailable.name}@${v.fixAvailable.version}` : "run npm audit fix") : "no fix yet";
    found.push({ rule: "dependency-vuln", detail: `${name} (${v.range}): ${fix}`, page: "package.json", severity: sev[v.severity] ?? "Medium" });
  }
  return found;
}

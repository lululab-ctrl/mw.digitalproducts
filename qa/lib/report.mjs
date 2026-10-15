// Turns results.json into report.html (for people) and summary.md (for GitHub).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { CATEGORIES, SEVERITIES } from "./rules.mjs";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const SEV_NOTE = {
  Critical: "Fix today. Real harm is possible right now.",
  High: "Fix before the next release. Visitors or data are affected.",
  Medium: "Fix soon. It hurts some visitors, sales or search ranking.",
  Low: "Polish. Worth doing when you're in that area.",
};

function listOrAll(items, all, word) {
  if (!items.length) return "";
  if (all && items.length >= all) return `all ${word}`;
  return items.join(", ");
}

function issueCard(i, r) {
  const where = [
    i.pages.length ? `<div><dt>Where</dt><dd>${esc(i.pages.slice(0, 8).join(", "))}${i.pages.length > 8 ? ` and ${i.pages.length - 8} more` : ""}</dd></div>` : "",
    i.devices.length ? `<div><dt>Screens</dt><dd>${esc(listOrAll(i.devices, r.coverage.devices.length, "screen sizes"))}</dd></div>` : "",
    i.browsers.length ? `<div><dt>Browsers</dt><dd>${esc(listOrAll(i.browsers, r.coverage.browsers.length, "browsers"))}</dd></div>` : "",
    i.langs.length ? `<div><dt>Language</dt><dd>${esc(i.langs.join(", "))}</dd></div>` : "",
  ].join("");
  const shots = i.shots.map((s) => `<a href="screenshots/${esc(s)}" target="_blank" rel="noopener"><img src="screenshots/${esc(s)}" alt="Screenshot: ${esc(s)}" loading="lazy"></a>`).join("");
  return `<article class="issue sev-${i.severity.toLowerCase()}" id="i-${i.id}">
    <header>
      <span class="badge">${i.severity}</span>
      ${i.blocking ? `<span class="tag block">Blocks deploy</span>` : i.known ? `<span class="tag">Known</span>` : ""}
      <span class="cat">${esc(CATEGORIES[i.category])}</span>
    </header>
    <h3>${esc(i.title)}</h3>
    ${i.title !== i.ruleTitle && i.rule !== "code-review" ? `<p class="kind">${esc(i.ruleTitle)}</p>` : ""}
    <dl class="where">${where}</dl>
    ${i.note ? `<p class="note">Reviewed: ${esc(i.note)}</p>` : ""}
    <div class="cols">
      <section><h4>What we found</h4><ul class="details">${i.details.map((d) => `<li><code>${esc(d)}</code></li>`).join("")}${i.moreDetails ? `<li>…and ${i.moreDetails} more like this</li>` : ""}</ul></section>
      <section><h4>Why it matters</h4><p>${esc(i.why)}</p><h4>How to fix it</h4><p>${esc(i.fix)}</p>${i.learnMore ? `<p><a href="${esc(i.learnMore)}" target="_blank" rel="noopener">Step-by-step guide →</a></p>` : ""}</section>
    </div>
    ${shots ? `<div class="shots">${shots}</div>` : ""}
  </article>`;
}

export function writeReport(r, outDir) {
  const blocked = r.verdict === "blocked";
  const nBlock = r.issues.filter((i) => i.blocking).length;
  const perfRows = r.perf.map((p) => p.error ? `<tr><td>${esc(p.page)}</td><td colspan="5">Couldn't measure: ${esc(p.error)}</td></tr>` :
    `<tr><td>${esc(p.page)}</td><td class="num ${p.score >= 90 ? "good" : p.score >= 50 ? "ok" : "bad"}">${p.score}</td><td class="num">${(p.lcp / 1000).toFixed(1)}s</td><td class="num">${p.cls.toFixed(2)}</td><td class="num">${Math.round(p.tbt)}ms</td><td class="num">${(p.weight / 1048576).toFixed(1)} MB</td></tr>`).join("");
  const byCat = Object.entries(CATEGORIES).map(([k, name]) => {
    const list = r.issues.filter((i) => i.category === k);
    const worst = SEVERITIES.find((s) => list.some((i) => i.severity === s));
    const untested = k === "performance" && !r.perf.length;
    return `<a class="cat-tile" href="#c-${k}"><span>${esc(name)}</span><b class="${worst ? "sev-" + worst.toLowerCase() : untested ? "untested" : "clean"}">${list.length ? plural(list.length, "issue") : untested ? "Not tested" : "All clear"}</b></a>`;
  }).join("");
  const sections = Object.entries(CATEGORIES).map(([k, name]) => {
    const list = r.issues.filter((i) => i.category === k);
    return `<section class="category" id="c-${k}"><h2>${esc(name)} <small>${list.length ? plural(list.length, "issue") : "no issues found"}</small></h2>${list.map((i) => issueCard(i, r)).join("")}</section>`;
  }).join("");
  const flowNames = [...new Set(r.flowsPassed.map((f) => f.flow))];
  const flowFails = r.issues.filter((i) => i.rule === "flow-failed").flatMap((i) => i.pages);
  const flowsOk = flowNames.filter((f) => !flowFails.includes(f));

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Site QA Report</title>
<style>
:root{--bg:#f6f5f2;--card:#fff;--ink:#1d1d1b;--mute:#6b6a65;--line:#e4e2dc;--crit:#b3261e;--high:#c2410c;--med:#a16207;--low:#4b5563;--good:#15803d;--accent:#8a6d1f;--code:#f1efe9}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#141412;--card:#1d1d1a;--ink:#ecebe6;--mute:#a3a29b;--line:#33322e;--crit:#f2867f;--high:#f59e5b;--med:#e3b341;--low:#9ca3af;--good:#4ade80;--accent:#d8b866;--code:#272622}}
:root[data-theme=dark]{--bg:#141412;--card:#1d1d1a;--ink:#ecebe6;--mute:#a3a29b;--line:#33322e;--crit:#f2867f;--high:#f59e5b;--med:#e3b341;--low:#9ca3af;--good:#4ade80;--accent:#d8b866;--code:#272622}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:980px;margin:0 auto;padding:32px 16px 64px}
h1{font-size:28px;margin:0 0 4px;letter-spacing:-.01em}h2{font-size:20px;margin:40px 0 12px}h2 small{color:var(--mute);font-weight:400;font-size:14px;margin-left:6px}
h3{font-size:17px;margin:8px 0 2px}h4{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--mute);margin:12px 0 4px}
.meta{color:var(--mute);font-size:13px}a{color:var(--accent)}
.verdict{border-radius:14px;padding:20px 22px;margin:20px 0;border:1px solid var(--line);background:var(--card);display:flex;gap:16px;align-items:flex-start}
.verdict .dot{width:14px;height:14px;border-radius:50%;margin-top:6px;flex:none;background:var(--good)}.verdict.blocked .dot{background:var(--crit)}
.verdict b{font-size:18px;display:block;margin-bottom:2px}
.counts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}
.count{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}.count b{font-size:26px;display:block;font-variant-numeric:tabular-nums}.count span{font-size:13px;color:var(--mute)}
.count.c-critical b{color:var(--crit)}.count.c-high b{color:var(--high)}.count.c-medium b{color:var(--med)}.count.c-low b{color:var(--low)}
.cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.cat-tile{display:flex;justify-content:space-between;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;text-decoration:none;color:var(--ink);font-size:14px}
.cat-tile b{font-weight:600;white-space:nowrap}.clean{color:var(--good)}.untested{color:var(--mute);font-weight:400}
b.sev-critical{color:var(--crit)}b.sev-high{color:var(--high)}b.sev-medium{color:var(--med)}b.sev-low{color:var(--low)}
.issue{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--low);border-radius:12px;padding:16px 18px;margin:12px 0}
.issue.sev-critical{border-left-color:var(--crit)}.issue.sev-high{border-left-color:var(--high)}.issue.sev-medium{border-left-color:var(--med)}
.issue header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px}
.badge{font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--low)}
.sev-critical .badge{color:var(--crit)}.sev-high .badge{color:var(--high)}.sev-medium .badge{color:var(--med)}
.tag{border:1px solid var(--line);border-radius:99px;padding:1px 8px;color:var(--mute)}.tag.block{border-color:var(--crit);color:var(--crit);font-weight:600}
.cat{color:var(--mute);margin-left:auto}.kind{color:var(--mute);margin:0;font-size:13px}
.where{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin:10px 0 0;font-size:13px}.where div{display:contents}.where dt{color:var(--mute)}.where dd{margin:0}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px}.cols p{margin:0 0 6px}
.details{margin:0;padding-left:18px;font-size:13px}.details li{margin:3px 0;overflow-wrap:anywhere}
code{background:var(--code);border-radius:4px;padding:1px 4px;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.shots{display:flex;gap:8px;margin-top:12px;overflow-x:auto}.shots img{height:150px;border-radius:8px;border:1px solid var(--line)}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}
th,td{padding:8px 12px;border-bottom:1px solid var(--line);text-align:left}th{font-size:12px;color:var(--mute);font-weight:600}td.num{text-align:right;font-variant-numeric:tabular-nums}
td.good{color:var(--good);font-weight:700}td.ok{color:var(--med);font-weight:700}td.bad{color:var(--crit);font-weight:700}
.passed{columns:2;padding-left:0;list-style:none}.passed li{break-inside:avoid;margin:2px 0}
.note{font-size:13px;color:var(--mute);border-left:2px solid var(--line);padding-left:10px;margin:10px 0 0}.notes{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px 12px 34px;font-size:14px;color:var(--mute)}
.legend{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}
@media (max-width:700px){.cols{grid-template-columns:1fr}.counts{grid-template-columns:repeat(2,1fr)}.passed{columns:1}.cat{margin-left:0;width:100%}}
</style></head><body><main>
<p class="meta">Site QA report</p>
<h1>${esc(r.site)}</h1>
<p class="meta">Tested ${esc(new Date(r.when).toUTCString())}${r.commit ? ` · version ${esc(String(r.commit).slice(0, 7))}` : ""} · took ${Math.round(r.durationS / 60)} min · ${r.mode} check</p>

<div class="verdict ${blocked ? "blocked" : ""}"><span class="dot"></span><div>
${blocked
    ? `<b>Not ready to go live: ${plural(nBlock, "new serious issue")}</b>These are ${r.blockOn.join(" or ")} issues that aren't on the known-issues list. Fix them, or ask a reviewer to accept them as known.`
    : `<b>No new serious issues</b>Nothing new at ${r.blockOn.join(" or ")} level. ${r.issues.some((i) => i.known) ? "Issues already known are still listed below to work through." : ""}`}
</div></div>

<div class="counts">${SEVERITIES.map((s) => `<div class="count c-${s.toLowerCase()}"><b>${r.counts[s]}</b><span>${s}</span></div>`).join("")}</div>
<div class="cats">${byCat}</div>

<h2>What was tested</h2>
<p>${plural(r.coverage.pages, "page")} in ${esc(r.coverage.languages.join(" and "))}, on ${plural(r.coverage.devices.length, "screen size")} (${esc(r.coverage.devices.join(", "))}), in ${esc(r.coverage.browsers.join(", "))}. ${plural(r.coverage.links, "link")} followed. ${plural(r.coverage.flows, "visitor journey")} walked through step by step.</p>
${r.notes.length ? `<ul class="notes">${r.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
${flowsOk.length ? `<h4>Visitor journeys that work</h4><ul class="passed">${flowsOk.map((f) => `<li>✓ ${esc(f)}</li>`).join("")}</ul>` : ""}

${perfRows ? `<h2>Speed on a phone</h2><p class="meta">Google's scoring: 90+ is good, 50–89 needs work, under 50 is poor. LCP = when the main content appears (target under 2.5s). CLS = how much things jump (target under 0.1). TBT = how long the page ignores taps (target under 300ms).</p>
<table><thead><tr><th>Page</th><th class="num">Score</th><th class="num">LCP</th><th class="num">CLS</th><th class="num">TBT</th><th class="num">Size</th></tr></thead><tbody>${perfRows}</tbody></table>` : ""}

<h2>What the levels mean</h2>
<div class="legend">${SEVERITIES.map((s) => `<b class="sev-${s.toLowerCase()}">${s}</b><span>${SEV_NOTE[s]}</span>`).join("")}</div>

${sections}
</main></body></html>`;
  fs.writeFileSync(path.join(outDir, "report.html"), html);

  const md = [
    `## ${blocked ? "🛑" : "✅"} Site QA: ${blocked ? `${plural(nBlock, "new serious issue")}, not ready to go live` : "no new serious issues"}`,
    "",
    `| Critical | High | Medium | Low |`, `|---|---|---|---|`, `| ${SEVERITIES.map((s) => r.counts[s]).join(" | ")} |`,
    "",
    `${plural(r.coverage.pages, "page")} · ${r.coverage.languages.join(" + ")} · ${plural(r.coverage.devices.length, "screen size")} · ${r.coverage.browsers.join(", ")} · ${plural(r.coverage.links, "link")} · ${plural(r.coverage.flows, "journey")}`,
    "",
    ...(r.issues.filter((i) => ["Critical", "High"].includes(i.severity)).length ? ["**Serious issues**", "", ...r.issues.filter((i) => ["Critical", "High"].includes(i.severity)).map((i) => `- **${i.severity}**${i.blocking ? " (new, blocks deploy)" : i.known ? " (known)" : ""}: ${i.title}${i.pages.length ? ` · ${i.pages.slice(0, 3).join(", ")}${i.pages.length > 3 ? "…" : ""}` : ""}`), ""] : []),
    "The full report with explanations and fixes is attached to this run as **qa-report** (download, unzip, open report.html).",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "summary.md"), md + "\n");

  // The whole report as text, shown on the pull request's Checks tab (GitHub allows about 65,000 characters).
  const parts = [
    `**Tested:** ${plural(r.coverage.pages, "page")} in ${r.coverage.languages.join(" and ")} · ${r.coverage.devices.join(", ")} · ${r.coverage.browsers.join(", ")} · ${plural(r.coverage.links, "link")} · ${plural(r.coverage.flows, "visitor journey")}`,
    ...(r.notes.length ? ["", ...r.notes.map((n) => `> ${n}`)] : []),
    "",
    ...(flowsOk.length ? ["**Visitor journeys that work:** " + flowsOk.join(" · "), ""] : []),
    ...(r.perf.length ? ["### Speed on a phone", "", "| Page | Score | LCP | CLS | TBT |", "|---|---|---|---|---|",
      ...r.perf.map((p) => p.error ? `| ${p.page} | couldn't measure | | | |` : `| ${p.page} | ${p.score} | ${(p.lcp / 1000).toFixed(1)}s | ${p.cls.toFixed(2)} | ${Math.round(p.tbt)}ms |`), ""] : []),
  ];
  for (const i of r.issues) {
    parts.push(
      `### ${i.severity}${i.blocking ? " · blocks deploy" : i.known ? " · known" : ""}: ${i.title}`,
      `*${CATEGORIES[i.category]}*${i.pages.length ? ` · **Where:** ${i.pages.slice(0, 8).join(", ")}${i.pages.length > 8 ? ` +${i.pages.length - 8} more` : ""}` : ""}${i.devices.length ? ` · **Screens:** ${listOrAll(i.devices, r.coverage.devices.length, "screen sizes")}` : ""}${i.browsers.length ? ` · **Browsers:** ${listOrAll(i.browsers, r.coverage.browsers.length, "browsers")}` : ""}${i.langs.length ? ` · **Language:** ${i.langs.join(", ")}` : ""}`,
      ...(i.note ? ["", `> Reviewed: ${i.note}`] : []),
      "",
      ...i.details.slice(0, 5).map((d) => `- \`${d.replace(/`/g, "'")}\``),
      ...(i.details.length > 5 || i.moreDetails ? [`- …and ${i.details.length - 5 + i.moreDetails} more like this`] : []),
      "",
      `**Why it matters:** ${i.why}`,
      "",
      `**How to fix it:** ${i.fix}${i.learnMore ? ` [Guide](${i.learnMore})` : ""}`,
      "",
    );
  }
  // A compressed, machine-readable copy of the results, hidden in the text (invisible on GitHub), for tools
  // that can read the Checks tab but can't download the attached report (e.g. Claude rebuilding report.html).
  const data = zlib.gzipSync(JSON.stringify({ ...r, visited: undefined, headers: undefined })).toString("base64");
  const hidden = data.length < 30000 ? `\n<!-- qa-results:${data} -->\n` : "";
  let text = parts.join("\n");
  const room = 64000 - hidden.length;
  if (text.length > room) text = text.slice(0, room - 100).replace(/\n[^\n]*$/, "") + "\n\n*…the rest is in the full report (qa-report on this run).*";
  fs.writeFileSync(path.join(outDir, "details.md"), text + hidden);
}

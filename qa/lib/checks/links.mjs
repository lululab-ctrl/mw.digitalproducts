// Checks every link found on the pages. Links inside the site must work; outside links
// are checked too (unless offline) but count as lower severity, since other sites come and go.
export async function checkLinks(linkMap, { base, offline, liveUrl }) {
  const found = [];
  const results = new Map();
  const queue = [...linkMap.keys()];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const href = queue.shift();
      const u = new URL(href);
      u.hash = "";
      const key = u.href;
      if (results.has(key)) continue;
      const own = u.origin === new URL(base).origin;
      // Links that point at the live address are tested against the local copy instead.
      const isLive = liveUrl && u.origin === new URL(liveUrl).origin;
      if (!own && !isLive && offline) { results.set(key, "skipped"); continue; }
      const target = isLive ? new URL(u.pathname + u.search, base).href : key;
      results.set(key, await probe(target));
    }
  });
  await Promise.all(workers);

  for (const [href, pages] of linkMap) {
    const u = new URL(href); u.hash = "";
    const r = results.get(u.href);
    if (r === "skipped" || r === "ok") continue;
    const own = u.origin === new URL(base).origin || (liveUrl && u.origin === new URL(liveUrl).origin);
    const shown = own ? u.pathname + u.search : u.href;
    found.push({ rule: "broken-link", detail: `${shown} → ${r}`, page: [...pages][0], alsoOn: [...pages].slice(1, 6), severity: own ? "High" : "Low" });
  }
  return { found, checked: results.size };
}

async function probe(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (site-qa link check)" } });
      if (res.ok) return "ok";
      // Many sites refuse HEAD or bots (403/405/429); try GET before calling it broken, and don't flag bot walls.
      if (method === "HEAD") continue;
      if ([401, 403, 429, 999].includes(res.status)) return "ok";
      return `answered ${res.status}`;
    } catch (e) {
      if (method === "HEAD") continue;
      return `couldn't connect (${e.cause?.code ?? e.name})`;
    }
  }
  return "unknown";
}

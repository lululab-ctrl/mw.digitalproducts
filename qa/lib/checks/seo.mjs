// Search-engine and link-sharing checks, from what the browser saw on each page.
export function seoChecks(pagesDom, { robotsTxt, config }) {
  const found = [];
  const priv = config.searchEngines?.private ?? [];
  const isPrivate = (p) => priv.some((x) => p.startsWith(x));
  const titles = new Map();

  if (robotsTxt && /^\s*Disallow:\s*\/\s*$/im.test(robotsTxt.replace(/#.*$/gm, "")) && /User-agent:\s*\*/i.test(robotsTxt)) {
    const launched = config.searchEngines?.launched !== false;
    found.push({ rule: "robots-blocks-all", page: "/robots.txt", ...(launched ? {} : { severity: "Low" }),
      detail: `robots.txt has "Disallow: /" for every search engine${launched ? "" : ". Fine before launch (the settings say the site isn't launched yet); change it on launch day."}` });
  }

  for (const { page, lang, dom } of pagesDom) {
    if (!dom) continue;
    const where = { page, lang };
    const noindex = /noindex/i.test(dom.robots ?? "");
    if (isPrivate(page)) {
      if (!noindex) found.push({ rule: "private-page-indexable", detail: "No noindex tag", ...where });
      continue; // the rest only matters for public pages
    }
    if (noindex) continue;
    if (!dom.title) found.push({ rule: "title-missing", detail: "Empty <title>", ...where });
    else {
      if (dom.title.length < 15 || dom.title.length > 65) found.push({ rule: "title-length", detail: `${dom.title.length} characters: "${dom.title}"`, ...where });
      const k = `${lang}|${dom.title}`;
      titles.set(k, [...(titles.get(k) ?? []), page]);
    }
    if (!dom.description) found.push({ rule: "description-missing", detail: "No meta description", ...where });
    if (dom.h1 === 0) found.push({ rule: "h1-missing", detail: "No <h1>", ...where });
    if (dom.h1 > 1) found.push({ rule: "h1-multiple", detail: `${dom.h1} <h1> headings`, ...where });
    if (!dom.lang) found.push({ rule: "lang-missing", detail: "<html> has no lang", ...where });
    if (!dom.canonical) found.push({ rule: "canonical-missing", detail: "No canonical link", ...where });
    if (dom.og.length) found.push({ rule: "social-preview-missing", detail: `Missing ${dom.og.join(", ")}`, ...where });
  }
  for (const [k, pages] of titles) {
    // The same page with different ?options (filters, topics) may share a title; only distinct pages count.
    if (new Set(pages.map((p) => p.split("?")[0])).size > 1) found.push({ rule: "title-duplicate", detail: `"${k.split("|")[1]}" on ${pages.join(", ")}`, page: pages[0], lang: k.split("|")[0] });
  }
  return found;
}

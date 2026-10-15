# Site QA

Automatic testing for this website, run before anything goes live. It checks what a professional QA team would check, and explains every problem in plain English with how to fix it.

## What it checks

| Area | How |
|---|---|
| Bugs and errors | Opens every page and records script crashes, browser errors, failed requests, broken images and broken links. Finds extra pages by following links. |
| Phones, tablets, browsers | Every page on 7 screen sizes (small iPhone to big desktop) in Chrome, Firefox and Safari's engine, in every site language. Flags pages wider than the screen, missing phone setup, wrong reading direction. Screenshots included. |
| Things visitors do | Walks through the journeys listed under `flows` in `qa.config.json` (switch language, open the cart, add to cart, sign-in form, 404 page…), on a phone and a desktop, in every browser. |
| Accessibility | axe-core, the standard accessibility engine, on every page (WCAG 2.1 AA). |
| Search engines and sharing | Titles, descriptions, headings, language, canonical links, share previews, robots.txt, private pages that shouldn't be in Google. |
| Security | Secret keys in published files, insecure content, outside scripts that aren't version-locked, security headers on the live site, known holes in npm libraries. Nothing is attacked and no form is submitted. |
| Speed | Google Lighthouse on a simulated mid-range phone: score, LCP, CLS, TBT and the biggest savings. |

## When it runs

- **Every pull request**: the result shows on the pull request; the full report is attached to the run as **qa-report**.
- **Before every deploy**: `deploy.yml` runs it first. A **new** Critical or High issue stops the deploy. In an emergency, run Deploy by hand and tick *"publish without running the site tests first"*.
- **By hand**: Actions → Site QA → Run workflow.

## Reading the report

Download **qa-report** from the run, unzip it and open `report.html`. Each issue shows its level, where it happens (pages, screens, browsers, language), what was seen, why it matters and how to fix it.

| Level | Meaning |
|---|---|
| Critical | Fix today. Real harm is possible right now. |
| High | Fix before the next release. Visitors or data are affected. |
| Medium | Fix soon. It hurts some visitors, sales or search ranking. |
| Low | Polish. |

## Known issues (baseline)

Serious issues that existed before the tests started are listed in `qa/baseline.json`. They're still reported, but only **new** serious issues stop a deploy. When you fix one, it simply stops appearing. To accept today's list as known (a reviewer's decision), run `node qa/run.mjs --update-baseline` and commit the file.

## Running it on your own computer

```bash
npm ci --prefix qa
cd qa && npx playwright install --with-deps && cd ..
node qa/run.mjs            # full test
node qa/run.mjs --quick    # Chrome only, 3 screen sizes, no speed test (about 2 minutes)
node qa/run.mjs --url https://preview-address.example   # test a site that's already online
```

## Using it for another website

Copy the `qa/` folder and `.github/workflows/qa.yml` into the other site's repository, then edit only `qa/qa.config.json`:

- `build` and `serveDir`: how to produce the site's files and where they end up (e.g. `npm run build` and `dist`). For a site that runs its own server, leave both out and use `--url`.
- `liveUrl`: the live address (security headers are checked there).
- `pages`: the main pages; more are found through links.
- `languages`: one entry per language, with how the site chooses it.
- `flows`: the key things visitors do, as steps (`goto`, `click`, `fill`, `expectVisible`, `expectHidden`, `expectText`, `expectAttr`, `expectUrlContains`). Flows run against the real back end, so they must never place an order, send a message or create an account.
- `searchEngines.private`: pages that should stay out of Google.

## Security reviews of the code

Code-level issues (found by a person or by Claude reading the server code) can be added to the report with `--review <file>`. **Never commit that file to a public repository**: it describes weaknesses before they're fixed.

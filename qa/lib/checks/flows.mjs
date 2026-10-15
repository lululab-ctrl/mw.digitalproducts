// Runs the visitor journeys described in qa.config.json ("flows"), step by step.
// Steps: goto, click, fill, press, waitForLoad, expectVisible, expectHidden, expectText,
// expectAttr, expectUrlContains. Flows must never submit real orders or messages:
// they run against the real back end.
import fs from "node:fs";
import path from "node:path";
import { newContext } from "./pages.mjs";

export async function runFlows(browser, browserName, { config, base, offline, localUrl, shotDir }) {
  const found = [];
  const passed = [];
  const devices = [config.devices.find((d) => d.mobile) ?? config.devices[0], config.devices.find((d) => !d.mobile) ?? config.devices.at(-1)];
  for (const flow of config.flows ?? []) {
    if (flow.needsNetwork && offline) continue;
    for (const device of devices) {
      const lang = config.languages?.[0] ?? { code: "en", label: "English" };
      const ctx = await newContext(browser, { device, lang, base, offline, localUrl });
      const page = await ctx.newPage();
      let stepNo = 0;
      try {
        for (const step of flow.steps) {
          stepNo++;
          await runStep(page, step, base);
        }
        passed.push({ flow: flow.name, device: device.name, browser: browserName });
      } catch (e) {
        let shot;
        if (shotDir) {
          fs.mkdirSync(shotDir, { recursive: true });
          shot = `flow_${flow.name.replace(/[^a-z0-9]+/gi, "_").slice(0, 50)}__${device.name.replace(/\s+/g, "-")}__${browserName}.jpg`;
          await page.screenshot({ path: path.join(shotDir, shot), type: "jpeg", quality: 55 }).catch(() => { shot = undefined; });
        }
        // What the visitor saw at that moment, to tell a real failure from a slow or empty page.
        const saw = await page.evaluate(() => (document.querySelector("main") ?? document.body)?.innerText ?? "")
          .then((t) => t.replace(/\s+/g, " ").trim().slice(0, 220)).catch(() => "");
        found.push({
          rule: "flow-failed", page: flow.name, device: device.name, browser: browserName, shot,
          detail: `Step ${stepNo} (${describe(flow.steps[stepNo - 1])}) failed: ${String(e.message).split("\n")[0].slice(0, 200)}${saw ? ` · The page showed: "${saw}"` : ""}`,
          severity: flow.severity,
        });
      }
      await ctx.close();
    }
  }
  return { found, passed };
}

const describe = (s) => Object.entries(s).filter(([k]) => k !== "timeout").map(([k, v]) => `${k} ${typeof v === "object" ? JSON.stringify(v) : v}`).join(", ");

async function runStep(page, s, base) {
  const t = s.timeout ?? 8000;
  if (s.goto) {
    const res = await page.goto(new URL(s.goto, base).href, { waitUntil: "load", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    if (s.expectStatus && res?.status() !== s.expectStatus) throw new Error(`Expected status ${s.expectStatus}, got ${res?.status()}`);
  }
  if (s.click) await page.locator(s.click).locator("visible=true").first().click({ timeout: t });
  if (s.fill) await page.locator(s.fill.selector).first().fill(s.fill.value, { timeout: t });
  if (s.press) await page.keyboard.press(s.press);
  if (s.waitForLoad) { await page.waitForLoadState("load"); await page.waitForTimeout(500); }
  if (s.expectVisible) await page.locator(s.expectVisible).locator("visible=true").first().waitFor({ state: "visible", timeout: t });
  if (s.expectHidden) await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((e) => {
    const r = e.getBoundingClientRect(); const st = getComputedStyle(e);
    return e.inert || st.visibility === "hidden" || st.display === "none" || r.width === 0 || r.right <= 0 || r.left >= innerWidth;
  }), s.expectHidden, { timeout: t });
  if (s.expectText) await page.getByText(s.expectText).first().waitFor({ timeout: t });
  if (s.expectAttr) {
    const { selector, attr, value } = s.expectAttr;
    await page.waitForFunction(([sel, a, v]) => document.querySelector(sel)?.getAttribute(a) === v, [selector, attr, value], { timeout: t })
      .catch(async () => { throw new Error(`${selector} has ${attr}="${await page.locator(selector).first().getAttribute(attr)}", expected "${value}"`); });
  }
  if (s.expectUrlContains) await page.waitForURL((u) => u.href.includes(s.expectUrlContains), { timeout: t })
    .catch(() => { throw new Error(`Ended up on ${page.url()}`); });
}

import { chromium } from "playwright";
import fs from "node:fs";
const out = "audit/vid"; fs.mkdirSync(out, { recursive: true });
let browser;
try { browser = await chromium.launch({ channel: "chrome" }); } catch { browser = await chromium.launch(); }
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(16000);
await page.screenshot({ path: `${out}/p-final.jpg`, type: "jpeg", quality: 70 });
for (const [id, idx] of [["aguachile", 1], ["tio", 2]]) {
  await page.click(`#hero-tab-${id}`);
  const t0 = Date.now();
  for (const t of [1200, 3500, 6000, 8500, 11000, 12500]) {
    const w = t - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w);
    const info = await page.evaluate((i) => { const v = document.querySelectorAll(".hp-vid")[i]; return { t: +v.currentTime.toFixed(2), o: getComputedStyle(v).opacity, muted: v.muted, bg: getComputedStyle(document.querySelector("#inicio")).backgroundColor }; }, idx);
    console.log(id, t, JSON.stringify(info));
    await page.screenshot({ path: `${out}/${id}-${t}.jpg`, type: "jpeg", quality: 70 });
  }
}
console.log("errors", errs);
await browser.close();

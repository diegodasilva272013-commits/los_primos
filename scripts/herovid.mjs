import { chromium } from "playwright";
import fs from "node:fs";
const out = "audit/vid"; fs.mkdirSync(out, { recursive: true });
let browser;
try { browser = await chromium.launch({ channel: "chrome" }); } catch { browser = await chromium.launch(); }
for (const vp of [{ n: "desktop", w: 1440, h: 900 }, { n: "mobile", w: 390, h: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(String(e))); page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
  const t0 = Date.now();
  for (const t of [2500, 5000, 7300, 8100, 9500, 12500, 14500]) {
    const wait = t - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
    const info = await page.evaluate(() => { const v = [...document.querySelectorAll(".hp-vid")].map((x) => ({ t: +x.currentTime.toFixed(2), p: x.paused, o: getComputedStyle(x).opacity, err: x.error && x.error.code })); return { v, bg: getComputedStyle(document.querySelector("#inicio")).backgroundColor }; });
    console.log(vp.n, t, JSON.stringify(info));
    await page.screenshot({ path: `${out}/${vp.n}-${t}.jpg`, type: "jpeg", quality: 70 });
  }
  console.log(vp.n, "errors", errs);
  await ctx.close();
}
await browser.close();

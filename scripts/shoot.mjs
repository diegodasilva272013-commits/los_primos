// Auditor tool: screenshots + automatic checks at mobile 390 and desktop 1440.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] || "http://localhost:4173";
const out = process.argv[3] || "audit";
fs.mkdirSync(out, { recursive: true });

const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
];
const sections = ["inicio", "sabores", "historia", "menu", "combos", "sucursales", "pedir"];

const browser = await chromium.launch();
const report = {};
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base, { waitUntil: "networkidle" });
  // Motion frames: preloader + hero intro sequence (auditors judge the animation, not just stills)
  for (const t of [300, 900, 1600, 2300, 3000]) {
    await page.waitForTimeout(t === 300 ? 300 : 700);
    await page.screenshot({ path: `${out}/${vp.name}-motion-${String(t).padStart(4, "0")}ms.jpg`, type: "jpeg", quality: 72 });
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${vp.name}-00-hero.jpg`, type: "jpeg", quality: 72 });
  if (vp.name === "desktop") {
    // pointer tilt + flavor switch check
    await page.mouse.move(1100, 350);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${vp.name}-00b-hero-tilt.jpg`, type: "jpeg", quality: 72 });
    const pills = await page.$$("#inicio [role=tab], #inicio button[aria-pressed]");
    if (pills[1]) { await pills[1].click(); await page.waitForTimeout(1300); await page.screenshot({ path: `${out}/${vp.name}-00c-hero-switch.jpg`, type: "jpeg", quality: 72 }); }
  }

  // Progressive scroll through whole page to trigger ScrollTriggers, capturing every viewport.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let i = 1;
  for (let y = vp.height; y < total; y += Math.round(vp.height * 0.9)) {
    await page.mouse.wheel(0, Math.round(vp.height * 0.9));
    await page.waitForTimeout(1100); // Lenis easing + reveals settle
    await page.screenshot({ path: `${out}/${vp.name}-${String(i).padStart(2, "0")}-scroll.jpg`, type: "jpeg", quality: 72 });
    i++;
    if (i > 40) break;
  }

  const checks = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflow = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > vw + 1 || r.left < -1)) {
        // ignore elements inside an intentionally clipped ancestor
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const cs = getComputedStyle(p);
          if (/(hidden|clip|auto|scroll)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) { clipped = true; break; }
          p = p.parentElement;
        }
        if (!clipped) overflow.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
      }
    });
    const small = [];
    document.querySelectorAll("a, button, [role=tab]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.height < 44 || r.width < 44) && getComputedStyle(el).visibility !== "hidden")
        small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    const text = document.body.innerText;
    const dashes = (text.match(/[—–]/g) || []).length;
    const imgsNoAlt = [...document.images].filter((im) => !im.hasAttribute("alt")).length;
    const broken = [...document.images].filter((im) => im.complete && im.naturalWidth === 0).map((im) => im.src);
    const h = [...document.querySelectorAll("h1,h2,h3")].map((x) => x.tagName + ":" + x.textContent.trim().slice(0, 30));
    return { docScrollWidth: document.documentElement.scrollWidth, vw, overflow: overflow.slice(0, 15), smallTargets: small.slice(0, 25), dashes, imgsNoAlt, broken, headings: h };
  });
  report[vp.name] = { ...checks, errors };

  for (const id of sections) {
    const el = await page.$(`#${id}`);
    if (!el) { report[vp.name][`missing_${id}`] = true; continue; }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

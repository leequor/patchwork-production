import { chromium } from "playwright";

const base = "https://patchwork-production.vercel.app";
const email = process.env.AUDIT_EMAIL;
const password = process.env.AUDIT_PASSWORD;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto(`${base}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('form button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 40000 });
await page.waitForTimeout(1500);

await page.goto(`${base}/tickets`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const overflow = await page.evaluate(() => {
  const docWidth = document.documentElement.clientWidth;
  const offenders = [...document.querySelectorAll("*")]
    .filter((el) => el.getBoundingClientRect().right > docWidth + 1)
    .slice(0, 12)
    .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 60)} right=${Math.round(el.getBoundingClientRect().right)}`);
  return { docWidth, scrollWidth: document.documentElement.scrollWidth, offenders };
});
console.log(JSON.stringify(overflow, null, 2));

await page.keyboard.press("Control+k");
await page.waitForTimeout(800);
const palette = await page.evaluate(() => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  combobox: document.querySelectorAll('[role="combobox"]').length,
  bodyStart: document.body.innerText.slice(0, 120).replace(/\s+/g, " "),
}));
console.log(JSON.stringify(palette, null, 2));
await browser.close();

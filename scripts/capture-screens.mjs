import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

/**
 * Capture design screenshots of any route at desktop and phone widths.
 *
 *   BASE_URL=http://localhost:3000 node scripts/capture-screens.mjs \
 *     "track=/track" "login=/login"
 *
 * Files land in shots/ (git-ignored). The 3D bench needs a moment to draw, so
 * each shot waits after load rather than for network idle.
 *
 * Notes:
 *  - On Git Bash, pass MSYS_NO_PATHCONV=1 or the leading "/" is rewritten.
 *  - Local Supabase is not required; the public routes render without it.
 */

const routes = process.argv.slice(2);
const outDir = path.resolve("shots");
fs.mkdirSync(outDir, { recursive: true });
const base = process.env.BASE_URL ?? "http://localhost:3000";

const sizes = [
  ["desk", 1440, 900],
  ["mobile", 390, 844],
];

if (routes.length === 0) {
  console.error('Nothing to capture. Example: "track=/track"');
  process.exit(1);
}

const browser = await chromium.launch();
for (const route of routes) {
  const [label, urlPath] = route.split("=");
  for (const [size, w, h] of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(base + urlPath, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(3500);
      await page.screenshot({
        path: path.join(outDir, `${label}-${size}.png`),
        fullPage: true,
      });
      console.log("ok", label, size);
    } catch (error) {
      console.log("FAIL", label, size, error.message.split("\n")[0]);
    }
    await ctx.close();
  }
}
await browser.close();

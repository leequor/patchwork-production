import { chromium } from "playwright";

/**
 * The things a screenshot cannot show: duplicate DOM ids, heading order, tap
 * targets, images without alt text, keyboard focus, and what the production
 * deployment actually serves for headers, robots and metadata.
 */
const local = process.argv[2] ?? "http://127.0.0.1:3102";
const prod = "https://patchwork-production.vercel.app";

const findings = [];
const record = (what, detail) => findings.push({ what, detail });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

/* 1. DOM hygiene on every public page. */
const routes = ["/", "/track", "/status", "/login", "/register", "/forgot-password", "/reset-password"];
for (const route of routes) {
  await page.goto(local + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const dom = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
      Number(h.tagName.slice(1)),
    );
    let skipped = null;
    for (let i = 1; i < headings.length; i += 1) {
      if (headings[i] - headings[i - 1] > 1) skipped = `${headings[i - 1]} -> ${headings[i]}`;
    }

    const imagesWithoutAlt = [...document.images]
      .filter((img) => !img.hasAttribute("alt") && !img.closest("[aria-hidden='true']"))
      .map((img) => img.currentSrc);

    const smallTargets = [...document.querySelectorAll("a, button")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
      })
      .map((el) => `${el.tagName} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24)}"`);

    const inputsBelowFont = [...document.querySelectorAll("input, select, textarea")]
      .filter((el) => Number.parseFloat(getComputedStyle(el).fontSize) < 16 && el.type !== "checkbox")
      .map((el) => `${el.id || el.name}: ${getComputedStyle(el).fontSize}`);

    const h1Count = document.querySelectorAll("h1").length;

    return { duplicates, skipped, imagesWithoutAlt, smallTargets, inputsBelowFont, h1Count };
  });

  const tag = route;
  for (const id of new Set(dom.duplicates)) record("duplicate id", `${tag}: ${id}`);
  if (dom.skipped) record("heading order", `${tag}: ${dom.skipped}`);
  if (dom.h1Count !== 1) record("h1 count", `${tag}: ${dom.h1Count}`);
  for (const img of dom.imagesWithoutAlt) record("image without alt", `${tag}: ${img}`);
  for (const target of dom.smallTargets) record("small tap target", `${tag}: ${target}`);
  for (const input of dom.inputsBelowFont) record("input font under 16px (iOS zoom)", `${tag}: ${input}`);
}

/* 2. Keyboard reach: the first five tab stops must all show a visible ring. */
await page.goto(`${local}/login`, { waitUntil: "networkidle" });
const focusStops = [];
for (let i = 0; i < 6; i += 1) {
  await page.keyboard.press("Tab");
  focusStops.push(
    await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "none";
      const style = getComputedStyle(el);
      const outline = `${style.outlineStyle} ${style.outlineWidth}`;
      const shadow = style.boxShadow !== "none";
      return `${el.tagName}#${el.id || ""}${el.tagName === "A" ? ":" + (el.textContent || "").trim().slice(0, 16) : ""} outline=${outline} shadow=${shadow}`;
    }),
  );
}
for (const stop of focusStops) {
  if (/outline=none 0px|outline=none 0px shadow=false/.test(stop)) {
    record("no visible focus", stop);
  }
}

/* 3. Production: headers, robots, sitemap, health, and the preview must be gone. */
const prodCtx = await browser.newContext();
const prodPage = await prodCtx.newPage();

for (const route of ["/", "/api/health", "/robots.txt", "/sitemap.xml", "/icon.svg"]) {
  const response = await prodPage.goto(prod + route, { waitUntil: "domcontentloaded" }).catch(() => null);
  const status = response?.status() ?? 0;
  if (status >= 400) record("production asset", `${route}: ${status}`);
}

const responseHeaders = await prodPage.goto(prod + "/login", { waitUntil: "domcontentloaded" });
const headers = responseHeaders?.headers() ?? {};
for (const header of [
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "content-security-policy",
  "strict-transport-security",
]) {
  if (!headers[header]) record("missing security header", header);
}

const preview = await prodPage.goto(prod + "/design-preview/workspace", { waitUntil: "domcontentloaded" });
if ((preview?.status() ?? 0) < 400) record("design preview is public", "status " + preview?.status());

await browser.close();

if (findings.length === 0) console.log("Clean.");
else {
  console.log(`${findings.length} findings:\n`);
  const grouped = new Map();
  for (const f of findings) {
    if (!grouped.has(f.what)) grouped.set(f.what, new Set());
    grouped.get(f.what).add(f.detail);
  }
  for (const [what, details] of grouped) {
    console.log(`- ${what}`);
    for (const detail of details) console.log(`    ${detail}`);
  }
}

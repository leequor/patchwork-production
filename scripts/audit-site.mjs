import { chromium } from "playwright";

/**
 * The whole site, checked rather than assumed.
 *
 * For every route: HTTP status, console errors and warnings, uncaught exceptions,
 * failed network requests, images that did not load, and horizontal overflow at
 * three widths. Then it crawls every internal link it can see and reports the
 * ones that do not resolve.
 *
 *   node scripts/audit-site.mjs [baseUrl]
 */
const base = process.argv[2] ?? "http://127.0.0.1:3102";

const ROUTES = [
  "/",
  "/track",
  "/status",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/design-preview/workspace",
  "/design-preview/stage",
  ...["intake", "diagnosing", "waiting_parts", "in_repair", "ready", "picked_up", "cancelled"].map(
    (s) => `/design-preview/stage/${s}`,
  ),
  "/nope-does-not-exist",
  "/api/health",
  "/api/health/supabase",
];

const WIDTHS = [
  ["phone", 390, 844],
  ["tablet", 820, 1180],
  ["desk", 1440, 900],
];

const browser = await chromium.launch();
const problems = [];
const links = new Set();

const note = (kind, route, detail) => problems.push({ kind, route, detail });

for (const [label, width, height] of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  for (const route of ROUTES) {
    if (route.startsWith("/api/")) continue;
    const page = await ctx.newPage();

    const consoleIssues = [];
    const pageErrors = [];
    const failed = [];

    /* Prefetch aborts and the deliberately-degraded health check are not bugs;
       everything else is. */
    const expected = (text) =>
      /_rsc=/.test(text) ||
      /status of 503/.test(text) ||
      /status of 404/.test(text) && route === "/nope-does-not-exist";

    page.on("console", (msg) => {
      if (msg.type() !== "error" && msg.type() !== "warning") return;
      const text = msg.text();
      if (expected(text)) return;
      consoleIssues.push(`${msg.type()}: ${text}`);
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      const url = request.url();
      const reason = request.failure()?.errorText ?? "?";
      if (/_rsc=/.test(url) && reason === "net::ERR_ABORTED") return;
      failed.push(`${url} (${reason})`);
    });

    let response;
    try {
      response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
    } catch (error) {
      note("navigation", `${label} ${route}`, error.message);
      await page.close();
      continue;
    }

    await page.waitForTimeout(1800);

    const status = response?.status() ?? 0;
    if (label === "desk") {
      const expected = route === "/nope-does-not-exist" ? 404 : 200;
      if (status !== expected) note("status", route, `expected ${expected}, got ${status}`);
    }

    const info = await page.evaluate(() => {
      const brokenImages = [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src);

      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;

      const unlabelledFields = [...document.querySelectorAll("input, select, textarea")]
        .filter((el) => {
          const id = el.getAttribute("id");
          const aria = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
          const wrapped = el.closest("label");
          const labelled = id ? document.querySelector(`label[for="${id}"]`) : null;
          const type = (el.getAttribute("type") || "").toLowerCase();
          return !aria && !wrapped && !labelled && !["hidden", "submit", "button"].includes(type);
        })
        .map((el) => el.outerHTML.slice(0, 120));

      const emptyButtons = [...document.querySelectorAll("button")]
        .filter((b) => !b.textContent?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title"))
        .map((b) => b.outerHTML.slice(0, 120));

      const hrefs = [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter((href) => href && href.startsWith("/") && !href.startsWith("//"));

      return {
        brokenImages,
        overflow: scrollWidth - clientWidth,
        unlabelledFields,
        emptyButtons,
        hrefs,
        title: document.title,
      };
    });

    info.hrefs
      .map((href) => href.split("#")[0])
      .filter((href) => !href.startsWith("/api/"))
      .forEach((href) => links.add(href));

    const tag = `${label} ${route}`;
    if (info.brokenImages.length) note("broken images", tag, info.brokenImages.join(", "));
    if (info.overflow > 1) note("horizontal overflow", tag, `${info.overflow}px`);
    if (!info.title) note("missing title", tag, "");
    for (const err of consoleIssues) note("console", tag, err);
    for (const err of pageErrors) note("page error", tag, err);
    for (const f of failed) note("failed request", tag, f);
    if (label === "desk") {
      for (const field of info.unlabelledFields) note("unlabelled field", route, field);
      for (const button of info.emptyButtons) note("button without name", route, button);
    }

    await page.close();
  }
  await ctx.close();
}

/* Every internal link, resolved. */
const linkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const linkPage = await linkCtx.newPage();
for (const href of links) {
  if (!href) continue;
  const response = await linkPage.goto(base + href, { waitUntil: "domcontentloaded" }).catch(() => null);
  const status = response?.status() ?? 0;
  if (status >= 400) note("dead link", href, `status ${status}`);
}
await linkCtx.close();

/* Health endpoints, as the runbook promises them. */
const apiCtx = await browser.newContext();
const apiPage = await apiCtx.newPage();
for (const route of ["/api/health", "/api/health/supabase"]) {
  const response = await apiPage.goto(base + route, { waitUntil: "domcontentloaded" });
  const status = response?.status() ?? 0;
  const body = await apiPage.evaluate(() => document.body.innerText.slice(0, 200));
  if (status !== 200) note("health", route, `status ${status}`);
  console.log("health", route, status, body.replace(/\s+/g, " ").slice(0, 120));
}
await apiCtx.close();
await browser.close();

const grouped = new Map();
for (const problem of problems) {
  const key = `${problem.kind} :: ${problem.route}`;
  if (!grouped.has(key)) grouped.set(key, new Set());
  grouped.get(key).add(problem.detail);
}

if (grouped.size === 0) {
  console.log(`\nClean. ${ROUTES.length} routes x ${WIDTHS.length} widths, ${links.size} links.`);
} else {
  console.log(`\n${problems.length} findings across ${grouped.size} places:\n`);
  for (const [key, details] of grouped) {
    console.log(`- ${key}`);
    for (const detail of details) console.log(`    ${detail}`);
  }
}

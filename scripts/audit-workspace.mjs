import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";

/**
 * The staff console, exercised against the live deployment.
 *
 * Read-only by design: it signs in, opens every workspace page, uses the filters,
 * the palette and the price editor's controls, and *never* submits a mutation.
 * Writing to production data to test a form would be testing on the customer.
 */
const prod = process.argv[2] ?? "https://patchwork-production.vercel.app";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^"|"$/g, "")];
    }),
);

mkdirSync("shots/ws", { recursive: true });

const findings = [];
const record = (what, detail) => findings.push({ what, detail });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on("pageerror", (error) => record("uncaught exception", error.message));
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  if (/_rsc=|status of 404/.test(text)) return;
  record("console error", text.slice(0, 200));
});

/* Credentials come from the environment when provided, so a live console can be
   audited without putting an account in the repo. */
const email = process.env.AUDIT_EMAIL ?? "alex@luckypatcher.test";
const password = process.env.AUDIT_PASSWORD ?? env.DEMO_PASSWORD;

await page.goto(`${prod}/login`, { waitUntil: "domcontentloaded" });
await page.fill("#email", email);
await page.fill("#password", password);
await page.click('form button[type="submit"]');
await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 40000 });
record("sign in", `landed on ${new URL(page.url()).pathname}`);

const routes = ["/", "/tickets", "/customers", "/inventory", "/invoices", "/team", "/tickets/new"];

for (const route of routes) {
  const response = await page.goto(prod + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2200);
  const status = response?.status() ?? 0;
  if (status >= 400) record("workspace status", `${route}: ${status}`);

  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    headings: [...document.querySelectorAll("h1,h2")].map((h) => h.textContent?.trim().slice(0, 40)),
    contentLength: document.body.innerText.trim().length,
  }));
  if (info.overflow > 1) record("horizontal overflow", `${route}: ${info.overflow}px`);
  if (info.contentLength < 200) record("empty page", `${route}: only ${info.contentLength} chars of text`);

  await page.screenshot({ path: `shots/ws/${route.replace(/\//g, "-").replace(/^-/, "") || "root"}.png` });
}

/* Team rows: do the role and workload columns line up across rows? */
await page.goto(`${prod}/team`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1800);
const alignment = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("ul > li")].filter((li) => li.querySelector("span"));
  const roleX = [];
  const loadX = [];
  for (const row of rows) {
    const cells = [...row.querySelectorAll(":scope > span")];
    if (cells[1]) roleX.push(Math.round(cells[1].getBoundingClientRect().left));
    if (cells[2]) loadX.push(Math.round(cells[2].getBoundingClientRect().left));
  }
  return { roleX, loadX };
});
const spread = (list) => (list.length ? Math.max(...list) - Math.min(...list) : 0);
if (spread(alignment.roleX) > 1) record("team role column", `left edges spread ${spread(alignment.roleX)}px`);
if (spread(alignment.loadX) > 1) record("team workload column", `left edges spread ${spread(alignment.loadX)}px`);

/* Command palette, keyboard only. */
await page.goto(`${prod}/tickets`, { waitUntil: "domcontentloaded" });
await page.keyboard.press("Control+k");
/* Rendered inside AnimatePresence: give it a beat, then assert on what a person
   would use — a dialog with focusable results. */
const paletteOpen = await page
  .locator('[role="dialog"]')
  .first()
  .waitFor({ state: "visible", timeout: 5000 })
  .then(() => true)
  .catch(() => false);
if (!paletteOpen) record("command palette", "did not open on Control+K");

await page.keyboard.type("pw");
await page.waitForTimeout(900);
const results = await page
  .locator('[role="dialog"] [role="option"], [role="dialog"] a[href]')
  .count();
if (paletteOpen && results === 0) record("command palette", "no results for 'pw'");
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

/* Inventory: open a price editor and its history, then cancel. */
await page.goto(`${prod}/inventory`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
const priceButton = page
  .locator("button")
  .filter({ hasText: /price|edit/i })
  .first();
if (await priceButton.count()) {
  await priceButton.click();
  await page.waitForTimeout(900);
  const field = await page.locator('input[name*="price"]').count();
  if (!field) record("price editor", "opened but no price input");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
} else {
  record("price editor", "no price control found on /inventory");
}

/* Ticket detail: open the first ticket in the queue. */
await page.goto(`${prod}/tickets`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1800);
const firstTicket = page.locator('a[href^="/tickets/"]:not([href="/tickets/new"])').first();
if (await firstTicket.count()) {
  await firstTicket.click();
  await page.waitForTimeout(2500);
  const detail = await page.evaluate(() => document.body.innerText.slice(0, 200));
  if (/something went wrong|application error/i.test(detail)) {
    record("ticket detail", detail);
  }
  await page.screenshot({ path: "shots/ws/ticket-detail.png" });
} else {
  record("tickets", "no ticket links on the queue page");
}

/* Phone width, same shell. */
const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
const phonePage = await phone.newPage();
await phonePage.goto(`${prod}/login`, { waitUntil: "domcontentloaded" });
await phonePage.fill("#email", email);
await phonePage.fill("#password", password);
await phonePage.click('form button[type="submit"]');
await phonePage.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 40000 });
const phoneRoutes = ["/", "/tickets", "/customers", "/inventory", "/invoices", "/team", "/tickets/new"];
for (const route of phoneRoutes) {
  await phonePage.goto(prod + route, { waitUntil: "domcontentloaded" });
  await phonePage.waitForTimeout(2000);
  const overflow = await phonePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 1) record("phone overflow", `${route}: ${overflow}px`);
}
await phone.close();

await browser.close();

if (findings.length === 0) console.log("Clean — the console behaved on every page.");
else {
  console.log(`${findings.length} findings:\n`);
  for (const f of findings) console.log(`- ${f.what}: ${f.detail}`);
}

import { chromium } from "playwright";

/**
 * The flows, clicked.
 *
 * A page that loads is not a page that works. This drives the public forms the
 * way a person would — empty submit, junk input, wrong password, mismatched
 * confirmation, keyboard navigation in the palette, the phone nav drawer — and
 * reports what the user would actually see.
 */
const base = process.argv[2] ?? "http://127.0.0.1:3102";

const findings = [];
const record = (what, detail) => findings.push({ what, detail });

const browser = await chromium.launch();

const open = async (width = 1440, height = 900) => {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on("pageerror", (error) => record("uncaught exception", error.message));
  return { ctx, page };
};

const text = async (page) => (await page.locator("body").innerText()).replace(/\s+/g, " ");

/* 1. Tracker: empty, junk, well-formed-but-unknown. Each attempt starts from a
   fresh load, because a submit is a navigation. */
{
  const { ctx, page } = await open();
  const attempt = async (value) => {
    await page.goto(`${base}/track`, { waitUntil: "networkidle" });
    if (value !== undefined) await page.fill("#code", value);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForTimeout(2200);
    return text(page);
  };

  const empty = await attempt();
  if (!/enter|required|code|characters|ten/i.test(empty)) {
    record("track empty submit", `no message: ${empty.slice(0, 160)}`);
  }

  const junk = await attempt("!!!!");
  if (!/ten|characters|not found|invalid|check|letters/i.test(junk)) {
    record("track junk submit", `no feedback: ${junk.slice(0, 160)}`);
  }

  const unknown = await attempt("ABCDEFGHIJ");
  const honest = /not found|no repair|no match|no ticket matched/i.test(unknown);
  const degraded = /records are unreachable|database is not answering/i.test(unknown);
  if (!honest && !degraded) record("track unknown code", unknown.slice(0, 200));
  if (!honest) record("track degrades honestly", degraded ? "reports records unreachable" : "unclear copy");
  await ctx.close();
}

/* 2. Sign in: empty, wrong credentials, and the reveal toggle actually revealing. */
{
  const { ctx, page } = await open();
  const go = () => page.goto(`${base}/login`, { waitUntil: "networkidle" });

  await go();
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(1600);
  const empty = await text(page);
  if (!/email|password|required/i.test(empty)) {
    record("login empty submit", `no message: ${empty.slice(0, 160)}`);
  }

  await go();
  await page.fill("#email", "nobody@example.test");
  await page.fill("#password", "definitely-wrong");
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(3000);
  const wrong = await text(page);
  if (!/invalid|wrong|incorrect|unable|failed|error/i.test(wrong)) {
    record("login wrong credentials", wrong.slice(0, 240));
  }

  await go();
  await page.fill("#password", "visible-value");
  await page.click('button[aria-label="Show password"]');
  const type = await page.getAttribute("#password", "type");
  if (type !== "text") record("password reveal", `type is ${type} after reveal`);
  await page.click('button[aria-label="Hide password"]');
  const back = await page.getAttribute("#password", "type");
  if (back !== "password") record("password reveal", `type is ${back} after hiding`);
  await ctx.close();
}

/* 3. Register: invite-only by default, and it must say so clearly. */
{
  const { ctx, page } = await open();
  await page.goto(`${base}/register`, { waitUntil: "networkidle" });
  const copy = await text(page);
  if (!/invite-only|ask an owner|team page/i.test(copy)) {
    record("register page", `does not explain invite-only access: ${copy.slice(0, 200)}`);
  }
  const hasForm = await page.locator("#email").count();
  if (hasForm) record("register page", "renders a signup form while signups are closed");
  await ctx.close();
}

/* 4. Forgot password: bad email, then a plausible one. */
{
  const { ctx, page } = await open();
  const go = () => page.goto(`${base}/forgot-password`, { waitUntil: "networkidle" });

  await go();
  await page.fill("#email", "nope");
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(1600);
  const bad = await text(page);
  if (!/valid email|invalid|check/i.test(bad)) record("forgot bad email", bad.slice(0, 200));

  await go();
  await page.fill("#email", "nobody-really@example.test");
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(3000);
  const good = await text(page);
  if (!/sent|check your inbox|if that address|link|error|unavailable|failed/i.test(good)) {
    record("forgot good email", good.slice(0, 240));
  }
  await ctx.close();
}

/* 5. Reset password with no token. */
{
  const { ctx, page } = await open();
  const response = await page.goto(`${base}/reset-password`, { waitUntil: "networkidle" });
  const body = await text(page);
  if (/update password|new password/i.test(body)) {
    record(
      "reset-password without token",
      `status ${response?.status()}, the form renders with no token: ${body.slice(0, 160)}`,
    );
  }
  await ctx.close();
}

/* 6. Palette and drawer, keyboard only, against the real shell. */
{
  const { ctx, page } = await open(1440, 900);
  await page.goto(`${base}/design-preview/workspace`, { waitUntil: "networkidle" });
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(500);
  const paletteOpen = await page.locator('[role="dialog"], [role="listbox"], input[role="combobox"]').count();
  if (!paletteOpen) record("command palette", "Control+K did not open anything");

  await page.keyboard.type("inv");
  await page.waitForTimeout(400);
  const results = await page.locator('[role="option"]').count();
  record("command palette results", `${results} options for "inv"`);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const stillOpen = await page.locator('[role="dialog"]').count();
  if (stillOpen) record("command palette", "Escape did not close it");
  await ctx.close();
}

{
  const { ctx, page } = await open(390, 844);
  await page.goto(`${base}/design-preview/workspace`, { waitUntil: "networkidle" });
  const menu = page.getByRole("button", { name: "Open navigation" });
  if (!(await menu.count())) {
    record("phone drawer", "no navigation button on a phone viewport");
  } else {
    await menu.click();
    await page.waitForTimeout(400);
    const drawer = await page.getByRole("button", { name: "Close navigation", exact: true }).count();
    if (!drawer) record("phone drawer", "did not open");
    if (drawer) {
      await page.getByRole("button", { name: "Close navigation", exact: true }).click();
      await page.waitForTimeout(400);
      if (await page.getByRole("button", { name: "Close navigation", exact: true }).count()) {
        record("phone drawer", "did not close");
      }
    }
  }
  await ctx.close();
}

/* 7. An unknown workspace route without a session must not 500. */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const response = await page.goto(`${base}/inventory`, { waitUntil: "domcontentloaded" });
  const status = response?.status() ?? 0;
  if (status >= 500) record("workspace without session", `/inventory returned ${status}`);
  record("workspace without session", `/inventory -> ${status} at ${new URL(page.url()).pathname}`);
  await ctx.close();
}

await browser.close();

if (findings.length === 0) console.log("Clean — every flow behaved.");
else {
  console.log(`${findings.length} findings:\n`);
  for (const finding of findings) console.log(`- ${finding.what}: ${finding.detail}`);
}

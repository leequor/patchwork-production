import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

/**
 * Run the WCAG 2 A/AA rule set over the public routes and fail on anything
 * serious or critical. Run it against a built server, not `next dev`.
 *
 *   npx next build && npx next start -p 3000 &
 *   node scripts/check-a11y.mjs
 */

const base = process.env.BASE_URL ?? "http://localhost:3000";
const routes = ["/track", "/login", "/register", "/status", "/nope-404"];

const browser = await chromium.launch();
let failed = false;

for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  console.log(`${route}  violations=${results.violations.length} serious=${serious.length}`);
  for (const violation of serious) {
    failed = true;
    console.log(`   [${violation.impact}] ${violation.id} — ${violation.help}`);
    console.log(`      ${violation.nodes[0]?.target?.join(" ")}`);
  }

  await ctx.close();
}

await browser.close();
process.exit(failed ? 1 : 0);

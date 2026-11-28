import { expect, test } from "@playwright/test";

import { demoPassword, demoUsers, supabaseUrl } from "./helpers";

test("a staff intake and status update reach the customer's claim check", async ({ page, browser, baseURL }) => {
  // This test writes a repair. Use the seeded local Supabase stack (including CI).
  test.skip(!supabaseUrl || !["127.0.0.1", "localhost"].includes(new URL(supabaseUrl).hostname), "Needs local Supabase");
  await page.goto("/login");
  await page.getByLabel("Email").fill(demoUsers.admin);
  await page.getByLabel("Password", { exact: true }).fill(demoPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Mission control" })).toBeVisible();

  await page.goto("/tickets/new?mode=new");
  await page.getByLabel("Customer name").fill("Repair Test");
  await page.getByLabel("Phone", { exact: true }).fill("415-555-0142");
  await page.getByLabel("Brand", { exact: true }).fill("Bench");
  await page.getByLabel("Model", { exact: true }).fill("Test handset");
  await page.getByLabel("What is wrong?").fill("The screen stays dark when the device is switched on.");
  await page.getByRole("button", { name: "Create ticket" }).click();
  const ticketNumber = page.getByRole("heading", { level: 1, name: /^PW-/ });
  await expect(ticketNumber).toBeVisible();
  const number = await ticketNumber.innerText();
  const code = await page.locator('dt:text-is("Tracking") + dd').innerText();

  const update = "The replacement screen passed its bench test.";
  await page.getByLabel("Move status").selectOption("ready");
  await page.getByLabel("Status note").fill(update);
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText(update, { exact: true })).toBeVisible();

  const customer = await browser.newContext({ baseURL });
  try {
    const tracker = await customer.newPage();
    await tracker.goto("/track");
    await tracker.getByLabel("Tracking code").fill(code);
    await tracker.getByRole("button", { name: "Check status" }).click();
    await expect(tracker.getByText(number, { exact: true }).first()).toBeVisible();
    await expect(tracker.getByRole("heading", { name: "Bench Test handset" })).toBeVisible();
    await expect(tracker.getByText(/Current stage: Ready\./)).toBeVisible();
    await expect(tracker.getByText(update, { exact: true })).toBeVisible();
  } finally {
    await customer.close();
  }
});

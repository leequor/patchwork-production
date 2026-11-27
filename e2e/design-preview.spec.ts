import { expect, test } from "@playwright/test";

test("workspace navigation opens the preview versions of every section", async ({ page }) => {
  await page.goto("/design-preview/workspace");

  for (const [label, path, heading] of [
    ["Tickets", "/design-preview/tickets", "Tickets"],
    ["Customers", "/design-preview/customers", "Customers"],
    ["Inventory", "/design-preview/inventory", "Inventory"],
    ["Invoices", "/design-preview/invoices", "Invoices"],
    ["Team", "/design-preview/team", "Team"],
  ] as const) {
    await page.getByRole("link", { name: label }).first().click();
    await page.waitForURL(`**${path}`);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});

test("workspace sections and sample details stay in the local preview without sign-in", async ({ page }) => {
  const routes = [
    ["/design-preview/tickets", "Tickets"],
    ["/design-preview/customers", "Customers"],
    ["/design-preview/inventory", "Inventory"],
    ["/design-preview/invoices", "Invoices"],
    ["/design-preview/team", "Team"],
    ["/design-preview/tickets/new", "New intake"],
    ["/design-preview/customers/new", "New customer"],
    ["/design-preview/tickets/preview-ticket-1", "PW-1041"],
    ["/design-preview/customers/preview-customer-1", "Maya Ferreira"],
  ] as const;

  for (const [path, heading] of routes) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}$`));
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    await expect(page.getByText(/fixture data · preview only/i)).toBeVisible();
  }
});

test("every sidebar destination collapses on mouse leave after clicking", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/design-preview/tickets");
  const rail = page.getByRole("complementary", { name: "Workspace" });
  const expanded = () => rail.evaluate(element => element.contains(document.elementFromPoint(140, 100)));

  for (const [label, path] of [
    ["Tickets", "/design-preview/tickets"],
    ["Customers", "/design-preview/customers"],
    ["Inventory", "/design-preview/inventory"],
    ["Invoices", "/design-preview/invoices"],
    ["Team", "/design-preview/team"],
    ["New intake", "/design-preview/tickets/new"],
    ["Mission control", "/design-preview/workspace"],
    ["Patchwork home", "/design-preview/workspace"],
  ]) {
    await rail.hover({ position: { x: 28, y: 240 } });
    await expect.poll(expanded).toBe(true);
    await rail.getByRole("link", { name: label, exact: true }).click();
    await page.waitForURL(`**${path}`);
    await page.mouse.move(650, 150);
    await expect.poll(expanded, { message: `${label} must collapse without another click` }).toBe(false);
  }
});

test("sidebar preserves keyboard focus and cancels closing when the pointer returns", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/design-preview/tickets");
  const rail = page.getByRole("complementary", { name: "Workspace" });
  const expanded = () => rail.evaluate(element => element.contains(document.elementFromPoint(140, 100)));
  await rail.hover({ position: { x: 28, y: 240 } });
  await rail.getByRole("link", { name: "Tickets", exact: true }).click();
  await page.mouse.move(650, 150);
  await rail.hover({ position: { x: 28, y: 240 } });
  await page.waitForTimeout(550);
  await expect.poll(expanded).toBe(true);

  await rail.getByRole("link", { name: "Tickets", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(rail.getByRole("link", { name: "Customers", exact: true })).toBeFocused();
  await page.mouse.move(650, 150);
  await page.waitForTimeout(550);
  await expect.poll(expanded).toBe(true);
  await page.getByRole("button", { name: /Search Patchwork/ }).focus();
  await expect.poll(expanded).toBe(false);
});

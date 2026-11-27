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

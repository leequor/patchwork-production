import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--disable-webgl"] }, viewport: { width: 390, height: 844 } });

test("the bench opens and switches repairs without hardware graphics", async ({ page }) => {
  await page.goto("/design-preview/workspace");
  await page.getByRole("option", { name: /Tobias Lindqvist/ }).click();
  await expect(page.getByText("Held until a part arrives.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Open ticket" }).click();
  await expect(page).toHaveURL(/\/design-preview\/tickets\/preview-ticket-2$/);
});

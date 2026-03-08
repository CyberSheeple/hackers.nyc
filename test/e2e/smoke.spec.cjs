/**
 * E2E smoke tests — verify the SPA loads and core flows work
 */

const { test, expect } = require("@playwright/test");

test.describe("SPA smoke", () => {
  test("loads index page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#bento")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#hero-cmd")).toBeVisible();
  });

  test("bento grid is populated", async ({ page }) => {
    await page.goto("/");
    const bento = page.locator("#bento");
    await expect(bento).toBeVisible({ timeout: 10000 });
    const cards = bento.locator(".bento-card");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("internal navigation works", async ({ page }) => {
    await page.goto("/");
    const navLink = page.locator('.bento-card[data-route="nodes"]');
    await expect(navLink).toBeVisible({ timeout: 15000 });
    await navLink.click();
    await expect(page).toHaveURL(/#nodes/, { timeout: 5000 });
    await expect(page.locator("#bento")).toBeVisible();
  });

  test("hash routing persists on reload", async ({ page }) => {
    await page.goto("/#toolz");
    await expect(page).toHaveURL(/#toolz/);
    await page.reload();
    await expect(page).toHaveURL(/#toolz/);
  });
});

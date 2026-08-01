import { expect, test } from "@playwright/test";

/**
 * Critical-path e2e for the footer form in a real browser (where intl-tel-input +
 * libphonenumber actually run — the part jsdom can't cover). Locators are by role /
 * label / text, as a user perceives them, not by CSS class.
 */
test.describe("footer form", () => {
  test("blocks submit and shows errors when empty", async ({ page }) => {
    await page.goto("/");
    await page.locator("#footer-form").scrollIntoViewIfNeeded();

    await page.getByRole("button", { name: "Send Request" }).click();

    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByText("Enter your phone number")).toBeVisible();
    await expect(page.getByText("Enter your email address")).toBeVisible();
  });

  test("submits successfully with valid data", async ({ page }) => {
    // Mock the echo endpoint so the test doesn't depend on the external service.
    await page.route("**/echo.htmlacademy.ru/**", (route) =>
      route.fulfill({ status: 200, body: "ok" }),
    );

    await page.goto("/");
    await page.locator("#footer-form").scrollIntoViewIfNeeded();
    // Wait for intl-tel-input to initialise (lazy import on viewport approach).
    await page.waitForSelector(".iti");

    await page.getByLabel("Name").fill("John Doe");
    // Swiss mobile example number (iti default country = ch) → passes libphonenumber.
    await page.locator("#form-phone").fill("781234567");
    await page.getByLabel("Email").fill("john@example.com");

    await page.getByRole("button", { name: "Send Request" }).click();

    await expect(page.locator(".footer__notification--success")).toBeVisible();
  });
});

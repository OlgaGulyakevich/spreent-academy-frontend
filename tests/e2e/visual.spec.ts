import { expect, test, type Page } from "@playwright/test";

// Reduced motion must be active BEFORE the page loads, so every JS motion module
// (hero/about parallax, counter, about-rotate) bails at init and the page renders in its
// final static state. Set imperatively before goto — config-level `use.reducedMotion` and
// `test.use({ reducedMotion })` did NOT reach the page in this runner (verified: matchMedia
// stayed false); page.emulateMedia does.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

/**
 * Settles a page for a stable screenshot: waits for network to go idle, then scrolls to
 * the footer so the lazily-imported intl-tel-input loads (it inits on IntersectionObserver),
 * waits for its wrapper, and returns to the top. The style tag kills any residual CSS
 * animation/transition (belt-and-suspenders on top of Playwright's animations:'disabled')
 * and neutralises the scrollbar.
 *
 * Why the scrollbar matters: `pages.scss` sets `scrollbar-gutter: stable`, which reserves
 * 15px ONLY when macOS is in classic-scrollbar mode. With `AppleShowScrollBars` unset
 * (the default "Automatic"), macOS switches to classic scrollbars as soon as a MOUSE is
 * plugged in — so the layout width silently flips 480 -> 465 / 1440 -> 1425 and headings
 * re-wrap, making the whole baseline depend on the peripherals attached to the machine.
 * Zeroing the scrollbar here pins the layout to the full viewport width, which is also the
 * truthful mobile rendering (phones use overlay scrollbars).
 */
const settle = async (page: Page): Promise<void> => {
  await page.waitForLoadState("networkidle");
  await page.locator("#footer-form").scrollIntoViewIfNeeded();
  await page.waitForSelector(".iti", { timeout: 10_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }
    html { scrollbar-gutter: auto !important; }
    ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }`,
  });
  // Wait for web fonts so late glyph swaps don't shift text between stabilization frames.
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForLoadState("networkidle");
};

test.describe("visual regression", () => {
  test("landing page", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    await expect(page).toHaveScreenshot("landing.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

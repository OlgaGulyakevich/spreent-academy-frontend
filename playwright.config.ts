import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Playwright — visual regression (480/1440, replaces BackstopJS) + critical-path e2e.
 * Reduced motion (which freezes every JS motion module into its final state for stable
 * screenshots) is emulated per-test in visual.spec.ts via page.emulateMedia — config-level
 * `use.reducedMotion` did not reach the page in this runner version.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-480",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 480, height: 900 },
      },
    },
  ],
  webServer: {
    // Target the production build (astro preview) — the shipped output, with no Astro dev
    // toolbar or HMR client, so screenshots match what actually deploys. Dedicated port so
    // it never collides with a dev server on :3000. reuseExistingServer skips the rebuild
    // when a preview is already up.
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

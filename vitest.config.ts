import { defineConfig } from "vitest/config";

/**
 * Vitest — unit/integration tests (jsdom).
 * Picks up co-located `*.test.ts` files under src/.
 * Playwright specs live in tests/e2e/*.spec.ts and are NOT matched here
 * (different dir + `.spec` extension), so the two runners never collide.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
  },
});

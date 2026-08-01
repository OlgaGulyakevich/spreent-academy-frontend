// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  // astro-icon: local SVGs from src/icons/ → <Icon name="…" /> 
  integrations: [icon()],
  output: 'static',
  // Astro dev toolbar off: a dev/preview-only overlay (absent from the deployed static
  // build) that otherwise renders into Playwright visual-regression screenshots. Committed
  // here — unlike `astro preferences disable devToolbar`, which is local/gitignored (.astro/).
  devToolbar: { enabled: false },
  build: {
    // Keep all CSS in external files (no inlined <style>) so the CSP can use a
    // strict style-src 'self' with no 'unsafe-inline'. Our CSS is one large bundle
    // that stays external anyway → zero perf impact.
    inlineStylesheets: 'never',
  },
  vite: {
    // Same reasoning for scripts: Astro inlines small hoisted <script> tags by
    // default (e.g. ui-kit scroll-spy) as inline <script>, which a strict
    // script-src 'self' (no 'unsafe-inline') blocks. 0 = never inline → external .js.
    build: { assetsInlineLimit: 0 },
  },
  server: {
    port: 3000,
    host: true, // expose on the local network (phone testing via the printed Network URL)
  },
});

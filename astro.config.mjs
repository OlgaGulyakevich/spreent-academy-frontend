// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  // astro-icon: local SVGs from src/icons/ → <Icon name="…" /> 
  integrations: [icon()],
  output: 'static',
  build: {
    // Keep all CSS in external files (no inlined <style>) so the CSP can use a
    // strict style-src 'self' with no 'unsafe-inline'. Our CSS is one large bundle
    // that stays external anyway → zero perf impact.
    inlineStylesheets: 'never',
  },
  server: {
    port: 3000,
    host: true, // expose on the local network (phone testing via the printed Network URL)
  },
});

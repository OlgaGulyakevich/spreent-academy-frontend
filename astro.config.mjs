// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  // astro-icon: local SVGs from src/icons/ → <Icon name="…" /> 
  integrations: [icon()],
  output: 'static',
  server: {
    port: 3000,
  },
});

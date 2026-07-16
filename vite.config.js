import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap';

export default defineConfig({
  root: './source',
  base: './',
  publicDir: 'public',
  server: {
    port: 3000,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  css: {
    devSourcemap: true,
  },
  plugins: [
    VitePluginSvgSpritemap('img/sprite/**/*.svg', {
      styles: false,
      injectSVGOnDev: true,
      svgo: false,
    }),
    // Runs only on `vite build` (plugin sets `apply: 'build'` internally) — dev is unaffected
    ViteImageOptimizer({
      test: /\.(jpe?g|png|svg)$/i,
      exclude: /spreent-circle/,
      includePublic: false,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                convertPathData: {
                  floatPrecision: 5,
                  forceAbsolutePath: false,
                  utilizeAbsolute: false,
                },
                removeViewBox: false,
                cleanupIds: false,
              },
            },
          },
        ],
      },
      png: {
        quality: 80,
        palette: true,
      },
      jpeg: {
        quality: 80,
        progressive: true,
      },
      jpg: {
        quality: 80,
        progressive: true,
      },
      cache: true,
      cacheLocation: './.cache',
    }),
  ],
});

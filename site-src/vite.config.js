import { defineConfig } from 'vite';

/**
 * The site is served from https://alita-tempest.github.io/Portfolio/, so every URL needs that
 * prefix. Vite rewrites the ones it can see statically — HTML attributes and CSS url() — and
 * `asset()` in src/core/paths.js handles the ones built at runtime in JS.
 */
export default defineConfig({
  base: '/Portfolio/',
  build: { outDir: 'dist', assetsInlineLimit: 2048, chunkSizeWarningLimit: 900 },
});

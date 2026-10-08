import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    VitePWA({
      // Phones with the app installed have a service worker registered under
      // this filename. Change it and they'd never get another update.
      filename: 'service-worker.js',
      // public/manifest.json is written by hand
      manifest: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,ico,js,json,png,svg,webp,woff2}'],
        globIgnores: ['*.png', 'icons/**', 'manifests/**'],
      },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

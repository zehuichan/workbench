import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

import { mockServer } from './server/vite-plugin.ts';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), vueJsx(), tailwindcss(), mockServer({ latencyMs: 400 })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  server: {
    port: 9527,
  },
});

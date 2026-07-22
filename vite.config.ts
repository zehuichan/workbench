import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 9527,
  },
});

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const resolveRepo = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 本地调试直接使用 workspace 源码，便于 HMR。
      '@labs/plus-table': resolveRepo('packages/plus-table/src/index.ts'),
    },
  },
  server: {
    port: 8000,
  },
});

import { createRouter, createWebHashHistory } from 'vue-router';

import { routes } from './routes';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  // 是否应该禁止尾部斜杠。
  // strict: true,
});

export { router };

import { type RouteRecordRaw } from 'vue-router';

const routes = [
  {
    name: 'Root',
    path: '/',
    redirect: '/plus-table',
  },
  {
    name: 'plus-table',
    path: '/plus-table',
    component: () => import('@/views/plus-table/index.vue'),
  },
  {
    name: 'tanstack-table-demo',
    path: '/tanstack-table-demo',
    component: () => import('@/views/tanstack-table-demo/index.vue'),
  },
] as RouteRecordRaw[];

export { routes };

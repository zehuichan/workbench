import { type RouteRecordRaw } from 'vue-router';

const routes = [
  {
    name: 'Root',
    path: '/',
    redirect: '/plus-table/docs',
  },
  {
    name: 'plus-table-demo',
    path: '/plus-table/demo',
    component: () => import('@/views/plus-table/demo.vue'),
  },
  {
    name: 'plus-table-docs',
    path: '/plus-table/docs',
    component: () => import('@/views/plus-table/docs.vue'),
  },
] as RouteRecordRaw[];

export { routes };

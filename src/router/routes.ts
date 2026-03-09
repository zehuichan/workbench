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
    name: 'vtable',
    path: '/vtable',
    component: () => import('@/views/vtable/index.vue'),
  },
] as RouteRecordRaw[];

export { routes };

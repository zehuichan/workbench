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
  {
    name: 'vtable-stage1',
    path: '/vtable/stage1',
    component: () => import('@/views/vtable/stage1.vue'),
  },
  {
    name: 'vtable-stage2',
    path: '/vtable/stage2',
    component: () => import('@/views/vtable/stage2.vue'),
  },
] as RouteRecordRaw[];

export { routes };

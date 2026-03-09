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
    name: 'vistable',
    path: '/vistable',
    component: () => import('@/views/vistable/index.vue'),
  },
  {
    name: 'vistable-stage1',
    path: '/vistable/stage1',
    component: () => import('@/views/vistable/stage1.vue'),
  },
  {
    name: 'vistable-stage2',
    path: '/vistable/stage2',
    component: () => import('@/views/vistable/stage2.vue'),
  },
] as RouteRecordRaw[];

export { routes };

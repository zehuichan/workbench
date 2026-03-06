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
    name: 'plus-table-stage1',
    path: '/plus-table/stage1',
    component: () => import('@/views/plus-table/stage1.vue'),
  },
  {
    name: 'plus-table-stage2',
    path: '/plus-table/stage2',
    component: () => import('@/views/plus-table/stage2.vue'),
  },
  {
    name: 'plus-table-stage3',
    path: '/plus-table/stage3',
    component: () => import('@/views/plus-table/stage3.vue'),
  },
  {
    name: 'plus-table-stage4',
    path: '/plus-table/stage4',
    component: () => import('@/views/plus-table/stage4.vue'),
  },
  {
    name: 'plus-table-stage5',
    path: '/plus-table/stage5',
    component: () => import('@/views/plus-table/stage5.vue'),
  },
] as RouteRecordRaw[];

export { routes };

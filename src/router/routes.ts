import { type RouteRecordRaw } from 'vue-router';

const routes = [
  {
    name: 'Root',
    path: '/',
    redirect: '/re-table-next',
  },
  {
    name: 're-table-next',
    path: '/re-table-next',
    component: () => import('@/views/re-table-next/index.vue'),
  },
  {
    name: 're-table-next-stage1',
    path: '/re-table-next/stage1',
    component: () => import('@/views/re-table-next/stage1.vue'),
  },
  {
    name: 're-table-next-stage2',
    path: '/re-table-next/stage2',
    component: () => import('@/views/re-table-next/stage2.vue'),
  },
  {
    name: 're-table-next-stage3',
    path: '/re-table-next/stage3',
    component: () => import('@/views/re-table-next/stage3.vue'),
  },
  {
    name: 're-table-next-stage4',
    path: '/re-table-next/stage4',
    component: () => import('@/views/re-table-next/stage4.vue'),
  },
  {
    name: 're-table-next-stage5',
    path: '/re-table-next/stage5',
    component: () => import('@/views/re-table-next/stage5.vue'),
  },
] as RouteRecordRaw[];

export { routes };

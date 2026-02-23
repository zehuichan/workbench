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
    name: 're-table',
    path: '/re-table',
    component: () => import('@/views/re-table/index.vue'),
  },
  {
    name: 'ant-table',
    path: '/ant-table',
    component: () => import('@/views/ant-table/index.vue'),
  },
] as RouteRecordRaw[];

export { routes };

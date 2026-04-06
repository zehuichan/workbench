import { type RouteRecordRaw } from 'vue-router';

const routes = [
  {
    name: 'Root',
    path: '/',
    redirect: '/plus-table/docs',
  },
  {
    path: '/plus-table',
    component: () => import('@/layouts/layout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'plus-table-docs' },
      },
      {
        name: 'plus-table-docs',
        path: 'docs',
        component: () => import('@/views/plus-table/docs.vue'),
      },
      {
        name: 'plus-table-demo',
        path: 'demo',
        component: () => import('@/views/plus-table/demo.vue'),
      },
    ],
  },
  {
    path: '/hucre',
    component: () => import('@/layouts/layout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'hucre-docs' },
      },
      {
        name: 'hucre-docs',
        path: 'docs',
        component: () => import('@/views/hucre/docs.vue'),
      },
      {
        name: 'hucre-demo',
        path: 'demo',
        component: () => import('@/views/hucre/demo.vue'),
      },
    ],
  },
] as RouteRecordRaw[];

export { routes };

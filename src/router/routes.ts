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
    path: '/vtable',
    component: () => import('@/layouts/layout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'vtable-element-plus-editor' },
      },
      {
        name: 'vtable-element-plus-editor',
        path: 'element-plus-editor',
        component: () => import('@/views/vtable/element-plus-editor-demo.vue'),
      },
    ],
  },
] as RouteRecordRaw[];

export { routes };

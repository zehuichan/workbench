import { createRouter, createWebHistory } from 'vue-router';

import PlaygroundLayout from '@/layouts/playground-layout.vue';
import BasicEditingDemo from '@/views/plus-table/basic-editing-demo.vue';
import DependenciesValidationDemo from '@/views/plus-table/dependencies-validation-demo.vue';
import HistoryDirtyDemo from '@/views/plus-table/history-dirty-demo.vue';
import PaginationRowsDemo from '@/views/plus-table/pagination-rows-demo.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PlaygroundLayout,
      children: [
        { path: '', redirect: '/plus-table/basic-editing' },
        {
          path: 'plus-table/basic-editing',
          name: 'plus-table-basic-editing',
          component: BasicEditingDemo,
          meta: { title: '基础编辑', group: 'PlusTable' },
        },
        {
          path: 'plus-table/dependencies-validation',
          name: 'plus-table-dependencies-validation',
          component: DependenciesValidationDemo,
          meta: { title: '联动与校验', group: 'PlusTable' },
        },
        {
          path: 'plus-table/history-dirty',
          name: 'plus-table-history-dirty',
          component: HistoryDirtyDemo,
          meta: { title: '历史与脏追踪', group: 'PlusTable' },
        },
        {
          path: 'plus-table/pagination-rows',
          name: 'plus-table-pagination-rows',
          component: PaginationRowsDemo,
          meta: { title: '分页与行操作', group: 'PlusTable' },
        },
      ],
    },
  ],
});

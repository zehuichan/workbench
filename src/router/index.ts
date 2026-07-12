import { createRouter, createWebHistory } from 'vue-router';

import PlaygroundLayout from '@/layouts/playground-layout.vue';
import UseAutoSaveDemo from '@/views/composables/use-auto-save-demo.vue';
import UseFormDraftDemo from '@/views/composables/use-form-draft-demo.vue';
import UseSaveHotkeyDemo from '@/views/composables/use-save-hotkey-demo.vue';
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
        {
          path: 'composables/use-auto-save',
          name: 'composables-use-auto-save',
          component: UseAutoSaveDemo,
          meta: { title: 'useAutoSave', group: 'Composables' },
        },
        {
          path: 'composables/use-form-draft',
          name: 'composables-use-form-draft',
          component: UseFormDraftDemo,
          meta: { title: 'useFormDraft', group: 'Composables' },
        },
        {
          path: 'composables/use-save-hotkey',
          name: 'composables-use-save-hotkey',
          component: UseSaveHotkeyDemo,
          meta: { title: 'useSaveHotkey', group: 'Composables' },
        },
      ],
    },
  ],
});

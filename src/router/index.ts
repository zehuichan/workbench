import { createRouter, createWebHistory } from 'vue-router';

import PlaygroundLayout from '@/layouts/playground-layout.vue';
import UseAuthDemo from '@/views/composables/use-auth-demo.vue';
import UseAutoSaveDemo from '@/views/composables/use-auto-save-demo.vue';
import UseFormDraftDemo from '@/views/composables/use-form-draft-demo.vue';
import UseSaveHotkeyDemo from '@/views/composables/use-save-hotkey-demo.vue';
import UseWeixinDemo from '@/views/composables/use-weixin-demo.vue';
import ErpApiOverview from '@/views/erp/api-overview.vue';
import ExpenseReportLinkageDemo from '@/views/erp/expense-report-linkage-demo.vue';
import PurchaseOrderLinkageDemo from '@/views/erp/purchase-order-linkage-demo.vue';
import SalesOrderLinkageDemo from '@/views/erp/sales-order-linkage-demo.vue';
import ApiOverview from '@/views/plus-table/api-overview.vue';
import BasicEditingDemo from '@/views/plus-table/basic-editing-demo.vue';
import DependenciesValidationDemo from '@/views/plus-table/dependencies-validation-demo.vue';
import HistoryDirtyDemo from '@/views/plus-table/history-dirty-demo.vue';
import PaginationRowsDemo from '@/views/plus-table/pagination-rows-demo.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PlaygroundLayout,
      children: [
        { path: '', redirect: '/plus-table/basic-editing' },
        {
          path: 'plus-table/api-overview',
          name: 'plus-table-api-overview',
          component: ApiOverview,
          meta: { title: 'API Overview', group: 'PlusTable', order: 0 },
        },
        {
          path: 'plus-table/basic-editing',
          name: 'plus-table-basic-editing',
          component: BasicEditingDemo,
          meta: { title: '基础编辑', group: 'PlusTable', order: 1 },
        },
        {
          path: 'plus-table/dependencies-validation',
          name: 'plus-table-dependencies-validation',
          component: DependenciesValidationDemo,
          meta: { title: '联动与校验', group: 'PlusTable', order: 2 },
        },
        {
          path: 'plus-table/history-dirty',
          name: 'plus-table-history-dirty',
          component: HistoryDirtyDemo,
          meta: { title: '历史与脏追踪', group: 'PlusTable', order: 3 },
        },
        {
          path: 'plus-table/pagination-rows',
          name: 'plus-table-pagination-rows',
          component: PaginationRowsDemo,
          meta: { title: '分页与行操作', group: 'PlusTable', order: 4 },
        },
        {
          path: 'erp/api-overview',
          name: 'erp-api-overview',
          component: ErpApiOverview,
          meta: { title: 'API Overview', group: 'ERP 场景', order: 0 },
        },
        {
          path: 'erp/sales-order-linkage',
          name: 'erp-sales-order-linkage',
          component: SalesOrderLinkageDemo,
          meta: { title: '销售订单联动', group: 'ERP 场景', order: 1 },
        },
        {
          path: 'erp/purchase-order-linkage',
          name: 'erp-purchase-order-linkage',
          component: PurchaseOrderLinkageDemo,
          meta: { title: '采购订单联动', group: 'ERP 场景', order: 2 },
        },
        {
          path: 'erp/expense-report-linkage',
          name: 'erp-expense-report-linkage',
          component: ExpenseReportLinkageDemo,
          meta: { title: '费用报销联动', group: 'ERP 场景', order: 3 },
        },
        {
          path: 'composables/use-auto-save',
          name: 'composables-use-auto-save',
          component: UseAutoSaveDemo,
          meta: { title: 'useAutoSave', group: 'Composables', order: 1 },
        },
        {
          path: 'composables/use-form-draft',
          name: 'composables-use-form-draft',
          component: UseFormDraftDemo,
          meta: { title: 'useFormDraft', group: 'Composables', order: 2 },
        },
        {
          path: 'composables/use-save-hotkey',
          name: 'composables-use-save-hotkey',
          component: UseSaveHotkeyDemo,
          meta: { title: 'useSaveHotkey', group: 'Composables', order: 3 },
        },
        {
          path: 'composables/use-auth',
          name: 'composables-use-auth',
          component: UseAuthDemo,
          meta: { title: 'useAuth', group: 'Composables', order: 4 },
        },
        {
          path: 'composables/use-weixin',
          name: 'composables-use-weixin',
          component: UseWeixinDemo,
          meta: { title: 'useWeixin', group: 'Composables', order: 5 },
        },
      ],
    },
  ],
});

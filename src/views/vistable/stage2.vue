<script setup lang="ts">
import { ref } from 'vue';

import { ElSwitch } from 'element-plus';
import { Tag } from '@visactor/vue-vtable';

import { VisTable } from '@/components';

const columns = [
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true,
    fixed: 'left' as const,
  },
  { prop: 'name', label: '任务名称', width: 200 },
  { prop: 'status', label: '状态', width: 100, sortable: true },
  { prop: 'amount', label: '金额', width: 100 },
  { prop: 'department', label: '部门', width: 120 },
];

const tableData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `任务 ${i + 1}`,
    status: ['待开始', '进行中', '已完成'][i % 3]!,
    amount: 1000 + (i % 20) * 500,
    department: ['技术部', '产品部', '设计部'][i % 3]!,
  })),
);

const adaptive = ref(true);
</script>

<template>
  <div class="flex h-screen flex-col p-4">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <div>
        <h1 class="text-lg font-semibold">
          VTable 分页 / 排序 / 固定列 Demo（阶段 2）
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          客户端分页 1000 条、每页 20 条；ID 列左固定；sortable
          列可点击；状态列用 VisTableCell 自定义（Tag）
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm">adaptive</span>
        <el-switch v-model="adaptive" />
      </div>
    </div>

    <div class="min-h-0 flex-1 rounded border border-gray-200 bg-white p-2">
      <VisTable
        :columns="columns"
        :data="tableData"
        :adaptive="adaptive"
        class="h-full w-full"
      >
        <!-- 自定义单元格：插槽名 cell-{prop}，内容须为 vue-vtable 图形组件（Group/Text/Tag 等） -->
        <template #editor-status="scope"> 状态编辑 </template>
        <template #status="scope"> 状态自定义1 </template>
      </VisTable>
    </div>
  </div>
</template>

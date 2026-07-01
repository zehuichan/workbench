<script setup lang="ts">
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

interface Row {
  id: number;
  name: string;
  amount: number;
}

const data = ref<Row[]>([
  { id: 1, name: '需求评审', amount: 1200 },
  { id: 2, name: '接口开发', amount: 3400 },
  { id: 3, name: '联调测试', amount: 800 },
]);

const columns: PlusTableColumn[] = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', editable: true, component: 'input', required: true },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, controls: false },
    formatter: (row) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
];
</script>

<template>
  <main style="max-width: 960px; margin: 40px auto; padding: 0 16px">
    <h1 style="font-size: 20px; margin-bottom: 16px">PlusTable Playground</h1>
    <PlusTable
      v-model:data="data"
      :columns="columns"
      row-key="id"
      border
      edit-mode="cell"
    />
  </main>
</template>

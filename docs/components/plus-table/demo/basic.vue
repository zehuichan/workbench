<script setup lang="ts">
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
}

const data = ref<Row[]>([
  { id: 1, name: '需求评审', amount: 1200, status: 'pending' },
  { id: 2, name: '接口开发', amount: 3400, status: 'active' },
  { id: 3, name: '联调测试', amount: 800, status: 'done' },
]);

const columns: PlusTableColumn[] = [
  { field: 'id', title: 'ID', width: 80 },
  {
    field: 'name',
    title: '名称',
    editable: true,
    editor: 'input',
    required: true,
  },
  {
    field: 'amount',
    title: '金额',
    align: 'right',
    width: 140,
    editable: true,
    editor: { type: 'number', props: { min: 0, step: 100, controls: false } },
    formatter: (value) => `¥ ${(Number(value) || 0).toLocaleString('zh-CN')}`,
  },
  {
    field: 'status',
    title: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      options: [
        { label: '待开始', value: 'pending' },
        { label: '进行中', value: 'active' },
        { label: '已完成', value: 'done' },
      ],
    },
    formatter: (value) =>
      ({ pending: '待开始', active: '进行中', done: '已完成' })[String(value)] ?? '',
  },
];
</script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>

<script setup lang="ts">
// @ts-nocheck — demo 展示日常写法：data/columns 均不做显式泛型标注
import { ref } from 'vue';

import { PlusTable } from '@labs/plus-table';

const data = ref([
  { id: 1, name: '需求评审', amount: 1200, status: 'pending' },
  { id: 2, name: '接口开发', amount: 3400, status: 'active' },
  { id: 3, name: '联调测试', amount: 800, status: 'done' },
]);

const columns = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },
  { prop: 'id', label: 'ID', width: 80 },
  {
    prop: 'name',
    label: '名称',
    editable: true,
    editor: 'input',
    required: true,
  },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    width: 140,
    editable: true,
    editor: { type: 'input-number', props: { min: 0, step: 100, controls: false } },
    formatter: (row) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      props: {
        options: [
          { label: '待开始', value: 'pending' },
          { label: '进行中', value: 'active' },
          { label: '已完成', value: 'done' },
        ],
      },
    },
    formatter: (row) =>
      ({ pending: '待开始', active: '进行中', done: '已完成' } as Record<string, string>)[
        row.status
      ] ?? '',
  },
];
</script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { AntTable } from '@labs/ant-table';
import type { AntTableColumn } from '@labs/ant-table';

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

const columns: AntTableColumn<Row>[] = [
  {
    title: '#',
    key: 'index',
    width: 60,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '名称', dataIndex: 'name', editable: true, component: 'input' },
  {
    title: '金额',
    dataIndex: 'amount',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, style: { width: '100%' } },
    customRender: ({ value }) => `¥ ${(value ?? 0).toLocaleString('zh-CN')}`,
  },
];
</script>

<template>
  <AntTable
    v-model:dataSource="data"
    :columns="columns"
    row-key="id"
    bordered
    editable="cell"
  />
</template>

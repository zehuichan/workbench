<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'BasicEditingDemo' });

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
  dueDate: string;
  enabled: boolean;
}

const data = ref<Row[]>([
  {
    id: 1,
    name: '需求评审',
    amount: 1200,
    status: 'todo',
    dueDate: '2026-07-20',
    enabled: true,
  },
  {
    id: 2,
    name: '接口开发',
    amount: 3400,
    status: 'doing',
    dueDate: '2026-07-25',
    enabled: true,
  },
  {
    id: 3,
    name: '联调测试',
    amount: 800,
    status: 'done',
    dueDate: '2026-07-30',
    enabled: false,
  },
]);

const statusOptions = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '完成', value: 'done' },
];

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 140,
    editable: true,
    editor: 'input',
  },
  {
    prop: 'amount',
    label: '金额',
    width: 120,
    align: 'right',
    editable: true,
    editor: {
      type: 'input-number',
      props: { min: 0, step: 100, controls: false },
    },
    formatter: (row: Row) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      props: { options: statusOptions, clearable: true },
    },
    formatter: (row: Row) =>
      statusOptions.find((o) => o.value === row.status)?.label ?? row.status,
  },
  {
    prop: 'dueDate',
    label: '截止日期',
    width: 160,
    editable: true,
    editor: {
      type: 'date-picker',
      props: { type: 'date', valueFormat: 'YYYY-MM-DD' },
    },
  },
  {
    prop: 'enabled',
    label: '启用',
    width: 90,
    align: 'center',
    editable: true,
    editor: 'switch',
  },
];
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">基础编辑</h1>
      <p class="demo__desc">
        cell 模式：input / input-number / select / date-picker / switch
      </p>
    </header>
    <PlusTable
      v-model:data="data"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      border
    />
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>

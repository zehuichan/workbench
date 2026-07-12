<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'PaginationRowsDemo' });

interface Row {
  id: number;
  name: string;
  owner: string;
}

let nextId = 21;

const allRows = ref<Row[]>(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `任务 ${i + 1}`,
    owner: i % 2 === 0 ? 'Alice' : 'Bob',
  })),
);

const page = ref(1);
const pageSize = ref(5);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return allRows.value.slice(start, start + pageSize.value);
});

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 160,
    editable: true,
    editor: 'input',
  },
  {
    prop: 'owner',
    label: '负责人',
    width: 140,
    editable: true,
    editor: 'input',
  },
];

function handlePageChange(payload: { page: number; pageSize: number }) {
  page.value = payload.page;
  pageSize.value = payload.pageSize;
}

function addRow() {
  allRows.value = [
    ...allRows.value,
    { id: nextId++, name: `新任务 ${nextId - 1}`, owner: 'Alice' },
  ];
  page.value = Math.ceil(allRows.value.length / pageSize.value) || 1;
}

function removeFirstOnPage() {
  if (pageRows.value.length === 0) return;
  const id = pageRows.value[0]!.id;
  allRows.value = allRows.value.filter((row) => row.id !== id);
  const maxPage = Math.max(1, Math.ceil(allRows.value.length / pageSize.value));
  if (page.value > maxPage) page.value = maxPage;
}

function duplicateFirstOnPage() {
  const source = pageRows.value[0];
  if (!source) return;
  const index = allRows.value.findIndex((row) => row.id === source.id);
  if (index < 0) return;
  const clone: Row = {
    ...source,
    id: nextId++,
    name: `${source.name} (副本)`,
  };
  const next = [...allRows.value];
  next.splice(index + 1, 0, clone);
  allRows.value = next;
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">分页与行操作</h1>
      <p class="demo__desc">
        全量在内存切片；增删复制改源数据。表格仅接收当前页。
      </p>
    </header>
    <PlusTable
      :data="pageRows"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      border
      :total="allRows.length"
      :page="page"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20]"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @page-change="handlePageChange"
    >
      <template #toolbar>
        <el-button type="primary" @click="addRow">新增</el-button>
        <el-button @click="removeFirstOnPage">删除当前页首行</el-button>
        <el-button @click="duplicateFirstOnPage">复制当前页首行</el-button>
        <span class="demo__meta">共 {{ allRows.length }} 行</span>
      </template>
    </PlusTable>
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

.demo__meta {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
}
</style>

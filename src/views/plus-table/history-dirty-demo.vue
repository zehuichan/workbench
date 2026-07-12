<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'HistoryDirtyDemo' });

interface Row {
  id: number;
  name: string;
  amount: number;
}

interface TableExpose {
  undo: () => unknown;
  redo: () => unknown;
  canUndo: { value: boolean };
  canRedo: { value: boolean };
  getModifiedRows: () => Row[];
  resetTracking: () => void;
}

const tableRef = ref<TableExpose>();
const dirtyCount = ref(0);

const data = ref<Row[]>([
  { id: 1, name: '差旅报销', amount: 1280 },
  { id: 2, name: '办公采购', amount: 560 },
  { id: 3, name: '外包结算', amount: 9200 },
]);

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
    prop: 'amount',
    label: '金额',
    width: 140,
    align: 'right',
    editable: true,
    editor: {
      type: 'input-number',
      props: { min: 0, step: 10, controls: false },
    },
  },
];

const canUndo = computed(() => tableRef.value?.canUndo?.value ?? false);
const canRedo = computed(() => tableRef.value?.canRedo?.value ?? false);

function refreshDirty() {
  dirtyCount.value = tableRef.value?.getModifiedRows()?.length ?? 0;
}

function handleUndo() {
  tableRef.value?.undo();
  refreshDirty();
}

function handleRedo() {
  tableRef.value?.redo();
  refreshDirty();
}

function handleResetTracking() {
  tableRef.value?.resetTracking();
  refreshDirty();
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">历史与脏追踪</h1>
      <p class="demo__desc">
        开启 history + dirtyTracking；编辑后可撤销并查看脏行。
      </p>
    </header>
    <PlusTable
      ref="tableRef"
      v-model:data="data"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      history
      dirty-tracking
      border
      @cell-change="refreshDirty"
    >
      <template #toolbar>
        <el-button :disabled="!canUndo" @click="handleUndo">Undo</el-button>
        <el-button :disabled="!canRedo" @click="handleRedo">Redo</el-button>
        <el-button @click="handleResetTracking">Reset tracking</el-button>
        <span class="demo__meta">脏行 {{ dirtyCount }}</span>
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

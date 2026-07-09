<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlusTable } from '@/components/plus-table';
import type { EditMode } from '@/components/plus-table';

const data = ref([
  { id: 1, name: '需求评审', amount: 1200 },
  { id: 2, name: '接口开发', amount: 3400 },
  { id: 3, name: '联调测试', amount: 800 },
]);

const columns = [
  { type: 'index', label: '#', width: 60 },
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
    editable: true,
    editor: {
      type: 'input-number',
      props: { min: 0, step: 100, controls: false },
    },
    formatter: (row: any) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
];

const query = new URLSearchParams(window.location.search);
const tableRef = ref();
const editMode = ref((query.get('editMode') ?? 'cell') as EditMode);
const historyEnabled = ref(query.get('history') === '1');
const dirtyEnabled = ref(query.get('dirty') === '1');
const useNameSlot = query.get('slot') === '1';
const showTools = computed(
  () =>
    query.has('tools') ||
    query.has('editMode') ||
    query.has('history') ||
    query.has('dirty') ||
    editMode.value !== 'cell' ||
    historyEnabled.value ||
    dirtyEnabled.value,
);
const dirtyCount = computed(
  () => tableRef.value?.getModifiedRows().length ?? 0,
);

function startFirstRowEdit() {
  tableRef.value?.startRowEdit(0);
}

async function saveFirstRow() {
  await tableRef.value?.commitRowEdit(0);
}

function cancelFirstRow() {
  tableRef.value?.cancelRowEdit(0);
}

function toggleHistory() {
  historyEnabled.value = !historyEnabled.value;
}
</script>

<template>
  <main style="max-width: 960px; margin: 40px auto; padding: 0 16px">
    <h1 style="font-size: 20px; margin-bottom: 16px">PlusTable Playground</h1>
    <div
      v-if="showTools"
      style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px"
    >
      <button type="button" @click="startFirstRowEdit">编辑首行</button>
      <button type="button" @click="saveFirstRow">保存首行</button>
      <button type="button" @click="cancelFirstRow">取消首行</button>
      <button
        type="button"
        :disabled="!tableRef?.canUndo"
        @click="tableRef?.undo()"
      >
        撤销
      </button>
      <button type="button" @click="toggleHistory">
        {{ historyEnabled ? '关闭撤销重做' : '开启撤销重做' }}
      </button>
      <span>脏行数 {{ dirtyCount }}</span>
    </div>
    <PlusTable
      ref="tableRef"
      v-model:data="data"
      :columns="columns"
      row-key="id"
      border
      :edit-mode="editMode"
      :history="historyEnabled"
      :dirty-tracking="dirtyEnabled"
    >
      <template v-if="useNameSlot" #editor-name="{ value, setValue, commit }">
        <input
          aria-label="名称自定义编辑器"
          :value="value as string"
          @input="setValue(($event.target as HTMLInputElement).value)"
          @keydown.enter="commit"
        />
      </template>
    </PlusTable>
  </main>
</template>

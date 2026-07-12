<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components/plus-table';
import type { ValidateResult } from '@/components/plus-table';

defineOptions({ name: 'DependenciesValidationDemo' });

interface Row {
  id: number;
  category: string;
  item: string;
  remark: string;
}

const CATEGORY_ITEMS: Record<string, { label: string; value: string }[]> = {
  hardware: [
    { label: '显示器', value: 'monitor' },
    { label: '键盘', value: 'keyboard' },
  ],
  software: [
    { label: 'IDE 许可', value: 'ide' },
    { label: '云服务', value: 'cloud' },
  ],
};

const tableRef = ref<{ validate: () => Promise<ValidateResult> }>();
const lastValidate = ref('');

const data = ref<Row[]>([
  { id: 1, category: 'hardware', item: 'monitor', remark: '27 寸' },
  { id: 2, category: 'software', item: 'ide', remark: '' },
  { id: 3, category: '', item: '', remark: '' },
]);

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'category',
    label: '类别',
    width: 160,
    editable: true,
    required: true,
    rules: [{ required: true, message: '请选择类别' }],
    editor: {
      type: 'select',
      props: {
        options: [
          { label: '硬件', value: 'hardware' },
          { label: '软件', value: 'software' },
        ],
        clearable: true,
      },
    },
    formatter: (row: Row) =>
      ({ hardware: '硬件', software: '软件' } as Record<string, string>)[
        row.category
      ] ?? '',
  },
  {
    prop: 'item',
    label: '明细',
    width: 160,
    editable: true,
    required: true,
    rules: [{ required: true, message: '请选择明细' }],
    editor: { type: 'select', props: { clearable: true } },
    dependencies: {
      triggerFields: ['category'],
      componentProps: (row: Row) => ({
        options: CATEGORY_ITEMS[row.category] ?? [],
        disabled: !row.category,
      }),
      trigger: (
        row: Row,
        api: { setValue: (p: string, v: unknown) => void },
      ) => {
        const options = CATEGORY_ITEMS[row.category] ?? [];
        if (!options.some((o) => o.value === row.item)) {
          api.setValue('item', '');
        }
      },
    },
    formatter: (row: Row) => {
      const options = CATEGORY_ITEMS[row.category] ?? [];
      return options.find((o) => o.value === row.item)?.label ?? row.item;
    },
  },
  {
    prop: 'remark',
    label: '备注',
    minWidth: 160,
    editable: true,
    editor: 'input',
  },
];

async function handleValidate() {
  const result = await tableRef.value?.validate();
  if (!result) {
    lastValidate.value = '无法校验';
    return;
  }
  lastValidate.value = result.valid
    ? '校验通过'
    : `失败 ${result.errors.length} 项`;
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">联动与校验</h1>
      <p class="demo__desc">
        类别驱动明细选项；必填校验。第 3 行故意留空便于触发失败。
      </p>
    </header>
    <PlusTable
      ref="tableRef"
      v-model:data="data"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      border
    >
      <template #toolbar>
        <el-button type="primary" @click="handleValidate">校验</el-button>
        <span v-if="lastValidate" class="demo__meta">{{ lastValidate }}</span>
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

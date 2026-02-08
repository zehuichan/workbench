<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PlusTable } from '@/components';
import type { PlusTableColumnOption } from '@/components/plus-table/tokens';

type EditableMode = boolean | 'row' | 'cell' | 'manual';

interface TableRow {
  id: string;
  parentId: string | null;
  [key: string]: unknown;
}

const loading = ref(true);
const tableRef = ref<InstanceType<typeof PlusTable> | null>(null);
const tableData = ref<TableRow[]>([]);
const editable = ref<EditableMode>(false);

const rules: Record<string, Array<{ min?: number; max?: number; required?: boolean; message: string; trigger?: string }>> = {
  column0: [
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'change' },
  ],
  column1: [{ required: true, message: '必须填写', trigger: 'change' }],
  column2: [{ required: true, message: '必须填写', trigger: 'change' }],
};

const generateColumns = (
  length = 10,
  prefix = 'column',
  props?: Partial<PlusTableColumnOption>
): PlusTableColumnOption[] =>
  Array.from({ length }).map((_, columnIndex) => ({
    ...props,
    prop: `${prefix}${columnIndex}`,
    label: `Column ${columnIndex}`,
    component: 'Input',
  }));

const generateData = (
  columns: PlusTableColumnOption[],
  length = 200,
  prefix = 'row'
): TableRow[] =>
  Array.from({ length }).map((_, rowIndex) =>
    columns.reduce<TableRow>(
      (rowData, column, columnIndex) => {
        rowData[column.prop!] = `Row ${rowIndex} - Col ${columnIndex}`;
        return rowData;
      },
      { id: `${prefix}${rowIndex}`, parentId: null }
    )
  );

const columns: PlusTableColumnOption[] = [
  { type: 'selection' },
  { type: 'index', label: '序号' },
].concat(generateColumns(5));
const data = generateData(columns, 5);

const handleEditModeChange = (mode: EditableMode) => {
  editable.value = mode;
};

const handleValidate = async () => {
  const res = await tableRef.value?.validate?.();
  console.log(res);
};

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
    tableData.value = data;
  }, 1000);
});
</script>

<template>
  <el-config-provider size="small">
    <div class="bg-card p-3">
      <!-- 原有的编辑按钮 -->
      <el-space wrap class="mb-3">
        <el-button @click="handleEditModeChange(true)"> 开启编辑 </el-button>
        <el-button @click="handleEditModeChange(false)"> 关闭编辑 </el-button>
        <el-button @click="handleEditModeChange('row')"> 点击行编辑 </el-button>
        <el-button @click="handleEditModeChange('cell')">
          点击单元格编辑
        </el-button>
        <el-button @click="handleEditModeChange('manual')">
          手动单元格编辑
        </el-button>
        <el-button @click="handleValidate"> 校验数据 </el-button>
      </el-space>
      <PlusTable
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :rules="rules"
        :editable="editable"
        ref="tableRef"
      >
      </PlusTable>
    </div>
  </el-config-provider>
</template>

<style lang="scss"></style>

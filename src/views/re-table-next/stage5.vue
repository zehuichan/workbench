<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { ElMessage, ElTag } from 'element-plus';

import { ReTableNext } from '@/components';
import type {
  DependencyApi,
  ReTableNextColumn,
} from '@/components/re-table-next';
import type { RuleItem } from 'async-validator';
import { buildShortUUID } from '@/utils';

// ──── 数据类型 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  amount: number;
  assignee: string;
  department: string;
  remark: string;
  [key: string]: unknown;
}

const statusMap: Record<
  string,
  { label: string; type: 'info' | 'warning' | 'success' }
> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#F56C6C' },
  medium: { label: '中', color: '#E6A23C' },
  low: { label: '低', color: '#909399' },
};

const defaultStatus = { label: '未知', type: 'info' as const };
const defaultPriority = { label: '未知', color: '#909399' };

const departments = ['技术部', '产品部', '设计部', '市场部'];

/** 部门 → 人员映射（用于动态下拉） */
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};

function createRow(i: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const dept = departments[i % departments.length];
  const assigneesForDept = departmentAssignees[dept] ?? [];
  return {
    id: i + 1,
    name: `任务 ${i + 1} — ${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][i % 5]}`,
    status: statuses[i % 3],
    priority: priorities[i % 3],
    amount: 1000 + (i % 20) * 500,
    department: dept,
    assignee: assigneesForDept[i % assigneesForDept.length] ?? assigneesForDept[0] ?? '',
    remark: '',
  };
}

const tableData = ref<TaskRow[]>(
  Array.from({ length: 10 }, (_, i) => createRow(i)),
);

const statusOptions = [
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' },
];

const priorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
];

// ──── 列配置（含 dependencies）────

const columns: ReTableNextColumn<TaskRow>[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55 },
  {
    prop: 'id',
    label: 'ID',
    editable: false,
  },
  {
    prop: 'name',
    label: '任务名称',
    editable: true,
    component: 'input',
    rules: [
      { required: true, message: '请输入任务名称' },
      { min: 2, max: 100, message: '长度 2–100' },
    ],
  },
  {
    prop: 'status',
    label: '状态',
    editable: true,
    component: 'select',
    componentProps: {
      clearable: true,
      options: statusOptions,
    },
    render: (scope) => {
      const status = statusMap[scope?.row?.status as string] ?? defaultStatus;
      return h(
        ElTag,
        { type: status.type, size: 'small', disableTransitions: true },
        () => status.label,
      );
    },
  },
  {
    prop: 'priority',
    label: '优先级',
    editable: true,
    component: 'select',
    componentProps: {
      clearable: true,
      options: priorityOptions,
    },
    dependencies: {
      triggerFields: ['status'],
      disabled(values: TaskRow) {
        return values.status === 'done';
      },
    },
    render: (scope) => {
      const priority =
        priorityMap[scope?.row?.priority as string] ?? defaultPriority;
      return h(
        'span',
        { style: { color: priority.color, fontWeight: 600 } },
        priority.label,
      );
    },
  },
  {
    prop: 'amount',
    label: '金额',
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: {
      min: 0,
      step: 100,
      controls: false,
    },
    formatter: (row: TaskRow) =>
      `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'department',
    label: '部门',
    editable: true,
    component: 'select',
    componentProps: {
      options: departments.map((d) => ({ label: d, value: d })),
    },
  },
  {
    prop: 'assignee',
    label: '负责人',
    editable: true,
    component: 'select',
    componentProps: {
      options: ['张三', '李四', '王五', '赵六', '陈七', '周八'].map((a) => ({
        label: a,
        value: a,
      })),
    },
    dependencies: {
      triggerFields: ['department'],
      required(values: TaskRow) {
        return values.status === 'active';
      },
      componentProps(values: TaskRow) {
        const dept = values.department;
        const list = dept ? (departmentAssignees[dept] ?? []) : [];
        return {
          options: list.map((a) => ({ label: a, value: a })),
        };
      },
    },
  },
  {
    prop: 'remark',
    label: '备注',
    editable: true,
    dependencies: {
      triggerFields: ['name'],
      trigger(_values, api: DependencyApi<TaskRow>) {
        api.setFieldValue('remark', '');
      },
    },
  },
];

const tableRules: Record<string, RuleItem | RuleItem[]> = {
  name: [{ required: true, message: '任务名称必填' }],
};

const tableRef = ref<InstanceType<typeof ReTableNext> | null>(null);
const validateOnCellExit = ref(true);

async function handleValidate() {
  const result = await tableRef.value?.validate?.();
  if (result?.valid) {
    ElMessage.success('校验通过');
  } else {
    ElMessage.warning('校验未通过，请查看红框与 tooltip');
    tableRef.value?.scrollToFirstError?.();
  }
}

function handleClearValidation() {
  tableRef.value?.clearValidation?.();
}

const insertRowCount = ref(1);

function handleInsertRow() {
  const ri = tableRef.value?.activeRowIndex ?? -1;
  const count = Math.max(1, insertRowCount.value || 1);
  tableRef.value?.insertRow?.(ri, { _key: buildShortUUID() }, count);
  ElMessage.success(`已插入 ${count} 行`);
}

function handleDeleteRow() {
  const ri = tableRef.value?.activeRowIndex ?? -1;
  if (ri < 0) {
    ElMessage.info('请先选中一行');
    return;
  }
  tableRef.value?.deleteRow?.(ri);
}
</script>

<template>
  <div class="stage5-demo p-4">
    <h2 class="mb-1 text-lg font-semibold">阶段 5 — 单元格联动（Cell Dependencies）</h2>
    <p class="mb-4 text-sm text-gray-500">
      联动禁用、联动赋值、动态下拉选项、动态必填。修改任务名称会清空备注；status=已完成时优先级不可编辑；部门变更时负责人选项过滤；status=进行中时负责人必填。
    </p>

    <div
      class="mb-4 flex flex-wrap items-center rounded-lg border bg-gray-50 p-3 text-sm"
    >
      <el-checkbox v-model="validateOnCellExit">失焦时校验</el-checkbox>
      <el-divider direction="vertical" />
      <el-button size="small" @click="handleValidate">校验全部</el-button>
      <el-button size="small" @click="handleClearValidation">清除校验</el-button>
      <el-divider direction="vertical" />
      <el-input-number
        v-model="insertRowCount"
        :min="1"
        :max="100"
        size="small"
        controls-position="right"
        class="w-24"
      />
      <el-divider direction="vertical" />
      <el-button size="small" @click="handleInsertRow">插入行</el-button>
      <el-button size="small" @click="handleDeleteRow">删除行</el-button>
    </div>

    <re-table-next
      ref="tableRef"
      v-model:data="tableData"
      :columns="columns"
      :rules="tableRules"
      :validate-on-cell-exit="validateOnCellExit"
      editable="cell"
      adaptive
      border
      row-key="id"
    >
      <template #title>
        <span class="text-sm font-medium">单元格联动 Demo</span>
      </template>
      <template #summary>
        <el-tag type="info">
          激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
          {{ (tableRef?.activeColIndex ?? -1) + 1 }}
        </el-tag>
      </template>
    </re-table-next>
  </div>
</template>

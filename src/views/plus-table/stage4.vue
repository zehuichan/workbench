<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { ElMessage, ElTag } from 'element-plus';

import { PlusTable } from '@/components';
import type { PlusTableColumn } from '@/components/re-table-next';
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
const assignees = ['张三', '李四', '王五', '赵六', '陈七', '周八'];

function createRow(i: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  return {
    id: i + 1,
    name: `任务 ${i + 1} — ${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][i % 5]}`,
    status: statuses[i % 3],
    priority: priorities[i % 3],
    amount: 1000 + (i % 20) * 500,
    assignee: assignees[i % assignees.length],
    department: departments[i % departments.length],
    remark: 'remark',
  };
}

const tableData = ref<TaskRow[]>(
  Array.from({ length: 10 }, (_, i) => createRow(i)),
);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const total = computed(() => tableData.value.length);

/** 模拟请求当前页 */
function fetchPage() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

function handlePagination(payload: { currentPage: number; pageSize: number }) {
  currentPage.value = payload.currentPage;
  pageSize.value = payload.pageSize;
  fetchPage();
}

onMounted(() => {
  fetchPage();
});

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

// ──── 列配置（含校验规则）────

const columns: PlusTableColumn<TaskRow>[] = [
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
    rules: [
      { required: true, message: '请输入金额' },
      { type: 'number', min: 0, message: '金额不能为负' },
    ],
  },
  {
    prop: 'assignee',
    label: '负责人',
    editable: true,
    component: 'select',
    componentProps: {
      options: assignees.map((a) => ({ label: a, value: a })),
    },
  },
  {
    prop: 'department',
    label: '部门',
    editable: (row) => row.status !== 'done',
    component: 'select',
    componentProps: {
      options: departments.map((d) => ({ label: d, value: d })),
    },
  },
  {
    prop: 'remark',
    label: '备注',
    editable: true,
  },
];

const tableRules: Record<string, RuleItem | RuleItem[]> = {
  name: [{ required: true, message: '任务名称必填' }],
};

const tableRef = ref<InstanceType<typeof PlusTable> | null>(null);
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
  const selected = tableRef.value?.getSelectionRows?.() ?? [];
  if (selected.length > 0) {
    const indices = selected
      .map((row) => (tableData.value ?? []).indexOf(row as TaskRow))
      .filter((i) => i >= 0);
    tableRef.value?.deleteRow?.(indices);
    tableRef.value?.clearSelection?.();
    ElMessage.success(`已删除 ${selected.length} 行`);
    return;
  }
  const ri = tableRef.value?.activeRowIndex ?? -1;
  if (ri < 0) {
    ElMessage.info('请先选中一行');
    return;
  }
  tableRef.value?.deleteRow?.(ri);
}

function handleDuplicateRow() {
  const selected = tableRef.value?.getSelectionRows?.() ?? [];
  if (selected.length > 0) {
    const indices = selected
      .map((row) => (tableData.value ?? []).indexOf(row as TaskRow))
      .filter((i) => i >= 0);
    tableRef.value?.duplicateRow?.(indices);
    tableRef.value?.clearSelection?.();
    ElMessage.success(`已复制 ${selected.length} 行`);
    return;
  }
  const ri = tableRef.value?.activeRowIndex ?? -1;
  if (ri < 0) {
    ElMessage.info('请先选中一行');
    return;
  }
  tableRef.value?.duplicateRow?.(ri);
}

function handleMoveUp() {
  const ri = tableRef.value?.activeRowIndex ?? -1;
  if (ri < 0) {
    ElMessage.info('请先选中一行');
    return;
  }
  if (ri === 0) {
    ElMessage.info('已在首行');
    return;
  }
  tableRef.value?.moveRow?.(ri, ri - 1);
}

function handleMoveDown() {
  const ri = tableRef.value?.activeRowIndex ?? -1;
  const rowCount = tableData.value.length;
  if (ri < 0) {
    ElMessage.info('请先选中一行');
    return;
  }
  if (ri >= rowCount - 1) {
    ElMessage.info('已在末行');
    return;
  }
  tableRef.value?.moveRow?.(ri, ri + 1);
}

function handleGetModified() {
  const rows = tableRef.value?.getModifiedRows?.() ?? [];
  ElMessage.info(`已修改 ${rows.length} 行`);
}
</script>

<template>
  <div class="stage4-demo p-4">
    <h2 class="mb-1 text-lg font-semibold">阶段 4 — 校验 + 行/列操作</h2>
    <p class="mb-4 text-sm text-gray-500">
      校验（表级 + 列级
      rules）、失焦校验、行增删移复制、列设置面板、脏数据追踪。
    </p>

    <div
      class="mb-4 flex flex-wrap items-center rounded-lg border bg-gray-50 p-3 text-sm"
    >
      <el-checkbox v-model="validateOnCellExit">失焦时校验</el-checkbox>
      <el-divider direction="vertical" />
      <el-button size="small" @click="handleValidate">校验全部</el-button>
      <el-button size="small" @click="handleClearValidation">
        清除校验
      </el-button>
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
      <el-button size="small" @click="handleDuplicateRow">复制行</el-button>
      <el-button size="small" @click="handleMoveUp">上移</el-button>
      <el-button size="small" @click="handleMoveDown">下移</el-button>
      <el-divider direction="vertical" />
      <el-button size="small" @click="handleGetModified">已修改行数</el-button>
    </div>

    <plus-table
      ref="tableRef"
      v-loading="loading"
      v-model:data="tableData"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :columns="columns"
      :rules="tableRules"
      :validate-on-cell-exit="validateOnCellExit"
      editable="cell"
      adaptive
      border
      row-key="id"
      @pagination="handlePagination"
    >
      <template #title>
        <span class="text-sm font-medium">
          校验 + 行/列操作 + 分页（50 条，模拟后端翻页）
        </span>
      </template>
      <template #summary>
        <div class="flex items-center gap-2">
          <el-tag type="info">
            激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
            {{ (tableRef?.activeColIndex ?? -1) + 1 }}
          </el-tag>
          <span class="text-xs text-gray-400">| 列设置按钮在右侧</span>
        </div>
      </template>
    </plus-table>
  </div>
</template>

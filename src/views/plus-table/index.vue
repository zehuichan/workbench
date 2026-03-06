<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { ElMessage, ElProgress, ElTag } from 'element-plus';

import { PlusTable } from '@/components';
import type {
  DependencyApi,
  HotkeyContext,
  PlusTableColumn,
} from '@/components/plus-table';
import type { RuleItem } from 'async-validator';
import { buildShortUUID } from '@/utils';

// ──── 数据类型 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  amount: number;
  assignee: string;
  department: string;
  team: string;
  startDate: string;
  endDate: string;
  remark: string;
  [key: string]: unknown;
}

// ──── 映射与选项 ────

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
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};
const teams = ['前端组', '后端组', 'UI组', '运营组', '增长组'];

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

function createRow(i: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const status = statuses[i % 3]!;
  const dept = departments[i % departments.length]!;
  const assigneesForDept = departmentAssignees[dept] ?? [];
  const a0 = assigneesForDept[0];
  const assignee =
    assigneesForDept[i % Math.max(1, assigneesForDept.length)] ?? a0 ?? '';
  return {
    id: i + 1,
    name: `任务 ${i + 1} — ${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][i % 5]}`,
    status,
    priority: priorities[i % 3]!,
    progress:
      status === 'done' ? 100 : status === 'active' ? 20 + (i % 6) * 15 : 0,
    amount: 1000 + (i % 20) * 500,
    department: dept,
    assignee,
    team: teams[i % teams.length]!,
    startDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
    endDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 15).padStart(2, '0')}`,
    remark: `备注 ${i + 1}`,
  };
}

const tableData = ref<TaskRow[]>(
  Array.from({ length: 30 }, (_, i) => createRow(i)),
);

// ──── 分页 ────

const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const total = computed(() => tableData.value.length);

function fetchPage() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 200);
}

function handlePagination(payload: { currentPage: number; pageSize: number }) {
  currentPage.value = payload.currentPage;
  pageSize.value = payload.pageSize;
  fetchPage();
}

onMounted(() => {
  fetchPage();
});

// ──── 列配置（含 dependencies）────

const columns: PlusTableColumn<TaskRow>[] = [
  { type: 'expand', width: 55 },
  { type: 'selection', width: 55 },
  { type: 'index', label: '#', width: 55, fixed: 'left' },
  {
    prop: 'id',
    label: 'ID',
    editable: false,
    sortable: true,
  },
  {
    prop: 'name',
    label: '任务名称',
    editable: true,
    component: 'input',
    sortable: true,
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
    sortable: true,
    render: (scope: { row: TaskRow }) => {
      const info = statusMap[scope?.row?.status as string] ?? defaultStatus;
      return h(ElTag, { type: info.type, size: 'small' }, () => info.label);
    },
  },
  {
    prop: 'progress',
    label: '进度',
    render: (scope: { row: TaskRow }) =>
      h(ElProgress, {
        percentage: (scope.row as TaskRow).progress,
        status: (scope.row as TaskRow).progress === 100 ? 'success' : undefined,
      }),
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
    render: (scope: { row: TaskRow }) => {
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
    label: '组织信息',
    children: [
      {
        prop: 'department',
        label: '部门',
        editable: (row) => row.status !== 'done',
        component: 'select',
        componentProps: {
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      { prop: 'team', label: '团队' },
    ],
  },
  {
    prop: 'startDate',
    label: '开始日期',
    sortable: true,
  },
  {
    prop: 'endDate',
    label: '截止日期',
    sortable: true,
    renderHeader: ({ column }) =>
      h(
        'span',
        { style: 'color: var(--el-color-danger); font-weight: 600' },
        `⏰ ${column.label}`,
      ),
  },
  {
    prop: 'remark',
    label: '备注',
    editable: true,
    showOverflowTooltip: true,
    dependencies: {
      triggerFields: ['name'],
      trigger(_values, api: DependencyApi<TaskRow>) {
        api.setFieldValue('remark', '');
      },
    },
  },
  {
    prop: '_action',
    label: '操作',
    editable: false,
    fixed: 'right',
  },
];

const tableRules: Record<string, RuleItem | RuleItem[]> = {
  name: [{ required: true, message: '任务名称必填' }],
};

// ──── 状态与控制 ────

const tableRef = ref<InstanceType<typeof PlusTable> | null>(null);
const sortInfo = ref({ prop: '', order: '' });
const cellActive = ref(true);
const rowActive = ref(false);
const hotkeyEnabled = ref(true);
const validateOnCellExit = ref(true);
const editableMode = ref<boolean | 'cell' | 'row' | 'manual'>('cell');
const lastHotkeyLog = ref<string>('—');
const editLog = ref('—');
const insertRowCount = ref(1);

// navigableColumns 中：id=0, name=1, status=2, progress=3, priority=4, amount=5, assignee=6, department=7, team=8, startDate=9, endDate=10, remark=11, _action=12
const NAME_COL_INDEX = 1;
const REMARK_COL_INDEX = 11;

function handleSortChange(payload: { prop: string; order: string }) {
  sortInfo.value = { prop: payload.prop ?? '', order: payload.order ?? '' };
}

const customHotkeys = [
  {
    key: 'ctrl+g',
    handler: (ctx: HotkeyContext) => {
      lastHotkeyLog.value = `Ctrl+G → 行 ${ctx.activeRowIndex + 1} / 列 ${ctx.activeColIndex + 1}`;
    },
    preventDefault: true,
  },
];

function jumpToFirst() {
  tableRef.value?.focusCell?.(0, 0);
}

function jumpToLast() {
  const rowCount = tableData.value.length;
  const navCols = columns.filter((c) => !c.type && c.prop !== '_action');
  tableRef.value?.focusCell?.(rowCount - 1, navCols.length - 1);
}

function onEditStart(payload: {
  rowIndex: number;
  column: { prop?: string };
  value: unknown;
}) {
  editLog.value = `开始编辑：行 ${payload.rowIndex + 1} / ${payload.column.prop} = "${payload.value}"`;
}

function onEditEnd(payload: {
  rowIndex: number;
  column: { prop?: string };
  value: unknown;
}) {
  editLog.value = `结束编辑：行 ${payload.rowIndex + 1} / ${payload.column.prop} = "${payload.value}"`;
}

function onValueChange(payload: {
  rowIndex: number;
  column: { prop?: string };
  oldValue: unknown;
  newValue: unknown;
}) {
  editLog.value = `值变更：行 ${payload.rowIndex + 1} / ${payload.column.prop}："${payload.oldValue}" → "${payload.newValue}"`;
}

async function handleValidate() {
  const result = await tableRef.value?.validate?.();
  if (result?.valid) {
    ElMessage.success('校验通过');
  } else {
    ElMessage.warning('校验未通过');
    tableRef.value?.scrollToFirstError?.();
  }
}

function handleClearValidation() {
  tableRef.value?.clearValidation?.();
}

function handleInsertRow() {
  const ri = tableRef.value?.activeRowIndex ?? -1;
  const count = Math.max(1, insertRowCount.value || 1);
  tableRef.value?.insertRow?.(ri, { _key: buildShortUUID() } as TaskRow, count);
  ElMessage.success(`已插入 ${count} 行`);
}

function handleDeleteRow() {
  const selected = tableRef.value?.getSelectionRows?.() ?? [];
  if (selected.length > 0) {
    const indices = selected
      .map((row) => tableData.value.indexOf(row as TaskRow))
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
      .map((row) => tableData.value.indexOf(row as TaskRow))
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

function handleRowEditName(rowIndex: number) {
  tableRef.value?.focusCell?.(rowIndex, NAME_COL_INDEX);
  tableRef.value?.startEdit?.(rowIndex, NAME_COL_INDEX);
}

function handleRowEditRemark(rowIndex: number) {
  tableRef.value?.focusCell?.(rowIndex, REMARK_COL_INDEX);
  tableRef.value?.startEdit?.(rowIndex, REMARK_COL_INDEX);
}
</script>

<template>
  <div class="plus-table-demo">
    <div class="demo-header">
      <h2 class="title">PlusTable 综合示例</h2>
      <p class="desc">
        基于 el-table
        的增强表格组件，集成：配置式列、render/formatter、多级表头、selection/index/expand、单元格导航与热键、编辑系统（cell/row/manual）、校验与行操作、列设置、脏数据追踪、单元格联动（dependencies）、分页、自适应高度。
      </p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-space wrap :size="12">
        <el-tag size="small">cellActive</el-tag>
        <el-switch v-model="cellActive" size="small" />
        <el-tag size="small">rowActive</el-tag>
        <el-switch v-model="rowActive" size="small" />
        <el-tag size="small">hotkeyEnabled</el-tag>
        <el-switch v-model="hotkeyEnabled" size="small" />
        <el-divider direction="vertical" />
        <span class="label">编辑模式：</span>
        <el-radio-group v-model="editableMode" size="small">
          <el-radio-button value="cell">cell</el-radio-button>
          <el-radio-button value="row">row</el-radio-button>
          <el-radio-button value="manual">manual</el-radio-button>
        </el-radio-group>
        <el-divider direction="vertical" />
        <el-checkbox v-model="validateOnCellExit" size="small"
          >失焦校验</el-checkbox
        >
        <el-button size="small" @click="handleValidate">校验</el-button>
        <el-button size="small" @click="handleClearValidation"
          >清除校验</el-button
        >
        <el-divider direction="vertical" />
        <el-input-number
          v-model="insertRowCount"
          :min="1"
          :max="100"
          size="small"
          controls-position="right"
          class="w-20"
        />
        <el-button size="small" @click="handleInsertRow">插入行</el-button>
        <el-button size="small" @click="handleDeleteRow">删除行</el-button>
        <el-button size="small" @click="handleDuplicateRow">复制行</el-button>
        <el-button size="small" @click="handleMoveUp">上移</el-button>
        <el-button size="small" @click="handleMoveDown">下移</el-button>
        <el-button size="small" @click="handleGetModified"
          >已修改行数</el-button
        >
        <el-divider direction="vertical" />
        <el-button size="small" @click="jumpToFirst">首格</el-button>
        <el-button size="small" @click="jumpToLast">末格</el-button>
        <template v-if="editableMode === 'manual'">
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            size="small"
            :disabled="tableRef?.isEditing"
            @click="tableRef?.startEdit?.()"
          >
            开始编辑
          </el-button>
          <el-button
            type="success"
            size="small"
            :disabled="!tableRef?.isEditing"
            @click="tableRef?.confirmEdit?.()"
          >
            确认
          </el-button>
          <el-button
            size="small"
            :disabled="!tableRef?.isEditing"
            @click="tableRef?.cancelEdit?.()"
          >
            取消
          </el-button>
        </template>
        <el-button
          size="small"
          :disabled="!tableRef?.canUndo"
          @click="tableRef?.undo?.()"
        >
          撤销
        </el-button>
        <el-button
          size="small"
          :disabled="!tableRef?.canRedo"
          @click="tableRef?.redo?.()"
        >
          重做
        </el-button>
      </el-space>
    </div>

    <div class="hint">
      排序：{{
        sortInfo.prop ? `${sortInfo.prop} (${sortInfo.order})` : '无'
      }}
      · 激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
      {{ (tableRef?.activeColIndex ?? -1) + 1 }}
      · 自定义热键：{{ lastHotkeyLog }} · 编辑事件：{{ editLog }}
    </div>

    <PlusTable
      ref="tableRef"
      v-loading="loading"
      v-model:data="tableData"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :columns="columns"
      :rules="tableRules"
      :validate-on-cell-exit="validateOnCellExit"
      :cell-active="cellActive"
      :row-active="rowActive"
      :hotkey-enabled="hotkeyEnabled"
      :hotkeys="customHotkeys"
      :editable="editableMode"
      adaptive
      border
      row-key="id"
      column-setting
      @sort-change="handleSortChange"
      @pagination="handlePagination"
      @cell-edit-start="onEditStart"
      @cell-edit-end="onEditEnd"
      @cell-value-change="onValueChange"
    >
      <template #title>
        <div class="flex items-center gap-2">
          <span class="text-base font-semibold">任务管理</span>
          <el-tag size="small" round>{{ tableData.length }} 条</el-tag>
        </div>
      </template>
      <template #actions>
        <el-space>
          <el-tag v-if="tableRef?.isEditing" type="warning" size="small">
            编辑中
          </el-tag>
        </el-space>
      </template>

      <template #cell-assignee="{ row }">
        <div class="assignee-cell">
          <el-avatar :size="22" class="avatar">
            {{ (row as TaskRow)?.assignee?.charAt(0) ?? '' }}
          </el-avatar>
          <span>{{ (row as TaskRow)?.assignee ?? '' }}</span>
        </div>
      </template>

      <template #header-assignee>
        <span style="color: var(--el-color-primary); font-weight: 600">
          👤 负责人
        </span>
      </template>

      <template #expand="{ row }">
        <div class="expand-content">
          <p><strong>任务：</strong>{{ (row as TaskRow)?.name }}</p>
          <p>
            <strong>时间：</strong>{{ (row as TaskRow)?.startDate }} ~
            {{ (row as TaskRow)?.endDate }}
          </p>
          <p><strong>备注：</strong>{{ (row as TaskRow)?.remark }}</p>
        </div>
      </template>

      <template #editor-remark="scope">
        <el-input
          v-bind="scope"
          placeholder="请输入备注…"
          class="plus-table-cell-editor"
          @keydown.esc.stop.prevent
        />
      </template>

      <template #cell-_action="{ $index }">
        <el-button
          link
          type="primary"
          size="small"
          @click.stop="handleRowEditName($index)"
        >
          编辑名称
        </el-button>
        <el-button
          link
          type="primary"
          size="small"
          @click.stop="handleRowEditRemark($index)"
        >
          编辑备注
        </el-button>
      </template>

      <template #summary>
        <span class="text-xs text-gray-400">
          排序：
          {{ sortInfo.prop ? `${sortInfo.prop} (${sortInfo.order})` : '无' }}
        </span>
      </template>
    </PlusTable>
  </div>
</template>

<style scoped lang="scss">
.plus-table-demo {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.demo-header {
  margin-bottom: 16px;

  .title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .desc {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.6;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;

  .label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
}

.assignee-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .avatar {
    background: var(--el-color-primary-light-3);
    color: #fff;
    font-size: 12px;
  }
}

.expand-content {
  padding: 12px 24px;
  line-height: 1.8;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border-radius: 4px;

  p {
    margin: 0 0 4px;
  }
}
</style>

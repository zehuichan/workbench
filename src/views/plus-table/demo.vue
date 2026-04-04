<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { ElProgress, ElTag } from 'element-plus';

import { PlusTable } from '@/components';
import type {
  DependencyApi,
  HotkeyContext,
  PlusTableColumn,
} from '@/components/plus-table';
import type { RuleItem } from 'async-validator';
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
      return h(
        ElTag,
        { type: info.type, size: 'small', disableTransitions: true },
        () => info.label,
      );
    },
  },
  {
    prop: 'progress',
    label: '进度',
    render: (scope: { row: TaskRow }) => {
      const row = scope.row as TaskRow;
      const p = row.progress;
      return h('div', { class: 'demo-progress-cell' }, [
        h('span', { class: 'demo-progress-cell__pct' }, `${p}%`),
        h(ElProgress, {
          percentage: p,
          strokeWidth: 5,
          showText: false,
          status: p === 100 ? 'success' : undefined,
          style: { width: '76px' },
        }),
      ]);
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
const hotkeyEnabled = ref(true);
const validateOnCellExit = ref(true);
const validateTrigger = ref<'manual' | 'change' | 'blur'>('manual');
const editableMode = ref<boolean | 'cell' | 'row' | 'manual'>('cell');
const lastHotkeyLog = ref<string>('—');
const editLog = ref('—');

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

function handleRowEditName(rowIndex: number) {
  tableRef.value?.focusAndEditByProp?.(rowIndex, 'name');
}

function handleRowEditRemark(rowIndex: number) {
  tableRef.value?.focusAndEditByProp?.(rowIndex, 'remark');
}

// ──── 行操作 ────

function handleInsertRow() {
  const idx = tableRef.value?.activeRowIndex ?? tableData.value.length;
  tableRef.value?.insertRow(idx + 1, createRow(tableData.value.length));
}

function handleDeleteRow() {
  const idx = tableRef.value?.activeRowIndex ?? -1;
  if (idx >= 0) tableRef.value?.deleteRow(idx);
}

function handleDuplicateRow() {
  const idx = tableRef.value?.activeRowIndex ?? -1;
  if (idx >= 0) tableRef.value?.duplicateRow(idx);
}

// ──── 校验 & 脏数据 ────

const validationResult = ref('');

async function handleValidate() {
  const result = await tableRef.value?.validate();
  if (result?.valid) {
    validationResult.value = 'OK';
  } else {
    const count = Object.keys(result?.errors ?? {}).length;
    validationResult.value = `${count} 行有错误`;
    tableRef.value?.scrollToFirstError();
  }
}

function handleResetTracking() {
  tableRef.value?.resetTracking();
}

const dirtyCount = computed(() => {
  const cells = tableRef.value?.getDirtyCells();
  return cells?.size ?? 0;
});

const modifiedRowCount = computed(() => {
  return tableRef.value?.getModifiedRows()?.length ?? 0;
});
</script>

<template>
  <div class="docs-layout__page">
    <header class="docs-layout__hero">
      <h1 class="docs-layout__hero-title">交互示例</h1>
      <p class="docs-layout__hero-lead">
        在表格内双击可编辑、使用键盘导航与快捷键（先点击表格区域聚焦）。完整 API
        与约定见
        <router-link :to="{ name: 'plus-table-docs' }">文档页</router-link>。
      </p>
    </header>

    <div class="docs-layout__toolbar">
      <span class="label">编辑模式</span>
      <el-radio-group v-model="editableMode" size="small">
        <el-radio-button :value="false">只读</el-radio-button>
        <el-radio-button value="cell">cell</el-radio-button>
        <el-radio-button value="row">row</el-radio-button>
        <el-radio-button value="manual">manual</el-radio-button>
        <el-radio-button :value="true">all</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <span class="label">校验时机</span>
      <el-radio-group v-model="validateTrigger" size="small">
        <el-radio-button value="manual">手动</el-radio-button>
        <el-radio-button value="change">change</el-radio-button>
        <el-radio-button value="blur">blur</el-radio-button>
      </el-radio-group>
      <el-checkbox v-model="validateOnCellExit" size="small">
        离格校验
      </el-checkbox>

      <el-divider direction="vertical" />
      <el-checkbox v-model="hotkeyEnabled" size="small">热键</el-checkbox>

      <el-divider direction="vertical" />
      <span class="label">行操作</span>
      <el-button-group size="small">
        <el-button @click="handleInsertRow">插入行</el-button>
        <el-button @click="handleDeleteRow">删除行</el-button>
        <el-button @click="handleDuplicateRow">复制行</el-button>
      </el-button-group>

      <el-divider direction="vertical" />
      <el-button-group size="small">
        <el-button
          :disabled="!tableRef?.canUndo"
          @click="tableRef?.undo()"
        >
          撤销
        </el-button>
        <el-button
          :disabled="!tableRef?.canRedo"
          @click="tableRef?.redo()"
        >
          重做
        </el-button>
      </el-button-group>
      <el-button size="small" type="primary" @click="handleValidate">
        校验
      </el-button>
      <el-button size="small" @click="handleResetTracking">
        重置脏标记
      </el-button>
    </div>

    <div class="demo-statusbar" role="status" aria-live="polite">
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">排序</span>
        {{ sortInfo.prop ? `${sortInfo.prop} (${sortInfo.order})` : '无' }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">激活</span>
        行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
        {{ (tableRef?.activeColIndex ?? -1) + 1 }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">脏数据</span>
        {{ dirtyCount }} 格 / {{ modifiedRowCount }} 行
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">校验</span>
        {{ validationResult || '—' }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">Ctrl+G</span>
        {{ lastHotkeyLog }}
      </span>
      <span class="demo-statusbar__sep" aria-hidden="true">|</span>
      <span class="demo-statusbar__item demo-statusbar__item--grow">
        <span class="demo-statusbar__k">编辑</span>
        {{ editLog }}
      </span>
    </div>

    <el-card class="demo-table-card" shadow="never">
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
        :validate-trigger="validateTrigger"
        :hotkey-enabled="hotkeyEnabled"
        :hotkeys="customHotkeys"
        :editable="editableMode"
        cell-active
        row-active
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
          <div class="demo-table-heading">
            <span class="demo-table-heading__title">任务管理</span>
            <el-tag
              size="small"
              round
              type="info"
              effect="plain"
              :disable-transitions="true"
            >
              {{ tableData.length }} 条
            </el-tag>
          </div>
        </template>
        <template #actions>
          <el-space>
            <el-tag
              v-if="tableRef?.isEditing"
              type="warning"
              size="small"
              :disable-transitions="true"
            >
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
          <span class="demo-col-head--primary">负责人</span>
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
          <span class="demo-table-summary">
            提示：分页为前端全量数据演示；接入服务端时请按页更新 data。
          </span>
        </template>
      </PlusTable>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.demo-statusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  font-variant-numeric: tabular-nums;

  &__k {
    margin-right: 4px;
    font-weight: 600;
    color: var(--el-text-color-regular);
  }

  &__sep {
    margin: 0 6px;
    color: var(--el-border-color);
    user-select: none;
  }

  &__item {
    min-width: 0;

    &--grow {
      flex: 1 1 200px;
    }
  }
}

.demo-table-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 12px;
  }
}

.demo-table-heading {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.demo-col-head--primary {
  color: var(--el-color-primary);
  font-weight: 600;
}

.demo-table-summary {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.demo-progress-cell) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

:deep(.demo-progress-cell__pct) {
  min-width: 2.75rem;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-regular);
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
  padding: 12px 16px;
  line-height: 1.8;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  p {
    margin: 0 0 4px;
  }
}
</style>

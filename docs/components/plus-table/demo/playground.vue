<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { ElButton, ElTag } from 'element-plus';

import { PlusTable } from '@labs/plus-table';
import type {
  CellChangePayload,
  EditMode,
  PlusTableColumn,
  ValidateOn,
} from '@labs/plus-table';

// ──── 数据 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  amount: number;
  department: string;
  assignee: string;
  team: string;
  remark: string;
  [key: string]: unknown;
}

const departments = ['技术部', '产品部', '设计部', '市场部'];
const departmentAssignees: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  产品部: ['王五', '赵六'],
  设计部: ['陈七', '周八'],
  市场部: ['周八', '陈七'],
};
const teams = ['前端组', '后端组', 'UI组', '运营组'];

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

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'success' }> = {
  pending: { label: '待开始', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  done: { label: '已完成', type: 'success' },
};

let nextId = 1;

function createRow(seed: number): TaskRow {
  const statuses: TaskRow['status'][] = ['pending', 'active', 'done'];
  const priorities: TaskRow['priority'][] = ['low', 'medium', 'high'];
  const dept = departments[seed % departments.length]!;
  const candidates = departmentAssignees[dept]!;
  return {
    id: nextId++,
    name: `任务 ${seed + 1} — ${['需求评审', '接口开发', '联调测试', 'UI 走查', '性能优化'][seed % 5]}`,
    status: statuses[seed % 3]!,
    priority: priorities[seed % 3]!,
    amount: 1000 + (seed % 20) * 500,
    department: dept,
    assignee: candidates[seed % candidates.length]!,
    team: teams[seed % teams.length]!,
    remark: `备注 ${seed + 1}`,
  };
}

const allData = ref<TaskRow[]>(Array.from({ length: 30 }, (_, i) => createRow(i)));

// ──── 分页（服务端驱动模拟：父级切片，组件不切片）────

const page = ref(1);
const pageSize = ref(10);
const total = computed(() => allData.value.length);

const pagedData = computed<TaskRow[]>({
  get: () => {
    const start = (page.value - 1) * pageSize.value;
    return allData.value.slice(start, start + pageSize.value);
  },
  // 行结构变更（增删移复制）回传当前页数组，这里合并回全量数据
  set: (rows) => {
    const start = (page.value - 1) * pageSize.value;
    const currentLen = Math.min(
      pageSize.value,
      Math.max(allData.value.length - start, 0),
    );
    const next = [...allData.value];
    next.splice(start, currentLen, ...rows);
    allData.value = next;
  },
});

// ──── 控制状态 ────

const tableRef = ref<InstanceType<typeof PlusTable>>();
const editMode = ref<EditMode>('cell');
const validateOn = ref<ValidateOn>('change');
const changeLog = ref('—');
const validationResult = ref('—');
/** row 模式下处于编辑态的行 id（仅供操作列 UI 切换按钮） */
const editingIds = reactive(new Set<number>());

function onCellChange(payload: CellChangePayload) {
  changeLog.value = `行 ${payload.rowIndex + 1} / ${payload.field}：${JSON.stringify(payload.oldValue)} → ${JSON.stringify(payload.value)}`;
}

async function handleValidate() {
  const result = await tableRef.value?.validate();
  validationResult.value = result?.valid ? 'OK' : `${result?.errors.length} 个错误`;
}

function handleClearValidate() {
  tableRef.value?.clearValidate();
  validationResult.value = '—';
}

function handleInsertRow() {
  tableRef.value?.insertRow(createRow(allData.value.length));
}

// ──── row 模式行编辑 ────

async function saveRow(row: TaskRow, rowIndex: number) {
  const ok = await tableRef.value?.commitRowEdit(rowIndex);
  if (ok) editingIds.delete(row.id);
}

function editRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.startRowEdit(rowIndex);
  editingIds.add(row.id);
}

function cancelRow(row: TaskRow, rowIndex: number) {
  tableRef.value?.cancelRowEdit(rowIndex);
  editingIds.delete(row.id);
}

// ──── 列配置 ────

const columns: PlusTableColumn[] = [
  { field: 'id', title: 'ID', width: 70, fixed: 'left', settingDisabled: true },
  {
    field: 'name',
    title: '任务名称',
    minWidth: 200,
    editable: true,
    editor: 'input',
    required: true,
    rules: [{ min: 2, max: 50, message: '长度 2–50' }],
  },
  {
    field: 'status',
    title: '状态',
    width: 110,
    editable: true,
    editor: { type: 'select', options: statusOptions },
    render: ({ value }) => {
      const info = statusMap[String(value)] ?? { label: '未知', type: 'info' as const };
      return h(ElTag, { type: info.type, size: 'small', disableTransitions: true }, () => info.label);
    },
  },
  {
    field: 'priority',
    title: '优先级',
    width: 110,
    editable: true,
    editor: { type: 'select', options: priorityOptions },
    formatter: (value) =>
      ({ high: '高', medium: '中', low: '低' })[String(value)] ?? '',
    dependencies: {
      triggerFields: ['status'],
      // 已完成的任务不允许再改优先级
      disabled: (row) => row.status === 'done',
    },
  },
  {
    field: 'amount',
    title: '金额',
    align: 'right',
    width: 130,
    editable: true,
    editor: { type: 'number', props: { min: 0, step: 100, controls: false } },
    formatter: (value) => `¥ ${(Number(value) || 0).toLocaleString('zh-CN')}`,
    rules: [{ type: 'number', min: 0, message: '金额不能为负' }],
  },
  {
    title: '组织信息',
    children: [
      {
        field: 'department',
        title: '部门',
        width: 120,
        editable: true,
        editor: {
          type: 'select',
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      {
        field: 'assignee',
        title: '负责人',
        width: 130,
        editable: true,
        editor: { type: 'select' },
        dependencies: {
          triggerFields: ['department'],
          // 进行中的任务必须有负责人
          required: (row) => row.status === 'active',
          // 候选人随部门联动
          componentProps: (row) => ({
            options: (departmentAssignees[row.department as string] ?? []).map(
              (name) => ({ label: name, value: name }),
            ),
          }),
          // 换部门后清空负责人
          trigger: (row, api) => {
            const candidates = departmentAssignees[row.department as string] ?? [];
            if (!candidates.includes(row.assignee as string)) {
              api.setValue('assignee', undefined);
            }
          },
        },
      },
      { field: 'team', title: '团队', width: 110 },
    ],
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: 140,
    editable: true,
  },
  {
    title: '操作',
    width: 190,
    fixed: 'right',
    align: 'center',
    settingDisabled: true,
    render: ({ row, rowIndex }) => {
      const task = row as TaskRow;
      const buttons = [];
      if (editMode.value === 'row') {
        if (editingIds.has(task.id)) {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => saveRow(task, rowIndex) }, () => '保存'),
            h(ElButton, { link: true, size: 'small', onClick: () => cancelRow(task, rowIndex) }, () => '取消'),
          );
        } else {
          buttons.push(
            h(ElButton, { link: true, type: 'primary', size: 'small', onClick: () => editRow(task, rowIndex) }, () => '编辑'),
          );
        }
      }
      buttons.push(
        h(ElButton, { link: true, size: 'small', onClick: () => tableRef.value?.duplicateRow(rowIndex, { id: nextId++ }) }, () => '复制'),
        h(ElButton, { link: true, type: 'danger', size: 'small', onClick: () => tableRef.value?.removeRow(rowIndex) }, () => '删除'),
      );
      return h('span', buttons);
    },
  },
];
</script>

<template>
  <div>
    <div class="demo-toolbar">
      <span class="label">编辑模式</span>
      <el-radio-group v-model="editMode" size="small">
        <el-radio-button value="none">none</el-radio-button>
        <el-radio-button value="cell">cell</el-radio-button>
        <el-radio-button value="row">row</el-radio-button>
        <el-radio-button value="table">table</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <span class="label">校验时机</span>
      <el-radio-group v-model="validateOn" size="small">
        <el-radio-button value="change">change</el-radio-button>
        <el-radio-button value="blur">blur</el-radio-button>
        <el-radio-button value="manual">manual</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />
      <el-button size="small" type="primary" @click="handleValidate">校验</el-button>
      <el-button size="small" @click="handleClearValidate">清除校验</el-button>
      <el-button size="small" @click="handleInsertRow">插入行</el-button>
    </div>

    <div class="demo-statusbar">
      <span class="demo-statusbar__item">
        <span class="demo-statusbar__k">校验</span>{{ validationResult }}
      </span>
      <span class="demo-statusbar__sep">|</span>
      <span class="demo-statusbar__item demo-statusbar__item--grow">
        <span class="demo-statusbar__k">cell-change</span>{{ changeLog }}
      </span>
    </div>

    <PlusTable
      ref="tableRef"
      v-model:data="pagedData"
      v-model:page="page"
      v-model:page-size="pageSize"
      :columns="columns"
      :total="total"
      :edit-mode="editMode"
      :validate-on="validateOn"
      row-key="id"
      column-setting
      settings-key="docs-playground"
      border
      @cell-change="onCellChange"
    >
      <template #toolbar>
        <span class="demo-table-title">任务管理（{{ total }} 条）</span>
      </template>

      <template #header-name>
        <span style="color: var(--el-color-primary)">任务名称</span>
      </template>

      <template #editor-remark="{ value, setValue }">
        <el-input
          :model-value="(value as string)"
          placeholder="自定义编辑器插槽…"
          size="small"
          @update:model-value="setValue"
        />
      </template>
    </PlusTable>
  </div>
</template>

<style scoped lang="scss">
.demo-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--vp-c-text-2, #666);
  }
}

.demo-statusbar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-variant-numeric: tabular-nums;

  &__k {
    margin-right: 4px;
    font-weight: 600;
  }

  &__sep {
    margin: 0 8px;
    color: var(--el-border-color);
  }

  &__item--grow {
    flex: 1 1 200px;
    min-width: 0;
  }
}

.demo-table-title {
  margin-right: auto;
  font-size: 13px;
  font-weight: 600;
}
</style>

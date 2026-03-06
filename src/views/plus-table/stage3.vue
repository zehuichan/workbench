<script setup lang="ts">
import { h, ref } from 'vue';
import { ElTag } from 'element-plus';

import { PlusTable } from '@/components';
import type { PlusTableColumn } from '@/components/re-table-next';

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

// ──── 映射 ────

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
  Array.from({ length: 30 }, (_, i) => createRow(i)),
);

// ──── 列配置 ────

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

const columns: PlusTableColumn<TaskRow>[] = [
  { type: 'index', label: '#', width: 55 },
  {
    prop: 'id',
    label: 'ID',
    width: 65,
    editable: false,
  },
  {
    prop: 'name',
    label: '任务名称',
    minWidth: 200,
    editable: true,
    component: 'input',
  },
  {
    prop: 'status',
    label: '状态',
    width: 130,
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
    width: 130,
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
    width: 130,
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
    prop: 'assignee',
    label: '负责人',
    width: 120,
    editable: true,
    component: 'select',
    componentProps: {
      options: assignees.map((a) => ({ label: a, value: a })),
    },
  },
  {
    prop: 'department',
    label: '部门',
    width: 120,
    editable: (row) => row.status !== 'done',
    component: 'select',
    componentProps: {
      options: departments.map((d) => ({ label: d, value: d })),
    },
  },
  {
    prop: 'remark',
    label: '备注（自定义编辑器）',
    minWidth: 180,
    editable: true,
  },
  {
    prop: '_action',
    label: '操作',
    width: 140,
    editable: false,
  },
];

// ──── 状态 ────

const tableRef = ref<InstanceType<typeof PlusTable> | null>(null);
const editLog = ref('—');

type EditModeValue = boolean | 'cell' | 'row' | 'manual';
const editableMode = ref<EditModeValue>('cell');

const modeOptions: { label: string; value: EditModeValue; desc: string }[] = [
  { label: '关闭', value: false, desc: '不可编辑' },
  { label: 'cell', value: 'cell', desc: '单元格编辑（双击/F2/Enter 进入）' },
  {
    label: 'row',
    value: 'row',
    desc: '行编辑（整行同时可编辑，Tab 行内切换）',
  },
  { label: 'manual', value: 'manual', desc: '手动编辑（仅 API 触发）' },
  {
    label: 'true',
    value: true,
    desc: '整体编辑（所有可编辑列同时显示编辑器）',
  },
];

function onEditStart(payload: any) {
  editLog.value = `开始编辑：行 ${payload.rowIndex + 1} / ${payload.column.prop} = "${payload.value}"`;
}

function onEditEnd(payload: any) {
  editLog.value = `结束编辑：行 ${payload.rowIndex + 1} / ${payload.column.prop} = "${payload.value}"`;
}

function onValueChange(payload: any) {
  editLog.value = `值变更：行 ${payload.rowIndex + 1} / ${payload.column.prop}："${payload.oldValue}" → "${payload.newValue}"`;
}

function handleUndo() {
  tableRef.value?.undo();
}

function handleRedo() {
  tableRef.value?.redo();
}

function handleManualStart() {
  tableRef.value?.startEdit();
}

function handleManualConfirm() {
  tableRef.value?.confirmEdit();
}

function handleManualCancel() {
  tableRef.value?.cancelEdit();
}

/** manual 模式：可编辑列在 navigableColumns 中的索引（index 列被过滤后：id=0, name=1, …, remark=7, _action=8） */
const NAME_COL_INDEX = 1;
const REMARK_COL_INDEX = 7;

function handleRowEditName(rowIndex: number) {
  tableRef.value?.focusCell(rowIndex, NAME_COL_INDEX);
  tableRef.value?.startEdit(rowIndex, NAME_COL_INDEX);
}

function handleRowEditRemark(rowIndex: number) {
  tableRef.value?.focusCell(rowIndex, REMARK_COL_INDEX);
  tableRef.value?.startEdit(rowIndex, REMARK_COL_INDEX);
}
</script>

<template>
  <div class="stage3-demo p-4">
    <h2 class="mb-1 text-lg font-semibold">阶段 3 — 编辑系统</h2>
    <p class="mb-4 text-sm text-gray-500">
      支持 5 种编辑模式：true（整体编辑）/ cell / row / manual /
      false。支持自定义编辑器插槽 <code>#editor-${prop}</code>。
    </p>

    <!-- 控制面板 -->
    <div
      class="mb-4 flex flex-wrap items-center gap-4 rounded-lg border bg-gray-50 p-3 text-sm"
    >
      <span class="font-medium text-gray-600">编辑模式：</span>
      <el-radio-group v-model="editableMode" size="small">
        <el-radio-button
          v-for="opt in modeOptions"
          :key="String(opt.value)"
          :value="opt.value"
        >
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>

      <el-button
        size="small"
        :disabled="!tableRef?.canUndo"
        @click="handleUndo"
      >
        ↶ 撤销
      </el-button>
      <el-button
        size="small"
        :disabled="!tableRef?.canRedo"
        @click="handleRedo"
      >
        ↷ 重做
      </el-button>

      <!-- Manual 模式：工具栏 + 行内编辑入口说明 -->
      <template v-if="editableMode === 'manual'">
        <el-divider direction="vertical" />
        <el-button
          type="primary"
          size="small"
          :disabled="tableRef?.isEditing"
          @click="handleManualStart"
        >
          开始编辑（当前激活格）
        </el-button>
        <el-button
          type="success"
          size="small"
          :disabled="!tableRef?.isEditing"
          @click="handleManualConfirm"
        >
          确认
        </el-button>
        <el-button
          size="small"
          :disabled="!tableRef?.isEditing"
          @click="handleManualCancel"
        >
          取消
        </el-button>
        <span class="text-gray-400">| 或使用行内「编辑名称」「编辑备注」</span>
      </template>
    </div>

    <!-- 模式说明 -->
    <div class="mb-3 text-xs text-gray-400">
      当前模式：
      <span class="font-medium text-gray-600">
        {{ modeOptions.find((o) => o.value === editableMode)?.desc }}
      </span>
    </div>

    <!-- 操作提示 -->
    <div class="mb-3 flex flex-wrap gap-6 text-xs text-gray-500">
      <template v-if="editableMode === true">
        <span>所有可编辑列同时可编辑</span>
        <span>Tab 导航到下一个单元格</span>
        <span>Enter 导航到下一行</span>
        <span>Escape 退出编辑器焦点</span>
        <span>方向键导航（编辑器外）</span>
      </template>
      <template v-else-if="editableMode === 'cell'">
        <span>双击 / F2 / Enter 进入编辑</span>
        <span>直接输入字符覆盖编辑</span>
        <span>Escape 取消</span>
        <span>Tab 确认+右移</span>
        <span>Enter 确认+下移</span>
      </template>
      <template v-else-if="editableMode === 'row'">
        <span>双击 / F2 / Enter 进入行编辑</span>
        <span>Tab 行内切换（不确认）</span>
        <span>Enter 确认整行+下移</span>
        <span>Escape 取消整行</span>
      </template>
      <template v-else-if="editableMode === 'manual'">
        <span>点击「开始编辑」或行内「编辑名称」「编辑备注」进入编辑</span>
        <span>点击「确认」或「取消」退出</span>
      </template>
      <span v-if="editableMode !== false">Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</span>
      <span>ID 列不可编辑</span>
      <span>部门列：状态为"已完成"时不可编辑</span>
      <span>备注列：使用自定义编辑器插槽</span>
    </div>

    <!-- 编辑日志 -->
    <div class="mb-3 text-xs text-gray-400">
      编辑事件：<span class="text-blue-500">{{ editLog }}</span>
    </div>

    <plus-table
      ref="tableRef"
      :data="tableData"
      :columns="columns"
      :editable="editableMode"
      adaptive
      border
      @cell-edit-start="onEditStart"
      @cell-edit-end="onEditEnd"
      @cell-value-change="onValueChange"
    >
      <template #title>
        <span class="text-sm font-medium">可编辑任务列表（30 行）</span>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <el-tag type="info">
            激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
            {{ (tableRef?.activeColIndex ?? -1) + 1 }}
          </el-tag>
          <el-tag v-if="tableRef?.isEditing" type="warning">
            编辑中 ({{ tableRef?.editMode }})
          </el-tag>
        </div>
      </template>

      <!-- 自定义编辑器插槽示例：备注列使用 textarea -->
      <template #editor-remark="scope">
        <el-input
          v-bind="scope"
          placeholder="请输入备注…"
          class="plus-table-cell-editor"
          @keydown.esc.stop.prevent
        />
      </template>

      <!-- manual 模式：行内「编辑」按钮。@click.stop 防止冒泡到 cell-click 导致刚进入的编辑被 confirm 掉 -->
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
    </plus-table>
  </div>
</template>

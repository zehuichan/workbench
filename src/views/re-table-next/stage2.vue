<script setup lang="ts">
import { h, ref } from 'vue';
import { ElTag } from 'element-plus';

import { ReTableNext } from '@/components';
import type { ReTableNextColumn, HotkeyContext } from '@/components/re-table-next';

// ──── 数据类型 ────

interface TaskRow {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
  priority: 'low' | 'medium' | 'high';
  amount: number;
  assignee: string;
  department: string;
  [key: string]: unknown;
}

// ──── 模拟数据 ────

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'success' }> = {
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
  };
}

const tableData = ref<TaskRow[]>(Array.from({ length: 30 }, (_, i) => createRow(i)));

// ──── 列配置 ────

const columns: ReTableNextColumn<TaskRow>[] = [
  { type: 'index', label: '#', width: 55, fixed: 'left' },
  {
    prop: 'id',
    label: 'ID',
    width: 65,
    sortable: true,
  },
  {
    prop: 'name',
    label: '任务名称',
    minWidth: 200,
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    render: (scope) => {
      const status = statusMap[scope?.row?.status as string] ?? defaultStatus;
      return h(ElTag, { type: status.type, size: 'small' }, () => status.label);
    },
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 90,
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
    width: 110,
    align: 'right',
    formatter: (row: TaskRow) =>
      `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'assignee',
    label: '负责人',
    width: 90,
  },
  {
    prop: 'department',
    label: '部门',
    width: 100,
  },
];

// ──── 状态展示 ────

const tableRef = ref<InstanceType<typeof ReTableNext> | null>(null);
const lastHotkeyLog = ref<string>('—');

// ──── 自定义热键 ────

const customHotkeys = [
  {
    key: 'ctrl+g',
    handler: (ctx: HotkeyContext) => {
      lastHotkeyLog.value = `Ctrl+G → 行 ${ctx.activeRowIndex + 1} / 列 ${ctx.activeColIndex + 1}`;
    },
    preventDefault: true,
  },
  {
    key: 'ctrl+shift+home',
    handler: (ctx: HotkeyContext) => {
      ctx.navigate(-Infinity, 0);
      lastHotkeyLog.value = 'Ctrl+Shift+Home → 自定义：跳到首行';
    },
    preventDefault: true,
    override: false,
  },
];

// ──── 控制开关 ────

const cellActive = ref(true);
const rowActive = ref(false);
const tabNavigation = ref(true);
const hotkeyEnabled = ref(true);

function jumpToFirst() {
  tableRef.value?.focusCell(0, 0);
}

function jumpToLast() {
  const rowCount = tableData.value.length;
  tableRef.value?.focusCell(rowCount - 1, columns.filter(c => !c.type).length - 1);
}
</script>

<template>
  <div class="stage2-demo p-4">
    <h2 class="text-lg font-semibold mb-1">阶段 2 — 单元格导航 + 热键</h2>
    <p class="text-sm text-gray-500 mb-4">
      点击任意单元格激活，然后使用方向键 / Tab / Enter / Home / End 导航。
    </p>

    <!-- 控制面板 -->
    <div class="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border text-sm">
      <label class="flex items-center gap-1.5 cursor-pointer">
        <el-switch v-model="cellActive" size="small" />
        <span>cellActive（单元格高亮）</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer">
        <el-switch v-model="rowActive" size="small" />
        <span>rowActive（行高亮）</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer">
        <el-switch v-model="tabNavigation" size="small" />
        <span>tabNavigation（Tab 导航）</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer">
        <el-switch v-model="hotkeyEnabled" size="small" />
        <span>hotkeyEnabled（启用热键）</span>
      </label>
      <el-button size="small" @click="jumpToFirst">跳到首个单元格</el-button>
      <el-button size="small" @click="jumpToLast">跳到末个单元格</el-button>
    </div>

    <!-- 热键说明 -->
    <div class="flex gap-6 mb-3 text-xs text-gray-500 flex-wrap">
      <span>↑↓←→ 方向键导航</span>
      <span>Tab / Shift+Tab 列导航（可配置）</span>
      <span>Enter / Shift+Enter 行导航</span>
      <span>Home / End 行内首尾</span>
      <span>Ctrl+Home / Ctrl+End 全局首尾</span>
      <span>Ctrl+G 自定义热键</span>
    </div>

    <!-- 自定义热键日志 -->
    <div class="mb-3 text-xs text-gray-400">
      自定义热键触发：<span class="text-blue-500">{{ lastHotkeyLog }}</span>
    </div>

    <re-table-next
      ref="tableRef"
      :data="tableData"
      :columns="columns"
      :cell-active="cellActive"
      :row-active="rowActive"
      :tab-navigation="tabNavigation"
      :hotkey-enabled="hotkeyEnabled"
      :hotkeys="customHotkeys"
      border
      stripe
    >
      <template #title>
        <span class="font-medium text-sm">任务列表（30 行）</span>
      </template>
      <template #actions>
        <el-tag size="small" type="info">
          激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
          {{ (tableRef?.activeColIndex ?? -1) + 1 }}
        </el-tag>
      </template>
    </re-table-next>
  </div>
</template>

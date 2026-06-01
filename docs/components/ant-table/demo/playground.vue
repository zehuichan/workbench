<script setup lang="ts">
import { computed, h, ref } from 'vue';

import { Tag, message } from 'ant-design-vue';

import { AntTable } from '@labs/ant-table';
import type {
  AntTableColumn,
  DependencyApi,
  HotkeyContext,
} from '@labs/ant-table';

interface Row {
  id: number;
  name: string;
  category: 'hardware' | 'software' | 'service';
  status: 'pending' | 'active' | 'done';
  price: number;
  qty: number;
  total: number;
  owner: string;
  department: string;
  enabled: boolean;
  [key: string]: unknown;
}

const categoryOptions = [
  { label: '硬件', value: 'hardware' },
  { label: '软件', value: 'software' },
  { label: '服务', value: 'service' },
];

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'default' },
  active: { label: '进行中', color: 'processing' },
  done: { label: '已完成', color: 'success' },
};

const departments = ['技术部', '采购部', '运维部'];
const departmentOwners: Record<string, string[]> = {
  技术部: ['张三', '李四'],
  采购部: ['王五', '赵六'],
  运维部: ['陈七', '周八'],
};

let nextId = 7;
function createRow(i: number): Row {
  const cats: Row['category'][] = ['hardware', 'software', 'service'];
  const states: Row['status'][] = ['pending', 'active', 'done'];
  const dept = departments[i % departments.length]!;
  const price = 500 + (i % 10) * 300;
  const qty = (i % 5) + 1;
  return {
    id: i + 1,
    name: `物料 ${i + 1}`,
    category: cats[i % 3]!,
    status: states[i % 3]!,
    price,
    qty,
    total: price * qty,
    department: dept,
    owner: departmentOwners[dept]![0]!,
    enabled: i % 4 !== 0,
  };
}

const data = ref<Row[]>(Array.from({ length: 6 }, (_, i) => createRow(i)));

const columns: AntTableColumn<Row>[] = [
  {
    title: '#',
    key: 'index',
    width: 50,
    align: 'center',
    fixed: 'left',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
    resizable: true,
    editable: true,
    component: 'input',
    required: true,
    rules: [
      { required: true, message: '名称必填' },
      { min: 2, message: '至少 2 个字' },
    ],
  },
  {
    title: '类别',
    dataIndex: 'category',
    width: 110,
    editable: true,
    component: 'select',
    required: true,
    componentProps: { options: categoryOptions, style: { width: '100%' } },
    customRender: ({ value }) =>
      categoryOptions.find((o) => o.value === value)?.label ?? value,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    editable: true,
    component: 'select',
    componentProps: {
      style: { width: '100%' },
      options: Object.entries(statusMap).map(([value, m]) => ({
        value,
        label: m.label,
      })),
    },
    customRender: ({ value }) => {
      const info = statusMap[value as string] ?? statusMap.pending!;
      return h(Tag, { color: info.color }, () => info.label);
    },
  },
  {
    title: '单价',
    dataIndex: 'price',
    width: 110,
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, style: { width: '100%' } },
    rules: { type: 'number', min: 0, message: '单价需 ≥ 0' },
  },
  {
    title: '数量',
    dataIndex: 'qty',
    width: 110,
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, style: { width: '100%' } },
    // 联动：类别为「服务」时锁定数量为 1 且禁止编辑
    dependencies: {
      triggerFields: ['category'],
      disabled: (row) => row.category === 'service',
      trigger: (row, api) => {
        if (row.category === 'service') api.setFieldValue('qty', 1);
      },
    },
  },
  {
    title: '小计',
    dataIndex: 'total',
    width: 120,
    align: 'right',
    // 联动：单价 / 数量变化时自动计算小计
    dependencies: {
      triggerFields: ['price', 'qty'],
      trigger: (row, api) => {
        api.setFieldValue('total', (row.price || 0) * (row.qty || 0));
      },
    },
    customRender: ({ value }) => `¥ ${(value ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    title: '归属',
    children: [
      {
        title: '部门',
        dataIndex: 'department',
        width: 110,
        editable: true,
        component: 'select',
        componentProps: {
          style: { width: '100%' },
          options: departments.map((d) => ({ label: d, value: d })),
        },
      },
      {
        title: '负责人',
        dataIndex: 'owner',
        width: 120,
        editable: true,
        component: 'select',
        // 联动：负责人选项随部门变化，切换部门时清空并必填
        dependencies: {
          triggerFields: ['department'],
          required: () => true,
          componentProps: (row) => ({
            style: { width: '100%' },
            options: (departmentOwners[row.department] ?? []).map((o) => ({
              label: o,
              value: o,
            })),
          }),
          trigger: (row, api: DependencyApi<Row>) => {
            const list = departmentOwners[row.department] ?? [];
            if (!list.includes(row.owner)) api.setFieldValue('owner', '');
          },
        },
      },
    ],
  },
  {
    title: '启用',
    dataIndex: 'enabled',
    width: 80,
    align: 'center',
    editable: true,
    component: 'switch',
    customRender: ({ value }) => (value ? '是' : '否'),
  },
];

// ──── 控制项 ────

type ModeKey = 'cell' | 'row' | 'all' | 'manual' | 'off';
const mode = ref<ModeKey>('cell');
const editableProp = computed<boolean | 'cell' | 'row' | 'manual'>(() => {
  if (mode.value === 'all') return true;
  if (mode.value === 'off') return false;
  return mode.value;
});

const validateTrigger = ref<'manual' | 'change' | 'blur'>('change');
const hotkeyEnabled = ref(true);
const adaptive = ref(false);
const lastHotkey = ref('—');

const customHotkeys = [
  {
    key: 'ctrl+g',
    preventDefault: true,
    handler: (ctx: HotkeyContext) => {
      lastHotkey.value = `Ctrl+G → 行 ${ctx.activeRowIndex + 1} / 列 ${ctx.activeColIndex + 1}`;
    },
  },
];

// ──── 实例 & 行选择 ────

const tableRef = ref<InstanceType<typeof AntTable> | null>(null);
const selectedRowKeys = ref<number[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => (selectedRowKeys.value = keys),
}));

const dirtyCount = computed(() => tableRef.value?.getDirtyCells()?.size ?? 0);

function addRow(): void {
  tableRef.value?.insertRow(undefined, createRow(nextId++ - 1));
}

function removeSelected(): void {
  const keys = new Set(selectedRowKeys.value);
  const indices = data.value
    .map((r, i) => (keys.has(r.id) ? i : -1))
    .filter((i) => i >= 0);
  if (!indices.length) {
    message.info('请先勾选行');
    return;
  }
  tableRef.value?.deleteRow(indices);
  selectedRowKeys.value = [];
}

async function validateAll(): Promise<void> {
  const res = await tableRef.value?.validate();
  if (res?.valid) {
    message.success('校验通过');
  } else {
    message.error('存在校验错误');
    tableRef.value?.scrollToFirstError();
  }
}

function showModified(): void {
  const rows = tableRef.value?.getModifiedRows() ?? [];
  message.info(`已修改 ${rows.length} 行`);
}
</script>

<template>
  <div class="atbl-demo">
    <div class="atbl-demo__toolbar">
      <a-radio-group v-model:value="mode" button-style="solid" size="small">
        <a-radio-button value="cell">单元格</a-radio-button>
        <a-radio-button value="row">行编辑</a-radio-button>
        <a-radio-button value="all">全量</a-radio-button>
        <a-radio-button value="manual">手动</a-radio-button>
        <a-radio-button value="off">只读</a-radio-button>
      </a-radio-group>

      <a-divider type="vertical" />
      <span class="atbl-demo__label">校验</span>
      <a-radio-group
        v-model:value="validateTrigger"
        button-style="solid"
        size="small"
      >
        <a-radio-button value="manual">手动</a-radio-button>
        <a-radio-button value="change">change</a-radio-button>
        <a-radio-button value="blur">blur</a-radio-button>
      </a-radio-group>

      <a-divider type="vertical" />
      <a-button size="small" @click="addRow">新增行</a-button>
      <a-button
        size="small"
        danger
        :disabled="!selectedRowKeys.length"
        @click="removeSelected"
      >
        删除选中
      </a-button>
      <a-button
        v-if="mode === 'manual'"
        size="small"
        @click="tableRef?.startEdit()"
      >
        编辑当前格
      </a-button>

      <a-divider type="vertical" />
      <a-button size="small" :disabled="!tableRef?.canUndo" @click="tableRef?.undo()">
        撤销
      </a-button>
      <a-button size="small" :disabled="!tableRef?.canRedo" @click="tableRef?.redo()">
        重做
      </a-button>
      <a-button size="small" type="primary" @click="validateAll">校验</a-button>
      <a-button size="small" @click="showModified">查看已改行</a-button>

      <a-divider type="vertical" />
      <a-checkbox v-model:checked="hotkeyEnabled">热键</a-checkbox>
      <a-checkbox v-model:checked="adaptive">自适应高度</a-checkbox>
    </div>

    <div class="atbl-demo__status">
      <span>
        激活：行 {{ (tableRef?.activeRowIndex ?? -1) + 1 }} / 列
        {{ (tableRef?.activeColIndex ?? -1) + 1 }}
      </span>
      <span class="atbl-demo__sep">|</span>
      <span>脏数据：{{ dirtyCount }} 格</span>
      <span class="atbl-demo__sep">|</span>
      <span>Ctrl+G：{{ lastHotkey }}</span>
    </div>

    <AntTable
      ref="tableRef"
      v-model:dataSource="data"
      :columns="columns"
      :editable="editableProp"
      :validate-trigger="validateTrigger"
      :hotkey-enabled="hotkeyEnabled"
      :hotkeys="customHotkeys"
      :adaptive="adaptive"
      :scroll-x="1080"
      :row-selection="rowSelection"
      row-key="id"
      column-setting-key="docs-ant-table-demo"
      bordered
      size="middle"
      validate-on-cell-exit
    >
      <template #title>
        <span class="atbl-demo__title">采购清单</span>
      </template>
    </AntTable>

    <p class="atbl-demo__hint">
      点击单元格聚焦后：方向键移动 · 双击 / F2 进入编辑 · Enter 确认并下移 · Tab
      右移 · Delete 清空 · Ctrl+Z / Ctrl+Shift+Z 撤销重做 · Ctrl+G 自定义热键 ·
      右键表头可隐藏列或打开列设置。
    </p>
  </div>
</template>

<style scoped>
.atbl-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.atbl-demo__label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.atbl-demo__status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}
.atbl-demo__sep {
  color: var(--vp-c-divider);
}
.atbl-demo__title {
  font-weight: 600;
}
.atbl-demo__hint {
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--vp-c-text-3);
}
</style>

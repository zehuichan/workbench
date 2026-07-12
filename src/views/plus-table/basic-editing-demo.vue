<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'BasicEditingDemo' });

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
  dueDate: string;
  enabled: boolean;
}

const data = ref<Row[]>([
  {
    id: 1,
    name: '需求评审',
    amount: 1200,
    status: 'todo',
    dueDate: '2026-07-20',
    enabled: true,
  },
  {
    id: 2,
    name: '接口开发',
    amount: 3400,
    status: 'doing',
    dueDate: '2026-07-25',
    enabled: true,
  },
  {
    id: 3,
    name: '联调测试',
    amount: 800,
    status: 'done',
    dueDate: '2026-07-30',
    enabled: false,
  },
]);

const statusOptions = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '完成', value: 'done' },
];

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 140,
    editable: true,
    editor: 'input',
  },
  {
    prop: 'amount',
    label: '金额',
    width: 120,
    align: 'right',
    editable: true,
    editor: {
      type: 'input-number',
      props: { min: 0, step: 100, controls: false },
    },
    formatter: (row: Row) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    editable: true,
    editor: {
      type: 'select',
      props: { options: statusOptions, clearable: true },
    },
    formatter: (row: Row) =>
      statusOptions.find((o) => o.value === row.status)?.label ?? row.status,
  },
  {
    prop: 'dueDate',
    label: '截止日期',
    width: 160,
    editable: true,
    editor: {
      type: 'date-picker',
      props: { type: 'date', valueFormat: 'YYYY-MM-DD' },
    },
  },
  {
    prop: 'enabled',
    label: '启用',
    width: 90,
    align: 'center',
    editable: true,
    editor: 'switch',
  },
];
</script>

<template>
  <DemoPage width="wide">
    <header class="demo__header">
      <h1 class="demo__title">基础编辑</h1>
      <p class="demo__desc">
        展示 <code>editMode="cell"</code>：双击或
        <kbd>Enter</kbd>/<kbd>F2</kbd>/可打印字符进入编辑，方向键在格间移动。本页覆盖内置编辑器
        <code>input</code> / <code>input-number</code> / <code>select</code> /
        <code>date-picker</code> / <code>switch</code>。
      </p>
    </header>

    <div class="demo__api">
      <h2 class="demo__api-title">PlusTable Props（本页用到）</h2>
      <table class="demo__table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>data</code> / <code>v-model:data</code></td>
            <td><code>T[]</code></td>
            <td>必填。表格数据；编辑经 <code>update:data</code> 回写。</td>
          </tr>
          <tr>
            <td><code>columns</code></td>
            <td><code>PlusTableColumnDef[]</code></td>
            <td>必填。列配置（可编辑、编辑器、格式化等）。</td>
          </tr>
          <tr>
            <td><code>row-key</code></td>
            <td><code>keyof T | (row) =&gt; string | number</code></td>
            <td>必填。行唯一标识。</td>
          </tr>
          <tr>
            <td><code>edit-mode</code></td>
            <td><code>'none' | 'cell' | 'row' | 'table'</code></td>
            <td>默认 <code>cell</code>。本页为单元格进编。</td>
          </tr>
        </tbody>
      </table>

      <h2 class="demo__api-title">Column 关键字段</h2>
      <table class="demo__table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>prop</code></td>
            <td><code>string</code></td>
            <td>字段名；特殊列可用 <code>type: 'index' | 'selection' | …</code>。</td>
          </tr>
          <tr>
            <td><code>editable</code></td>
            <td><code>boolean | (ctx) =&gt; boolean</code></td>
            <td>是否可编辑。</td>
          </tr>
          <tr>
            <td><code>editor</code></td>
            <td>
              <code>BuiltinEditorType | Component | EditorConfig</code>
            </td>
            <td>
              内置：<code>input</code> /
              <code>textarea</code> / <code>input-number</code> /
              <code>select</code> / <code>date-picker</code> /
              <code>time-picker</code> / <code>switch</code> /
              <code>checkbox</code>；或
              <code>{ type, props }</code>。
            </td>
          </tr>
          <tr>
            <td><code>formatter</code></td>
            <td>el-table 同名</td>
            <td>展示态格式化（编辑器用原始值）。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <DemoBlock>
      <p class="demo__hint">
        单击选中格子 → 方向键移动；双击或按 Enter 进编；select / switch
        选值后会自动提交并把焦点交回网格，可继续用方向键。
      </p>
      <PlusTable
        v-model:data="data"
        :columns="columns"
        row-key="id"
        edit-mode="cell"
        border
      />
    </DemoBlock>
  </DemoPage>
</template>


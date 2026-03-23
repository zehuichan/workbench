# PlusTable

基于 Element Plus `el-table` 的增强表格：配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动（dependencies）、脏数据追踪、分页与自适应高度。

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components';
import type { PlusTableColumn } from '@/components/plus-table';

interface Row {
  id: number;
  name: string;
}

const data = ref<Row[]>([{ id: 1, name: '示例' }]);
const columns: PlusTableColumn<Row>[] = [
  { type: 'selection', width: 48 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', editable: true, component: 'input' },
];
</script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `T[]` | `[]` | 表格数据，支持 `v-model:data` |
| `columns` | `PlusTableColumn[]` | `[]` | 列配置（见下文） |
| `rowKey` | `string \| (row) => string \| number` | — | 与 `el-table` 一致 |
| `stripe` | `boolean` | `false` | 斑马纹 |
| `border` | `boolean` | `true` | 边框 |
| `showOverflowTooltip` | `boolean` | `true` | 单元格溢出 tooltip |
| `maxHeight` | `string \| number` | — | 固定最大高度；未设且开启 `adaptive` 时由自适应计算 |
| `cellActive` | `boolean` | `true` | 是否高亮当前激活单元格 |
| `rowActive` | `boolean` | `true` | 是否高亮当前激活行 |
| `editable` | `boolean \| 'cell' \| 'row' \| 'manual'` | `false` | 编辑模式：`cell` 双击进入；`row` 行编辑；`manual` 需调用 `startEdit` |
| `rules` | `Record<string, RuleItem \| RuleItem[]>` | — | 表级校验（async-validator），按列 `prop` 聚合 |
| `validateTrigger` | `'change' \| 'blur' \| 'manual'` | `manual` | 校验触发时机 |
| `validateOnCellExit` | `boolean` | `false` | 离开单元格（确认编辑）时是否校验 |
| `columnSetting` | `boolean` | `true` | 是否显示列设置（显隐、排序、列宽，可本地持久化） |
| `hotkeyEnabled` | `boolean` | `true` | 是否启用表格内键盘导航与内置热键 |
| `hotkeys` | `HotkeyBinding[]` | — | 自定义热键（见下文） |
| `currentPage` / `pageSize` | `number` | — | 分页，需配合 `v-model` 与 `total` |
| `total` | `number` | — | **传入即启用底部分页条**。数据应由父组件按当前页传入（服务端分页）；组件不对 `data` 做切片 |
| `pageSizes` / `paginationLayout` | — | — | 分页器配置，见 `plus-table-pagination.vue` |
| `adaptive` | `boolean \| AdaptiveConfig` | `true` | 自适应剩余视口高度为 `maxHeight`；`false` 关闭。`AdaptiveConfig`：`offsetTop`、`offsetBottom`、`excludeSelectors` |

未在表中列出的属性通过 `v-bind="$attrs"` 传给 `el-table`（如 `sort-change`、`default-sort` 等）。

## 事件

| 事件 | 载荷 | 说明 |
|------|------|------|
| `update:data` | `T[]` | 数据变更（编辑、行操作等） |
| `cell-edit-start` / `cell-edit-end` | `{ rowIndex, column, value }` | 单元格进入/退出编辑 |
| `cell-value-change` | `{ rowIndex, column, oldValue, newValue }` | 单元格值变化 |
| `update:currentPage` / `update:pageSize` | `number` | 分页同步 |
| `pagination` | `{ currentPage, pageSize }` | 页码或每页条数变化，用于拉取数据 |

`el-table` 原生事件（如 `sort-change`）可直接监听。

## 插槽

| 插槽 | 说明 |
|------|------|
| `title` | 顶部左侧标题区 |
| `actions` | 顶部右侧，与列设置按钮同排 |
| `summary` | 底部左侧（与分页同排） |
| `pagination` | 覆盖默认分页器；默认在 `total != null` 时显示内置分页 |
| `expand` | `type: 'expand'` 列展开内容 |
| `append` / `empty` | 透传 `el-table` |
| `cell-${prop}` | 按列 `prop` 自定义**展示**单元格 |
| `header-${prop}` | 自定义表头 |
| `editor-${prop}` | 按列自定义**编辑器**（需该列 `editable`） |

## 列配置 `PlusTableColumn`

在 Element Plus `TableColumnCtx` 基础上扩展常用字段：

- `hidden`：列设置中可隐藏。
- `editable`：是否可编辑，可为 `(row) => boolean`。
- `component`：编辑组件标识或组件，内置映射见 `adapter.ts`（如 `input`、`select`、`input-number`）。
- `componentProps`：编辑组件 props，或 `(row, column) => props`。
- `rules` / `required`：列级校验（可与表级 `rules` 合并）。
- `render`：展示态 VNode `(ctx: CellContext) => VNode`。
- `formatter`：与 `el-table-column` 一致。
- `renderHeader`：自定义表头（无 `header-${prop}` 插槽时）。
- `dependencies`：单元格联动（见下节）。
- `children`：多级表头。

特殊 `type`：`selection`、`index`、`expand` 与 `el-table-column` 一致。

## 单元格联动 `dependencies`

```ts
dependencies: {
  triggerFields: ['department'], // 当这些字段变化时重算
  disabled: (values, api) => false,
  required: (values, api) => values.status === 'active',
  rules: (values, api) => [{ required: true, message: '...' }],
  componentProps: (values, api) => ({ options: [...] }),
  trigger: (values, api) => { api.setFieldValue('remark', ''); },
}
```

`DependencyApi` 提供 `rowIndex`、`row`、`column`、`getFieldValue`、`setFieldValue`。

## 暴露方法（`ref`）

常用：`validate`、`clearValidation`、`scrollToFirstError`、`focusCell`、`focusAndEditByProp`、`getColIndexByProp`、`startEdit`、`confirmEdit`、`cancelEdit`、`insertRow`、`deleteRow`、`moveRow`、`duplicateRow`、`getModifiedRows`、`undo` / `redo`、`clearSelection`、`getSelectionRows`、`getElTable`（原生实例）等，完整列表见 `plus-table.vue` 中 `defineExpose`。

行操作的下标均为**当前 `data` 数组下标**（与服务端分页时「仅含当前页数据」的约定一致）。

## 内置键盘行为

表格容器需获得焦点（点击表格区域）后生效。

- **方向键**：移动激活单元格；`all` 编辑模式下会跟随聚焦编辑器。
- **Tab / Shift+Tab**：横向移动；编辑中在 `row` 模式下行内循环，在 `cell`/`manual` 模式下先确认再移动。
- **Enter**：非编辑时若可编辑则进入编辑，否则换行；编辑时确认并移动到下一行（Shift 反向）。
- **Esc**：编辑中取消；`all` 模式下退出编辑器焦点到表格。
- **Home / End**：行首/行尾单元格；`Ctrl+Home` / `Ctrl+End` 为全表首尾。
- **F2**：进入编辑（自动触发模式）。
- **Delete / Backspace**：清空可编辑单元格（自动触发模式）。
- **Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y**：撤销 / 重做（受 `canUndo` / `canRedo` 约束）。
- 可打印字符：在自动触发模式下可直接开编并填入首字符。

自定义热键：`{ key: 'ctrl+g', handler: (ctx) => {...}, preventDefault?: boolean, override?: boolean, when?: (ctx) => boolean }`。`override: true` 时优先于内置处理。

## 分页

设置 `total` 后出现分页条；`pagination` 与 `update:currentPage` / `update:pageSize` 在页码或每页条数变化时触发。**请将当前页数据通过 `data` 传入**，组件内部不对数据进行分页切片。

## 样式与类名

单元格/行会按需添加 `plus-table-cell--active`、`plus-table-row--active`、`plus-table-cell--error`、`plus-table-cell--dirty`、`plus-table-row--dirty` 等类，可用全局样式覆盖。

## 类型导出

```ts
import type {
  PlusTableColumn,
  PlusTableProps,
  PlusTableContext,
  DependencyApi,
  ColumnDependencies,
  HotkeyBinding,
  HotkeyContext,
  AdaptiveConfig,
} from '@/components/plus-table';
```

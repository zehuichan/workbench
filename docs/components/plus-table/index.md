---
title: PlusTable
description: 基于 Element Plus el-table 的增强表格
---

# PlusTable

基于 Element Plus `el-table` 的增强表格：配置式列、可编辑单元格、键盘导航与热键、校验、行增删改与撤销重做、列设置持久化、单元格联动（dependencies）、脏数据追踪、分页与自适应高度。

<demo src="./demo/basic.vue" description="配置式列 + cell 编辑模式，双击单元格即可编辑。">基础用法</demo>

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

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

## 综合示例

涵盖编辑模式切换、校验、行操作、撤销重做、脏数据追踪、单元格联动、分页、列设置等能力。先点击表格区域聚焦，再用键盘导航与快捷键。

<demo src="./demo/playground.vue" description="完整功能演示：双击编辑、键盘导航、热键、校验、行操作与分页。">交互示例</demo>

## Props

未列出的属性通过 `v-bind="$attrs"` 透传给 `el-table`（如 `sort-change`）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `T[]` | `[]` | 表格数据，支持 `v-model:data` |
| `columns` | `PlusTableColumn[]` | `[]` | 列配置 |
| `rowKey` | `string \| (row) => string \| number` | — | 与 `el-table` 一致 |
| `stripe` / `border` / `showOverflowTooltip` | `boolean` | `false` / `true` / `true` | 展示相关 |
| `maxHeight` | `string \| number` | — | 固定最大高度；未设且开启 adaptive 时由自适应计算 |
| `cellActive` / `rowActive` | `boolean` | `true` | 是否高亮当前激活单元格 / 行 |
| `editable` | `boolean \| 'cell' \| 'row' \| 'manual'` | `false` | cell 双击进入；row 行编辑；manual 需 startEdit |
| `rules` | `Record<string, RuleItem \| RuleItem[]>` | — | 表级校验（async-validator），按列 prop 聚合 |
| `validateTrigger` | `'change' \| 'blur' \| 'manual'` | `manual` | 校验触发时机 |
| `validateOnCellExit` | `boolean` | `false` | 离开单元格（确认编辑）时是否校验 |
| `columnSetting` | `boolean` | `true` | 列设置（显隐、排序、列宽，可本地持久化） |
| `hotkeyEnabled` / `hotkeys` | `boolean` / `HotkeyBinding[]` | `true` / — | 键盘导航与自定义热键 |
| `currentPage` / `pageSize` / `total` | `number` | — | 传入 total 即启用底部分页；data 须由父组件按页传入，组件不切片 |
| `pageSizes` / `paginationLayout` | — | — | 分页器配置，见 `plus-table-pagination.vue` |
| `adaptive` | `boolean \| AdaptiveConfig` | `false` | 视口自适应 maxHeight；AdaptiveConfig：offsetTop、offsetBottom、excludeSelectors |
| `columnSettingKey` | `string` | `'plus-table-default'` | 列设置持久化 key；多实例时需各自不同，否则互相覆盖 |

## 事件

`el-table` 原生事件（如 `sort-change`）可直接监听。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:data` | `T[]` | 数据变更（编辑、行操作等） |
| `cell-edit-start` / `cell-edit-end` | `{ rowIndex, column, value }` | 单元格进入 / 退出编辑 |
| `cell-value-change` | `{ rowIndex, column, oldValue, newValue }` | 单元格值变化 |
| `update:currentPage` / `update:pageSize` | `number` | 分页同步 |
| `pagination` | `{ currentPage, pageSize }` | 页码或每页条数变化，用于拉取数据 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `title` | 顶部左侧标题区 |
| `actions` | 顶部右侧，与列设置按钮同排 |
| `summary` | 底部左侧（与分页同排） |
| `pagination` | 覆盖默认分页器；`total != null` 时默认显示内置分页 |
| `expand` | `type: 'expand'` 列的展开内容 |
| `append` / `empty` | 透传 `el-table` |
| `cell-${prop}` | 按列 prop 自定义展示单元格 |
| `header-${prop}` | 自定义表头 |
| `editor-${prop}` | 按列自定义编辑器（需该列 editable） |

## 列配置 PlusTableColumn

- `hidden`：列设置中可隐藏。
- `editable`：是否可编辑，可为 `(row) => boolean`。
- `component`：编辑组件标识或组件，内置映射见 `adapters/index.ts`（input、input-number、select、date-picker、switch、time-picker、time-select）。
- `componentProps`：编辑组件 props，或 `(row, column) => props`。
- `rules` / `required`：列级校验（可与表级 `rules` 合并）。
- `render`：展示态 VNode `(ctx: CellContext) => VNode`。
- `formatter`：与 `el-table-column` 一致。
- `renderHeader`：自定义表头（无 `header-${prop}` 插槽时）。
- `dependencies`：单元格联动（见下节）。
- `children`：多级表头。
- 特殊 `type`：`selection`、`index`、`expand`。

## 编辑模式

`editable` prop 决定表格的编辑行为，支持 5 种模式：

- `false`（默认）：只读模式，不可编辑。
- `'cell'`：单元格模式，双击 / F2 / 可打印字符进入编辑，Enter 确认并下移，Esc 取消，Tab 横移并确认。
- `'row'`：行模式，同一行所有可编辑列同时进入编辑态；Tab 在行内循环而非确认；切换到其他行时整行确认。
- `'manual'`：手动模式，需通过 `startEdit(rowIndex, colIndex)` 或 `focusAndEditByProp(rowIndex, prop)` 触发，不响应双击或 F2。
- `true`：全量模式（all），所有可编辑单元格始终展示编辑器，无需进入/退出编辑。方向键和 Tab 直接在编辑器间移动焦点。

编辑支持 **Ctrl+Z / Ctrl+Shift+Z** 撤销重做（最多 50 步），undo/redo 后脏标记自动同步。

## 单元格联动 dependencies

`DependencyApi` 提供 `rowIndex`、`row`、`column`、`getFieldValue`、`setFieldValue`。

```ts
dependencies: {
  triggerFields: ['department'],
  disabled: (values, api) => false,
  required: (values, api) => values.status === 'active',
  rules: (values, api) => [{ required: true, message: '...' }],
  componentProps: (values, api) => ({ options: [...] }),
  trigger: (values, api) => { api.setFieldValue('remark', ''); },
}
```

## 脏数据追踪

组件内部自动维护一份基线快照（data 首次非空值的深拷贝），编辑后通过对比判断哪些单元格被修改。脏单元格左上角显示红色三角角标（`plus-table-cell--dirty`），脏行加 `plus-table-row--dirty`。

- `markDirty(rowIndex, prop)`：手动标记（通常由编辑系统自动调用）。
- `clearDirty(rowIndex?, prop?)`：清除脏标记；无参清空全部，仅 rowIndex 清该行，rowIndex + prop 清单格。
- `resetTracking()`：将当前 data 作为新基线，清空所有脏标记。
- `getModifiedRows()`：返回至少有一个脏单元格的行数据数组。
- `getDirtyCells()`：返回所有脏单元格 key 集合（格式 `rowIndex:prop`）。
- `isCellDirty(rowIndex, prop)` / `isRowDirty(rowIndex)`：单格 / 行级查询。

## 暴露方法（ref）

- **导航**：`navigate`、`focusCell`、`getColIndexByProp`、`focusAndEditByProp`、`activeRowIndex`、`activeColIndex`、`activeRow`、`activeColumn`
- **编辑**：`startEdit`、`confirmEdit`、`cancelEdit`、`editMode`、`isEditing`
- **校验**：`validate(rows?)`、`validateField(rowIndex, prop)`、`clearValidation(rowIndex?, prop?)`、`scrollToFirstError()`
- **行操作**：`insertRow(index?, defaultRow?, count?)`、`deleteRow(index?)`、`moveRow(from, to)`、`duplicateRow(index?)`
- **脏数据**：`markDirty`、`clearDirty`、`resetTracking`、`getModifiedRows`、`getDirtyCells`、`isCellDirty`、`isRowDirty`
- **撤销重做**：`undo`、`redo`、`canUndo`、`canRedo`、`clearHistory`
- **列操作**：`toggleColumn`、`reorderColumns`、`setColumnWidth`、`resetColumns`
- **el-table 透传**：`getElTable`、`clearSelection`、`getSelectionRows`、`toggleRowSelection`、`toggleAllSelection`、`doLayout`、`sort`、`scrollTo` 等

行操作下标均为**当前 data 数组下标**（与服务端分页时「仅含当前页数据」一致）。

## 内置键盘行为

表格容器需获得焦点（点击表格区域）后生效。

- **方向键**：移动激活单元格。
- **Tab / Shift+Tab**：横向移动；编辑中在 row 模式下行内循环。
- **Enter / Esc**：进入编辑或换行；取消编辑。
- **Home / End**：行首或行尾格；**Ctrl+Home / Ctrl+End**：全表首尾。
- **F2**、**Delete / Backspace**：进入编辑或清空（自动触发模式）。
- **Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y**：撤销 / 重做。
- 可打印字符：自动触发模式下可直接开编并填入首字符。

自定义热键：`{ key, handler, preventDefault?, override?, when? }`；`override: true` 时优先于内置处理。

## 分页

设置 `total` 后出现分页条。**请将当前页数据通过 data 传入**，组件内部不对数据进行分页切片。`pagination` 与 `update:currentPage` / `update:pageSize` 在变化时触发，用于请求接口。

> 综合示例为客户端全量数据，仅用于演示分页条 UI 与事件；接入服务端时请按页更新 `data`。

## 样式类名

`plus-table-cell--active`、`plus-table-row--active`、`plus-table-cell--error`、`plus-table-cell--dirty`、`plus-table-row--dirty` 等，可用全局样式覆盖。

## 类型导出

```ts
// 公共 API（从 index.ts 导出）
import { PlusTable, PLUS_TABLE_INJECTION_KEY } from '@labs/plus-table';
import type {
  PlusTableColumn,
  PlusTableProps,
  RowData,
  CellContext,
  DependencyApi,
  DependencyState,
  ColumnDependencies,
  HotkeyBinding,
  HotkeyContext,
  AdaptiveConfig,
  PaginationPayload,
} from '@labs/plus-table';

// 内部类型（子组件 inject 用）
import type { PlusTableContext } from '@labs/plus-table/types';
```

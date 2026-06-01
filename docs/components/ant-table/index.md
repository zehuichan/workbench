---
title: AntTable
description: 基于 Ant Design Vue a-table 的增强表格
---

# AntTable

基于 Ant Design Vue `a-table` 的增强表格，沿用 antd 原生列式 API（`columns` 数组、`dataIndex`/`title`、`customRender`）：可编辑单元格、仿 Excel 键盘导航与热键、行/单元格校验、单元格联动（dependencies）、行增删改与撤销重做、列设置持久化、脏数据追踪、服务端分页与自适应高度。

与 [PlusTable](/components/plus-table) 能力对齐，区别仅在底层 UI 库与 API 风格：PlusTable 用 Element Plus + `el-table-column` 配置，AntTable 用 Ant Design Vue + `columns` 数组。

<demo src="./demo/basic.vue" description="配置式列 + cell 编辑模式，双击单元格即可编辑。">基础用法</demo>

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { AntTable } from '@labs/ant-table';
import type { AntTableColumn } from '@labs/ant-table';

interface Row {
  id: number;
  name: string;
}

const data = ref<Row[]>([{ id: 1, name: '示例' }]);
const columns: AntTableColumn<Row>[] = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '名称', dataIndex: 'name', editable: true, component: 'input' },
];
</script>

<template>
  <AntTable v-model:dataSource="data" :columns="columns" row-key="id" bordered editable="cell" />
</template>
```

## 综合示例

涵盖编辑模式切换、校验时机、热键、行操作、撤销重做、脏数据追踪、单元格联动、多级表头、列设置等能力。先点击表格区域聚焦，再用键盘导航与快捷键。

<demo src="./demo/playground.vue" description="完整功能演示：双击编辑、键盘导航、热键、校验、联动与行操作。">交互示例</demo>

## Props

未列出的属性通过 `v-bind="$attrs"` 透传给 `a-table`（如 `row-selection`、`loading`、`sticky` 等）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataSource` | `T[]` | `[]` | 表格数据，支持 `v-model:dataSource` |
| `columns` | `AntTableColumn[]` | `[]` | 列配置 |
| `rowKey` | `string \| (row) => string \| number` | — | 与 `a-table` 一致，行选择/编辑均依赖它 |
| `bordered` / `size` | `boolean` / `'small' \| 'middle' \| 'large'` | — | 透传 `a-table` |
| `cellActive` / `rowActive` | `boolean` | `true` | 是否高亮当前激活单元格 / 行 |
| `editable` | `boolean \| 'cell' \| 'row' \| 'manual'` | `false` | cell 双击进入；row 行编辑；manual 需 startEdit；`true` 为全量编辑 |
| `rules` | `Record<string, RuleItem \| RuleItem[]>` | — | 表级校验（async-validator），按列 `dataIndex` 聚合 |
| `validateTrigger` | `'change' \| 'blur' \| 'manual'` | `manual` | 校验触发时机 |
| `validateOnCellExit` | `boolean` | `false` | 离开单元格（确认编辑）时是否校验 |
| `columnSetting` | `boolean` | `true` | 列设置（显隐、排序、列宽，可本地持久化） |
| `columnSettingKey` | `string` | `'ant-table-default'` | 列设置持久化 key；多实例需各自不同，否则互相覆盖 |
| `resizable` | `boolean` | `false` | 表级列宽拖拽开关；开启后所有带 number 宽度的叶子列默认可拖拽。单列可用列配置 `resizable`（boolean）覆盖（列级优先） |
| `hotkeyEnabled` / `hotkeys` | `boolean` / `HotkeyBinding[]` | `true` / — | 键盘导航与自定义热键 |
| `current` / `pageSize` / `total` | `number` | — | 传入 `total` 即启用底部分页；data 须父级按页传入，组件不切片。支持 `v-model:current`、`v-model:pageSize` |
| `pageSizes` / `showPaginationTotal` | `number[]` / `boolean` | — / `true` | 分页器配置 |
| `height` | `number` | — | 固定表体高度（px），对应 `a-table` `scroll.y` |
| `scrollX` | `number \| string` | — | 横向滚动宽度，对应 `scroll.x`（有固定列时需设置） |
| `adaptive` | `boolean \| AdaptiveConfig` | `false` | 视口自适应高度（自动计算 `scroll.y`）；AdaptiveConfig：`offsetTop`、`offsetBottom`、`excludeSelectors` |

## 事件

`a-table` 原生事件（如 `change` 的筛选/排序场景）可通过 `$attrs` 直接监听。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:dataSource` | `T[]` | 数据变更（编辑、行操作等） |
| `cell-edit-start` / `cell-edit-end` | `{ rowIndex, column, value }` | 单元格进入 / 退出编辑 |
| `cell-value-change` | `{ rowIndex, column, oldValue, newValue }` | 单元格值变化 |
| `update:current` / `update:pageSize` | `number` | 分页同步 |
| `change` | `{ current, pageSize }` | 页码或每页条数变化，用于拉取数据 |

## 插槽

AntTable 以 `columns` 配置驱动渲染，**展示态与编辑器均通过列配置定义**（`customRender` / `component`），无需逐列插槽。少量布局插槽：

| 插槽 | 说明 |
| --- | --- |
| `title` | 顶部左侧标题区 |
| `toolbar` | 顶部右侧，与列设置按钮同排 |
| `summary` | 底部左侧（与分页同排） |
| `pagination` | 覆盖默认分页器；`total != null` 时默认显示内置分页 |
| `expandedRowRender` | 透传 `a-table` 展开行内容 |
| `emptyText` | 透传 `a-table` 空状态 |

## 列配置 AntTableColumn

在 antd 原生列字段（`title`、`dataIndex`、`key`、`width`、`fixed`、`align`、`ellipsis`、`customRender`、`children` 等）基础上扩展编辑能力。其余未列出的 antd 列属性（`sorter`、`filters` 等）通过 `[key: string]: any` 透传。

- `dataIndex`：数据字段；**可编辑列必须为 string**（作为编辑/校验/脏标记的标识）。
- `customRender`：展示态渲染 `({ text, value, record, index, column }) => VNodeChild`（antd 风格入参）。
- `hidden`：列设置中默认隐藏。
- `editable`：是否可编辑，可为 `(row) => boolean`。
- `component`：编辑组件标识或组件，内置映射见下文「内置编辑器」。
- `componentProps`：编辑组件 props，或 `(row, column) => props`。
- `rules` / `required`：列级校验（可与表级 `rules` 合并）。
- `resizable`：列级列宽拖拽开关（boolean），**优先于表级 `resizable` prop**——表级开启后想单独关闭某列设 `resizable: false`，表级关闭时想单独开启设 `resizable: true`。底层透传给 `a-table` 原生 `resizable` + `resizeColumn`：鼠标移到表头右缘出现 `col-resize` 句柄拖动即可。**`width` 必须为 number**（作为初始宽度），可选 `minWidth`（默认 50）/ `maxWidth` 约束范围；多级表头的**子列**同样可独立拖拽。开启 `columnSetting` 时拖拽结果随列设置持久化到 `columnSettingKey`。
- `dependencies`：单元格联动（见下节）。
- `children`：多级表头。

### 内置编辑器

`component` 支持以下内置标识（映射见 `adapters/index.ts`），也可直接传入任意组件：

| 标识 | 组件 | v-model 绑定 |
| --- | --- | --- |
| `input` | `a-input` | `value` |
| `input-number` | `a-input-number` | `value` |
| `select` | `a-select` | `value` |
| `date-picker` | `a-date-picker` | `value` |
| `time-picker` | `a-time-picker` | `value` |
| `switch` | `a-switch` | `checked` |
| `checkbox` | `a-checkbox` | `checked` |

传入自定义组件时默认按 `value` 双向绑定。

## 编辑模式

`editable` prop 决定编辑行为，支持 5 种模式：

- `false`（默认）：只读，不可编辑。
- `'cell'`：单元格模式，双击 / F2 / 可打印字符进入编辑，Enter 确认并下移，Esc 取消，Tab 横移并确认。
- `'row'`：行模式，同一行所有可编辑列同时进入编辑态；Tab 在行内循环；切换到其他行时整行确认。
- `'manual'`：手动模式，需通过 `startEdit(rowIndex, colIndex)` 或 `focusAndEditByField(rowIndex, field)` 触发，不响应双击或 F2。
- `true`：全量模式（all），所有可编辑单元格始终展示编辑器，方向键和 Tab 直接在编辑器间移动焦点。

编辑支持 **Ctrl+Z / Ctrl+Shift+Z** 撤销重做（最多 50 步），undo/redo 后脏标记自动同步。

## 单元格联动 dependencies

`DependencyApi` 提供 `rowIndex`、`row`、`column`、`getFieldValue`、`setFieldValue`。

```ts
dependencies: {
  triggerFields: ['department'], // 监听这些字段的变化
  disabled: (row, api) => false, // 动态禁用编辑
  required: (row, api) => row.status === 'active', // 动态必填
  rules: (row, api) => [{ required: true, message: '...' }], // 动态规则
  componentProps: (row, api) => ({ options: [...] }), // 动态编辑器 props
  trigger: (row, api) => { api.setFieldValue('remark', ''); }, // 副作用/联动赋值
}
```

## 脏数据追踪

组件内部维护一份基线快照（dataSource 首次非空值的深拷贝），编辑后通过对比判断哪些单元格被修改。脏单元格加 `atbl-cell--dirty`（默认左上角红色三角角标），脏行加 `atbl-row--dirty`。

- `markDirty(rowIndex, field)` / `clearDirty(rowIndex?, field?)`：标记 / 清除脏标记。
- `resetTracking()`：将当前 dataSource 作为新基线，清空脏标记。
- `getModifiedRows()`：返回至少有一个脏单元格的行数据数组。
- `getDirtyCells()`：返回所有脏单元格 key 集合（格式 `rowIndex:field`）。
- `isCellDirty(rowIndex, field)` / `isRowDirty(rowIndex)`：单格 / 行级查询。

## 暴露方法（ref）

- **导航**：`navigate`、`focusCell`、`getColIndexByField`、`focusAndEditByField`、`activeRowIndex`、`activeColIndex`、`activeRow`、`activeColumn`
- **编辑**：`startEdit`、`confirmEdit`、`cancelEdit`、`editMode`、`isEditing`
- **校验**：`validate(rows?)`、`validateField(rowIndex, field)`、`clearValidation(rowIndex?, field?)`、`scrollToFirstError()`
- **行操作**：`insertRow(index?, defaultRow?, count?)`、`deleteRow(index?)`、`moveRow(from, to)`、`duplicateRow(index?)`
- **脏数据**：`markDirty`、`clearDirty`、`resetTracking`、`getModifiedRows`、`getDirtyCells`、`isCellDirty`、`isRowDirty`
- **撤销重做**：`undo`、`redo`、`canUndo`、`canRedo`、`clearHistory`
- **列操作**：`toggleColumn`、`moveColumn`、`setColumnWidth`、`resetColumns`、`openColumnSetting`

行操作下标均为**当前 dataSource 数组下标**（与服务端分页时「仅含当前页数据」一致）。

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

设置 `total` 后出现分页条。**请将当前页数据通过 `dataSource` 传入**，组件内部不对数据进行分页切片。`change` 与 `update:current` / `update:pageSize` 在变化时触发，用于请求接口。

> 综合示例为客户端全量数据，仅用于演示分页/交互；接入服务端时请按页更新 `dataSource`。

## 自适应高度

`adaptive` 为 `true` 时，组件按视口剩余空间自动计算 `a-table` 的 `scroll.y`；也可传入 `AdaptiveConfig` 微调：

```ts
:adaptive="{ offsetBottom: 24, excludeSelectors: ['.page-footer'] }"
```

有固定列（`fixed`）时建议同时设置 `scroll-x`，否则横向滚动可能异常。

## 样式类名

`atbl-cell--active`、`atbl-row--active`、`atbl-cell--error`、`atbl-cell--dirty`、`atbl-row--dirty` 等，可用全局样式覆盖。

## 类型导出

```ts
// 公共 API（从 index.ts 导出）
import { AntTable, ANT_TABLE_INJECTION_KEY, ANT_ADAPTER_MAP } from '@labs/ant-table';
import type {
  AntTableColumn,
  AntTableProps,
  RowData,
  CellContext,
  CellRenderParams,
  ColumnAlign,
  DependencyApi,
  DependencyState,
  ColumnDependencies,
  HotkeyBinding,
  HotkeyContext,
  AdaptiveConfig,
  PaginationPayload,
  EditorAdapter,
} from '@labs/ant-table';
```

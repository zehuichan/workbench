---
title: PlusTable
description: 基于 Element Plus el-table 的增强表格
---

# PlusTable

基于 Element Plus `el-table` 的增强表格：配置式列、三种编辑模式（单元格 / 整行 / 全表）、仿 Excel 热键（含撤销重做与自定义热键）、列设置持久化、行校验与联动（dependencies）、脏数据追踪、行操作、服务端分页与自适应高度。

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

const data = ref([{ id: 1, name: '示例' }]);
const columns: PlusTableColumn[] = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '名称', editable: true, component: 'input', required: true },
];
</script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>
```

## Props

未列出的属性通过 `v-bind="$attrs"` 透传给 `el-table`（如 `border`、`stripe`、`@sort-change`）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `RowData[]` | — | 表格数据，`v-model:data`（行结构变更经 `update:data` 回传） |
| `columns` | `PlusTableColumn[]` | — | 列配置，见下节 |
| `rowKey` | `string \| (row) => string \| number` | — | **必传**，错误定位 / 行编辑态的稳定标识 |
| `editMode` | `'none' \| 'cell' \| 'row' \| 'table'` | `'cell'` | 编辑模式，见「编辑模式」 |
| `validateOn` | `'change' \| 'blur' \| 'manual'` | `'change'` | 自动校验时机；`manual` 时仅 `ref.validate()` 触发 |
| `columnSetting` | `boolean` | `false` | 是否显示工具栏「列设置」按钮（显隐 + 拖拽排序 + 重置） |
| `settingsKey` | `string` | — | 列设置 localStorage 持久化 key（显隐 / 顺序 / 列宽）；不传则不持久化；多实例需各自唯一 |
| `adaptive` | `boolean \| AdaptiveConfig` | `false` | 自适应高度；`AdaptiveConfig`：`mode`（`'viewport'` 默认 / `'container'`）、`offsetBottom`（默认 16，仅 viewport）、`minHeight`（默认 200，仅 viewport） |
| `total` | `number` | — | 传入即启用分页（服务端驱动，组件不切片） |
| `page` / `pageSize` | `number` | `1` / `20` | `v-model:page` / `v-model:pageSize` |
| `pageSizes` | `number[]` | `[10, 20, 50, 100]` | 每页条数选项 |
| `history` | `boolean` | `false` | 是否启用撤销重做 |
| `historyLimit` | `number` | `50` | 撤销栈上限 |
| `dirtyTracking` | `boolean` | `false` | 是否启用脏行/脏格追踪 |
| `hotkeys` | `HotkeyBinding[]` | — | 自定义热键绑定，见「自定义热键」 |
| `hotkeyEnabled` | `boolean` | `true` | `hotkeys` 总开关（不影响内置键盘导航） |

## 事件

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:data` | `RowData[]` | 行结构变更（增删移复制） |
| `cell-change` | `{ row, rowIndex, prop, value, oldValue }` | 单元格值写入（cell 提交 / row·table 直绑 / 联动 setValue / Delete 清空） |
| `update:page` / `update:pageSize` | `number` | 分页同步 |
| `page-change` | `{ page, pageSize }` | 页码或每页条数变化，父级据此拉数据并替换 `data` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `toolbar` | 工具栏左侧区域（与列设置按钮同排） |
| `empty` | 透传 `el-table` 空态 |
| `cell-${prop}` | 自定义展示态，作用域 `{ row, rowIndex, column, value }` |
| `header-${prop}` | 自定义表头，作用域 `{ column }` |
| `editor-${prop}` | 自定义编辑器，作用域 `{ row, rowIndex, column, value, setValue, commit, cancel }` |

## 列配置 PlusTableColumn

继承 Element Plus `el-table-column` 的原生属性——`prop`、`label`、`type`、`width`、`minWidth`、`align`、`fixed`、`sortable`、`showOverflowTooltip`、`formatter`……按 `el-table-column` 的文档直接写即可，无需额外的透传字段。以下是 PlusTable 在此之上扩展的部分：

```ts
interface PlusTableColumn extends Partial<TableColumnCtx> {
  // …原生 TableColumnCtx 属性：prop / label / type / width / align / fixed / formatter / ...

  children?: PlusTableColumn[];      // 多级表头，组节点只需 label
  editable?: boolean | ((row, rowIndex) => boolean);
  component?: BuiltinEditorType | Component;  // 编辑器，见下节；缺省为 input
  componentProps?: Record<string, unknown> | ((row, column) => Record<string, unknown>);
  modelProp?: string;                // 自定义组件的 v-model prop 名，默认 modelValue
  required?: boolean;                // 必填（表头红星 + 校验）
  rules?: CellRule[];                // async-validator 规则
  dependencies?: ColumnDependencies; // 字段联动，见下节
  render?: (params: CellRenderParams) => VNodeChild;  // 展示态自定义渲染（优先于 formatter）
  visible?: boolean;                 // 初始是否可见（列设置）
  settingDisabled?: boolean;         // 列设置面板中不可操作
}
```

- `formatter` 为 `el-table-column` 原生签名 `(row, column, cellValue, index) => VNode | string`；`render` 优先级更高，二者都缺省时展示原始值。
- `type: 'index' | 'selection' | 'expand'` 特殊列由 `el-table` 原生渲染（序号 / 勾选框 / 展开图标），不进列设置面板、不参与键盘导航，拖拽排序时始终留在声明时的位置（如首列 `{ type: 'index', label: '#' }` 拖别的列也不会挪动）。

## 编辑器 component

```ts
component: 'select'                 // 内置类型标识
component: MyEditor                 // 任意自定义组件（默认 v-model:modelValue）
componentProps: { clearable: true } // 透传给编辑器的 props（联动 dependencies.componentProps 优先级更高）
modelProp: 'value'                  // 自定义组件的 v-model prop 名，默认 modelValue
```

- 内置类型：`input`、`textarea`、`input-number`、`select`（`ElSelectV2`）、`date-picker`、`time-picker`、`switch`、`checkbox`。
- 提交时机按编辑器推导：文本类失焦提交，选择类变更即提交。
- `select` 的选项走 `componentProps: { options: [...] }`（`ElSelectV2` 原生 `options` prop，`{ label, value, disabled? }[]`）；动态选项用 `dependencies.componentProps`（见「字段联动」）。
- 局部接管用 `editor-${prop}` 插槽，优先于 `component` 配置。

## 编辑模式 editMode

- `'none'`：只读，仅键盘导航。
- `'cell'`（默认）：双击 / Enter / F2 / 直接打字进入单格编辑；Enter 提交并下移，Tab 提交并横移，Esc 取消，失焦提交。
- `'row'`：整行进编（双击行或 `ref.startRowEdit(rowIndex)`）；`commitRowEdit` 时整行校验，失败不退出；`cancelRowEdit` 静默回滚到进编快照（不触发联动与 `cell-change`）。
- `'table'`：所有可编辑列常驻编辑器，值直接写回行对象。

## 内置热键（仿 Excel）

点击表格区域聚焦后生效，`row` / `table` 模式下方向键 / Tab 移动时会自动把真实 DOM 焦点同步到目标格的输入框：

- **方向键**：移动活动格；**Tab / Shift+Tab**：横移（行尾换行，任何编辑模式下都由表格拦截，不会跳出表格）。
- **Enter**：选中态进编（不可编辑则下移）；编辑态提交并下移。textarea 中 Shift/Alt+Enter 换行。
- **Esc**：取消编辑（`row` 模式下取消整行编辑并回滚）；**F2**：进编。
- **Home / End**：行首尾；**Ctrl+Home / Ctrl+End**：全表首尾。
- **Delete / Backspace**：清空活动格。
- **可打印字符**：选中即输入——任何可编辑列直接进编；文本 / 数字编辑器以首字符覆盖原值，其余编辑器仅打开。
- **Ctrl+Z**：撤销；**Ctrl+Shift+Z / Ctrl+Y**：重做（`history` 关闭时不生效）。

## 自定义热键 hotkeys

```ts
const hotkeys: HotkeyBinding[] = [
  {
    key: 'Ctrl+S',
    override: true,               // 先于内置热键判定，任何编辑态/焦点位置都生效
    handler: (ctx) => {
      ctx.event; // 原生事件，已按 preventDefault 默认值处理
      // ctx.row / ctx.prop / ctx.column：活动格上下文；ctx.setValue / ctx.navigate / ctx.undo / ctx.redo 等操作
    },
  },
];
```

- `key`：`'Ctrl+Shift+Z'` 风格组合键字符串，大小写不敏感。
- `override: true` 的绑定先于任何内置行为判定（包括编辑态下的 Tab/Enter/Esc）；默认 `false` 时内置热键优先，未处理到才轮到自定义绑定。
- `handler` 返回 `false` 表示「不处理，继续走后续逻辑」（其余绑定 / 内置热键）；`when` 提供命中 `key` 后的附加判定条件。
- `handler` / `when` 内抛出的异常会被捕获（视为未命中），不会影响表格其余交互。

## 校验

- 列级 `required` / `rules`（async-validator）；规则的自定义 `validator` 的 source 为整行，可跨字段校验。
- 校验遍历**全部列**，不因列被「列设置」隐藏而漏检——隐藏一个必填列后，`validate()` / 自动校验仍会报出该列的错误。
- `validateOn` 控制自动校验时机；`ref.validate()` 全表校验，默认滚动并激活到首个错误格；`ref.getErrors()` 只读读取当前错误集合，便于自定义错误汇总面板。
- 同一格快速连续触发异步校验时，按内部版本号丢弃过期结果，最终只体现最后一次输入的校验结果。
- 错误格红框 + 底色 + hover tooltip 显示错误信息；`dependencies.required` 联动算出的动态必填会打上 `ptbl-cell--required` 类名（默认无内置视觉，表头星号已覆盖静态必填的提示需求，可自定义样式识别动态必填格）。

## 撤销重做 history

`history` 开启后，`cell` / `row` / `table` 模式下的取值提交（文本类失焦提交、选择类变更即提交）都会记入撤销栈，按 `rowKey` 寻址——插入/删除/移动行或换页后再撤销/重做，也不会作用到错误的行。

- `ref.undo()` / `ref.redo()`；`ref.canUndo` / `ref.canRedo`（`Ref<boolean>`，可直接绑到按钮 `disabled`）；`ref.clearHistory()`。
- `Ctrl+Z` / `Ctrl+Shift+Z`（或 `Ctrl+Y`）为内置快捷键。
- 目标行已被删除时，该条撤销/重做记录会被跳过而不是报错。

## 脏数据追踪 dirtyTracking

`dirtyTracking` 开启后，以数据首次出现时的值为基线，跟踪哪些格子/行被修改过；改回原值会自动清除脏标记；`row` 模式 `cancelRowEdit` 回滚后脏状态一并复原。

- `ref.getModifiedRows()`：当前所有脏行的行数据；`ref.getDirtyCells()`：`Set<'${rowKey}:${prop}'>`。
- `ref.isCellDirty(rowKey, prop)` / `ref.isRowDirty(rowKey)`。
- `ref.resetTracking()`：把当前数据视为新基线（清空脏标记）；`ref.clearDirty(rowKey?, prop?)`：不重设基线，仅清除标记。
- 脏格右上角有一个不遮挡内容的小圆点标记（`ptbl-cell--dirty`）。

## 字段联动 dependencies

vben form 风格，`values` 换成当前行数据：

```ts
dependencies: {
  triggerFields: ['department'],     // 仅这些字段变动时触发 trigger
  disabled: (row, api) => row.status === 'done',      // 动态禁用本格编辑
  required: (row, api) => row.status === 'active',    // 动态必填
  rules: (row, api) => [...],                         // 动态规则（与静态 rules 合并）
  componentProps: (row, api) => ({ options: [...] }), // 动态编辑器参数
  trigger: (row, api) => { api.setValue('assignee', undefined); },  // 副作用
}
```

`api` 为行级上下文：`{ row, rowIndex, prop, setValue(prop, value) }`。`setValue` 会走完整写值流水线（`cell-change` → 联动 → 校验），且有防循环守卫。

## 暴露方法（ref）

- **校验**：`validate(scrollToFirstError = true)` → `{ valid, errors }`、`clearValidate()`、`getErrors()` → `CellError[]`
- **行操作**：`insertRow(row?, index?)`、`removeRow(index)`、`moveRow(from, to)`、`duplicateRow(index, patch?)`（patch 需覆盖 rowKey 字段避免撞 key）
- **行编辑**（row 模式）：`startRowEdit(rowIndex)`、`commitRowEdit(rowIndex)` → `Promise<boolean>`、`cancelRowEdit(rowIndex)`
- **单元格编辑**（cell 模式）：`startEdit(rowIndex, colIndex)`、`cancelEdit()`、`setActiveCell(rowIndex, colIndex)`
- **列设置**：`resetColumnSettings()`、`setColumnWidth(columnId, width)`（columnId 为 prop，无 prop 时为 label 或 type）
- **撤销重做**（`history` 关闭时恒为空操作）：`undo()`、`redo()`、`canUndo` / `canRedo`（`Ref<boolean>`）、`clearHistory()`
- **脏数据追踪**（`dirtyTracking` 关闭时恒无脏格）：`getModifiedRows()`、`getDirtyCells()`、`isCellDirty(rowKey, prop)`、`isRowDirty(rowKey)`、`resetTracking()`、`clearDirty(rowKey?, prop?)`
- **el-table 直通**：`getElTable()`

行操作下标均为**当前 `data` 数组下标**（服务端分页时即「当前页下标」）。

## 列设置

- 面板内勾选显隐（组节点联动子列、半选态），**拖拽行**调整列顺序（仅限同级之间），「重置」恢复默认。
- **列宽**：拖拽表头边框调整（`el-table` 原生行为，需 `border`），调整结果自动记录。
- 传 `settingsKey` 后，显隐 / 顺序 / 列宽均持久化到 localStorage。
- `settingDisabled: true` 的列在面板中不可勾选、不可拖拽。

## 分页

传 `total` 即启用，**服务端驱动**：组件不切片，`page-change` 时由父级请求数据并替换 `data`。

## 样式类名

`ptbl-cell--active` / `--editing` / `--editing-focus`（cell 模式编辑中）/ `--editing-quiet`（row 模式行内编辑器，仅聚焦格高亮）/ `--editable`（cell 模式下 hover 有浅底色提示可编辑）/ `--error` / `--disabled` / `--required`（静态 `required` 或联动算出的动态必填，默认无内置视觉——表头星号已覆盖静态提示，可自定义样式识别）/ `--dirty`（`dirtyTracking` 脏格，右上角小圆点）、`ptbl-header-cell--required`，可用全局样式覆盖。样式随组件自动引入，也可手动 `import '@labs/plus-table/styles'`。

## 类型导出

```ts
import { PlusTable, PLUS_TABLE_INJECTION_KEY, EDITOR_REGISTRY } from '@labs/plus-table';
import type {
  PlusTableProps, PlusTableColumn, RowData, EditMode, ValidateOn,
  BuiltinEditorType,
  ColumnDependencies, DependencyApi,
  CellRule, CellError, ValidateResult,
  CellChangePayload, PageChangePayload, AdaptiveConfig,
  HotkeyBinding, HotkeyContext,
} from '@labs/plus-table';
```

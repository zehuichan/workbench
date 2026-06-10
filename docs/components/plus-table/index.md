---
title: PlusTable
description: 基于 Element Plus el-table 的增强表格
---

# PlusTable

基于 Element Plus `el-table` 的增强表格：配置式列、三种编辑模式（单元格 / 整行 / 全表）、仿 Excel 热键、列设置持久化、行校验与联动（dependencies）、行操作、服务端分页与自适应高度。

<demo src="./demo/basic.vue" description="配置式列 + cell 编辑模式：双击 / Enter / F2 进入编辑，直接打字覆盖输入。">基础用法</demo>

## 快速开始

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@labs/plus-table';
import type { PlusTableColumn } from '@labs/plus-table';

const data = ref([{ id: 1, name: '示例' }]);
const columns: PlusTableColumn[] = [
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', editable: true, editor: 'input', required: true },
];
</script>

<template>
  <PlusTable v-model:data="data" :columns="columns" row-key="id" border />
</template>
```

## 综合示例

涵盖编辑模式切换、校验时机、字段联动、多级表头、行操作、列设置与分页。先点击表格区域聚焦，再用键盘导航与热键。

<demo src="./demo/playground.vue" description="完整功能演示：编辑模式 / 热键 / 校验 / 联动 / 行操作 / 列设置 / 分页。">交互示例</demo>

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
| `adaptive` | `boolean \| AdaptiveConfig` | `false` | 视口自适应高度；`AdaptiveConfig`：`offsetBottom`（默认 16）、`minHeight`（默认 200） |
| `total` | `number` | — | 传入即启用分页（服务端驱动，组件不切片） |
| `page` / `pageSize` | `number` | `1` / `20` | `v-model:page` / `v-model:pageSize` |
| `pageSizes` | `number[]` | `[10, 20, 50, 100]` | 每页条数选项 |

## 事件

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `update:data` | `RowData[]` | 行结构变更（增删移复制） |
| `cell-change` | `{ row, rowIndex, field, value, oldValue }` | 单元格值写入（cell 提交 / row·table 直绑 / 联动 setValue / Delete 清空） |
| `update:page` / `update:pageSize` | `number` | 分页同步 |
| `page-change` | `{ page, pageSize }` | 页码或每页条数变化，父级据此拉数据并替换 `data` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `toolbar` | 工具栏左侧区域（与列设置按钮同排） |
| `empty` | 透传 `el-table` 空态 |
| `cell-${field}` | 自定义展示态，作用域 `{ row, rowIndex, column, value }` |
| `header-${field}` | 自定义表头，作用域 `{ column }` |
| `editor-${field}` | 自定义编辑器，作用域 `{ row, rowIndex, column, value, setValue, commit, cancel }` |

## 列配置 PlusTableColumn

```ts
interface PlusTableColumn {
  field?: string;                    // 字段名；可编辑 / 校验 / 联动列必须提供
  title?: string;
  children?: PlusTableColumn[];      // 多级表头，组节点只需 title
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  columnProps?: Record<string, unknown>;  // 透传 el-table-column（如 sortable、showOverflowTooltip）
  editable?: boolean | ((row, rowIndex) => boolean);
  editor?: ColumnEditor;             // 编辑器，见下节；缺省为 input
  required?: boolean;                // 必填（表头红星 + 校验）
  rules?: CellRule[];                // async-validator 规则
  dependencies?: ColumnDependencies; // 字段联动，见下节
  formatter?: (value, row, rowIndex) => string;  // 展示态格式化
  render?: (params: CellRenderParams) => VNodeChild;  // 展示态自定义渲染（优先于 formatter）
  visible?: boolean;                 // 初始是否可见（列设置）
  settingDisabled?: boolean;         // 列设置面板中不可操作
}
```

## 编辑器 editor

```ts
// 三种写法
editor: 'select'                                  // 内置类型标识
editor: { type: 'select', props: { clearable: true }, options: [...] }  // 配置对象
editor: MyEditor                                  // 任意自定义组件（默认 v-model:modelValue）
editor: { component: MyEditor, modelProp: 'value', props: {...} }       // 自定义组件 + 配置
```

- 内置类型：`input`、`textarea`、`number`、`select`、`date-picker`、`time-picker`、`switch`、`checkbox`。
- 提交时机按编辑器推导：文本类失焦提交，选择类变更即提交。
- `options`：select 的选项（`{ label, value, disabled? }[]` 或 `(row, rowIndex) => options`）；自定义组件则作为 `options` prop 透传。
- 局部接管用 `editor-${field}` 插槽，优先于 `editor` 配置。

## 编辑模式 editMode

- `'none'`：只读，仅键盘导航。
- `'cell'`（默认）：双击 / Enter / F2 / 直接打字进入单格编辑；Enter 提交并下移，Tab 提交并横移，Esc 取消，失焦提交。
- `'row'`：整行进编（双击行或 `ref.startRowEdit(rowIndex)`）；`commitRowEdit` 时整行校验，失败不退出；`cancelRowEdit` 静默回滚到进编快照（不触发联动与 `cell-change`）。
- `'table'`：所有可编辑列常驻编辑器，值直接写回行对象。

## 内置热键（仿 Excel）

点击表格区域聚焦后生效：

- **方向键**：移动活动格；**Tab / Shift+Tab**：横移（行尾换行）。
- **Enter**：选中态进编（不可编辑则下移）；编辑态提交并下移。textarea 中 Shift/Alt+Enter 换行。
- **Esc**：取消编辑；**F2**：进编。
- **Home / End**：行首尾；**Ctrl+Home / Ctrl+End**：全表首尾。
- **Delete / Backspace**：清空活动格。
- **可打印字符**：选中即输入——任何可编辑列直接进编；文本 / 数字编辑器以首字符覆盖原值，其余编辑器仅打开。

## 校验

- 列级 `required` / `rules`（async-validator）；规则的自定义 `validator` 的 source 为整行，可跨字段校验。
- `validateOn` 控制自动校验时机；`ref.validate()` 全表校验，默认滚动并激活到首个错误格。
- 错误格红框 + 底色 + hover tooltip 显示错误信息。

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

`api` 为行级上下文：`{ row, rowIndex, field, setValue(field, value) }`。`setValue` 会走完整写值流水线（`cell-change` → 联动 → 校验），且有防循环守卫。

## 暴露方法（ref）

- **校验**：`validate(scrollToFirstError = true)` → `{ valid, errors }`、`clearValidate()`
- **行操作**：`insertRow(row?, index?)`、`removeRow(index)`、`moveRow(from, to)`、`duplicateRow(index, patch?)`（patch 需覆盖 rowKey 字段避免撞 key）
- **行编辑**（row 模式）：`startRowEdit(rowIndex)`、`commitRowEdit(rowIndex)` → `Promise<boolean>`、`cancelRowEdit(rowIndex)`
- **单元格编辑**（cell 模式）：`startEdit(rowIndex, colIndex)`、`cancelEdit()`、`setActiveCell(rowIndex, colIndex)`
- **列设置**：`resetColumnSettings()`、`setColumnWidth(columnId, width)`（columnId 为 field，无 field 时为 title）
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

`ptbl-cell--active` / `--editing` / `--editing-focus`（cell 模式编辑中）/ `--editing-quiet`（row 模式行内编辑器，仅聚焦格高亮）/ `--editable` / `--error` / `--disabled`、`ptbl-header-cell--required`，可用全局样式覆盖。样式随组件自动引入，也可手动 `import '@labs/plus-table/styles'`。

## 类型导出

```ts
import { PlusTable, PLUS_TABLE_INJECTION_KEY, EDITOR_REGISTRY } from '@labs/plus-table';
import type {
  PlusTableProps, PlusTableColumn, RowData, EditMode, ValidateOn,
  ColumnEditor, ColumnEditorConfig, EditorOption,
  ColumnDependencies, DependencyApi,
  CellRule, CellError, ValidateResult,
  CellChangePayload, PageChangePayload, AdaptiveConfig,
} from '@labs/plus-table';
```

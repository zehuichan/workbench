# PlusTable API Overview Design

Date: 2026-07-18

## Goal

在 playground 的 PlusTable 分组增设 **API Overview** 页：汇总完整公开 API，供查阅；交互教学仍由现有场景 demo 承担。

## Decisions

| 项 | 选择 |
|----|------|
| 形态 | Playground 新路由页，非 VitePress / Markdown 文档站 |
| 覆盖粒度 | 完整公开面（Props / Events / Slots / Expose / Column / dependencies） |
| 交互 | 纯文档：无 `DemoBlock`、无 `PlusTable` 实例 |
| 侧栏位置 | PlusTable 分组第一项（`order: 0`） |
| 默认落地 | `/` 仍重定向到 `/plus-table/basic-editing` |
| 实现方式 | 单页手写多张 `DemoApiTable`（与现有 demo 风格一致） |
| 场景页 API | 各页「本页用到」子集 **保留**，不抽共享片段 |

## Out of Scope

- 内置热键详表、内部 store / injection API
- 数据驱动 API 表、Overview 与场景页共享文案模块
- 恢复已删除的 `demo-routes.test.ts`
- 修改 `src/components/plus-table/**` 组件实现

## Routes & Files

| 路径 | 组件 | meta |
|------|------|------|
| `/plus-table/api-overview` | `src/views/plus-table/api-overview-demo.vue` | `{ title: 'API Overview', group: 'PlusTable', order: 0 }` |

- 组件名：`ApiOverviewDemo`
- 在 `src/router/index.ts` 注册；侧栏由 layout 按 `meta.group` + `order` 生成，无需改 layout
- 现有四页场景路由与 `order: 1..4` 不变

## Page Structure

```text
DemoPage (width="wide")
  #description
  #api → DemoApiTable × 11
  （无 default slot 中的 DemoBlock / PlusTable）
```

`#description`：说明本页为完整公开 API 参考，交互见侧栏场景页；并注明未列出的 `el-table` 属性经 `$attrs` 透传。

## API Tables (fixed order)

文案以类型定义与现有场景页为准，可合并同义行（如 `undo`/`redo`），不扩写教程。

| # | 标题 | 覆盖 |
|---|------|------|
| 1 | Props | `PlusTableProps` 全量：`data`/`columns`/`rowKey`/`mode`/`validateEvent`/`cache`/`id`/`adaptive`/`total`/`page`/`pageSize`/`pageSizes`/`history`/`dirtyTracking`/`hotkeys`/`hotkeyEnabled` |
| 2 | Events | `update:data`、`cell-change`、`update:page`、`update:pageSize`、`page-change` |
| 3 | Slots | `title` / `toolbar` / `summary` / `empty`；动态 `cell-*` / `header-*` / `editor-*` |
| 4 | Expose · 校验 | `validate` / `clearValidate` / `getErrors` |
| 5 | Expose · 行操作 | `insertRow` / `removeRow` / `moveRow` / `duplicateRow` |
| 6 | Expose · 编辑 | `startEdit` / `cancelEdit` / `startRowEdit` / `commitRowEdit` / `cancelRowEdit` / `setActiveCell` |
| 7 | Expose · 列设置 | `resetColumnSettings` / `setColumnWidth` |
| 8 | Expose · 历史 | `undo` / `redo` / `canUndo` / `canRedo` / `clearHistory` |
| 9 | Expose · 脏追踪 | `getModifiedRows` / `getDirtyCells` / `isCellDirty` / `isRowDirty` / `resetTracking` / `clearDirty` |
| 10 | Column | `prop`/`type`/`editable`/`component`/`componentProps`/`modelProp`/`required`/`rules`/`render`/`visible`/`children`；注明 el-table-column 常用字段可直通 |
| 11 | dependencies | `triggerFields` / `disabled` / `required` / `rules` / `componentProps` / `trigger` |

Source of truth for signatures:

- Props / Events → `src/components/plus-table/table/defaults.ts`
- Slots → `table.vue` `defineSlots`
- Expose → `table.vue` `defineExpose`
- Column / dependencies → `table-column/defaults.ts` + `adapter/index.ts`（编辑器字段）

## Testing

更新 `src/views/demo-content.test.ts`，为 Overview 增加一条 contract：

- 含 `<template #description>`、`<template #api>`
- **不含** `<template #hint>`、`<DemoBlock`、`<PlusTable`
- `DemoApiTable` 数量为 **11**
- fingerprint 至少包含：`Props`、`Events`、`Slots`、`Expose · 校验`、`dependencies`、`setActiveCell`、`v-model:data`

不要求对每个 prop 做逐行快照。

## Acceptance

1. 侧栏 PlusTable 第一项为「API Overview」
2. `/` 仍进入「基础编辑」
3. Overview 页只有 API 表，无表格实例
4. `demo-content` 相关 vitest 用例通过

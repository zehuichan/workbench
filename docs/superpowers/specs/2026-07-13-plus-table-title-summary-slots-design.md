# PlusTable title / summary Slots Design

Date: 2026-07-13

## Goal

为 PlusTable 增加 `#title`、`#summary` 两个布局插槽，形成「顶栏左标题 + 右工具区、底栏左汇总 + 右分页」的常见表格壳层，不引入字符串 prop 或额外业务逻辑。

## Decisions

| 项               | 选择                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| title 与 toolbar | 同一行：左 title，右 toolbar + 列设置                                 |
| summary 与分页   | 有分页时同一行（左 summary、右分页）；无分页时 summary 仍可单独占底栏 |
| 插槽参数         | 无作用域参数                                                          |
| 默认内容 prop    | 不做（YAGNI）                                                         |
| Demo             | 在 `pagination-rows-demo` 演示，并补 API 说明                         |

## Structure

```
.plus-table
  .plus-table__header          // 有 title 插槽或始终渲染（含列设置）时显示
    .plus-table__title         // #title（有插槽才渲染包裹节点）
    .plus-table__toolbar       // #toolbar + PlusTableColumnSettings
  .plus-table__grid
  .plus-table__footer          // 有 summary 插槽或启用分页时显示
    .plus-table__summary       // #summary（有插槽才渲染包裹节点）
    .plus-table__pagination    // 仅 total !== undefined 时显示
```

### Visibility rules

| 区域           | 显示条件                                                |
| -------------- | ------------------------------------------------------- |
| `__header`     | 始终显示（列设置按钮一直在）；与现有 toolbar 行行为一致 |
| `__title`      | `$slots.title` 存在                                     |
| `__footer`     | `$slots.summary` 或 `total !== undefined`               |
| `__summary`    | `$slots.summary` 存在                                   |
| `__pagination` | `total !== undefined`                                   |

无 title 时 header 仍右对齐工具区；无 summary 仅有分页时 footer 右对齐分页；仅有 summary 无分页时 footer 只显示左侧汇总。

## Slots API

在 `defineSlots` 中与现有插槽并列声明：

```ts
title?: () => unknown;
summary?: () => unknown;
toolbar?: () => unknown;
empty?: () => unknown;
// ... 既有 cell-/header-/editor- 动态插槽
```

用法示例：

```vue
<PlusTable ...>
  <template #title>任务列表</template>
  <template #toolbar>...</template>
  <template #summary>已加载 {{ allRows.length }} 条</template>
</PlusTable>
```

## Styles

- `__header` / `__footer`：`display: flex; align-items: center; justify-content: space-between; gap: 8px`
- `__title` / `__summary`：`min-width: 0; margin-right: auto`（保证左侧贴边、右侧控件不被挤掉）
- `__toolbar`：保留现有右对齐与 gap；作为 header 内右侧区域
- `__pagination`：去掉单独的 `justify-content: flex-end`（由 footer flex 负责）；`margin-left: auto` 兜底「仅分页无 summary」时仍靠右
- header / footer 与 grid 之间沿用现有间距节奏（toolbar 现有 `margin-bottom: 8px` 可迁到 `__header`）

## Files to change

| 文件                                            | 变更                                   |
| ----------------------------------------------- | -------------------------------------- |
| `src/components/plus-table/table.vue`           | 模板结构、`defineSlots`                |
| `src/components/plus-table/styles/index.scss`   | header / title / footer / summary 样式 |
| `src/views/plus-table/pagination-rows-demo.vue` | 使用插槽 + API 表补充                  |
| `src/views/demo-content.test.ts`                | 若 API 表行数/指纹变化则同步           |

## Out of scope

- `title` / `summary` 字符串 prop 或默认文案
- 汇总计算、选中统计等业务能力（由消费方在插槽内自行实现）
- 改动其它 demo 页
- 自适应高度算法因 footer 变化的专项调整（沿用现有 `paginationRef`；若 footer 含 summary，测量目标仍为分页节点即可，或按实现时实测决定是否把 ref 挂到 footer）

## Success criteria

1. 传入 `#title` 时标题出现在顶栏左侧，toolbar / 列设置在右侧同一行。
2. 传入 `#summary` 且启用分页时，汇总在底栏左侧、分页在右侧。
3. 仅传 `#summary`、未传 `total` 时，底栏仍显示汇总。
4. 未传两插槽时，视觉与行为与当前接近（顶栏右工具区、有 `total` 时底栏右分页）。
5. `defineSlots` 含 `title` / `summary`；分页 demo 可演示且 content contract 测试通过。

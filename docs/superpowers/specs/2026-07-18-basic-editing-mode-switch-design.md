# Basic Editing Demo · Mode Switch Design

Date: 2026-07-18

## Goal

在 `basic-editing-demo` 增加 `mode` 切换，一次演示 `none | cell | row | table` 四种编辑模式；`row` 模式提供操作列完成保存/取消。

## Decisions

| 项 | 选择 |
|----|------|
| 范围 | 仅改 `src/views/plus-table/basic-editing-demo.vue` |
| 控件位置 | `PlusTable` `#toolbar` + `el-radio-group` / `el-radio-button` |
| 可选值 | `none` / `cell` / `row` / `table`（默认 `cell`） |
| row 操作列 | `mode === 'row'` 时追加 `type: 'operation'` 列；其它模式不出现 |
| row 交互 | 操作列编辑/保存/取消 + 保留双击进编 |
| 切换行为 | 只改 `mode` ref；不重置表格数据 |

## Out of Scope

- 修改 `src/components/plus-table/**` 组件实现
- 为每种 mode 拆独立 DemoBlock / 路由页
- 新增校验、history、dirtyTracking（其它 demo 已覆盖）

## Behavior by Mode

| mode | 期望体验 |
|------|----------|
| `none` | 只读；不可进编 |
| `cell` | 双击 / Enter / F2 / 可打印字符进编；方向键移格（现状） |
| `row` | 双击或点「编辑」进整行；「保存」→ `commitRowEdit`，「取消」→ `cancelRowEdit` |
| `table` | 可编辑列常驻编辑器 |

## Implementation Sketch

```text
mode = ref<EditMode>('cell')
columns = computed(() => [...baseColumns, ...(mode === 'row' ? [opsColumn] : [])])

PlusTable :mode="mode"
  #toolbar → el-radio-group v-model="mode"
  #cell-actions → 编辑 / 保存 / 取消（仅 row）
```

- `tableRef` 调用 `startRowEdit` / `commitRowEdit` / `cancelRowEdit` / `isRowEditing`
- description / hint / API 表：`mode` 一行改为「本页可切换四种」；hint 按当前 mode 简述

## Self-review

- 无占位符 / TBD
- 与现有 `#toolbar`、`#cell-actions`、`type: 'operation'` 用法一致（见 history-dirty / erp demos）
- 范围仅 demo 页，无组件层改动

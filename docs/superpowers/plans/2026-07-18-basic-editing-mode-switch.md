# Basic Editing Mode Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `basic-editing-demo` 用 toolbar 切换 `none|cell|row|table`，`row` 时显示操作列（编辑/保存/取消）。

**Architecture:** 单文件改动。`mode` 为 `ref<EditMode>`；`columns` 用 `computed` 在 `row` 时追加 `type: 'operation'`；`#toolbar` 放 `el-radio-group`；`#cell-actions` 调 expose 的行编辑 API；用本地 `editingRowId` + `@cell-dblclick` 同步按钮态。

**Tech Stack:** Vue 3、Element Plus、现有 `PlusTable` / `DemoPage` / `DemoBlock`。

**Spec:** `docs/superpowers/specs/2026-07-18-basic-editing-mode-switch-design.md`

## Global Constraints

- 只改 `src/views/plus-table/basic-editing-demo.vue`
- 不修改 `src/components/plus-table/**`
- 默认 `mode` 仍为 `cell`
- 切换 mode 不重置 `data`

---

## File Structure

| 路径                                          | 职责                              |
| --------------------------------------------- | --------------------------------- |
| `src/views/plus-table/basic-editing-demo.vue` | mode 切换 + row 操作列 + 文案更新 |

---

### Task 1: 实现 mode 切换与 row 操作列

**Files:**

- Modify: `src/views/plus-table/basic-editing-demo.vue`

**Interfaces:**

- Consumes: `EditMode`（`@/components/plus-table`）、expose `startRowEdit` / `commitRowEdit` / `cancelRowEdit`
- Produces: 可交互 demo（四种 mode + row 操作列）

- [x] **Step 1: script — mode / columns / row 操作**

```ts
import { computed, ref } from 'vue';
import { PlusTable, type EditMode } from '@/components/plus-table';

const mode = ref<EditMode>('cell');
const tableRef = ref<{
  startRowEdit: (rowIndex: number) => boolean;
  commitRowEdit: (rowIndex: number) => Promise<boolean>;
  cancelRowEdit: (rowIndex: number) => void;
}>();
const editingRowId = ref<number | null>(null);

const baseColumns = [/* 现有列 */];
const columns = computed(() =>
  mode.value === 'row'
    ? [
        ...baseColumns,
        {
          prop: 'actions',
          type: 'operation',
          label: '操作',
          width: 140,
          fixed: 'right',
        },
      ]
    : baseColumns,
);

function isEditingRow(row: Row) {
  return editingRowId.value === row.id;
}
function handleEdit(row: Row, rowIndex: number) {
  tableRef.value?.startRowEdit(rowIndex);
  editingRowId.value = row.id;
}
async function handleSave(row: Row, rowIndex: number) {
  const ok = await tableRef.value?.commitRowEdit(rowIndex);
  if (ok) editingRowId.value = null;
}
function handleCancel(_row: Row, rowIndex: number) {
  tableRef.value?.cancelRowEdit(rowIndex);
  editingRowId.value = null;
}
function handleCellDblclick(row: Row) {
  if (mode.value === 'row') editingRowId.value = row.id;
}
function handleModeChange() {
  editingRowId.value = null;
}
```

- [x] **Step 2: template — toolbar / actions / 文案**

- description：本页可切换四种 `mode`，并简述差异
- API 表 `mode` 行：改为「本页 toolbar 可切换」
- hint：按当前 mode 简述（可用简单 computed 文案）
- `PlusTable`：`ref`、`:mode="mode"`、`@cell-dblclick="handleCellDblclick"`
- `#toolbar`：`el-radio-group` + `@change="handleModeChange"`（或 `watch(mode)`）
- `#cell-actions`：未进编显示「编辑」；进编显示「保存」「取消」（`link` 按钮，`@click.stop`）

- [x] **Step 3: 类型检查**

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`
Expected: PASS（已通过）

手动验证建议：`pnpm dev` → `/plus-table/basic-editing`，切换四种 mode 与 row 操作列。

- [ ] **Step 4: Commit**（仅当用户明确要求时）

---

## Done when

- [x] toolbar 可切换四种 mode
- [x] row 模式操作列可用，其它模式无操作列
- [x] description / hint / API 文案已更新

# Task 1 Report: 组件插槽壳层 + 样式 + 挂载测试

**Date:** 2026-07-13  
**Status:** DONE  
**Commit:** `ff96b01` — feat(plus-table): add title and summary layout slots

---

## Summary

Implemented `#title` and `#summary` layout slots for PlusTable with header/footer flex shell, updated SCSS, and four mount tests verifying DOM structure and visibility rules.

---

## TDD Cycle

### RED

1. Created `table-slots.test.ts` per brief (assertions verbatim).
2. First run failed with **setup errors** (not DOM assertions): `ElTableColumn` requires table injection context; `./table-column` mock did not intercept in Vitest (real `PlusTableColumnNode` still rendered).
3. Extended the brief's `element-plus` mock with a stub `ElTableColumn` that invokes `default` slot with `{ $index: -1 }` to skip cell rendering — minimal change so tests fail/pass on **layout DOM**, not column internals.
4. Before implementation, tests would have failed on missing `.plus-table__header` / `.plus-table__footer` (verified by inspecting partial draft in `table.vue`).

### GREEN

1. **`table.vue`**
   - Added `title` / `summary` to `defineSlots`.
   - Added `footerEnabled = !!slots.summary || paginationEnabled`.
   - Replaced draft layout with spec structure:
     - `.plus-table__header` → `__title` (conditional) + `__toolbar`
     - `.plus-table__footer` (conditional via `footerEnabled`, `ref="paginationRef"`) → `__summary` (conditional) + `__pagination` (conditional)
   - Kept `el-table` / column / empty block unchanged inside `__grid`.

2. **`styles/index.scss`**
   - Added flex rules for `__header` / `__footer` / `__title` / `__summary`.
   - Moved toolbar bottom margin to `__header`; pagination uses `margin-left: auto` instead of nested flex-end.

### REFACTOR

No refactor needed — implementation matches brief minimal scope.

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm exec vitest run --environment happy-dom src/components/plus-table/table-slots.test.ts` | 4/4 PASS |
| `pnpm test` | 119/119 PASS (13 files) |
| `pnpm typecheck` | exit 0 |

---

## Self-Review

### Matches spec

- [x] No string props for title/summary
- [x] No summary business logic
- [x] Header always visible (toolbar + column settings)
- [x] Title wrapper only when `#title` provided
- [x] Footer when `#summary` or `total !== undefined`
- [x] Summary wrapper only when `#summary` provided
- [x] Pagination only when `total !== undefined`
- [x] `paginationRef` on `.plus-table__footer`
- [x] Surgical diff — no unrelated refactors

### Deviations / notes

1. **Test mock supplement:** Brief's `element-plus` mock needed `ElTableColumn` stub (with `$index: -1`) for mount to succeed. `./table-column` mock alone did not intercept in Vitest 4. Assertions unchanged.
2. **TDD ordering:** RED was blocked by test-environment setup errors; mock fix applied before GREEN implementation (same session).

### Risks for later tasks

- Adaptive height now measures full footer (including summary-only footer) — aligns with spec; Task 2+ demo should validate visually.
- `table-column` mock path may be worth documenting for future PlusTable mount tests.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/plus-table/table-slots.test.ts` | **Created** — 4 mount tests |
| `src/components/plus-table/table.vue` | Header/footer template, `defineSlots`, `footerEnabled` |
| `src/components/plus-table/styles/index.scss` | Header/footer/title/summary/toolbar/pagination styles |

---

## Out of Scope (unchanged)

- Demo page / API table updates (Task 2)
- `demo-content.test.ts` sync (Task 2)

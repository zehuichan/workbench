# Composables Folder Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `src/composables/` 从平铺文件改为每个 `useXxx` 一个文件夹 + `shared/`，目录表达边界；`@/composables` 公共 API 不变。

**Architecture:** 用 `git mv` 整文件搬家（保留历史）；每夹自带 `index.ts` 只 re-export 该夹公开面；`watch-readable` 进 `shared/`；根 `index.ts` 只从各夹入口聚合。不改运行时语义。

**Tech Stack:** Vue 3 composables、Vitest、TypeScript path alias `@/composables`、git mv。

**Spec:** `docs/superpowers/specs/2026-07-17-composables-folder-boundaries-design.md`

## Global Constraints

- 行为 / 类型语义零改动；纯搬家 + 相对 import 修正
- 调用方继续 `from '@/composables'`；不改 `src/views/**`
- 不从根 barrel 导出 `watchReadable` / `registerSaveHotkey`
- 验证：`pnpm test`（至少 composables 相关）+ `pnpm typecheck`
- 外科手术式：不顺手重构实现

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/composables/shared/watch-readable.ts` | 共享 watch 工具（非公共） |
| `src/composables/use-emit-effect/` | emit-effect 纯函数 + `useEmitEffect` + 测试 + 夹内 barrel |
| `src/composables/use-form-draft/` | `useFormDraft` + 测试 + 夹内 barrel |
| `src/composables/use-auto-save/` | `useAutoSave` + 测试 + 夹内 barrel |
| `src/composables/use-save-hotkey/` | registry（私有）+ `useSaveHotkey` + 测试 + 夹内 barrel |
| `src/composables/index.ts` | 根公开 API；只从上述四夹 re-export |

搬家后根目录不应再残留平铺的 `use-*.ts` / `emit-effect.ts` / `watch-readable.ts` / `save-hotkey-registry.ts`。

---

### Task 1: `use-emit-effect` 文件夹

**Files:**
- Create: `src/composables/use-emit-effect/index.ts`
- Move: `src/composables/emit-effect.ts` → `src/composables/use-emit-effect/emit-effect.ts`
- Move: `src/composables/emit-effect.test.ts` → `src/composables/use-emit-effect/emit-effect.test.ts`
- Move: `src/composables/use-emit-effect.ts` → `src/composables/use-emit-effect/use-emit-effect.ts`
- Move: `src/composables/use-emit-effect.test.ts` → `src/composables/use-emit-effect/use-emit-effect.test.ts`
- Modify: `src/composables/index.ts`（临时指向新路径，避免整仓断裂）

**Interfaces:**
- Consumes: 无（自包含）
- Produces: 夹内公开面见下方 `index.ts`；同夹内 `./emit-effect` / `./use-emit-effect` 相对路径保持不变

- [ ] **Step 1: 创建目录并用 git mv 搬家**

```bash
mkdir -p src/composables/use-emit-effect
git mv src/composables/emit-effect.ts src/composables/use-emit-effect/emit-effect.ts
git mv src/composables/emit-effect.test.ts src/composables/use-emit-effect/emit-effect.test.ts
git mv src/composables/use-emit-effect.ts src/composables/use-emit-effect/use-emit-effect.ts
git mv src/composables/use-emit-effect.test.ts src/composables/use-emit-effect/use-emit-effect.test.ts
```

- [ ] **Step 2: 写夹内 barrel**

Create `src/composables/use-emit-effect/index.ts`:

```ts
export {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
} from './emit-effect';
export type {
  DetailChangeCommand,
  DocumentDraft,
  DocumentLine,
  DocumentSummary,
  EmitEffectConfirmation,
  EmitEffectMutation,
  EmitEffectPolicy,
  EmitEffectRules,
  FieldSource,
  HeaderEmitRule,
  HeaderLineEffect,
} from './emit-effect';

export { useEmitEffect } from './use-emit-effect';
export type {
  UseEmitEffectOptions,
  UseEmitEffectReturn,
} from './use-emit-effect';
```

- [ ] **Step 3: 更新根 barrel 中 emit-effect 相关导出路径**

将 `src/composables/index.ts` 里对 `./emit-effect` 与 `./use-emit-effect` 的两段导出合并为从 `./use-emit-effect`（目录入口）一次 re-export：

```ts
export {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
  useEmitEffect,
} from './use-emit-effect';
export type {
  DetailChangeCommand,
  DocumentDraft,
  DocumentLine,
  DocumentSummary,
  EmitEffectConfirmation,
  EmitEffectMutation,
  EmitEffectPolicy,
  EmitEffectRules,
  FieldSource,
  HeaderEmitRule,
  HeaderLineEffect,
  UseEmitEffectOptions,
  UseEmitEffectReturn,
} from './use-emit-effect';
```

（`use-auto-save` / `use-form-draft` / `use-save-hotkey` 段暂保持原相对路径，待后续 Task 再改。）

- [ ] **Step 4: 跑 emit-effect 相关测试**

Run: `pnpm exec vitest run --environment happy-dom src/composables/use-emit-effect`

Expected: PASS（含 `emit-effect.test.ts` 与 `use-emit-effect.test.ts`）

- [ ] **Step 5: Commit**

```bash
git add src/composables/use-emit-effect src/composables/index.ts
git commit -m "$(cat <<'EOF'
refactor(composables): nest emit-effect under use-emit-effect/

EOF
)"
```

---

### Task 2: `shared/` + `use-form-draft` + `use-auto-save`

**Files:**
- Move: `src/composables/watch-readable.ts` → `src/composables/shared/watch-readable.ts`
- Create: `src/composables/use-form-draft/index.ts`
- Move: `src/composables/use-form-draft.ts` → `src/composables/use-form-draft/use-form-draft.ts`
- Move: `src/composables/use-form-draft.test.ts` → `src/composables/use-form-draft/use-form-draft.test.ts`
- Create: `src/composables/use-auto-save/index.ts`
- Move: `src/composables/use-auto-save.ts` → `src/composables/use-auto-save/use-auto-save.ts`
- Move: `src/composables/use-auto-save.test.ts` → `src/composables/use-auto-save/use-auto-save.test.ts`
- Modify: `use-form-draft.ts` / `use-auto-save.ts` 内 `watchReadable` import
- Modify: `src/composables/index.ts` 对应两段路径

**Interfaces:**
- Consumes: `watchReadable` from `../shared/watch-readable`
- Produces:
  - `useFormDraft` + `UseFormDraftOptions` / `UseFormDraftReturn`
  - `useAutoSave` + `AutoSaveStatus` / `UseAutoSaveOptions` / `UseAutoSaveReturn`

- [ ] **Step 1: git mv shared + 两个 hook 夹**

```bash
mkdir -p src/composables/shared src/composables/use-form-draft src/composables/use-auto-save
git mv src/composables/watch-readable.ts src/composables/shared/watch-readable.ts
git mv src/composables/use-form-draft.ts src/composables/use-form-draft/use-form-draft.ts
git mv src/composables/use-form-draft.test.ts src/composables/use-form-draft/use-form-draft.test.ts
git mv src/composables/use-auto-save.ts src/composables/use-auto-save/use-auto-save.ts
git mv src/composables/use-auto-save.test.ts src/composables/use-auto-save/use-auto-save.test.ts
```

- [ ] **Step 2: 修正 `watchReadable` 相对路径**

In `src/composables/use-form-draft/use-form-draft.ts` and `src/composables/use-auto-save/use-auto-save.ts`, change:

```ts
import { watchReadable } from './watch-readable';
```

to:

```ts
import { watchReadable } from '../shared/watch-readable';
```

测试文件仍从 `./use-form-draft` / `./use-auto-save` 导入，无需改。

- [ ] **Step 3: 写两夹 barrel**

`src/composables/use-form-draft/index.ts`:

```ts
export { useFormDraft } from './use-form-draft';
export type { UseFormDraftOptions, UseFormDraftReturn } from './use-form-draft';
```

`src/composables/use-auto-save/index.ts`:

```ts
export { useAutoSave } from './use-auto-save';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from './use-auto-save';
```

- [ ] **Step 4: 更新根 barrel 路径**

将 `./use-form-draft` / `./use-auto-save` 导出保持符号不变（目录入口已可解析）；确认无残留对根级平铺文件的引用。

- [ ] **Step 5: 跑相关测试**

Run: `pnpm exec vitest run --environment happy-dom src/composables/use-form-draft src/composables/use-auto-save`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/composables/shared src/composables/use-form-draft src/composables/use-auto-save src/composables/index.ts
git commit -m "$(cat <<'EOF'
refactor(composables): nest form-draft/auto-save and extract shared/

EOF
)"
```

---

### Task 3: `use-save-hotkey` 文件夹

**Files:**
- Create: `src/composables/use-save-hotkey/index.ts`
- Move: `src/composables/save-hotkey-registry.ts` → `src/composables/use-save-hotkey/save-hotkey-registry.ts`
- Move: `src/composables/use-save-hotkey.ts` → `src/composables/use-save-hotkey/use-save-hotkey.ts`
- Move: `src/composables/use-save-hotkey.test.ts` → `src/composables/use-save-hotkey/use-save-hotkey.test.ts`
- Modify: `src/composables/index.ts`（若仍指向平铺文件则改为目录）

**Interfaces:**
- Consumes: `registerSaveHotkey` from `./save-hotkey-registry`（同夹，路径不变）
- Produces: `useSaveHotkey` + `UseSaveHotkeyOptions`（registry **不**进夹内 barrel）

- [ ] **Step 1: git mv**

```bash
mkdir -p src/composables/use-save-hotkey
git mv src/composables/save-hotkey-registry.ts src/composables/use-save-hotkey/save-hotkey-registry.ts
git mv src/composables/use-save-hotkey.ts src/composables/use-save-hotkey/use-save-hotkey.ts
git mv src/composables/use-save-hotkey.test.ts src/composables/use-save-hotkey/use-save-hotkey.test.ts
```

- [ ] **Step 2: 写夹内 barrel（不含 registry）**

`src/composables/use-save-hotkey/index.ts`:

```ts
export { useSaveHotkey } from './use-save-hotkey';
export type { UseSaveHotkeyOptions } from './use-save-hotkey';
```

- [ ] **Step 3: 确认 `use-save-hotkey.ts` 仍为**

```ts
import { registerSaveHotkey } from './save-hotkey-registry';
```

- [ ] **Step 4: 跑测试**

Run: `pnpm exec vitest run --environment happy-dom src/composables/use-save-hotkey`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/use-save-hotkey src/composables/index.ts
git commit -m "$(cat <<'EOF'
refactor(composables): nest save-hotkey under use-save-hotkey/

EOF
)"
```

---

### Task 4: 根 barrel 定稿 + 全量验证

**Files:**
- Modify: `src/composables/index.ts`（最终形态）
- Verify: 无残留平铺实现文件；views 无需改动

**Interfaces:**
- Produces: 与搬家前相同的 `@/composables` 符号集合

- [ ] **Step 1: 将根 `index.ts` 写成最终形态**

```ts
export { useAutoSave } from './use-auto-save';
export type {
  AutoSaveStatus,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from './use-auto-save';

export {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
  useEmitEffect,
} from './use-emit-effect';
export type {
  DetailChangeCommand,
  DocumentDraft,
  DocumentLine,
  DocumentSummary,
  EmitEffectConfirmation,
  EmitEffectMutation,
  EmitEffectPolicy,
  EmitEffectRules,
  FieldSource,
  HeaderEmitRule,
  HeaderLineEffect,
  UseEmitEffectOptions,
  UseEmitEffectReturn,
} from './use-emit-effect';

export { useFormDraft } from './use-form-draft';
export type { UseFormDraftOptions, UseFormDraftReturn } from './use-form-draft';

export { useSaveHotkey } from './use-save-hotkey';
export type { UseSaveHotkeyOptions } from './use-save-hotkey';
```

确认**没有**导出 `watchReadable` 或 `registerSaveHotkey`。

- [ ] **Step 2: 确认目录只剩边界清晰的结构**

Run: `find src/composables -type f | sort`（Windows Git Bash 可用）

Expected 文件集合等价于：

```text
src/composables/index.ts
src/composables/shared/watch-readable.ts
src/composables/use-auto-save/index.ts
src/composables/use-auto-save/use-auto-save.ts
src/composables/use-auto-save/use-auto-save.test.ts
src/composables/use-emit-effect/emit-effect.ts
src/composables/use-emit-effect/emit-effect.test.ts
src/composables/use-emit-effect/index.ts
src/composables/use-emit-effect/use-emit-effect.ts
src/composables/use-emit-effect/use-emit-effect.test.ts
src/composables/use-form-draft/index.ts
src/composables/use-form-draft/use-form-draft.ts
src/composables/use-form-draft/use-form-draft.test.ts
src/composables/use-save-hotkey/index.ts
src/composables/use-save-hotkey/save-hotkey-registry.ts
src/composables/use-save-hotkey/use-save-hotkey.ts
src/composables/use-save-hotkey/use-save-hotkey.test.ts
```

- [ ] **Step 3: 全量 composables + ERP 依赖测试 + typecheck**

Run:

```bash
pnpm exec vitest run --environment happy-dom src/composables src/views/erp
pnpm typecheck
```

Expected: 全部 PASS / typecheck 无错

- [ ] **Step 4: Commit（若 Step 1 有实质 diff）**

```bash
git add src/composables/index.ts
git commit -m "$(cat <<'EOF'
refactor(composables): finalize root barrel after folder split

EOF
)"
```

若与 Task 3 已无 diff，跳过本 commit。

---

## Spec coverage (self-review)

| Spec 要求 | Task |
|-----------|------|
| 每 `useXxx` 一夹 | 1–3 |
| `shared/watch-readable` | 2 |
| 根 barrel 公开 API 不变 | 1 Step 3、4 |
| 夹内 barrel 只导出公开面 | 1–3 的 `index.ts` |
| registry / watchReadable 不公共导出 | 2、3、4 |
| 不改 views import | 全任务（验证靠 `@/composables`） |
| 测试通过 | 各 Task Step 跑测 + Task 4 全量 |

Placeholder scan: 无 TBD /「类似 Task N」。类型名与现有 `index.ts` 一致。

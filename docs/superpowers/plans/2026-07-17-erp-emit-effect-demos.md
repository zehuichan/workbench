# ERP Emit-Effect Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shared ERP document shell with three self-contained demos, and extract a reusable `emit-effect` / `useEmitEffect` engine into `@/composables`.

**Architecture:** Pure functions in `emit-effect.ts` plan header/detail side effects on draft copies (force / inherit / recalculate → line recalc → summary). `useEmitEffect` owns the draft ref and applies mutations after optional caller-provided confirmation. Each ERP route is a full playground page with a sibling rules module under `views/erp/`. Delete `src/components/erp-document-demo/`.

**Tech Stack:** Vue 3.5 Composition API, TypeScript 5.9 strict mode, Element Plus 2.14, PlusTable, es-toolkit, Vue Router 5, Vitest 4, Vite 8.

**Spec:** `docs/superpowers/specs/2026-07-17-erp-emit-effect-demos-design.md`  
**Supersedes plan:** `docs/superpowers/plans/2026-07-17-erp-document-linkage-demos.md`

## Global Constraints

- Keep PlusTable's public API unchanged.
- Do not add runtime or development dependencies.
- Export the engine from `@/composables`; keep scenario UI/rules under `src/views/erp/`.
- Use explicit command handlers; do not introduce header/detail watcher chains.
- Recompute summaries from all lines after every accepted mutation.
- No mock server, version conflict UI, linkage log panel, or `clientRevision` / `serverVersion`.
- Keep existing ERP routes, titles, and the `/` redirect unchanged.
- Use Chinese UI copy and the existing Component Labs documentation style.
- Do not create git commits unless the user explicitly requests them. If a step says “Commit”, skip it unless commits were requested; stage nothing automatically.

---

## File Map

**Create**

- `src/composables/emit-effect.ts` — types + pure mutation planners
- `src/composables/emit-effect.test.ts`
- `src/composables/use-emit-effect.ts`
- `src/composables/use-emit-effect.test.ts`
- `src/views/erp/emit-helpers.ts` — shared options / force+inherit helpers / money utils for demos only
- `src/views/erp/sales-order-linkage.ts`
- `src/views/erp/purchase-order-linkage.ts`
- `src/views/erp/expense-report-linkage.ts`
- (rewrite) `src/views/erp/sales-order-linkage-demo.vue`
- (rewrite) `src/views/erp/purchase-order-linkage-demo.vue`
- (rewrite) `src/views/erp/expense-report-linkage-demo.vue`

**Modify**

- `src/composables/index.ts` — export `useEmitEffect` and public emit-effect types/functions
- `src/views/demo-content.test.ts` — ERP contracts assert `useEmitEffect`, not shell
- `README.md` — mention composable reuse; demos stay under `views/erp`

**Delete**

- Entire `src/components/erp-document-demo/` directory

**Unchanged**

- `src/router/index.ts` route paths/meta (still import the three views)
- `src/router/demo-routes.test.ts` expected routes
- `src/layouts/playground-layout.vue` group ordering

---

### Task 1: Pure emit-effect engine

**Files:**

- Create: `src/composables/emit-effect.ts`
- Test: `src/composables/emit-effect.test.ts`

**Interfaces:**

- Produces:
  - Types: `FieldSource`, `EmitEffectPolicy`, `DocumentLine`, `DocumentSummary`, `DocumentDraft`, `HeaderLineEffect`, `HeaderEmitRule`, `EmitEffectRules`, `EmitEffectConfirmation`, `EmitEffectMutation`, `DetailChangeCommand`
  - Functions: `normalizeDraft`, `buildHeaderMutation`, `applyDetailMutation`, `addLineMutation`, `removeLineMutation`
- Consumes: `es-toolkit` (`cloneDeep`, `isEqual`)

- [ ] **Step 1: Write the failing pure-function tests**

Create `src/composables/emit-effect.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
  type DocumentDraft,
  type EmitEffectRules,
} from './emit-effect';

const rules: EmitEffectRules = {
  sourceFields: ['warehouseId'],
  headerRules: {
    currency: {
      policy: 'force',
      requiresConfirmation: true,
      apply: (_line, nextHeader) => ({
        patch: { currency: nextHeader.currency },
      }),
    },
    warehouseId: {
      policy: 'inherit',
      apply: (line, nextHeader) =>
        line.fieldSources.warehouseId === 'manual'
          ? { preservedFields: ['warehouseId'] }
          : { patch: { warehouseId: nextHeader.warehouseId } },
    },
    multiplier: {
      policy: 'recalculate',
      apply: () => ({}),
    },
  },
  createLine: (_draft, id) => ({
    id,
    fieldSources: { warehouseId: 'inherited' },
    quantity: 1,
    currency: 'CNY',
    warehouseId: 'WH-A',
    amount: 2,
  }),
  recalculateLine: (line, header) => ({
    ...line,
    amount: Number(line.quantity) * Number(header.multiplier),
  }),
  summarize: (lines) => ({
    total: lines.reduce((sum, line) => sum + Number(line.amount), 0),
  }),
};

function initialDraft(): DocumentDraft {
  return {
    dirty: false,
    header: { currency: 'CNY', warehouseId: 'WH-A', multiplier: 2 },
    lines: [
      {
        id: '1',
        fieldSources: { warehouseId: 'inherited' },
        quantity: 2,
        currency: 'CNY',
        warehouseId: 'WH-A',
        amount: 4,
      },
      {
        id: '2',
        fieldSources: { warehouseId: 'manual' },
        quantity: 3,
        currency: 'CNY',
        warehouseId: 'WH-B',
        amount: 6,
      },
    ],
    summary: { total: 10 },
  };
}

describe('emit-effect', () => {
  it('forces values to every line without mutating the source draft', () => {
    const source = initialDraft();
    const mutation = buildHeaderMutation(rules, source, 'currency', 'USD');

    expect(mutation.nextDraft.lines.map((line) => line.currency)).toEqual(['USD', 'USD']);
    expect(source.lines[0]?.currency).toBe('CNY');
    expect(mutation.confirmation?.affectedCount).toBe(2);
    expect(mutation.confirmation?.fields).toContain('currency');
  });

  it('preserves manual inherited fields', () => {
    const mutation = buildHeaderMutation(rules, initialDraft(), 'warehouseId', 'WH-SZ');

    expect(mutation.nextDraft.lines[0]?.warehouseId).toBe('WH-SZ');
    expect(mutation.nextDraft.lines[1]?.warehouseId).toBe('WH-B');
    expect(mutation.affectedLineIds).toEqual(['1']);
    expect(mutation.preservedLineIds).toEqual(['2']);
  });

  it('recalculates derived amounts from header context', () => {
    const mutation = buildHeaderMutation(rules, initialDraft(), 'multiplier', 3);

    expect(mutation.nextDraft.lines.map((line) => line.amount)).toEqual([6, 9]);
    expect(mutation.nextDraft.summary.total).toBe(15);
    expect(mutation.confirmation).toBeUndefined();
  });

  it('marks source fields manual on detail edit and refreshes summary', () => {
    const mutation = applyDetailMutation(rules, initialDraft(), {
      rowId: '1',
      prop: 'warehouseId',
      value: 'WH-BJ',
      oldValue: 'WH-A',
    });

    expect(mutation.nextDraft.lines[0]?.warehouseId).toBe('WH-BJ');
    expect(mutation.nextDraft.lines[0]?.fieldSources.warehouseId).toBe('manual');
    expect(mutation.nextDraft.dirty).toBe(true);
  });

  it('adds and removes lines with summary refresh', () => {
    const added = addLineMutation(rules, initialDraft(), '3');
    expect(added.nextDraft.lines).toHaveLength(3);
    expect(added.nextDraft.summary.total).toBe(12);

    const removed = removeLineMutation(rules, added.nextDraft, '2');
    expect(removed.nextDraft.lines.map((line) => line.id)).toEqual(['1', '3']);
    expect(removed.nextDraft.summary.total).toBe(6);
  });

  it('normalizeDraft recalculates lines and summary', () => {
    const draft = initialDraft();
    draft.lines[0]!.amount = 999;
    const normalized = normalizeDraft(rules, draft);
    expect(normalized.lines[0]?.amount).toBe(4);
    expect(normalized.summary.total).toBe(10);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run --environment happy-dom src/composables/emit-effect.test.ts`

Expected: FAIL (module or exports missing)

- [ ] **Step 3: Implement `emit-effect.ts`**

Create `src/composables/emit-effect.ts` with these contracts (adapt internals from the deleted `document-linkage.ts`, but drop `record`, `clientRevision`, `serverVersion`, `validate`, UI field defs):

```ts
import { cloneDeep, isEqual } from 'es-toolkit';

export type FieldSource = 'inherited' | 'manual';
export type EmitEffectPolicy = 'force' | 'inherit' | 'recalculate';

export interface DocumentLine {
  id: string;
  fieldSources: Record<string, FieldSource>;
  [field: string]: unknown;
}

export interface DocumentSummary {
  [field: string]: number;
}

export interface DocumentDraft<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  header: H;
  lines: L[];
  summary: DocumentSummary;
  dirty: boolean;
}

export interface HeaderLineEffect {
  patch?: Record<string, unknown>;
  sourcePatch?: Record<string, FieldSource>;
  preservedFields?: string[];
}

export interface HeaderEmitRule {
  policy: EmitEffectPolicy;
  requiresConfirmation?: boolean;
  apply: (
    line: DocumentLine,
    nextHeader: Record<string, unknown>,
    previousHeader: Record<string, unknown>,
  ) => HeaderLineEffect;
}

export interface EmitEffectRules<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  /** Detail props that track inherited/manual sources. */
  sourceFields: string[];
  headerRules: Record<string, HeaderEmitRule>;
  createLine: (draft: DocumentDraft<H, L>, id: string) => L;
  recalculateLine: (line: L, header: H) => L;
  summarize: (lines: L[], header: H) => DocumentSummary;
}

export interface EmitEffectConfirmation {
  affectedCount: number;
  preservedCount: number;
  fields: string[];
  message: string;
}

export interface EmitEffectMutation {
  nextDraft: DocumentDraft;
  affectedLineIds: string[];
  preservedLineIds: string[];
  confirmation?: EmitEffectConfirmation;
}

export interface DetailChangeCommand {
  rowId: string;
  prop: string;
  value: unknown;
  oldValue: unknown;
}

// Implement:
// - finalize(rules, draft, dirty): map recalculateLine + summarize
// - normalizeDraft(rules, source)
// - buildHeaderMutation(rules, source, field, value)
//     throw if headerRules[field] missing
//     clone draft, set header[field], map lines via rule.apply + recalculateLine
//     track affected/preserved ids and changed fields (exclude fieldSources)
//     if requiresConfirmation && affectedLineIds.length > 0, set confirmation
//     set dirty true; never mutate source
// - applyDetailMutation: find line, set value, if prop in sourceFields mark manual,
//     recalculate that line, summarize, dirty true
// - addLineMutation / removeLineMutation: mutate lines on copy, finalize(..., true)
```

Confirmation message format (Chinese):

```ts
`将更新 ${affectedCount} 行字段（${fields.join('、')}），保留 ${preservedCount} 行人工值。`;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run --environment happy-dom src/composables/emit-effect.test.ts`

Expected: PASS

- [ ] **Step 5: Commit (only if user requested commits)**

```bash
git add src/composables/emit-effect.ts src/composables/emit-effect.test.ts
git commit -m "$(cat <<'EOF'
feat(composables): add emit-effect pure mutation engine

EOF
)"
```

---

### Task 2: `useEmitEffect` composable + public exports

**Files:**

- Create: `src/composables/use-emit-effect.ts`
- Test: `src/composables/use-emit-effect.test.ts`
- Modify: `src/composables/index.ts`

**Interfaces:**

- Consumes: `EmitEffectRules`, `DocumentDraft`, mutation helpers from `./emit-effect`
- Produces:

```ts
export interface UseEmitEffectOptions<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  rules: EmitEffectRules<H, L>;
  initialDraft: DocumentDraft<H, L>;
  confirm?: (confirmation: EmitEffectConfirmation) => boolean | Promise<boolean>;
}

export interface UseEmitEffectReturn<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  draft: Ref<DocumentDraft<H, L>>;
  changeHeader: (field: string, value: unknown) => Promise<boolean>;
  changeCell: (command: DetailChangeCommand) => Promise<boolean>;
  addLine: (id: string) => void;
  removeLine: (id: string) => void;
  reset: (next?: DocumentDraft<H, L>) => void;
}
```

- `changeHeader` / `changeCell` return `true` if applied, `false` if confirmation rejected
- Default `confirm` resolves to `true` when omitted
- `reset` replaces draft with `cloneDeep(next ?? initialDraft)` and clears dirty semantics of that snapshot

- [ ] **Step 1: Write failing composable tests**

Create `src/composables/use-emit-effect.test.ts` (follow `use-auto-save.test.ts` scope pattern):

```ts
import { effectScope, type EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type DocumentDraft, type EmitEffectRules } from './emit-effect';
import { useEmitEffect } from './use-emit-effect';

// Reuse the same minimal `rules` + `initialDraft()` as emit-effect.test.ts
// (copy the fixtures into this file — do not import from the other test file).

describe('useEmitEffect', () => {
  let scope: EffectScope;

  beforeEach(() => {
    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
  });

  it('applies header mutations that need no confirmation', async () => {
    const api = scope.run(() => useEmitEffect({ rules, initialDraft: initialDraft() }))!;

    const ok = await api.changeHeader('multiplier', 3);
    expect(ok).toBe(true);
    expect(api.draft.value.summary.total).toBe(15);
    expect(api.draft.value.dirty).toBe(true);
  });

  it('skips commit when confirm returns false', async () => {
    const confirm = vi.fn(async () => false);
    const api = scope.run(() =>
      useEmitEffect({
        rules,
        initialDraft: initialDraft(),
        confirm,
      }),
    )!;

    const ok = await api.changeHeader('currency', 'USD');
    expect(ok).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
    expect(api.draft.value.header.currency).toBe('CNY');
    expect(api.draft.value.dirty).toBe(false);
  });

  it('commits after confirm returns true', async () => {
    const api = scope.run(() =>
      useEmitEffect({
        rules,
        initialDraft: initialDraft(),
        confirm: async () => true,
      }),
    )!;

    const ok = await api.changeHeader('currency', 'USD');
    expect(ok).toBe(true);
    expect(api.draft.value.lines.every((line) => line.currency === 'USD')).toBe(true);
  });

  it('resets to the initial snapshot', async () => {
    const api = scope.run(() => useEmitEffect({ rules, initialDraft: initialDraft() }))!;
    await api.changeHeader('multiplier', 3);
    api.reset();
    expect(api.draft.value.summary.total).toBe(10);
    expect(api.draft.value.dirty).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run --environment happy-dom src/composables/use-emit-effect.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement `use-emit-effect.ts`**

```ts
import { cloneDeep } from 'es-toolkit';
import { ref, type Ref } from 'vue';
import {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  removeLineMutation,
  type DetailChangeCommand,
  type DocumentDraft,
  type DocumentLine,
  type EmitEffectConfirmation,
  type EmitEffectRules,
} from './emit-effect';

export interface UseEmitEffectOptions<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  rules: EmitEffectRules<H, L>;
  initialDraft: DocumentDraft<H, L>;
  confirm?: (confirmation: EmitEffectConfirmation) => boolean | Promise<boolean>;
}

export interface UseEmitEffectReturn<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  draft: Ref<DocumentDraft<H, L>>;
  changeHeader: (field: string, value: unknown) => Promise<boolean>;
  changeCell: (command: DetailChangeCommand) => Promise<boolean>;
  addLine: (id: string) => void;
  removeLine: (id: string) => void;
  reset: (next?: DocumentDraft<H, L>) => void;
}

export function useEmitEffect<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
>(options: UseEmitEffectOptions<H, L>): UseEmitEffectReturn<H, L> {
  const initial = cloneDeep(options.initialDraft);
  const draft = ref(cloneDeep(initial)) as Ref<DocumentDraft<H, L>>;

  async function commit(mutation: ReturnType<typeof buildHeaderMutation>): Promise<boolean> {
    if (mutation.confirmation) {
      const accepted = await (options.confirm?.(mutation.confirmation) ?? true);
      if (!accepted) return false;
    }
    draft.value = mutation.nextDraft as DocumentDraft<H, L>;
    return true;
  }

  return {
    draft,
    changeHeader: (field, value) =>
      commit(buildHeaderMutation(options.rules, draft.value, field, value)),
    changeCell: (command) => commit(applyDetailMutation(options.rules, draft.value, command)),
    addLine: (id) => {
      draft.value = addLineMutation(options.rules, draft.value, id).nextDraft as DocumentDraft<
        H,
        L
      >;
    },
    removeLine: (id) => {
      draft.value = removeLineMutation(options.rules, draft.value, id).nextDraft as DocumentDraft<
        H,
        L
      >;
    },
    reset: (next) => {
      draft.value = cloneDeep(next ?? initial);
    },
  };
}
```

- [ ] **Step 4: Export from `src/composables/index.ts`**

Append:

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
export type { UseEmitEffectOptions, UseEmitEffectReturn } from './use-emit-effect';
```

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run --environment happy-dom src/composables/emit-effect.test.ts src/composables/use-emit-effect.test.ts`

Expected: PASS

- [ ] **Step 6: Commit (only if user requested commits)**

```bash
git add src/composables/use-emit-effect.ts src/composables/use-emit-effect.test.ts src/composables/index.ts
git commit -m "$(cat <<'EOF'
feat(composables): add useEmitEffect for controlled draft commits

EOF
)"
```

---

### Task 3: Sales order self-contained demo

**Files:**

- Create: `src/views/erp/emit-helpers.ts`
- Create: `src/views/erp/sales-order-linkage.ts`
- Rewrite: `src/views/erp/sales-order-linkage-demo.vue`
- Test: extend/replace ERP section in `src/views/demo-content.test.ts` after all three pages exist (do partial assertions in Task 5); for this task add a focused rules test file:

  - Create: `src/views/erp/sales-order-linkage.test.ts`

**Interfaces:**

- Consumes: `EmitEffectRules`, `DocumentDraft`, `useEmitEffect` from `@/composables`
- Produces: `salesOrderRules`, `createSalesOrderDraft`, `salesOrderColumns` (PlusTable columns for the page)

**Slim field set**

Header (4): `customerId` (recalculate unit price), `currency` (force), `warehouseId` (inherit), `taxRate` (inherit)

Detail: `productId`, `quantity`, `currency`, `warehouseId`, `unitPrice`, `taxRate`, `amount` (readonly = qty × unitPrice × (1+taxRate) or simpler `qty * unitPrice` with tax in summary — pick one consistent formula and keep it in `recalculateLine` / `summarize`)

Recommended formula:

```text
amount = round2(quantity * unitPrice * (1 + taxRate))
summary.totalQty = sum(quantity)
summary.totalAmount = sum(amount)
```

- [ ] **Step 1: Write failing sales rules test**

```ts
import { describe, expect, it } from 'vitest';
import { buildHeaderMutation, applyDetailMutation } from '@/composables';
import { createSalesOrderDraft, salesOrderRules } from './sales-order-linkage';

describe('sales-order-linkage rules', () => {
  it('forces currency and preserves manual warehouse', () => {
    const draft = createSalesOrderDraft();
    // ensure line 2 warehouse is manual in factory
    const currency = buildHeaderMutation(salesOrderRules, draft, 'currency', 'USD');
    expect(currency.nextDraft.lines.every((line) => line.currency === 'USD')).toBe(true);

    const warehouse = buildHeaderMutation(salesOrderRules, draft, 'warehouseId', 'WH-SZ');
    const manual = warehouse.nextDraft.lines.find(
      (line) => line.fieldSources.warehouseId === 'manual',
    );
    expect(manual?.warehouseId).not.toBe('WH-SZ');
  });

  it('reprices inherited unit prices when customer changes', () => {
    const draft = createSalesOrderDraft();
    const mutation = buildHeaderMutation(salesOrderRules, draft, 'customerId', 'customer-channel');
    expect(mutation.nextDraft.lines[0]?.unitPrice).not.toBe(draft.lines[0]?.unitPrice);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --environment happy-dom src/views/erp/sales-order-linkage.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement `emit-helpers.ts` and `sales-order-linkage.ts`**

`emit-helpers.ts` should include (ported/slimmed from old `scenarios/shared.ts`):

- `CURRENCY_OPTIONS`, `WAREHOUSE_OPTIONS`
- `money`, `forceField`, `inheritField`
- small helpers for recalculate pricing if useful

`sales-order-linkage.ts` exports:

```ts
export const salesOrderRules: EmitEffectRules;
export function createSalesOrderDraft(): DocumentDraft;
export const salesOrderColumns: PlusTableColumnDef[]; // page columns including source + actions as needed
export const SALES_CUSTOMER_OPTIONS: { label: string; value: string }[];
export const SALES_PRODUCT_OPTIONS: { label: string; value: string }[];
```

Initial draft: 2 lines, one with `warehouseId` / `taxRate` inherited, one with at least `warehouseId: manual` so inherit demo works. Include `documentNo` inside `header` if the page wants to show it (not on `DocumentDraft` root).

- [ ] **Step 4: Rewrite `sales-order-linkage-demo.vue` as a full page**

Structure (mirror PlusTable demos):

```vue
<script setup lang="ts">
import { ElMessageBox } from 'element-plus';
import { computed, ref } from 'vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoPage from '@/components/demo/demo-page.vue';
import { PlusTable } from '@/components/plus-table';
import { useEmitEffect } from '@/composables';
import {
  createSalesOrderDraft,
  salesOrderColumns,
  salesOrderRules,
  // options...
} from './sales-order-linkage';

defineOptions({ name: 'SalesOrderLinkageDemo' });

const statusText = ref('单据已载入');
let nextLineId = 3;

const { draft, changeHeader, changeCell, addLine, removeLine } = useEmitEffect({
  rules: salesOrderRules,
  initialDraft: createSalesOrderDraft(),
  confirm: async (confirmation) => {
    try {
      await ElMessageBox.confirm(confirmation.message, '确认传播', {
        type: 'warning',
      });
      return true;
    } catch {
      return false;
    }
  },
});

// Wire header el-form selects/inputs → changeHeader
// Wire PlusTable cell commit → changeCell
// Add/remove line buttons → addLine / removeLine
// Show summary from draft.summary
// Show field source column (format from line.fieldSources)
// No save / conflict / linkage log
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      <!-- short Chinese copy: force / inherit / recalculate for sales -->
    </template>
    <DemoBlock>
      <template #hint>改表头观察明细传播；改明细仓库/税率会标记为人工值。</template>
      <!-- status line, header form, PlusTable, summary -->
    </DemoBlock>
  </DemoPage>
</template>
```

Keep the page lean: one `DemoBlock`, optional tiny API note is fine but do **not** require large `DemoApiTable` sections. Prefer readability over matching PlusTable’s multi-table API docs.

Do **not** import anything from `@/components/erp-document-demo`.

- [ ] **Step 5: Run sales tests**

Run: `pnpm exec vitest run --environment happy-dom src/views/erp/sales-order-linkage.test.ts`

Expected: PASS

- [ ] **Step 6: Commit (only if user requested commits)**

```bash
git add src/views/erp/emit-helpers.ts src/views/erp/sales-order-linkage.ts src/views/erp/sales-order-linkage.test.ts src/views/erp/sales-order-linkage-demo.vue
git commit -m "$(cat <<'EOF'
feat(erp): make sales-order demo a self-contained emit-effect page

EOF
)"
```

---

### Task 4: Purchase order + expense report demos

**Files:**

- Create: `src/views/erp/purchase-order-linkage.ts`
- Create: `src/views/erp/purchase-order-linkage.test.ts`
- Rewrite: `src/views/erp/purchase-order-linkage-demo.vue`
- Create: `src/views/erp/expense-report-linkage.ts`
- Create: `src/views/erp/expense-report-linkage.test.ts`
- Rewrite: `src/views/erp/expense-report-linkage-demo.vue`

**Slim field sets**

Purchase header: `supplierId` (recalculate price), `orgId` (force), `currency` (force), `warehouseId` (inherit), — if five is too many drop `orgId` and keep currency force + supplier recalculate + warehouse/tax inherit (4 fields).

Expense header: `departmentId` (inherit), `projectId` (inherit), `currency` (force), `exchangeRate` (recalculate base amount).

- [ ] **Step 1: Write failing rules tests for both scenarios**

Each file asserts:

1. One force header field updates all lines
2. One inherit field preserves a manual line
3. One recalculate/header-context field changes computed money

- [ ] **Step 2: Run to verify fail**

Run: `pnpm exec vitest run --environment happy-dom src/views/erp/purchase-order-linkage.test.ts src/views/erp/expense-report-linkage.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement both `*-linkage.ts` modules**

Reuse `emit-helpers.ts`. Port only the slimmed calculations from the old scenario files; delete unused pricing tables / validation issue builders.

- [ ] **Step 4: Rewrite both demo Vue pages**

Same structure as sales page: `useEmitEffect` + `ElMessageBox` confirm + header form + PlusTable + summary + status text. No shell import.

- [ ] **Step 5: Run scenario tests**

Run: `pnpm exec vitest run --environment happy-dom src/views/erp/purchase-order-linkage.test.ts src/views/erp/expense-report-linkage.test.ts src/views/erp/sales-order-linkage.test.ts`

Expected: PASS

- [ ] **Step 6: Commit (only if user requested commits)**

```bash
git add src/views/erp/purchase-order-linkage.ts src/views/erp/purchase-order-linkage.test.ts src/views/erp/purchase-order-linkage-demo.vue src/views/erp/expense-report-linkage.ts src/views/erp/expense-report-linkage.test.ts src/views/erp/expense-report-linkage-demo.vue
git commit -m "$(cat <<'EOF'
feat(erp): add purchase and expense self-contained emit-effect demos

EOF
)"
```

---

### Task 5: Delete shell, update contracts, verify

**Files:**

- Delete: entire `src/components/erp-document-demo/`
- Modify: `src/views/demo-content.test.ts`
- Modify: `README.md` (brief note that ERP demos use `useEmitEffect` from `@/composables`)

- [ ] **Step 1: Update ERP demo content contracts**

Replace the `erpDemos` block in `src/views/demo-content.test.ts` with:

```ts
const erpDemos = [
  [salesOrder, './erp/sales-order-linkage-demo.vue'],
  [purchaseOrder, './erp/purchase-order-linkage-demo.vue'],
  [expenseReport, './erp/expense-report-linkage-demo.vue'],
] as const;

// inside describe:
it.each(erpDemos)('keeps ERP demo self-contained with useEmitEffect in %s', (source) => {
  expect(source).toContain('useEmitEffect');
  expect(source).not.toContain('ErpDocumentDemo');
  expect(source).not.toContain('erp-document-demo');
  expect(source).not.toContain('createMockDocumentServer');
  expect(source).not.toContain('模拟并发');
  expect(source).toContain('<template #description>');
  expect(source).toContain('DemoPage');
  expect(source).toContain('PlusTable');
});
```

Fix the `it.each` title/args to match vitest’s callback signature (path string second arg if needed).

- [ ] **Step 2: Delete the old component directory**

```bash
rm -rf src/components/erp-document-demo
```

On Windows Git Bash the same command works. Ensure no remaining imports:

Run: `rg "erp-document-demo|ErpDocumentDemo|mock-document-server|document-linkage" src`

Expected: no matches (except possibly historical docs under `docs/`)

- [ ] **Step 3: Update README**

Under ERP routes, add one line:

```md
引擎：`useEmitEffect`（`@/composables`），三页为独立完整 demo。
```

Adjust the tree line if it still implies a shared shell under `components/`.

- [ ] **Step 4: Full verification**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: all PASS / build succeeds

- [ ] **Step 5: Commit (only if user requested commits)**

```bash
git add -A src/components/erp-document-demo src/views/demo-content.test.ts README.md src/views/erp src/composables
git commit -m "$(cat <<'EOF'
refactor(erp): remove document demo shell; demos use useEmitEffect

EOF
)"
```

---

## Self-Review Checklist (author)

1. **Spec coverage:** composable export, three full pages, slim features, delete shell/mock/log/conflict, routes unchanged — covered by Tasks 1–5.
2. **Placeholders:** none intentional; scenario Vue markup is described structurally because three near-identical pages would bloat the plan — implementers must still produce complete SFCs, not stubs.
3. **Type consistency:** `EmitEffectRules` / `DocumentDraft` / `useEmitEffect` names match the spec’s emit-effect naming (not document-linkage).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-17-erp-emit-effect-demos.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — execute tasks in this session with checkpoints

Which approach?

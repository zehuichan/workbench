# ERP Currency + Exchange Rate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire demo exchange rates into all three ERP linkage demos so currency changes conditionally refresh the header rate and every line recomputes `localAmount`.

**Architecture:** Keep `useEmitEffect` unchanged. Add shared rate helpers and `forceCurrencyWithRate` in `views/erp/emit-helpers.ts` (syncs header rate by mutating the shared `nextHeader` during apply). Sales/purchase gain `exchangeRate` + line/summary local amounts; expense swaps currency force for the new helper.

**Tech Stack:** Vue 3 Composition API, TypeScript, Element Plus, PlusTable, Vitest, existing `@/composables` emit-effect API.

**Spec:** `docs/superpowers/specs/2026-07-17-erp-currency-exchange-rate-design.md`

## Global Constraints

- Do not modify `src/composables/use-emit-effect/**` or its public API.
- Do not add runtime dependencies.
- Demo rates only: `CNY → 1`, `USD → 7.2`, `EUR → 7.8`; functional currency is CNY.
- Overwrite header rate on currency change only when current rate equals the previous currency’s default.
- Amounts go through existing `money()`.
- Chinese UI copy; match existing ERP demo layout patterns.
- Do not create git commits unless the user explicitly requests them. If a step says “Commit”, skip it unless commits were requested; stage nothing automatically.

---

## File Map

**Create**

- `src/views/erp/emit-helpers.test.ts` — unit tests for rate helpers / `forceCurrencyWithRate`

**Modify**

- `src/views/erp/emit-helpers.ts` — `DEFAULT_EXCHANGE_RATES`, `defaultExchangeRate`, `syncExchangeRateIfStillDefault`, `forceCurrencyWithRate`
- `src/views/erp/sales-order-linkage.ts` — header rate, line `localAmount`, rules, columns, summary
- `src/views/erp/sales-order-linkage-demo.vue` — rate control, summary, copy
- `src/views/erp/sales-order-linkage.test.ts` — currency/rate/localAmount cases
- `src/views/erp/purchase-order-linkage.ts` — same as sales
- `src/views/erp/purchase-order-linkage-demo.vue` — same as sales
- `src/views/erp/purchase-order-linkage.test.ts` — same as sales
- `src/views/erp/expense-report-linkage.ts` — use `forceCurrencyWithRate`
- `src/views/erp/expense-report-linkage-demo.vue` — copy only
- `src/views/erp/expense-report-linkage.test.ts` — currency→rate cases

**Unchanged**

- `src/composables/**`
- Router / demo-routes tests

---

### Task 1: Shared exchange-rate helpers

**Files:**

- Modify: `src/views/erp/emit-helpers.ts`
- Create: `src/views/erp/emit-helpers.test.ts`

**Interfaces:**

- Produces:
  - `DEFAULT_EXCHANGE_RATES: Record<string, number>` with `{ CNY: 1, USD: 7.2, EUR: 7.8 }`
  - `defaultExchangeRate(currency: unknown): number`
  - `syncExchangeRateIfStillDefault(nextHeader: Record<string, unknown>, previousHeader: Record<string, unknown>): void`
  - `forceCurrencyWithRate(requiresConfirmation?: boolean): HeaderEmitRule`
- Consumes: existing `HeaderEmitRule` from `@/composables`

- [ ] **Step 1: Write the failing helper tests**

Create `src/views/erp/emit-helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  defaultExchangeRate,
  forceCurrencyWithRate,
  syncExchangeRateIfStillDefault,
} from './emit-helpers';

describe('emit-helpers exchange rate', () => {
  it('returns demo defaults', () => {
    expect(defaultExchangeRate('CNY')).toBe(1);
    expect(defaultExchangeRate('USD')).toBe(7.2);
    expect(defaultExchangeRate('EUR')).toBe(7.8);
  });

  it('overwrites rate only when previous rate is still the old default', () => {
    const next = { currency: 'USD', exchangeRate: 1 };
    syncExchangeRateIfStillDefault(next, {
      currency: 'CNY',
      exchangeRate: 1,
    });
    expect(next.exchangeRate).toBe(7.2);

    const kept = { currency: 'USD', exchangeRate: 6.5 };
    syncExchangeRateIfStillDefault(kept, {
      currency: 'CNY',
      exchangeRate: 6.5,
    });
    expect(kept.exchangeRate).toBe(6.5);
  });

  it('forceCurrencyWithRate patches currency and syncs header rate idempotently', () => {
    const rule = forceCurrencyWithRate();
    const nextHeader = { currency: 'USD', exchangeRate: 1 };
    const previousHeader = { currency: 'CNY', exchangeRate: 1 };
    const line = {
      id: '1',
      fieldSources: {},
      currency: 'CNY',
    };

    const first = rule.apply(line, nextHeader, previousHeader);
    expect(first.patch).toEqual({ currency: 'USD' });
    expect(nextHeader.exchangeRate).toBe(7.2);

    const second = rule.apply(line, nextHeader, previousHeader);
    expect(second.patch).toEqual({ currency: 'USD' });
    expect(nextHeader.exchangeRate).toBe(7.2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/views/erp/emit-helpers.test.ts`

Expected: FAIL (exports missing / not a function)

- [ ] **Step 3: Implement helpers in `emit-helpers.ts`**

Append after `CURRENCY_OPTIONS` (keep existing helpers):

```ts
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  CNY: 1,
  USD: 7.2,
  EUR: 7.8,
};

export function defaultExchangeRate(currency: unknown): number {
  return DEFAULT_EXCHANGE_RATES[String(currency)] ?? 1;
}

export function syncExchangeRateIfStillDefault(
  nextHeader: Record<string, unknown>,
  previousHeader: Record<string, unknown>,
): void {
  const previousDefault = defaultExchangeRate(previousHeader.currency);
  if (Number(previousHeader.exchangeRate) !== previousDefault) return;
  nextHeader.exchangeRate = defaultExchangeRate(nextHeader.currency);
}

export function forceCurrencyWithRate(requiresConfirmation = true): HeaderEmitRule {
  return {
    policy: 'force',
    requiresConfirmation,
    apply: (_line, nextHeader, previousHeader) => {
      syncExchangeRateIfStillDefault(nextHeader, previousHeader);
      return { patch: { currency: nextHeader.currency } };
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/views/erp/emit-helpers.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/erp/emit-helpers.ts src/views/erp/emit-helpers.test.ts
git commit -m "$(cat <<'EOF'
feat(erp): add shared currency exchange-rate helpers

EOF
)"
```

---

### Task 2: Sales order — rate, localAmount, UI

**Files:**

- Modify: `src/views/erp/sales-order-linkage.ts`
- Modify: `src/views/erp/sales-order-linkage.test.ts`
- Modify: `src/views/erp/sales-order-linkage-demo.vue`

**Interfaces:**

- Consumes: `forceCurrencyWithRate` from `./emit-helpers`
- Produces:
  - Header includes `exchangeRate: number`
  - Lines include `localAmount: number`
  - Summary includes `totalLocalAmount: number`
  - `headerRules.currency = forceCurrencyWithRate()`
  - `headerRules.exchangeRate = { policy: 'recalculate', requiresConfirmation: true, apply: () => ({}) }`

- [ ] **Step 1: Write failing sales linkage tests**

Replace/extend `src/views/erp/sales-order-linkage.test.ts` so it includes (keep existing warehouse/customer cases):

```ts
import { describe, expect, it } from 'vitest';
import { buildHeaderMutation } from '@/composables';
import { createSalesOrderDraft, salesOrderRules } from './sales-order-linkage';

describe('sales-order-linkage rules', () => {
  it('forces currency and preserves manual warehouse', () => {
    const draft = createSalesOrderDraft();
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

  it('sets default exchange rate and local amounts when currency changes from default', () => {
    const draft = createSalesOrderDraft();
    expect(draft.header.exchangeRate).toBe(1);
    const beforeLocal = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(salesOrderRules, draft, 'currency', 'USD');
    expect(mutation.nextDraft.header.exchangeRate).toBe(7.2);
    expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(beforeLocal!);
    for (const line of mutation.nextDraft.lines) {
      expect(line.localAmount).toBe(
        Math.round((Number(line.amount) * 7.2 + Number.EPSILON) * 100) / 100,
      );
    }
  });

  it('keeps manual exchange rate when currency changes', () => {
    const draft = createSalesOrderDraft();
    const withRate = buildHeaderMutation(salesOrderRules, draft, 'exchangeRate', 6.5);
    const mutation = buildHeaderMutation(salesOrderRules, withRate.nextDraft, 'currency', 'USD');
    expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
  });

  it('recalculates local amounts when exchange rate changes', () => {
    const draft = createSalesOrderDraft();
    const before = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(salesOrderRules, draft, 'exchangeRate', 8);
    expect(mutation.nextDraft.summary.totalLocalAmount).not.toBe(before);
    expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(before!);
  });
});
```

- [ ] **Step 2: Run sales tests to verify new cases fail**

Run: `npm test -- src/views/erp/sales-order-linkage.test.ts`

Expected: FAIL (`exchangeRate` / `totalLocalAmount` / `localAmount` missing or rate stays `1`)

- [ ] **Step 3: Update `sales-order-linkage.ts`**

1. Import `forceCurrencyWithRate` instead of `forceField` (remove unused `forceField` import).
2. In `recalculateSalesLine`, after computing `amount`:

```ts
next.localAmount = money(Number(next.amount) * Number(header.exchangeRate ?? 0));
```

3. Header in `createSalesOrderDraft`:

```ts
const header = {
  documentNo: 'SO-20260717-001',
  customerId: 'customer-east',
  currency: 'CNY',
  exchangeRate: 1,
  warehouseId: 'WH-SH',
  taxRate: 0.13,
};
```

4. Summary (draft + `summarize`):

```ts
{
  totalQty: sum(lines, 'quantity'),
  totalAmount: sum(lines, 'amount'),
  totalLocalAmount: sum(lines, 'localAmount'),
}
```

5. Rules:

```ts
headerRules: {
  customerId: repriceInheritedField('unitPrice', resolveSalesPrice),
  currency: forceCurrencyWithRate(),
  exchangeRate: {
    policy: 'recalculate',
    requiresConfirmation: true,
    apply: () => ({}),
  },
  warehouseId: inheritField('warehouseId', 'warehouseId'),
  taxRate: inheritField('taxRate', 'taxRate'),
},
```

6. Columns: after `amount`, before `source`, insert:

```ts
{
  prop: 'localAmount',
  label: '本位币金额',
  width: 120,
  editable: false,
},
```

- [ ] **Step 4: Update `sales-order-linkage-demo.vue`**

- Description: mention 币种可带出默认汇率、汇率 `recalculate` 本位币、手改汇率后改币种不覆盖。
- Hint: `改币种时若汇率仍是旧币种默认值会带出新默认汇率；手改汇率后改币种会保留。`
- After 币种 form item, add:

```vue
<el-form-item label="汇率 · 触发重算">
  <el-input-number
    :model-value="Number(draft.header.exchangeRate)"
    :min="0.01"
    :step="0.1"
    :precision="2"
    @change="onHeaderChange('exchangeRate', $event)"
  />
</el-form-item>
```

- Summary row add:

```vue
<span>本位币合计 {{ draft.summary.totalLocalAmount ?? 0 }}</span>
```

- [ ] **Step 5: Run sales tests to verify they pass**

Run: `npm test -- src/views/erp/sales-order-linkage.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/views/erp/sales-order-linkage.ts src/views/erp/sales-order-linkage.test.ts src/views/erp/sales-order-linkage-demo.vue
git commit -m "$(cat <<'EOF'
feat(erp): add sales-order exchange rate and local amounts

EOF
)"
```

---

### Task 3: Purchase order — rate, localAmount, UI

**Files:**

- Modify: `src/views/erp/purchase-order-linkage.ts`
- Modify: `src/views/erp/purchase-order-linkage.test.ts`
- Modify: `src/views/erp/purchase-order-linkage-demo.vue`

**Interfaces:**

- Consumes: `forceCurrencyWithRate` from `./emit-helpers`
- Produces: same header/line/summary shape as sales (`exchangeRate`, `localAmount`, `totalLocalAmount`)

- [ ] **Step 1: Write failing purchase linkage tests**

Extend `src/views/erp/purchase-order-linkage.test.ts` with the same three currency/rate cases as sales (swap imports to `createPurchaseOrderDraft` / `purchaseOrderRules`). Keep existing force/warehouse/supplier tests.

```ts
it('sets default exchange rate and local amounts when currency changes from default', () => {
  const draft = createPurchaseOrderDraft();
  const beforeLocal = draft.summary.totalLocalAmount;
  const mutation = buildHeaderMutation(purchaseOrderRules, draft, 'currency', 'USD');
  expect(mutation.nextDraft.header.exchangeRate).toBe(7.2);
  expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(beforeLocal!);
  for (const line of mutation.nextDraft.lines) {
    expect(line.localAmount).toBe(
      Math.round((Number(line.amount) * 7.2 + Number.EPSILON) * 100) / 100,
    );
  }
});

it('keeps manual exchange rate when currency changes', () => {
  const draft = createPurchaseOrderDraft();
  const withRate = buildHeaderMutation(purchaseOrderRules, draft, 'exchangeRate', 6.5);
  const mutation = buildHeaderMutation(purchaseOrderRules, withRate.nextDraft, 'currency', 'USD');
  expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
});

it('recalculates local amounts when exchange rate changes', () => {
  const draft = createPurchaseOrderDraft();
  const before = draft.summary.totalLocalAmount;
  const mutation = buildHeaderMutation(purchaseOrderRules, draft, 'exchangeRate', 8);
  expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(before!);
});
```

Note: the “keeps manual rate” case must call `buildHeaderMutation(..., 'exchangeRate', 6.5)` first so the draft used for currency change already has `exchangeRate: 6.5` in header (do not only mutate the object without going through rules if `createPurchaseOrderDraft` lacks the field until Task 3 Step 3 — after implementation, either path works; prefer mutation chain as above).

- [ ] **Step 2: Run purchase tests to verify new cases fail**

Run: `npm test -- src/views/erp/purchase-order-linkage.test.ts`

Expected: FAIL

- [ ] **Step 3: Update `purchase-order-linkage.ts`**

Mirror sales changes:

- Import `forceCurrencyWithRate` (drop unused `forceField`).
- `recalculatePurchaseLine`: `next.localAmount = money(Number(next.amount) * Number(header.exchangeRate ?? 0))`
- Header: add `exchangeRate: 1`
- Summary + `summarize`: add `totalLocalAmount: sum(..., 'localAmount')`
- Rules: `currency: forceCurrencyWithRate()`, add `exchangeRate` recalculate rule (same empty `apply` as sales)
- Columns: readonly `localAmount` / 「本位币金额」 after `amount`

- [ ] **Step 4: Update `purchase-order-linkage-demo.vue`**

Same UI/copy pattern as sales demo (汇率控件、本位币合计、description/hint).

- [ ] **Step 5: Run purchase tests to verify they pass**

Run: `npm test -- src/views/erp/purchase-order-linkage.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/views/erp/purchase-order-linkage.ts src/views/erp/purchase-order-linkage.test.ts src/views/erp/purchase-order-linkage-demo.vue
git commit -m "$(cat <<'EOF'
feat(erp): add purchase-order exchange rate and local amounts

EOF
)"
```

---

### Task 4: Expense report — currency→default rate sync

**Files:**

- Modify: `src/views/erp/expense-report-linkage.ts`
- Modify: `src/views/erp/expense-report-linkage.test.ts`
- Modify: `src/views/erp/expense-report-linkage-demo.vue`

**Interfaces:**

- Consumes: `forceCurrencyWithRate` from `./emit-helpers`
- Produces: `headerRules.currency = forceCurrencyWithRate()` (expense already has `exchangeRate` + `localAmount`)

- [ ] **Step 1: Write failing expense currency→rate tests**

Add to `src/views/erp/expense-report-linkage.test.ts` (keep existing three tests):

```ts
it('sets default exchange rate when currency changes from default', () => {
  const draft = createExpenseReportDraft();
  const beforeLocal = draft.summary.localAmount;
  const mutation = buildHeaderMutation(expenseReportRules, draft, 'currency', 'USD');
  expect(mutation.nextDraft.header.exchangeRate).toBe(7.2);
  expect(mutation.nextDraft.summary.localAmount).toBeGreaterThan(beforeLocal!);
});

it('keeps manual exchange rate when currency changes', () => {
  const draft = createExpenseReportDraft();
  const withRate = buildHeaderMutation(expenseReportRules, draft, 'exchangeRate', 6.5);
  const mutation = buildHeaderMutation(expenseReportRules, withRate.nextDraft, 'currency', 'USD');
  expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
});
```

- [ ] **Step 2: Run expense tests to verify new cases fail**

Run: `npm test -- src/views/erp/expense-report-linkage.test.ts`

Expected: FAIL (`exchangeRate` stays `1` after currency → USD)

- [ ] **Step 3: Wire `forceCurrencyWithRate` in expense rules**

In `expense-report-linkage.ts`:

- Import `forceCurrencyWithRate` instead of `forceField`.
- Replace `currency: forceField('currency', 'currency')` with `currency: forceCurrencyWithRate()`.
- Leave `exchangeRate` recalculate rule and `recalculateExpenseLine` unchanged.

- [ ] **Step 4: Update expense demo copy**

In `expense-report-linkage-demo.vue`:

- Description: add that 改币种时若汇率仍是旧默认会带出新默认汇率.
- Hint: `改币种可能带出默认汇率；手改汇率后改币种不覆盖。改汇率会重算全部本位币金额；…`

- [ ] **Step 5: Run expense tests + full ERP suite**

Run:

```bash
npm test -- src/views/erp/emit-helpers.test.ts src/views/erp/sales-order-linkage.test.ts src/views/erp/purchase-order-linkage.test.ts src/views/erp/expense-report-linkage.test.ts
```

Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add src/views/erp/expense-report-linkage.ts src/views/erp/expense-report-linkage.test.ts src/views/erp/expense-report-linkage-demo.vue
git commit -m "$(cat <<'EOF'
feat(erp): sync expense currency changes to default exchange rates

EOF
)"
```

---

## Spec Coverage Checklist

| Spec requirement                                               | Task                        |
| -------------------------------------------------------------- | --------------------------- |
| Shared defaults + sync helpers + `forceCurrencyWithRate`       | Task 1                      |
| Sales `exchangeRate` / `localAmount` / `totalLocalAmount` + UI | Task 2                      |
| Purchase same                                                  | Task 3                      |
| Expense currency→default rate (keep existing local calc)       | Task 4                      |
| Overwrite only when rate still old default                     | Tasks 1–4 tests             |
| Manual rate preserved on currency change                       | Tasks 2–4 tests             |
| `exchangeRate` recalculate local amounts                       | Tasks 2–3 (expense already) |
| No composable API change                                       | Global constraint           |
| Demo rates CNY/USD/EUR                                         | Task 1                      |

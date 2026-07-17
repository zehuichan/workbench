# ERP Document Linkage Demos Implementation Plan

> **Superseded** by [`2026-07-17-erp-emit-effect-demos.md`](./2026-07-17-erp-emit-effect-demos.md).
> Do not execute this plan.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three ERP document routes that demonstrate deterministic header/detail linkage, manual override protection, authoritative mock-server recalculation, and optimistic-lock conflicts.

**Architecture:** Three thin route views select a scenario configuration and render one internal `ErpDocumentDemo` shell. Pure TypeScript functions own command planning, propagation, row recalculation, aggregation, validation, and mock-server normalization; Vue components only translate interactions into those commands and render their results.

**Tech Stack:** Vue 3.5 Composition API, TypeScript 5.9 strict mode, Element Plus 2.14, PlusTable, es-toolkit, Vue Router 5, Vitest 4, Vite 8.

## Global Constraints

- Keep PlusTable's public API unchanged.
- Do not add runtime or development dependencies.
- Keep all ERP helpers internal to `src/components/erp-document-demo/`.
- Use explicit command handlers; do not introduce header/detail watcher chains.
- Recompute summaries from all lines after every accepted mutation.
- Treat mock-server calculations and validation as authoritative.
- Keep existing routes and the `/` redirect unchanged.
- Use Chinese UI copy and the existing Component Labs documentation style.
- Do not create git commits unless the user explicitly requests them.

---

## File Map

**Create**

- `src/components/erp-document-demo/types.ts` — shared document, scenario, mutation, validation, and server contracts.
- `src/components/erp-document-demo/document-linkage.ts` — pure linkage command pipeline.
- `src/components/erp-document-demo/document-linkage.test.ts` — command-pipeline unit tests.
- `src/components/erp-document-demo/scenarios/shared.ts` — shared options, formatting, and scenario helpers.
- `src/components/erp-document-demo/scenarios/sales-order.ts` — sales configuration.
- `src/components/erp-document-demo/scenarios/purchase-order.ts` — purchase configuration.
- `src/components/erp-document-demo/scenarios/expense-report.ts` — expense configuration.
- `src/components/erp-document-demo/scenarios/index.ts` — scenario exports.
- `src/components/erp-document-demo/scenarios/scenarios.test.ts` — configuration and calculation tests.
- `src/components/erp-document-demo/mock-document-server.ts` — in-memory authoritative server.
- `src/components/erp-document-demo/mock-document-server.test.ts` — save/validation/conflict tests.
- `src/components/erp-document-demo/document-header-field.vue` — controlled dynamic header editor.
- `src/components/erp-document-demo/erp-document-demo.vue` — shared interactive page shell.
- `src/components/erp-document-demo/erp-document-demo.test.ts` — source-level UI contract tests.
- `src/views/erp/sales-order-linkage-demo.vue` — sales route wrapper.
- `src/views/erp/purchase-order-linkage-demo.vue` — purchase route wrapper.
- `src/views/erp/expense-report-linkage-demo.vue` — expense route wrapper.

**Modify**

- `src/router/index.ts` — register the three route views.
- `src/router/demo-routes.test.ts` — assert ERP route metadata and ordering.
- `src/layouts/playground-layout.vue` — add the `ERP 场景` navigation group.
- `src/views/demo-content.test.ts` — include ERP wrapper/source contracts.
- `README.md` — list the new playground routes.

---

### Task 1: Define the document contracts and pure linkage pipeline

**Files:**

- Create: `src/components/erp-document-demo/types.ts`
- Create: `src/components/erp-document-demo/document-linkage.ts`
- Test: `src/components/erp-document-demo/document-linkage.test.ts`

**Interfaces:**

- Produces: `ScenarioConfig`, `DocumentDraft`, `DocumentLine`, `DocumentIssue`, `LinkageMutation`, `buildHeaderMutation`, `applyDetailMutation`, `addLineMutation`, `removeLineMutation`, `normalizeDraft`.
- Consumes: `PlusTableColumnDef` from `@/components/plus-table`.

- [ ] **Step 1: Write the failing linkage tests**

Create tests with a minimal scenario whose header has one forced field, one inherited field, and one recalculation field:

```ts
import { describe, expect, it } from 'vitest';
import {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
} from './document-linkage';
import type { DocumentDraft, ScenarioConfig } from './types';

const scenario: ScenarioConfig = {
  id: 'test',
  title: '测试单据',
  description: '测试',
  headerFields: [],
  columns: [],
  sourceFields: [{ prop: 'warehouseId', label: '仓库' }],
  summaryFields: [
    { prop: 'total', label: '合计', format: (value) => String(value) },
  ],
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
  createInitialDraft: () => initialDraft(),
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
  validate: () => [],
};

function initialDraft(): DocumentDraft {
  return {
    documentNo: 'TEST-001',
    status: 'draft',
    clientRevision: 0,
    serverVersion: 1,
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

describe('document linkage', () => {
  it('forces values to every line without mutating the source draft', () => {
    const source = initialDraft();
    const mutation = buildHeaderMutation(scenario, source, 'currency', 'USD');
    expect(mutation.nextDraft.lines.map((line) => line.currency)).toEqual([
      'USD',
      'USD',
    ]);
    expect(mutation.confirmation?.affectedCount).toBe(2);
    expect(source.header.currency).toBe('CNY');
  });

  it('updates inherited values and preserves manual overrides', () => {
    const mutation = buildHeaderMutation(
      scenario,
      initialDraft(),
      'warehouseId',
      'WH-C',
    );
    expect(mutation.nextDraft.lines.map((line) => line.warehouseId)).toEqual([
      'WH-C',
      'WH-B',
    ]);
    expect(mutation.record.preservedLineIds).toEqual(['2']);
  });

  it('marks an edited inherited field manual and aggregates all rows', () => {
    const mutation = applyDetailMutation(scenario, initialDraft(), {
      rowId: '1',
      prop: 'quantity',
      value: 5,
      oldValue: 2,
    });
    expect(mutation.nextDraft.lines[0]?.amount).toBe(10);
    expect(mutation.nextDraft.summary.total).toBe(16);
    expect(mutation.nextDraft.clientRevision).toBe(1);
    expect(mutation.nextDraft.dirty).toBe(true);
  });

  it('marks an edited propagating field as manual', () => {
    const mutation = applyDetailMutation(scenario, initialDraft(), {
      rowId: '1',
      prop: 'warehouseId',
      value: 'WH-X',
      oldValue: 'WH-A',
    });
    expect(mutation.nextDraft.lines[0]?.fieldSources.warehouseId).toBe(
      'manual',
    );
  });

  it('adds and removes rows through the same recalculate-aggregate pipeline', () => {
    const added = addLineMutation(scenario, initialDraft(), '3');
    expect(added.nextDraft.summary.total).toBe(12);
    const removed = removeLineMutation(scenario, added.nextDraft, '2');
    expect(removed.nextDraft.lines.map((line) => line.id)).toEqual(['1', '3']);
    expect(removed.nextDraft.summary.total).toBe(6);
  });

  it('normalizes every line and ignores an incoming summary', () => {
    const source = initialDraft();
    source.lines[0]!.amount = 999;
    source.summary.total = 999;
    const normalized = normalizeDraft(scenario, source);
    expect(normalized.lines[0]?.amount).toBe(4);
    expect(normalized.summary.total).toBe(10);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
pnpm test -- src/components/erp-document-demo/document-linkage.test.ts
```

Expected: FAIL because `types.ts` and `document-linkage.ts` do not exist.

- [ ] **Step 3: Add the shared contracts**

Implement `types.ts` with these exact public contracts:

```ts
import type { PlusTableColumnDef } from '@/components/plus-table';

export type FieldSource = 'inherited' | 'manual';
export type LinkagePolicy = 'force' | 'inherit' | 'recalculate';
export type HeaderEditor = 'input' | 'select' | 'date-picker' | 'input-number';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface HeaderFieldDefinition {
  prop: string;
  label: string;
  editor: HeaderEditor;
  required?: boolean;
  options?: SelectOption[];
  componentProps?: Record<string, unknown>;
}

export interface DocumentLine {
  id: string;
  fieldSources: Record<string, FieldSource>;
  [field: string]: unknown;
}

export interface DocumentSummary {
  [field: string]: number;
}

export interface DocumentDraft {
  documentNo: string;
  status: 'draft';
  clientRevision: number;
  serverVersion: number;
  dirty: boolean;
  header: Record<string, unknown>;
  lines: DocumentLine[];
  summary: DocumentSummary;
}

export interface DocumentIssue {
  scope: 'header' | 'line' | 'document';
  message: string;
  field?: string;
  lineId?: string;
}

export interface HeaderLineEffect {
  patch?: Record<string, unknown>;
  sourcePatch?: Record<string, FieldSource>;
  preservedFields?: string[];
}

export interface HeaderLinkageRule {
  policy: LinkagePolicy;
  requiresConfirmation?: boolean;
  apply: (
    line: DocumentLine,
    nextHeader: Record<string, unknown>,
    previousHeader: Record<string, unknown>,
  ) => HeaderLineEffect;
}

export interface SummaryFieldDefinition {
  prop: string;
  label: string;
  format: (value: number, draft: DocumentDraft) => string;
}

export interface SourceFieldDefinition {
  prop: string;
  label: string;
}

export interface ScenarioConfig {
  id: 'sales-order' | 'purchase-order' | 'expense-report' | 'test';
  title: string;
  description: string;
  headerFields: HeaderFieldDefinition[];
  columns: PlusTableColumnDef[];
  sourceFields: SourceFieldDefinition[];
  summaryFields: SummaryFieldDefinition[];
  headerRules: Record<string, HeaderLinkageRule>;
  createInitialDraft: () => DocumentDraft;
  createLine: (draft: DocumentDraft, id: string) => DocumentLine;
  recalculateLine: (
    line: DocumentLine,
    header: Record<string, unknown>,
  ) => DocumentLine;
  summarize: (
    lines: DocumentLine[],
    header: Record<string, unknown>,
  ) => DocumentSummary;
  validate: (draft: DocumentDraft) => DocumentIssue[];
}

export interface LinkageRecordInput {
  direction: 'header-to-detail' | 'detail-to-header' | 'system';
  title: string;
  detail: string;
  affectedLineIds: string[];
  preservedLineIds: string[];
}

export interface LinkageConfirmation {
  affectedCount: number;
  preservedCount: number;
  message: string;
}

export interface LinkageMutation {
  nextDraft: DocumentDraft;
  record: LinkageRecordInput;
  confirmation?: LinkageConfirmation;
}

export interface DetailChangeCommand {
  rowId: string;
  prop: string;
  value: unknown;
  oldValue: unknown;
}
```

- [ ] **Step 4: Implement the deterministic command pipeline**

Implement `document-linkage.ts` around cloned drafts:

```ts
import { cloneDeep, isEqual } from 'es-toolkit';
import type {
  DetailChangeCommand,
  DocumentDraft,
  DocumentLine,
  LinkageMutation,
  ScenarioConfig,
} from './types';

function changedFields(before: DocumentLine, after: DocumentLine): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (field) =>
      field !== 'fieldSources' && !isEqual(before[field], after[field]),
  );
}

function finalize(
  config: ScenarioConfig,
  draft: DocumentDraft,
  dirty: boolean,
): DocumentDraft {
  const lines = draft.lines.map((line) =>
    config.recalculateLine(cloneDeep(line), draft.header),
  );
  return {
    ...draft,
    lines,
    summary: config.summarize(lines, draft.header),
    dirty,
  };
}

export function normalizeDraft(
  config: ScenarioConfig,
  source: DocumentDraft,
): DocumentDraft {
  return finalize(config, cloneDeep(source), source.dirty);
}

export function buildHeaderMutation(
  config: ScenarioConfig,
  source: DocumentDraft,
  field: string,
  value: unknown,
): LinkageMutation {
  const rule = config.headerRules[field];
  if (!rule) throw new Error(`表头字段 "${field}" 未配置联动规则`);

  const working = cloneDeep(source);
  const previousHeader = cloneDeep(working.header);
  working.header[field] = value;
  const affectedLineIds: string[] = [];
  const preservedLineIds: string[] = [];

  working.lines = working.lines.map((line) => {
    const before = cloneDeep(line);
    const effect = rule.apply(line, working.header, previousHeader);
    Object.assign(line, effect.patch);
    Object.assign(line.fieldSources, effect.sourcePatch);
    const recalculated = config.recalculateLine(line, working.header);
    if (changedFields(before, recalculated).length > 0)
      affectedLineIds.push(line.id);
    if (effect.preservedFields?.length) preservedLineIds.push(line.id);
    return recalculated;
  });

  working.summary = config.summarize(working.lines, working.header);
  working.clientRevision += 1;
  working.dirty = true;

  const mutation: LinkageMutation = {
    nextDraft: working,
    record: {
      direction: 'header-to-detail',
      title: `表头字段「${field}」变更`,
      detail: `更新 ${affectedLineIds.length} 行，保留 ${preservedLineIds.length} 行人工值`,
      affectedLineIds,
      preservedLineIds,
    },
  };
  if (rule.requiresConfirmation && affectedLineIds.length > 0) {
    mutation.confirmation = {
      affectedCount: affectedLineIds.length,
      preservedCount: preservedLineIds.length,
      message: `将更新 ${affectedLineIds.length} 行，保留 ${preservedLineIds.length} 行人工值。`,
    };
  }
  return mutation;
}

export function applyDetailMutation(
  config: ScenarioConfig,
  source: DocumentDraft,
  command: DetailChangeCommand,
): LinkageMutation {
  const working = cloneDeep(source);
  const line = working.lines.find((item) => item.id === command.rowId);
  if (!line) throw new Error(`明细行 "${command.rowId}" 不存在`);
  line[command.prop] = command.value;
  if (config.sourceFields.some((field) => field.prop === command.prop)) {
    line.fieldSources[command.prop] = 'manual';
  }
  const index = working.lines.indexOf(line);
  working.lines[index] = config.recalculateLine(line, working.header);
  working.summary = config.summarize(working.lines, working.header);
  working.clientRevision += 1;
  working.dirty = true;
  return {
    nextDraft: working,
    record: {
      direction: 'detail-to-header',
      title: `第 ${index + 1} 行「${command.prop}」变更`,
      detail: `由 ${String(command.oldValue)} 更新为 ${String(command.value)}，并重新汇总表头`,
      affectedLineIds: [command.rowId],
      preservedLineIds: [],
    },
  };
}

export function addLineMutation(
  config: ScenarioConfig,
  source: DocumentDraft,
  id: string,
): LinkageMutation {
  const working = cloneDeep(source);
  working.lines.push(config.createLine(working, id));
  const nextDraft = finalize(config, working, true);
  nextDraft.clientRevision += 1;
  return {
    nextDraft,
    record: {
      direction: 'detail-to-header',
      title: '新增明细',
      detail: '新行继承当前表头默认值并重新汇总',
      affectedLineIds: [id],
      preservedLineIds: [],
    },
  };
}

export function removeLineMutation(
  config: ScenarioConfig,
  source: DocumentDraft,
  id: string,
): LinkageMutation {
  const working = cloneDeep(source);
  working.lines = working.lines.filter((line) => line.id !== id);
  const nextDraft = finalize(config, working, true);
  nextDraft.clientRevision += 1;
  return {
    nextDraft,
    record: {
      direction: 'detail-to-header',
      title: '删除明细',
      detail: '删除后从剩余明细重新汇总',
      affectedLineIds: [id],
      preservedLineIds: [],
    },
  };
}
```

- [ ] **Step 5: Run the focused test and typecheck**

Run:

```bash
pnpm test -- src/components/erp-document-demo/document-linkage.test.ts
pnpm typecheck
```

Expected: linkage tests PASS; typecheck PASS.

---

### Task 2: Implement the three scenario configurations

**Files:**

- Create: `src/components/erp-document-demo/scenarios/shared.ts`
- Create: `src/components/erp-document-demo/scenarios/sales-order.ts`
- Create: `src/components/erp-document-demo/scenarios/purchase-order.ts`
- Create: `src/components/erp-document-demo/scenarios/expense-report.ts`
- Create: `src/components/erp-document-demo/scenarios/index.ts`
- Test: `src/components/erp-document-demo/scenarios/scenarios.test.ts`

**Interfaces:**

- Consumes: `ScenarioConfig`, `DocumentDraft`, `DocumentLine`, `DocumentIssue`.
- Produces: `salesOrderScenario`, `purchaseOrderScenario`, `expenseReportScenario`, `SCENARIOS`.

- [ ] **Step 1: Write failing scenario behavior tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildHeaderMutation, applyDetailMutation } from '../document-linkage';
import {
  expenseReportScenario,
  purchaseOrderScenario,
  salesOrderScenario,
} from '.';

describe('ERP scenarios', () => {
  it('reprices inherited sales prices and preserves manual prices', () => {
    const source = salesOrderScenario.createInitialDraft();
    source.lines[1]!.fieldSources.unitPrice = 'manual';
    source.lines[1]!.unitPrice = 999;
    const mutation = buildHeaderMutation(
      salesOrderScenario,
      source,
      'priceListId',
      'wholesale',
    );
    expect(mutation.nextDraft.lines[0]?.unitPrice).not.toBe(
      source.lines[0]?.unitPrice,
    );
    expect(mutation.nextDraft.lines[1]?.unitPrice).toBe(999);
    expect(mutation.record.preservedLineIds).toContain(source.lines[1]!.id);
  });

  it('aggregates purchase quantity, net amount, tax, and gross amount', () => {
    const source = purchaseOrderScenario.createInitialDraft();
    const mutation = applyDetailMutation(purchaseOrderScenario, source, {
      rowId: source.lines[0]!.id,
      prop: 'quantity',
      value: 10,
      oldValue: source.lines[0]!.quantity,
    });
    expect(mutation.nextDraft.summary.totalQuantity).toBeGreaterThan(
      source.summary.totalQuantity,
    );
    expect(mutation.nextDraft.summary.grossAmount).toBe(
      mutation.nextDraft.summary.netAmount +
        mutation.nextDraft.summary.taxAmount,
    );
  });

  it('propagates inherited expense projects and preserves manual projects', () => {
    const source = expenseReportScenario.createInitialDraft();
    source.lines[1]!.fieldSources.projectId = 'manual';
    source.lines[1]!.projectId = 'internal';
    const mutation = buildHeaderMutation(
      expenseReportScenario,
      source,
      'projectId',
      'phoenix',
    );
    expect(mutation.nextDraft.lines[0]?.projectId).toBe('phoenix');
    expect(mutation.nextDraft.lines[1]?.projectId).toBe('internal');
  });

  it('recalculates every expense local amount when exchange rate changes', () => {
    const source = expenseReportScenario.createInitialDraft();
    const mutation = buildHeaderMutation(
      expenseReportScenario,
      source,
      'exchangeRate',
      8,
    );
    expect(mutation.nextDraft.lines[0]?.localAmount).not.toBe(
      source.lines[0]?.localAmount,
    );
    expect(mutation.nextDraft.summary.localAmount).toBe(
      mutation.nextDraft.lines.reduce(
        (sum, line) => sum + Number(line.localAmount),
        0,
      ),
    );
  });

  it.each([salesOrderScenario, purchaseOrderScenario, expenseReportScenario])(
    '$id starts valid and exposes all three UI definition groups',
    (scenario) => {
      const draft = scenario.createInitialDraft();
      expect(scenario.validate(draft)).toEqual([]);
      expect(scenario.headerFields.length).toBeGreaterThanOrEqual(4);
      expect(scenario.columns.length).toBeGreaterThanOrEqual(6);
      expect(scenario.summaryFields.length).toBeGreaterThanOrEqual(3);
    },
  );
});
```

- [ ] **Step 2: Run tests and verify missing scenario modules**

Run:

```bash
pnpm test -- src/components/erp-document-demo/scenarios/scenarios.test.ts
```

Expected: FAIL because the scenario exports do not exist.

- [ ] **Step 3: Add shared scenario helpers**

`shared.ts` must export deterministic helpers:

```ts
import type {
  DocumentDraft,
  DocumentIssue,
  DocumentLine,
  HeaderLinkageRule,
  SelectOption,
} from '../types';

export const CURRENCY_OPTIONS: SelectOption[] = [
  { label: '人民币 CNY', value: 'CNY' },
  { label: '美元 USD', value: 'USD' },
  { label: '欧元 EUR', value: 'EUR' },
];

export const WAREHOUSE_OPTIONS: SelectOption[] = [
  { label: '上海仓', value: 'WH-SH' },
  { label: '深圳仓', value: 'WH-SZ' },
  { label: '北京仓', value: 'WH-BJ' },
];

export function money(value: unknown): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function formatMoney(value: number, draft: DocumentDraft): string {
  return `${String(draft.header.currency ?? 'CNY')} ${value.toLocaleString(
    'zh-CN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

export function forceField(
  headerField: string,
  lineField: string,
  requiresConfirmation = true,
): HeaderLinkageRule {
  return {
    policy: 'force',
    requiresConfirmation,
    apply: (_line, nextHeader) => ({
      patch: { [lineField]: nextHeader[headerField] },
    }),
  };
}

export function inheritField(
  headerField: string,
  lineField: string,
): HeaderLinkageRule {
  return {
    policy: 'inherit',
    apply: (line, nextHeader) =>
      line.fieldSources[lineField] === 'manual'
        ? { preservedFields: [lineField] }
        : { patch: { [lineField]: nextHeader[headerField] } },
  };
}

export function validateRequired(
  draft: DocumentDraft,
  headerFields: Array<[string, string]>,
  lineFields: Array<[string, string]>,
): DocumentIssue[] {
  const issues: DocumentIssue[] = [];
  for (const [field, label] of headerFields) {
    if (draft.header[field] === '' || draft.header[field] == null) {
      issues.push({ scope: 'header', field, message: `${label}不能为空` });
    }
  }
  for (const line of draft.lines) {
    for (const [field, label] of lineFields) {
      if (line[field] === '' || line[field] == null) {
        issues.push({
          scope: 'line',
          lineId: line.id,
          field,
          message: `${label}不能为空`,
        });
      }
    }
  }
  return issues;
}

export function sum(lines: DocumentLine[], field: string): number {
  return money(
    lines.reduce((total, line) => total + Number(line[field] ?? 0), 0),
  );
}
```

- [ ] **Step 4: Implement sales-order configuration**

Use:

- Customer options: `华东旗舰客户/customer-east`, `全国渠道客户/customer-channel`.
- Price lists: `标准价/standard`, `渠道价/wholesale`.
- Products and standard prices: notebook `6800`, monitor `1800`, service `1200`.
- Channel customer factor: `0.95`; wholesale price-list factor: `0.9`.
- Initial lines: notebook quantity `2`, discount `0.05`; monitor quantity `4`, discount `0`.
- New-line defaults: service product, quantity `1`, discount `0`; currency, warehouse, tax rate, and system price inherit the current header context.
- Formula: `netAmount = quantity × unitPrice × (1 - discountRate)`, `taxAmount = netAmount × taxRate`, `grossAmount = netAmount + taxAmount`.

Export a complete `ScenarioConfig`:

```ts
export const salesOrderScenario: ScenarioConfig = {
  id: 'sales-order',
  title: '销售订单联动',
  description:
    '客户与价目表触发系统价格重算；币种强制同步；仓库与税率只更新继承行。明细金额始终重新汇总到表头。',
  headerFields: salesHeaderFields,
  columns: salesColumns,
  sourceFields: [
    { prop: 'unitPrice', label: '单价' },
    { prop: 'warehouseId', label: '仓库' },
    { prop: 'taxRate', label: '税率' },
  ],
  summaryFields: [
    {
      prop: 'totalQuantity',
      label: '总数量',
      format: (value) => String(value),
    },
    { prop: 'netAmount', label: '未税金额', format: formatMoney },
    { prop: 'taxAmount', label: '税额', format: formatMoney },
    { prop: 'grossAmount', label: '订单总额', format: formatMoney },
  ],
  headerRules: salesHeaderRules,
  createInitialDraft: createSalesDraft,
  createLine: createSalesLine,
  recalculateLine: recalculateSalesLine,
  summarize: summarizeSalesOrder,
  validate: validateSalesOrder,
};
```

Columns must use PlusTable editors and rules for product, quantity, warehouse, unit price, discount rate, and tax rate; calculated columns must be non-editable and formatted to two decimals.

`recalculateSalesLine` must canonicalize currency from the header; refresh inherited warehouse, tax rate, and unit price from the current header context; preserve their `manual` values; then calculate amounts. `validateSalesOrder` must require all header fields and product, require `quantity > 0`, require `unitPrice >= 0`, and constrain discount/tax rates to `0...1`.

- [ ] **Step 5: Implement purchase-order configuration**

Use:

- Suppliers: `华南电子/supplier-south`, `精工材料/supplier-material`.
- Purchase organizations: `华东采购中心/ORG-EAST`, `华南采购中心/ORG-SOUTH`.
- Materials and base prices: panel `950`, chip `320`, package `18`.
- `supplier-material` factor: `0.94`.
- Initial lines: panel quantity `20`; chip quantity `50`.
- New-line defaults: package material, quantity `1`; organization, currency, warehouse, tax rate, and supplier price inherit the current header context.
- Formula: `netAmount = quantity × unitPrice`, `taxAmount = netAmount × taxRate`, `grossAmount = netAmount + taxAmount`.

Header rules must reprice inherited `unitPrice` values on supplier changes, force purchase organization and currency, and inherit warehouse and tax rate. Export `purchaseOrderScenario` with summary fields `totalQuantity`, `netAmount`, `taxAmount`, and `grossAmount`.

`recalculatePurchaseLine` must canonicalize organization and currency from the header; refresh inherited warehouse, tax rate, and supplier price; preserve manual values; then calculate amounts. Validation must require all header fields and material, require `quantity > 0`, require `unitPrice >= 0`, and constrain tax rate to `0...1`.

- [ ] **Step 6: Implement expense-report configuration**

Use:

- Departments: `研发中心/rd`, `市场中心/marketing`, `财务中心/finance`.
- Projects: `阿波罗/apollo`, `凤凰/phoenix`, `内部运营/internal`.
- Expense types: `差旅/travel`, `软件/software`, `招待/entertainment`.
- Initial header currency `USD`, exchange rate `7.2`, department `rd`, project `apollo`.
- Initial lines: travel amount `480`, deductible tax `0`; software amount `120`, deductible tax `6`.
- New-line defaults: travel type, current date, amount `0`, deductible tax `0`; department and project inherit the header.
- Formula: `reimbursableAmount = max(amount - deductibleTax, 0)`, `localAmount = reimbursableAmount × exchangeRate`.

Header rules must inherit department and project, force currency, and recalculate every line for exchange-rate changes. Validate `deductibleTax <= amount`. Export `expenseReportScenario` with summary fields `originalAmount`, `deductibleTax`, and `localAmount`.

`recalculateExpenseLine` must canonicalize currency from the header; refresh inherited department and project; preserve manual values; then calculate amounts. Validation must require all header fields plus expense type/date, require `exchangeRate > 0`, require `amount >= 0`, require `deductibleTax >= 0`, and require `deductibleTax <= amount`. Format original-currency summaries with the header currency and `localAmount` explicitly as `CNY`.

- [ ] **Step 7: Export and verify all scenarios**

`scenarios/index.ts`:

```ts
export { salesOrderScenario } from './sales-order';
export { purchaseOrderScenario } from './purchase-order';
export { expenseReportScenario } from './expense-report';

import { salesOrderScenario } from './sales-order';
import { purchaseOrderScenario } from './purchase-order';
import { expenseReportScenario } from './expense-report';

export const SCENARIOS = {
  'sales-order': salesOrderScenario,
  'purchase-order': purchaseOrderScenario,
  'expense-report': expenseReportScenario,
} as const;
```

Run:

```bash
pnpm test -- src/components/erp-document-demo/scenarios/scenarios.test.ts
pnpm typecheck
```

Expected: scenario tests PASS; typecheck PASS.

---

### Task 3: Add the authoritative in-memory mock server

**Files:**

- Create: `src/components/erp-document-demo/mock-document-server.ts`
- Test: `src/components/erp-document-demo/mock-document-server.test.ts`

**Interfaces:**

- Consumes: `ScenarioConfig`, `DocumentDraft`, `DocumentIssue`, `normalizeDraft`.
- Produces: `createMockDocumentServer(config, initial, delayMs?)`, `MockSaveResult`, `Correction`.

- [ ] **Step 1: Write failing server tests**

```ts
import { describe, expect, it } from 'vitest';
import { salesOrderScenario } from './scenarios';
import { createMockDocumentServer } from './mock-document-server';

describe('mock document server', () => {
  it('recalculates untrusted client totals and increments version', async () => {
    const initial = salesOrderScenario.createInitialDraft();
    const server = createMockDocumentServer(salesOrderScenario, initial, 0);
    const request = structuredClone(initial);
    request.summary.grossAmount = 1;
    request.lines[0]!.grossAmount = 1;
    request.dirty = true;
    const result = await server.save(request);
    expect(result.kind).toBe('success');
    if (result.kind !== 'success') return;
    expect(result.draft.serverVersion).toBe(2);
    expect(result.draft.summary.grossAmount).not.toBe(1);
    expect(result.corrections.length).toBeGreaterThan(0);
  });

  it('returns a conflict without overwriting the server snapshot', async () => {
    const initial = salesOrderScenario.createInitialDraft();
    const server = createMockDocumentServer(salesOrderScenario, initial, 0);
    server.simulateConcurrentUpdate();
    const result = await server.save(initial);
    expect(result.kind).toBe('conflict');
    if (result.kind !== 'conflict') return;
    expect(result.serverVersion).toBe(2);
    expect(result.serverDraft.serverVersion).toBe(2);
  });

  it('returns validation issues and leaves the version unchanged', async () => {
    const initial = salesOrderScenario.createInitialDraft();
    const server = createMockDocumentServer(salesOrderScenario, initial, 0);
    const invalid = structuredClone(initial);
    invalid.header.customerId = '';
    const result = await server.save(invalid);
    expect(result.kind).toBe('validation');
    expect(server.getSnapshot().serverVersion).toBe(1);
  });
});
```

- [ ] **Step 2: Run the focused server test**

Run:

```bash
pnpm test -- src/components/erp-document-demo/mock-document-server.test.ts
```

Expected: FAIL because `mock-document-server.ts` does not exist.

- [ ] **Step 3: Implement discriminated save results and canonical diffing**

Use these contracts and behavior:

```ts
import { cloneDeep, isEqual } from 'es-toolkit';
import { normalizeDraft } from './document-linkage';
import type { DocumentDraft, DocumentIssue, ScenarioConfig } from './types';

export interface Correction {
  path: string;
  clientValue: unknown;
  serverValue: unknown;
}

export type MockSaveResult =
  | { kind: 'success'; draft: DocumentDraft; corrections: Correction[] }
  | { kind: 'validation'; issues: DocumentIssue[] }
  | {
      kind: 'conflict';
      serverVersion: number;
      serverDraft: DocumentDraft;
    };

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function collectCorrections(
  client: DocumentDraft,
  server: DocumentDraft,
): Correction[] {
  const corrections: Correction[] = [];
  for (const [field, value] of Object.entries(server.summary)) {
    if (!isEqual(client.summary[field], value)) {
      corrections.push({
        path: `summary.${field}`,
        clientValue: client.summary[field],
        serverValue: value,
      });
    }
  }
  server.lines.forEach((line, index) => {
    const clientLine = client.lines[index];
    for (const field of [
      'netAmount',
      'taxAmount',
      'grossAmount',
      'reimbursableAmount',
      'localAmount',
    ]) {
      if (field in line && !isEqual(clientLine?.[field], line[field])) {
        corrections.push({
          path: `lines[${index}].${field}`,
          clientValue: clientLine?.[field],
          serverValue: line[field],
        });
      }
    }
  });
  return corrections;
}

export function createMockDocumentServer(
  config: ScenarioConfig,
  initial: DocumentDraft,
  delayMs = 500,
) {
  let stored = normalizeDraft(config, cloneDeep(initial));
  stored.serverVersion = 1;
  stored.dirty = false;

  return {
    async save(clientDraft: DocumentDraft): Promise<MockSaveResult> {
      await wait(delayMs);
      if (clientDraft.serverVersion !== stored.serverVersion) {
        return {
          kind: 'conflict',
          serverVersion: stored.serverVersion,
          serverDraft: cloneDeep(stored),
        };
      }
      const canonical = normalizeDraft(config, clientDraft);
      const issues = config.validate(canonical);
      if (issues.length > 0) return { kind: 'validation', issues };
      const corrections = collectCorrections(clientDraft, canonical);
      canonical.serverVersion = stored.serverVersion + 1;
      canonical.dirty = false;
      stored = cloneDeep(canonical);
      return { kind: 'success', draft: cloneDeep(stored), corrections };
    },
    simulateConcurrentUpdate(): DocumentDraft {
      stored.serverVersion += 1;
      return cloneDeep(stored);
    },
    getSnapshot(): DocumentDraft {
      return cloneDeep(stored);
    },
  };
}
```

Use `globalThis.setTimeout` rather than `window.setTimeout` if Vitest reports a non-browser typing conflict.

- [ ] **Step 4: Run server and domain tests**

Run:

```bash
pnpm test -- src/components/erp-document-demo
pnpm typecheck
```

Expected: all ERP TypeScript tests PASS; typecheck PASS.

---

### Task 4: Build the controlled header editor and shared ERP page shell

**Files:**

- Create: `src/components/erp-document-demo/document-header-field.vue`
- Create: `src/components/erp-document-demo/erp-document-demo.vue`
- Test: `src/components/erp-document-demo/erp-document-demo.test.ts`

**Interfaces:**

- Consumes: `ScenarioConfig`, linkage mutation functions, mock server, PlusTable `CellChangePayload` and `ValidateResult`.
- Produces: `<ErpDocumentDemo :scenario="scenario" />`.

- [ ] **Step 1: Write a source-contract test before creating the Vue files**

```ts
import { describe, expect, it } from 'vitest';
import shell from './erp-document-demo.vue?raw';
import headerField from './document-header-field.vue?raw';

describe('ERP document demo shell', () => {
  it('keeps header controls command-driven instead of direct v-model mutation', () => {
    expect(headerField).toContain(':model-value="value"');
    expect(headerField).toContain("emit('change'");
    expect(headerField).not.toContain('v-model');
  });

  it('renders the educational linkage and server boundaries', () => {
    for (const fingerprint of [
      '联动策略',
      '服务端版本',
      '模拟并发更新',
      '联动流水',
      '@cell-change="handleCellChange"',
      '#cell-source',
      '#cell-actions',
    ]) {
      expect(shell).toContain(fingerprint);
    }
  });
});
```

- [ ] **Step 2: Run the source-contract test**

Run:

```bash
pnpm test -- src/components/erp-document-demo/erp-document-demo.test.ts
```

Expected: FAIL because both Vue components are absent.

- [ ] **Step 3: Implement the controlled header field**

`document-header-field.vue` must:

- Accept `field`, `value`, `disabled`, `error`, and `policy`.
- Render an `el-form-item` with a policy tag in its label.
- Render `el-select`, `el-input-number`, `el-date-picker`, or `el-input` with `:model-value`.
- Emit one `change` event; never mutate `draft.header` directly.

Core script contract:

```ts
const props = defineProps<{
  field: HeaderFieldDefinition;
  value: unknown;
  disabled: boolean;
  error?: string;
  policy: LinkagePolicy;
}>();

const emit = defineEmits<{
  change: [value: unknown];
}>();

const policyLabel = computed(
  () =>
    ({
      force: '强制同步',
      inherit: '继承传播',
      recalculate: '触发重算',
    })[props.policy],
);
```

Each editor must forward `field.componentProps`; select options come from `field.options`.

- [ ] **Step 4: Implement shell state and command handlers**

`erp-document-demo.vue` must initialize:

```ts
const props = defineProps<{ scenario: ScenarioConfig }>();
const draft = ref(props.scenario.createInitialDraft());
const lastSynced = ref(cloneDeep(draft.value));
const server = createMockDocumentServer(
  props.scenario,
  props.scenario.createInitialDraft(),
);
const records = ref<LinkageRecord[]>([]);
const issues = ref<DocumentIssue[]>([]);
const conflictDraft = ref<DocumentDraft>();
const saving = ref(false);
let nextLineId = draft.value.lines.length + 1;
let nextRecordId = 1;
```

Implement `commitMutation(mutation)` to replace `draft.value`, refresh `issues`, and prepend a record with a stable numeric id and `new Date().toLocaleTimeString('zh-CN', { hour12: false })`.

Implement:

- `handleHeaderChange(field, value)` — build a mutation, show `ElMessageBox.confirm` when `mutation.confirmation` exists, and commit only after confirmation.
- `handleCellChange(payload)` — call `applyDetailMutation` using `payload.row.id`, `prop`, `value`, and `oldValue`.
- `addLine()` and `removeLine(id)` — use linkage functions and preserve full-summary recomputation.
- `save()` — call both PlusTable `validate()` and `scenario.validate()`, invoke server save, handle `success`, `validation`, and `conflict` discriminants, and never clear `dirty` on failure.
- `simulateConcurrentUpdate()` — advance only the mock server and record the new hidden server version.
- `reset()` — restore `lastSynced`.
- `reloadServer()` — confirm before discarding dirty changes, then load `server.getSnapshot()`.

Use `edit-mode="saving ? 'none' : 'cell'"` and disable every header/action control while saving.

- [ ] **Step 5: Render the full teaching page**

The template must contain:

- `DemoPage width="wide"` with scenario title and description.
- `DemoApiTable title="联动策略"` generated from header fields and header rules.
- A second `DemoApiTable` describing client revision, server version, authoritative recalculation, and version conflict.
- `DemoBlock` containing:
  - document number/status/revisions/dirty tags;
  - responsive Element Plus header form;
  - PlusTable with common source and action columns appended to scenario columns;
  - `#cell-source` tags for each configured source field;
  - `#cell-actions` delete button;
  - `#summary` values from `scenario.summaryFields`;
  - save/reset/add/simulate-conflict/reload controls;
  - validation alert list;
  - reverse-chronological linkage record list.

Append these common columns:

```ts
const columns = computed(() => [
  ...props.scenario.columns,
  { prop: 'source', label: '字段来源', width: 210 },
  {
    prop: 'actions',
    type: 'operation',
    label: '操作',
    width: 80,
    fixed: 'right',
  },
]);
```

Use scoped BEM classes prefixed `erp-demo__`. At widths below `1100px`, collapse status/header/log grids to one column. Reuse existing CSS variables such as `--demo-border`, `--demo-bg-soft`, and `--demo-text-secondary`; do not alter global styles.

- [ ] **Step 6: Verify component contracts and compilation**

Run:

```bash
pnpm test -- src/components/erp-document-demo/erp-document-demo.test.ts
pnpm typecheck
pnpm build
```

Expected: source contract PASS; typecheck PASS; Vite build PASS.

---

### Task 5: Add three route wrappers and navigation

**Files:**

- Create: `src/views/erp/sales-order-linkage-demo.vue`
- Create: `src/views/erp/purchase-order-linkage-demo.vue`
- Create: `src/views/erp/expense-report-linkage-demo.vue`
- Modify: `src/router/index.ts`
- Modify: `src/router/demo-routes.test.ts`
- Modify: `src/layouts/playground-layout.vue`
- Modify: `src/views/demo-content.test.ts`

**Interfaces:**

- Consumes: `ErpDocumentDemo`, three scenario exports.
- Produces: three named routes in navigation group `ERP 场景`.

- [ ] **Step 1: Extend route tests first**

Add these entries to `expectedRoutes` between PlusTable and Composables:

```ts
['/erp/sales-order-linkage', '销售订单联动', 'ERP 场景', 1],
['/erp/purchase-order-linkage', '采购订单联动', 'ERP 场景', 2],
['/erp/expense-report-linkage', '费用报销联动', 'ERP 场景', 3],
```

Change the test ordering map to:

```ts
const groupOrder = { PlusTable: 0, 'ERP 场景': 1, Composables: 2 };
```

Add raw imports for all three ERP wrappers to `demo-content.test.ts` and assert:

```ts
const erpDemos = [
  [salesOrder, 'salesOrderScenario'],
  [purchaseOrder, 'purchaseOrderScenario'],
  [expenseReport, 'expenseReportScenario'],
] as const;

it.each(erpDemos)(
  'connects an ERP route wrapper to its scenario',
  (source, scenario) => {
    expect(source).toContain('ErpDocumentDemo');
    expect(source).toContain(scenario);
  },
);
```

- [ ] **Step 2: Run route/content tests in the red state**

Run:

```bash
pnpm test -- src/router/demo-routes.test.ts src/views/demo-content.test.ts
```

Expected: FAIL because the wrappers and route records are missing.

- [ ] **Step 3: Create thin route wrappers**

Each wrapper contains only its imports, component name, and selected config. The sales wrapper is:

```vue
<script setup lang="ts">
import ErpDocumentDemo from '@/components/erp-document-demo/erp-document-demo.vue';
import { salesOrderScenario } from '@/components/erp-document-demo/scenarios';

defineOptions({ name: 'SalesOrderLinkageDemo' });
</script>

<template>
  <ErpDocumentDemo :scenario="salesOrderScenario" />
</template>
```

Create equivalent purchase and expense wrappers using `purchaseOrderScenario` / `PurchaseOrderLinkageDemo` and `expenseReportScenario` / `ExpenseReportLinkageDemo`.

- [ ] **Step 4: Register routes and navigation group**

Import the wrappers in `src/router/index.ts`, then add:

```ts
{
  path: 'erp/sales-order-linkage',
  name: 'erp-sales-order-linkage',
  component: SalesOrderLinkageDemo,
  meta: { title: '销售订单联动', group: 'ERP 场景', order: 1 },
},
{
  path: 'erp/purchase-order-linkage',
  name: 'erp-purchase-order-linkage',
  component: PurchaseOrderLinkageDemo,
  meta: { title: '采购订单联动', group: 'ERP 场景', order: 2 },
},
{
  path: 'erp/expense-report-linkage',
  name: 'erp-expense-report-linkage',
  component: ExpenseReportLinkageDemo,
  meta: { title: '费用报销联动', group: 'ERP 场景', order: 3 },
},
```

Change `groupOrder` in `playground-layout.vue` to:

```ts
const groupOrder = ['PlusTable', 'ERP 场景', 'Composables'] as const;
```

- [ ] **Step 5: Run route, content, and full tests**

Run:

```bash
pnpm test -- src/router/demo-routes.test.ts src/views/demo-content.test.ts
pnpm test
```

Expected: route/content tests PASS; full suite PASS.

---

### Task 6: Update README and perform final verification

**Files:**

- Modify: `README.md`

**Interfaces:**

- Produces: discoverable route documentation and final verification evidence.

- [ ] **Step 1: Document the three ERP routes**

Under `## Playground`, keep the existing PlusTable list and add:

```md
ERP 单据联动场景：

- `/erp/sales-order-linkage`
- `/erp/purchase-order-linkage`
- `/erp/expense-report-linkage`
```

Update the repository tree to include:

```text
│   ├── views/erp/            # ERP 单据联动 demo
│   ├── components/erp-document-demo/
```

- [ ] **Step 2: Run formatting checks and format only changed implementation files if needed**

Run:

```bash
pnpm format:check
```

If it reports changed ERP/router/layout/test/README files, run Prettier only on those paths:

```bash
pnpm exec prettier --write src/components/erp-document-demo src/views/erp src/router/index.ts src/router/demo-routes.test.ts src/layouts/playground-layout.vue src/views/demo-content.test.ts README.md docs/superpowers/specs/2026-07-17-erp-document-linkage-demos-design.md docs/superpowers/plans/2026-07-17-erp-document-linkage-demos.md
```

Then rerun `pnpm format:check`; expected: PASS.

- [ ] **Step 3: Run the complete automated verification**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
git diff --check
git status --short
```

Expected:

- all Vitest tests PASS;
- Vue/TypeScript typecheck PASS;
- Vite production build PASS;
- `git diff --check` prints nothing;
- status lists only intended spec, plan, ERP implementation, route/layout/test, and README changes.

- [ ] **Step 4: Perform browser smoke checks**

Start the existing Vite server:

```bash
pnpm dev
```

Verify:

1. All three ERP links appear between PlusTable and Composables.
2. Sales: change price list, preserve one manually edited price, edit quantity, and save.
3. Purchase: change supplier/warehouse, verify inherited/manual behavior, and save.
4. Expense: change project and exchange rate, verify local-currency totals, and save.
5. In one page, simulate a concurrent update, edit locally, save, observe conflict, and reload the server snapshot.
6. At narrow width, header, summary, and linkage log remain readable without horizontal page overflow.

Stop the dev server after the smoke check. Do not commit unless the user explicitly requests a commit.

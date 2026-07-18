import { describe, expect, it } from 'vitest';
import {
  addLineMutation,
  applyDetailMutation,
  buildHeaderMutation,
  normalizeDraft,
  removeLineMutation,
  type DocumentDraft,
  type EmitEffectRules,
} from '../../use-emit-effect/emit-effect';

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

    expect(mutation.nextDraft.lines.map((line) => line.currency)).toEqual([
      'USD',
      'USD',
    ]);
    expect(source.lines[0]?.currency).toBe('CNY');
    expect(mutation.confirmation?.affectedCount).toBe(2);
    expect(mutation.confirmation?.fields).toContain('currency');
  });

  it('preserves manual inherited fields', () => {
    const mutation = buildHeaderMutation(
      rules,
      initialDraft(),
      'warehouseId',
      'WH-SZ',
    );

    expect(mutation.nextDraft.lines[0]?.warehouseId).toBe('WH-SZ');
    expect(mutation.nextDraft.lines[1]?.warehouseId).toBe('WH-B');
    expect(mutation.affectedLineIds).toEqual(['1']);
    expect(mutation.preservedLineIds).toEqual(['2']);
  });

  it('recalculates derived amounts from header context', () => {
    const mutation = buildHeaderMutation(
      rules,
      initialDraft(),
      'multiplier',
      3,
    );

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
    expect(mutation.nextDraft.lines[0]?.fieldSources.warehouseId).toBe(
      'manual',
    );
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

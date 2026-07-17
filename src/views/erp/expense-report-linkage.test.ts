import { describe, expect, it } from 'vitest';
import { buildHeaderMutation } from '@/composables';
import {
  createExpenseReportDraft,
  expenseReportRules,
} from './expense-report-linkage';

describe('expense-report-linkage rules', () => {
  it('forces currency on every line', () => {
    const draft = createExpenseReportDraft();
    const mutation = buildHeaderMutation(
      expenseReportRules,
      draft,
      'currency',
      'USD',
    );
    expect(
      mutation.nextDraft.lines.every((line) => line.currency === 'USD'),
    ).toBe(true);
  });

  it('preserves manual department on inherit', () => {
    const draft = createExpenseReportDraft();
    const mutation = buildHeaderMutation(
      expenseReportRules,
      draft,
      'departmentId',
      'finance',
    );
    const manual = mutation.nextDraft.lines.find(
      (line) => line.fieldSources.departmentId === 'manual',
    );
    expect(manual?.departmentId).not.toBe('finance');
  });

  it('recalculates local amounts when exchange rate changes', () => {
    const draft = createExpenseReportDraft();
    const before = draft.summary.localAmount;
    const mutation = buildHeaderMutation(
      expenseReportRules,
      draft,
      'exchangeRate',
      8,
    );
    expect(mutation.nextDraft.summary.localAmount).not.toBe(before);
    expect(mutation.nextDraft.summary.localAmount).toBeGreaterThan(before!);
  });
});

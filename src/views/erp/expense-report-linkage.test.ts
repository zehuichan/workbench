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

  it('sets default exchange rate when currency changes from default', () => {
    const draft = createExpenseReportDraft();
    const beforeLocal = draft.summary.localAmount;
    const mutation = buildHeaderMutation(
      expenseReportRules,
      draft,
      'currency',
      'USD',
    );
    expect(mutation.nextDraft.header.exchangeRate).toBe(7.2);
    expect(mutation.nextDraft.summary.localAmount).toBeGreaterThan(
      beforeLocal!,
    );
  });

  it('keeps manual exchange rate when currency changes', () => {
    const draft = createExpenseReportDraft();
    const withRate = buildHeaderMutation(
      expenseReportRules,
      draft,
      'exchangeRate',
      6.5,
    );
    const mutation = buildHeaderMutation(
      expenseReportRules,
      withRate.nextDraft,
      'currency',
      'USD',
    );
    expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
  });
});

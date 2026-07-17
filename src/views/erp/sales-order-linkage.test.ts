import { describe, expect, it } from 'vitest';
import { buildHeaderMutation } from '@/composables';
import {
  createSalesOrderDraft,
  salesOrderRules,
} from './sales-order-linkage';

describe('sales-order-linkage rules', () => {
  it('forces currency and preserves manual warehouse', () => {
    const draft = createSalesOrderDraft();
    const currency = buildHeaderMutation(
      salesOrderRules,
      draft,
      'currency',
      'USD',
    );
    expect(
      currency.nextDraft.lines.every((line) => line.currency === 'USD'),
    ).toBe(true);

    const warehouse = buildHeaderMutation(
      salesOrderRules,
      draft,
      'warehouseId',
      'WH-SZ',
    );
    const manual = warehouse.nextDraft.lines.find(
      (line) => line.fieldSources.warehouseId === 'manual',
    );
    expect(manual?.warehouseId).not.toBe('WH-SZ');
  });

  it('reprices inherited unit prices when customer changes', () => {
    const draft = createSalesOrderDraft();
    const mutation = buildHeaderMutation(
      salesOrderRules,
      draft,
      'customerId',
      'customer-channel',
    );
    expect(mutation.nextDraft.lines[0]?.unitPrice).not.toBe(
      draft.lines[0]?.unitPrice,
    );
  });

  it('sets default exchange rate and local amounts when currency changes from default', () => {
    const draft = createSalesOrderDraft();
    expect(draft.header.exchangeRate).toBe(1);
    const beforeLocal = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(
      salesOrderRules,
      draft,
      'currency',
      'USD',
    );
    expect(mutation.nextDraft.header.exchangeRate).toBe(7.2);
    expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(
      beforeLocal!,
    );
    for (const line of mutation.nextDraft.lines) {
      expect(line.localAmount).toBe(
        Math.round((Number(line.amount) * 7.2 + Number.EPSILON) * 100) / 100,
      );
    }
  });

  it('keeps manual exchange rate when currency changes', () => {
    const draft = createSalesOrderDraft();
    const withRate = buildHeaderMutation(
      salesOrderRules,
      draft,
      'exchangeRate',
      6.5,
    );
    const mutation = buildHeaderMutation(
      salesOrderRules,
      withRate.nextDraft,
      'currency',
      'USD',
    );
    expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
  });

  it('recalculates local amounts when exchange rate changes', () => {
    const draft = createSalesOrderDraft();
    const before = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(
      salesOrderRules,
      draft,
      'exchangeRate',
      8,
    );
    expect(mutation.nextDraft.summary.totalLocalAmount).not.toBe(before);
    expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(
      before!,
    );
  });
});

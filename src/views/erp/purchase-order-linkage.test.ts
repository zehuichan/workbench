import { describe, expect, it } from 'vitest';
import { buildHeaderMutation } from '@/composables';
import {
  createPurchaseOrderDraft,
  purchaseOrderRules,
} from './purchase-order-linkage';

describe('purchase-order-linkage rules', () => {
  it('forces currency on every line', () => {
    const draft = createPurchaseOrderDraft();
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
      draft,
      'currency',
      'USD',
    );
    expect(
      mutation.nextDraft.lines.every((line) => line.currency === 'USD'),
    ).toBe(true);
  });

  it('preserves manual warehouse on inherit', () => {
    const draft = createPurchaseOrderDraft();
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
      draft,
      'warehouseId',
      'WH-SZ',
    );
    const manual = mutation.nextDraft.lines.find(
      (line) => line.fieldSources.warehouseId === 'manual',
    );
    expect(manual?.warehouseId).not.toBe('WH-SZ');
  });

  it('reprices inherited unit prices when supplier changes', () => {
    const draft = createPurchaseOrderDraft();
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
      draft,
      'supplierId',
      'supplier-material',
    );
    expect(mutation.nextDraft.lines[0]?.unitPrice).not.toBe(
      draft.lines[0]?.unitPrice,
    );
  });

  it('sets default exchange rate and local amounts when currency changes from default', () => {
    const draft = createPurchaseOrderDraft();
    const beforeLocal = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
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
    const draft = createPurchaseOrderDraft();
    const withRate = buildHeaderMutation(
      purchaseOrderRules,
      draft,
      'exchangeRate',
      6.5,
    );
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
      withRate.nextDraft,
      'currency',
      'USD',
    );
    expect(mutation.nextDraft.header.exchangeRate).toBe(6.5);
  });

  it('recalculates local amounts when exchange rate changes', () => {
    const draft = createPurchaseOrderDraft();
    const before = draft.summary.totalLocalAmount;
    const mutation = buildHeaderMutation(
      purchaseOrderRules,
      draft,
      'exchangeRate',
      8,
    );
    expect(mutation.nextDraft.summary.totalLocalAmount).toBeGreaterThan(
      before!,
    );
  });
});

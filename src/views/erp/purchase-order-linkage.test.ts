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
});

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
});

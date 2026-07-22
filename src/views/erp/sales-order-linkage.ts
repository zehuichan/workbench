import type { PlusTableColumnDef } from '@/components/plus-table';
import type { DocumentDraft, DocumentLine, EmitEffectRules } from '@/composables';
import {
  CURRENCY_OPTIONS,
  WAREHOUSE_OPTIONS,
  forceCurrencyWithRate,
  inheritField,
  money,
  optionLabel,
  repriceInheritedField,
  sum,
  type SelectOption,
} from './emit-helpers';

export const SALES_CUSTOMER_OPTIONS: SelectOption[] = [
  { label: '华东旗舰客户', value: 'customer-east' },
  { label: '全国渠道客户', value: 'customer-channel' },
];

export const SALES_PRODUCT_OPTIONS: SelectOption[] = [
  { label: '商务笔记本', value: 'notebook' },
  { label: '专业显示器', value: 'monitor' },
  { label: '实施服务', value: 'service' },
];

const BASE_PRICES: Record<string, number> = {
  notebook: 6800,
  monitor: 1800,
  service: 1200,
};

function resolveSalesPrice(line: DocumentLine, header: Record<string, unknown>): number {
  const base = BASE_PRICES[String(line.productId)] ?? 0;
  const customerFactor = header.customerId === 'customer-channel' ? 0.95 : 1;
  return money(base * customerFactor);
}

function recalculateSalesLine(line: DocumentLine, header: Record<string, unknown>): DocumentLine {
  const next: DocumentLine = {
    ...line,
    fieldSources: { ...line.fieldSources },
  };
  next.currency = header.currency;
  if (next.fieldSources.warehouseId !== 'manual') {
    next.warehouseId = header.warehouseId;
  }
  if (next.fieldSources.taxRate !== 'manual') {
    next.taxRate = header.taxRate;
  }
  if (next.fieldSources.unitPrice !== 'manual') {
    next.unitPrice = resolveSalesPrice(next, header);
  } else {
    next.unitPrice = money(next.unitPrice);
  }

  const quantity = Number(next.quantity ?? 0);
  const unitPrice = Number(next.unitPrice ?? 0);
  const taxRate = Number(next.taxRate ?? 0);
  next.amount = money(quantity * unitPrice * (1 + taxRate));
  next.localAmount = money(Number(next.amount) * Number(header.exchangeRate ?? 0));
  return next;
}

function createSalesLine(draft: DocumentDraft, id: string): DocumentLine {
  return recalculateSalesLine(
    {
      id,
      fieldSources: {
        unitPrice: 'inherited',
        warehouseId: 'inherited',
        taxRate: 'inherited',
      },
      productId: 'service',
      quantity: 1,
      currency: draft.header.currency,
      warehouseId: draft.header.warehouseId,
      unitPrice: 0,
      taxRate: draft.header.taxRate,
      amount: 0,
    },
    draft.header,
  );
}

export function createSalesOrderDraft(): DocumentDraft {
  const header = {
    documentNo: 'SO-20260717-001',
    customerId: 'customer-east',
    currency: 'CNY',
    exchangeRate: 1,
    warehouseId: 'WH-SH',
    taxRate: 0.13,
  };
  const draft: DocumentDraft = {
    dirty: false,
    header,
    lines: [],
    summary: {},
  };

  const notebook = recalculateSalesLine(
    {
      ...createSalesLine(draft, '1'),
      productId: 'notebook',
      quantity: 2,
    },
    header,
  );
  const monitor = recalculateSalesLine(
    {
      ...createSalesLine(draft, '2'),
      productId: 'monitor',
      quantity: 4,
      warehouseId: 'WH-BJ',
      fieldSources: {
        unitPrice: 'inherited',
        warehouseId: 'manual',
        taxRate: 'inherited',
      },
    },
    header,
  );

  draft.lines = [notebook, monitor];
  draft.summary = {
    totalQty: sum(draft.lines, 'quantity'),
    totalAmount: sum(draft.lines, 'amount'),
    totalLocalAmount: sum(draft.lines, 'localAmount'),
  };
  return draft;
}

export const salesOrderRules: EmitEffectRules = {
  sourceFields: ['unitPrice', 'warehouseId', 'taxRate'],
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
  createLine: createSalesLine,
  recalculateLine: recalculateSalesLine,
  summarize: (lines) => ({
    totalQty: sum(lines, 'quantity'),
    totalAmount: sum(lines, 'amount'),
    totalLocalAmount: sum(lines, 'localAmount'),
  }),
};

export const salesOrderColumns: PlusTableColumnDef[] = [
  { type: 'index', label: '#', width: 54 },
  {
    prop: 'productId',
    label: '商品',
    editable: true,
    component: 'select',
    componentProps: { options: SALES_PRODUCT_OPTIONS },
    formatter: (row: DocumentLine) => optionLabel(SALES_PRODUCT_OPTIONS, row.productId),
  },
  {
    prop: 'quantity',
    label: '数量',
    width: 100,
    editable: true,
    component: 'input-number',
    componentProps: { min: 1, step: 1 },
  },
  {
    prop: 'currency',
    label: '币种',
    width: 110,
    editable: false,
    formatter: (row: DocumentLine) => optionLabel(CURRENCY_OPTIONS, row.currency),
  },
  {
    prop: 'warehouseId',
    label: '仓库',
    width: 120,
    editable: true,
    component: 'select',
    componentProps: { options: WAREHOUSE_OPTIONS },
    formatter: (row: DocumentLine) => optionLabel(WAREHOUSE_OPTIONS, row.warehouseId),
  },
  {
    prop: 'unitPrice',
    label: '单价',
    width: 110,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, precision: 2 },
  },
  {
    prop: 'taxRate',
    label: '税率',
    width: 100,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, max: 1, step: 0.01, precision: 2 },
  },
  {
    prop: 'amount',
    label: '含税金额',
    width: 120,
    editable: false,
  },
  {
    prop: 'localAmount',
    label: '本位币金额',
    width: 120,
    editable: false,
  },
  {
    prop: 'source',
    label: '字段来源',
    editable: false,
  },
  {
    prop: 'actions',
    type: 'operation',
    label: '操作',
    width: 76,
    fixed: 'right',
  },
];

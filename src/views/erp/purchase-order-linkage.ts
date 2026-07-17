import type { PlusTableColumnDef } from '@/components/plus-table';
import type { DocumentDraft, DocumentLine, EmitEffectRules } from '@/composables';
import {
  CURRENCY_OPTIONS,
  WAREHOUSE_OPTIONS,
  forceField,
  inheritField,
  money,
  optionLabel,
  repriceInheritedField,
  sum,
  type SelectOption,
} from './emit-helpers';

export const PURCHASE_SUPPLIER_OPTIONS: SelectOption[] = [
  { label: '华南电子', value: 'supplier-south' },
  { label: '精工材料', value: 'supplier-material' },
];

export const PURCHASE_MATERIAL_OPTIONS: SelectOption[] = [
  { label: '显示器面板', value: 'panel' },
  { label: '控制芯片', value: 'chip' },
  { label: '包装箱', value: 'package' },
];

const BASE_PRICES: Record<string, number> = {
  panel: 950,
  chip: 320,
  package: 18,
};

function resolvePurchasePrice(
  line: DocumentLine,
  header: Record<string, unknown>,
): number {
  const base = BASE_PRICES[String(line.materialId)] ?? 0;
  const supplierFactor = header.supplierId === 'supplier-material' ? 0.94 : 1;
  return money(base * supplierFactor);
}

function recalculatePurchaseLine(
  line: DocumentLine,
  header: Record<string, unknown>,
): DocumentLine {
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
    next.unitPrice = resolvePurchasePrice(next, header);
  } else {
    next.unitPrice = money(next.unitPrice);
  }

  const quantity = Number(next.quantity ?? 0);
  const unitPrice = Number(next.unitPrice ?? 0);
  const taxRate = Number(next.taxRate ?? 0);
  next.amount = money(quantity * unitPrice * (1 + taxRate));
  return next;
}

function createPurchaseLine(draft: DocumentDraft, id: string): DocumentLine {
  return recalculatePurchaseLine(
    {
      id,
      fieldSources: {
        unitPrice: 'inherited',
        warehouseId: 'inherited',
        taxRate: 'inherited',
      },
      materialId: 'package',
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

export function createPurchaseOrderDraft(): DocumentDraft {
  const header = {
    documentNo: 'PO-20260717-001',
    supplierId: 'supplier-south',
    currency: 'CNY',
    warehouseId: 'WH-SH',
    taxRate: 0.13,
  };
  const draft: DocumentDraft = {
    dirty: false,
    header,
    lines: [],
    summary: {},
  };

  draft.lines = [
    recalculatePurchaseLine(
      {
        ...createPurchaseLine(draft, '1'),
        materialId: 'panel',
        quantity: 10,
      },
      header,
    ),
    recalculatePurchaseLine(
      {
        ...createPurchaseLine(draft, '2'),
        materialId: 'chip',
        quantity: 20,
        warehouseId: 'WH-BJ',
        fieldSources: {
          unitPrice: 'inherited',
          warehouseId: 'manual',
          taxRate: 'inherited',
        },
      },
      header,
    ),
  ];
  draft.summary = {
    totalQty: sum(draft.lines, 'quantity'),
    totalAmount: sum(draft.lines, 'amount'),
  };
  return draft;
}

export const purchaseOrderRules: EmitEffectRules = {
  sourceFields: ['unitPrice', 'warehouseId', 'taxRate'],
  headerRules: {
    supplierId: repriceInheritedField('unitPrice', resolvePurchasePrice),
    currency: forceField('currency', 'currency'),
    warehouseId: inheritField('warehouseId', 'warehouseId'),
    taxRate: inheritField('taxRate', 'taxRate'),
  },
  createLine: createPurchaseLine,
  recalculateLine: recalculatePurchaseLine,
  summarize: (lines) => ({
    totalQty: sum(lines, 'quantity'),
    totalAmount: sum(lines, 'amount'),
  }),
};

export const purchaseOrderColumns: PlusTableColumnDef[] = [
  { type: 'index', label: '#', width: 54 },
  {
    prop: 'materialId',
    label: '物料',
    minWidth: 140,
    editable: true,
    component: 'select',
    componentProps: { options: PURCHASE_MATERIAL_OPTIONS },
    formatter: (row: DocumentLine) =>
      optionLabel(PURCHASE_MATERIAL_OPTIONS, row.materialId),
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
    formatter: (row: DocumentLine) =>
      optionLabel(CURRENCY_OPTIONS, row.currency),
  },
  {
    prop: 'warehouseId',
    label: '仓库',
    width: 120,
    editable: true,
    component: 'select',
    componentProps: { options: WAREHOUSE_OPTIONS },
    formatter: (row: DocumentLine) =>
      optionLabel(WAREHOUSE_OPTIONS, row.warehouseId),
  },
  {
    prop: 'unitPrice',
    label: '采购单价',
    width: 120,
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
    label: '价税合计',
    width: 120,
    editable: false,
  },
  { prop: 'source', label: '字段来源', width: 220, editable: false },
  {
    prop: 'actions',
    type: 'operation',
    label: '操作',
    width: 76,
    fixed: 'right',
  },
];

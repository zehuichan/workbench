import type { PlusTableColumnDef } from '@/components/plus-table';
import type { DocumentDraft, DocumentLine, EmitEffectRules } from '@/composables';
import {
  CURRENCY_OPTIONS,
  forceCurrencyWithRate,
  inheritField,
  money,
  optionLabel,
  sum,
  type SelectOption,
} from './emit-helpers';

export const EXPENSE_DEPARTMENT_OPTIONS: SelectOption[] = [
  { label: '研发中心', value: 'rd' },
  { label: '市场中心', value: 'marketing' },
  { label: '财务中心', value: 'finance' },
];

export const EXPENSE_PROJECT_OPTIONS: SelectOption[] = [
  { label: '阿波罗', value: 'apollo' },
  { label: '凤凰', value: 'phoenix' },
  { label: '内部运营', value: 'internal' },
];

export const EXPENSE_TYPE_OPTIONS: SelectOption[] = [
  { label: '差旅费', value: 'travel' },
  { label: '软件服务费', value: 'software' },
  { label: '业务招待费', value: 'entertainment' },
];

function recalculateExpenseLine(
  line: DocumentLine,
  header: Record<string, unknown>,
): DocumentLine {
  const next: DocumentLine = {
    ...line,
    fieldSources: { ...line.fieldSources },
  };
  next.currency = header.currency;
  if (next.fieldSources.departmentId !== 'manual') {
    next.departmentId = header.departmentId;
  }
  if (next.fieldSources.projectId !== 'manual') {
    next.projectId = header.projectId;
  }

  const original = money(next.amount);
  const deductible = money(next.deductibleTax);
  next.amount = original;
  next.deductibleTax = deductible;
  next.localAmount = money(
    Math.max(original - deductible, 0) * Number(header.exchangeRate ?? 0),
  );
  return next;
}

function createExpenseLine(draft: DocumentDraft, id: string): DocumentLine {
  return recalculateExpenseLine(
    {
      id,
      fieldSources: {
        departmentId: 'inherited',
        projectId: 'inherited',
      },
      expenseType: 'travel',
      departmentId: draft.header.departmentId,
      projectId: draft.header.projectId,
      currency: draft.header.currency,
      amount: 100,
      deductibleTax: 0,
      localAmount: 0,
    },
    draft.header,
  );
}

export function createExpenseReportDraft(): DocumentDraft {
  const header = {
    documentNo: 'EX-20260717-001',
    departmentId: 'rd',
    projectId: 'apollo',
    currency: 'CNY',
    exchangeRate: 1,
  };
  const draft: DocumentDraft = {
    dirty: false,
    header,
    lines: [],
    summary: {},
  };

  draft.lines = [
    recalculateExpenseLine(
      {
        ...createExpenseLine(draft, '1'),
        expenseType: 'travel',
        amount: 1200,
        deductibleTax: 100,
      },
      header,
    ),
    recalculateExpenseLine(
      {
        ...createExpenseLine(draft, '2'),
        expenseType: 'software',
        amount: 800,
        deductibleTax: 0,
        departmentId: 'marketing',
        fieldSources: {
          departmentId: 'manual',
          projectId: 'inherited',
        },
      },
      header,
    ),
  ];
  draft.summary = {
    originalAmount: sum(draft.lines, 'amount'),
    deductibleTax: sum(draft.lines, 'deductibleTax'),
    localAmount: sum(draft.lines, 'localAmount'),
  };
  return draft;
}

export const expenseReportRules: EmitEffectRules = {
  sourceFields: ['departmentId', 'projectId'],
  headerRules: {
    departmentId: inheritField('departmentId', 'departmentId'),
    projectId: inheritField('projectId', 'projectId'),
    currency: forceCurrencyWithRate(),
    exchangeRate: {
      policy: 'recalculate',
      requiresConfirmation: true,
      apply: () => ({}),
    },
  },
  createLine: createExpenseLine,
  recalculateLine: recalculateExpenseLine,
  summarize: (lines) => ({
    originalAmount: sum(lines, 'amount'),
    deductibleTax: sum(lines, 'deductibleTax'),
    localAmount: sum(lines, 'localAmount'),
  }),
};

export const expenseReportColumns: PlusTableColumnDef[] = [
  { type: 'index', label: '#', width: 54 },
  {
    prop: 'expenseType',
    label: '费用类型',
    editable: true,
    component: 'select',
    componentProps: { options: EXPENSE_TYPE_OPTIONS },
    formatter: (row: DocumentLine) =>
      optionLabel(EXPENSE_TYPE_OPTIONS, row.expenseType),
  },
  {
    prop: 'departmentId',
    label: '部门',
    width: 120,
    editable: true,
    component: 'select',
    componentProps: { options: EXPENSE_DEPARTMENT_OPTIONS },
    formatter: (row: DocumentLine) =>
      optionLabel(EXPENSE_DEPARTMENT_OPTIONS, row.departmentId),
  },
  {
    prop: 'projectId',
    label: '项目',
    width: 120,
    editable: true,
    component: 'select',
    componentProps: { options: EXPENSE_PROJECT_OPTIONS },
    formatter: (row: DocumentLine) =>
      optionLabel(EXPENSE_PROJECT_OPTIONS, row.projectId),
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
    prop: 'amount',
    label: '原币金额',
    width: 120,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, precision: 2 },
  },
  {
    prop: 'deductibleTax',
    label: '可抵扣税额',
    width: 120,
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, precision: 2 },
  },
  {
    prop: 'localAmount',
    label: '本位币金额',
    width: 120,
    editable: false,
  },
  { prop: 'source', label: '字段来源', editable: false },
  {
    prop: 'actions',
    type: 'operation',
    label: '操作',
    width: 76,
    fixed: 'right',
  },
];

import { isVNode, type VNode } from 'vue';
import { describe, expect, it } from 'vitest';
import { useSummaries } from '../../composables/use-summaries';
import type { TableColumnCtx } from 'element-plus';

interface Row {
  id: number;
  name: string;
  piece: number | null;
  weight: number | string | null;
  amount: number | null;
  currency: string;
}

function col(property?: string): TableColumnCtx<Row> {
  return { property } as TableColumnCtx<Row>;
}

function call(
  summaryMethod: ReturnType<typeof useSummaries<Row>>['summaryMethod'],
  columns: TableColumnCtx<Row>[],
  data: Row[],
) {
  return summaryMethod({ columns, data });
}

function groupTexts(cell: string | VNode | undefined): string[] {
  if (!isVNode(cell)) return [];
  const children = cell.children;
  if (!Array.isArray(children)) return [];
  return children.map((child) => {
    if (!isVNode(child)) return String(child ?? '');
    const text = child.children;
    return typeof text === 'string' ? text : '';
  });
}

const sampleRows: Row[] = [
  { id: 1, name: 'A', piece: 2, weight: 1.25, amount: 10.5, currency: 'CNY' },
  { id: 2, name: 'B', piece: 3, weight: 2.5, amount: 20, currency: 'USD' },
  { id: 3, name: 'C', piece: null, weight: 'x', amount: 5.555, currency: 'CNY' },
];

describe('useSummaries', () => {
  it('sums configured columns from an array and labels the first cell', () => {
    const { summaryMethod } = useSummaries<Row>(['piece', 'amount']);
    const result = call(
      summaryMethod,
      [col('index'), col('name'), col('piece'), col('weight'), col('amount')],
      sampleRows,
    );

    expect(result[0]).toBe('合计');
    expect(result[1]).toBe('');
    expect(result[2]).toBe('5.00');
    expect(result[3]).toBe('');
    expect(result[4]).toBe('36.06');
  });

  it('honors per-column precision, value accessor, and format override', () => {
    const { summaryMethod } = useSummaries<Row>({
      piece: 0,
      weight: {
        precision: 1,
        value: (row) => row.weight,
      },
      amount: {
        format: (total) => `¥${total.toFixed(1)}`,
      },
    });
    const result = call(
      summaryMethod,
      [col('#'), col('piece'), col('weight'), col('amount')],
      sampleRows,
    );

    expect(result[1]).toBe('5');
    expect(result[2]).toBe('3.8');
    expect(result[3]).toBe('¥36.1');
  });

  it('treats null and non-numeric values as zero', () => {
    const { summaryMethod } = useSummaries<Row>(['piece', 'weight']);
    const result = call(
      summaryMethod,
      [col('#'), col('piece'), col('weight')],
      [
        { id: 1, name: 'a', piece: null, weight: 'bad', amount: null, currency: 'CNY' },
        { id: 2, name: 'b', piece: 4, weight: 1.5, amount: null, currency: 'CNY' },
      ],
    );

    expect(result[1]).toBe('4.00');
    expect(result[2]).toBe('1.50');
  });

  it('only fills columns present in the table column list', () => {
    const { summaryMethod } = useSummaries<Row>(['piece', 'weight', 'amount']);
    // Simulate hidden weight column + reordered amount before piece
    const result = call(summaryMethod, [col('#'), col('amount'), col('piece')], sampleRows);

    expect(result).toHaveLength(3);
    expect(result[1]).toBe('36.06');
    expect(result[2]).toBe('5.00');
  });

  it('stacks group totals and group labels when groupBy is set', () => {
    const { summaryMethod } = useSummaries<Row>(
      { amount: 2 },
      {
        groupBy: 'currency',
        groupLabel: (key) => (key === 'CNY' ? '人民币' : key),
      },
    );
    const result = call(summaryMethod, [col('#'), col('currency'), col('amount')], sampleRows);

    expect(result[0]).toBe('合计');
    expect(groupTexts(result[1] as VNode)).toEqual(['人民币', 'USD']);
    expect(groupTexts(result[2] as VNode)).toEqual(['16.06', '20.00']);
  });

  it('re-reads columns from a getter on each call', () => {
    let props: (keyof Row & string)[] = ['piece'];
    const { summaryMethod } = useSummaries<Row>(() => props);
    const columns = [col('#'), col('piece'), col('amount')];

    const first = call(summaryMethod, columns, sampleRows);
    expect(first[1]).toBe('5.00');
    expect(first[2]).toBe('');

    props = ['amount'];
    const second = call(summaryMethod, columns, sampleRows);
    expect(second[1]).toBe('');
    expect(second[2]).toBe('36.06');
  });

  it('uses a custom label and leaves columns without property empty', () => {
    const { summaryMethod } = useSummaries<Row>(['piece'], { label: '小计' });
    const result = call(summaryMethod, [col(), col('piece')], sampleRows);

    expect(result[0]).toBe('小计');
    expect(result[1]).toBe('5.00');
  });

  it('resolves groupBy via a function and groupLabelProp override', () => {
    const { summaryMethod } = useSummaries<Row>(
      { amount: 0 },
      {
        groupBy: (row) => row.currency,
        groupLabelProp: 'name',
      },
    );
    const result = call(summaryMethod, [col('#'), col('name'), col('amount')], sampleRows);

    expect(groupTexts(result[1] as VNode)).toEqual(['CNY', 'USD']);
    expect(groupTexts(result[2] as VNode)).toEqual(['16', '20']);
  });
});

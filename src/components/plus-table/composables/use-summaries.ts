import { h, toValue, type MaybeRefOrGetter, type VNode } from 'vue';
import { groupBy, round, sumBy } from 'es-toolkit';
import type { SummaryMethod } from 'element-plus';
import type { RowData } from '../types';

export interface SummaryFormatContext<T extends RowData = RowData> {
  prop: string;
  rows: T[];
  /** Set when the cell is one group inside a `groupBy` stack. */
  groupKey?: string;
}

export interface SummaryColumnOptions<T extends RowData = RowData> {
  /** Decimal places. Falls back to `options.precision` (default 2). */
  precision?: number;
  /**
   * Addend for this column. Default is `row[prop]`.
   * `null`, `''`, and non-finite numbers count as 0.
   */
  value?: (row: T) => unknown;
  /** Replaces `round(total, precision).toFixed(precision)`. */
  format?: (total: number, ctx: SummaryFormatContext<T>) => string;
}

/**
 * Array: sum these props at the default precision.
 * Object: per-prop precision, or a full {@link SummaryColumnOptions}.
 */
export type SummaryColumns<T extends RowData = RowData> =
  (keyof T & string)[] | { [K in keyof T & string]?: number | SummaryColumnOptions<T> };

export interface UseSummariesOptions<T extends RowData = RowData> {
  /** Text in column index 0. Default `'合计'`. */
  label?: string;
  /** Default decimal places. Default `2`. */
  precision?: number;
  /**
   * Group key. Each configured column then renders one stacked row per group
   * instead of a single total.
   */
  groupBy?: (keyof T & string) | ((row: T) => string);
  /** Column that shows the group key. Defaults to `groupBy` when that is a field name. */
  groupLabelProp?: keyof T & string;
  /** Group key text. Default `String(key)`. */
  groupLabel?: (key: string, rows: T[]) => string;
}

export interface UseSummariesReturn<T extends RowData = RowData> {
  /**
   * Element Plus `summary-method`.
   * The footer stays hidden until the table also receives `show-summary`.
   */
  summaryMethod: SummaryMethod<T>;
}

interface ResolvedColumn<T extends RowData> {
  precision: number;
  value: (row: T) => unknown;
  format?: SummaryColumnOptions<T>['format'];
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fieldValue<T extends RowData>(prop: string): (row: T) => unknown {
  return (row) => row[prop];
}

function resolveColumn<T extends RowData>(
  prop: string,
  entry: number | SummaryColumnOptions<T>,
  defaultPrecision: number,
): ResolvedColumn<T> {
  if (typeof entry === 'number') {
    return { precision: entry, value: fieldValue(prop) };
  }
  return {
    precision: entry.precision ?? defaultPrecision,
    value: entry.value ?? fieldValue(prop),
    format: entry.format,
  };
}

function resolveColumnMap<T extends RowData>(
  columns: SummaryColumns<T>,
  defaultPrecision: number,
): Map<string, ResolvedColumn<T>> {
  const map = new Map<string, ResolvedColumn<T>>();
  if (Array.isArray(columns)) {
    for (const prop of columns)
      map.set(prop, resolveColumn(prop, defaultPrecision, defaultPrecision));
    return map;
  }
  for (const [prop, entry] of Object.entries(columns)) {
    if (typeof entry === 'number' || (entry != null && typeof entry === 'object')) {
      map.set(prop, resolveColumn(prop, entry, defaultPrecision));
    }
  }
  return map;
}

function formatTotal<T extends RowData>(
  column: ResolvedColumn<T>,
  ctx: SummaryFormatContext<T>,
): string {
  const total = sumBy(ctx.rows, (row) => toNumber(column.value(row)));
  return column.format
    ? column.format(total, ctx)
    : round(total, column.precision).toFixed(column.precision);
}

function renderGroupStack(texts: string[]): VNode {
  return h(
    'div',
    { class: 'ptbl-summary-group' },
    texts.map((text) => h('div', { class: 'ptbl-summary-group__item' }, text)),
  );
}

function resolveGroupKey<T extends RowData>(
  groupByOption: UseSummariesOptions<T>['groupBy'],
): ((row: T) => string) | undefined {
  if (groupByOption == null) return undefined;
  if (typeof groupByOption === 'function') return groupByOption;
  return (row) => String(row[groupByOption] ?? '');
}

/**
 * Builds an Element Plus `summary-method`.
 * The footer stays hidden until the table also receives `show-summary`.
 * `null`, `''`, and non-finite values count as 0.
 * Omit the type argument to accept any field name. Pass `useSummaries<Row>` to check prop names.
 *
 * @example
 * ```ts
 * const { summaryMethod } = useSummaries({ piece: 0, amount: 2 });
 *
 * const { summaryMethod: grouped } = useSummaries({ amount: 2 }, { groupBy: 'currency' });
 * ```
 */
export function useSummaries<T extends RowData = RowData>(
  columns: MaybeRefOrGetter<SummaryColumns<NoInfer<T>>>,
  options: UseSummariesOptions<NoInfer<T>> = {},
): UseSummariesReturn<NoInfer<T>> {
  const {
    label = '合计',
    precision: defaultPrecision = 2,
    groupBy: groupByOption,
    groupLabelProp,
    groupLabel = (key) => key,
  } = options;

  const getGroupKey = resolveGroupKey(groupByOption);
  const resolvedGroupLabelProp =
    groupLabelProp ?? (typeof groupByOption === 'string' ? groupByOption : undefined);

  const summaryMethod: SummaryMethod<NoInfer<T>> = ({ columns: tableColumns, data }) => {
    const columnMap = resolveColumnMap(toValue(columns), defaultPrecision);
    const grouped = getGroupKey ? groupBy(data, (row) => getGroupKey(row)) : undefined;
    const groupKeys = grouped ? Object.keys(grouped) : [];

    return tableColumns.map((column, index) => {
      if (index === 0) return label;

      const prop = column.property;
      if (!prop) return '';

      if (grouped && prop === resolvedGroupLabelProp) {
        return renderGroupStack(groupKeys.map((key) => groupLabel(key, grouped[key] ?? [])));
      }

      const config = columnMap.get(prop);
      if (!config) return '';
      if (!grouped) return formatTotal(config, { prop, rows: data });

      return renderGroupStack(
        groupKeys.map((key) => {
          const rows = grouped[key] ?? [];
          return formatTotal(config, { prop, rows, groupKey: key });
        }),
      );
    });
  };

  return { summaryMethod };
}

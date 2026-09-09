import type { ComputedRef } from 'vue';

import type {
  GridyColumn,
  GridyProps,
  GridyRecord,
  GridySummaryCell,
  GridySummarySlotProps,
} from '../types';

import { computed } from 'vue';

import { isFunction } from 'es-toolkit';

import { buildSummaryCells, isSummaryDataColumn } from '../summary';

export interface UseSummaryOptions {
  columns: ComputedRef<GridyColumn[]>;
  hasSummarySlot: () => boolean;
  rows: ComputedRef<GridyRecord[]>;
}

/** 合计行：列 `summary` 决定「这一列怎么算」，顶层 `props.summary` 决定文案 / 吸底 / 数据范围 */
export function useSummary(
  props: GridyProps,
  { columns, hasSummarySlot, rows }: UseSummaryOptions,
) {
  const enabled = computed(
    () => !props.summary?.disabled && (hasSummarySlot() || columns.value.some(isSummaryDataColumn)),
  );

  const label = computed(() => props.summary?.label ?? '合计');

  const summaryRows = computed<GridyRecord[]>(() => {
    const source = props.summary?.rows;
    return (isFunction(source) ? source() : source) ?? rows.value;
  });

  /** 缺省：存在 `scroll.y` 或 `virtual` 时吸底 */
  const fixed = computed(
    () => props.summary?.fixed ?? (!!props.virtual || props.scroll?.y !== undefined),
  );

  const cells = computed<GridySummaryCell[]>(() =>
    enabled.value ? buildSummaryCells(columns.value, summaryRows.value, label.value) : [],
  );

  const slotProps = computed<GridySummarySlotProps>(() => ({
    cells: cells.value,
    label: label.value,
    rows: summaryRows.value,
  }));

  return {
    cells,
    enabled,
    fixed,
    slotProps,
  };
}

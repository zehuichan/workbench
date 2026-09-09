import {
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from '@tanstack/vue-table';

/**
 * Gridy 用到的 TanStack Table v9 features：排序 + 展开（列 / 行模型）。
 * 行模型链 core → sorted → expanded：树形模式下 expandedRowModel 把已展开的 subRows 扁平进
 * `getRowModel().rows`；面板模式无 subRows，扁平化是恒等操作。展开态受控于 `expandedRowKeys`。
 * 行选择、分页与尾行合计仍由组件自管，不接入 rowSelection / rowPagination / columnAggregations。
 * sortFns 按 auto 推断可能用到的内置函数按需注册，避免拉全量 sortFns 注册表。
 */
export const gridyFeatures = tableFeatures({
  rowExpandingFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export type GridyFeatures = typeof gridyFeatures;

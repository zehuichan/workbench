import type { ComputedRef } from 'vue';

import type { ElSize } from '../el';
import { toElSize } from '../el';
import type { GridyEmits, GridyPagination, GridyProps, GridyRecord } from '../types';
import { isFunction } from 'es-toolkit';

import { computed } from 'vue';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/** 内部归一化后的分页配置，供模板直接绑定，避免多处重复兜底 */
export interface GridyResolvedPagination extends GridyPagination {
  pageSize: number;
  showQuickJumper: boolean;
  showSizeChanger: boolean;
  total: number;
}

/**
 * 分页（后端驱动：组件不做本地切片，v-model 即当前页数据）。
 * 只负责归一化配置与转发翻页意图，请求后端与写回 v-model / pagination 都是使用方的职责。
 */
export function usePagination(
  props: GridyProps,
  emit: GridyEmits,
  rows: ComputedRef<GridyRecord[]>,
) {
  const enabled = computed(() => !!props.pagination);

  const config = computed<GridyResolvedPagination>(() => {
    const source = props.pagination;
    return {
      ...source,
      current: source?.current ?? 1,
      pageSize: source?.pageSize ?? 10,
      showQuickJumper: source?.showQuickJumper ?? false,
      showSizeChanger: source?.showSizeChanger ?? false,
      total: source?.total ?? rows.value.length,
    };
  });

  /**
   * 分页时 rows 只是当前页数据，max/min 的「总行数」语义必须用后端传入的 total 兜底，
   * 否则页容量小于 max 时 canAdd 恒为 true，起不到限制总数的作用；total 缺省时退化为
   * 当前页行数（不会比不分页时更宽松）。
   */
  const totalRowCount = computed(() => (enabled.value ? config.value.total : rows.value.length));

  /** 当前页在全量数据中的起始偏移，用于序号列展示真实序号 */
  const pageOffset = computed(() =>
    enabled.value ? (config.value.current - 1) * config.value.pageSize : 0,
  );

  const pageSizeOptions = computed(() =>
    (config.value.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS).map(Number),
  );

  const size = computed<ElSize>(() => toElSize(props.size ?? 'small'));

  const showTotalFn = computed(() => {
    const { showTotal } = config.value;
    if (isFunction(showTotal)) {
      return showTotal;
    }
    return showTotal ? (total: number) => `共 ${total} 条` : undefined;
  });

  const layout = computed(() => {
    const parts: string[] = [];
    if (showTotalFn.value) {
      parts.push('total');
    }
    if (config.value.showSizeChanger) {
      parts.push('sizes');
    }
    parts.push('prev', 'pager', 'next');
    if (config.value.showQuickJumper) {
      parts.push('jumper');
    }
    return parts.join(', ');
  });

  const totalText = computed(() => {
    const fn = showTotalFn.value;
    if (!fn) {
      return '';
    }
    const { current, pageSize, total } = config.value;
    const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const end = Math.min(current * pageSize, total);
    return fn(total, [start, end]);
  });

  function onPageChange(page: number, pageSize: number) {
    emit('pageChange', page, pageSize);
  }

  return {
    config,
    enabled,
    layout,
    onPageChange,
    pageOffset,
    pageSizeOptions,
    size,
    totalRowCount,
    totalText,
  };
}

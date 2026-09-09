import type { ComponentPublicInstance, ComputedRef } from 'vue';

import type { GridyRow, GridyScroll, GridySize, GridyVirtual } from '../types';

import { computed, nextTick, ref, watchEffect } from 'vue';

import { isPlainObject } from 'es-toolkit';

import { useVirtualizer } from '@tanstack/vue-virtual';

import {
  findRow,
  findSection,
  isInView,
  scrollIntoView,
  VIEW_INDEX_ATTR,
  waitForFrame,
} from '../dom';

/** 各尺寸的行高估算值（控件高 + 单元格上下 padding + 1px 边框，见 gridy.scss 尺寸修饰符）；真实高度由 measureElement 动态修正 */
const ESTIMATED_ROW_HEIGHT: Record<GridySize, number> = {
  large: 65,
  middle: 49,
  small: 33,
};

const DEFAULT_HEIGHT = 400;
const DEFAULT_OVERSCAN = 5;
const MAX_ROW_WAIT_ATTEMPTS = 10;

export interface GridyDisplayRow {
  row: GridyRow;
  /** 展示序（viewIndex），对应 `data-view-index` */
  viewIndex: number;
}

export interface UseVirtualOptions {
  getScrollElement: () => HTMLElement | null;
  renderRows: ComputedRef<GridyRow[]>;
  scroll: () => GridyScroll | undefined;
  size: () => GridySize;
  summaryFixed?: () => boolean;
  virtual: () => boolean | GridyVirtual | undefined;
}

function toCssSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * 行虚拟滚动（对应 `virtual` prop）：缺省时 displayRows 退化为全量 renderRows。
 * 滚动高度只读 `scroll.y`（对齐 a-table）；对外暴露 `ensureRowVisible(viewIndex)`，
 * 供键盘导航与公开 scrollToRow 共用。
 */
export function useVirtual({
  getScrollElement,
  renderRows,
  scroll,
  size,
  summaryFixed,
  virtual,
}: UseVirtualOptions) {
  const virtualConfig = computed<GridyVirtual | null>(() => {
    const value = virtual();
    if (!value) {
      return null;
    }
    return isPlainObject(value) ? value : {};
  });
  const virtualEnabled = computed(() => !!virtualConfig.value);

  const headerHeight = ref(0);
  const footerHeight = ref(0);

  function syncChromeHeights() {
    const container = getScrollElement();
    if (!container) {
      headerHeight.value = 0;
      footerHeight.value = 0;
      return;
    }
    headerHeight.value = findSection(container, 'thead')?.getBoundingClientRect().height ?? 0;
    footerHeight.value = summaryFixed?.()
      ? (findSection(container, 'tfoot')?.getBoundingClientRect().height ?? 0)
      : 0;
  }

  watchEffect(
    () => {
      if (virtualEnabled.value) {
        syncChromeHeights();
      }
    },
    { flush: 'post' },
  );

  function rowEstimateSize(): number {
    return virtualConfig.value?.estimateSize ?? ESTIMATED_ROW_HEIGHT[size()];
  }

  const rowVirtualizer = useVirtualizer(
    computed(() => ({
      count: renderRows.value.length,
      enabled: virtualEnabled.value,
      estimateSize: () => rowEstimateSize(),
      getItemKey: (index: number) => renderRows.value[index]?.id ?? index,
      getScrollElement,
      // 行上用 data-view-index（与原始 dataIndex 区分）；勿默认 data-index
      indexAttribute: VIEW_INDEX_ATTR,
      overscan: virtualConfig.value?.overscan ?? DEFAULT_OVERSCAN,
      scrollPaddingEnd: footerHeight.value || headerHeight.value,
      scrollPaddingStart: headerHeight.value,
    })),
  );

  const virtualItems = computed(() =>
    virtualEnabled.value ? rowVirtualizer.value.getVirtualItems() : [],
  );

  const displayRows = computed<GridyDisplayRow[]>(() => {
    if (!virtualEnabled.value) {
      return renderRows.value.map((row, viewIndex) => ({ row, viewIndex }));
    }
    return virtualItems.value
      .map((item) => {
        const row = renderRows.value[item.index];
        return row ? { row, viewIndex: item.index } : null;
      })
      .filter((item): item is GridyDisplayRow => !!item);
  });

  const paddingTop = computed(() => virtualItems.value[0]?.start ?? 0);
  const paddingBottom = computed(() => {
    if (!virtualEnabled.value) {
      return 0;
    }
    const lastEnd = virtualItems.value.at(-1)?.end ?? 0;
    return Math.max(0, rowVirtualizer.value.getTotalSize() - lastEnd);
  });

  const scrollStyle = computed(() => {
    const scrollValue = scroll();
    const y = scrollValue?.y;
    const x = scrollValue?.x;
    // 虚拟滚动缺省高度；非虚拟仅在显式 scroll.y / scroll.x 时启用滚动容器样式
    if (!virtualEnabled.value && y === undefined && x === undefined) {
      return undefined;
    }
    const style: Record<string, string> = {
      overflow: 'auto',
    };
    if (virtualEnabled.value || y !== undefined) {
      style.height = toCssSize(y ?? DEFAULT_HEIGHT);
    }
    if (x !== undefined) {
      style.minWidth = '100%';
    }
    return style;
  });

  const tableStyle = computed(() => {
    const x = scroll()?.x;
    if (x === undefined) {
      return undefined;
    }
    return { minWidth: toCssSize(x) };
  });

  /** 量的是每行的 tbody（主行 + 展开面板 / 嵌套子表一起），高度变化由 ResizeObserver 回流 */
  function measureRow(el: ComponentPublicInstance | Element | null) {
    if (virtualEnabled.value && el instanceof Element) {
      rowVirtualizer.value.measureElement(el);
    }
  }

  function estimatedEndScrollOffset(viewIndex: number): number {
    const viewport = getScrollElement()?.clientHeight ?? DEFAULT_HEIGHT;
    const itemEnd = (viewIndex + 1) * rowEstimateSize();
    return Math.max(0, itemEnd + headerHeight.value - viewport);
  }

  let scrollToken = 0;

  async function waitForRowElement(viewIndex: number, token: number): Promise<HTMLElement | null> {
    for (let i = 0; i < MAX_ROW_WAIT_ATTEMPTS; i++) {
      if (token !== scrollToken) {
        return null;
      }
      const container = getScrollElement();
      const rowEl = container && findRow(container, viewIndex);
      if (rowEl) {
        return rowEl;
      }
      await nextTick();
      await waitForFrame();
    }
    return null;
  }

  /**
   * 确保展示序上行已渲染并进入视口，返回行 tr。
   * 虚拟 / 非虚拟共用；键盘导航只应 await 这一入口再聚焦。
   */
  async function ensureRowVisible(
    viewIndex: number,
    align: 'auto' | 'end' = 'auto',
  ): Promise<HTMLElement | null> {
    const container = getScrollElement();
    if (!container) {
      return null;
    }

    if (!virtualEnabled.value) {
      const rowEl = findRow(container, viewIndex);
      if (rowEl && !isInView(container, rowEl)) {
        scrollIntoView(container, rowEl, { alignEnd: align === 'end' });
      }
      return rowEl;
    }

    syncChromeHeights();
    const token = ++scrollToken;
    if (align === 'auto') {
      rowVirtualizer.value.scrollToIndex(viewIndex, { align });
    } else {
      container.scrollTop = estimatedEndScrollOffset(viewIndex);
    }

    let rowEl = await waitForRowElement(viewIndex, token);
    if (!rowEl) {
      rowVirtualizer.value.scrollToIndex(viewIndex, { align: 'end' });
      rowEl = await waitForRowElement(viewIndex, token);
    }
    if (token !== scrollToken) {
      return null;
    }
    if (rowEl && !isInView(container, rowEl, { alignEnd: align === 'end' })) {
      scrollIntoView(container, rowEl, { alignEnd: align === 'end' });
    }
    return rowEl;
  }

  /** 行 id → viewIndex 后确保可见；树形子行也在 renderRows（已展开）里，按 id 找比按 index 稳 */
  function scrollToRowId(rowId: string, align: 'auto' | 'end' = 'end') {
    const viewIndex = renderRows.value.findIndex((row) => row.id === rowId);
    if (viewIndex === -1) {
      return;
    }
    void ensureRowVisible(viewIndex, align);
  }

  return {
    displayRows,
    ensureRowVisible,
    measureRow,
    paddingBottom,
    paddingTop,
    scrollStyle,
    scrollToRowId,
    tableStyle,
    virtualEnabled,
  };
}

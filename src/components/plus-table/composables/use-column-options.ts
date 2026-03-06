import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { isBoolean } from '@/utils';

import type { PlusTableColumn, RowData } from '../types';

export interface UseColumnOptionsOptions {
  /** 列配置来源（通常为 props.columns） */
  initialColumns: Ref<PlusTableColumn[]>;
  /** 持久化 key，与 storage 一起使用 */
  tableKey?: string;
  /** 持久化存储：local | session | false */
  storage?: 'local' | 'session' | false;
}

interface PersistedColumnConfig {
  prop: string;
  hidden: boolean;
  order: number;
  /** 列宽（拖拽表头调整后持久化） */
  width?: number;
}

function getStorageKey(tableKey: string): string {
  return `plus-table:${tableKey}:columns`;
}

function getStorage(type: 'local' | 'session'): Storage | null {
  try {
    return type === 'local' ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}

export function useColumnOptions(options: UseColumnOptionsOptions) {
  const { initialColumns, tableKey, storage = false } = options;

  const columnOrder = ref<string[]>([]);
  const hiddenColumns = ref(new Set<string>());
  /** 列宽覆盖（prop -> width），拖拽表头或持久化恢复时写入 */
  const columnWidths = ref<Record<string, number>>({});

  function loadFromStorage(): void {
    if (!storage || !tableKey) return;
    const store = getStorage(storage);
    if (!store) return;

    try {
      const raw = store.getItem(getStorageKey(tableKey));
      if (!raw) return;
      const configs: PersistedColumnConfig[] = JSON.parse(raw);

      const order: string[] = [];
      const hidden = new Set<string>();
      const widths: Record<string, number> = {};

      for (const config of configs.sort((a, b) => a.order - b.order)) {
        order.push(config.prop);
        if (config.hidden) hidden.add(config.prop);
        if (config.width != null && config.width > 0) {
          widths[config.prop] = config.width;
        }
      }

      columnOrder.value = order;
      hiddenColumns.value = hidden;
      columnWidths.value = widths;
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[PlusTable] 读取列设置存储失败:', e);
      }
    }
  }

  function saveToStorage(): void {
    if (!storage || !tableKey) return;
    const store = getStorage(storage);
    if (!store) return;

    const all = initialColumns.value;
    const configs: PersistedColumnConfig[] = [];
    const orderedProps =
      columnOrder.value.length > 0
        ? columnOrder.value
        : (all.map((c) => c.prop).filter(Boolean) as string[]);

    const widths = columnWidths.value;
    orderedProps.forEach((prop, index) => {
      const item: PersistedColumnConfig = {
        prop,
        hidden: hiddenColumns.value.has(prop),
        order: index,
      };
      if (widths[prop] != null && widths[prop] > 0) {
        item.width = widths[prop];
      }
      configs.push(item);
    });

    try {
      store.setItem(getStorageKey(tableKey), JSON.stringify(configs));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[PlusTable] 写入列设置存储失败:', e);
      }
    }
  }

  const isColumnHidden = (column: PlusTableColumn): boolean => {
    if (column.prop && hiddenColumns.value.has(column.prop)) return true;
    if (isBoolean(column.hidden)) {
      return column.hidden;
    }
    return false;
  };

  const visibleColumns = computed(() => {
    const cols = initialColumns.value;
    const order = columnOrder.value;

    let ordered: PlusTableColumn[];
    if (order.length > 0) {
      const colMap = new Map<string, PlusTableColumn>();
      const specialCols: PlusTableColumn[] = [];

      for (const col of cols) {
        if (col.prop) {
          colMap.set(col.prop, col);
        } else {
          specialCols.push(col);
        }
      }

      ordered = [...specialCols];
      for (const prop of order) {
        const col = colMap.get(prop);
        if (col) ordered.push(col);
        colMap.delete(prop);
      }
      for (const col of colMap.values()) {
        ordered.push(col);
      }
    } else {
      ordered = cols;
    }

    const filtered = ordered.filter((col) => !isColumnHidden(col));
    const widths = columnWidths.value;
    return filtered.map((col) => {
      if (!col.prop || widths[col.prop] == null) return col;
      return { ...col, width: widths[col.prop] };
    });
  });

  function toggleColumn(prop: string, visible: boolean): void {
    const next = new Set(hiddenColumns.value);
    if (visible) {
      next.delete(prop);
    } else {
      next.add(prop);
    }
    hiddenColumns.value = next;
    saveToStorage();
  }

  function reorderColumns(fromIndex: number, toIndex: number): void {
    const cols = initialColumns.value
      .map((c) => c.prop)
      .filter(Boolean) as string[];
    const order = columnOrder.value.length > 0 ? [...columnOrder.value] : cols;

    if (
      fromIndex < 0 ||
      fromIndex >= order.length ||
      toIndex < 0 ||
      toIndex >= order.length
    )
      return;

    const [item] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, item as any);
    columnOrder.value = order;
    saveToStorage();
  }

  /** 更新列宽并持久化（拖拽表头改变宽度时调用） */
  function setColumnWidth(prop: string, width: number): void {
    if (!prop) return;
    columnWidths.value = { ...columnWidths.value, [prop]: width ?? '' };
    saveToStorage();
  }

  function resetColumns(): void {
    columnOrder.value = [];
    hiddenColumns.value = new Set();
    columnWidths.value = {};
    if (storage && tableKey) {
      const store = getStorage(storage);
      store?.removeItem(getStorageKey(tableKey));
    }
  }

  /** 获取所有有 prop 的列（含隐藏），按顺序，供列设置面板使用 */
  function getOrderedColumnsWithProp(): PlusTableColumn<RowData>[] {
    const cols = initialColumns.value;
    const props =
      columnOrder.value.length > 0
        ? columnOrder.value
        : (cols.map((c) => c.prop).filter(Boolean) as string[]);
    const colMap = new Map<string, PlusTableColumn>();
    for (const col of cols) {
      if (col.prop) colMap.set(col.prop, col);
    }
    const result: PlusTableColumn<RowData>[] = [];
    for (const p of props) {
      const col = colMap.get(p);
      if (col) {
        result.push(col);
        colMap.delete(p);
      }
    }
    for (const col of colMap.values()) {
      result.push(col);
    }
    return result;
  }

  loadFromStorage();

  watch(
    () => initialColumns.value.length,
    () => {
      loadFromStorage();
    },
  );

  return {
    visibleColumns,
    hiddenColumns,
    columnWidths,
    toggleColumn,
    reorderColumns,
    setColumnWidth,
    resetColumns,
    getOrderedColumnsWithProp,
    isColumnHidden: (prop: string) => hiddenColumns.value.has(prop),
  };
}

import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { isBoolean } from '@/utils';

import type { PlusTableColumn, RowData } from '../types';
import {
  collectLeafProps,
  flattenColumnsWithProp,
  getColumnSettingTree as buildColumnSettingTree,
  getTopLevelIds,
  getSpecialColumnIds,
  applyTopLevelOrder,
  getColumnId,
} from '../utils/column-utils';

function getEffectiveOrder(cols: PlusTableColumn[], order: string[]): string[] {
  return order.length > 0 ? order : getTopLevelIds(cols);
}
import type { ColumnSettingNode } from '../utils/column-utils';

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
      const cols = initialColumns.value;
      const idToCol = new Map(cols.map((c) => [getColumnId(c), c]));

      for (const config of configs.sort((a, b) => a.order - b.order)) {
        order.push(config.prop);
        if (config.hidden) {
          const col = idToCol.get(config.prop);
          if (col?.children?.length) {
            collectLeafProps(col).forEach((p) => hidden.add(p));
          } else {
            hidden.add(config.prop);
          }
        }
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

    const cols = initialColumns.value;
    const topLevelOrder = getEffectiveOrder(cols, columnOrder.value);
    const widths = columnWidths.value;
    const configs: PersistedColumnConfig[] = [];
    topLevelOrder.forEach((id, index) => {
      const col = cols.find((c) => getColumnId(c) === id);
      const hidden = col?.children?.length
        ? collectLeafProps(col).every((p) => hiddenColumns.value.has(p))
        : hiddenColumns.value.has(id);
      const item: PersistedColumnConfig = { prop: id, hidden, order: index };
      if (widths[id] != null && widths[id] > 0) item.width = widths[id];
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
      return column.hidden === true;
    }
    return false;
  };

  /** 递归过滤树形列：隐藏的叶子移除；若父列下所有子列都被隐藏则移除父列 */
  function filterColumnsTree(
    cols: PlusTableColumn[],
    isHidden: (c: PlusTableColumn) => boolean,
  ): PlusTableColumn[] {
    const result: PlusTableColumn[] = [];
    for (const col of cols) {
      if (col.children?.length) {
        const filteredChildren = filterColumnsTree(col.children, isHidden);
        if (filteredChildren.length === 0) continue;
        result.push({ ...col, children: filteredChildren });
      } else if (!isHidden(col)) {
        result.push(col);
      }
    }
    return result;
  }

  const visibleColumns = computed(() => {
    const cols = initialColumns.value;
    const topLevelOrder = getEffectiveOrder(cols, columnOrder.value);
    const ordered = applyTopLevelOrder(cols, topLevelOrder);
    const filtered = filterColumnsTree(ordered, (col) => isColumnHidden(col));
    const widths = columnWidths.value;
    return filtered.map((col) => {
      if (!col.prop || widths[col.prop] == null) return col;
      return { ...col, width: widths[col.prop] };
    });
  });

  function toggleColumn(prop: string, visible: boolean): void {
    const next = new Set(hiddenColumns.value);
    const cols = initialColumns.value;
    const col = cols.find((c) => getColumnId(c) === prop);
    const propsToToggle = col?.children?.length
      ? collectLeafProps(col)
      : [prop];
    for (const p of propsToToggle) {
      if (visible) next.delete(p);
      else next.add(p);
    }
    hiddenColumns.value = next;
    saveToStorage();
  }

  function setColumnOrderByIds(ids: string[]): void {
    const specialIds = getSpecialColumnIds(initialColumns.value);
    const specialSet = new Set(specialIds);
    const configurableIds = ids.filter((id) => !specialSet.has(id));
    columnOrder.value = [...specialIds, ...configurableIds];
    saveToStorage();
  }

  function getColumnSettingTree(): ColumnSettingNode[] {
    const cols = initialColumns.value;
    return buildColumnSettingTree(cols, getEffectiveOrder(cols, columnOrder.value));
  }

  function reorderColumns(fromIndex: number, toIndex: number): void {
    const cols = initialColumns.value;
    const order = [...getEffectiveOrder(cols, columnOrder.value)];

    if (
      fromIndex < 0 ||
      fromIndex >= order.length ||
      toIndex < 0 ||
      toIndex >= order.length
    )
      return;

    const [item] = order.splice(fromIndex, 1);
    if (item == null) return;
    order.splice(toIndex, 0, item);
    columnOrder.value = order;
    saveToStorage();
  }

  /** 将宽值规范为有效数字（用于持久化），无效则返回 undefined */
  function normalizeWidth(val: string | number | null | undefined): number | undefined {
    if (val == null || val === '') return undefined;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  /** 更新列宽并持久化（拖拽表头或列设置面板输入时调用） */
  function setColumnWidth(prop: string, width: string | number): void {
    if (!prop) return;
    const parsed = normalizeWidth(width);
    const next = { ...columnWidths.value };
    if (parsed != null) {
      next[prop] = parsed;
    } else {
      delete next[prop];
    }
    columnWidths.value = next;
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

  /** 获取所有有 prop 的列（含隐藏、含多级表头子列），按顺序，供列设置面板使用 */
  function getOrderedColumnsWithProp(): PlusTableColumn<RowData>[] {
    const flat = flattenColumnsWithProp(initialColumns.value);
    const props =
      columnOrder.value.length > 0
        ? columnOrder.value
        : (flat.map((c) => c.prop).filter(Boolean) as string[]);
    const colMap = new Map<string, PlusTableColumn>();
    for (const col of flat) {
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

  /** 列签名：columns 增删或顺序变化时需重新加载持久化 */
  watch(
    () => initialColumns.value.map((c) => getColumnId(c)).join(','),
    loadFromStorage,
  );

  return {
    visibleColumns,
    hiddenColumns,
    columnWidths,
    columnOrder,
    toggleColumn,
    reorderColumns,
    setColumnOrderByIds,
    setColumnWidth,
    resetColumns,
    getOrderedColumnsWithProp,
    getColumnSettingTree,
    isColumnHidden: (prop: string) => hiddenColumns.value.has(prop),
    isNodeHidden: (node: ColumnSettingNode) => {
      if (node.column.children?.length) {
        return collectLeafProps(node.column).every((p) =>
          hiddenColumns.value.has(p),
        );
      }
      return !!node.column.prop && hiddenColumns.value.has(node.column.prop);
    },
  };
}

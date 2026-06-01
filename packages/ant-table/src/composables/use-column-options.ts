import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { useDebounceFn } from '@vueuse/core';

import type { AntTableColumn } from '../types';
import type { ColumnSettingNode } from '../utils';
import {
  applyTopLevelOrder,
  collectLeafIds,
  getColumnId,
  getColumnSettingTree as buildColumnSettingTree,
  getTopLevelIds,
} from '../utils';
import { COLUMN_SETTING_STORAGE_PREFIX } from '../constants';

function getEffectiveOrder(cols: AntTableColumn[], order: string[]): string[] {
  return order.length > 0 ? order : getTopLevelIds(cols);
}

export interface UseColumnOptionsOptions {
  /** 列配置来源（通常为 props.columns） */
  initialColumns: Ref<AntTableColumn[]>;
  /** 持久化 key，与 storage 一起使用 */
  tableKey?: string;
  /** 持久化存储：local | session | false */
  storage?: 'local' | 'session' | false;
}

interface PersistedColumnConfig {
  id: string;
  hidden: boolean;
  order: number;
  width?: number;
}

function getStorageKey(tableKey: string): string {
  return `${COLUMN_SETTING_STORAGE_PREFIX}:${tableKey}:columns`;
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
  /** 列宽覆盖（id -> width），拖拽表头或持久化恢复时写入 */
  const columnWidths = ref<Record<string, number>>({});

  let columnStateSnapshot: {
    order: string[];
    hidden: Set<string>;
    widths: Record<string, number>;
  } | null = null;

  function snapshotColumnState(): void {
    columnStateSnapshot = {
      order: [...columnOrder.value],
      hidden: new Set(hiddenColumns.value),
      widths: { ...columnWidths.value },
    };
  }

  function restoreColumnState(): void {
    if (!columnStateSnapshot) return;
    columnOrder.value = columnStateSnapshot.order;
    hiddenColumns.value = new Set(columnStateSnapshot.hidden);
    columnWidths.value = { ...columnStateSnapshot.widths };
    columnStateSnapshot = null;
    debouncedSaveToStorage();
  }

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
        order.push(config.id);
        if (config.hidden) {
          const col = idToCol.get(config.id);
          if (col?.children?.length) {
            collectLeafIds(col).forEach((id) => hidden.add(id));
          } else {
            hidden.add(config.id);
          }
        }
        if (config.width != null && config.width > 0) {
          widths[config.id] = config.width;
        }
      }

      columnOrder.value = order;
      hiddenColumns.value = hidden;
      columnWidths.value = widths;
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[AntTable] 读取列设置存储失败:', e);
      }
    }
  }

  const debouncedSaveToStorage = useDebounceFn(saveToStorage, 100);

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
        ? collectLeafIds(col).every((leafId) => hiddenColumns.value.has(leafId))
        : hiddenColumns.value.has(id);
      const item: PersistedColumnConfig = { id, hidden, order: index };
      if (widths[id] != null && widths[id] > 0) item.width = widths[id];
      configs.push(item);
    });

    try {
      store.setItem(getStorageKey(tableKey), JSON.stringify(configs));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[AntTable] 写入列设置存储失败:', e);
      }
    }
  }

  const shouldHideColumn = (column: AntTableColumn): boolean => {
    if (hiddenColumns.value.has(getColumnId(column))) return true;
    return column.hidden === true;
  };

  /** 递归过滤树形列：隐藏的叶子移除；若父列下所有子列都被隐藏则移除父列 */
  function filterColumnsTree(
    cols: AntTableColumn[],
    isHidden: (c: AntTableColumn) => boolean,
  ): AntTableColumn[] {
    const result: AntTableColumn[] = [];
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
    const filtered = filterColumnsTree(ordered, shouldHideColumn);
    const widths = columnWidths.value;
    return filtered.map((col) => {
      const id = getColumnId(col);
      if (widths[id] == null) return col;
      return { ...col, width: widths[id] };
    });
  });

  function toggleColumn(id: string, visible: boolean): void {
    const next = new Set(hiddenColumns.value);
    const cols = initialColumns.value;
    const col = cols.find((c) => getColumnId(c) === id);
    const idsToToggle = col?.children?.length ? collectLeafIds(col) : [id];
    for (const leafId of idsToToggle) {
      if (visible) next.delete(leafId);
      else next.add(leafId);
    }
    hiddenColumns.value = next;
    debouncedSaveToStorage();
  }

  function setColumnOrderByIds(ids: string[]): void {
    columnOrder.value = [...ids];
    debouncedSaveToStorage();
  }

  function getColumnSettingTree(): ColumnSettingNode[] {
    const cols = initialColumns.value;
    return buildColumnSettingTree(
      cols,
      getEffectiveOrder(cols, columnOrder.value),
    );
  }

  /** 上/下移动某顶层列（delta = -1 上移，+1 下移） */
  function moveColumn(id: string, delta: number): void {
    const cols = initialColumns.value;
    const order = [...getEffectiveOrder(cols, columnOrder.value)];
    const from = order.indexOf(id);
    if (from < 0) return;
    const to = from + delta;
    if (to < 0 || to >= order.length) return;
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item!);
    columnOrder.value = order;
    debouncedSaveToStorage();
  }

  function normalizeWidth(
    val: string | number | null | undefined,
  ): number | undefined {
    if (val == null || val === '') return undefined;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  /** 更新列宽并持久化（拖拽表头或列设置面板输入时调用，id 即列标识） */
  function setColumnWidth(id: string, width: string | number): void {
    if (!id) return;
    const parsed = normalizeWidth(width);
    const next = { ...columnWidths.value };
    if (parsed != null) next[id] = parsed;
    else delete next[id];
    columnWidths.value = next;
    debouncedSaveToStorage();
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

  loadFromStorage();

  /** 列签名：columns 增删或顺序变化时重新加载持久化 */
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
    moveColumn,
    setColumnOrderByIds,
    setColumnWidth,
    resetColumns,
    snapshotColumnState,
    restoreColumnState,
    getColumnSettingTree,
    isColumnHidden: (id: string) => hiddenColumns.value.has(id),
    isNodeHidden: (node: ColumnSettingNode) => {
      if (node.column.children?.length) {
        return collectLeafIds(node.column).every((id) =>
          hiddenColumns.value.has(id),
        );
      }
      return hiddenColumns.value.has(node.id);
    },
  };
}

import type { ComputedRef, Ref } from 'vue';

import type { GridyEmits, GridyRecord } from '../types';

import { computed, watch } from 'vue';

export interface UseSelectionOptions {
  emit: GridyEmits;
  /** 分页开启时不做「整体替换清理」——翻页会整体换 rows，不能误清空跨页勾选 */
  paginationEnabled: ComputedRef<boolean>;
  rowKeys: ComputedRef<string[]>;
  rows: ComputedRef<GridyRecord[]>;
  selectedRowKeys: Ref<string[]>;
}

/**
 * 行选择状态：选中 key 集合的读写、全选 / 半选、跨页勾选缓存。
 * 不写 model——批量删除由编排层 `removeSelected` 经 `commitChange` 收口。
 */
export function useSelection({
  emit,
  paginationEnabled,
  rowKeys,
  rows,
  selectedRowKeys,
}: UseSelectionOptions) {
  /**
   * 跨页勾选缓存：分页时 rows 只是当前页数据，selectedRowKeys 可能含有其他页的 key。
   * 同一 watcher 内先更新缓存，再（未分页时）清理失效 key，避免拆成两个 watcher 依赖注册顺序。
   */
  const rowCache = new Map<string, GridyRecord>();
  watch(
    rowKeys,
    (keys) => {
      for (const [index, key] of keys.entries()) {
        rowCache.set(key, rows.value[index]!);
      }
      const keep = new Set([...selectedRowKeys.value, ...keys]);
      for (const key of rowCache.keys()) {
        if (!keep.has(key)) {
          rowCache.delete(key);
        }
      }

      if (paginationEnabled.value || selectedRowKeys.value.length === 0) {
        return;
      }
      const keySet = new Set(keys);
      const next = selectedRowKeys.value.filter((key) => keySet.has(key));
      if (next.length !== selectedRowKeys.value.length) {
        setSelection(next);
      }
    },
    { immediate: true },
  );

  function localIndexOf(key: string): number | undefined {
    const index = rowKeys.value.indexOf(key);
    return index === -1 ? undefined : index;
  }

  function keysToRows(keys: string[]): GridyRecord[] {
    return keys
      .map((key) => {
        const index = localIndexOf(key);
        return index === undefined ? rowCache.get(key) : rows.value[index];
      })
      .filter((row): row is GridyRecord => !!row);
  }

  function setSelection(keys: string[]) {
    selectedRowKeys.value = keys;
    emit('selectionChange', keys, keysToRows(keys));
  }

  const selectedKeySet = computed(() => new Set(selectedRowKeys.value));
  const selectedRows = computed(() => keysToRows(selectedRowKeys.value));
  const selectedIndexes = computed(() =>
    selectedRowKeys.value
      .map((key) => localIndexOf(key))
      .filter((index): index is number => index !== undefined),
  );

  /** 当前页内已勾选的 key（批量删除只动这些） */
  function localSelectedRowKeys(): string[] {
    return rowKeys.value.filter((key) => selectedKeySet.value.has(key));
  }

  function isRowSelected(key: string): boolean {
    return selectedKeySet.value.has(key);
  }

  function toggleRow(key: string, checked: boolean) {
    const next = new Set(selectedRowKeys.value);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    setSelection([...next]);
  }

  const allPageSelected = computed(
    () => rowKeys.value.length > 0 && rowKeys.value.every((key) => selectedKeySet.value.has(key)),
  );
  const somePageSelected = computed(
    () => !allPageSelected.value && rowKeys.value.some((key) => selectedKeySet.value.has(key)),
  );

  function toggleAllPage(checked: boolean) {
    const pageKeys = new Set(rowKeys.value);
    const next = checked
      ? [...new Set([...selectedRowKeys.value, ...rowKeys.value])]
      : selectedRowKeys.value.filter((key) => !pageKeys.has(key));
    setSelection(next);
  }

  function clearSelection() {
    if (selectedRowKeys.value.length === 0) {
      return;
    }
    setSelection([]);
  }

  return {
    allPageSelected,
    clearSelection,
    isRowSelected,
    localSelectedRowKeys,
    selectedIndexes,
    selectedRows,
    setSelection,
    somePageSelected,
    toggleAllPage,
    toggleRow,
  };
}

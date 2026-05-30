import { cloneDeep, isEqual } from 'es-toolkit';
import { shallowRef, triggerRef, watch, type Ref, type ShallowRef } from 'vue';

import type { RowData } from '../types';

export interface UseDirtyTrackingOptions {
  data: Ref<RowData[]>;
  /** 基线快照，用于对比得出脏单元格；若不传则内部用 data 的初始克隆维护 */
  cachedData?: ShallowRef<RowData[]>;
}

/** 脏单元格 key 格式: `${rowIndex}:${prop}` */
export type DirtyCellKey = string;

export function useDirtyTracking(options: UseDirtyTrackingOptions) {
  const { data } = options;

  /** 行索引 -> 脏列名集合 */
  const dirtyCells = shallowRef(new Map<number, Set<string>>());

  const cachedData: ShallowRef<RowData[]> =
    options.cachedData ?? shallowRef<RowData[]>([]);

  if (!options.cachedData) {
    watch(
      () => data.value,
      (list) => {
        if (list?.length && !cachedData.value.length) {
          cachedData.value = cloneDeep(list);
        }
      },
      { immediate: true },
    );
  }

  /**
   * 增量更新：对比 data 与 cachedData 的单个单元格，更新脏集合
   */
  function markDirty(rowIndex: number, prop: string): void {
    const oldVal = cachedData.value[rowIndex]?.[prop];
    const newVal = data.value[rowIndex]?.[prop];
    const map = dirtyCells.value;

    if (isEqual(oldVal, newVal)) {
      const rowSet = map.get(rowIndex);
      if (rowSet) {
        rowSet.delete(prop);
        if (rowSet.size === 0) map.delete(rowIndex);
        triggerRef(dirtyCells);
      }
    } else {
      let rowSet = map.get(rowIndex);
      if (!rowSet) {
        rowSet = new Set();
        map.set(rowIndex, rowSet);
      }
      rowSet.add(prop);
      triggerRef(dirtyCells);
    }
  }

  function isCellDirty(rowIndex: number, prop: string): boolean {
    return dirtyCells.value.get(rowIndex)?.has(prop) ?? false;
  }

  function isRowDirty(rowIndex: number): boolean {
    return (dirtyCells.value.get(rowIndex)?.size ?? 0) > 0;
  }

  /**
   * 清除脏标记：无参清空全部；仅 rowIndex 清该行所有单元格；rowIndex + prop 清单格
   */
  function clearDirty(rowIndex?: number, prop?: string): void {
    if (rowIndex === undefined) {
      dirtyCells.value = new Map();
      return;
    }
    const map = dirtyCells.value;
    if (prop !== undefined) {
      const rowSet = map.get(rowIndex);
      if (!rowSet) return;
      rowSet.delete(prop);
      if (rowSet.size === 0) map.delete(rowIndex);
    } else {
      if (!map.delete(rowIndex)) return;
    }
    triggerRef(dirtyCells);
  }

  /** 返回至少有一个脏单元格的行（行数据数组） */
  function getModifiedRows(): RowData[] {
    const list = data.value;
    const rowIndices = new Set<number>(dirtyCells.value.keys());
    return list.filter((_, i) => rowIndices.has(i));
  }

  /**
   * 批量重置：将当前 data 视为新基线，同步 cachedData 并清空脏标记
   */
  function resetTracking(): void {
    cachedData.value = cloneDeep(data.value);
    dirtyCells.value = new Map();
  }

  /** 返回所有脏单元格 key 集合（兼容旧格式 `${rowIndex}:${prop}`） */
  function getDirtyCells(): Set<DirtyCellKey> {
    const result = new Set<DirtyCellKey>();
    for (const [rowIndex, props] of dirtyCells.value) {
      for (const prop of props) {
        result.add(`${rowIndex}:${prop}`);
      }
    }
    return result;
  }

  return {
    dirtyCells,
    markDirty,
    resetTracking,
    getDirtyCells,
    isCellDirty,
    isRowDirty,
    clearDirty,
    getModifiedRows,
  };
}

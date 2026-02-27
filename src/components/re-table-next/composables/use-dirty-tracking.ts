import { cloneDeep, isEqual } from 'es-toolkit';
import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

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

  const dirtyCells = ref(new Set<DirtyCellKey>());

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
    const key: DirtyCellKey = `${rowIndex}:${prop}`;
    const next = new Set(dirtyCells.value);
    if (isEqual(oldVal, newVal)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    dirtyCells.value = next;
  }

  /** 判断某单元格是否为脏 */
  function isCellDirty(rowIndex: number, prop: string): boolean {
    return dirtyCells.value.has(`${rowIndex}:${prop}`);
  }

  /** 判断某行是否含有脏单元格 */
  function isRowDirty(rowIndex: number): boolean {
    const prefix = `${rowIndex}:`;
    return Array.from(dirtyCells.value).some((k) => k.startsWith(prefix));
  }

  /**
   * 清除脏标记：无参清空全部；仅 rowIndex 清该行所有单元格；rowIndex + prop 清单格
   */
  function clearDirty(rowIndex?: number, prop?: string): void {
    if (rowIndex === undefined) {
      dirtyCells.value = new Set();
      return;
    }
    const next = new Set(dirtyCells.value);
    if (prop !== undefined) {
      next.delete(`${rowIndex}:${prop}`);
    } else {
      const prefix = `${rowIndex}:`;
      for (const k of next) {
        if (k.startsWith(prefix)) next.delete(k);
      }
    }
    dirtyCells.value = next;
  }

  /** 返回至少有一个脏单元格的行（行数据数组） */
  function getModifiedRows(): RowData[] {
    const list = data.value;
    const rowIndices = new Set<number>();
    for (const key of dirtyCells.value) {
      const i = Number(key.split(':')[0]);
      if (!Number.isNaN(i) && i >= 0 && i < list.length) {
        rowIndices.add(i);
      }
    }
    return list.filter((_, i) => rowIndices.has(i));
  }

  /**
   * 批量重置：将当前 data 视为新基线，同步 cachedData 并清空脏标记
   */
  function resetTracking(): void {
    cachedData.value = cloneDeep(data.value);
    dirtyCells.value = new Set();
  }

  function getDirtyCells(): Set<DirtyCellKey> {
    return new Set(dirtyCells.value);
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

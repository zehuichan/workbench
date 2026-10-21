import type { PlusTableResolvedProps } from '../table';
import type { RowData } from '../types';
import type { UseDataReturn } from './use-data';

import { reactive } from 'vue';

import { cloneDeep, isEqual } from 'es-toolkit';

export interface DirtyCell {
  prop: string;
  rowKey: string;
}

type UseDirtyProps<T extends RowData> = Pick<
  UseDataReturn<T>,
  'data' | 'getRowKey' | 'keysMap'
>;

/**
 * 脏行/脏格追踪。以 rowKey 寻址、以 rowKey 存基线快照（不是数组下标），
 * 原因与 history 一致：插入/删除/移动行或换页都会让下标错位。
 *
 * dirtyCells 用 reactive Map，让 isCellDirty / isRowDirty 只订阅自己那一行，
 * 避免任意一格变脏就触发全表重渲染。
 */
export function useDirty<T extends RowData = RowData>(
  props: PlusTableResolvedProps<T>,
  { data, keysMap, getRowKey }: UseDirtyProps<T>,
) {
  const dirtyCells = reactive(new Map<string, Set<string>>());
  const baseline = new Map<string, T>();

  function enabled(): boolean {
    return props.dirtyTracking;
  }

  function ensureBaseline(row: T, rowKey: string): T {
    let snapshot = baseline.get(rowKey);
    if (!snapshot) {
      snapshot = cloneDeep(row);
      baseline.set(rowKey, snapshot);
    }
    return snapshot;
  }

  /** 在字段写值之前调用：行首次被写时，用其（尚未修改的）当前状态建立基线快照。 */
  function touchRow(row: T, rowKey: string): void {
    if (!enabled()) return;
    ensureBaseline(row, rowKey);
  }

  function markDirty(rowKey: string, prop: string): void {
    if (!enabled()) return;
    const row = keysMap.value.get(rowKey)?.row;
    if (!row) return;
    const snapshot = ensureBaseline(row, rowKey);
    const isDirty = !isEqual(snapshot[prop], row[prop]);
    const set = dirtyCells.get(rowKey);
    if (isDirty) {
      if (set) {
        if (set.has(prop)) return;
        set.add(prop);
      } else {
        dirtyCells.set(rowKey, new Set([prop]));
      }
    } else if (set?.has(prop)) {
      set.delete(prop);
      if (set.size === 0) dirtyCells.delete(rowKey);
    }
  }

  function isCellDirty(rowKey: string, prop: string): boolean {
    return dirtyCells.get(rowKey)?.has(prop) ?? false;
  }

  function isRowDirty(rowKey: string): boolean {
    return dirtyCells.has(rowKey);
  }

  /** 返回脏格身份的只读快照，不暴露内部 Map / Set。 */
  function getDirtyCells(): DirtyCell[] {
    const result: DirtyCell[] = [];
    for (const [rowKey, props] of dirtyCells) {
      for (const prop of props) result.push({ rowKey, prop });
    }
    return result;
  }

  function getModifiedRows(): T[] {
    return data.value.filter((row: T) => dirtyCells.has(getRowKey(row)));
  }

  function clearDirty(rowKey?: string, prop?: string): void {
    if (rowKey === undefined) {
      if (dirtyCells.size === 0) return;
      dirtyCells.clear();
      return;
    }
    if (prop === undefined) {
      dirtyCells.delete(rowKey);
      return;
    }
    const set = dirtyCells.get(rowKey);
    if (!set?.delete(prop)) return;
    if (set.size === 0) dirtyCells.delete(rowKey);
  }

  /** 把当前 data 视为新基线：清空脏标记，重建每行的基线快照 */
  function resetTracking(): void {
    baseline.clear();
    for (const row of data.value) {
      baseline.set(getRowKey(row), cloneDeep(row));
    }
    dirtyCells.clear();
  }

  /** 数据行身份失效时调用：同时丢弃该 rowKey 的基线与脏标记。 */
  function invalidateDirtyRow(rowKey: string): void {
    baseline.delete(rowKey);
    dirtyCells.delete(rowKey);
  }

  return {
    dirtyCells,

    touchRow,
    markDirty,
    isCellDirty,
    isRowDirty,
    getDirtyCells,
    getModifiedRows,
    clearDirty,
    resetTracking,
    invalidateDirtyRow,
  };
}

export type UseDirtyReturn<T extends RowData = RowData> = ReturnType<
  typeof useDirty<T>
>;

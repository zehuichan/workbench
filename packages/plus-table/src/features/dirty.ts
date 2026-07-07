import { shallowRef, triggerRef } from 'vue';
import { cloneDeep, isEqual } from 'es-toolkit';
import type { TableContext } from '../core/context';
import type { RowData } from '../types';

export interface DirtyOptions<T extends RowData = RowData> {
  enabled: () => boolean;
  context: TableContext<T>;
}

/**
 * 脏行/脏格追踪。以 rowKey 寻址、以 rowKey 存基线快照（不是数组下标），
 * 原因与 history 一致：插入/删除/移动行或换页都会让下标错位。
 * Map/Set 用 shallowRef + triggerRef 手动触发，避免 reactive() 包裹嵌套集合的隐性开销与边界情况。
 */
export function createDirty<T extends RowData = RowData>(
  options: DirtyOptions<T>,
) {
  const { enabled, context } = options;

  const dirtyCells = shallowRef(new Map<string, Set<string>>());
  const baseline = new Map<string, T>();

  function ensureBaseline(row: T, rowKey: string): T {
    let snapshot = baseline.get(rowKey);
    if (!snapshot) {
      snapshot = cloneDeep(row);
      baseline.set(rowKey, snapshot);
    }
    return snapshot;
  }

  /** 在字段写值之前调用：行首次被写时，用其（尚未修改的）当前状态建立基线快照；已有基线时是安全的空操作。
   * 必须在 `row[prop] = value` 之前调用，否则基线会把这次修改后的值当成「原始值」，导致本次编辑永远测不出脏。 */
  function touchRow(row: T, rowKey: string): void {
    if (!enabled()) return;
    ensureBaseline(row, rowKey);
  }

  function markDirty(rowKey: string, prop: string): void {
    if (!enabled()) return;
    const row = context.findByKey(rowKey)?.row;
    if (!row) return;
    const snapshot = ensureBaseline(row, rowKey);
    const isDirty = !isEqual(snapshot[prop], row[prop]);
    const map = dirtyCells.value;
    const set = map.get(rowKey);
    if (isDirty) {
      if (set) {
        if (set.has(prop)) return;
        set.add(prop);
      } else {
        map.set(rowKey, new Set([prop]));
      }
    } else if (set?.has(prop)) {
      set.delete(prop);
      if (set.size === 0) map.delete(rowKey);
    } else {
      return;
    }
    triggerRef(dirtyCells);
  }

  function isCellDirty(rowKey: string, prop: string): boolean {
    return dirtyCells.value.get(rowKey)?.has(prop) ?? false;
  }

  function isRowDirty(rowKey: string): boolean {
    return dirtyCells.value.has(rowKey);
  }

  /** 返回 `${rowKey}:${prop}` 形式的脏格集合 */
  function getDirtyCells(): Set<string> {
    const result = new Set<string>();
    for (const [rowKey, props] of dirtyCells.value) {
      for (const prop of props) result.add(`${rowKey}:${prop}`);
    }
    return result;
  }

  function getModifiedRows(): T[] {
    const map = dirtyCells.value;
    return context.data().filter((row) => map.has(context.getRowKeyStr(row)));
  }

  function clearDirty(rowKey?: string, prop?: string): void {
    const map = dirtyCells.value;
    if (rowKey === undefined) {
      if (map.size === 0) return;
      dirtyCells.value = new Map();
      return;
    }
    if (prop === undefined) {
      if (!map.delete(rowKey)) return;
    } else {
      const set = map.get(rowKey);
      if (!set?.delete(prop)) return;
      if (set.size === 0) map.delete(rowKey);
    }
    triggerRef(dirtyCells);
  }

  /** 把当前 data 视为新基线：清空脏标记，重建每行的基线快照 */
  function resetTracking(): void {
    baseline.clear();
    for (const row of context.data()) {
      baseline.set(context.getRowKeyStr(row), cloneDeep(row));
    }
    dirtyCells.value = new Map();
  }

  /** 行被结构性移除后调用：清掉该行的脏标记与基线快照，避免长会话下无限增长 */
  function pruneRowKeys(removedRowKeys: Set<string>): void {
    if (removedRowKeys.size === 0) return;
    let changed = false;
    const map = dirtyCells.value;
    for (const rowKey of removedRowKeys) {
      if (map.delete(rowKey)) changed = true;
      baseline.delete(rowKey);
    }
    if (changed) triggerRef(dirtyCells);
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
    pruneRowKeys,
  };
}

export type DirtyApi<T extends RowData = RowData> = ReturnType<
  typeof createDirty<T>
>;

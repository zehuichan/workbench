import { computed, ref } from 'vue';
import { HISTORY_STACK_LIMIT } from '../util';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';

export interface HistoryChangeRecord {
  rowKey: string;
  prop: string;
  oldValue: unknown;
  newValue: unknown;
}

/** undo/redo 后实际生效的变更，带上现场解析出的行引用与下标，供外层 emit cell-change / markDirty */
export interface AppliedHistoryChange<
  T extends RowData = RowData,
> extends HistoryChangeRecord {
  row: T;
  rowIndex: number;
}

type HistoryEntry = HistoryChangeRecord[];

/**
 * 撤销重做栈。条目按 rowKey 寻址（不是 rowIndex）——insertRow/removeRow/moveRow
 * 或换页都会让数组下标错位，只有 rowKey 在行结构变化后仍能对回正确的行。
 */
export function useHistory<T extends RowData = RowData>(table: PlusTable<T>) {
  const states = {
    undoStack: ref<HistoryEntry[]>([]),
    redoStack: ref<HistoryEntry[]>([]),
  };

  const canUndo = computed(() => enabled() && states.undoStack.value.length > 0);
  const canRedo = computed(() => enabled() && states.redoStack.value.length > 0);

  function enabled(): boolean {
    return !!table.store.states.history.value;
  }

  /** 记一条变更；row 模式一次提交可传多条，作为一个原子撤销单元 */
  function pushChange(
    change: HistoryChangeRecord | HistoryChangeRecord[],
  ): void {
    if (!enabled()) return;
    const entries = Array.isArray(change) ? change : [change];
    if (entries.length === 0) return;
    states.undoStack.value.push(entries);
    if (states.undoStack.value.length > HISTORY_STACK_LIMIT) {
      states.undoStack.value.shift();
    }
    states.redoStack.value = [];
  }

  function applyEntries(
    entries: HistoryEntry,
    direction: 'undo' | 'redo',
  ): AppliedHistoryChange<T>[] {
    const applied: AppliedHistoryChange<T>[] = [];
    for (const change of entries) {
      const found = table.store.states.keysMap.value.get(change.rowKey);
      if (!found) {
        if ((import.meta as any)?.env?.DEV) {
          console.warn(
            `[PlusTable] ${direction === 'undo' ? '撤销' : '重做'}跳过：rowKey="${change.rowKey}" 对应的行已不存在`,
          );
        }
        continue;
      }
      (found.row as RowData)[change.prop] =
        direction === 'undo' ? change.oldValue : change.newValue;
      applied.push({ ...change, row: found.row, rowIndex: found.rowIndex });
    }
    return applied;
  }

  function undo(): AppliedHistoryChange<T>[] {
    if (!enabled()) return [];
    const entries = states.undoStack.value.pop();
    if (!entries) return [];
    const applied = applyEntries(entries, 'undo');
    states.redoStack.value.push(entries);
    return applied;
  }

  function redo(): AppliedHistoryChange<T>[] {
    if (!enabled()) return [];
    const entries = states.redoStack.value.pop();
    if (!entries) return [];
    const applied = applyEntries(entries, 'redo');
    states.undoStack.value.push(entries);
    return applied;
  }

  function clearHistory(): void {
    states.undoStack.value = [];
    states.redoStack.value = [];
  }

  /** 行失效后调用：清掉引用它的历史条目，避免长会话下无限增长、避免残留条目指向错误上下文 */
  function cleanHistory(): void {
    const keysMap = table.store.states.keysMap.value;
    const clean = (stack: HistoryEntry[]) =>
      stack
        .map((entries) => entries.filter((c) => keysMap.has(c.rowKey)))
        .filter((entries) => entries.length > 0);
    states.undoStack.value = clean(states.undoStack.value);
    states.redoStack.value = clean(states.redoStack.value);
  }

  return {
    canUndo,
    canRedo,
    pushChange,
    undo,
    redo,
    clearHistory,
    cleanHistory,
    states,
  };
}

export type HistoryApi<T extends RowData = RowData> = ReturnType<
  typeof useHistory<T>
>;

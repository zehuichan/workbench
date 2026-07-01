import { computed, ref } from 'vue';
import type { RowData } from '../types';

export interface HistoryChangeRecord {
  rowKey: string;
  prop: string;
  oldValue: unknown;
  newValue: unknown;
}

/** undo/redo 后实际生效的变更，带上现场解析出的行引用与下标，供外层 emit cell-change / markDirty */
export interface AppliedHistoryChange extends HistoryChangeRecord {
  row: RowData;
  rowIndex: number;
}

type HistoryEntry = HistoryChangeRecord[];

export interface HistoryOptions {
  enabled: () => boolean;
  data: () => RowData[];
  getRowKeyStr: (row: RowData) => string;
  limit?: number;
}

/**
 * 撤销重做栈。条目按 rowKey 寻址（不是 rowIndex）——insertRow/removeRow/moveRow
 * 或换页都会让数组下标错位，只有 rowKey 在行结构变化后仍能对回正确的行。
 * 找不到对应行（行已被删除）时跳过该条，不误改其它行，也不抛错。
 */
export function createHistory(options: HistoryOptions) {
  const { enabled, data, getRowKeyStr, limit = 50 } = options;

  const undoStack = ref<HistoryEntry[]>([]);
  const redoStack = ref<HistoryEntry[]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  function findRowWithIndex(rowKey: string): { row: RowData; rowIndex: number } | undefined {
    const list = data();
    const rowIndex = list.findIndex((row) => getRowKeyStr(row) === rowKey);
    if (rowIndex < 0) return undefined;
    return { row: list[rowIndex]!, rowIndex };
  }

  /** 记一条变更；row 模式一次提交可传多条，作为一个原子撤销单元 */
  function pushChange(change: HistoryChangeRecord | HistoryChangeRecord[]): void {
    if (!enabled()) return;
    const entries = Array.isArray(change) ? change : [change];
    if (entries.length === 0) return;
    undoStack.value.push(entries);
    if (undoStack.value.length > limit) undoStack.value.shift();
    redoStack.value = [];
  }

  function applyEntries(
    entries: HistoryEntry,
    direction: 'undo' | 'redo',
  ): AppliedHistoryChange[] {
    const applied: AppliedHistoryChange[] = [];
    for (const change of entries) {
      const found = findRowWithIndex(change.rowKey);
      if (!found) {
        if ((import.meta as any)?.env?.DEV) {
          console.warn(
            `[PlusTable] ${direction === 'undo' ? '撤销' : '重做'}跳过：rowKey="${change.rowKey}" 对应的行已不存在`,
          );
        }
        continue;
      }
      found.row[change.prop] = direction === 'undo' ? change.oldValue : change.newValue;
      applied.push({ ...change, row: found.row, rowIndex: found.rowIndex });
    }
    return applied;
  }

  function undo(): AppliedHistoryChange[] {
    const entries = undoStack.value.pop();
    if (!entries) return [];
    const applied = applyEntries(entries, 'undo');
    redoStack.value.push(entries);
    return applied;
  }

  function redo(): AppliedHistoryChange[] {
    const entries = redoStack.value.pop();
    if (!entries) return [];
    const applied = applyEntries(entries, 'redo');
    undoStack.value.push(entries);
    return applied;
  }

  function clearHistory(): void {
    undoStack.value = [];
    redoStack.value = [];
  }

  /** 行被结构性移除后调用：清掉引用它的历史条目，避免长会话下无限增长、避免残留条目指向错误上下文 */
  function pruneRowKeys(removedRowKeys: Set<string>): void {
    if (removedRowKeys.size === 0) return;
    const prune = (stack: HistoryEntry[]) =>
      stack
        .map((entries) => entries.filter((c) => !removedRowKeys.has(c.rowKey)))
        .filter((entries) => entries.length > 0);
    undoStack.value = prune(undoStack.value);
    redoStack.value = prune(redoStack.value);
  }

  return {
    canUndo,
    canRedo,
    pushChange,
    undo,
    redo,
    clearHistory,
    pruneRowKeys,
  };
}

export type HistoryApi = ReturnType<typeof createHistory>;

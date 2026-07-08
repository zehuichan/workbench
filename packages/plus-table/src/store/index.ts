import { useWatcher } from './watcher';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';
import type { AppliedHistoryChange } from './history';

function useStore<T extends RowData = RowData>(table: PlusTable<T>) {
  const watcher = useWatcher(table);

  const mutations = {
    setData(data: T[] = []) {
      watcher.states.data.value = data ?? [];
      watcher.cleanHistory();
      watcher.cleanDirty();
      watcher.cleanValidation();
      watcher.cleanEditing();
    },

    /**
     * 单元格写值流水线：写回行对象 → 历史 / 脏追踪 → cell-change → 联动 trigger → 按需校验。
     * 所有编辑路径（cell 提交 / row·table 直绑 / Delete 清空 / 联动 setValue / 自定义热键 setValue）统一走这里。
     */
    setCellValue(row: T, rowIndex: number, prop: string, value: unknown) {
      const oldValue = row[prop];
      if (Object.is(oldValue, value)) return;
      const rowKey = watcher.getRowKey(row);
      // 必须在写值之前建基线，否则行的第一次编辑会把基线拍成修改后的值，永远测不出脏
      watcher.touchRow(row, rowKey);
      (row as RowData)[prop] = value;
      watcher.pushChange({ rowKey, prop, oldValue, newValue: value });
      watcher.markDirty(rowKey, prop);
      table.emit('cell-change', { row, rowIndex, prop, value, oldValue });
      watcher.notifyFieldChange(row, rowIndex, prop);
      if (watcher.states.validateEvent.value !== false) {
        void watcher.validateCell(row, rowIndex, prop);
      }
    },

    setCurrentCell(rowIndex: number, colIndex: number, scroll = true) {
      watcher.setCurrentCell(rowIndex, colIndex, scroll);
    },

    toggleColumnVisible(id: string, visible: boolean) {
      watcher.toggleColumnVisible(id, visible);
    },

    updateColumnOrder(
      dragId: string,
      targetId: string,
      position: 'before' | 'after',
    ) {
      watcher.updateColumnOrder(dragId, targetId, position);
    },

    setColumnWidth(id: string, width: number) {
      watcher.setColumnWidth(id, width);
    },
  };

  type Mutations = typeof mutations;

  function commit<K extends keyof Mutations>(
    name: K,
    ...args: Parameters<Mutations[K]>
  ): void {
    const mutation = mutations[name] as (
      ...args: Parameters<Mutations[K]>
    ) => void;
    mutation(...args);
  }

  /** 撤销 / 重做：只回滚 row[prop] 并重新对比脏基线、emit('cell-change')、按需重新校验；
   * 不重新触发 dependencies.trigger，避免联动副作用在历史回放时被重复执行 */
  function applyHistoryChanges(
    applied: AppliedHistoryChange<T>[],
    direction: 'undo' | 'redo',
  ) {
    for (const change of applied) {
      watcher.markDirty(change.rowKey, change.prop);
      const value = direction === 'undo' ? change.oldValue : change.newValue;
      const oldValue = direction === 'undo' ? change.newValue : change.oldValue;
      table.emit('cell-change', {
        row: change.row,
        rowIndex: change.rowIndex,
        prop: change.prop,
        value,
        oldValue,
      });
      if (watcher.states.validateEvent.value !== false) {
        void watcher.validateCell(change.row, change.rowIndex, change.prop);
      }
    }
  }

  function undo(): void {
    applyHistoryChanges(watcher.undo(), 'undo');
  }

  function redo(): void {
    applyHistoryChanges(watcher.redo(), 'redo');
  }

  function clearCell(rowIndex: number, colIndex: number) {
    const node = watcher.states.columns.value[colIndex];
    const row = watcher.states.data.value[rowIndex];
    if (!node?.column.prop || !row) return;
    commit('setCellValue', row, rowIndex, node.column.prop, null);
  }

  return {
    ...watcher,
    mutations,
    commit,
    clearCell,
    undo,
    redo,
  };
}

export default useStore;

export type Store<T extends RowData = RowData> = ReturnType<typeof useStore<T>>;

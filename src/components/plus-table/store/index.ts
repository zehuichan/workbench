import { useWatcher } from './watcher';
import { getRowIdentity } from '../util';
import { toRaw, type WritableComputedRef } from 'vue';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';
import type { CellPosition } from './current';
import type { AppliedHistoryChange } from './history';

function useStore<T extends RowData = RowData>(table: PlusTable<T>) {
  const watcher = useWatcher(table);
  let committedRowsByKey = new Map<string, T>();

  const mutations = {
    setData(data: T[]) {
      const rowKey = watcher.states.rowKey.value;
      const nextRowsByKey = new Map<string, T>();
      for (const [rowIndex, row] of data.entries()) {
        const key = getRowIdentity(row, rowKey);
        if (nextRowsByKey.has(key)) {
          throw new Error(
            `[PlusTable] setData 失败：第 ${rowIndex} 行的 rowKey="${key}" 与前序行重复。`,
          );
        }
        nextRowsByKey.set(key, row);
      }

      const invalidatedRowKeys: string[] = [];
      for (const [key, previousRow] of committedRowsByKey) {
        if (nextRowsByKey.get(key) === previousRow) continue;
        invalidatedRowKeys.push(key);
      }

      watcher.rowLifecycle.invalidate(invalidatedRowKeys);
      watcher.states.data.value = data;
      committedRowsByKey = nextRowsByKey;
      watcher.rowLifecycle.committed();
    },

    /**
     * 单元格写值流水线：写回行对象 → 历史 / 脏追踪 → cell-change → 联动 trigger → 按需校验。
     * 所有编辑路径（cell 提交 / row·table 直绑 / Delete 清空 / 联动 setValue / 自定义热键 setValue）统一走这里。
     */
    setCellValue(row: T, rowIndex: number, prop: string, value: unknown) {
      const oldValue = row[prop];
      if (Object.is(oldValue, value)) return;
      const rowKey = watcher.getRowKey(row);
      const raw = toRaw(row);
      let descriptorOwner: object | null = raw;
      while (descriptorOwner) {
        const descriptor = Object.getOwnPropertyDescriptor(descriptorOwner, prop);
        if (descriptor) {
          if (!('value' in descriptor)) {
            throw new Error(
              `[PlusTable] setCellValue 失败：访问器字段 "${prop}" 可能改变稳定 rowKey，不可修改。`,
            );
          }
          break;
        }
        descriptorOwner = Object.getPrototypeOf(descriptorOwner);
      }
      const descriptors = Object.getOwnPropertyDescriptors(raw) as Record<
        PropertyKey,
        PropertyDescriptor
      >;
      const candidate = Object.create(Object.getPrototypeOf(raw), descriptors) as T;
      Reflect.set(candidate, prop, value);
      if (getRowIdentity(candidate, watcher.states.rowKey.value) !== rowKey) {
        throw new Error(
          `[PlusTable] setCellValue 失败：写入字段 "${prop}" 会改变稳定 rowKey，不可修改。`,
        );
      }
      // 必须在写值之前建基线，否则行的第一次编辑会把基线拍成修改后的值，永远测不出脏
      watcher.touchRow(row, rowKey);
      (row as RowData)[prop] = value;
      watcher.pushChange({ rowKey, prop, oldValue, newValue: value });
      watcher.markDirty(rowKey, prop);
      table.emit('cell-change', { row, rowIndex, prop, value, oldValue });
      watcher.notifyFieldChange(row, rowIndex, prop);
      if (watcher.states.validateEvent.value) {
        void watcher.validateCell(row, rowIndex, prop);
      }
    },

    setCurrentCell(rowIndex: number, colIndex: number, scroll = true) {
      watcher.setCurrentCell(rowIndex, colIndex, scroll);
    },

    toggleColumnVisible(id: string, visible: boolean) {
      watcher.toggleColumnVisible(id, visible);
    },

    updateColumnOrder(dragId: string, targetId: string, position: 'before' | 'after') {
      watcher.updateColumnOrder(dragId, targetId, position);
    },

    setColumnWidth(id: string, width: number) {
      watcher.setColumnWidth(id, width);
    },
  };

  type Mutations = typeof mutations;

  function commit<K extends keyof Mutations>(name: K, ...args: Parameters<Mutations[K]>): void {
    const mutation = mutations[name] as (...args: Parameters<Mutations[K]>) => void;
    mutation(...args);
  }

  /** 撤销 / 重做：只回滚 row[prop] 并重新对比脏基线、emit('cell-change')、按需重新校验；
   * 不重新触发 dependencies.trigger，避免联动副作用在历史回放时被重复执行 */
  function applyHistoryChanges(applied: AppliedHistoryChange<T>[], direction: 'undo' | 'redo') {
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
      if (watcher.states.validateEvent.value) {
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
    const cell = watcher.locateCell(rowIndex, colIndex);
    if (!cell) return;
    commit('setCellValue', cell.row, cell.rowIndex, cell.prop, null);
  }

  return {
    ...watcher,
    commit,
    clearCell,
    undo,
    redo,
  };
}

export default useStore;

export type InternalStore<T extends RowData = RowData> = ReturnType<typeof useStore<T>>;

type InternalStoreKey =
  | 'cleanCurrent'
  | 'cleanEditingCell'
  | 'discardDraftProps'
  | 'getCellElRef'
  | 'getColumnById'
  | 'getColumnsByProp'
  | 'getCurrentCellLocation'
  | 'getCurrentRef'
  | 'getEditingCellLocation'
  | 'isCurrentRef'
  | 'isEditingRef'
  | 'invalidateCurrentRow'
  | 'invalidateColumnProps'
  | 'invalidateDirtyRow'
  | 'invalidateEditingRow'
  | 'invalidateHistoryRow'
  | 'invalidateValidationRow'
  | 'locateCellRef'
  | 'reindexValidationErrors'
  | 'resolveCellPosition'
  | 'rowLifecycle'
  | 'scrollCellRef'
  | 'toCellRef';

/** 对外维持原有 index-based Store 形态，稳定 CellRef 相关成员仅供组件内部使用。 */
export type Store<T extends RowData = RowData> = Omit<
  InternalStore<T>,
  InternalStoreKey | 'states'
> & {
  states: Omit<
    InternalStore<T>['states'],
    'columnIndexMap' | 'currentCell' | 'editingCell' | 'validationSchema' | 'visibleColumnsById'
  > & {
    currentCell: WritableComputedRef<CellPosition | null>;
    editingCell: WritableComputedRef<CellPosition | null>;
  };
};

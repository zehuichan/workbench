import type { DependenciesApi } from './dependencies';
import type { DirtyApi } from './dirty';
import type { AppliedHistoryChange, HistoryApi } from './history';
import type { ValidationApi } from './validation';
import type { PlusTableEmits, PlusTableProps, RowData } from '../types';

export type WriteCellFn<T extends RowData = RowData> = (
  row: T,
  rowIndex: number,
  prop: string,
  value: unknown,
) => void;

export interface CommitOptions<T extends RowData = RowData> {
  props: PlusTableProps<T>;
  emit: PlusTableEmits<T>;
  getRowKeyStr: (row: T) => string;
  history: HistoryApi<T>;
  dirty: DirtyApi<T>;
  dependencies: DependenciesApi<T>;
  validation: ValidationApi<T>;
}

/**
 * 行值变更的唯一入口：直接编辑（writeCell）与撤销重做（undo/redo）都在这里落地，
 * 保证「历史 / 脏追踪 / cell-change / 联动 / 校验」的编排顺序只有一处。
 */
export function createCommit<T extends RowData = RowData>(
  options: CommitOptions<T>,
) {
  const {
    props,
    emit,
    getRowKeyStr,
    history,
    dirty,
    dependencies,
    validation,
  } = options;

  /**
   * 单元格写值流水线：写回行对象 → 历史 / 脏追踪 → cell-change → 联动 trigger → 按需校验。
   * 所有编辑路径（cell 提交 / row·table 直绑 / Delete 清空 / 联动 setValue / 自定义热键 setValue）统一走这里。
   */
  const writeCell: WriteCellFn<T> = (row, rowIndex, prop, value) => {
    const oldValue = row[prop];
    if (Object.is(oldValue, value)) return;
    const rowKey = getRowKeyStr(row);
    // 必须在写值之前建基线，否则行的第一次编辑会把基线拍成修改后的值，永远测不出脏
    dirty.touchRow(row, rowKey);
    // T 是泛型类型参数，只能整体读取，不能按 key 写入；T extends RowData 保证这里转写是安全的
    (row as RowData)[prop] = value;
    history.pushChange({ rowKey, prop, oldValue, newValue: value });
    dirty.markDirty(rowKey, prop);
    emit('cell-change', { row, rowIndex, prop, value, oldValue });
    dependencies.notifyFieldChange(row, rowIndex, prop);
    if ((props.validateOn ?? 'change') === 'change') {
      void validation.validateCellByField(row, rowIndex, prop);
    }
  };

  /** 撤销 / 重做：只回滚 row[prop] 并重新对比脏基线、emit('cell-change')、按需重新校验；
   * 不重新触发 dependencies.trigger，避免联动副作用在历史回放时被重复执行 */
  function applyHistoryChanges(
    applied: AppliedHistoryChange<T>[],
    direction: 'undo' | 'redo',
  ) {
    for (const change of applied) {
      dirty.markDirty(change.rowKey, change.prop);
      const value = direction === 'undo' ? change.oldValue : change.newValue;
      const oldValue = direction === 'undo' ? change.newValue : change.oldValue;
      emit('cell-change', {
        row: change.row,
        rowIndex: change.rowIndex,
        prop: change.prop,
        value,
        oldValue,
      });
      if ((props.validateOn ?? 'change') === 'change') {
        void validation.validateCellByField(
          change.row,
          change.rowIndex,
          change.prop,
        );
      }
    }
  }

  function undo(): void {
    applyHistoryChanges(history.undo(), 'undo');
  }

  function redo(): void {
    applyHistoryChanges(history.redo(), 'redo');
  }

  return { writeCell, undo, redo };
}

export type CommitApi<T extends RowData = RowData> = ReturnType<
  typeof createCommit<T>
>;

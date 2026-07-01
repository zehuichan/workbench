import { watch } from 'vue';
import { typedCharToDraft } from '../editors/registry';
import { createAdaptive } from './adaptive';
import { createColumns } from './columns';
import { createDependencies } from './dependencies';
import { createDirty } from './dirty';
import { createEditing } from './editing';
import { createHistory } from './history';
import { createKeyboard } from './keyboard';
import { createRows } from './rows';
import { createSelection } from './selection';
import { createValidation } from './validation';
import type { Ref, Slots } from 'vue';
import type { PlusTableEmits, PlusTableProps, RowData } from '../types';
import type { WriteCellFn } from './editing';
import type { AppliedHistoryChange } from './history';

export type { WriteCellFn } from './editing';
export type { DependencyState } from './dependencies';
export type { ResolvedEditor, EditorAdapter } from '../editors/registry';
export type { SettingItem } from './columns';
export type { CellPosition } from './selection';
export type { HistoryApi } from './history';
export type { DirtyApi } from './dirty';

export interface TableEngineOptions {
  props: PlusTableProps;
  emit: PlusTableEmits;
  slots: Slots;
  gridRef: Ref<HTMLElement | undefined>;
  paginationRef: Ref<HTMLElement | undefined>;
}

export function createTableEngine(options: TableEngineOptions) {
  const { props, emit, slots, gridRef, paginationRef } = options;

  const data = () => props.data ?? [];

  function resolveRawRowKey(row: RowData): unknown {
    const rowKey = props.rowKey;
    if (typeof rowKey !== 'function') return row[rowKey];
    return rowKey(row);
  }

  function getRowKeyStr(row: RowData): string {
    return String(resolveRawRowKey(row));
  }

  const columns = createColumns(props);

  const selection = createSelection({
    gridRef,
    rowCount: () => data().length,
    colCount: () => columns.leafNodes.value.length,
    colDomIndex: (colIndex) => columns.leafDomIndexes.value[colIndex] ?? colIndex,
  });

  const dependencies = createDependencies({
    allLeafNodes: columns.allLeafNodes,
    getRowKeyStr,
    getWriteCell: () => writeCell,
  });

  const validation = createValidation({
    props,
    data,
    leafNodes: columns.leafNodes,
    allLeafNodes: columns.allLeafNodes,
    getRowKeyStr,
    getDependencyState: dependencies.getState,
    scrollToCell: (rowIndex, colIndex) => selection.setActiveCell(rowIndex, colIndex),
  });

  const history = createHistory({
    enabled: () => !!props.history,
    data,
    getRowKeyStr,
    limit: props.historyLimit,
  });

  const dirty = createDirty({
    enabled: () => !!props.dirtyTracking,
    data,
    getRowKeyStr,
  });

  /**
   * 单元格写值流水线：写回行对象 → 历史 / 脏追踪 → cell-change → 联动 trigger → 按需校验。
   * 所有编辑路径（cell 提交 / row·table 直绑 / Delete 清空 / 联动 setValue / 自定义热键 setValue）统一走这里。
   */
  const writeCell: WriteCellFn = (row, rowIndex, prop, value) => {
    const oldValue = row[prop];
    if (Object.is(oldValue, value)) return;
    const rowKey = getRowKeyStr(row);
    // 必须在写值之前建基线，否则行的第一次编辑会把基线拍成修改后的值，永远测不出脏
    dirty.touchRow(row, rowKey);
    row[prop] = value;
    history.pushChange({ rowKey, prop, oldValue, newValue: value });
    dirty.markDirty(rowKey, prop);
    emit('cell-change', { row, rowIndex, prop, value, oldValue });
    dependencies.notifyFieldChange(row, rowIndex, prop);
    if ((props.validateOn ?? 'change') === 'change') {
      void validation.validateCellByField(row, rowIndex, prop);
    }
  };

  /** 撤销 / 重做：按 rowKey 现场查找目标行，恢复值后补上脏标记 / 通知 / 必要时重新校验；不重跑联动 trigger，避免级联副作用 */
  function applyHistoryChanges(applied: AppliedHistoryChange[], direction: 'undo' | 'redo') {
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
        void validation.validateCellByField(change.row, change.rowIndex, change.prop);
      }
    }
  }

  function undo() {
    applyHistoryChanges(history.undo(), 'undo');
  }

  function redo() {
    applyHistoryChanges(history.redo(), 'redo');
  }

  const editing = createEditing({
    props,
    data,
    leafNodes: columns.leafNodes,
    getRowKeyStr,
    isDependencyDisabled: (row, rowIndex, node) =>
      dependencies.getState(row, rowIndex, node.column).disabled,
    writeCell,
    validateRow: validation.validateRow,
    clearRowValidate: validation.clearRowValidate,
    selection,
  });

  function clearCell(rowIndex: number, colIndex: number) {
    const node = columns.leafNodes.value[colIndex];
    const row = data()[rowIndex];
    if (!node?.column.prop || !row) return;
    writeCell(row, rowIndex, node.column.prop, null);
  }

  const keyboard = createKeyboard({
    props,
    data,
    selection,
    editing,
    writeCell,
    clearCell,
    typedCharToDraft: (colIndex, char) => {
      const node = columns.leafNodes.value[colIndex];
      return node ? typedCharToDraft(node.column.component, char) : undefined;
    },
    getColumnAt: (colIndex) => columns.leafNodes.value[colIndex]?.column ?? null,
    undo,
    redo,
    canUndo: () => history.canUndo.value,
    canRedo: () => history.canRedo.value,
  });

  const rows = createRows({ data, emit });
  const adaptive = createAdaptive({ props, gridRef, paginationRef });

  /**
   * 用 el-table 回传的 column.columnKey（渲染时已设为 node.id）在 leafIndexById 里查找列下标，
   * 而不是 DOM cell.cellIndex——特殊列（selection/index/expand/operation）作为真实 <td> 渲染但不进 leafNodes，
   * 会导致 DOM 下标与 leafNodes 下标错位；按 columnKey 匹配则天然与渲染方式无关，特殊列直接查不到（-1）。
   */
  function resolveCellPosition(row: RowData, column: { columnKey?: string }) {
    const rowIndex = data().indexOf(row);
    const colIndex = column.columnKey
      ? columns.leafIndexById.value.get(column.columnKey) ?? -1
      : -1;
    return { rowIndex, colIndex };
  }

  function handleCellClick(
    row: RowData,
    column: { columnKey?: string },
    _cell: HTMLElement,
    event: Event,
  ) {
    if ((props.editMode ?? 'cell') === 'table') return;
    const { rowIndex, colIndex } = resolveCellPosition(row, column);
    if (rowIndex < 0 || colIndex < 0) return;
    selection.setActiveCell(rowIndex, colIndex, false);
    // 点击落在编辑器里时不抢焦点，否则把焦点交给网格容器以接收热键
    const target = event.target as HTMLElement | null;
    if (
      !target?.closest('input, textarea, .el-select, .el-switch, .el-checkbox, [contenteditable="true"]')
    ) {
      selection.focusGrid();
    }
  }

  function handleCellDblclick(row: RowData, column: { columnKey?: string }, _cell: HTMLElement) {
    const mode = props.editMode ?? 'cell';
    const { rowIndex, colIndex } = resolveCellPosition(row, column);
    if (rowIndex < 0) return;
    if (mode === 'cell' && colIndex >= 0) editing.startEdit(rowIndex, colIndex);
    else if (mode === 'row') editing.startRowEdit(rowIndex);
  }

  /** validateOn === 'blur' 时由单元格编辑器 blur 调用 */
  function handleEditorBlur(row: RowData, rowIndex: number, prop: string) {
    if ((props.validateOn ?? 'change') === 'blur') {
      void validation.validateCellByField(row, rowIndex, prop);
    }
  }

  /** 开发环境下 rowKey 重复 / 空值检测：静默串行不抛错，但打警告帮业务定位配置问题 */
  function checkRowKeyIntegrity(rows: RowData[]) {
    if (!(import.meta as any)?.env?.DEV) return;
    const seen = new Map<string, number>();
    for (const row of rows) {
      const raw = resolveRawRowKey(row);
      if (raw === undefined || raw === null || raw === '') {
        console.warn(
          '[PlusTable] 检测到 rowKey 解析出空值，可能导致编辑态 / 校验 / 脏标记串到别的行上，请检查 row-key 配置。',
        );
      }
      const key = String(raw);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    for (const [key, count] of seen) {
      if (count > 1) {
        console.warn(
          `[PlusTable] 检测到重复的 rowKey="${key}"（共 ${count} 行），可能导致编辑态 / 校验 / 脏标记串到别的行上，请确保 row-key 唯一。`,
        );
      }
    }
  }

  /**
   * 结构性变化（insertRow/removeRow/moveRow/duplicateRow 或换页）后按 rowKey 差集清理
   * history / dirty / validation.errors / editing 的残留条目，避免长会话（SPA 不卸载表格）下无限增长。
   * 用 () => data() 作为 watch source：只在数组引用变化（结构性操作）时触发，值编辑（原地改字段）不会误触发。
   */
  let previousRowKeys: Set<string> | null = null;
  watch(
    () => data(),
    (rows) => {
      checkRowKeyIntegrity(rows);
      const currentKeys = new Set(rows.map(getRowKeyStr));
      if (previousRowKeys) {
        const removed = new Set<string>();
        for (const key of previousRowKeys) {
          if (!currentKeys.has(key)) removed.add(key);
        }
        if (removed.size) {
          history.pruneRowKeys(removed);
          dirty.pruneRowKeys(removed);
          validation.pruneRowKeys(removed);
          editing.pruneRemovedRows(removed);
        }
      }
      previousRowKeys = currentKeys;
    },
    { immediate: true },
  );

  return {
    props,
    slots,
    data,
    getRowKeyStr,
    columns,
    selection,
    dependencies,
    validation,
    editing,
    keyboard,
    rows,
    adaptive,
    history,
    dirty,
    writeCell,
    clearCell,
    undo,
    redo,
    handleCellClick,
    handleCellDblclick,
    handleEditorBlur,
  };
}

export type TableEngine = ReturnType<typeof createTableEngine>;

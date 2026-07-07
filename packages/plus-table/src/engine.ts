import { createContext, createColumns } from './core';
import {
  createAdaptive,
  createCommit,
  createDependencies,
  createDirty,
  createEditing,
  createHistory,
  createKeyboard,
  createRows,
  createSelection,
  createValidation,
} from './features';
import { resolveEditor, typedCharToDraft } from './editors/registry';
import type { Component, Ref, Slots } from 'vue';
import type { WriteCellFn, DependencyState } from './features';
import type {
  CellError,
  ColumnNode,
  EditMode,
  PlusTableColumn,
  PlusTableEmits,
  PlusTableProps,
  RowData,
} from './types';

export type {
  WriteCellFn,
  DependencyState,
  CellPosition,
  HistoryApi,
  DirtyApi,
} from './features';
export type { SettingItem } from './core';
export type { ResolvedEditor, EditorAdapter } from './editors/registry';

export interface TableEngineOptions<T extends RowData = RowData> {
  props: PlusTableProps<T>;
  emit: PlusTableEmits<T>;
  slots: Slots;
  gridRef: Ref<HTMLElement | undefined>;
  paginationRef: Ref<HTMLElement | undefined>;
}

/** editor-${prop} 插槽的统一读写接口，与内置/自定义编辑器共享同一套取值 / 写值策略 */
export interface EditorSlotProps<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
  column: PlusTableColumn<T>;
  value: unknown;
  setValue: (value: unknown) => void;
  commit: () => void;
  cancel: () => void;
}

/** header-${prop} 插槽参数 */
export interface HeaderSlotProps<T extends RowData = RowData> {
  column: PlusTableColumn<T>;
}

/** 内置 / 自定义编辑器组件的完整绑定，可直接 h(component, bind) 展开渲染 */
export interface EditorBinding {
  component: Component;
  bind: Record<string, unknown>;
}

/**
 * 单元格视图模型：一次性算出渲染所需的全部状态，plus-table-cell.ts 只消费这份结果，
 * 不再触达 editing/selection/validation/dependencies/dirty 等内部 API，也不含任何策略分支。
 */
export interface CellView<T extends RowData = RowData> {
  value: unknown;
  editing: boolean;
  editable: boolean;
  active: boolean;
  disabled: boolean;
  required: boolean;
  dirty: boolean;
  error: CellError | undefined;
  mode: EditMode;
  /** editing 为 true 且未使用 editor-${prop} 插槽时非空 */
  editorBind: EditorBinding | null;
  /** editing 为 true 且存在 editor-${prop} 插槽时非空 */
  editorSlotProps: EditorSlotProps<T> | null;
}

export function createTableEngine<T extends RowData = RowData>(
  options: TableEngineOptions<T>,
) {
  const { props, emit, slots, gridRef, paginationRef } = options;

  const context = createContext(props);
  const columns = createColumns(props);

  /**
   * writeCell 与 dependencies 互相需要对方：writeCell 提交后要触发 dependencies.notifyFieldChange
   * 级联联动；dependencies.trigger 里的 api.setValue 又要回到 writeCell 走完整管线（历史/脏追踪/校验/
   * 再次联动）。这是真实存在的双向调用（级联联动的语义要求如此），不是疏漏。用一个稳定的转发函数
   * 打破构造顺序——先造 dependencies（此刻只接收转发函数，尚不会真正调用），再造 commit 取得真正的
   * writeCell，最后把转发目标接上。转发关系只体现在这一处装配代码里，dependencies.ts 的公共选项
   * 因此只是一个普通的 writeCell 值，不必是 getter。
   */
  let resolvedWriteCell!: WriteCellFn<T>;
  const forwardedWriteCell: WriteCellFn<T> = (row, rowIndex, prop, value) =>
    resolvedWriteCell(row, rowIndex, prop, value);

  const dependencies = createDependencies<T>({
    allLeafNodes: columns.allLeafNodes,
    getRowKeyStr: context.getRowKeyStr,
    writeCell: forwardedWriteCell,
  });

  const selection = createSelection({
    gridRef,
    rowCount: () => context.data().length,
    colCount: () => columns.leafNodes.value.length,
    getColumnIdAt: (colIndex) => columns.leafNodes.value[colIndex]?.id,
  });

  const validation = createValidation<T>({
    context,
    leafNodes: columns.leafNodes,
    allLeafNodes: columns.allLeafNodes,
    getDependencyState: dependencies.getState,
    scrollToCell: (rowIndex, colIndex) =>
      selection.setActiveCell(rowIndex, colIndex),
  });

  const history = createHistory<T>({
    enabled: () => !!props.history,
    context,
    limit: typeof props.history === 'object' ? props.history.limit : undefined,
  });

  const dirty = createDirty<T>({
    enabled: () => !!props.dirtyTracking,
    context,
  });

  const commit = createCommit<T>({
    props,
    emit,
    getRowKeyStr: context.getRowKeyStr,
    history,
    dirty,
    dependencies,
    validation,
  });
  resolvedWriteCell = commit.writeCell;
  const writeCell = commit.writeCell;

  function clearCell(rowIndex: number, colIndex: number) {
    const node = columns.leafNodes.value[colIndex];
    const row = context.data()[rowIndex];
    if (!node?.column.prop || !row) return;
    writeCell(row, rowIndex, node.column.prop, null);
  }

  const editing = createEditing<T>({
    props,
    data: context.data,
    leafNodes: columns.leafNodes,
    getRowKeyStr: context.getRowKeyStr,
    isDependencyDisabled: (row, rowIndex, node) =>
      dependencies.getState(row, rowIndex, node.column).disabled,
    writeCell,
    validateRow: validation.validateRow,
    clearRowValidate: validation.clearRowValidate,
    selection,
  });

  const keyboard = createKeyboard<T>({
    props,
    data: context.data,
    selection,
    editing,
    writeCell,
    clearCell,
    typedCharToDraft: (colIndex, char) => {
      const node = columns.leafNodes.value[colIndex];
      return node ? typedCharToDraft(node.column.editor, char) : undefined;
    },
    getColumnAt: (colIndex) =>
      columns.leafNodes.value[colIndex]?.column ?? null,
    undo: commit.undo,
    redo: commit.redo,
    canUndo: () => history.canUndo.value,
    canRedo: () => history.canRedo.value,
  });

  const rows = createRows<T>({ data: context.data, emit });
  const adaptive = createAdaptive({
    adaptive: () => props.adaptive,
    gridRef,
    paginationRef,
  });

  context.onRowsRemoved((removed) => {
    history.pruneRowKeys(removed);
    dirty.pruneRowKeys(removed);
    validation.pruneRowKeys(removed);
    editing.pruneRemovedRows(removed);
  });

  /**
   * 用 el-table 回传的 column.columnKey（渲染时已设为 node.id）在 leafIndexById 里查找列下标，
   * 而不是 DOM cell.cellIndex——特殊列（selection/index/expand/operation）作为真实 <td> 渲染但不进 leafNodes，
   * 会导致 DOM 下标与 leafNodes 下标错位；按 columnKey 匹配则天然与渲染方式无关，特殊列直接查不到（-1）。
   */
  function resolveCellPosition(row: T, column: { columnKey?: string }) {
    const rowKey = context.getRowKeyStr(row);
    const rowIndex = context.findByKey(rowKey)?.rowIndex ?? -1;
    const colIndex = column.columnKey
      ? (columns.leafIndexById.value.get(column.columnKey) ?? -1)
      : -1;
    return { rowIndex, colIndex };
  }

  function handleCellClick(
    row: T,
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
      !target?.closest(
        'input, textarea, .el-select, .el-switch, .el-checkbox, [contenteditable="true"]',
      )
    ) {
      selection.focusGrid();
    }
  }

  function handleCellDblclick(
    row: T,
    column: { columnKey?: string },
    _cell: HTMLElement,
  ) {
    const mode = (props.editMode ?? 'cell') as EditMode;
    const { rowIndex, colIndex } = resolveCellPosition(row, column);
    if (rowIndex < 0) return;
    if (mode === 'cell' && colIndex >= 0) editing.startEdit(rowIndex, colIndex);
    else if (mode === 'row') editing.startRowEdit(rowIndex);
  }

  /** validateOn === 'blur' 时由单元格编辑器 blur 调用 */
  function handleEditorBlur(row: T, rowIndex: number, prop: string) {
    if ((props.validateOn ?? 'change') === 'blur') {
      void validation.validateCellByField(row, rowIndex, prop);
    }
  }

  /**
   * 单元格取值 + 写入策略：cell 模式读写草稿仓；row/table 模式下 wantsBuffer 时草稿仓缓冲、
   * 失焦提交，否则 setValue 即时写值。editor-${prop} 插槽与内置/自定义编辑器共用此策略，
   * 仅 wantsBuffer 取值不同（插槽默认不缓冲，交还业务侧自行处理）。
   */
  function resolveCellBinding(
    row: T,
    rowIndex: number,
    rowKey: string,
    prop: string,
    isCellMode: boolean,
    wantsBuffer: boolean,
  ) {
    const useBuffer = !isCellMode && wantsBuffer;
    let value: unknown;
    if (isCellMode) {
      value = editing.getDraft(rowKey, prop).value;
    } else if (useBuffer) {
      const draft = editing.getDraft(rowKey, prop);
      value = draft.has ? draft.value : row[prop];
    } else {
      value = row[prop];
    }
    const setValue = (next: unknown) => {
      if (isCellMode || useBuffer) editing.setDraft(rowKey, prop, next);
      else writeCell(row, rowIndex, prop, next);
    };
    const flush = () => {
      if (!isCellMode && useBuffer)
        editing.flushDraft(row, rowIndex, rowKey, prop);
    };
    return { value, setValue, flush };
  }

  function buildEditorSlotProps(
    row: T,
    rowIndex: number,
    rowKey: string,
    column: PlusTableColumn<T>,
    isCellMode: boolean,
  ): EditorSlotProps<T> {
    const prop = column.prop!;
    // 插槽是完全自定义的内容，PlusTable 不假设失焦语义，也不做缓冲——commit/cancel 留给业务侧自行接线
    const { value, setValue } = resolveCellBinding(
      row,
      rowIndex,
      rowKey,
      prop,
      isCellMode,
      false,
    );
    return {
      row,
      rowIndex,
      column,
      value,
      setValue,
      commit: () => editing.commitEdit(),
      cancel: () => editing.cancelEdit(),
    };
  }

  function buildEditorBind(
    row: T,
    rowIndex: number,
    rowKey: string,
    column: PlusTableColumn<T>,
    isCellMode: boolean,
    depState: DependencyState | undefined,
  ): EditorBinding {
    const prop = column.prop!;
    const resolved = resolveEditor(column.editor, { row, rowIndex });
    const modelProp = resolved.modelProp;
    const { value, setValue, flush } = resolveCellBinding(
      row,
      rowIndex,
      rowKey,
      prop,
      isCellMode,
      resolved.trigger === 'blur',
    );

    const bind: Record<string, unknown> = {
      ...resolved.componentProps,
      ...(depState?.componentProps ?? {}),
      [modelProp]: value,
      [`onUpdate:${modelProp}`]: (next: unknown) => {
        setValue(next);
        if (isCellMode && resolved.trigger === 'change') editing.commitEdit();
      },
      onBlur: () => {
        // cell 模式失焦统一走 commitEdit：change 型编辑器选值时已经 commitEdit 过（此时是安全空操作），
        // 这里补上「未触发 change 就失焦」的兜底
        if (isCellMode) {
          editing.commitEdit();
          return;
        }
        flush();
        handleEditorBlur(row, rowIndex, prop);
      },
    };

    return { component: resolved.component, bind };
  }

  /** 供渲染层消费的单元格视图模型；hasEditorSlot 由调用方（已持有 slots）传入，避免两套编辑绑定都白算一遍 */
  function getCellView(
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
    hasEditorSlot: boolean,
  ): CellView<T> {
    const column = node.column;
    const prop = column.prop;
    const value = prop ? row[prop] : undefined;
    const mode = (props.editMode ?? 'cell') as EditMode;
    const isCellMode = mode === 'cell';

    const colIndex = columns.leafIndexById.value.get(node.id) ?? -1;
    const inGrid = colIndex >= 0;
    const editingNow = inGrid && editing.isCellEditing(rowIndex, colIndex);
    const editable = inGrid && editing.canEditCell(rowIndex, colIndex);
    const active = inGrid && selection.isActive(rowIndex, colIndex);
    const error = prop ? validation.getCellError(row, prop) : undefined;

    const depState = column.dependencies
      ? dependencies.getState(row, rowIndex, column)
      : undefined;
    const rawEditable =
      mode !== 'none' &&
      !!prop &&
      (typeof column.editable === 'function'
        ? !!column.editable({ row, rowIndex })
        : !!column.editable);
    const disabled = rawEditable && !!depState?.disabled;
    // 动态必填：联动算出来的必填状态格内即时可见，不必等提交校验失败才发现
    const required = !!column.required || !!depState?.required;
    const dirtyNow =
      !!prop && dirty.isCellDirty(context.getRowKeyStr(row), prop);

    let editorBind: EditorBinding | null = null;
    let editorSlotProps: EditorSlotProps<T> | null = null;
    if (editingNow && prop) {
      const rowKey = context.getRowKeyStr(row);
      if (hasEditorSlot)
        editorSlotProps = buildEditorSlotProps(
          row,
          rowIndex,
          rowKey,
          column,
          isCellMode,
        );
      else
        editorBind = buildEditorBind(
          row,
          rowIndex,
          rowKey,
          column,
          isCellMode,
          depState,
        );
    }

    return {
      value,
      editing: editingNow,
      editable,
      active,
      disabled,
      required,
      dirty: dirtyNow,
      error,
      mode,
      editorBind,
      editorSlotProps,
    };
  }

  return {
    props,
    slots,
    data: context.data,
    getRowKeyStr: context.getRowKeyStr,
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
    undo: commit.undo,
    redo: commit.redo,
    handleCellClick,
    handleCellDblclick,
    handleEditorBlur,
    getCellView,
  };
}

export type TableEngine<T extends RowData = RowData> = ReturnType<
  typeof createTableEngine<T>
>;

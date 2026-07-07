import { resolveEditor } from '../editors/registry';
import type { Component } from 'vue';
import type { PlusTable } from '../tokens';
import type { CellError, EditMode, RowData } from '../table/defaults';
import type { ColumnNode, PlusTableColumn } from '../table-column/defaults';
import type { DependencyState } from '../store/dependencies';

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

/**
 * 单元格取值 + 写入策略：cell 模式读写草稿仓；row/table 模式下 wantsBuffer 时草稿仓缓冲、
 * 失焦提交，否则 setValue 即时写值。editor-${prop} 插槽与内置/自定义编辑器共用此策略。
 */
export function getCellBinding<T extends RowData = RowData>(
  table: PlusTable<T>,
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
    value = table.store.getDraft(rowKey, prop).value;
  } else if (useBuffer) {
    const draft = table.store.getDraft(rowKey, prop);
    value = draft.has ? draft.value : row[prop];
  } else {
    value = row[prop];
  }
  const setValue = (next: unknown) => {
    if (isCellMode || useBuffer) table.store.setDraft(rowKey, prop, next);
    else table.store.commit('setCellValue', row, rowIndex, prop, next);
  };
  const flush = () => {
    if (!isCellMode && useBuffer)
      table.store.flushDraft(row, rowIndex, rowKey, prop);
  };
  return { value, setValue, flush };
}

export function getEditorSlotProps<T extends RowData = RowData>(
  table: PlusTable<T>,
  row: T,
  rowIndex: number,
  rowKey: string,
  column: PlusTableColumn<T>,
  isCellMode: boolean,
): EditorSlotProps<T> {
  const prop = column.prop!;
  // 插槽是完全自定义的内容，PlusTable 不假设失焦语义，也不做缓冲——commit/cancel 留给业务侧自行接线
  const { value, setValue } = getCellBinding(
    table,
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
    commit: () => table.store.commitEdit(),
    cancel: () => table.store.cancelEdit(),
  };
}

export function getEditorBinding<T extends RowData = RowData>(
  table: PlusTable<T>,
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
  const { value, setValue, flush } = getCellBinding(
    table,
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
      if (isCellMode && resolved.trigger === 'change') table.store.commitEdit();
    },
    onBlur: () => {
      // cell 模式失焦统一走 commitEdit：change 型编辑器选值时已经 commitEdit 过（此时是安全空操作）
      if (isCellMode) {
        table.store.commitEdit();
        return;
      }
      flush();
      if ((table.props.validateOn ?? 'change') === 'blur') {
        void table.store.validateCell(row, rowIndex, prop);
      }
    },
  };

  return { component: resolved.component, bind };
}

/** 供渲染层消费的单元格视图模型；hasEditorSlot 由调用方（已持有 slots）传入，避免两套编辑绑定都白算一遍 */
export function getCellView<T extends RowData = RowData>(
  table: PlusTable<T>,
  row: T,
  rowIndex: number,
  node: ColumnNode<T>,
  hasEditorSlot: boolean,
): CellView<T> {
  const column = node.column;
  const prop = column.prop;
  const value = prop ? row[prop] : undefined;
  const mode = (table.props.editMode ?? 'cell') as EditMode;
  const isCellMode = mode === 'cell';

  const colIndex = table.store.getColumnIndex(node.id);
  const inGrid = colIndex >= 0;
  const editing = inGrid && table.store.isCellEditing(rowIndex, colIndex);
  const editable = inGrid && table.store.canEditCell(rowIndex, colIndex);
  const active = inGrid && table.store.isCurrentCell(rowIndex, colIndex);
  const error = prop ? table.store.getCellError(row, prop) : undefined;

  const depState = column.dependencies
    ? table.store.getDependencyState(row, rowIndex, column)
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
  const dirty = !!prop && table.store.isCellDirty(table.store.getRowKey(row), prop);

  let editorBind: EditorBinding | null = null;
  let editorSlotProps: EditorSlotProps<T> | null = null;
  if (editing && prop) {
    const rowKey = table.store.getRowKey(row);
    if (hasEditorSlot)
      editorSlotProps = getEditorSlotProps(
        table,
        row,
        rowIndex,
        rowKey,
        column,
        isCellMode,
      );
    else
      editorBind = getEditorBinding(
        table,
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
    editing,
    editable,
    active,
    disabled,
    required,
    dirty,
    error,
    mode,
    editorBind,
    editorSlotProps,
  };
}

import { typedCharToDraft } from '../editors/registry';
import { createAdaptive } from './adaptive';
import { createColumns } from './columns';
import { createDependencies } from './dependencies';
import { createEditing } from './editing';
import { createKeyboard } from './keyboard';
import { createRows } from './rows';
import { createSelection } from './selection';
import { createValidation } from './validation';
import type { Ref, Slots } from 'vue';
import type { PlusTableEmits, PlusTableProps, RowData } from '../types';
import type { WriteCellFn } from './editing';

export type { WriteCellFn } from './editing';
export type { DependencyState } from './dependencies';
export type { ResolvedEditor, EditorAdapter } from '../editors/registry';
export type { SettingItem } from './columns';
export type { CellPosition } from './selection';

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

  function getRowKeyStr(row: RowData): string {
    const rowKey = props.rowKey;
    const raw = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
    return String(raw);
  }

  const columns = createColumns(props);

  const selection = createSelection({
    gridRef,
    rowCount: () => data().length,
    colCount: () => columns.leafNodes.value.length,
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
    getRowKeyStr,
    getDependencyState: dependencies.getState,
    scrollToCell: (rowIndex, colIndex) => selection.setActiveCell(rowIndex, colIndex),
  });

  /**
   * 单元格写值流水线：写回行对象 → cell-change → 联动 trigger → 按需校验。
   * 所有编辑路径（cell 提交 / row·table 直绑 / Delete 清空 / 联动 setValue）统一走这里。
   */
  const writeCell: WriteCellFn = (row, rowIndex, field, value) => {
    const oldValue = row[field];
    if (Object.is(oldValue, value)) return;
    row[field] = value;
    emit('cell-change', { row, rowIndex, field, value, oldValue });
    dependencies.notifyFieldChange(row, rowIndex, field);
    if ((props.validateOn ?? 'change') === 'change') {
      void validation.validateCellByField(row, rowIndex, field);
    }
  };

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
    if (!node?.column.field || !row) return;
    writeCell(row, rowIndex, node.column.field, null);
  }

  const keyboard = createKeyboard({
    props,
    selection,
    editing,
    clearCell,
    typedCharToDraft: (colIndex, char) => {
      const node = columns.leafNodes.value[colIndex];
      return node ? typedCharToDraft(node.column.editor, char) : undefined;
    },
  });

  const rows = createRows({ data, emit });
  const adaptive = createAdaptive({ props, gridRef, paginationRef });

  function resolveCellPosition(row: RowData, cell: HTMLElement) {
    const rowIndex = data().indexOf(row);
    const colIndex = (cell as HTMLTableCellElement).cellIndex ?? -1;
    return { rowIndex, colIndex };
  }

  function handleCellClick(row: RowData, _column: unknown, cell: HTMLElement, event: Event) {
    if ((props.editMode ?? 'cell') === 'table') return;
    const { rowIndex, colIndex } = resolveCellPosition(row, cell);
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

  function handleCellDblclick(row: RowData, _column: unknown, cell: HTMLElement) {
    const mode = props.editMode ?? 'cell';
    const { rowIndex, colIndex } = resolveCellPosition(row, cell);
    if (rowIndex < 0) return;
    if (mode === 'cell' && colIndex >= 0) editing.startEdit(rowIndex, colIndex);
    else if (mode === 'row') editing.startRowEdit(rowIndex);
  }

  /** validateOn === 'blur' 时由单元格编辑器 blur 调用 */
  function handleEditorBlur(row: RowData, rowIndex: number, field: string) {
    if ((props.validateOn ?? 'change') === 'blur') {
      void validation.validateCellByField(row, rowIndex, field);
    }
  }

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
    writeCell,
    clearCell,
    handleCellClick,
    handleCellDblclick,
    handleEditorBlur,
  };
}

export type TableEngine = ReturnType<typeof createTableEngine>;

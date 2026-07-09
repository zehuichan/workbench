import type { PlusTable } from '../tokens';
import type { RowData } from './defaults';

export function useEvents<T extends RowData = RowData>(table: PlusTable<T>) {
  function handlePageChange(page: number) {
    table.emit('update:page', page);
    table.emit('page-change', { page, pageSize: table.props.pageSize! });
  }

  function handlePageSizeChange(pageSize: number) {
    table.emit('update:pageSize', pageSize);
    table.emit('page-change', { page: table.props.page!, pageSize });
  }

  /** 表头拖拽调宽（el-table 需 border 才出现拖拽柄），记录并持久化 */
  function handleHeaderDragend(
    newWidth: number,
    _oldWidth: number,
    column: { columnKey?: string },
  ) {
    if (column.columnKey)
      table.store.commit('setColumnWidth', column.columnKey, newWidth);
  }

  /**
   * 用 el-table 回传的 column.columnKey（渲染时已设为 node.id）查找列下标，
   * 而不是 DOM cell.cellIndex——特殊列作为真实 <td> 渲染但不进 states.columns。
   */
  function getCellPosition(row: T, column: { columnKey?: string }) {
    const rowKey = table.store.getRowKey(row);
    const rowIndex =
      table.store.states.keysMap.value.get(rowKey)?.rowIndex ?? -1;
    const colIndex = column.columnKey
      ? table.store.getColumnIndex(column.columnKey)
      : -1;
    return { rowIndex, colIndex };
  }

  function handleCellClick(
    row: T,
    column: { columnKey?: string },
    _cell: HTMLElement,
    event: Event,
  ) {
    const mode = table.store.states.editMode.value;
    if (mode === 'table') return;
    const { rowIndex, colIndex } = getCellPosition(row, column);
    if (rowIndex < 0 || colIndex < 0) return;

    if (mode === 'row' && table.store.isRowEditing(row)) {
      if (table.store.canEditCell(rowIndex, colIndex)) {
        table.store.setRowEditingCell(rowIndex, colIndex);
      } else {
        table.store.clearRowEditingCell(true);
        table.store.commit('setCurrentCell', rowIndex, colIndex, false);
        table.store.focusGrid();
      }
      return;
    }

    table.store.commit('setCurrentCell', rowIndex, colIndex, false);
    // 点击落在编辑器里时不抢焦点，否则把焦点交给网格容器以接收热键
    const target = event.target as HTMLElement | null;
    if (
      !target?.closest(
        'input, textarea, .el-select, .el-switch, .el-checkbox, [contenteditable="true"]',
      )
    ) {
      table.store.focusGrid();
    }
  }

  function handleCellDblclick(
    row: T,
    column: { columnKey?: string },
    _cell: HTMLElement,
  ) {
    const mode = table.store.states.editMode.value;
    const { rowIndex, colIndex } = getCellPosition(row, column);
    if (rowIndex < 0) return;
    if (mode === 'cell' && colIndex >= 0) {
      table.store.startEdit(rowIndex, colIndex);
    } else if (mode === 'row') {
      table.store.startRowEdit(rowIndex);
      if (colIndex >= 0) table.store.setRowEditingCell(rowIndex, colIndex);
    }
  }

  return {
    handlePageChange,
    handlePageSizeChange,
    handleHeaderDragend,
    getCellPosition,
    handleCellClick,
    handleCellDblclick,
  };
}

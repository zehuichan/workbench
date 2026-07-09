import { nextTick, shallowRef } from 'vue';
import { clamp } from 'es-toolkit';
import { focusEditorElement } from '../util';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export function useCurrent<T extends RowData = RowData>(table: PlusTable<T>) {
  const states = {
    currentCell: shallowRef<CellPosition | null>(null),
  };

  function rowCount(): number {
    return table.store.states.data.value.length;
  }

  function colCount(): number {
    return table.store.states.columns.value.length;
  }

  /** 把下标钳制到 [0, max-1]（max 为 0 时钳制到 0，交由调用方按 rowCount/colCount 判空） */
  function clampIndex(value: number, max: number): number {
    return clamp(value, 0, Math.max(max - 1, 0));
  }

  function getRowEl(rowIndex: number): HTMLTableRowElement | null {
    const grid = table.gridRef.value;
    if (!grid) return null;
    const rows = grid.querySelectorAll<HTMLTableRowElement>(
      '.el-table__body-wrapper tbody tr.el-table__row',
    );
    return rows.item(rowIndex);
  }

  /**
   * 按 rowIndex 结构定位真实 <tr>（行顺序始终与 data 一致，不受列显隐影响），
   * 再按列 id 在行内查找带 data-ptbl-col 标记的单元格——不依赖任何 DOM 下标换算。
   */
  function getCellEl(rowIndex: number, colIndex: number): HTMLElement | null {
    const tr = getRowEl(rowIndex);
    if (!tr) return null;
    const columnId = table.store.states.columns.value[colIndex]?.id;
    if (!columnId) return null;
    return tr.querySelector<HTMLElement>(
      `[data-ptbl-col="${CSS.escape(columnId)}"]`,
    );
  }

  function scrollCellIntoView(rowIndex: number, colIndex: number) {
    getCellEl(rowIndex, colIndex)?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }

  function setCurrentCell(rowIndex: number, colIndex: number, scroll = true) {
    if (rowCount() === 0 || colCount() === 0) {
      states.currentCell.value = null;
      return;
    }
    const next: CellPosition = {
      rowIndex: clampIndex(rowIndex, rowCount()),
      colIndex: clampIndex(colIndex, colCount()),
    };
    const current = states.currentCell.value;
    if (
      current?.rowIndex !== next.rowIndex ||
      current?.colIndex !== next.colIndex
    ) {
      states.currentCell.value = next;
    }
    if (scroll) scrollCellIntoView(next.rowIndex, next.colIndex);
  }

  function isCurrentCell(rowIndex: number, colIndex: number): boolean {
    const current = states.currentCell.value;
    return current?.rowIndex === rowIndex && current?.colIndex === colIndex;
  }

  /** 方向移动（不换行），无活动格时落到首格 */
  function moveCurrent(deltaRow: number, deltaCol: number) {
    const current = states.currentCell.value;
    if (!current) {
      setCurrentCell(0, 0);
      return;
    }
    setCurrentCell(current.rowIndex + deltaRow, current.colIndex + deltaCol);
  }

  /** 顺序移动（Tab 流，行尾换行），无活动格时落到首格 */
  function moveSequential(delta: number) {
    const cols = colCount();
    const total = rowCount() * cols;
    if (total === 0 || cols === 0) return;
    const current = states.currentCell.value;
    if (!current) {
      setCurrentCell(0, 0);
      return;
    }
    const flat = Math.min(
      Math.max(current.rowIndex * cols + current.colIndex + delta, 0),
      total - 1,
    );
    setCurrentCell(Math.floor(flat / cols), flat % cols);
  }

  function moveToRowEdge(end: boolean) {
    const current = states.currentCell.value;
    if (!current) {
      setCurrentCell(0, 0);
      return;
    }
    setCurrentCell(current.rowIndex, end ? colCount() - 1 : 0);
  }

  function moveToTableCorner(end: boolean) {
    if (end) setCurrentCell(rowCount() - 1, colCount() - 1);
    else setCurrentCell(0, 0);
  }

  function focusGrid() {
    table.gridRef.value?.focus({ preventScroll: true });
  }

  /**
   * row/table 模式下，编辑器随格子常驻渲染，移动高亮态之后若不把真实 DOM 焦点
   * 也同步过去，用户看到高亮跳到了新格子，但键入内容却还是灌进旧格子的输入框。
   */
  function focusCurrentCellEditor() {
    const current = states.currentCell.value;
    if (!current) return;
    void nextTick(() => {
      if (states.currentCell.value !== current) return;
      const cellEl = getCellEl(current.rowIndex, current.colIndex);
      if (
        !focusEditorElement(cellEl, {
          preventScroll: true,
          select: 'all',
          skipIfFocused: true,
        })
      ) {
        focusGrid();
      }
    });
  }

  return {
    isCurrentCell,
    setCurrentCell,
    moveCurrent,
    moveSequential,
    moveToRowEdge,
    moveToTableCorner,
    getCellEl,
    scrollCellIntoView,
    focusGrid,
    focusCurrentCellEditor,
    states,
  };
}

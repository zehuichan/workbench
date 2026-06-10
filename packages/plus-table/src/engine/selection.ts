import { shallowRef } from 'vue';
import type { Ref } from 'vue';

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface SelectionOptions {
  gridRef: Ref<HTMLElement | undefined>;
  rowCount: () => number;
  colCount: () => number;
}

export function createSelection(options: SelectionOptions) {
  const { gridRef, rowCount, colCount } = options;

  const activeCell = shallowRef<CellPosition | null>(null);

  function clamp(value: number, max: number): number {
    return Math.min(Math.max(value, 0), Math.max(max - 1, 0));
  }

  function getCellEl(rowIndex: number, colIndex: number): HTMLTableCellElement | null {
    const grid = gridRef.value;
    if (!grid) return null;
    const rows = grid.querySelectorAll<HTMLTableRowElement>(
      '.el-table__body-wrapper tbody tr.el-table__row',
    );
    const tr = rows.item(rowIndex);
    return tr?.cells.item(colIndex) ?? null;
  }

  function scrollCellIntoView(rowIndex: number, colIndex: number) {
    getCellEl(rowIndex, colIndex)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function setActiveCell(rowIndex: number, colIndex: number, scroll = true) {
    if (rowCount() === 0 || colCount() === 0) {
      activeCell.value = null;
      return;
    }
    const next: CellPosition = {
      rowIndex: clamp(rowIndex, rowCount()),
      colIndex: clamp(colIndex, colCount()),
    };
    const current = activeCell.value;
    if (current?.rowIndex !== next.rowIndex || current?.colIndex !== next.colIndex) {
      activeCell.value = next;
    }
    if (scroll) scrollCellIntoView(next.rowIndex, next.colIndex);
  }

  function isActive(rowIndex: number, colIndex: number): boolean {
    const current = activeCell.value;
    return current?.rowIndex === rowIndex && current?.colIndex === colIndex;
  }

  /** 方向移动（不换行），无活动格时落到首格 */
  function moveActive(deltaRow: number, deltaCol: number) {
    const current = activeCell.value;
    if (!current) {
      setActiveCell(0, 0);
      return;
    }
    setActiveCell(current.rowIndex + deltaRow, current.colIndex + deltaCol);
  }

  /** 顺序移动（Tab 流，行尾换行），无活动格时落到首格 */
  function moveSequential(delta: number) {
    const cols = colCount();
    const total = rowCount() * cols;
    if (total === 0 || cols === 0) return;
    const current = activeCell.value;
    if (!current) {
      setActiveCell(0, 0);
      return;
    }
    const flat = Math.min(
      Math.max(current.rowIndex * cols + current.colIndex + delta, 0),
      total - 1,
    );
    setActiveCell(Math.floor(flat / cols), flat % cols);
  }

  function moveToRowEdge(end: boolean) {
    const current = activeCell.value;
    if (!current) {
      setActiveCell(0, 0);
      return;
    }
    setActiveCell(current.rowIndex, end ? colCount() - 1 : 0);
  }

  function moveToTableCorner(end: boolean) {
    if (end) setActiveCell(rowCount() - 1, colCount() - 1);
    else setActiveCell(0, 0);
  }

  function focusGrid() {
    gridRef.value?.focus({ preventScroll: true });
  }

  return {
    activeCell,
    isActive,
    setActiveCell,
    moveActive,
    moveSequential,
    moveToRowEdge,
    moveToTableCorner,
    getCellEl,
    scrollCellIntoView,
    focusGrid,
  };
}

export type SelectionApi = ReturnType<typeof createSelection>;

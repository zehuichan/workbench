import { nextTick, shallowRef } from 'vue';
import { clamp } from 'es-toolkit';
import type { Ref } from 'vue';

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface SelectionOptions {
  gridRef: Ref<HTMLElement | undefined>;
  rowCount: () => number;
  colCount: () => number;
  /** leafNodes 下标 → 真实 <td> 下标（特殊列会占位但不进 leafNodes，两者下标会错位） */
  colDomIndex: (colIndex: number) => number;
}

export function createSelection(options: SelectionOptions) {
  const { gridRef, rowCount, colCount, colDomIndex } = options;

  const activeCell = shallowRef<CellPosition | null>(null);

  /** 把下标钳制到 [0, max-1]（max 为 0 时钳制到 0，交由调用方按 rowCount/colCount 判空） */
  function clampIndex(value: number, max: number): number {
    return clamp(value, 0, Math.max(max - 1, 0));
  }

  function getCellEl(rowIndex: number, colIndex: number): HTMLTableCellElement | null {
    const grid = gridRef.value;
    if (!grid) return null;
    const rows = grid.querySelectorAll<HTMLTableRowElement>(
      '.el-table__body-wrapper tbody tr.el-table__row',
    );
    const tr = rows.item(rowIndex);
    return tr?.cells.item(colDomIndex(colIndex)) ?? null;
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
      rowIndex: clampIndex(rowIndex, rowCount()),
      colIndex: clampIndex(colIndex, colCount()),
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

  /**
   * row/table 模式下，编辑器随格子常驻渲染，移动高亮态之后若不把真实 DOM 焦点
   * 也同步过去，用户看到高亮跳到了新格子，但键入内容却还是灌进旧格子的输入框。
   * 目标格没有真实输入框（比如该格不可编辑）时退回聚焦网格容器，保证按键继续可用。
   */
  function focusActiveCellEditor() {
    const current = activeCell.value;
    if (!current) return;
    void nextTick(() => {
      if (activeCell.value !== current) return; // 期间又移动了，交给下一次调用处理
      const td = getCellEl(current.rowIndex, current.colIndex);
      const input = td?.querySelector<HTMLElement>(
        'input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!input) {
        focusGrid();
        return;
      }
      if (document.activeElement === input) return;
      input.focus({ preventScroll: true });
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        try {
          input.select();
        } catch {
          // number 等输入类型不支持 selection API
        }
      }
    });
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
    focusActiveCellEditor,
  };
}

export type SelectionApi = ReturnType<typeof createSelection>;

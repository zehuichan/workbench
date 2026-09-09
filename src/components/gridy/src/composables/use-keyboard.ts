import type { ComputedRef } from 'vue';

import type { GridyDataColumn, GridyRow } from '../types';

import { nextTick, ref } from 'vue';

import { findCell, scrollIntoView, VIEW_INDEX_ATTR } from '../dom';

const MAX_FOCUS_ATTEMPTS = 10;

const TEXT_INPUT_TYPES = new Set(['', 'email', 'search', 'tel', 'text', 'url']);

const VERTICAL_NATIVE_SELECTOR =
  '.ant-select, .ant-input-number, .ant-picker, .ant-radio-group, .ant-cascader, .ant-mentions';

export interface GridyActiveCell {
  field: string;
  rowId: string;
}

interface CellHitContext {
  cellEl: HTMLElement;
  colIndex: number;
  viewIndex: number;
}

interface TextCaret {
  atEnd: boolean;
  atStart: boolean;
}

export interface UseKeyboardOptions {
  dataColumns: ComputedRef<GridyDataColumn[]>;
  ensureRowVisible: (viewIndex: number) => HTMLElement | null | Promise<HTMLElement | null>;
  getScrollElement: () => HTMLElement | null;
  keyboardEnabled: () => boolean;
  renderRows: ComputedRef<GridyRow[]>;
}

/**
 * 仿 Excel 的单元格键盘导航 + 活动单元格高亮（对应 `keyboard` prop）。
 * 滚动 / 等待行挂载统一走 `ensureRowVisible`，不再自管帧重试滚动。
 */
export function useKeyboard({
  dataColumns,
  ensureRowVisible,
  getScrollElement,
  keyboardEnabled,
  renderRows,
}: UseKeyboardOptions) {
  const activeCell = ref<GridyActiveCell | null>(null);

  function isActiveCell(rowId: string, field: string): boolean {
    return activeCell.value?.rowId === rowId && activeCell.value?.field === field;
  }

  function colIndexOf(field: string): number {
    return dataColumns.value.findIndex((col) => col.field === field);
  }

  function hitCell(target: HTMLElement): CellHitContext | null {
    const container = getScrollElement();
    if (!container) {
      return null;
    }
    const cellEl = target.closest<HTMLElement>('td[data-field]');
    const field = cellEl?.dataset.field;
    const rowEl = cellEl?.closest<HTMLElement>(`tr[${VIEW_INDEX_ATTR}]`);
    if (!cellEl || field === undefined || !rowEl) {
      return null;
    }
    if (cellEl.closest('.gridy__scroll') !== container) {
      return null;
    }
    const viewIndex = Number(rowEl.getAttribute(VIEW_INDEX_ATTR));
    const colIndex = colIndexOf(field);
    if (Number.isNaN(viewIndex) || colIndex === -1) {
      return null;
    }
    return { cellEl, colIndex, viewIndex };
  }

  /** 树形展开图标也是 button，但方向键落格时应聚焦编辑控件而不是它 */
  function focusWithin(cellEl: HTMLElement) {
    const control = cellEl.querySelector<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]):not(.gridy__expand-icon)',
    );
    const target = control ?? cellEl;
    target.focus({ preventScroll: true });
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.select();
    }
  }

  async function tryFocusCell(
    viewIndex: number,
    field: string,
    rowId: string,
    attemptsLeft: number,
  ): Promise<void> {
    await ensureRowVisible(viewIndex);
    if (activeCell.value?.rowId !== rowId || activeCell.value.field !== field) {
      return;
    }
    const container = getScrollElement();
    if (!container) {
      return;
    }
    const cellEl = findCell(container, viewIndex, field);
    if (cellEl) {
      scrollIntoView(container, cellEl);
      focusWithin(cellEl);
      return;
    }
    if (attemptsLeft <= 0) {
      return;
    }
    await nextTick();
    return tryFocusCell(viewIndex, field, rowId, attemptsLeft - 1);
  }

  function moveTo(viewIndex: number, colIndex: number, event: KeyboardEvent) {
    const row = renderRows.value[viewIndex];
    const col = dataColumns.value[colIndex];
    if (!row || !col) {
      return;
    }
    event.preventDefault();
    activeCell.value = { field: col.field, rowId: row.id };
    void tryFocusCell(viewIndex, col.field, row.id, MAX_FOCUS_ATTEMPTS);
  }

  function resolveGridPosition(hit: CellHitContext): {
    colIndex: number;
    viewIndex: number;
  } {
    const cell = activeCell.value;
    if (!cell) {
      return hit;
    }
    const viewIndex = renderRows.value.findIndex((row) => row.id === cell.rowId);
    const colIndex = colIndexOf(cell.field);
    return viewIndex === -1 || colIndex === -1 ? hit : { colIndex, viewIndex };
  }

  function isEnterGuarded(target: HTMLElement): boolean {
    if (target.tagName === 'TEXTAREA') {
      return true;
    }
    if (target.closest('.ant-picker')) {
      return true;
    }
    return !!target.closest('[aria-expanded="true"]');
  }

  function isPlainTextInput(target: HTMLElement): boolean {
    if (target.tagName !== 'INPUT') {
      return false;
    }
    if (!TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)) {
      return false;
    }
    return !target.closest(VERTICAL_NATIVE_SELECTOR);
  }

  function textCaretOf(target: HTMLElement): null | TextCaret {
    const isTextarea = target.tagName === 'TEXTAREA';
    const isTextInput =
      target.tagName === 'INPUT' && TEXT_INPUT_TYPES.has((target as HTMLInputElement).type);
    if (!isTextarea && !isTextInput) {
      return null;
    }
    const el = target as HTMLInputElement | HTMLTextAreaElement;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const length = el.value.length;
    return {
      atEnd: start === length && end === length,
      atStart: start === 0 && end === 0,
    };
  }

  function onKeydown(event: KeyboardEvent) {
    if (!keyboardEnabled()) {
      return;
    }
    if (
      event.isComposing ||
      event.keyCode === 229 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    const target = event.target as HTMLElement;
    const hit = hitCell(target);
    if (!hit) {
      return;
    }
    const { cellEl } = hit;
    const { colIndex, viewIndex } = resolveGridPosition(hit);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (target !== cellEl && !isPlainTextInput(target)) {
          return;
        }
        moveTo(viewIndex + (event.key === 'ArrowDown' ? 1 : -1), colIndex, event);
        return;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        if (target !== cellEl) {
          if (target.closest('[aria-expanded="true"]')) {
            return;
          }
          const caret = textCaretOf(target);
          if (!caret) {
            return;
          }
          if (event.key === 'ArrowLeft' ? !caret.atStart : !caret.atEnd) {
            return;
          }
        }
        moveTo(viewIndex, colIndex + (event.key === 'ArrowRight' ? 1 : -1), event);
        return;
      }
      case 'Enter': {
        if (isEnterGuarded(target)) {
          return;
        }
        moveTo(viewIndex + (event.shiftKey ? -1 : 1), colIndex, event);
        return;
      }
      case 'Tab': {
        const total = dataColumns.value.length;
        let nextRow = viewIndex;
        let nextCol = colIndex + (event.shiftKey ? -1 : 1);
        if (nextCol < 0) {
          nextRow -= 1;
          nextCol = total - 1;
        } else if (nextCol >= total) {
          nextRow += 1;
          nextCol = 0;
        }
        if (nextRow < 0 || nextRow >= renderRows.value.length) {
          return;
        }
        moveTo(nextRow, nextCol, event);
      }
    }
  }

  /** 焦点进了本表内的展开面板（含任意层嵌套子表）：外层不再有活动格，避免面板内输入时外层格仍高亮 */
  function isInsideOwnExpandedPanel(target: HTMLElement): boolean {
    const container = getScrollElement();
    return !!container && container.contains(target) && !!target.closest('.gridy__expanded-row');
  }

  function onFocusIn(event: FocusEvent) {
    if (!keyboardEnabled()) {
      return;
    }
    const target = event.target as HTMLElement;
    const hit = hitCell(target);
    if (!hit) {
      if (isInsideOwnExpandedPanel(target)) {
        activeCell.value = null;
      }
      return;
    }
    const row = renderRows.value[hit.viewIndex];
    const col = dataColumns.value[hit.colIndex];
    if (!row || !col) {
      return;
    }
    activeCell.value = { field: col.field, rowId: row.id };
  }

  return {
    isActiveCell,
    onFocusIn,
    onKeydown,
  };
}

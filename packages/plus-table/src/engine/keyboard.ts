import { partition } from 'es-toolkit';
import type { HotkeyBinding, HotkeyContext, PlusTableColumn, PlusTableProps, RowData } from '../types';
import type { EditingApi, WriteCellFn } from './editing';
import type { SelectionApi } from './selection';

export interface KeyboardOptions {
  props: PlusTableProps;
  data: () => RowData[];
  selection: SelectionApi;
  editing: EditingApi;
  writeCell: WriteCellFn;
  /** 清空活动格的值（Delete/Backspace） */
  clearCell: (rowIndex: number, colIndex: number) => void;
  /** 「选中即输入」：把首个字符转换为该列编辑器的草稿；undefined 表示仅进编不种入 */
  typedCharToDraft: (colIndex: number, char: string) => unknown;
  getColumnAt: (colIndex: number) => PlusTableColumn | null;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function isFromEditorElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/** 'Ctrl+Shift+Z' 风格组合键字符串与 KeyboardEvent 比对，大小写不敏感 */
function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey
    .toLowerCase()
    .split('+')
    .map((s) => s.trim());
  const mainKey = parts.find((p) => !['ctrl', 'shift', 'alt', 'meta'].includes(p));
  if (!mainKey) return false;
  return (
    event.ctrlKey === parts.includes('ctrl') &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt') &&
    event.metaKey === parts.includes('meta') &&
    event.key.toLowerCase() === mainKey
  );
}

/**
 * 仿 Excel 键盘流。监听挂在表格外层容器（tabindex=0），
 * 编辑器内的按键经冒泡到达这里，按编辑态分流处理。
 */
export function createKeyboard(options: KeyboardOptions) {
  const {
    props,
    data,
    selection,
    editing,
    writeCell,
    clearCell,
    typedCharToDraft,
    getColumnAt,
    undo,
    redo,
    canUndo,
    canRedo,
  } = options;

  function buildContext(event: KeyboardEvent): HotkeyContext {
    const active = selection.activeCell.value;
    const rowIndex = active?.rowIndex ?? -1;
    const colIndex = active?.colIndex ?? -1;
    const row = rowIndex >= 0 ? (data()[rowIndex] ?? null) : null;
    const column = colIndex >= 0 ? getColumnAt(colIndex) : null;
    return {
      event,
      rowIndex,
      colIndex,
      row,
      prop: column?.prop,
      column,
      data: data(),
      navigate: (rowDelta, colDelta) => selection.moveActive(rowDelta, colDelta),
      startEdit: () => {
        if (active) editing.startEdit(active.rowIndex, active.colIndex);
      },
      cancelEdit: () => editing.cancelEdit(),
      setValue: (value) => {
        if (!row || !column?.prop) return;
        writeCell(row, rowIndex, column.prop, value);
      },
      undo,
      redo,
    };
  }

  /** 未显式设 hotkeyEnabled: false 时默认启用；只管自定义 hotkeys 分发，不影响内置导航 */
  function getCustomHotkeys(): HotkeyBinding[] {
    if (props.hotkeyEnabled === false) return [];
    return props.hotkeys ?? [];
  }

  function runHotkeyBindings(bindings: HotkeyBinding[], event: KeyboardEvent): boolean {
    for (const binding of bindings) {
      if (!matchesHotkey(event, binding.key)) continue;
      const ctx = buildContext(event);
      if (binding.when && !binding.when(ctx)) continue;
      if (binding.preventDefault !== false) event.preventDefault();
      if (binding.stopPropagation) event.stopPropagation();
      const result = binding.handler(ctx);
      if (result !== false) return true;
    }
    return false;
  }

  /** cell 模式编辑器打开期间的按键 */
  function onEditingKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape': {
        editing.cancelEdit();
        selection.focusGrid();
        event.preventDefault();
        event.stopPropagation();
        break;
      }
      case 'Enter': {
        if (event.isComposing) return;
        const target = event.target as HTMLElement | null;
        // 仿 Excel：textarea 中 Alt/Shift+Enter 换行，Enter 提交
        if (target instanceof HTMLTextAreaElement && (event.shiftKey || event.altKey)) {
          return;
        }
        editing.commitEdit();
        selection.moveActive(1, 0);
        selection.focusGrid();
        event.preventDefault();
        break;
      }
      case 'Tab': {
        editing.commitEdit();
        selection.moveSequential(event.shiftKey ? -1 : 1);
        selection.focusGrid();
        event.preventDefault();
        break;
      }
      default:
        // 其余按键（含方向键）留给编辑器自身
        break;
    }
  }

  /** Tab / Esc：任何编辑模式、任何焦点位置都由网格统一拦截，不因焦点落在输入框内而被放过 */
  function handleGlobalKey(event: KeyboardEvent): boolean {
    const mode = props.editMode ?? 'cell';

    if (event.key === 'Escape') {
      const active = selection.activeCell.value;
      const row = mode === 'row' && active ? data()[active.rowIndex] : undefined;
      if (mode === 'row' && active && row && editing.isRowEditing(row)) {
        editing.cancelRowEdit(active.rowIndex);
      }
      selection.focusGrid();
      event.preventDefault();
      return true;
    }

    if (event.key === 'Tab') {
      selection.moveSequential(event.shiftKey ? -1 : 1);
      if (mode === 'cell') selection.focusGrid();
      else selection.focusActiveCellEditor();
      event.preventDefault();
      return true;
    }

    return false;
  }

  /** 非编辑态的导航 / 进编 / 撤销重做按键；焦点在编辑器控件内部时不接管（交还方向键/字符输入等原生行为） */
  function onBuiltinNavigation(event: KeyboardEvent): boolean {
    const mode = props.editMode ?? 'cell';
    const ctrl = event.ctrlKey || event.metaKey;
    const active = selection.activeCell.value;

    const handled = (): true => {
      event.preventDefault();
      return true;
    };
    /** row/table 模式下编辑器随格常驻，移动高亮态后需把真实 DOM 焦点同步过去 */
    const syncFocus = () => {
      if (mode !== 'cell') selection.focusActiveCellEditor();
    };

    const key = event.key.toLowerCase();
    if (ctrl && !event.shiftKey && key === 'z') {
      if (!canUndo()) return false;
      undo();
      return handled();
    }
    if (ctrl && ((event.shiftKey && key === 'z') || (!event.shiftKey && key === 'y'))) {
      if (!canRedo()) return false;
      redo();
      return handled();
    }

    switch (event.key) {
      case 'ArrowUp':
        selection.moveActive(-1, 0);
        syncFocus();
        return handled();
      case 'ArrowDown':
        selection.moveActive(1, 0);
        syncFocus();
        return handled();
      case 'ArrowLeft':
        selection.moveActive(0, -1);
        syncFocus();
        return handled();
      case 'ArrowRight':
        selection.moveActive(0, 1);
        syncFocus();
        return handled();
      case 'Home':
        if (ctrl) selection.moveToTableCorner(false);
        else selection.moveToRowEdge(false);
        syncFocus();
        return handled();
      case 'End':
        if (ctrl) selection.moveToTableCorner(true);
        else selection.moveToRowEdge(true);
        syncFocus();
        return handled();
      case 'Enter': {
        if (event.isComposing || !active) return false;
        if (mode === 'cell' && editing.canEditCell(active.rowIndex, active.colIndex)) {
          editing.startEdit(active.rowIndex, active.colIndex);
        } else {
          selection.moveActive(1, 0);
          syncFocus();
        }
        return handled();
      }
      case 'F2': {
        if (!active) return false;
        if (mode === 'cell') editing.startEdit(active.rowIndex, active.colIndex);
        return handled();
      }
      case 'Delete':
      case 'Backspace': {
        if (!active) return false;
        if (editing.canEditCell(active.rowIndex, active.colIndex)) {
          clearCell(active.rowIndex, active.colIndex);
        }
        return handled();
      }
      default: {
        // 可打印字符：选中即输入（cell 模式全部可编辑列）；
        // 文本/数字编辑器以该字符为草稿覆盖原值，其余编辑器仅进入编辑态
        if (
          mode === 'cell' &&
          active &&
          isPrintableKey(event) &&
          editing.canEditCell(active.rowIndex, active.colIndex)
        ) {
          const draft = typedCharToDraft(active.colIndex, event.key);
          if (draft === undefined) {
            editing.startEdit(active.rowIndex, active.colIndex);
          } else {
            editing.startEdit(active.rowIndex, active.colIndex, {
              defaultValue: draft,
            });
          }
          return handled();
        }
        return false;
      }
    }
  }

  function onKeydown(event: KeyboardEvent) {
    const [overrides, normals] = partition(getCustomHotkeys(), (h) => !!h.override);

    // 1. 用户 override 热键：先于任何内置行为判定，任何编辑态 / 焦点位置都生效
    if (runHotkeyBindings(overrides, event)) return;

    // 2. cell 模式编辑器打开中：走独立的编辑态按键流（Tab/Enter/Esc 语义不同）
    if (editing.editingCell.value) {
      onEditingKeydown(event);
      return;
    }

    // 3. Tab / Esc：任何模式、任何焦点位置都由网格统一处理
    if (handleGlobalKey(event)) return;

    // 4. 焦点在编辑器控件内部时，方向键/字符输入等交还控件自身，不拦截
    if (!isFromEditorElement(event) && onBuiltinNavigation(event)) return;

    // 5. 内置没处理时，才轮到用户普通热键
    runHotkeyBindings(normals, event);
  }

  return { onKeydown };
}

export type KeyboardApi = ReturnType<typeof createKeyboard>;

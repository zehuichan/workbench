import { partition } from 'es-toolkit';
import { typedCharToDraft } from '../editors/registry';
import type { PlusTable } from '../tokens';
import type { HotkeyBinding, HotkeyContext, RowData } from './defaults';

function isFromEditorElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}

/** 'Ctrl+Shift+Z' 风格组合键字符串与 KeyboardEvent 比对，大小写不敏感 */
function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey
    .toLowerCase()
    .split('+')
    .map((s) => s.trim());
  const mainKey = parts.find(
    (p) => !['ctrl', 'shift', 'alt', 'meta'].includes(p),
  );
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
export function useKeyboard<T extends RowData = RowData>(table: PlusTable<T>) {
  function buildContext(event: KeyboardEvent): HotkeyContext<T> {
    const current = table.store.states.currentCell.value;
    const rowIndex = current?.rowIndex ?? -1;
    const colIndex = current?.colIndex ?? -1;
    const row = rowIndex >= 0 ? (table.store.states.data.value[rowIndex] ?? null) : null;
    const column =
      colIndex >= 0 ? (table.store.states.columns.value[colIndex]?.column ?? null) : null;
    return {
      event,
      rowIndex,
      colIndex,
      row,
      prop: column?.prop,
      column,
      data: table.store.states.data.value,
      navigate: (rowDelta, colDelta) =>
        table.store.moveCurrent(rowDelta, colDelta),
      startEdit: () => {
        if (current) table.store.startEdit(current.rowIndex, current.colIndex);
      },
      cancelEdit: () => table.store.cancelEdit(),
      setValue: (value) => {
        if (!row || !column?.prop) return;
        table.store.commit('setCellValue', row, rowIndex, column.prop, value);
      },
      undo: table.store.undo,
      redo: table.store.redo,
    };
  }

  function getCustomHotkeys(): HotkeyBinding<T>[] {
    if (table.props.hotkeyEnabled === false) return [];
    return table.props.hotkeys ?? [];
  }

  function runHotkeyBindings(
    bindings: HotkeyBinding<T>[],
    event: KeyboardEvent,
  ): boolean {
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
  function handleEditingKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape': {
        table.store.cancelEdit();
        table.store.focusGrid();
        event.preventDefault();
        event.stopPropagation();
        break;
      }
      case 'Enter': {
        if (event.isComposing) return;
        const target = event.target as HTMLElement | null;
        // 仿 Excel：textarea 中 Alt/Shift+Enter 换行，Enter 提交
        if (
          target instanceof HTMLTextAreaElement &&
          (event.shiftKey || event.altKey)
        ) {
          return;
        }
        table.store.commitEdit();
        table.store.moveCurrent(1, 0);
        table.store.focusGrid();
        event.preventDefault();
        break;
      }
      case 'Tab': {
        table.store.commitEdit();
        table.store.moveSequential(event.shiftKey ? -1 : 1);
        table.store.focusGrid();
        event.preventDefault();
        break;
      }
      default:
        break;
    }
  }

  function openRowEditorAtCurrentOrFocusGrid() {
    const current = table.store.states.currentCell.value;
    const row =
      current && table.store.states.data.value[current.rowIndex];
    if (
      current &&
      row &&
      table.store.isRowEditing(row) &&
      table.store.canEditCell(current.rowIndex, current.colIndex)
    ) {
      table.store.setRowEditingCell(current.rowIndex, current.colIndex);
      return;
    }
    table.store.focusGrid();
  }

  /** row 模式中单格编辑器打开期间的按键 */
  function handleRowEditingKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape': {
        const current = table.store.states.editingCell.value;
        if (current) table.store.cancelRowEdit(current.rowIndex);
        table.store.focusGrid();
        event.preventDefault();
        event.stopPropagation();
        break;
      }
      case 'Enter': {
        if (event.isComposing) return;
        const target = event.target as HTMLElement | null;
        if (
          target instanceof HTMLTextAreaElement &&
          (event.shiftKey || event.altKey)
        ) {
          return;
        }
        table.store.clearRowEditingCell(true);
        table.store.moveCurrent(1, 0);
        openRowEditorAtCurrentOrFocusGrid();
        event.preventDefault();
        break;
      }
      case 'Tab': {
        table.store.clearRowEditingCell(true);
        table.store.moveSequential(event.shiftKey ? -1 : 1);
        openRowEditorAtCurrentOrFocusGrid();
        event.preventDefault();
        break;
      }
      default:
        break;
    }
  }

  /** Tab / Esc：任何编辑模式、任何焦点位置都由网格统一拦截，不因焦点落在输入框内而被放过 */
  function handleGlobalKey(event: KeyboardEvent): boolean {
    const mode = table.store.states.editMode.value ?? 'cell';

    if (event.key === 'Escape') {
      const current = table.store.states.currentCell.value;
      const row =
        mode === 'row' && current
          ? table.store.states.data.value[current.rowIndex]
          : undefined;
      if (mode === 'row' && current && row && table.store.isRowEditing(row)) {
        table.store.cancelRowEdit(current.rowIndex);
      }
      table.store.focusGrid();
      event.preventDefault();
      return true;
    }

    if (event.key === 'Tab') {
      table.store.moveSequential(event.shiftKey ? -1 : 1);
      if (mode === 'cell') table.store.focusGrid();
      else table.store.focusCurrentCellEditor();
      event.preventDefault();
      return true;
    }

    return false;
  }

  /** 非编辑态的导航 / 进编 / 撤销重做按键；焦点在编辑器控件内部时不接管 */
  function handleBuiltinNavigation(event: KeyboardEvent): boolean {
    const mode = table.store.states.editMode.value ?? 'cell';
    const ctrl = event.ctrlKey || event.metaKey;
    const current = table.store.states.currentCell.value;

    const handled = (): true => {
      event.preventDefault();
      return true;
    };
    /** row/table 模式下编辑器随格常驻，移动高亮态后需把真实 DOM 焦点同步过去 */
    const syncFocus = () => {
      if (mode !== 'cell') table.store.focusCurrentCellEditor();
    };

    const key = event.key.toLowerCase();
    if (ctrl && !event.shiftKey && key === 'z') {
      if (!table.store.canUndo.value) return false;
      table.store.undo();
      return handled();
    }
    if (
      ctrl &&
      ((event.shiftKey && key === 'z') || (!event.shiftKey && key === 'y'))
    ) {
      if (!table.store.canRedo.value) return false;
      table.store.redo();
      return handled();
    }

    switch (event.key) {
      case 'ArrowUp':
        table.store.moveCurrent(-1, 0);
        syncFocus();
        return handled();
      case 'ArrowDown':
        table.store.moveCurrent(1, 0);
        syncFocus();
        return handled();
      case 'ArrowLeft':
        table.store.moveCurrent(0, -1);
        syncFocus();
        return handled();
      case 'ArrowRight':
        table.store.moveCurrent(0, 1);
        syncFocus();
        return handled();
      case 'Home':
        if (ctrl) table.store.moveToTableCorner(false);
        else table.store.moveToRowEdge(false);
        syncFocus();
        return handled();
      case 'End':
        if (ctrl) table.store.moveToTableCorner(true);
        else table.store.moveToRowEdge(true);
        syncFocus();
        return handled();
      case 'Enter': {
        if (event.isComposing || !current) return false;
        if (
          mode === 'cell' &&
          table.store.canEditCell(current.rowIndex, current.colIndex)
        ) {
          table.store.startEdit(current.rowIndex, current.colIndex);
        } else {
          table.store.moveCurrent(1, 0);
          syncFocus();
        }
        return handled();
      }
      case 'F2': {
        if (!current) return false;
        if (mode === 'cell') table.store.startEdit(current.rowIndex, current.colIndex);
        return handled();
      }
      case 'Delete':
      case 'Backspace': {
        if (!current) return false;
        if (table.store.canEditCell(current.rowIndex, current.colIndex)) {
          table.store.clearCell(current.rowIndex, current.colIndex);
        }
        return handled();
      }
      default: {
        // 可打印字符：选中即输入（cell 模式全部可编辑列）；
        // 文本/数字编辑器以该字符为草稿覆盖原值，其余编辑器仅进入编辑态
        if (
          mode === 'cell' &&
          current &&
          isPrintableKey(event) &&
          table.store.canEditCell(current.rowIndex, current.colIndex)
        ) {
          const column = table.store.states.columns.value[current.colIndex]?.column;
          const draft = typedCharToDraft(column?.editor, event.key);
          if (draft === undefined) {
            table.store.startEdit(current.rowIndex, current.colIndex);
          } else {
            table.store.startEdit(current.rowIndex, current.colIndex, {
              defaultValue: draft,
            });
          }
          return handled();
        }
        return false;
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    const mode = table.store.states.editMode.value ?? 'cell';
    const [overrides, normals] = partition(
      getCustomHotkeys(),
      (h) => !!h.override,
    );

    // 1. 用户 override 热键：先于任何内置行为判定，任何编辑态 / 焦点位置都生效
    if (runHotkeyBindings(overrides, event)) return;

    // 2. cell / row 模式编辑器打开中：走独立的编辑态按键流（Tab/Enter/Esc 语义不同）
    if (mode === 'cell' && table.store.states.editingCell.value) {
      handleEditingKeydown(event);
      return;
    }
    if (mode === 'row' && table.store.states.editingCell.value) {
      handleRowEditingKeydown(event);
      return;
    }

    // 3. Tab / Esc：任何模式、任何焦点位置都由网格统一处理
    if (handleGlobalKey(event)) return;

    // 4. 焦点在编辑器控件内部时，方向键/字符输入等交还控件自身，不拦截
    if (!isFromEditorElement(event) && handleBuiltinNavigation(event)) return;

    // 5. 内置没处理时，才轮到用户普通热键
    runHotkeyBindings(normals, event);
  }

  return { handleKeydown };
}

import type { PlusTableProps } from '../types';
import type { EditingApi } from './editing';
import type { SelectionApi } from './selection';

export interface KeyboardOptions {
  props: PlusTableProps;
  selection: SelectionApi;
  editing: EditingApi;
  /** 清空活动格的值（Delete/Backspace） */
  clearCell: (rowIndex: number, colIndex: number) => void;
  /** 「选中即输入」：把首个字符转换为该列编辑器的草稿；undefined 表示仅进编不种入 */
  typedCharToDraft: (colIndex: number, char: string) => unknown;
}

function isFromEditorElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  return !!target?.closest('input, textarea, select, [contenteditable="true"]');
}

function isPrintableKey(event: KeyboardEvent): boolean {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}

/**
 * 仿 Excel 键盘流。监听挂在表格外层容器（tabindex=0），
 * 编辑器内的按键经冒泡到达这里，按编辑态分流处理。
 */
export function createKeyboard(options: KeyboardOptions) {
  const { props, selection, editing, clearCell, typedCharToDraft } = options;

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

  /** 非编辑态的导航 / 进编按键 */
  function onNavigationKeydown(event: KeyboardEvent) {
    // row/table 模式下编辑器常驻，编辑器内部的按键不接管
    if (isFromEditorElement(event)) return;

    const mode = props.editMode ?? 'cell';
    const ctrl = event.ctrlKey || event.metaKey;
    const active = selection.activeCell.value;

    const handled = () => event.preventDefault();

    switch (event.key) {
      case 'ArrowUp':
        selection.moveActive(-1, 0);
        return handled();
      case 'ArrowDown':
        selection.moveActive(1, 0);
        return handled();
      case 'ArrowLeft':
        selection.moveActive(0, -1);
        return handled();
      case 'ArrowRight':
        selection.moveActive(0, 1);
        return handled();
      case 'Tab':
        selection.moveSequential(event.shiftKey ? -1 : 1);
        return handled();
      case 'Home':
        if (ctrl) selection.moveToTableCorner(false);
        else selection.moveToRowEdge(false);
        return handled();
      case 'End':
        if (ctrl) selection.moveToTableCorner(true);
        else selection.moveToRowEdge(true);
        return handled();
      case 'Enter': {
        if (event.isComposing || !active) return;
        if (mode === 'cell' && editing.canEditCell(active.rowIndex, active.colIndex)) {
          editing.startEdit(active.rowIndex, active.colIndex);
        } else {
          selection.moveActive(1, 0);
        }
        return handled();
      }
      case 'F2': {
        if (!active) return;
        if (mode === 'cell') editing.startEdit(active.rowIndex, active.colIndex);
        return handled();
      }
      case 'Delete':
      case 'Backspace': {
        if (!active) return;
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
              initialValue: draft,
            });
          }
          handled();
        }
      }
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (editing.editingCell.value) onEditingKeydown(event);
    else onNavigationKeydown(event);
  }

  return { onKeydown };
}

export type KeyboardApi = ReturnType<typeof createKeyboard>;

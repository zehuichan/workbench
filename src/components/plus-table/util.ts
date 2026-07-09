import type { RowData, RowKey } from './table/defaults';
import type { PlusTableColumn } from './table-column/defaults';

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';

/** 撤销重做栈上限（组件内部常量，不对外暴露） */
export const HISTORY_STACK_LIMIT = 50;

const NATIVE_RENDER_COLUMN_TYPES = ['selection', 'index', 'expand'] as const;

export const SPECIAL_COLUMN_TYPES = [
  ...NATIVE_RENDER_COLUMN_TYPES,
  'operation',
] as const;

interface ColumnTypeLike {
  type?: string;
}

export function isSpecialColumn(column: ColumnTypeLike): boolean {
  return (
    !!column.type &&
    (SPECIAL_COLUMN_TYPES as readonly string[]).includes(column.type)
  );
}

export function isNativeRenderColumn(column: ColumnTypeLike): boolean {
  return (
    !!column.type &&
    (NATIVE_RENDER_COLUMN_TYPES as readonly string[]).includes(column.type)
  );
}

export function getRowIdentity<T extends RowData = RowData>(
  row: T,
  rowKey: RowKey<T>,
): string {
  const raw = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
  return String(raw);
}

export function cellKey(rowKey: string, prop: string): string {
  return `${rowKey}:${prop}`;
}

export function devWarn(message: string): void {
  if ((import.meta as any)?.env?.DEV) console.warn(message);
}

export function resolveEditable<T extends RowData = RowData>(
  row: T,
  rowIndex: number,
  column: PlusTableColumn<T>,
): boolean {
  if (!column.prop) return false;
  const editable = column.editable;
  return typeof editable === 'function'
    ? !!editable({ row, rowIndex })
    : !!editable;
}

export const FOCUSABLE_EDITOR_SELECTOR =
  'input, textarea, [tabindex]:not([tabindex="-1"])';

function isTextInput(
  el: HTMLElement,
): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

export interface FocusEditorOptions {
  preventScroll?: boolean;
  select?: 'all' | 'end';
  skipIfFocused?: boolean;
}

export function focusEditorElement(
  root: HTMLElement | null | undefined,
  options: FocusEditorOptions = {},
): boolean {
  const input = root?.querySelector<HTMLElement>(FOCUSABLE_EDITOR_SELECTOR);
  if (!input) return false;
  if (options.skipIfFocused && document.activeElement === input) return true;

  input.focus({ preventScroll: options.preventScroll });
  if (options.select && isTextInput(input)) {
    try {
      if (options.select === 'end') {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      } else {
        input.select();
      }
    } catch {
      // number 等输入类型不支持 selection API
    }
  }
  return true;
}

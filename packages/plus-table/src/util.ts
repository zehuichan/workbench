import type { RowData, RowKey } from './table/defaults';

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';

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

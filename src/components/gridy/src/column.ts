import type { GridyColumn } from './types';

/** 四种特殊列对应的宽度 / 对齐 class；数据列为空串 */
const SPECIAL_COLUMN_CLASS = {
  action: 'gridy__action',
  expand: 'gridy__expand',
  index: 'gridy__index',
  selection: 'gridy__select',
} as const;

export function columnKey(column: GridyColumn): string {
  return column.type === undefined ? column.field : column.type;
}

export function specialClass(column: GridyColumn): string {
  return column.type === undefined ? '' : SPECIAL_COLUMN_CLASS[column.type];
}

export function alignClass(column: GridyColumn, cell: 'td' | 'th'): string {
  return column.align ? `gridy__${cell}--${column.align}` : '';
}

export function widthStyle(column: GridyColumn) {
  return column.width === undefined ? undefined : { width: `${column.width}px` };
}

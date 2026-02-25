import type { ReTableNextColumn, RowData } from '../types'

/**
 * 获取单元格原始值
 */
export function getCellValue<T = RowData>(
  row: T,
  column: ReTableNextColumn<T>,
): any {
  if (!column.prop) return undefined
  return (row as Record<string, any>)[column.prop]
}

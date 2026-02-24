import { h, type VNode } from 'vue'

import { isFunction } from '@/utils'

import type { CellContext, ReTableNextColumn, RowData } from '../types'

/**
 * 单元格渲染分发
 *
 * 渲染优先级：render > formatter > 原始值
 * （插槽优先级在模板中处理，高于 render）
 */
export function renderCell<T = RowData>(
  ctx: CellContext<T>,
): VNode | string {
  const { column, row, value, rowIndex, colIndex } = ctx

  // 1. render 函数
  if (isFunction(column.render)) {
    return column.render({ row, column, value, rowIndex, colIndex })
  }

  // 2. formatter
  if (isFunction(column.formatter)) {
    return String(column.formatter(value, row, rowIndex) ?? '')
  }

  // 3. 原始值
  return value == null ? '' : String(value)
}

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

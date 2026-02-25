import type { VNode } from 'vue'

import { isFunction } from '@/utils'

import type { ReTableNextColumn, RowData } from '../types'

/**
 * 表头渲染辅助
 * 优先级：renderHeader 函数 > label 文本
 */
export function renderHeader<T = RowData>(
  column: ReTableNextColumn<T>,
): VNode | string {
  if (isFunction(column.renderHeader)) {
    return column.renderHeader(column)
  }
  return column.label ?? ''
}

import type { VNode } from 'vue'

import { isFunction } from '@/utils'

import type { ReTableNextColumn, RowData } from '../types'

/**
 * 表头渲染分发
 *
 * 优先级：renderHeader > label 文本
 * （插槽优先级在模板中处理，高于 renderHeader）
 */
export function renderHeader<T = RowData>(
  column: ReTableNextColumn<T>,
): VNode | string {
  // 1. renderHeader 函数
  if (isFunction(column.renderHeader)) {
    return column.renderHeader(column)
  }

  // 2. label 文本
  return column.label ?? ''
}

import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'

import { isObject } from '@/utils'

import type { ReTableNextColumn } from '../types'

/**
 * 需要从列配置中过滤的自定义属性（非 el-table-column 原生 prop）
 * el-table / el-table-column 自带 showOverflowTooltip 等，无需 provide 默认列绑定
 */
const CUSTOM_COLUMN_KEYS: ReadonlySet<string> = new Set([
  'key',
  'render',
  'renderHeader',
  'formatter',
  'editable',
  'component',
  'componentProps',
  'hidden',
  'rules',
  'children',
])

/**
 * 列绑定提取 composable
 *
 * 过滤自定义属性，只保留 el-table-column 可接受的 props（含 showOverflowTooltip 等原生属性）
 */
export function useColumnBind(
  column: MaybeRef<ReTableNextColumn>,
): ComputedRef<Record<string, any>> {
  return computed(() => {
    const raw = unref(column)
    if (!isObject(raw)) return {} as Record<string, any>

    const filtered: Record<string, any> = {}
    for (const key of Object.keys(raw)) {
      if (!CUSTOM_COLUMN_KEYS.has(key)) {
        filtered[key] = raw[key]
      }
    }
    return filtered
  })
}

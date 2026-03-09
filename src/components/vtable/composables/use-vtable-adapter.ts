import { computed, type ComputedRef } from 'vue'

import type { VTablePlusColumn } from '../types'
import type { VTableHeaderItem } from '../types'

export interface UseVTableAdapterOptions<T = Record<string, unknown>> {
  columns: ComputedRef<VTablePlusColumn<T>[]>
  data: ComputedRef<T[]>
}

/**
 * 过滤出有 prop 的列（排除 type 列如 expand/selection/index）
 */
function getDataColumns<T>(columns: VTablePlusColumn<T>[]): VTablePlusColumn<T>[] {
  return columns.filter((c) => c.prop && !c.hidden)
}

function toNumber(val: number | string | undefined): number | undefined {
  if (val === undefined || val === null) return undefined
  const n = typeof val === 'number' ? val : parseFloat(String(val))
  return Number.isNaN(n) ? undefined : n
}

/**
 * columns + data → VTable option.header + records
 */
export function useVTableAdapter<T extends Record<string, unknown>>(
  options: UseVTableAdapterOptions<T>,
) {
  const { columns, data } = options

  const tableOption = computed(() => {
    const cols = getDataColumns(columns.value)
    // 二维数组 records 时，field 必须为 '0'/'1'/... 对应列索引
    const header: VTableHeaderItem[] = cols.map((col, idx) => {
      const item: VTableHeaderItem = {
        field: String(idx),
        caption: col.label ?? col.prop,
      }
      const w = toNumber(col.width)
      if (w != null) item.width = w
      const minW = toNumber(col.minWidth)
      if (minW != null) item.minWidth = minW
      const maxW = toNumber(col.maxWidth)
      if (maxW != null) item.maxWidth = maxW
      if (col.sortable) {
        item.sort =
          col.sortable === 'custom'
            ? true
            : { order: 'asc' as const }
      }
      return item
    })
    return {
      header,
    }
  })

  const records = computed(() => {
    const cols = getDataColumns(columns.value)
    const rows = data.value
    return rows.map((row) =>
      cols.map((col) => {
        const val = row[col.prop]
        return val === undefined || val === null ? '' : val
      }),
    )
  })

  return {
    tableOption,
    records,
  }
}

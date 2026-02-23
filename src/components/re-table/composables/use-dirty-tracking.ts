import { cloneDeep } from 'es-toolkit'
import { isEqual } from 'es-toolkit'
import { ref, type Ref, type ShallowRef } from 'vue'

import type { RowData } from '../types'

export interface UseDirtyTrackingOptions {
  data: Ref<RowData[]>
  cachedData: ShallowRef<RowData[]>
}

/** 脏单元格 key 格式: `${rowIndex}:${prop}` */
export type DirtyCellKey = string

export function useDirtyTracking(options: UseDirtyTrackingOptions) {
  const { data, cachedData } = options

  const dirtyCells = ref(new Set<DirtyCellKey>())

  /**
   * 增量更新：cell-value-change 时 O(1) 单点对比
   */
  function markDirty(rowIndex: number, prop: string): void {
    const oldVal = cachedData.value[rowIndex]?.[prop]
    const newVal = data.value[rowIndex]?.[prop]
    const key: DirtyCellKey = `${rowIndex}:${prop}`
    if (isEqual(oldVal, newVal)) {
      dirtyCells.value.delete(key)
    } else {
      dirtyCells.value.add(key)
    }
    // 触发响应式更新
    dirtyCells.value = new Set(dirtyCells.value)
  }

  /**
   * 批量重置：将当前 data 视为新基线，同步 cachedData 并清空脏标记
   */
  function resetTracking(): void {
    cachedData.value = cloneDeep(data.value)
    dirtyCells.value = new Set()
  }

  function getDirtyCells(): Set<DirtyCellKey> {
    return new Set(dirtyCells.value)
  }

  return { dirtyCells, markDirty, resetTracking, getDirtyCells }
}

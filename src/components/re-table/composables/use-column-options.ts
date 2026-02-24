import { computed, ref, watch, type Ref } from 'vue'

import { isBoolean, isFunction } from '@/utils'

import type { ReTableColumn } from '../types'

export interface UseColumnOptionsOptions {
  initialColumns: Ref<ReTableColumn[]>
  tableKey?: string
  storage?: 'local' | 'session' | false
}

interface PersistedColumnConfig {
  prop: string
  hidden: boolean
  order: number
}

function getStorageKey(tableKey: string): string {
  return `re-table:${tableKey}:columns`
}

function getStorage(
  type: 'local' | 'session',
): Storage | null {
  try {
    return type === 'local' ? localStorage : sessionStorage
  } catch {
    return null
  }
}

export function useColumnOptions(options: UseColumnOptionsOptions) {
  const { initialColumns, tableKey, storage = false } = options

  const columnOrder = ref<string[]>([])
  const hiddenColumns = ref(new Set<string>())

  function loadFromStorage(): void {
    if (!storage || !tableKey) return
    const store = getStorage(storage)
    if (!store) return

    try {
      const raw = store.getItem(getStorageKey(tableKey))
      if (!raw) return
      const configs: PersistedColumnConfig[] = JSON.parse(raw)

      const order: string[] = []
      const hidden = new Set<string>()

      for (const config of configs.sort((a, b) => a.order - b.order)) {
        order.push(config.prop)
        if (config.hidden) hidden.add(config.prop)
      }

      columnOrder.value = order
      hiddenColumns.value = hidden
    } catch {
      // ignore parse errors
    }
  }

  function saveToStorage(): void {
    if (!storage || !tableKey) return
    const store = getStorage(storage)
    if (!store) return

    const cols = visibleColumns.value
    const all = initialColumns.value
    const configs: PersistedColumnConfig[] = []

    const orderedProps = columnOrder.value.length > 0 ? columnOrder.value : all.map((c) => c.prop).filter(Boolean) as string[]

    orderedProps.forEach((prop, index) => {
      configs.push({
        prop,
        hidden: hiddenColumns.value.has(prop),
        order: index,
      })
    })

    try {
      store.setItem(getStorageKey(tableKey), JSON.stringify(configs))
    } catch {
      // ignore quota errors
    }
  }

  const isColumnHidden = (column: ReTableColumn): boolean => {
    if (column.prop && hiddenColumns.value.has(column.prop)) return true
    if (isBoolean(column.hidden)) return column.hidden
    if (isFunction(column.hidden)) return column.hidden(column)
    return false
  }

  const visibleColumns = computed(() => {
    const cols = initialColumns.value
    const order = columnOrder.value

    let ordered: ReTableColumn[]
    if (order.length > 0) {
      const colMap = new Map<string, ReTableColumn>()
      const specialCols: ReTableColumn[] = []

      for (const col of cols) {
        if (col.prop) {
          colMap.set(col.prop, col)
        } else {
          specialCols.push(col)
        }
      }

      ordered = [...specialCols]
      for (const prop of order) {
        const col = colMap.get(prop)
        if (col) ordered.push(col)
        colMap.delete(prop)
      }
      for (const col of colMap.values()) {
        ordered.push(col)
      }
    } else {
      ordered = cols
    }

    return ordered.filter((col) => !isColumnHidden(col))
  })

  function toggleColumn(prop: string, visible: boolean): void {
    const next = new Set(hiddenColumns.value)
    if (visible) {
      next.delete(prop)
    } else {
      next.add(prop)
    }
    hiddenColumns.value = next
    saveToStorage()
  }

  function reorderColumns(fromIndex: number, toIndex: number): void {
    const cols = initialColumns.value.map((c) => c.prop).filter(Boolean) as string[]
    const order = columnOrder.value.length > 0 ? [...columnOrder.value] : cols

    if (fromIndex < 0 || fromIndex >= order.length || toIndex < 0 || toIndex >= order.length) return

    const [item] = order.splice(fromIndex, 1)
    order.splice(toIndex, 0, item)
    columnOrder.value = order
    saveToStorage()
  }

  function resetColumns(): void {
    columnOrder.value = []
    hiddenColumns.value = new Set()
    if (storage && tableKey) {
      const store = getStorage(storage)
      store?.removeItem(getStorageKey(tableKey))
    }
  }

  function addColumn(column: ReTableColumn, index?: number): void {
    const cols = [...initialColumns.value]
    if (index !== undefined && index >= 0) {
      cols.splice(index, 0, column)
    } else {
      cols.push(column)
    }
    initialColumns.value = cols
  }

  function removeColumn(prop: string): void {
    initialColumns.value = initialColumns.value.filter((c) => c.prop !== prop)
    const next = new Set(hiddenColumns.value)
    next.delete(prop)
    hiddenColumns.value = next
    columnOrder.value = columnOrder.value.filter((p) => p !== prop)
    saveToStorage()
  }

  function updateColumn(prop: string, config: Partial<ReTableColumn>): void {
    initialColumns.value = initialColumns.value.map((col) =>
      col.prop === prop ? { ...col, ...config } : col,
    )
  }

  function getColumnConfig(): ReTableColumn[] {
    return visibleColumns.value
  }

  /** 获取所有有 prop 的列（含隐藏），按顺序排列，用于列设置面板 */
  function getOrderedColumnsWithProp(): ReTableColumn[] {
    const cols = initialColumns.value
    const props = columnOrder.value.length > 0
      ? columnOrder.value
      : cols.map((c) => c.prop).filter(Boolean) as string[]
    const colMap = new Map<string, ReTableColumn>()
    for (const col of cols) {
      if (col.prop) colMap.set(col.prop, col)
    }
    const result: ReTableColumn[] = []
    for (const p of props) {
      const col = colMap.get(p)
      if (col) {
        result.push(col)
        colMap.delete(p)
      }
    }
    // 追加未在 order 中的列（如 schema 变更后新增的列，或 storage 存了过期的 prop）
    for (const col of colMap.values()) {
      result.push(col)
    }
    return result
  }

  loadFromStorage()

  return {
    visibleColumns,
    hiddenColumns,
    toggleColumn,
    reorderColumns,
    resetColumns,
    addColumn,
    removeColumn,
    updateColumn,
    getColumnConfig,
    getOrderedColumnsWithProp,
    isColumnHidden: (prop: string) => hiddenColumns.value.has(prop),
  }
}

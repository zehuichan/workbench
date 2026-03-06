import { computed, type Ref } from 'vue'

import type { RowData } from '../types'

export interface UseClassNamesOptions {
  cellActive: Ref<boolean>
  rowActive: Ref<boolean>
  activeRowIndex: Ref<number>
  activeColIndex: Ref<number>
  /** 脏数据 Map（仅用于建立响应式依赖） */
  dirtyCells: Ref<Map<number, Set<string>>>
  getCellClassName: (payload: { row: RowData; column: any; rowIndex: number; columnIndex: number }) => string
  getRowClassName: (payload: { row: RowData; rowIndex: number }) => string
  getErrorForCell: (rowIndex: number, prop: string) => string | undefined
  isCellDirty: (rowIndex: number, prop: string) => boolean
  isRowDirty: (rowIndex: number) => boolean
}

export function useClassNames(options: UseClassNamesOptions) {
  const {
    cellActive,
    rowActive,
    activeRowIndex,
    activeColIndex,
    dirtyCells,
    getCellClassName,
    getRowClassName,
    getErrorForCell,
    isCellDirty,
    isRowDirty,
  } = options

  function getCellClassNameCombined(payload: {
    row: RowData
    column: any
    rowIndex: number
    columnIndex: number
  }): string {
    const classes: string[] = []
    const navClass = getCellClassName(payload)
    if (navClass) classes.push(navClass)
    const prop = payload.column?.property
    const globalRowIndex = payload.rowIndex
    if (prop && getErrorForCell(globalRowIndex, prop)) {
      classes.push('plus-table-cell--error')
    }
    if (prop && isCellDirty(globalRowIndex, prop)) {
      classes.push('plus-table-cell--dirty')
    }
    return classes.join(' ')
  }

  function getRowClassNameCombined(payload: {
    row: RowData
    rowIndex: number
  }): string {
    const classes: string[] = []
    const navClass = getRowClassName(payload)
    if (navClass) classes.push(navClass)
    if (isRowDirty(payload.rowIndex)) {
      classes.push('plus-table-row--dirty')
    }
    return classes.join(' ')
  }

  /** el-table 只在 prop 引用变化时重新应用类名；此依赖数组确保导航/脏数据变化时触发重新渲染 */
  const classNameDeps = computed(() => [activeRowIndex.value, activeColIndex.value, dirtyCells.value])

  const rowClassNameBinding = computed(() =>
    classNameDeps.value && rowActive.value ? getRowClassNameCombined : undefined,
  )

  const cellClassNameBinding = computed(() =>
    classNameDeps.value && cellActive.value ? getCellClassNameCombined : undefined,
  )

  return {
    rowClassNameBinding,
    cellClassNameBinding,
  }
}

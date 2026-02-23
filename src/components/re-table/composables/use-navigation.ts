import { nextTick, type Ref } from 'vue'

import type { CellMeta, ReTableColumn } from '../types'
import { SPECIAL_COLUMN_TYPES } from '../constants'

export interface UseNavigationOptions {
  data: Ref<any[]>
  columns: Ref<ReTableColumn[]>
  cellMeta: Ref<CellMeta>
  tableEl: Ref<HTMLElement | null>
}

function isSpecialColumn(column: ReTableColumn): boolean {
  return SPECIAL_COLUMN_TYPES.includes(column.type as any)
}

export function useNavigation(options: UseNavigationOptions) {
  const { data, columns, cellMeta, tableEl } = options

  function navigate(
    rowDelta: number,
    colDelta: number,
  ): { row: number; col: number } {
    const totalRows = data.value.length
    const totalCols = columns.value.length

    if (totalRows === 0 || totalCols === 0) {
      return { row: -1, col: -1 }
    }

    let { row, col } = cellMeta.value
    let newRow = row + rowDelta
    let newCol = col + colDelta
    let attempts = 0
    const maxAttempts = totalRows * totalCols

    while (attempts < maxAttempts) {
      if (newCol < 0) {
        newRow -= 1
        newCol = totalCols - 1
      } else if (newCol >= totalCols) {
        newRow += 1
        newCol = 0
      }

      if (newRow < 0) {
        newRow = totalRows - 1
      } else if (newRow >= totalRows) {
        newRow = 0
      }

      const colDef = columns.value[newCol]
      if (!colDef || !isSpecialColumn(colDef)) {
        return { row: newRow, col: newCol }
      }

      newCol += colDelta || 1
      attempts++
    }

    return { row: -1, col: -1 }
  }

  function navigateToFirst(): { row: number; col: number } {
    const firstCol = columns.value.findIndex((c) => !isSpecialColumn(c))
    return { row: 0, col: firstCol >= 0 ? firstCol : 0 }
  }

  function navigateToLast(): { row: number; col: number } {
    const totalRows = data.value.length
    let lastCol = columns.value.length - 1
    while (lastCol >= 0 && isSpecialColumn(columns.value[lastCol]!)) {
      lastCol--
    }
    return { row: Math.max(0, totalRows - 1), col: Math.max(0, lastCol) }
  }

  function navigateToRowStart(): { row: number; col: number } {
    const { row } = cellMeta.value
    const firstCol = columns.value.findIndex((c) => !isSpecialColumn(c))
    return { row, col: firstCol >= 0 ? firstCol : 0 }
  }

  function navigateToRowEnd(): { row: number; col: number } {
    const { row } = cellMeta.value
    let lastCol = columns.value.length - 1
    while (lastCol >= 0 && isSpecialColumn(columns.value[lastCol]!)) {
      lastCol--
    }
    return { row, col: Math.max(0, lastCol) }
  }

  function focusCell(scrollIntoView = false) {
    const { row, col, editing } = cellMeta.value
    if (row < 0 || col < 0) return

    nextTick(() => {
      const el = tableEl.value
      if (!el) return

      const cell = el.querySelector(`.re-table-cell-${row}-${col}`)
      if (!cell) return

      if (editing) {
        const tryFocus = (): boolean => {
          console.log('tryFocus');
          const input = cell.querySelector(
            'input, textarea, [contenteditable="true"]',
          ) as HTMLElement | null
          if (input) {
            input.focus({ preventScroll: true })
            return true
          }
          return false
        }
        if (!tryFocus()) {
          // 编辑组件首次挂载可能需要多帧，重试
          let retries = 5
          const retry = () => {
            if (tryFocus() || --retries <= 0) return
            requestAnimationFrame(retry)
          }
          requestAnimationFrame(retry)
        }
      }

      if (scrollIntoView) {
        const rowEl = el.querySelector(`.re-table-row-${row}`)
        rowEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    })
  }

  return {
    navigate,
    navigateToFirst,
    navigateToLast,
    navigateToRowStart,
    navigateToRowEnd,
    focusCell,
  }
}

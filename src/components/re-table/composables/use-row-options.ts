import { type Ref } from 'vue'

import { cloneDeep } from 'es-toolkit'

import type { ReTableColumn, RowData } from '../types'

export interface UseRowOptionsOptions {
  data: Ref<RowData[]>
  columns: Ref<ReTableColumn[]>
  rowKey?: string | ((row: RowData) => string | number)
}

export function useRowOptions(options: UseRowOptionsOptions) {
  const { data, columns } = options

  function insertRow(index: number, row?: Partial<RowData>): void {
    const newRow: RowData = {}
    for (const col of columns.value) {
      if (col.prop) newRow[col.prop] = undefined
    }
    Object.assign(newRow, row)

    data.value.splice(index, 0, newRow)
  }

  function deleteRow(index: number | number[]): void {
    const arr = data.value
    const indices = Array.isArray(index) ? [...index].sort((a, b) => b - a) : [index]
    for (const i of indices) {
      if (i >= 0 && i < arr.length) {
        arr.splice(i, 1)
      }
    }
  }

  function moveRow(from: number, to: number): void {
    const arr = data.value
    if (!arr || from < 0 || from >= arr.length || to < 0 || to >= arr.length) return
    const [item] = arr.splice(from, 1)
    if (item) arr.splice(to, 0, item)
  }

  function duplicateRow(index: number): void {
    const arr = data.value
    if (!arr || index < 0 || index >= arr.length) return
    const row = arr[index]
    if (row) {
      const clone = cloneDeep(row)
      arr.splice(index + 1, 0, clone)
    }
  }

  function getModifiedRows(): {
    added: RowData[]
    modified: RowData[]
    deleted: RowData[]
  } {
    return { added: [], modified: [], deleted: [] }
  }

  return { insertRow, deleteRow, moveRow, duplicateRow, getModifiedRows }
}

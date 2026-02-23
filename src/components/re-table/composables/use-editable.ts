import { ref, type Ref } from 'vue'

import { cloneDeep } from 'es-toolkit'
import { isFunction, isString } from '@/utils'

import type { CellEditPayload, ReTableColumn, ReTableProps, RowData } from '../types'
import { SPECIAL_COLUMN_TYPES } from '../constants'

export interface CellValueChangePayload extends CellEditPayload {
  prop: string
  value: any
  oldValue: any
}

export type EditEmitFn = {
  (event: 'cell-edit-start', payload: CellEditPayload): void
  (event: 'cell-edit-end', payload: CellEditPayload & { value: any; oldValue: any }): void
  (event: 'cell-edit-cancel', payload: CellEditPayload): void
  (event: 'cell-value-change', payload: CellValueChangePayload): void
  (event: 'row-edit-start', payload: { row: RowData; rowIndex: number }): void
  (event: 'row-edit-end', payload: { row: RowData; rowIndex: number }): void
}

export interface UseEditableOptions {
  editableMode: Ref<ReTableProps['editable']>
  activeRow: Ref<number>
  activeCol: Ref<number>
  isEditing: Ref<boolean>
  data: Ref<RowData[]>
  columns: Ref<ReTableColumn[]>
  emit: EditEmitFn
  beforeCellEdit?: (payload: CellEditPayload) => boolean | void
}

function resolveColumnFlag(
  flag: boolean | ((row: any) => boolean) | undefined,
  row: any,
): boolean {
  if (isFunction(flag)) return flag(row)
  return flag === true
}

export function useEditable(options: UseEditableOptions) {
  const { editableMode, activeRow, activeCol, isEditing, data, columns, emit, beforeCellEdit } = options

  /** 编辑开始时缓存的行快照，用于 confirm/cancel 时的 oldValue 与回滚 */
  const editSnapshot = ref<{ row: RowData; rowIndex: number } | null>(null)

  function getEditPayload(): CellEditPayload | null {
    const rowIndex = activeRow.value
    const colIndex = activeCol.value
    if (rowIndex < 0 || colIndex < 0) return null
    const row = data.value[rowIndex]
    const column = columns.value[colIndex]
    if (!row || !column) return null
    return { row, column, rowIndex, colIndex }
  }

  function startEdit(rowIndex?: number, colIndex?: number): boolean {
    if (editableMode.value === false) return false

    const ri = rowIndex ?? activeRow.value
    const ci = colIndex ?? activeCol.value
    if (ri < 0 || ci < 0) return false

    const row = data.value[ri]
    const column = columns.value[ci]
    if (!row || !column) return false

    if (resolveColumnFlag(column.disabled, row) || resolveColumnFlag(column.readonly, row)) {
      return false
    }

    const payload: CellEditPayload = { row, column, rowIndex: ri, colIndex: ci }

    if (beforeCellEdit && beforeCellEdit(payload) === false) {
      return false
    }

    activeRow.value = ri
    activeCol.value = ci
    isEditing.value = true
    editSnapshot.value = { row: cloneDeep(row), rowIndex: ri }
    emit('cell-edit-start', payload)

    if (editableMode.value === 'row') {
      emit('row-edit-start', { row, rowIndex: ri })
    }

    return true
  }

  function confirmEdit(): void {
    const payload = getEditPayload()
    if (!payload) return

    const { row, column, rowIndex, colIndex } = payload
    const prop = column.prop
    if (!prop) return

    const snapshot = editSnapshot.value?.rowIndex === rowIndex ? editSnapshot.value.row : null
    const oldValue = snapshot ? snapshot[prop] : undefined
    const value = row[prop]

    isEditing.value = false
    editSnapshot.value = null

    emit('cell-edit-end', { ...payload, value, oldValue })

    if (value !== oldValue) {
      emit('cell-value-change', { ...payload, prop, value, oldValue })
    }

    if (editableMode.value === 'row') {
      emit('row-edit-end', { row, rowIndex })
    }
  }

  function cancelEdit(): void {
    const payload = getEditPayload()
    if (!payload) {
      isEditing.value = false
      editSnapshot.value = null
      return
    }

    const { row, column, rowIndex } = payload
    const prop = column.prop

    if (prop) {
      const snapshot = editSnapshot.value?.rowIndex === rowIndex ? editSnapshot.value.row : null
      if (snapshot && prop in snapshot) {
        row[prop] = snapshot[prop]
      }
    }

    isEditing.value = false
    editSnapshot.value = null
    emit('cell-edit-cancel', payload)
  }

  function shouldEdit(
    rowIndex: number,
    colIndex: number,
    column: ReTableColumn,
  ): boolean {
    if (SPECIAL_COLUMN_TYPES.includes(column.type as any)) return false

    if (column.editable === true) return true
    if (column.editable === false) return false
    if (isFunction(column.editable)) {
      const row = data.value[rowIndex]
      if (row && !column.editable(row)) return false
    }

    const mode = editableMode.value
    const row = data.value[rowIndex]

    if (mode === true) return true

    if (row && (resolveColumnFlag(column.disabled, row) || resolveColumnFlag(column.readonly, row))) {
      return false
    }

    if (isString(mode)) {
      if (mode === 'row') {
        return activeRow.value === rowIndex && isEditing.value
      }
      if (mode === 'cell' || mode === 'manual') {
        return (
          activeRow.value === rowIndex &&
          activeCol.value === colIndex &&
          isEditing.value
        )
      }
    }

    return false
  }

  return { startEdit, confirmEdit, cancelEdit, shouldEdit }
}

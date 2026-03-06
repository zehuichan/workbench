import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type { PlusTableColumn, RowData } from '../types'

export interface EditCellPayload {
  row: RowData
  column: PlusTableColumn
  value: any
  rowIndex: number
  colIndex: number
}

export interface EditValueChangePayload extends EditCellPayload {
  oldValue: any
  newValue: any
}

export interface UseEditableOptions {
  data: Ref<RowData[]>
  navigableColumns: Ref<PlusTableColumn[]>
  activeRowIndex: Ref<number>
  activeColIndex: Ref<number>
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>
  /** 单元格联动：依赖 disabled 为 true 时阻止进入编辑 */
  isDepDisabled?: (rowIndex: number, colProp: string) => boolean
  onEditStart?: (payload: EditCellPayload) => void
  onEditEnd?: (payload: EditCellPayload) => void
  onValueChange?: (payload: EditValueChangePayload) => void
}

export interface EditChangeRecord {
  rowIndex: number
  colProp: string
  oldValue: any
  newValue: any
}

export type EditMode = 'none' | 'cell' | 'row' | 'manual' | 'all'

function resolveEditMode(editable: boolean | 'row' | 'cell' | 'manual'): EditMode {
  if (editable === false) return 'none'
  if (editable === true) return 'all'
  return editable
}

export function useEditable(options: UseEditableOptions) {
  const {
    data,
    navigableColumns,
    activeRowIndex,
    activeColIndex,
    editable,
    isDepDisabled,
    onEditStart,
    onEditEnd,
    onValueChange,
  } = options

  const isEditing = ref(false)
  const editingRowIndex = ref(-1)
  /** cell/manual: 正在编辑的列; row: 触发编辑的列（决定聚焦） */
  const editingColIndex = ref(-1)

  /** 行内所有正在编辑的列值（row 模式多列，cell/manual 单列） */
  const editingValues = ref<Record<string, any>>({})
  const originalValues = ref<Record<string, any>>({})

  const editMode: ComputedRef<EditMode> = computed(() => resolveEditMode(editable.value))

  /** 是否允许自动触发编辑（F2 / Enter / 双击 / 可打印字符） */
  const autoTriggerEnabled = computed(() =>
    editMode.value === 'cell' || editMode.value === 'row',
  )

  const editingColumn = computed(() =>
    editingColIndex.value >= 0
      ? (navigableColumns.value[editingColIndex.value] ?? null)
      : null,
  )

  function isCellEditable(rowIndex: number, colIndex: number): boolean {
    if (editMode.value === 'none') return false

    const column = navigableColumns.value[colIndex]
    if (!column) return false

    const row = data.value[rowIndex]
    if (!row) return false

    if (column.editable === false) return false
    if (typeof column.editable === 'function' && !column.editable(row)) return false
    if (isDepDisabled?.(rowIndex, column.prop ?? '')) return false

    return editMode.value !== 'none'
  }

  function startEdit(rowIndex?: number, colIndex?: number): void {
    const ri = rowIndex ?? activeRowIndex.value
    const ci = colIndex ?? activeColIndex.value
    if (ri < 0 || ci < 0) return
    if (editMode.value === 'none') return
    if (!isCellEditable(ri, ci)) return

    // 已在编辑同一行（row 模式仅更新聚焦列）
    if (isEditing.value && editingRowIndex.value === ri) {
      if (editMode.value === 'row') {
        editingColIndex.value = ci
        return
      }
      if (editingColIndex.value === ci) return
    }

    if (isEditing.value) confirmEdit()

    const row = data.value[ri]
    if (!row) return

    editingRowIndex.value = ri
    editingColIndex.value = ci

    if (editMode.value === 'row') {
      const vals: Record<string, any> = {}
      const origVals: Record<string, any> = {}
      for (let i = 0; i < navigableColumns.value.length; i++) {
        const col = navigableColumns.value[i]
        if (!col.prop) continue
        if (!isCellEditable(ri, i)) continue
        vals[col.prop] = row[col.prop]
        origVals[col.prop] = row[col.prop]
      }
      if (Object.keys(vals).length === 0) return
      editingValues.value = vals
      originalValues.value = origVals
    } else {
      const column = navigableColumns.value[ci]
      if (!column?.prop) return
      const value = row[column.prop]
      editingValues.value = { [column.prop]: value }
      originalValues.value = { [column.prop]: value }
    }

    isEditing.value = true

    const column = navigableColumns.value[ci]
    if (column) {
      const value = column.prop ? row[column.prop] : undefined
      onEditStart?.({ row, column, value, rowIndex: ri, colIndex: ci })
    }
  }

  function confirmEdit(): EditChangeRecord[] | null {
    if (!isEditing.value) return null

    const ri = editingRowIndex.value
    const row = data.value[ri]
    if (!row) {
      resetEdit()
      return null
    }

    const changes: EditChangeRecord[] = []

    for (const [prop, newValue] of Object.entries(editingValues.value)) {
      const oldValue = originalValues.value[prop]
      if (oldValue !== newValue) {
        row[prop] = newValue
        changes.push({ rowIndex: ri, colProp: prop, oldValue, newValue })

        const column = navigableColumns.value.find((c) => c.prop === prop)
        if (column) {
          const colIdx = navigableColumns.value.indexOf(column)
          onValueChange?.({
            row, column, oldValue, newValue, value: newValue,
            rowIndex: ri, colIndex: colIdx,
          })
        }
      }
    }

    const ci = editingColIndex.value
    const column = navigableColumns.value[ci]
    if (column) {
      onEditEnd?.({
        row, column,
        value: editingValues.value[column.prop ?? ''],
        rowIndex: ri, colIndex: ci,
      })
    }

    resetEdit()
    return changes.length > 0 ? changes : null
  }

  function cancelEdit(): void {
    if (!isEditing.value) return

    const ri = editingRowIndex.value
    const ci = editingColIndex.value
    const column = navigableColumns.value[ci]
    const row = data.value[ri]

    if (column && row) {
      onEditEnd?.({
        row, column,
        value: originalValues.value[column.prop ?? ''],
        rowIndex: ri, colIndex: ci,
      })
    }

    resetEdit()
  }

  function resetEdit(): void {
    isEditing.value = false
    editingRowIndex.value = -1
    editingColIndex.value = -1
    editingValues.value = {}
    originalValues.value = {}
  }

  // ──── 值访问 API ────

  function getEditingValue(colProp: string): any {
    return editingValues.value[colProp]
  }

  function setEditingValue(colProp: string, value: any): void {
    editingValues.value[colProp] = value
  }

  /** 更新当前聚焦列的编辑值（热键引擎使用） */
  function updateEditingValue(value: any): void {
    const prop = editingColumn.value?.prop
    if (prop) editingValues.value[prop] = value
  }

  /** 向后兼容：当前聚焦列的编辑值 */
  const editingValue = computed({
    get: () => {
      const prop = editingColumn.value?.prop
      return prop ? editingValues.value[prop] : null
    },
    set: (val: any) => {
      const prop = editingColumn.value?.prop
      if (prop) editingValues.value[prop] = val
    },
  })

  function isEditingCell(rowIndex: number, colProp: string | undefined): boolean {
    if (!colProp) return false

    if (editMode.value === 'all') {
      const colIndex = navigableColumns.value.findIndex((c) => c.prop === colProp)
      return colIndex >= 0 && isCellEditable(rowIndex, colIndex)
    }

    if (!isEditing.value) return false
    if (editingRowIndex.value !== rowIndex) return false

    if (editMode.value === 'row') {
      return colProp in editingValues.value
    }

    return editingColumn.value?.prop === colProp
  }

  return {
    isEditing,
    editingRowIndex,
    editingColIndex,
    editingValue,
    editingValues,
    editingColumn,
    editMode,
    autoTriggerEnabled,
    isCellEditable,
    startEdit,
    confirmEdit,
    cancelEdit,
    getEditingValue,
    setEditingValue,
    updateEditingValue,
    isEditingCell,
  }
}

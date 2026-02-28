import { ref, type Ref } from 'vue'

import { useEventListener } from '@vueuse/core'

import type { HotkeyBinding, HotkeyContext, ReTableNextColumn, RowData } from '../types'
import type { EditMode } from './use-editable'
import { createEditorFocuser, isPrintableKey, matchesHotkey } from '../utils'

export interface UseHotkeyOptions {
  wrapperEl: Ref<HTMLElement | null>
  hotkeyEnabled: Ref<boolean>
  navigate: (rowDelta: number, colDelta: number) => void
  focusCell: (rowIndex: number, colIndex: number) => void
  activeRowIndex: Ref<number>
  activeColIndex: Ref<number>
  data: Ref<RowData[]>
  navigableColumns: Ref<ReTableNextColumn[]>
  customHotkeys?: Ref<HotkeyBinding[] | undefined>

  // ──── 编辑相关 ────
  editMode: Ref<EditMode>
  autoTriggerEnabled: Ref<boolean>
  isEditing: Ref<boolean>
  editingRowIndex: Ref<number>
  startEdit: (rowIndex?: number, colIndex?: number) => void
  confirmEdit: () => any
  cancelEdit: () => void
  updateCellValue: (value: any) => void
  isCellEditable: (rowIndex: number, colIndex: number) => boolean

  // ──── 编辑历史 ────
  undo: () => void
  redo: () => void
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
}

export function useHotkey(options: UseHotkeyOptions) {
  const {
    wrapperEl,
    hotkeyEnabled,
    navigate,
    focusCell,
    activeRowIndex,
    activeColIndex,
    data,
    navigableColumns,
    customHotkeys,
    editMode,
    autoTriggerEnabled,
    isEditing,
    editingRowIndex,
    startEdit,
    confirmEdit,
    cancelEdit,
    updateCellValue,
    isCellEditable,
    undo,
    redo,
    canUndo,
    canRedo,
  } = options

  const hasFocus = ref(false)

  // ── 焦点跟踪 ──

  useEventListener(wrapperEl, 'focusin', () => {
    hasFocus.value = true
  })

  useEventListener(wrapperEl, 'focusout', (e: FocusEvent) => {
    const related = e.relatedTarget as HTMLElement | null
    if (wrapperEl.value?.contains(related)) return
    if (related?.closest('.el-popper, .el-select__popper, .el-picker__popper')) return

    hasFocus.value = false
  })

  const focusActiveEditor = createEditorFocuser(wrapperEl)

  // ── 热键处理 ──

  function buildContext(event: KeyboardEvent): HotkeyContext {
    return {
      event,
      activeRowIndex: activeRowIndex.value,
      activeColIndex: activeColIndex.value,
      row:
        activeRowIndex.value >= 0
          ? (data.value[activeRowIndex.value] ?? null)
          : null,
      column:
        activeColIndex.value >= 0
          ? (navigableColumns.value[activeColIndex.value] ?? null)
          : null,
      tableData: data.value,
      columns: navigableColumns.value,
      navigate,
      startEdit,
      cancelEdit,
      updateCellValue,
    }
  }

  function ensureActive(): boolean {
    if (activeRowIndex.value < 0 || activeColIndex.value < 0) {
      focusCell(0, 0)
      return true
    }
    return false
  }

  function isTargetInEditor(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null
    return !!target?.closest('.re-table-next-cell-editor')
  }

  /** 'all' 模式：编辑器内仅处理 Tab/Enter/Esc，其余交给编辑器自行处理 */
  function handleAllModeEditorKey(event: KeyboardEvent): boolean {
    if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (canUndo.value) {
        event.preventDefault()
        undo()
        return true
      }
      return false
    }
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') {
      if (canRedo.value) {
        event.preventDefault()
        redo()
        return true
      }
      return false
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        wrapperEl.value?.focus({ preventScroll: true })
        return true

      case 'Enter':
        event.preventDefault()
        navigate(event.shiftKey ? -1 : 1, 0)
        focusActiveEditor()
        return true

      case 'Tab':
        event.preventDefault()
        navigate(0, event.shiftKey ? -1 : 1)
        focusActiveEditor()
        return true

      default:
        return false
    }
  }

  /** 编辑中的热键 */
  function handleEditingKey(event: KeyboardEvent): boolean {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        cancelEdit()
        wrapperEl.value?.focus({ preventScroll: true })
        return true

      case 'Enter':
        event.preventDefault()
        confirmEdit()
        navigate(event.shiftKey ? -1 : 1, 0)
        wrapperEl.value?.focus({ preventScroll: true })
        return true

      case 'Tab': {
        event.preventDefault()

        if (editMode.value === 'row') {
          // Row 模式：Tab 在行内移动，不确认
          const colCount = navigableColumns.value.length
          const ri = editingRowIndex.value
          let newCol = activeColIndex.value + (event.shiftKey ? -1 : 1)
          if (newCol < 0) newCol = colCount - 1
          if (newCol >= colCount) newCol = 0
          focusCell(ri, newCol)
          startEdit(ri, newCol)
          focusActiveEditor()
          return true
        }

        // Cell / manual 模式：确认 + 导航
        confirmEdit()
        navigate(0, event.shiftKey ? -1 : 1)
        wrapperEl.value?.focus({ preventScroll: true })
        return true
      }

      default:
        return false
    }
  }

  /** 非编辑模式内置热键 */
  function handleBuiltinKey(event: KeyboardEvent): boolean {
    const rowCount = data.value.length
    const colCount = navigableColumns.value.length
    if (rowCount === 0 || colCount === 0) return false

    // Ctrl+Z → undo
    if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (canUndo.value) {
        event.preventDefault()
        undo()
        return true
      }
      return false
    }

    // Ctrl+Shift+Z → redo
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z') {
      if (canRedo.value) {
        event.preventDefault()
        redo()
        return true
      }
      return false
    }

    // Ctrl+Y → redo
    if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'y') {
      if (canRedo.value) {
        event.preventDefault()
        redo()
        return true
      }
      return false
    }

    // F2 → 进入编辑（仅 autoTrigger 模式）
    if (event.key === 'F2' && autoTriggerEnabled.value) {
      event.preventDefault()
      if (
        activeRowIndex.value >= 0 &&
        activeColIndex.value >= 0 &&
        isCellEditable(activeRowIndex.value, activeColIndex.value)
      ) {
        startEdit()
        focusActiveEditor()
      }
      return true
    }

    // Delete / Backspace → 清空（仅 autoTrigger 模式）
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      autoTriggerEnabled.value
    ) {
      if (
        activeRowIndex.value >= 0 &&
        activeColIndex.value >= 0 &&
        isCellEditable(activeRowIndex.value, activeColIndex.value)
      ) {
        event.preventDefault()
        startEdit()
        updateCellValue('')
        focusActiveEditor()
        return true
      }
      return false
    }

    const isAll = editMode.value === 'all'

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        ensureActive() || navigate(-1, 0)
        if (isAll) focusActiveEditor()
        return true

      case 'ArrowDown':
        event.preventDefault()
        ensureActive() || navigate(1, 0)
        if (isAll) focusActiveEditor()
        return true

      case 'ArrowLeft':
        event.preventDefault()
        ensureActive() || navigate(0, -1)
        if (isAll) focusActiveEditor()
        return true

      case 'ArrowRight':
        event.preventDefault()
        ensureActive() || navigate(0, 1)
        if (isAll) focusActiveEditor()
        return true

      case 'Tab':
        event.preventDefault()
        ensureActive() || navigate(0, event.shiftKey ? -1 : 1)
        if (isAll) focusActiveEditor()
        return true

      case 'Enter':
        event.preventDefault()
        if (ensureActive()) {
          if (isAll) focusActiveEditor()
          return true
        }
        if (
          autoTriggerEnabled.value &&
          isCellEditable(activeRowIndex.value, activeColIndex.value)
        ) {
          startEdit()
          focusActiveEditor()
        } else {
          navigate(event.shiftKey ? -1 : 1, 0)
          if (isAll) focusActiveEditor()
        }
        return true

      case 'Home':
        event.preventDefault()
        if (event.ctrlKey) {
          focusCell(0, 0)
        } else {
          focusCell(Math.max(0, activeRowIndex.value), 0)
        }
        if (isAll) focusActiveEditor()
        return true

      case 'End':
        event.preventDefault()
        if (event.ctrlKey) {
          focusCell(rowCount - 1, colCount - 1)
        } else {
          focusCell(Math.max(0, activeRowIndex.value), colCount - 1)
        }
        if (isAll) focusActiveEditor()
        return true

      default:
        return false
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!hotkeyEnabled.value || !hasFocus.value) return

    // 编辑中
    if (isEditing.value) {
      const ctx = buildContext(event)

      for (const binding of customHotkeys?.value?.filter((h) => h.override) ?? []) {
        if (!matchesHotkey(event, binding.key)) continue
        if (binding.when && !binding.when(ctx)) continue
        if (binding.preventDefault !== false) event.preventDefault()
        if (binding.stopPropagation) event.stopPropagation()
        const result = binding.handler(ctx)
        if (result !== false) return
      }

      if (handleEditingKey(event)) return

      return
    }

    // 'all' 模式：编辑器内仅拦截导航键，其余交给编辑器
    if (editMode.value === 'all' && isTargetInEditor(event)) {
      if (handleAllModeEditorKey(event)) return
      return
    }

    const ctx = buildContext(event)

    // 1. 用户 override 热键
    for (const binding of customHotkeys?.value?.filter((h) => h.override) ?? []) {
      if (!matchesHotkey(event, binding.key)) continue
      if (binding.when && !binding.when(ctx)) continue
      if (binding.preventDefault !== false) event.preventDefault()
      if (binding.stopPropagation) event.stopPropagation()
      const result = binding.handler(ctx)
      if (result !== false) return
    }

    // 2. 内置热键
    if (handleBuiltinKey(event)) return

    // 3. 用户普通热键
    for (const binding of customHotkeys?.value?.filter((h) => !h.override) ?? []) {
      if (!matchesHotkey(event, binding.key)) continue
      if (binding.when && !binding.when(ctx)) continue
      if (binding.preventDefault !== false) event.preventDefault()
      if (binding.stopPropagation) event.stopPropagation()
      binding.handler(ctx)
      return
    }

    // 4. 可打印字符直接进入编辑（仅 autoTrigger 模式）
    if (
      autoTriggerEnabled.value &&
      isPrintableKey(event) &&
      activeRowIndex.value >= 0 &&
      activeColIndex.value >= 0 &&
      isCellEditable(activeRowIndex.value, activeColIndex.value)
    ) {
      startEdit()
      updateCellValue(event.key)
      focusActiveEditor()
    }
  }

  useEventListener(wrapperEl, 'keydown', handleKeydown)

  return {
    hasFocus,
  }
}

import { computed, ref, type Ref } from 'vue'

import type { RowData } from '../types'
import type { EditChangeRecord } from './use-editable'

/** 一次编辑操作（cell 模式单条，row 模式多条作为原子操作） */
type HistoryEntry = EditChangeRecord[]

export interface UseEditHistoryOptions {
  data: Ref<RowData[]>
  maxHistory?: number
}

export function useEditHistory(options: UseEditHistoryOptions) {
  const { data, maxHistory = 50 } = options

  const undoStack = ref<HistoryEntry[]>([])
  const redoStack = ref<HistoryEntry[]>([])

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function pushChange(changes: EditChangeRecord | EditChangeRecord[]): void {
    const entries = Array.isArray(changes) ? changes : [changes]
    if (entries.length === 0) return

    undoStack.value.push(entries)
    if (undoStack.value.length > maxHistory) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  /**
   * 执行撤销，恢复旧值到 data，并返回本批被还原的变更（便于调用方同步清除 dirty）
   */
  function undo(): HistoryEntry | undefined {
    const entries = undoStack.value.pop()
    if (!entries) return undefined

    for (const change of entries) {
      const row = data.value[change.rowIndex]
      if (row) row[change.colProp] = change.oldValue
    }
    redoStack.value.push(entries)
    return entries
  }

  /**
   * 执行重做，应用新值到 data，并返回本批被重做的变更（便于调用方同步标记 dirty）
   */
  function redo(): HistoryEntry | undefined {
    const entries = redoStack.value.pop()
    if (!entries) return undefined

    for (const change of entries) {
      const row = data.value[change.rowIndex]
      if (row) row[change.colProp] = change.newValue
    }
    undoStack.value.push(entries)
    return entries
  }

  function clearHistory(): void {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    canUndo,
    canRedo,
    pushChange,
    undo,
    redo,
    clearHistory,
  }
}

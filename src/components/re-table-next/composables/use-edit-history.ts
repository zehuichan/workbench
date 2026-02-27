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

  function undo(): void {
    const entries = undoStack.value.pop()
    if (!entries) return

    for (const change of entries) {
      const row = data.value[change.rowIndex]
      if (row) row[change.colProp] = change.oldValue
    }
    redoStack.value.push(entries)
  }

  function redo(): void {
    const entries = redoStack.value.pop()
    if (!entries) return

    for (const change of entries) {
      const row = data.value[change.rowIndex]
      if (row) row[change.colProp] = change.newValue
    }
    undoStack.value.push(entries)
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

import { ref } from 'vue'

import type { EditRecord, RowData } from '../types'

export interface UseEditHistoryOptions {
  maxHistory?: number
}

export function useEditHistory(options: UseEditHistoryOptions = {}) {
  const { maxHistory = 50 } = options

  const undoStack = ref<EditRecord[]>([])
  const redoStack = ref<EditRecord[]>([])

  function record(entry: EditRecord): void {
    undoStack.value.push(entry)
    if (undoStack.value.length > maxHistory) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  function undo(data: RowData[], columns: { prop?: string }[]): EditRecord | null {
    const entry = undoStack.value.pop()
    if (!entry) return null

    const row = data[entry.rowIndex]
    if (row && entry.prop) {
      row[entry.prop] = entry.oldValue
    }

    redoStack.value.push(entry)
    return entry
  }

  function redo(data: RowData[], columns: { prop?: string }[]): EditRecord | null {
    const entry = redoStack.value.pop()
    if (!entry) return null

    const row = data[entry.rowIndex]
    if (row && entry.prop) {
      row[entry.prop] = entry.newValue
    }

    undoStack.value.push(entry)
    return entry
  }

  function clear(): void {
    undoStack.value = []
    redoStack.value = []
  }

  function canUndo(): boolean {
    return undoStack.value.length > 0
  }

  function canRedo(): boolean {
    return redoStack.value.length > 0
  }

  return { record, undo, redo, clear, canUndo, canRedo }
}

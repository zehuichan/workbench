import type { EditChangeRecord } from './use-editable'

type HistoryEntry = EditChangeRecord[]

export interface UseEditActionsOptions {
  confirmEdit: () => EditChangeRecord[] | null
  undo: () => HistoryEntry | undefined
  redo: () => HistoryEntry | undefined
  markDirty: (rowIndex: number, prop: string) => void
  clearDirty: (rowIndex: number, prop: string) => void
  pushChange: (changes: EditChangeRecord | EditChangeRecord[]) => void
  onFieldChange: (rowIndex: number, prop: string) => void
  validateOnCellExit: boolean
  validateFieldsAffectedByChange: (rowIndex: number, prop: string) => Promise<void>
}

/**
 * 编辑与历史操作包装：确认编辑时校验、推送历史、标记脏数据、触发联动；
 * undo/redo 时同步更新 dirty 标识
 */
export function useEditActions(options: UseEditActionsOptions) {
  const {
    confirmEdit,
    undo,
    redo,
    markDirty,
    clearDirty,
    pushChange,
    onFieldChange,
    validateOnCellExit,
    validateFieldsAffectedByChange,
  } = options

  function confirmEditWithHistory(): EditChangeRecord[] | null {
    const changes = confirmEdit()
    if (changes && validateOnCellExit) {
      for (const c of changes) {
        validateFieldsAffectedByChange(c.rowIndex, c.colProp).catch(() => {})
      }
    }
    if (changes) {
      for (const c of changes) {
        markDirty(c.rowIndex, c.colProp)
      }
      pushChange(changes)
      for (const c of changes) {
        onFieldChange(c.rowIndex, c.colProp)
      }
    }
    return changes
  }

  function wrappedUndo(): void {
    const reverted = undo()
    if (reverted) {
      reverted.forEach((c) => clearDirty(c.rowIndex, c.colProp))
    }
  }

  function wrappedRedo(): void {
    const redone = redo()
    if (redone) {
      redone.forEach((c) => markDirty(c.rowIndex, c.colProp))
    }
  }

  return {
    confirmEditWithHistory,
    wrappedUndo,
    wrappedRedo,
  }
}

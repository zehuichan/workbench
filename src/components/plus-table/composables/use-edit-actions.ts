import type { Ref } from 'vue'

import type { EditChangeRecord } from '.'

type HistoryEntry = EditChangeRecord[]

export interface UseEditActionsOptions {
  confirmEdit: () => EditChangeRecord[] | null
  undo: () => HistoryEntry | undefined
  redo: () => HistoryEntry | undefined
  markDirty: (rowIndex: number, prop: string) => void
  pushChange: (changes: EditChangeRecord | EditChangeRecord[]) => void
  onFieldChange: (rowIndex: number, prop: string) => void
  validateOnCellExit: Ref<boolean>
  validateFieldsAffectedByChange: (rowIndex: number, prop: string) => Promise<void>
}

/**
 * 编辑与历史操作包装：确认编辑时校验、推送历史、标记脏数据、触发联动；
 * undo/redo 时同步更新 dirty 标识
 */
export function useEditActions(options: UseEditActionsOptions) {
  const {
    confirmEdit,
    undo: revertHistory,
    redo: reapplyHistory,
    markDirty,
    pushChange,
    onFieldChange,
    validateOnCellExit,
    validateFieldsAffectedByChange,
  } = options

  function commitEdit(): EditChangeRecord[] | null {
    const changes = confirmEdit()
    if (!changes) return null

    pushChange(changes)
    for (const c of changes) {
      markDirty(c.rowIndex, c.colProp)
      onFieldChange(c.rowIndex, c.colProp)
      if (validateOnCellExit.value) {
        validateFieldsAffectedByChange(c.rowIndex, c.colProp).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('[PlusTable] validateFieldsAffectedByChange failed:', e)
          }
        })
      }
    }
    return changes
  }

  function undo(): void {
    const reverted = revertHistory()
    if (reverted) {
      reverted.forEach((c) => markDirty(c.rowIndex, c.colProp))
    }
  }

  function redo(): void {
    const redone = reapplyHistory()
    if (redone) {
      redone.forEach((c) => markDirty(c.rowIndex, c.colProp))
    }
  }

  return {
    commitEdit,
    undo,
    redo,
  }
}

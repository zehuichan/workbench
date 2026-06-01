import type { Ref } from 'vue';

import type { EditChangeRecord } from './use-editable';

type HistoryEntry = EditChangeRecord[];

export interface UseEditActionsOptions {
  confirmEdit: () => EditChangeRecord[] | null;
  undo: () => HistoryEntry | undefined;
  redo: () => HistoryEntry | undefined;
  markDirty: (rowIndex: number, field: string) => void;
  pushChange: (changes: EditChangeRecord | EditChangeRecord[]) => void;
  onFieldChange: (rowIndex: number, field: string) => void;
  validateOnCellExit: Ref<boolean>;
  validateFieldsAffectedByChange: (
    rowIndex: number,
    field: string,
  ) => Promise<void>;
}

/**
 * 编辑与历史操作包装：确认编辑时推送历史、标记脏数据、触发联动、按需校验；
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
  } = options;

  function commitEdit(): EditChangeRecord[] | null {
    const changes = confirmEdit();
    if (!changes) return null;

    pushChange(changes);
    for (const c of changes) {
      markDirty(c.rowIndex, c.field);
      onFieldChange(c.rowIndex, c.field);
      if (validateOnCellExit.value) {
        validateFieldsAffectedByChange(c.rowIndex, c.field).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn(
              '[AntTable] validateFieldsAffectedByChange failed:',
              e,
            );
          }
        });
      }
    }
    return changes;
  }

  function undo(): void {
    const reverted = revertHistory();
    if (reverted) {
      reverted.forEach((c) => markDirty(c.rowIndex, c.field));
    }
  }

  function redo(): void {
    const redone = reapplyHistory();
    if (redone) {
      redone.forEach((c) => markDirty(c.rowIndex, c.field));
    }
  }

  return {
    commitEdit,
    undo,
    redo,
  };
}

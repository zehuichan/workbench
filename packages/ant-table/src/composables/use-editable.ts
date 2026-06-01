import { computed, ref, type ComputedRef, type Ref } from 'vue';

import type { AntTableColumn, RowData } from '../types';
import { columnField } from '../utils';

export interface EditCellPayload {
  row: RowData;
  column: AntTableColumn;
  value: any;
  rowIndex: number;
  colIndex: number;
}

export interface EditValueChangePayload extends EditCellPayload {
  oldValue: any;
  newValue: any;
}

export interface UseEditableOptions {
  data: Ref<RowData[]>;
  navigableColumns: Ref<AntTableColumn[]>;
  activeRowIndex: Ref<number>;
  activeColIndex: Ref<number>;
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>;
  /** 单元格联动：依赖 disabled 为 true 时阻止进入编辑 */
  isDepDisabled?: (rowIndex: number, field: string) => boolean;
  onEditStart?: (payload: EditCellPayload) => void;
  onEditEnd?: (payload: EditCellPayload) => void;
  onValueChange?: (payload: EditValueChangePayload) => void;
}

export interface EditChangeRecord {
  rowIndex: number;
  field: string;
  oldValue: any;
  newValue: any;
}

export type EditMode = 'none' | 'cell' | 'row' | 'manual' | 'all';

function resolveEditMode(
  editable: boolean | 'row' | 'cell' | 'manual',
): EditMode {
  if (editable === false) return 'none';
  if (editable === true) return 'all';
  return editable;
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
  } = options;

  const isEditing = ref(false);
  const editingRowIndex = ref(-1);
  /** cell/manual: 正在编辑的列; row: 触发编辑的列（决定聚焦） */
  const editingColIndex = ref(-1);

  /** 行内所有正在编辑的列值（row 模式多列，cell/manual 单列） */
  const editingValues = ref<Record<string, any>>({});
  const originalValues = ref<Record<string, any>>({});

  const editMode: ComputedRef<EditMode> = computed(() =>
    resolveEditMode(editable.value),
  );

  /** 是否允许自动触发编辑（F2 / Enter / 双击 / 可打印字符） */
  const autoTriggerEnabled = computed(
    () => editMode.value === 'cell' || editMode.value === 'row',
  );

  const editingColumn = computed(() =>
    editingColIndex.value >= 0
      ? (navigableColumns.value[editingColIndex.value] ?? null)
      : null,
  );

  function isCellEditable(rowIndex: number, colIndex: number): boolean {
    if (editMode.value === 'none') return false;

    const column = navigableColumns.value[colIndex];
    if (!column) return false;

    const row = data.value[rowIndex];
    if (!row) return false;

    if (column.editable === false) return false;
    if (typeof column.editable === 'function' && !column.editable(row))
      return false;
    if (isDepDisabled?.(rowIndex, columnField(column) ?? '')) return false;

    return true;
  }

  function startEdit(rowIndex?: number, colIndex?: number): void {
    const ri = rowIndex ?? activeRowIndex.value;
    const ci = colIndex ?? activeColIndex.value;
    if (ri < 0 || ci < 0) return;
    if (editMode.value === 'none') return;
    if (!isCellEditable(ri, ci)) return;

    // 已在编辑同一行（row 模式仅更新聚焦列）
    if (isEditing.value && editingRowIndex.value === ri) {
      if (editMode.value === 'row') {
        editingColIndex.value = ci;
        return;
      }
      if (editingColIndex.value === ci) return;
    }

    if (isEditing.value) confirmEdit();

    const row = data.value[ri];
    if (!row) return;

    editingRowIndex.value = ri;
    editingColIndex.value = ci;

    if (editMode.value === 'row') {
      const vals: Record<string, any> = {};
      const origVals: Record<string, any> = {};
      for (let i = 0; i < navigableColumns.value.length; i++) {
        const col = navigableColumns.value[i];
        const field = columnField(col);
        if (!field) continue;
        if (!isCellEditable(ri, i)) continue;
        vals[field] = row[field];
        origVals[field] = row[field];
      }
      if (Object.keys(vals).length === 0) return;
      editingValues.value = vals;
      originalValues.value = origVals;
    } else {
      const column = navigableColumns.value[ci];
      const field = columnField(column);
      if (!field) return;
      const value = row[field];
      editingValues.value = { [field]: value };
      originalValues.value = { [field]: value };
    }

    isEditing.value = true;

    const column = navigableColumns.value[ci];
    if (column) {
      const field = columnField(column);
      const value = field ? row[field] : undefined;
      onEditStart?.({ row, column, value, rowIndex: ri, colIndex: ci });
    }
  }

  function confirmEdit(): EditChangeRecord[] | null {
    if (!isEditing.value) return null;

    const ri = editingRowIndex.value;
    const row = data.value[ri];
    if (!row) {
      resetEdit();
      return null;
    }

    const changes: EditChangeRecord[] = [];

    for (const [field, newValue] of Object.entries(editingValues.value)) {
      const oldValue = originalValues.value[field];
      if (oldValue !== newValue) {
        row[field] = newValue;
        changes.push({ rowIndex: ri, field, oldValue, newValue });

        const colIdx = navigableColumns.value.findIndex(
          (c) => columnField(c) === field,
        );
        if (colIdx >= 0) {
          onValueChange?.({
            row,
            column: navigableColumns.value[colIdx]!,
            oldValue,
            newValue,
            value: newValue,
            rowIndex: ri,
            colIndex: colIdx,
          });
        }
      }
    }

    const ci = editingColIndex.value;
    const column = navigableColumns.value[ci];
    if (column) {
      onEditEnd?.({
        row,
        column,
        value: editingValues.value[columnField(column) ?? ''],
        rowIndex: ri,
        colIndex: ci,
      });
    }

    resetEdit();
    return changes.length > 0 ? changes : null;
  }

  function cancelEdit(): void {
    if (!isEditing.value) return;

    const ri = editingRowIndex.value;
    const ci = editingColIndex.value;
    const column = navigableColumns.value[ci];
    const row = data.value[ri];

    if (column && row) {
      onEditEnd?.({
        row,
        column,
        value: originalValues.value[columnField(column) ?? ''],
        rowIndex: ri,
        colIndex: ci,
      });
    }

    resetEdit();
  }

  function resetEdit(): void {
    isEditing.value = false;
    editingRowIndex.value = -1;
    editingColIndex.value = -1;
    editingValues.value = {};
    originalValues.value = {};
  }

  // ──── 值访问 API ────

  function getEditingValue(field: string): any {
    return editingValues.value[field];
  }

  function setEditingValue(field: string, value: any): void {
    editingValues.value[field] = value;
  }

  /** 更新当前聚焦列的编辑值（热键引擎使用） */
  function updateEditingValue(value: any): void {
    const field = columnField(editingColumn.value ?? {});
    if (field) editingValues.value[field] = value;
  }

  function isEditingCell(rowIndex: number, field: string | undefined): boolean {
    if (!field) return false;

    if (editMode.value === 'all') {
      const colIndex = navigableColumns.value.findIndex(
        (c) => columnField(c) === field,
      );
      return colIndex >= 0 && isCellEditable(rowIndex, colIndex);
    }

    if (!isEditing.value) return false;
    if (editingRowIndex.value !== rowIndex) return false;

    if (editMode.value === 'row') {
      return field in editingValues.value;
    }

    return columnField(editingColumn.value ?? {}) === field;
  }

  return {
    isEditing,
    editingRowIndex,
    editingColIndex,
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
  };
}

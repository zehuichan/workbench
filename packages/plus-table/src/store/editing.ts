import { computed, nextTick, reactive, shallowRef } from 'vue';
import { cloneDeep } from 'es-toolkit';
import { cellKey } from '../util';
import type { ComputedRef } from 'vue';
import type { PlusTable } from '../tokens';
import type { EditMode, RowData } from '../table/defaults';
import type { CellPosition } from './current';
import type { ColumnNode } from '../table-column/defaults';

function isTextLikeInput(
  el: Element,
): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'button', 'range'].includes(el.type);
  }
  return false;
}

/**
 * 编辑状态机 + 统一草稿仓。cell / row / table 三种模式共用同一份 `drafts`（key 为
 * `${rowKey}:${prop}`）：cell 模式下只会有 editingCell 对应的这一个条目；row/table 模式下
 * 文本类（失焦提交）编辑器各自按字段占一个条目。
 */
export function useEditing<T extends RowData = RowData>(table: PlusTable<T>) {
  // 显式标注打断 PlusTable ↔ Store 的推断环：mode 的类型若从 store.states 推断，
  // 会让 useEditing 返回类型依赖 Store，而 Store 又由 useEditing 返回值组成。
  const mode: ComputedRef<EditMode | string> = computed(
    () => table.store.states.editMode.value ?? 'cell',
  );

  const states = {
    /** cell 模式：当前编辑格 */
    editingCell: shallowRef<CellPosition | null>(null),
    /** row 模式：当前编辑行 key */
    editingRowKey: shallowRef<string | null>(null),
  };

  /** row 模式：当前编辑行快照，cancel 时回滚 */
  let editingRowSnapshot: T | null = null;

  /** 统一草稿仓：cell 模式单槙、row/table 模式多槙，共用同一存储与寻址方式 */
  const drafts = reactive(new Map<string, unknown>());

  function getDraft(
    rowKey: string,
    prop: string,
  ): { has: boolean; value: unknown } {
    const key = cellKey(rowKey, prop);
    return { has: drafts.has(key), value: drafts.get(key) };
  }

  function setDraft(rowKey: string, prop: string, value: unknown): void {
    drafts.set(cellKey(rowKey, prop), value);
  }

  function deleteDraft(rowKey: string, prop: string): void {
    drafts.delete(cellKey(rowKey, prop));
  }

  /** 失焦提交：把缓冲的草稿经 setCellValue 流水线写回，随后清掉草稿位（row/table 模式文本类编辑器用） */
  function flushDraft(
    row: T,
    rowIndex: number,
    rowKey: string,
    prop: string,
  ): void {
    const key = cellKey(rowKey, prop);
    if (!drafts.has(key)) return;
    const value = drafts.get(key);
    drafts.delete(key);
    table.store.commit('setCellValue', row, rowIndex, prop, value);
  }

  /** 丢弃某行所有未提交的草稿（row 模式取消编辑 / 行被删除时调用，不写回） */
  function discardDraftsForRow(rowKey: string): void {
    const prefix = `${rowKey}:`;
    for (const key of [...drafts.keys()]) {
      if (key.startsWith(prefix)) drafts.delete(key);
    }
  }

  function flushRowDrafts(rowKey: string): void {
    const found = table.store.states.keysMap.value.get(rowKey);
    if (!found) {
      discardDraftsForRow(rowKey);
      return;
    }
    const prefix = `${rowKey}:`;
    for (const key of [...drafts.keys()]) {
      if (!key.startsWith(prefix)) continue;
      flushDraft(found.row, found.rowIndex, rowKey, key.slice(prefix.length));
    }
  }

  function restoreEditingRowKey(): void {
    states.editingRowKey.value = null;
  }

  function clearEditingRow(flush = true): void {
    const rowKey = states.editingRowKey.value;
    if (!rowKey) return;

    if (flush) flushRowDrafts(rowKey);
    else discardDraftsForRow(rowKey);

    const current = states.editingCell.value;
    const currentRow = current
      ? table.store.states.data.value[current.rowIndex]
      : undefined;
    if (currentRow && table.store.getRowKey(currentRow) === rowKey) {
      states.editingCell.value = null;
    }

    restoreEditingRowKey();
    editingRowSnapshot = null;
  }

  /** 行失效后调用：清掉该行残留的编辑态 / 快照 / 草稿，避免长会话下无限增长 */
  function cleanEditing(): void {
    const keysMap = table.store.states.keysMap.value;
    const editingRowKey = states.editingRowKey.value;
    if (editingRowKey && !keysMap.has(editingRowKey)) {
      discardDraftsForRow(editingRowKey);
      restoreEditingRowKey();
      editingRowSnapshot = null;
    }
    const current = states.editingCell.value;
    if (current && !table.store.states.data.value[current.rowIndex]) {
      states.editingCell.value = null;
    }
  }

  function resolveEditable(
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
  ): boolean {
    const column = node.column;
    if (!column.prop) return false;
    const editable = column.editable;
    if (typeof editable === 'function') {
      return !!editable({ row, rowIndex });
    }
    return !!editable;
  }

  function canEditCell(rowIndex: number, colIndex: number): boolean {
    if (mode.value === 'none') return false;
    const node = table.store.states.columns.value[colIndex];
    const row = table.store.states.data.value[rowIndex];
    if (!node || !row) return false;
    if (!resolveEditable(row, rowIndex, node)) return false;
    return !table.store.getDependencyState(row, rowIndex, node.column).disabled;
  }

  function isRowEditing(row: T): boolean {
    return states.editingRowKey.value === table.store.getRowKey(row);
  }

  /** 单元格是否处于编辑器渲染态（三种模式统一入口） */
  function isCellEditing(rowIndex: number, colIndex: number): boolean {
    switch (mode.value) {
      case 'table':
        return canEditCell(rowIndex, colIndex);
      case 'row': {
        const row = table.store.states.data.value[rowIndex];
        return !!row && isRowEditing(row) && canEditCell(rowIndex, colIndex);
      }
      case 'cell': {
        const current = states.editingCell.value;
        return current?.rowIndex === rowIndex && current?.colIndex === colIndex;
      }
      default:
        return false;
    }
  }

  async function focusEditor(
    rowIndex: number,
    colIndex: number,
    hasInitialValue: boolean,
  ) {
    await nextTick();
    const cellEl = table.store.getCellEl(rowIndex, colIndex) as HTMLElement | null;
    if (!cellEl) return;
    // 优先真实输入框；EP 的 .el-input__wrapper 带 tabindex="-1"，不能误聚焦到包装层
    const input =
      cellEl.querySelector<HTMLElement>('input, textarea') ??
      cellEl.querySelector<HTMLElement>('[tabindex]:not([tabindex="-1"])');
    if (!input) return;
    input.focus();
    if (isTextLikeInput(input)) {
      try {
        if (hasInitialValue) {
          const len = input.value.length;
          input.setSelectionRange(len, len);
        } else {
          input.select();
        }
      } catch {
        // number 等输入类型不支持 selection API
      }
    }
  }

  /** cell 模式进编；defaultValue 用于可打印字符覆盖式进编 */
  function startEdit(
    rowIndex: number,
    colIndex: number,
    opts: { defaultValue?: unknown } = {},
  ): boolean {
    if (mode.value !== 'cell') return false;
    if (!canEditCell(rowIndex, colIndex)) return false;
    if (states.editingCell.value) commitEdit();
    const node = table.store.states.columns.value[colIndex];
    const row = table.store.states.data.value[rowIndex];
    if (!node?.column.prop || !row) return false;
    const prop = node.column.prop;
    const hasInitial = 'defaultValue' in opts;
    setDraft(
      table.store.getRowKey(row),
      prop,
      hasInitial ? opts.defaultValue : row[prop],
    );
    states.editingCell.value = { rowIndex, colIndex };
    table.store.setCurrentCell(rowIndex, colIndex);
    void focusEditor(rowIndex, colIndex, hasInitial);
    return true;
  }

  /** cell 模式提交：经 setCellValue 流水线（脏值跳过 / 联动 / 校验） */
  function commitEdit(): void {
    if (mode.value !== 'cell') return;
    const current = states.editingCell.value;
    if (!current) return;
    states.editingCell.value = null;
    const node = table.store.states.columns.value[current.colIndex];
    const row = table.store.states.data.value[current.rowIndex];
    if (!node?.column.prop || !row) return;
    const rowKey = table.store.getRowKey(row);
    const prop = node.column.prop;
    const { value } = getDraft(rowKey, prop);
    deleteDraft(rowKey, prop);
    table.store.commit('setCellValue', row, current.rowIndex, prop, value);
  }

  function cancelEdit(): void {
    if (mode.value !== 'cell') return;
    const current = states.editingCell.value;
    if (!current) return;
    states.editingCell.value = null;
    const node = table.store.states.columns.value[current.colIndex];
    const row = table.store.states.data.value[current.rowIndex];
    if (node?.column.prop && row) deleteDraft(table.store.getRowKey(row), node.column.prop);
  }

  function clearRowEditingCell(flush = false): void {
    const current = states.editingCell.value;
    if (!current || mode.value !== 'row') return;
    const row = table.store.states.data.value[current.rowIndex];
    const node = table.store.states.columns.value[current.colIndex];
    const prop = node?.column.prop;
    if (flush && row && prop) {
      flushDraft(row, current.rowIndex, table.store.getRowKey(row), prop);
    }
    states.editingCell.value = null;
    if (row && prop) deleteDraft(table.store.getRowKey(row), prop);
  }

  /** row 模式：在已进编的行上设置当前格编辑器 */
  function setRowEditingCell(rowIndex: number, colIndex: number): boolean {
    if (mode.value !== 'row') return false;
    const row = table.store.states.data.value[rowIndex];
    if (!row || !isRowEditing(row) || !canEditCell(rowIndex, colIndex)) {
      return false;
    }
    const node = table.store.states.columns.value[colIndex];
    const prop = node?.column.prop;
    if (!prop) return false;
    clearRowEditingCell(true);
    setDraft(table.store.getRowKey(row), prop, row[prop]);
    states.editingCell.value = { rowIndex, colIndex };
    table.store.setCurrentCell(rowIndex, colIndex, false);
    void focusEditor(rowIndex, colIndex, false);
    return true;
  }

  function startRowEdit(rowIndex: number): boolean {
    if (mode.value !== 'row') return false;
    const row = table.store.states.data.value[rowIndex];
    if (!row) return false;
    const key = table.store.getRowKey(row);
    if (states.editingRowKey.value === key) return true;
    clearEditingRow(true);
    editingRowSnapshot = cloneDeep(row);
    states.editingRowKey.value = key;
    return true;
  }

  /** row 模式提交：整行校验通过才退出编辑态 */
  async function commitRowEdit(rowIndex: number): Promise<boolean> {
    const row = table.store.states.data.value[rowIndex];
    if (!row) return false;
    const key = table.store.getRowKey(row);
    if (states.editingRowKey.value !== key) return true;
    flushRowDrafts(key);
    states.editingCell.value = null;
    const errors = await table.store.validateRow(rowIndex);
    if (errors.length) return false;
    restoreEditingRowKey();
    editingRowSnapshot = null;
    return true;
  }

  /** row 模式取消：静默回滚到快照（不触发联动与 cell-change） */
  function cancelRowEdit(rowIndex: number): void {
    const row = table.store.states.data.value[rowIndex];
    if (!row) return;
    const key = table.store.getRowKey(row);
    if (states.editingRowKey.value !== key) return;
    states.editingCell.value = null;
    // 未提交的草稿本来就没写进 row，直接丢弃即可；不能 flush，否则等于强行提交取消中的编辑
    discardDraftsForRow(key);
    const dirtyProps = new Set(Object.keys(row));
    const snapshot = editingRowSnapshot;
    if (snapshot) {
      for (const prop of Object.keys(snapshot)) dirtyProps.add(prop);
      for (const prop of Object.keys(row)) {
        if (!(prop in snapshot)) delete (row as RowData)[prop];
      }
      Object.assign(row, cloneDeep(snapshot));
    }
    for (const prop of dirtyProps) table.store.markDirty(key, prop);
    restoreEditingRowKey();
    editingRowSnapshot = null;
    table.store.clearRowValidate(row);
  }

  return {
    mode,
    canEditCell,
    isCellEditing,
    isRowEditing,
    startEdit,
    commitEdit,
    cancelEdit,
    startRowEdit,
    setRowEditingCell,
    clearRowEditingCell,
    commitRowEdit,
    cancelRowEdit,
    getDraft,
    setDraft,
    flushDraft,
    discardDraftsForRow,
    cleanEditing,
    states,
  };
}

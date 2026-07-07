import { computed, nextTick, reactive, shallowRef } from 'vue';
import { cloneDeep } from 'es-toolkit';
import type { ComputedRef } from 'vue';
import type { WriteCellFn } from './commit';
import type { CellPosition, SelectionApi } from './selection';
import type { ColumnNode, PlusTableProps, RowData } from '../types';

export interface EditingOptions<T extends RowData = RowData> {
  props: PlusTableProps<T>;
  data: () => T[];
  leafNodes: ComputedRef<ColumnNode<T>[]>;
  getRowKeyStr: (row: T) => string;
  isDependencyDisabled: (
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
  ) => boolean;
  writeCell: WriteCellFn<T>;
  validateRow: (rowIndex: number) => Promise<unknown[]>;
  clearRowValidate: (row: T) => void;
  selection: SelectionApi;
}

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
 * 文本类（失焦提交）编辑器各自按字段占一个条目。草稿只是「尚未写回 row 的临时值」，
 * 提交时机（commitEdit / flushDraft）才真正经 writeCell 落到行对象上。
 */
export function createEditing<T extends RowData = RowData>(
  options: EditingOptions<T>,
) {
  const {
    props,
    data,
    leafNodes,
    getRowKeyStr,
    isDependencyDisabled,
    writeCell,
    validateRow,
    clearRowValidate,
    selection,
  } = options;

  const mode = computed(() => props.editMode ?? 'cell');

  /** cell 模式：当前编辑格 */
  const editingCell = shallowRef<CellPosition | null>(null);
  /** row 模式：处于编辑态的行 key */
  const editingRowKeys = reactive(new Set<string>());
  /** row 模式：进编时的快照，cancel 时回滚 */
  const rowSnapshots = new Map<string, T>();

  /** 统一草稿仓：cell 模式单槙、row/table 模式多槙，共用同一存储与寻址方式 */
  const drafts = reactive(new Map<string, unknown>());

  function draftKey(rowKey: string, prop: string): string {
    return `${rowKey}:${prop}`;
  }

  function getDraft(
    rowKey: string,
    prop: string,
  ): { has: boolean; value: unknown } {
    const key = draftKey(rowKey, prop);
    return { has: drafts.has(key), value: drafts.get(key) };
  }

  function setDraft(rowKey: string, prop: string, value: unknown): void {
    drafts.set(draftKey(rowKey, prop), value);
  }

  function deleteDraft(rowKey: string, prop: string): void {
    drafts.delete(draftKey(rowKey, prop));
  }

  /** 失焦提交：把缓冲的草稿经 writeCell 流水线写回，随后清掉草稿位（row/table 模式文本类编辑器用） */
  function flushDraft(
    row: T,
    rowIndex: number,
    rowKey: string,
    prop: string,
  ): void {
    const key = draftKey(rowKey, prop);
    if (!drafts.has(key)) return;
    const value = drafts.get(key);
    drafts.delete(key);
    writeCell(row, rowIndex, prop, value);
  }

  /** 丢弃某行所有未提交的草稿（row 模式取消编辑 / 行被删除时调用，不写回） */
  function discardDraftsForRow(rowKey: string): void {
    const prefix = `${rowKey}:`;
    for (const key of [...drafts.keys()]) {
      if (key.startsWith(prefix)) drafts.delete(key);
    }
  }

  /** 行被结构性移除后调用：清掉该行残留的编辑态 / 快照 / 草稿，避免长会话下无限增长 */
  function pruneRemovedRows(removedRowKeys: Set<string>): void {
    for (const rowKey of removedRowKeys) {
      editingRowKeys.delete(rowKey);
      rowSnapshots.delete(rowKey);
      discardDraftsForRow(rowKey);
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
    const node = leafNodes.value[colIndex];
    const row = data()[rowIndex];
    if (!node || !row) return false;
    if (!resolveEditable(row, rowIndex, node)) return false;
    return !isDependencyDisabled(row, rowIndex, node);
  }

  function isRowEditing(row: T): boolean {
    return editingRowKeys.has(getRowKeyStr(row));
  }

  /** 单元格是否处于编辑器渲染态（三种模式统一入口） */
  function isCellEditing(rowIndex: number, colIndex: number): boolean {
    switch (mode.value) {
      case 'table':
        return canEditCell(rowIndex, colIndex);
      case 'row': {
        const row = data()[rowIndex];
        return !!row && isRowEditing(row) && canEditCell(rowIndex, colIndex);
      }
      case 'cell': {
        const current = editingCell.value;
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
    const cellEl = selection.getCellEl(rowIndex, colIndex);
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
    if (editingCell.value) commitEdit();
    const node = leafNodes.value[colIndex];
    const row = data()[rowIndex];
    const prop = node.column.prop!;
    const hasInitial = 'defaultValue' in opts;
    setDraft(
      getRowKeyStr(row),
      prop,
      hasInitial ? opts.defaultValue : row[prop],
    );
    editingCell.value = { rowIndex, colIndex };
    selection.setActiveCell(rowIndex, colIndex);
    void focusEditor(rowIndex, colIndex, hasInitial);
    return true;
  }

  /** cell 模式提交：经 writeCell 流水线（脏值跳过 / 联动 / 校验） */
  function commitEdit(): void {
    const current = editingCell.value;
    if (!current) return;
    editingCell.value = null;
    const node = leafNodes.value[current.colIndex];
    const row = data()[current.rowIndex];
    if (!node?.column.prop || !row) return;
    const rowKey = getRowKeyStr(row);
    const prop = node.column.prop;
    const { value } = getDraft(rowKey, prop);
    deleteDraft(rowKey, prop);
    writeCell(row, current.rowIndex, prop, value);
  }

  function cancelEdit(): void {
    const current = editingCell.value;
    if (!current) return;
    editingCell.value = null;
    const node = leafNodes.value[current.colIndex];
    const row = data()[current.rowIndex];
    if (node?.column.prop && row)
      deleteDraft(getRowKeyStr(row), node.column.prop);
  }

  function startRowEdit(rowIndex: number): boolean {
    if (mode.value !== 'row') return false;
    const row = data()[rowIndex];
    if (!row) return false;
    const key = getRowKeyStr(row);
    if (editingRowKeys.has(key)) return true;
    rowSnapshots.set(key, cloneDeep(row));
    editingRowKeys.add(key);
    return true;
  }

  /** row 模式提交：整行校验通过才退出编辑态 */
  async function commitRowEdit(rowIndex: number): Promise<boolean> {
    const row = data()[rowIndex];
    if (!row) return false;
    const key = getRowKeyStr(row);
    if (!editingRowKeys.has(key)) return true;
    const errors = await validateRow(rowIndex);
    if (errors.length) return false;
    editingRowKeys.delete(key);
    rowSnapshots.delete(key);
    return true;
  }

  /** row 模式取消：静默回滚到快照（不触发联动与 cell-change） */
  function cancelRowEdit(rowIndex: number): void {
    const row = data()[rowIndex];
    if (!row) return;
    const key = getRowKeyStr(row);
    if (!editingRowKeys.has(key)) return;
    // 未提交的草稿本来就没写进 row，直接丢弃即可；不能 flush，否则等于强行提交取消中的编辑
    discardDraftsForRow(key);
    const snapshot = rowSnapshots.get(key);
    if (snapshot) {
      for (const prop of Object.keys(row)) {
        // T 是泛型类型参数，只能整体读取，不能按 key 删除；T extends RowData 保证这里转写是安全的
        if (!(prop in snapshot)) delete (row as RowData)[prop];
      }
      Object.assign(row, cloneDeep(snapshot));
    }
    editingRowKeys.delete(key);
    rowSnapshots.delete(key);
    clearRowValidate(row);
  }

  return {
    mode,
    editingCell,
    canEditCell,
    isCellEditing,
    isRowEditing,
    startEdit,
    commitEdit,
    cancelEdit,
    startRowEdit,
    commitRowEdit,
    cancelRowEdit,
    getDraft,
    setDraft,
    flushDraft,
    discardDraftsForRow,
    pruneRemovedRows,
  };
}

export type EditingApi<T extends RowData = RowData> = ReturnType<
  typeof createEditing<T>
>;

import { computed, nextTick, reactive, ref, shallowRef } from 'vue';
import { cloneDeep } from 'es-toolkit';
import type { ColumnNode, PlusTableProps, RowData } from '../types';
import type { CellPosition, SelectionApi } from './selection';
import type { ComputedRef } from 'vue';

export type WriteCellFn = (
  row: RowData,
  rowIndex: number,
  prop: string,
  value: unknown,
) => void;

export interface EditingOptions {
  props: PlusTableProps;
  data: () => RowData[];
  leafNodes: ComputedRef<ColumnNode[]>;
  getRowKeyStr: (row: RowData) => string;
  isDependencyDisabled: (row: RowData, rowIndex: number, node: ColumnNode) => boolean;
  writeCell: WriteCellFn;
  validateRow: (rowIndex: number) => Promise<unknown[]>;
  clearRowValidate: (row: RowData) => void;
  selection: SelectionApi;
}

function isTextLikeInput(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'button', 'range'].includes(el.type);
  }
  return false;
}

export function createEditing(options: EditingOptions) {
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
  /** cell 模式：编辑草稿，Esc 时直接丢弃 */
  const draft = ref<unknown>();
  /** row 模式：处于编辑态的行 key */
  const editingRowKeys = reactive(new Set<string>());
  /** row 模式：进编时的快照，cancel 时回滚 */
  const rowSnapshots = new Map<string, RowData>();

  /**
   * row/table 模式下文本类编辑器的草稿缓冲，key 为 `${rowKey}:${prop}`。
   * cell 模式的单槽 draft 不够用——row/table 模式可以同时有多个格子在编辑。
   * 输入时只写这里，失焦才通过 flushLiveDraft 真正 writeCell 提交，
   * 避免每敲一个字符就直写（否则撤销重做粒度、脏追踪、校验都会被打得很碎）。
   */
  const liveDrafts = reactive(new Map<string, unknown>());

  function liveDraftKey(rowKey: string, prop: string): string {
    return `${rowKey}:${prop}`;
  }

  function getLiveDraft(rowKey: string, prop: string): { has: boolean; value: unknown } {
    const key = liveDraftKey(rowKey, prop);
    return { has: liveDrafts.has(key), value: liveDrafts.get(key) };
  }

  function setLiveDraft(rowKey: string, prop: string, value: unknown): void {
    liveDrafts.set(liveDraftKey(rowKey, prop), value);
  }

  /** 失焦提交：把缓冲的草稿经 writeCell 流水线写回，随后清掉草稿位 */
  function flushLiveDraft(row: RowData, rowIndex: number, rowKey: string, prop: string): void {
    const key = liveDraftKey(rowKey, prop);
    if (!liveDrafts.has(key)) return;
    const value = liveDrafts.get(key);
    liveDrafts.delete(key);
    writeCell(row, rowIndex, prop, value);
  }

  /** 丢弃某行所有未提交的草稿（row 模式取消编辑 / 行被删除时调用，不写回） */
  function discardLiveDraftsForRow(rowKey: string): void {
    const prefix = `${rowKey}:`;
    for (const key of [...liveDrafts.keys()]) {
      if (key.startsWith(prefix)) liveDrafts.delete(key);
    }
  }

  /** 行被结构性移除后调用：清掉该行残留的编辑态 / 快照 / 草稿，避免长会话下无限增长 */
  function pruneRemovedRows(removedRowKeys: Set<string>): void {
    for (const rowKey of removedRowKeys) {
      editingRowKeys.delete(rowKey);
      rowSnapshots.delete(rowKey);
      discardLiveDraftsForRow(rowKey);
    }
  }

  function resolveEditable(row: RowData, rowIndex: number, node: ColumnNode): boolean {
    const column = node.column;
    if (!column.prop) return false;
    const editable = column.editable;
    if (typeof editable === 'function') {
      return !!editable(row, rowIndex);
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

  function isRowEditing(row: RowData): boolean {
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

  async function focusEditor(rowIndex: number, colIndex: number, hasInitialValue: boolean) {
    await nextTick();
    const td = selection.getCellEl(rowIndex, colIndex);
    if (!td) return;
    // 优先真实输入框；EP 的 .el-input__wrapper 带 tabindex="-1"，不能误聚焦到包装层
    const input =
      td.querySelector<HTMLElement>('input, textarea') ??
      td.querySelector<HTMLElement>('[tabindex]:not([tabindex="-1"])');
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
    const hasInitial = 'defaultValue' in opts;
    draft.value = hasInitial ? opts.defaultValue : row[node.column.prop!];
    editingCell.value = { rowIndex, colIndex };
    selection.setActiveCell(rowIndex, colIndex);
    void focusEditor(rowIndex, colIndex, hasInitial);
    return true;
  }

  function updateDraft(value: unknown) {
    draft.value = value;
  }

  /** cell 模式提交：经 writeCell 流水线（脏值跳过 / 联动 / 校验） */
  function commitEdit() {
    const current = editingCell.value;
    if (!current) return;
    editingCell.value = null;
    const node = leafNodes.value[current.colIndex];
    const row = data()[current.rowIndex];
    if (!node?.column.prop || !row) return;
    writeCell(row, current.rowIndex, node.column.prop, draft.value);
  }

  function cancelEdit() {
    editingCell.value = null;
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
  function cancelRowEdit(rowIndex: number) {
    const row = data()[rowIndex];
    if (!row) return;
    const key = getRowKeyStr(row);
    if (!editingRowKeys.has(key)) return;
    // 未提交的草稿本来就没写进 row，直接丢弃即可；不能 flush，否则等于强行提交取消中的编辑
    discardLiveDraftsForRow(key);
    const snapshot = rowSnapshots.get(key);
    if (snapshot) {
      for (const prop of Object.keys(row)) {
        if (!(prop in snapshot)) delete row[prop];
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
    draft,
    canEditCell,
    isCellEditing,
    isRowEditing,
    startEdit,
    updateDraft,
    commitEdit,
    cancelEdit,
    startRowEdit,
    commitRowEdit,
    cancelRowEdit,
    getLiveDraft,
    setLiveDraft,
    flushLiveDraft,
    discardLiveDraftsForRow,
    pruneRemovedRows,
  };
}

export type EditingApi = ReturnType<typeof createEditing>;

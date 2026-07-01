import { clamp, cloneDeep } from 'es-toolkit';
import type { PlusTableEmits, RowData } from '../types';

export interface RowsOptions {
  data: () => RowData[];
  emit: PlusTableEmits;
}

/** 行结构操作：全部以新数组经 update:data 回传，父级是唯一数据源 */
export function createRows(options: RowsOptions) {
  const { data, emit } = options;

  function insertRow(row: RowData = {}, index?: number): RowData {
    const list = [...data()];
    const at = index === undefined ? list.length : clamp(index, 0, list.length);
    list.splice(at, 0, row);
    emit('update:data', list);
    return row;
  }

  function removeRow(index: number): RowData | undefined {
    const list = [...data()];
    if (index < 0 || index >= list.length) return undefined;
    const [removed] = list.splice(index, 1);
    emit('update:data', list);
    return removed;
  }

  function moveRow(from: number, to: number): boolean {
    const list = [...data()];
    if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) {
      return false;
    }
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    emit('update:data', list);
    return true;
  }

  /**
   * 复制行并插到原行之后。
   * rowKey 字段需通过 patch 覆盖为新值，否则会与原行撞 key。
   */
  function duplicateRow(index: number, patch?: RowData): RowData | undefined {
    const source = data()[index];
    if (!source) return undefined;
    const clone = Object.assign(cloneDeep(source), patch);
    return insertRow(clone, index + 1);
  }

  return { insertRow, removeRow, moveRow, duplicateRow };
}

export type RowsApi = ReturnType<typeof createRows>;

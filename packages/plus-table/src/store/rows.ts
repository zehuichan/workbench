import { clamp, cloneDeep } from 'es-toolkit';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';

/** 行结构操作：全部以新数组经 update:data 回传，父级是唯一数据源 */
export function useRows<T extends RowData = RowData>(table: PlusTable<T>) {
  const data = () => table.store.states.data.value;

  function insertRow(row: T = {} as T, index?: number): T {
    const list = [...data()];
    const at = index === undefined ? list.length : clamp(index, 0, list.length);
    list.splice(at, 0, row);
    table.emit('update:data', list);
    return row;
  }

  function removeRow(index: number): T | undefined {
    const list = [...data()];
    if (index < 0 || index >= list.length) return undefined;
    const [removed] = list.splice(index, 1);
    table.emit('update:data', list);
    return removed;
  }

  function moveRow(from: number, to: number): boolean {
    const list = [...data()];
    if (
      from < 0 ||
      from >= list.length ||
      to < 0 ||
      to >= list.length ||
      from === to
    ) {
      return false;
    }
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved!);
    table.emit('update:data', list);
    return true;
  }

  /**
   * 复制行并插到原行之后。
   * rowKey 字段需通过 patch 覆盖为新值，否则会与原行撞 key。
   */
  function duplicateRow(index: number, patch?: Partial<T>): T | undefined {
    const source = data()[index];
    if (!source) return undefined;
    const clone = Object.assign(cloneDeep(source), patch);
    return insertRow(clone, index + 1);
  }

  return {
    insertRow,
    removeRow,
    moveRow,
    duplicateRow,
  };
}

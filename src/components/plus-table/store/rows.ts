import { clamp, cloneDeep } from 'es-toolkit';
import { getRowIdentity } from '../util';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';

/** 行结构操作：全部以新数组经 update:data 回传，父级是唯一数据源 */
export function useRows<T extends RowData = RowData>(table: PlusTable<T>) {
  const data = () => table.store.states.data.value;

  function resolveRowKey(row: T): string {
    return getRowIdentity(row, table.props.rowKey);
  }

  function assertUniqueRowKey(row: T): void {
    const key = resolveRowKey(row);
    const duplicated = data().some(
      (current) => getRowIdentity(current, table.props.rowKey) === key,
    );
    if (duplicated) {
      throw new Error(`[PlusTable] insertRow 失败：rowKey="${key}" 已存在，不能插入重复行。`);
    }
  }

  function insertRow(row: T, index?: number): T {
    assertUniqueRowKey(row);
    const list = [...data()];
    const at = index === undefined ? list.length : clamp(index, 0, list.length);
    list.splice(at, 0, row);
    table.emit('update:data', list);
    return row;
  }

  function removeRow(index: number): T | undefined {
    const list = [...data()];
    if (!Number.isInteger(index) || index < 0 || index >= list.length) {
      return undefined;
    }
    const [removed] = list.splice(index, 1);
    table.emit('update:data', list);
    return removed;
  }

  function moveRow(from: number, to: number): boolean {
    const list = [...data()];
    if (
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
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
   * patch 必须让实际解析出的 rowKey 唯一，否则拒绝插入。
   */
  function duplicateRow(index: number, patch: Partial<T>): T | undefined {
    const source = data()[index];
    if (!Number.isInteger(index) || !source) return undefined;
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

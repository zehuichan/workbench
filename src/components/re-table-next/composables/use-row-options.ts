import type { Ref } from 'vue';

import type { RowData } from '../types';

export interface UseRowOptionsOptions {
  data: Ref<RowData[]>;
  /** 行操作后更新数据（主组件内可对应 emit('update:data', newData)） */
  onDataChange: (newData: RowData[]) => void;
}

/**
 * 行增删移复制：基于 data ref + onDataChange 回调，不直接修改 props
 */
export function useRowOptions(options: UseRowOptionsOptions) {
  const { data, onDataChange } = options;

  function insertRow(index?: number, defaultRow: RowData = {}): void {
    const list = [...data.value];
    const i = index ?? list.length;
    const safeIndex = Math.max(0, Math.min(i, list.length));
    list.splice(safeIndex, 0, { ...defaultRow });
    onDataChange(list);
  }

  function deleteRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= data.value.length) return;
    const list = data.value.filter((_, i) => i !== rowIndex);
    onDataChange(list);
  }

  function moveRow(fromIndex: number, toIndex: number): void {
    const list = [...data.value];
    const len = list.length;
    if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len)
      return;
    if (fromIndex === toIndex) return;
    const [removed] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, removed);
    onDataChange(list);
  }

  function duplicateRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= data.value.length) return;
    const row = data.value[rowIndex];
    const list = [...data.value];
    list.splice(rowIndex + 1, 0, { ...row });
    onDataChange(list);
  }

  return {
    insertRow,
    deleteRow,
    moveRow,
    duplicateRow,
  };
}

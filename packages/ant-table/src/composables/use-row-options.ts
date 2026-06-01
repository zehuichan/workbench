import type { Ref } from 'vue';

import { castArray } from 'es-toolkit/compat';

import type { RowData } from '../types';

export interface UseRowOptionsOptions {
  data: Ref<RowData[]>;
  /** 行操作后更新数据（主组件内对应 emit('update:dataSource', newData)） */
  onDataChange: (newData: RowData[]) => void;
  /** 当前激活行索引（移动行后自动更新，使激活行/单元格跟随移动） */
  activeRowIndex?: Ref<number>;
}

/**
 * 计算行移动后某个索引的新位置。
 * 基于「先移除 fromIndex 行，再在 toIndex 处插入」的映射。
 */
function computeShiftedIndex(cur: number, from: number, to: number): number {
  if (cur === from) return to;
  const afterRemove = cur > from ? cur - 1 : cur;
  return afterRemove >= to ? afterRemove + 1 : afterRemove;
}

/** 行增删移复制：基于 data ref + onDataChange 回调，不直接修改 props */
export function useRowOptions(options: UseRowOptionsOptions) {
  const { data, onDataChange, activeRowIndex } = options;

  function insertRow(
    index?: number,
    defaultRow: RowData = {},
    count = 1,
  ): void {
    if (count < 1) return;
    const list = [...data.value];
    const i = index ?? list.length;
    const safeIndex = Math.max(0, Math.min(i, list.length));
    const newRows = Array.from({ length: count }, () => ({ ...defaultRow }));
    list.splice(safeIndex, 0, ...newRows);
    onDataChange(list);
  }

  function deleteRow(rowIndex?: number | number[]): void {
    const targets = rowIndex == null ? [] : castArray(rowIndex);
    const valid = targets.filter((i) => i >= 0 && i < data.value.length);
    if (!valid.length) return;
    const indexSet = new Set(valid);
    onDataChange(data.value.filter((_, i) => !indexSet.has(i)));
  }

  function moveRow(fromIndex: number, toIndex: number): void {
    const list = [...data.value];
    const len = list.length;
    if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len)
      return;
    if (fromIndex === toIndex) return;
    const [removed] = list.splice(fromIndex, 1);
    if (!removed) return;
    list.splice(toIndex, 0, removed);
    onDataChange(list);

    if (activeRowIndex != null && activeRowIndex.value >= 0) {
      activeRowIndex.value = computeShiftedIndex(
        activeRowIndex.value,
        fromIndex,
        toIndex,
      );
    }
  }

  function duplicateRow(rowIndex?: number | number[]): void {
    const targets = rowIndex == null ? [] : castArray(rowIndex);
    const sorted = [...new Set(targets)]
      .filter((i): i is number => i >= 0 && i < (data.value.length ?? 0))
      .sort((a, b) => a - b);
    if (!sorted.length) return;
    const list = [...data.value];
    let offset = 0;
    for (const idx of sorted) {
      list.splice(idx + 1 + offset, 0, structuredClone(data.value[idx]));
      offset++;
    }
    onDataChange(list);
  }

  return {
    insertRow,
    deleteRow,
    moveRow,
    duplicateRow,
  };
}

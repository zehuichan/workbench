import type { PlusTableResolvedProps } from '../table';
import type { RowData, RowLocation } from '../types';

import { isProxy, shallowRef } from 'vue';

import { defined } from '@/utils/defined';

import { assertRowKey, devWarn, getRowIdentity } from '../utils';

export interface DataSnapshot<T extends RowData> {
  /** 与 rows 一一对应的稳定身份，由 readDataSnapshot 一次解析出来 */
  keys: string[];
  rows: T[];
}

export interface RowRegistry<T extends RowData> {
  keysMap: Map<string, RowLocation<T>>;
  rowKeyMap: WeakMap<T, string>;
}

/**
 * 行数据与身份索引。data 是当前页的行数组（分页时只是切片），
 * keysMap / rowKeyMap 按 rowKey 与行对象双向寻址；换页 / 重排后仍以 rowKey 对回正确的行。
 *
 * 身份只在 readDataSnapshot 解析一次；setData 用同一份 keys 建 registry 并查重，
 * 不再经 computed 重扫。
 */
export function useData<T extends RowData = RowData>(
  props: PlusTableResolvedProps<T>,
) {
  const data = shallowRef<T[]>([]);
  const keysMap = shallowRef(new Map<string, RowLocation<T>>());
  const rowKeyMap = shallowRef(new WeakMap<T, string>());

  function getRowKey(row: T): string {
    return rowKeyMap.value.get(row) ?? getRowIdentity(row, props.rowKey);
  }

  /**
   * 读一份 props.data 快照并一次解析全部身份；顺带让父级就地改写 rowKey 字段也能触发重新同步。
   * 行对象不是响应式时，字段编辑就地修改后单元格不会自动重绘，开发期提醒一次。
   */
  function readDataSnapshot(): DataSnapshot<T> {
    if (!Array.isArray(props.data)) {
      throw new TypeError('[PlusTable] data 必须是数组。');
    }
    const option = props.rowKey;
    assertRowKey(option);
    const rows = [...props.data];
    const keys = rows.map((row) => getRowIdentity(row, option));
    const plainIndex = rows.findIndex(
      (row) => !isProxy(row) && !Object.isFrozen(row),
    );
    if (plainIndex !== -1) {
      devWarn(
        `[PlusTable] 第 ${plainIndex} 行（rowKey="${keys[plainIndex]}"）不是响应式对象：` +
          '字段编辑就地修改行对象，非响应式行可能导致单元格不自动重绘。请对 data 使用 reactive / ref。',
      );
    }
    return { rows, keys };
  }

  /**
   * 用已解析的身份建双向索引；查重与冻结告警也在这里做，调用方一次提交 data + registry。
   */
  function buildRegistry(rows: T[], keys: string[]): RowRegistry<T> {
    const nextKeysMap = new Map<string, RowLocation<T>>();
    const nextRowKeyMap = new WeakMap<T, string>();
    rows.forEach((row, rowIndex) => {
      const key = defined(keys[rowIndex]);
      const existing = nextKeysMap.get(key);
      if (existing) {
        throw new Error(
          `[PlusTable] setData 失败：第 ${rowIndex} 行的 rowKey="${key}" 与前序行重复。`,
        );
      }
      if (Object.isFrozen(row)) {
        devWarn(
          `[PlusTable] 第 ${rowIndex} 行（rowKey="${key}"）是冻结对象：字段编辑就地修改行对象，冻结行无法写入。`,
        );
      }
      nextKeysMap.set(key, { row, rowIndex });
      nextRowKeyMap.set(row, key);
    });
    return { keysMap: nextKeysMap, rowKeyMap: nextRowKeyMap };
  }

  /** 一次性提交行数组与身份索引，保证两者始终同构。 */
  function commitData(rows: T[], registry: RowRegistry<T>): void {
    data.value = rows;
    keysMap.value = registry.keysMap;
    rowKeyMap.value = registry.rowKeyMap;
  }

  return {
    data,
    keysMap,
    rowKeyMap,
    getRowKey,
    readDataSnapshot,
    buildRegistry,
    commitData,
  };
}

export type UseDataReturn<T extends RowData = RowData> = ReturnType<
  typeof useData<T>
>;

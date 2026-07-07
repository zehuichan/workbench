import { computed, watch } from 'vue';
import type { ComputedRef } from 'vue';
import type { PlusTableProps, RowData, RowKey } from '../types';

export interface RowLocation<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
}

export interface TableContext<T extends RowData = RowData> {
  data: () => T[];
  resolveRawRowKey: (row: T) => unknown;
  getRowKeyStr: (row: T) => string;
  /** rowKey -> 当前 {row, rowIndex}；行结构变化后随 data() 自动重算，全部模块经此寻址，不再各自 indexOf/findIndex 扫描 */
  locationByKey: ComputedRef<Map<string, RowLocation<T>>>;
  findByKey: (rowKey: string) => RowLocation<T> | undefined;
  /** 结构性变化（数组引用替换）导致行被移除时通知订阅者；用于清理 history/dirty/validation/editing 的残留状态 */
  onRowsRemoved: (handler: (removedRowKeys: Set<string>) => void) => void;
}

/**
 * 数据上下文：全部功能模块共享的唯一寻址入口。
 * 用一个 computed Map 维护 rowKey -> {row, rowIndex}，取代散落各处的 data().indexOf(row) /
 * data().find(...) 线性扫描；同时承担 rowKey 完整性检测（dev 告警）与结构性变化后的差集清理广播。
 */
export function createContext<T extends RowData = RowData>(
  props: PlusTableProps<T>,
): TableContext<T> {
  const data = () => props.data ?? [];

  function resolveRawRowKey(row: T): unknown {
    const rowKey = props.rowKey as RowKey<T>;
    if (typeof rowKey !== 'function') return row[rowKey];
    return rowKey(row);
  }

  function getRowKeyStr(row: T): string {
    return String(resolveRawRowKey(row));
  }

  const locationByKey = computed<Map<string, RowLocation<T>>>(() => {
    const map = new Map<string, RowLocation<T>>();
    data().forEach((row, rowIndex) => {
      map.set(getRowKeyStr(row), { row, rowIndex });
    });
    return map;
  });

  function findByKey(rowKey: string): RowLocation<T> | undefined {
    return locationByKey.value.get(rowKey);
  }

  /** 开发环境下 rowKey 重复 / 空值检测：静默串行不抛错，但打警告帮业务定位配置问题 */
  function checkRowKeyIntegrity(rows: T[]) {
    if (!(import.meta as any)?.env?.DEV) return;
    const seen = new Map<string, number>();
    for (const row of rows) {
      const raw = resolveRawRowKey(row);
      if (raw === undefined || raw === null || raw === '') {
        console.warn(
          '[PlusTable] 检测到 rowKey 解析出空值，可能导致编辑态 / 校验 / 脏标记串到别的行上，请检查 row-key 配置。',
        );
      }
      const key = String(raw);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    for (const [key, count] of seen) {
      if (count > 1) {
        console.warn(
          `[PlusTable] 检测到重复的 rowKey="${key}"（共 ${count} 行），可能导致编辑态 / 校验 / 脏标记串到别的行上，请确保 row-key 唯一。`,
        );
      }
    }
  }

  const removedHandlers: Array<(removedRowKeys: Set<string>) => void> = [];
  function onRowsRemoved(handler: (removedRowKeys: Set<string>) => void): void {
    removedHandlers.push(handler);
  }

  /**
   * 结构性变化（insertRow/removeRow/moveRow/duplicateRow 或换页）后按 rowKey 差集通知订阅者，
   * 避免长会话（SPA 不卸载表格）下订阅方的残留状态无限增长。用 () => data() 作为 watch
   * source：只在数组引用变化（结构性操作）时触发，值编辑（原地改字段）不会误触发。
   */
  let previousKeys: Set<string> | null = null;
  watch(
    () => data(),
    (rows) => {
      checkRowKeyIntegrity(rows);
      const currentKeys = new Set(rows.map(getRowKeyStr));
      if (previousKeys) {
        const removed = new Set<string>();
        for (const key of previousKeys) {
          if (!currentKeys.has(key)) removed.add(key);
        }
        if (removed.size) {
          for (const handler of removedHandlers) handler(removed);
        }
      }
      previousKeys = currentKeys;
    },
    { immediate: true },
  );

  return {
    data,
    resolveRawRowKey,
    getRowKeyStr,
    locationByKey,
    findByKey,
    onRowsRemoved,
  };
}

export type TableContextApi<T extends RowData = RowData> = ReturnType<
  typeof createContext<T>
>;

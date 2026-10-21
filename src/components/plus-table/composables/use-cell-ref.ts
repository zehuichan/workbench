import type { CellRef } from '../types';

import { reactive, shallowRef } from 'vue';

/**
 * reactive Set 使用的内部 key。rowKey 经 getRowIdentity 归一化、colId 由列归一化生成，
 * 两者都是组件内部的稳定字符串且不含 \0，用它作分隔符即可避免拼接碰撞。
 */
export function cellRefKey(rowKey: string, colId: string): string {
  return `${rowKey}\0${colId}`;
}

/**
 * 单槽 CellRef 状态，活动格与编辑格共用：
 * - 槽内存稳定身份，行列重排后仍指向同一格；
 * - keys 是按 key 订阅的 reactive Set，切换时只让旧格与新格的渲染失效。
 */
export function useCellRefSlot() {
  const current = shallowRef<CellRef | null>(null);
  const keys = reactive(new Set<string>());

  function get(): CellRef | null {
    return current.value;
  }

  function set(next: CellRef | null): void {
    const prev = current.value;
    if (
      prev === next ||
      (prev && next && prev.rowKey === next.rowKey && prev.colId === next.colId)
    ) {
      return;
    }
    if (prev) keys.delete(cellRefKey(prev.rowKey, prev.colId));
    current.value = next;
    if (next) keys.add(cellRefKey(next.rowKey, next.colId));
  }

  function has(rowKey: string, colId: string): boolean {
    return keys.has(cellRefKey(rowKey, colId));
  }

  return { get, set, has };
}

export type UseCellRefSlotReturn = ReturnType<typeof useCellRefSlot>;

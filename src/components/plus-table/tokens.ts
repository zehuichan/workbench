import { inject } from 'vue';
import type { InjectionKey, Ref, Slots } from 'vue';
import type { InternalStore, Store } from './store';
import type { PlusTableEmits, PlusTableProps, RowData } from './table/defaults';

interface PlusTableBase<T extends RowData = RowData> {
  props: PlusTableProps<T>;
  emit: PlusTableEmits<T>;
  slots: Slots;
  gridRef: Ref<HTMLElement | undefined>;
  paginationRef: Ref<HTMLElement | undefined>;
}

/** 公开注入上下文仅暴露兼容的 index-based Store。 */
interface PlusTableContext<
  T extends RowData = RowData,
> extends PlusTableBase<T> {
  store: Store<T>;
}

/** 组件内部上下文可访问稳定 CellRef 相关成员。 */
export interface PlusTable<
  T extends RowData = RowData,
> extends PlusTableBase<T> {
  ids: {
    description: string;
    cell: (rowKey: string, colId: string) => string;
    error: (rowKey: string, colId: string) => string;
  };
  /**
   * 装配期由 table.vue 回填（createStore 需要先拿到实例本身）。
   * InternalStore 类型经 useStore 返回值推断而来；PlusTable ↔ Store 的类型环
   * 依赖各子 hook 对外成员的显式返回类型标注来打断，勿删标注。
   */
  store: InternalStore<T>;
}

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<PlusTableContext<any>> =
  Symbol('plus-table');

export function usePlusTable<T extends RowData = RowData>(): PlusTable<T> {
  const table = inject(PLUS_TABLE_INJECTION_KEY);
  if (!table) {
    throw new Error('[PlusTable] 当前组件必须在 PlusTable 内部使用');
  }
  return table as unknown as PlusTable<T>;
}

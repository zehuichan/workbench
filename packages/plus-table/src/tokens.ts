import type { InjectionKey, Ref, Slots } from 'vue';
import type { Store } from './store';
import type { PlusTableEmits, PlusTableProps, RowData } from './table/defaults';

export interface PlusTable<T extends RowData = RowData> {
  props: PlusTableProps<T>;
  emit: PlusTableEmits<T>;
  slots: Slots;
  gridRef: Ref<HTMLElement | undefined>;
  paginationRef: Ref<HTMLElement | undefined>;
  /**
   * 装配期由 table.vue 回填（createStore 需要先拿到实例本身）。
   * Store 类型经 useStore 返回值推断而来；PlusTable ↔ Store 的类型环
   * 依赖各子 hook 对外成员的显式返回类型标注来打断，勿删标注。
   */
  store: Store<T>;
}

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<PlusTable<any>> =
  Symbol('plus-table');

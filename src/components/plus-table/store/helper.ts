import { watch } from 'vue';
import useStore from './index';
import type { PlusTable } from '../tokens';
import type { PlusTableProps, RowData } from '../table/defaults';

export function createStore<T extends RowData = RowData>(
  table: PlusTable<T>,
  props: PlusTableProps<T>,
) {
  const store = useStore<T>(table);
  table.store = store;
  watch(
    () => props.data,
    (data) => {
      store.commit('setData', data ?? []);
    },
    { immediate: true },
  );
  watch(
    () => props.history,
    (history) => {
      if (!history) store.clearHistory();
    },
  );
  return store;
}

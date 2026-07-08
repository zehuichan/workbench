import { watch } from 'vue';
import useStore from './index';
import type { PlusTable } from '../tokens';
import type { PlusTableProps, RowData } from '../table/defaults';

const InitialStateMap = {
  rowKey: 'rowKey',
  editMode: 'editMode',
  validateEvent: 'validateEvent',
  history: 'history',
  dirtyTracking: 'dirtyTracking',
} as const;

export function createStore<T extends RowData = RowData>(
  table: PlusTable<T>,
  props: PlusTableProps<T>,
) {
  const store = useStore<T>(table);
  Object.keys(InitialStateMap).forEach((key) => {
    handleValue(props[key as keyof typeof InitialStateMap], key, store);
  });
  proxyTableProps(store, props);
  return store;
}

function proxyTableProps<T extends RowData>(
  store: ReturnType<typeof useStore<T>>,
  props: PlusTableProps<T>,
) {
  Object.keys(InitialStateMap).forEach((key) => {
    watch(
      () => props[key as keyof typeof InitialStateMap],
      (value) => {
        handleValue(value, key, store);
      },
    );
  });
}

function handleValue<T extends RowData>(
  value: unknown,
  propsKey: string,
  store: ReturnType<typeof useStore<T>>,
) {
  const storeKey = InitialStateMap[propsKey as keyof typeof InitialStateMap];
  const normalized = propsKey === 'history' ? !!value : value;
  store.states[storeKey].value = normalized as never;
  if (propsKey === 'history' && !normalized) {
    store.clearHistory();
  }
}

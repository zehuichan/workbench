import {
  effectScope,
  reactive,
  shallowRef,
  type EffectScope,
  type Slots,
} from 'vue';
import { vi } from 'vitest';
import { createStore } from '../../store/helper';
import type { InternalStore } from '../../store';
import type { PlusTable } from '../../tokens';
import type {
  PlusTableEmits,
  PlusTableProps,
  RowData,
} from '../../table/defaults';
import type { PlusTableColumnDef } from '../../table-column/defaults';

export interface TestTable<T extends RowData> {
  scope: EffectScope;
  table: PlusTable<T>;
  props: PlusTableProps<T>;
  store: InternalStore<T>;
  emit: ReturnType<typeof vi.fn>;
  dispose: () => void;
}

export function createTestTable<T extends RowData>(
  options: {
    data: T[];
    columns: PlusTableColumnDef[];
  } & Partial<Omit<PlusTableProps<T>, 'data' | 'columns'>>,
): TestTable<T> {
  const props = reactive({
    rowKey: 'id',
    mode: 'cell',
    validateEvent: false,
    ...options,
  }) as PlusTableProps<T>;
  const emit = vi.fn();
  const table = {
    props,
    emit: ((event: string, ...args: unknown[]) => {
      emit(event, ...args);
      if (event === 'update:data') props.data = args[0] as T[];
    }) as PlusTableEmits<T>,
    slots: {} as Slots,
    gridRef: shallowRef<HTMLElement>(),
    paginationRef: shallowRef<HTMLElement>(),
    ids: {
      description: 'test-description',
      cell: (rowKey: string, colId: string) => `cell-${rowKey}-${colId}`,
      error: (rowKey: string, colId: string) => `error-${rowKey}-${colId}`,
    },
    store: null as unknown as InternalStore<T>,
  } satisfies PlusTable<T>;
  const scope = effectScope();
  let store!: InternalStore<T>;
  scope.run(() => {
    store = createStore(table, props);
  });

  return {
    scope,
    table,
    props,
    store,
    emit,
    dispose: () => scope.stop(),
  };
}

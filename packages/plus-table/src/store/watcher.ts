import { computed, ref, shallowRef } from 'vue';
import { getRowIdentity } from '../util';
import { useColumns } from './columns';
import { useCurrent } from './current';
import { useDependencies } from './dependencies';
import { useDirty } from './dirty';
import { useEditing } from './editing';
import { useHistory } from './history';
import { useRows } from './rows';
import { useValidation } from './validation';
import type { PlusTable } from '../tokens';
import type {
  EditMode,
  RowData,
  RowKey,
} from '../table/defaults';

export interface RowLocation<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
}

export function useWatcher<T extends RowData = RowData>(table: PlusTable<T>) {
  const baseStates = {
    data: shallowRef<T[]>([]),
    rowKey: ref<RowKey<T>>(table.props.rowKey),
    editMode: ref<EditMode | string>(table.props.editMode ?? 'cell'),
    validateEvent: ref<boolean>(table.props.validateEvent ?? true),
    history: ref<boolean>(!!table.props.history),
    dirtyTracking: ref<boolean | undefined>(table.props.dirtyTracking),
  };

  const rowRegistry = computed(() => {
    const keysMap = new Map<string, RowLocation<T>>();
    const rowKeyMap = new WeakMap<T, string>();
    const counts = new Map<string, number>();
    const warn = (message: string) => {
      if ((import.meta as any)?.env?.DEV) console.warn(message);
    };

    baseStates.data.value.forEach((row: T, rowIndex: number) => {
      const raw =
        typeof baseStates.rowKey.value === 'function'
          ? baseStates.rowKey.value(row)
          : row[baseStates.rowKey.value];
      if (raw === undefined || raw === null || raw === '') {
        warn(
          '[PlusTable] 检测到 rowKey 解析出空值，可能导致编辑态 / 校验 / 脏标记串到别的行上，请检查 row-key 配置。',
        );
      }
      const key = String(raw);
      keysMap.set(key, { row, rowIndex });
      rowKeyMap.set(row, key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    for (const [key, count] of counts) {
      if (count > 1) {
        warn(
          `[PlusTable] 检测到重复的 rowKey="${key}"（共 ${count} 行），可能导致编辑态 / 校验 / 脏标记串到别的行上，请确保 row-key 唯一。`,
        );
      }
    }

    return { keysMap, rowKeyMap };
  });

  const states = {
    ...baseStates,
    keysMap: computed(() => rowRegistry.value.keysMap),
    rowKeyMap: computed(() => rowRegistry.value.rowKeyMap),
  };

  const columns = useColumns(table);
  const current = useCurrent(table);
  const dependencies = useDependencies(table);
  const history = useHistory(table);
  const dirty = useDirty(table);
  const validation = useValidation(table);
  const editing = useEditing(table);
  const rows = useRows(table);

  function getRowKey(row: T): string {
    return (
      states.rowKeyMap.value.get(row) ??
      getRowIdentity(row, states.rowKey.value)
    );
  }

  return {
    getRowKey,
    ...columns,
    ...current,
    ...dependencies,
    ...history,
    ...dirty,
    ...validation,
    ...editing,
    ...rows,
    states: {
      ...states,
      ...columns.states,
      ...current.states,
      ...dependencies.states,
      ...history.states,
      ...dirty.states,
      ...validation.states,
      ...editing.states,
      ...rows.states,
    },
  };
}

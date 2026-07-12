import { computed, shallowRef, watch } from 'vue';
import { devWarn, getRowIdentity } from '../util';
import { useColumns } from './columns';
import { useCurrent, type CellRef } from './current';
import { useDependencies } from './dependencies';
import { useDirty } from './dirty';
import { useEditing } from './editing';
import { useHistory } from './history';
import { useRows } from './rows';
import { useValidation } from './validation';
import type { PlusTable } from '../tokens';
import type { EditMode, RowData, RowKey } from '../table/defaults';
import type { ColumnNode } from '../table-column/defaults';

export interface RowLocation<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
}

export interface CellLocation<
  T extends RowData = RowData,
> extends RowLocation<T> {
  node: ColumnNode<T>;
  colIndex: number;
  prop: string;
  rowKey: string;
}

export function useWatcher<T extends RowData = RowData>(table: PlusTable<T>) {
  const baseStates = {
    data: shallowRef<T[]>([]),
    rowKey: computed<RowKey<T>>(() => table.props.rowKey),
    editMode: computed<EditMode>(() => table.props.editMode ?? 'cell'),
    validateEvent: computed<boolean>(() => table.props.validateEvent ?? true),
    history: computed<boolean>(() => !!table.props.history),
    dirtyTracking: computed<boolean>(() => !!table.props.dirtyTracking),
  };

  const rowRegistry = computed(() => {
    const keysMap = new Map<string, RowLocation<T>>();
    const rowKeyMap = new WeakMap<T, string>();
    const counts = new Map<string, number>();

    baseStates.data.value.forEach((row: T, rowIndex: number) => {
      const raw =
        typeof baseStates.rowKey.value === 'function'
          ? baseStates.rowKey.value(row)
          : row[baseStates.rowKey.value];
      if (raw === undefined || raw === null || raw === '') {
        devWarn(
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
        devWarn(
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
  const editing = useEditing(table, current.resolveCellPosition);
  const rows = useRows(table);

  watch(
    columns.states.columnIndexMap,
    (next, previous) => {
      const hiddenIds: string[] = [];
      for (const id of previous.keys()) {
        if (!next.has(id)) hiddenIds.push(id);
      }
      if (hiddenIds.length) editing.discardColumnDrafts(hiddenIds);
      current.cleanCurrent();
      editing.cleanEditingCell();
    },
    { flush: 'sync' },
  );

  watch(rowRegistry, () => {
    current.cleanCurrent();
    editing.cleanEditing();
  });

  function getRowKey(row: T): string {
    return (
      states.rowKeyMap.value.get(row) ??
      getRowIdentity(row, states.rowKey.value)
    );
  }

  /** 按最新行列顺序把稳定身份解析为完整单元格上下文。 */
  function locateCellRef(ref: CellRef): CellLocation<T> | null {
    const position = current.resolveCellPosition(ref);
    if (!position) return null;
    const { rowIndex, colIndex } = position;
    const row = states.data.value[rowIndex];
    const node = columns.states.columns.value[colIndex];
    const prop = node?.column.prop;
    if (!row || !node || !prop) return null;
    return { row, rowIndex, node, colIndex, prop, rowKey: ref.rowKey };
  }

  function locateCell(
    rowIndex: number,
    colIndex: number,
  ): CellLocation<T> | null {
    const ref = current.toCellRef(rowIndex, colIndex);
    return ref ? locateCellRef(ref) : null;
  }

  function getCurrentCellLocation(): CellLocation<T> | null {
    const ref = current.getCurrentRef();
    return ref ? locateCellRef(ref) : null;
  }

  return {
    getRowKey,
    locateCell,
    locateCellRef,
    getCurrentCellLocation,
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
      ...history.states,
      ...dirty.states,
      ...editing.states,
    },
  };
}

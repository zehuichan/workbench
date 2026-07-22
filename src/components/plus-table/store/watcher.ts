import { computed, shallowRef, watch } from 'vue';
import { assertRowKey, getRowIdentity } from '../util';
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

export interface CellLocation<T extends RowData = RowData> extends RowLocation<T> {
  node: ColumnNode<T>;
  colIndex: number;
  prop: string;
  rowKey: string;
}

export function useWatcher<T extends RowData = RowData>(table: PlusTable<T>) {
  const baseStates = {
    data: shallowRef<T[]>([]),
    rowKey: computed<RowKey<T>>(() => table.props.rowKey),
    mode: computed<EditMode>(() => table.props.mode ?? 'cell'),
    validateEvent: computed<boolean>(() => table.props.validateEvent ?? true),
    history: computed<boolean>(() => !!table.props.history),
    dirtyTracking: computed<boolean>(() => !!table.props.dirtyTracking),
  };

  const rowRegistry = computed(() => {
    const keysMap = new Map<string, RowLocation<T>>();
    const rowKeyMap = new WeakMap<T, string>();
    const rowKey = baseStates.rowKey.value;
    assertRowKey(rowKey);

    baseStates.data.value.forEach((row: T, rowIndex: number) => {
      const key = getRowIdentity(row, rowKey);
      const existing = keysMap.get(key);
      if (existing) {
        throw new Error(
          `[PlusTable] rowKey="${key}" 重复：第 ${existing.rowIndex} 行与第 ${rowIndex} 行使用了相同标识。`,
        );
      }
      keysMap.set(key, { row, rowIndex });
      rowKeyMap.set(row, key);
    });

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
  const rowInvalidators = [
    current.invalidateCurrentRow,
    editing.invalidateEditingRow,
    history.invalidateHistoryRow,
    dirty.invalidateDirtyRow,
    validation.invalidateValidationRow,
  ] as const;
  const rowLifecycle = {
    invalidate(rowKeys: Iterable<string>): void {
      for (const rowKey of rowKeys) {
        for (const invalidate of rowInvalidators) invalidate(rowKey);
      }
    },
    committed(): void {
      validation.reindexValidationErrors();
    },
  };

  watch(
    columns.states.visibleColumnsById,
    (next, previous) => {
      const nextProps = new Set(
        [...next.values()].map((node) => node.column.prop).filter((prop): prop is string => !!prop),
      );
      const removedProps = new Set<string>();
      for (const [id, node] of previous) {
        const prop = node.column.prop;
        if (prop && next.get(id)?.column.prop !== prop && !nextProps.has(prop)) {
          removedProps.add(prop);
        }
      }
      editing.discardDraftProps(removedProps);
      current.cleanCurrent();
      editing.cleanEditingCell();
    },
    { flush: 'sync' },
  );

  watch(
    columns.states.validationSchema,
    (next, previous) => {
      const changedProps = new Set(
        [...previous, ...next]
          .map((column) => column.prop)
          .filter((prop): prop is string => !!prop),
      );
      validation.invalidateColumnProps(changedProps);
    },
    { deep: true, flush: 'sync' },
  );

  function getRowKey(row: T): string {
    return states.rowKeyMap.value.get(row) ?? getRowIdentity(row, states.rowKey.value);
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

  function locateCell(rowIndex: number, colIndex: number): CellLocation<T> | null {
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
    rowLifecycle,
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

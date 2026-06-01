import { computed, type Ref } from 'vue';

import type {
  AntTableColumn,
  ColumnDependencies,
  DependencyApi,
  DependencyState,
  RowData,
} from '../types';
import { flattenLeafColumns } from '../utils';

export interface UseDependenciesOptions {
  columns: Ref<AntTableColumn[]>;
  data: Ref<RowData[]>;
  markDirty?: (rowIndex: number, field: string) => void;
}

export interface TriggerMapEntry {
  column: AntTableColumn;
  dep: ColumnDependencies;
}

const DEFAULT_STATE: DependencyState = { disabled: false };

function buildTriggerMap(
  columns: AntTableColumn[],
): Map<string, TriggerMapEntry[]> {
  const map = new Map<string, TriggerMapEntry[]>();
  const flat = flattenLeafColumns(columns);

  for (const column of flat) {
    const dep = column.dependencies;
    if (!dep?.triggerFields?.length) continue;

    for (const field of dep.triggerFields) {
      if (!map.has(field)) map.set(field, []);
      map.get(field)!.push({ column, dep });
    }
  }

  return map;
}

export function useDependencies(options: UseDependenciesOptions) {
  const { columns, data, markDirty } = options;

  const triggerMap = computed(() => buildTriggerMap(columns.value));

  let processing = false;

  function createDependencyApi(
    rowIndex: number,
    row: RowData,
    column: AntTableColumn,
    onSetField?: (rowIndex: number, field: string) => void,
  ): DependencyApi {
    return {
      rowIndex,
      row,
      column,
      getFieldValue: (field: string) => row[field],
      setFieldValue: (field: string, value: any) => {
        (row as Record<string, any>)[field] = value;
        markDirty?.(rowIndex, field);
        onSetField?.(rowIndex, field);
      },
    };
  }

  function resolveDependencyState(
    rowIndex: number,
    column: AntTableColumn,
  ): DependencyState {
    const dep = column.dependencies;
    if (!dep) return DEFAULT_STATE;

    const row = data.value[rowIndex];
    if (!row) return DEFAULT_STATE;

    const api = createDependencyApi(rowIndex, row, column);

    return {
      disabled: dep.disabled ? dep.disabled(row, api) : false,
      required: dep.required ? dep.required(row, api) : undefined,
      rules: dep.rules ? dep.rules(row, api) : undefined,
      componentProps: dep.componentProps
        ? dep.componentProps(row, api)
        : undefined,
    };
  }

  function onFieldChange(rowIndex: number, changedField: string): void {
    if (processing) return;

    const row = data.value[rowIndex];
    if (!row) return;

    const entries = triggerMap.value.get(changedField);
    if (!entries?.length) return;

    processing = true;
    try {
      for (const { column, dep } of entries) {
        if (dep.trigger) {
          const api = createDependencyApi(
            rowIndex,
            row,
            column,
            markDirty ?? undefined,
          );
          dep.trigger.call(null, row, api);
        }
      }
    } finally {
      processing = false;
    }
  }

  return {
    resolveDependencyState,
    onFieldChange,
    triggerMap,
  };
}

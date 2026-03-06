import { computed, type Ref } from 'vue';

import type {
  ColumnDependencies,
  DependencyApi,
  DependencyState,
  PlusTableColumn,
  RowData,
} from '../types';

export interface UseDependenciesOptions {
  columns: Ref<PlusTableColumn[]>;
  data: Ref<RowData[]>;
  markDirty?: (rowIndex: number, prop: string) => void;
}

export interface TriggerMapEntry {
  column: PlusTableColumn;
  dep: ColumnDependencies;
}

const DEFAULT_STATE: DependencyState = { disabled: false };

/** 递归展平列（含 children），仅保留有 prop 的列 */
function flattenColumnsWithProp(
  columns: PlusTableColumn[],
): PlusTableColumn[] {
  const result: PlusTableColumn[] = [];
  for (const col of columns) {
    if (col.children?.length) {
      result.push(...flattenColumnsWithProp(col.children));
    } else if (col.prop) {
      result.push(col);
    }
  }
  return result;
}

function buildTriggerMap(
  columns: PlusTableColumn[],
): Map<string, TriggerMapEntry[]> {
  const map = new Map<string, TriggerMapEntry[]>();
  const flat = flattenColumnsWithProp(columns);

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
    column: PlusTableColumn,
    onSetField?: (rowIndex: number, prop: string) => void,
  ): DependencyApi {
    return {
      rowIndex,
      row,
      column,
      getFieldValue: (prop: string) => row[prop],
      setFieldValue: (prop: string, value: any) => {
        (row as Record<string, any>)[prop] = value;
        markDirty?.(rowIndex, prop);
        onSetField?.(rowIndex, prop);
      },
    };
  }

  function resolveDependencyState(
    rowIndex: number,
    column: PlusTableColumn,
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
        ? dep.componentProps.call(null, row, api)
        : undefined,
    };
  }

  function onFieldChange(rowIndex: number, changedProp: string): void {
    if (processing) return;

    const row = data.value[rowIndex];
    if (!row) return;

    const entries = triggerMap.value.get(changedProp);
    if (!entries?.length) return;

    processing = true;
    try {
      for (const { column, dep } of entries) {
        if (dep.trigger) {
          const api = createDependencyApi(rowIndex, row, column, markDirty ?? undefined);
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

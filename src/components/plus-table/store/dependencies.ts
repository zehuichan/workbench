import type { PlusTable } from '../tokens';
import type { CellRule, RowData } from '../table/defaults';
import type { DependencyApi, PlusTableColumn } from '../table-column/defaults';

export interface DependencyState {
  disabled: boolean;
  required: boolean;
  rules: CellRule[] | null;
  componentProps: Record<string, unknown>;
}

const EMPTY_STATE: DependencyState = {
  disabled: false,
  required: false,
  rules: null,
  componentProps: {},
};

export function useDependencies<T extends RowData = RowData>(
  table: PlusTable<T>,
) {
  function makeApi(row: T, rowIndex: number, prop: string): DependencyApi<T> {
    return {
      row,
      rowIndex,
      prop,
      setValue: (targetProp, value) => {
        table.store.commit('setCellValue', row, rowIndex, targetProp, value);
      },
    };
  }

  /** 渲染 / 校验时取当前联动状态（声明式键随行数据响应式重算） */
  function getDependencyState(
    row: T,
    rowIndex: number,
    column: PlusTableColumn<T>,
  ): DependencyState {
    const dep = column.dependencies;
    if (!dep) return EMPTY_STATE;
    const api = makeApi(row, rowIndex, column.prop ?? '');
    return {
      disabled: !!dep.disabled?.(row, api),
      required: !!dep.required?.(row, api),
      rules: dep.rules?.(row, api) ?? null,
      componentProps: dep.componentProps?.(row, api) ?? {},
    };
  }

  /** 当前同步触发链中已处理的 rowKey -> props，防止 trigger 互相 setValue 造成死循环 */
  let chain: Map<string, Set<string>> | null = null;

  /** 字段提交后广播给依赖方，执行 trigger 副作用 */
  function notifyFieldChange(row: T, rowIndex: number, changedProp: string) {
    const rowKey = table.store.getRowKey(row);
    const isRoot = chain === null;
    if (isRoot) chain = new Map();
    let props = chain!.get(rowKey);
    if (!props) {
      props = new Set();
      chain!.set(rowKey, props);
    }
    if (props.has(changedProp)) return;
    props.add(changedProp);
    try {
      for (const node of table.store.states.allColumns.value) {
        const dep = node.column.dependencies;
        if (!dep?.trigger || !dep.triggerFields.includes(changedProp)) continue;
        dep.trigger(row, makeApi(row, rowIndex, node.column.prop ?? ''));
      }
    } finally {
      if (isRoot) chain = null;
    }
  }

  return {
    getDependencyState,
    notifyFieldChange,
  };
}

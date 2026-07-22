import { isBoolean, isFunction, isPlainObject, isString } from 'es-toolkit';
import { isSpecialColumn } from '../util';
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

const DEPENDENCY_CALLBACK_KEYS = [
  'disabled',
  'required',
  'rules',
  'componentProps',
  'trigger',
] as const;

export function assertColumnDependencies<T extends RowData = RowData>(
  column: PlusTableColumn<T>,
): void {
  const dependencies: unknown = column.dependencies;
  if (dependencies === undefined) return;
  if (!isPlainObject(dependencies)) {
    throw new TypeError('[PlusTable] column.dependencies 必须是配置对象。');
  }
  if (!column.prop || isSpecialColumn(column) || Boolean(column.children?.length)) {
    throw new TypeError('[PlusTable] dependencies 只能配置在具有非空 prop 的叶子数据列上。');
  }
  if (
    !Array.isArray(dependencies.triggerFields) ||
    dependencies.triggerFields.some((field) => !isString(field) || field.length === 0)
  ) {
    throw new TypeError('[PlusTable] dependencies.triggerFields 必须是字段名数组。');
  }
  for (const key of DEPENDENCY_CALLBACK_KEYS) {
    const callback = dependencies[key];
    if (callback !== undefined && !isFunction(callback)) {
      throw new TypeError(`[PlusTable] dependencies.${key} 必须是函数。`);
    }
  }
}

export function useDependencies<T extends RowData = RowData>(table: PlusTable<T>) {
  function requireProp(column: PlusTableColumn<T>): string {
    assertColumnDependencies(column);
    return column.prop!;
  }

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
    const api = makeApi(row, rowIndex, requireProp(column));
    const disabled = dep.disabled?.(row, api);
    const required = dep.required?.(row, api);
    const rules = dep.rules?.(row, api);
    const componentProps = dep.componentProps?.(row, api);
    if (disabled !== undefined && !isBoolean(disabled)) {
      throw new TypeError('[PlusTable] dependencies.disabled 必须返回 boolean。');
    }
    if (required !== undefined && !isBoolean(required)) {
      throw new TypeError('[PlusTable] dependencies.required 必须返回 boolean。');
    }
    if (rules !== undefined && rules !== null && !Array.isArray(rules)) {
      throw new TypeError('[PlusTable] dependencies.rules 必须返回规则数组、null 或 undefined。');
    }
    if (componentProps !== undefined && !isPlainObject(componentProps)) {
      throw new TypeError('[PlusTable] dependencies.componentProps 必须返回普通对象或 undefined。');
    }
    return {
      disabled: disabled ?? false,
      required: required ?? false,
      rules: rules ?? null,
      componentProps: componentProps ?? {},
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
        assertColumnDependencies(node.column);
        const dep = node.column.dependencies;
        if (!dep?.trigger || !dep.triggerFields.includes(changedProp)) continue;
        dep.trigger(row, makeApi(row, rowIndex, requireProp(node.column)));
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

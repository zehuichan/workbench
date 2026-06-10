import type { ComputedRef } from 'vue';
import type {
  CellRule,
  ColumnNode,
  DependencyApi,
  PlusTableColumn,
  RowData,
} from '../types';
import type { WriteCellFn } from './editing';

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

export interface DependenciesOptions {
  allLeafNodes: ComputedRef<ColumnNode[]>;
  getRowKeyStr: (row: RowData) => string;
  /** 晚绑定：writeCell 流水线在 engine 装配阶段才就绪 */
  getWriteCell: () => WriteCellFn;
}

export function createDependencies(options: DependenciesOptions) {
  const { allLeafNodes, getRowKeyStr, getWriteCell } = options;

  function makeApi(row: RowData, rowIndex: number, field: string): DependencyApi {
    return {
      row,
      rowIndex,
      field,
      setValue: (targetField, value) => {
        getWriteCell()(row, rowIndex, targetField, value);
      },
    };
  }

  /** 渲染 / 校验时取当前联动状态（声明式键随行数据响应式重算） */
  function getState(
    row: RowData,
    rowIndex: number,
    column: PlusTableColumn,
  ): DependencyState {
    const dep = column.dependencies;
    if (!dep) return EMPTY_STATE;
    const api = makeApi(row, rowIndex, column.field ?? '');
    return {
      disabled: dep.disabled ? !!dep.disabled(row, api) : false,
      required: dep.required ? !!dep.required(row, api) : false,
      rules: dep.rules ? (dep.rules(row, api) ?? null) : null,
      componentProps: dep.componentProps ? dep.componentProps(row, api) : {},
    };
  }

  /** 当前同步触发链中已处理的 `${rowKey}:${field}`，防止 trigger 互相 setValue 造成死循环 */
  let chain: Set<string> | null = null;

  /** 字段提交后广播给依赖方，执行 trigger 副作用 */
  function notifyFieldChange(row: RowData, rowIndex: number, changedField: string) {
    const chainKey = `${getRowKeyStr(row)}:${changedField}`;
    const isRoot = chain === null;
    if (isRoot) chain = new Set();
    if (chain!.has(chainKey)) return;
    chain!.add(chainKey);
    try {
      for (const node of allLeafNodes.value) {
        const dep = node.column.dependencies;
        if (!dep?.trigger || !dep.triggerFields.includes(changedField)) continue;
        dep.trigger(row, makeApi(row, rowIndex, node.column.field ?? ''));
      }
    } finally {
      if (isRoot) chain = null;
    }
  }

  return { getState, notifyFieldChange };
}

export type DependenciesApi = ReturnType<typeof createDependencies>;

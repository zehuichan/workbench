import type { ComputedRef } from 'vue';
import type { WriteCellFn } from './commit';
import type {
  CellRule,
  ColumnNode,
  DependencyApi,
  PlusTableColumn,
  RowData,
} from '../types';

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

export interface DependenciesOptions<T extends RowData = RowData> {
  allLeafNodes: ComputedRef<ColumnNode<T>[]>;
  getRowKeyStr: (row: T) => string;
  /**
   * 写值流水线：级联联动语义要求 trigger 内的 api.setValue 回到同一条完整流水线（历史/脏追踪/
   * 校验/再次联动），而流水线本身又要在提交后调用 notifyFieldChange 触发这里的 trigger——
   * 两者互相需要对方，是真实存在的双向调用，不是疏漏。engine 装配时用一个稳定的转发函数
   * 打破构造顺序（先转发、后接上真正的 writeCell），因此这里只需接收一个普通的 writeCell 值，
   * 不必是 getter，转发关系不泄漏到本模块的公共选项里。
   */
  writeCell: WriteCellFn<T>;
}

export function createDependencies<T extends RowData = RowData>(
  options: DependenciesOptions<T>,
) {
  const { allLeafNodes, getRowKeyStr, writeCell } = options;

  function makeApi(row: T, rowIndex: number, prop: string): DependencyApi<T> {
    return {
      row,
      rowIndex,
      prop,
      setValue: (targetProp, value) => {
        writeCell(row, rowIndex, targetProp, value);
      },
    };
  }

  /** 渲染 / 校验时取当前联动状态（声明式键随行数据响应式重算） */
  function getState(
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

  /** 当前同步触发链中已处理的 `${rowKey}:${prop}`，防止 trigger 互相 setValue 造成死循环 */
  let chain: Set<string> | null = null;

  /** 字段提交后广播给依赖方，执行 trigger 副作用 */
  function notifyFieldChange(row: T, rowIndex: number, changedProp: string) {
    const chainKey = `${getRowKeyStr(row)}:${changedProp}`;
    const isRoot = chain === null;
    if (isRoot) chain = new Set();
    if (chain!.has(chainKey)) return;
    chain!.add(chainKey);
    try {
      for (const node of allLeafNodes.value) {
        const dep = node.column.dependencies;
        if (!dep?.trigger || !dep.triggerFields.includes(changedProp)) continue;
        dep.trigger(row, makeApi(row, rowIndex, node.column.prop ?? ''));
      }
    } finally {
      if (isRoot) chain = null;
    }
  }

  return { getState, notifyFieldChange };
}

export type DependenciesApi<T extends RowData = RowData> = ReturnType<
  typeof createDependencies<T>
>;

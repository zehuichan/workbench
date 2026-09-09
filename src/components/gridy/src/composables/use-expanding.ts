import type { ExpandedState, Updater } from '@tanstack/vue-table';

import type { ComputedRef, Ref } from 'vue';

import type { GridyEmits, GridyExpandColumn, GridyRecord, GridyRow } from '../types';
import type { GridyResolvedTree } from './use-config';
import type { GridyNode } from './use-row-identity';

import { computed, watch } from 'vue';

import { functionalUpdate } from '@tanstack/vue-table';

import { cellContextOfRow, childrenOf } from '../tree';

/** 展开形态：面板（每行下方渲染子组件）/ 树形（children 子行）/ 未启用 */
export type GridyExpandMode = 'detail' | 'none' | 'tree';

export interface UseExpandingOptions {
  emit: GridyEmits;
  expandColumn: ComputedRef<GridyExpandColumn | undefined>;
  /** 全部可展开节点的 key，`toggleAllRowsExpanded(true)` 时把 `true` 物化成 key 列表；延迟取 table */
  expandableKeys: () => string[];
  expandedRowKeys: Ref<string[]>;
  hasExpandSlot: () => boolean;
  nodeAt: (path: number[]) => GridyNode | undefined;
  nodeKeys: ComputedRef<string[]>;
  /** 分页开启时不清理失效 key——翻页整体换 rows，不能误清跨页展开态 */
  paginationEnabled: ComputedRef<boolean>;
  tree: ComputedRef<GridyResolvedTree | null>;
}

function warnOnce(flag: { done: boolean }, message: string) {
  if (!flag.done && import.meta.env?.DEV) {
    flag.done = true;
    console.warn(`[Gridy] ${message}`);
  }
}
const warnedDetailInTree = { done: false };
const warnedMissingPanel = { done: false };

/**
 * 展开态：`expandedRowKeys` 是唯一真源，TanStack 的 `expanded` atom 由它受控推导；
 * 图标点击直接写 key 集合，不绕 `row.toggleExpanded()`（后者读 atom，与 v-model 同步有一拍时差）。
 * 通过 `table` 实例发起的 `toggleAllRowsExpanded` / `row.toggleExpanded()` 仍经 `onExpandedChange` 回流。
 */
export function useExpanding({
  emit,
  expandColumn,
  expandableKeys,
  expandedRowKeys,
  hasExpandSlot,
  nodeAt,
  nodeKeys,
  paginationEnabled,
  tree,
}: UseExpandingOptions) {
  const mode = computed<GridyExpandMode>(() => {
    if (tree.value) {
      return 'tree';
    }
    return expandColumn.value ? 'detail' : 'none';
  });

  watch(
    mode,
    (value) => {
      if (value === 'tree' && hasExpandSlot()) {
        warnOnce(
          warnedDetailInTree,
          '`#expand` is ignored when `tree` is enabled; the two expanding modes are mutually exclusive.',
        );
      }
      if (value === 'detail' && !hasExpandSlot()) {
        warnOnce(
          warnedMissingPanel,
          'An `expand` column is declared but `#expand` slot is missing; expanded rows will render empty.',
        );
      }
    },
    { immediate: true },
  );

  const expandedKeySet = computed(() => new Set(expandedRowKeys.value));

  function isExpanded(key: string): boolean {
    return expandedKeySet.value.has(key);
  }

  function setExpanded(keys: string[]) {
    expandedRowKeys.value = keys;
    emit('expandedRowsChange', keys);
  }

  /** 受控 state 只含 `expanded`，不碰 sorting 等其他 atom */
  const tableState = computed<{ expanded: ExpandedState }>(() => ({
    expanded: Object.fromEntries(expandedRowKeys.value.map((key) => [key, true])),
  }));

  function onExpandedChange(updater: Updater<ExpandedState>) {
    const next = functionalUpdate(updater, tableState.value.expanded);
    if (next === true) {
      setExpanded(expandableKeys());
      return;
    }
    setExpanded(Object.keys(next).filter((key) => next[key]));
  }

  function toggleRow(row: GridyRow, expanded = !isExpanded(row.id)) {
    if (expanded === isExpanded(row.id)) {
      return;
    }
    if (expanded && !row.getCanExpand()) {
      return;
    }
    const next = new Set(expandedRowKeys.value);
    if (expanded) {
      next.add(row.id);
    } else {
      next.delete(row.id);
    }
    setExpanded([...next]);
    emit('expand', expanded, row.original, row.index);
  }

  /** 展开 `path` 的全部祖先（不含自身），校验滚动 / 新增子节点前调用；返回是否有新展开 */
  function expandAncestors(path: number[]): boolean {
    const missing: string[] = [];
    for (let depth = 1; depth < path.length; depth++) {
      const key = nodeAt(path.slice(0, depth))?.key;
      if (key && !isExpanded(key)) {
        missing.push(key);
      }
    }
    if (missing.length === 0) {
      return false;
    }
    setExpanded([...expandedRowKeys.value, ...missing]);
    return true;
  }

  /** 非树形也给函数：传 `undefined` 会覆盖掉 TanStack 默认的 getSubRows，行模型直接崩 */
  const getSubRows = computed(() => {
    const childrenField = tree.value?.childrenField;
    return (row: GridyRecord) => childrenOf(row, childrenField);
  });

  /** 树形按 subRows（同 TanStack 默认）；面板按 `rowExpandable`；未启用一律不可展开 */
  const getRowCanExpand = computed(() => {
    if (mode.value === 'tree') {
      return (row: GridyRow) => row.subRows.length > 0;
    }
    const rowExpandable = expandColumn.value?.rowExpandable;
    if (mode.value === 'detail') {
      return (row: GridyRow) => (rowExpandable ? rowExpandable(cellContextOfRow(row)) : true);
    }
    return () => false;
  });

  watch(nodeKeys, (keys) => {
    if (paginationEnabled.value || expandedRowKeys.value.length === 0) {
      return;
    }
    const alive = new Set(keys);
    const next = expandedRowKeys.value.filter((key) => alive.has(key));
    if (next.length !== expandedRowKeys.value.length) {
      setExpanded(next);
    }
  });

  return {
    expandAncestors,
    getRowCanExpand,
    getSubRows,
    isExpanded,
    mode,
    onExpandedChange,
    setExpanded,
    tableState,
    toggleRow,
  };
}

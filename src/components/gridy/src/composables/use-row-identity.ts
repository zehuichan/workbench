import type { ComputedRef } from 'vue';

import type { GridyProps, GridyRecord } from '../types';

import { computed } from 'vue';

import { isFunction, isPlainObject } from 'es-toolkit';

import { brandOf, rebrand } from '../brand';
import { pathKey, walkTree } from '../tree';

/** 深度优先展开后的一个节点：key + 路径 + 行对象 */
export interface GridyNode {
  key: string;
  path: number[];
  row: GridyRecord;
}

const warnedDuplicateKeys = new Set<string>();
function warnDuplicateKey(key: string) {
  if (warnedDuplicateKeys.has(key)) {
    return;
  }
  warnedDuplicateKeys.add(key);
  console.warn(
    `[Gridy] Duplicate row key "${key}" detected. A unique key was assigned to the later row; prefer a stable unique rowKey for business identity.`,
  );
}

/**
 * 行身份解析：`rowKey` 优先，缺省时用不可枚举 Symbol 打标，两者都失败时退化为下标。
 * 树形开启时 `flatNodes` 深度优先展开全部节点（含折叠的），选择 / 校验 / 展开态清理都以它为准；
 * `rowKeys` 只含顶层，留给分页 / 合计等顶层语义。
 */
export function useRowIdentity(
  props: GridyProps,
  rows: ComputedRef<GridyRecord[]>,
  childrenField: ComputedRef<string | undefined>,
) {
  /** `index` 为行在父级中的下标，与 TanStack `getRowId` 的第二参一致 */
  function keyOf(row: GridyRecord, index: number): string {
    const { rowKey } = props;
    if (rowKey) {
      const key = isFunction(rowKey) ? rowKey(row, index) : row?.[rowKey];
      if (key !== undefined && key !== null) {
        return String(key);
      }
    }
    if (isPlainObject(row)) {
      return brandOf(row) ?? String(index);
    }
    return String(index);
  }

  /**
   * 品牌撞车（不同对象却同 brand，理论上仅历史可枚举泄漏）时给后出现的行换新 brand。
   * 显式 rowKey 撞车无法自愈业务键，只警告。
   */
  const flatNodes = computed<GridyNode[]>(() => {
    const seen = new Map<string, GridyRecord>();
    const nodes: GridyNode[] = [];
    walkTree(rows.value, childrenField.value, (row, path) => {
      let key = keyOf(row, path.at(-1)!);
      const first = seen.get(key);
      if (first && first !== row) {
        warnDuplicateKey(key);
        if (!props.rowKey && isPlainObject(row)) {
          key = rebrand(row) ?? key;
        }
      }
      seen.set(key, row);
      nodes.push({ key, path, row });
    });
    return nodes;
  });

  const nodeKeys = computed(() => flatNodes.value.map((node) => node.key));
  const nodeRows = computed(() => flatNodes.value.map((node) => node.row));
  const rowKeys = computed(() =>
    flatNodes.value.filter((node) => node.path.length === 1).map((node) => node.key),
  );

  const nodeByPath = computed(
    () => new Map(flatNodes.value.map((node) => [pathKey(node.path), node])),
  );
  const nodeByKey = computed(() => new Map(flatNodes.value.map((node) => [node.key, node])));

  function nodeAt(path: number[]): GridyNode | undefined {
    return nodeByPath.value.get(pathKey(path));
  }

  function nodeOf(key: string): GridyNode | undefined {
    return nodeByKey.value.get(key);
  }

  return { flatNodes, keyOf, nodeAt, nodeKeys, nodeOf, nodeRows, rowKeys };
}

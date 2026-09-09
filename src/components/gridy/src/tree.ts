import type { GridyCellContext, GridyRecord, GridyRow, GridyRowTarget } from './types';

import { isPlainObject } from 'es-toolkit';

import { transferBrand } from './brand';

/**
 * 路径工具：树形与扁平共用一套不可变写法——扁平即长度 1 的路径。
 * `childrenField` 为 `undefined` 表示未开启树形，此时只处理顶层。
 */

export function normalizePath(target: GridyRowTarget): number[] {
  return typeof target === 'number' ? [target] : target;
}

export function pathKey(path: number[]): string {
  return path.join('.');
}

export function parsePathKey(key: string): number[] {
  return key.split('.').map(Number);
}

/** TanStack Row 的路径：沿 parent 链拼接各级 `index` */
export function pathOfRow(row: GridyRow): number[] {
  const path: number[] = [];
  let current: GridyRow | undefined = row;
  while (current) {
    path.unshift(current.index);
    current = current.getParentRow();
  }
  return path;
}

export function cellContextOf(row: GridyRecord, path: number[]): GridyCellContext {
  return { depth: path.length - 1, index: path.at(-1) ?? 0, path, row };
}

export function cellContextOfRow(row: GridyRow): GridyCellContext {
  return cellContextOf(row.original, pathOfRow(row));
}

export function childrenOf(
  row: GridyRecord | undefined,
  childrenField: string | undefined,
): GridyRecord[] | undefined {
  if (!childrenField || !isPlainObject(row)) {
    return undefined;
  }
  const children = row[childrenField];
  return Array.isArray(children) ? children : undefined;
}

/** 深度优先遍历，`visit` 收到节点与其路径 */
export function walkTree(
  list: GridyRecord[],
  childrenField: string | undefined,
  visit: (row: GridyRecord, path: number[]) => void,
  parentPath: number[] = [],
): void {
  for (const [index, row] of list.entries()) {
    const path = [...parentPath, index];
    visit(row, path);
    const children = childrenOf(row, childrenField);
    if (children) {
      walkTree(children, childrenField, visit, path);
    }
  }
}

/** `parentPath` 节点的 children（空路径即顶层列表）；父节点缺 children 时返回空数组 */
export function siblingsAt(
  list: GridyRecord[],
  parentPath: number[],
  childrenField: string | undefined,
): GridyRecord[] {
  if (parentPath.length === 0) {
    return list;
  }
  return childrenOf(getAtPath(list, parentPath, childrenField), childrenField) ?? [];
}

export function getAtPath(
  list: GridyRecord[],
  path: number[],
  childrenField: string | undefined,
): GridyRecord | undefined {
  let siblings: GridyRecord[] | undefined = list;
  let row: GridyRecord | undefined;
  for (const index of path) {
    row = siblings?.[index];
    if (!isPlainObject(row)) {
      return undefined;
    }
    siblings = childrenOf(row, childrenField);
  }
  return row;
}

/**
 * 替换 `parentPath` 处的兄弟数组：沿路径浅拷贝每个祖先并搬迁 brand，其余分支保持引用。
 * 未开启树形时只接受空 `parentPath`。
 */
function updateSiblings(
  list: GridyRecord[],
  parentPath: number[],
  childrenField: string | undefined,
  update: (siblings: GridyRecord[]) => GridyRecord[],
): GridyRecord[] {
  if (parentPath.length === 0) {
    return update(list);
  }
  const [index, ...rest] = parentPath as [number, ...number[]];
  const parent = list[index];
  if (!childrenField || !isPlainObject(parent)) {
    return list;
  }
  const children = childrenOf(parent, childrenField) ?? [];
  const next = {
    ...parent,
    [childrenField]: updateSiblings(children, rest, childrenField, update),
  };
  transferBrand(parent, next);
  const result = [...list];
  result[index] = next;
  return result;
}

export function updateAtPath(
  list: GridyRecord[],
  path: number[],
  childrenField: string | undefined,
  updater: (row: GridyRecord) => GridyRecord,
): GridyRecord[] {
  const index = path.at(-1);
  if (index === undefined) {
    return list;
  }
  return updateSiblings(list, path.slice(0, -1), childrenField, (siblings) => {
    const target = siblings[index];
    if (!isPlainObject(target)) {
      return siblings;
    }
    const next = [...siblings];
    next[index] = updater(target);
    return next;
  });
}

export function removeAtPath(
  list: GridyRecord[],
  path: number[],
  childrenField: string | undefined,
): GridyRecord[] {
  const index = path.at(-1);
  if (index === undefined) {
    return list;
  }
  return updateSiblings(list, path.slice(0, -1), childrenField, (siblings) =>
    siblings.filter((_, i) => i !== index),
  );
}

/** 追加到 `parentPath` 节点的 children 末尾（无 children 时创建）；空路径即顶层追加 */
export function appendChild(
  list: GridyRecord[],
  parentPath: number[],
  child: GridyRecord,
  childrenField: string | undefined,
): GridyRecord[] {
  return updateSiblings(list, parentPath, childrenField, (siblings) => [...siblings, child]);
}

export interface GridyRemovedNode {
  path: number[];
  row: GridyRecord;
}

/**
 * 按谓词过滤整棵树，返回新列表与被删节点（含其在原树中的路径）。
 * 被删节点的子树不再遍历——父节点删掉，子孙自然消失，不重复上报。
 */
export function filterTree(
  list: GridyRecord[],
  childrenField: string | undefined,
  keep: (row: GridyRecord, path: number[]) => boolean,
  parentPath: number[] = [],
  removed: GridyRemovedNode[] = [],
): { list: GridyRecord[]; removed: GridyRemovedNode[] } {
  let changed = false;
  const result: GridyRecord[] = [];
  for (const [index, row] of list.entries()) {
    const path = [...parentPath, index];
    if (!keep(row, path)) {
      removed.push({ path, row });
      changed = true;
      continue;
    }
    const children = childrenOf(row, childrenField);
    if (children && childrenField) {
      const sub = filterTree(children, childrenField, keep, path, removed);
      if (sub.list !== children) {
        const next = { ...row, [childrenField]: sub.list };
        transferBrand(row, next);
        result.push(next);
        changed = true;
        continue;
      }
    }
    result.push(row);
  }
  return { list: changed ? result : list, removed };
}

/** `validate()` 错误 key：扁平 `[0].name`，树形 `[0].children[1].name` */
export function errorKeyOf(
  path: number[],
  field: string,
  childrenField: string | undefined,
): string {
  const segments = path.map((index, depth) =>
    depth === 0 ? `[${index}]` : `.${childrenField}[${index}]`,
  );
  return `${segments.join('')}.${field}`;
}

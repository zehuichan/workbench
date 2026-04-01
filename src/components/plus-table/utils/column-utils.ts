import type { PlusTableColumn } from '../types';

import { SPECIAL_COLUMN_TYPES } from '../constants';

/** 判断列是否为特殊列（selection/index/expand，不在列设置面板展示、不可导航） */
export function isSpecialColumn(col: PlusTableColumn): boolean {
  const type = (col as { type?: string }).type;
  return !!type && (SPECIAL_COLUMN_TYPES as readonly string[]).includes(type);
}

/**
 * 递归展平列（含 children），仅保留有 prop 的叶子列
 * 用于：导航列索引、热键、列设置面板等多级表头场景
 */
export function flattenColumnsWithProp(
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

/** 列设置树节点：供 el-tree 展示与拖拽使用 */
export interface ColumnSettingNode {
  column: PlusTableColumn;
  /** 唯一标识：有 prop 用 prop，无 prop 用 _group:label 等 */
  id: string;
  /** el-tree 展示用 */
  label: string;
  depth: number;
  children?: ColumnSettingNode[];
  /** 是否顶层（可拖拽）；el-tree allow-drag 根据此字段限制 */
  isTopLevel: boolean;
}

/** 特殊列类型的默认展示标签（无 label 时使用） */
const SPECIAL_COLUMN_LABELS: Record<string, string> = {
  expand: '展开',
  selection: '选择',
  index: '序号',
};

/**
 * 获取列在列设置面板中的展示标签
 * 特殊列（expand/selection/index）无 label 时使用友好默认值
 */
export function getColumnDisplayLabel(col: PlusTableColumn): string {
  if (col.label) return col.label as string;
  if (col.prop) return col.prop;
  const type = (col as { type?: string }).type;
  if (type && type in SPECIAL_COLUMN_LABELS) {
    return SPECIAL_COLUMN_LABELS[type] ?? String(type);
  }
  if (col.children?.length) return (col.label ?? '分组') as string;
  return '列';
}

/**
 * 获取列的 id（用于列设置树与 order）
 * - 叶子列：prop
 * - 分组列：_group:${label}
 * - 无 prop 的列：_col:${type}:${label}
 */
export function getColumnId(col: PlusTableColumn): string {
  if (col.prop) return col.prop;
  const label = col.label ?? (col as { type?: string }).type ?? 'unknown';
  if (col.children?.length) return `_group:${label}`;
  const type = (col as { type?: string }).type;
  return type ? `_col:${type}:${String(label)}` : `_col:${String(label)}`;
}

/**
 * 递归收集列下所有有 prop 的叶子 id（用于整组显隐）
 */
export function collectLeafProps(col: PlusTableColumn): string[] {
  if (col.children?.length) {
    return col.children.flatMap(collectLeafProps);
  }
  return col.prop ? [col.prop] : [];
}

/**
 * 构建列设置树，供 el-tree 展示
 * 顶层顺序按 columnOrder 重排，子列保持 initialColumns 的树结构
 */
export function getColumnSettingTree(
  columns: PlusTableColumn[],
  columnOrder: string[],
  depth = 0,
): ColumnSettingNode[] {
  const isTopLevel = depth === 0;
  const nodes: ColumnSettingNode[] = [];

  for (const col of columns) {
    if (isSpecialColumn(col)) continue;

    const id = getColumnId(col);
    const label = getColumnDisplayLabel(col);

    if (col.children?.length) {
      const childNodes = getColumnSettingTree(col.children, columnOrder, depth + 1);
      nodes.push({
        column: col,
        id,
        label,
        depth,
        children: childNodes,
        isTopLevel,
      });
    } else {
      nodes.push({
        column: col,
        id,
        label,
        depth,
        isTopLevel,
      });
    }
  }

  if (isTopLevel && columnOrder.length > 0) {
    const orderMap = new Map(columnOrder.map((p, i) => [p, i]));
    const getIdx = (n: ColumnSettingNode) => orderMap.get(n.id) ?? 9999;
    nodes.sort((a, b) => getIdx(a) - getIdx(b));
  }

  return nodes;
}

/**
 * 从列设置树根按深度优先提取顶层 id 顺序（拖拽后用于更新 columnOrder）
 */
export function extractTopLevelIds(tree: ColumnSettingNode[]): string[] {
  return tree.map((n) => n.id);
}

/**
 * 从 columns 根层收集顶层 id 默认顺序
 */
export function getTopLevelIds(columns: PlusTableColumn[]): string[] {
  return columns.map((col) => getColumnId(col));
}

/**
 * 从 columns 根层收集特殊列（expand/selection/index）的 id 顺序
 * 用于在 setColumnOrderByIds 时保持特殊列位置
 */
export function getSpecialColumnIds(columns: PlusTableColumn[]): string[] {
  const ids: string[] = [];
  for (const col of columns) {
    if (isSpecialColumn(col)) {
      ids.push(getColumnId(col));
    }
  }
  return ids;
}

/**
 * 递归收集列设置树中的叶子节点（有 prop 的）
 */
export function collectLeafNodes(nodes: ColumnSettingNode[]): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    if (n.children?.length) {
      result.push(...collectLeafNodes(n.children));
    } else if (n.column.prop) {
      result.push(n);
    }
  }
  return result;
}

/**
 * 递归收集列设置树中的所有节点（含分组）
 */
export function collectAllNodes(nodes: ColumnSettingNode[]): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children?.length) {
      result.push(...collectAllNodes(n.children));
    }
  }
  return result;
}

/**
 * 按顶层 id 顺序重排根层列（仅根层，子列顺序保持原样）
 */
export function applyTopLevelOrder(
  columns: PlusTableColumn[],
  topLevelOrder: string[],
): PlusTableColumn[] {
  if (topLevelOrder.length === 0) return columns;
  const orderMap = new Map(topLevelOrder.map((id, i) => [id, i]));
  const getIdx = (col: PlusTableColumn) =>
    orderMap.get(getColumnId(col)) ?? 9999;
  return [...columns].sort((a, b) => getIdx(a) - getIdx(b));
}

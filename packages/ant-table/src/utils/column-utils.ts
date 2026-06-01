import type { AntTableColumn } from '../types';

/**
 * 列的行字段键（用于编辑 / 校验 / 脏标记 / 联动）。
 * 仅当 dataIndex 为 string 时返回，数组路径或无 dataIndex 返回 undefined。
 */
export function columnField(col: AntTableColumn): string | undefined {
  if (typeof col.dataIndex === 'string') return col.dataIndex;
  return undefined;
}

/**
 * 列的稳定标识（用于列设置的显隐 / 排序 / 持久化）。
 * 优先级：string dataIndex → key → 分组(_group:title) → _col:title
 */
export function getColumnId(col: AntTableColumn): string {
  if (typeof col.dataIndex === 'string') return col.dataIndex;
  if (Array.isArray(col.dataIndex)) return col.dataIndex.join('.');
  if (typeof col.key === 'string') return col.key;
  const label =
    typeof col.title === 'string' ? col.title : (col.key ?? 'unknown');
  if (col.children?.length) return `_group:${label}`;
  return `_col:${String(label)}`;
}

/** 列在列设置面板中的展示标签 */
export function getColumnDisplayLabel(col: AntTableColumn): string {
  if (typeof col.title === 'string' && col.title) return col.title;
  if (typeof col.dataIndex === 'string') return col.dataIndex;
  if (Array.isArray(col.dataIndex)) return col.dataIndex.join('.');
  if (typeof col.key === 'string') return col.key;
  if (col.children?.length) return '分组';
  return '列';
}

/** 递归展平为叶子列（无 children 的列） */
export function flattenLeafColumns(
  columns: AntTableColumn[],
): AntTableColumn[] {
  const result: AntTableColumn[] = [];
  for (const col of columns) {
    if (col.children?.length) {
      result.push(...flattenLeafColumns(col.children));
    } else {
      result.push(col);
    }
  }
  return result;
}

/** 递归收集列下所有有字段的叶子 id（用于整组显隐） */
export function collectLeafIds(col: AntTableColumn): string[] {
  if (col.children?.length) {
    return col.children.flatMap(collectLeafIds);
  }
  return [getColumnId(col)];
}

// ──── 列设置树 ────

export interface ColumnSettingNode {
  column: AntTableColumn;
  id: string;
  label: string;
  depth: number;
  children?: ColumnSettingNode[];
  /** 是否顶层（仅顶层可排序） */
  isTopLevel: boolean;
}

/** 构建列设置树，顶层按 columnOrder 重排，子列保持原树结构 */
export function getColumnSettingTree(
  columns: AntTableColumn[],
  columnOrder: string[],
  depth = 0,
): ColumnSettingNode[] {
  const isTopLevel = depth === 0;
  const nodes: ColumnSettingNode[] = [];

  for (const col of columns) {
    const id = getColumnId(col);
    const label = getColumnDisplayLabel(col);

    if (col.children?.length) {
      nodes.push({
        column: col,
        id,
        label,
        depth,
        children: getColumnSettingTree(col.children, columnOrder, depth + 1),
        isTopLevel,
      });
    } else {
      nodes.push({ column: col, id, label, depth, isTopLevel });
    }
  }

  if (isTopLevel && columnOrder.length > 0) {
    const orderMap = new Map(columnOrder.map((p, i) => [p, i]));
    const getIdx = (n: ColumnSettingNode) => orderMap.get(n.id) ?? 9999;
    nodes.sort((a, b) => getIdx(a) - getIdx(b));
  }

  return nodes;
}

/** 从 columns 根层收集顶层 id 默认顺序 */
export function getTopLevelIds(columns: AntTableColumn[]): string[] {
  return columns.map((col) => getColumnId(col));
}

/** 按顶层 id 顺序重排根层列（仅根层，子列顺序保持原样） */
export function applyTopLevelOrder(
  columns: AntTableColumn[],
  topLevelOrder: string[],
): AntTableColumn[] {
  if (topLevelOrder.length === 0) return columns;
  const orderMap = new Map(topLevelOrder.map((id, i) => [id, i]));
  const getIdx = (col: AntTableColumn) =>
    orderMap.get(getColumnId(col)) ?? 9999;
  return [...columns].sort((a, b) => getIdx(a) - getIdx(b));
}

/** 递归收集列设置树中的叶子节点 */
export function collectLeafNodes(
  nodes: ColumnSettingNode[],
): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    if (n.children?.length) result.push(...collectLeafNodes(n.children));
    else result.push(n);
  }
  return result;
}

/** 递归收集列设置树中所有节点（含分组） */
export function collectAllNodes(
  nodes: ColumnSettingNode[],
): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children?.length) result.push(...collectAllNodes(n.children));
  }
  return result;
}

import { computed, ref, watch } from 'vue';
import { isPlainObject, sortBy } from 'es-toolkit';
import type { ColumnNode, PlusTableColumn, PlusTableProps } from '../types';
import { isSpecialColumn, SETTINGS_STORAGE_PREFIX } from '../constants';

const ROOT_ID = '__root';

export interface SettingItem {
  id: string;
  parentId: string;
  title: string;
  level: number;
  isGroup: boolean;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}

interface PersistedSettings {
  hidden: string[];
  order: Record<string, string[]>;
  widths: Record<string, number>;
}

function normalize(columns: PlusTableColumn[]): ColumnNode[] {
  const seen = new Map<string, number>();

  const walk = (list: PlusTableColumn[], path: string): ColumnNode[] =>
    list.map((column, index) => {
      const base = column.prop ?? column.label ?? column.type ?? `col-${path}${index}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}#${count}`;
      const children = column.children?.length
        ? walk(column.children, `${path}${index}-`)
        : undefined;
      return { id, column, children };
    });

  return walk(columns, '');
}

function collectLeafIds(node: ColumnNode, into: string[] = []): string[] {
  if (node.children?.length) {
    for (const child of node.children) collectLeafIds(child, into);
  } else {
    into.push(node.id);
  }
  return into;
}

function flattenLeaves(nodes: ColumnNode[], into: ColumnNode[] = []): ColumnNode[] {
  for (const node of nodes) {
    if (node.children?.length) flattenLeaves(node.children, into);
    else into.push(node);
  }
  return into;
}

/** 可参与数据操作的叶子列：排除特殊列（selection/index/expand 由 el-table 原生渲染；operation 操作列无 prop，不可编辑/校验） */
function flattenDataLeaves(nodes: ColumnNode[]): ColumnNode[] {
  return flattenLeaves(nodes).filter((node) => !isSpecialColumn(node.column));
}

function fixedRank(column: PlusTableColumn): number {
  if (column.fixed === 'left') return 0;
  if (column.fixed === 'right') return 2;
  return 1;
}

export function createColumns(props: PlusTableProps) {
  const normalizedTree = computed<ColumnNode[]>(() => normalize(props.columns ?? []));

  const storageKey = props.settingsKey
    ? `${SETTINGS_STORAGE_PREFIX}${props.settingsKey}`
    : null;

  function defaultHiddenIds(): Set<string> {
    const hidden = new Set<string>();
    const walk = (nodes: ColumnNode[]) => {
      for (const node of nodes) {
        if (!isSpecialColumn(node.column) && node.column.visible === false) {
          for (const id of collectLeafIds(node)) hidden.add(id);
        }
        if (node.children?.length) walk(node.children);
      }
    };
    walk(normalizedTree.value);
    return hidden;
  }

  function loadPersisted(): PersistedSettings | null {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
      return {
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
        order: isPlainObject(parsed.order) ? parsed.order : {},
        widths: isPlainObject(parsed.widths) ? parsed.widths : {},
      };
    } catch {
      return null;
    }
  }

  const persisted = loadPersisted();
  const hiddenIds = ref<Set<string>>(
    persisted ? new Set(persisted.hidden) : defaultHiddenIds(),
  );
  const orderMap = ref<Record<string, string[]>>(persisted?.order ?? {});
  /** 表头拖拽调宽后的覆盖宽度（叶子列 id → px） */
  const widthMap = ref<Record<string, number>>(persisted?.widths ?? {});

  if (storageKey) {
    watch([hiddenIds, orderMap, widthMap], () => {
      try {
        const payload: PersistedSettings = {
          hidden: [...hiddenIds.value],
          order: orderMap.value,
          widths: widthMap.value,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // localStorage 不可用（SSR / 隐私模式）时静默降级
      }
    });
  }

  /**
   * 按 orderMap 重排同级列；特殊列（selection/index/expand/operation）不参与排序，锚定在原始下标位置——
   * 声明在最前面的 type: 'index' 列，无论其余列怎么拖拽，永远留在最前面。
   */
  function applyOrder(nodes: ColumnNode[], parentId: string): ColumnNode[] {
    const order = orderMap.value[parentId];
    let list = nodes;
    if (order?.length) {
      const orderableIndexes: number[] = [];
      const orderable: ColumnNode[] = [];
      nodes.forEach((node, index) => {
        if (!isSpecialColumn(node.column)) {
          orderableIndexes.push(index);
          orderable.push(node);
        }
      });
      const pos = new Map(order.map((id, i) => [id, i]));
      const sorted = sortBy(orderable, [(node) => pos.get(node.id) ?? order.length]);
      list = [...nodes];
      orderableIndexes.forEach((originalIndex, i) => {
        list[originalIndex] = sorted[i]!;
      });
    }
    return list.map((node) =>
      node.children?.length
        ? { ...node, children: applyOrder(node.children, node.id) }
        : node,
    );
  }

  /** 特殊列始终可见，不进隐藏名单 */
  function filterHidden(nodes: ColumnNode[]): ColumnNode[] {
    const out: ColumnNode[] = [];
    for (const node of nodes) {
      if (node.children?.length) {
        const children = filterHidden(node.children);
        if (children.length) out.push({ ...node, children });
      } else if (isSpecialColumn(node.column) || !hiddenIds.value.has(node.id)) {
        out.push(node);
      }
    }
    return out;
  }

  /** 顺序与显隐设置后的列树（未做 fixed 排序） */
  const orderedTree = computed(() => applyOrder(normalizedTree.value, ROOT_ID));
  const visibleTree = computed(() => filterHidden(orderedTree.value));

  /**
   * 渲染用列树。el-table 内部会把 fixed 列重排为 [左固定, 普通, 右固定]，
   * 这里在顶层做相同排序，保证 td 的 DOM 顺序与 leafNodes 下标一致，键盘导航才能按下标定位单元格。
   */
  const displayTree = computed(() => {
    return sortBy(visibleTree.value, [(node) => fixedRank(node.column)]);
  });

  /** 可导航/可编辑叶子列（视觉顺序，排除特殊列，含 operation 操作列），供键盘导航、选区边界、列宽持久化使用 */
  const leafNodes = computed(() => flattenDataLeaves(displayTree.value));

  /** 全部叶子列（含列设置隐藏的列，排除特殊列，含 operation 操作列），供校验 / 联动遍历使用 */
  const allLeafNodes = computed(() => flattenDataLeaves(normalizedTree.value));

  const leafIndexById = computed(() => {
    const map = new Map<string, number>();
    leafNodes.value.forEach((node, index) => map.set(node.id, index));
    return map;
  });

  /**
   * leafNodes 下标 → 该列在 <tr> 中的真实 <td> 下标。特殊列（selection/index/expand/operation）
   * 不进 leafNodes，但仍作为真实 <td> 渲染，两者下标会因此错位——DOM 定位（聚焦编辑器 /
   * scrollIntoView）必须走这份映射，不能直接拿 leafNodes 下标当 td 下标用。
   */
  const leafDomIndexes = computed(() => {
    const domIndexes: number[] = [];
    flattenLeaves(displayTree.value).forEach((node, domIndex) => {
      if (!isSpecialColumn(node.column)) domIndexes.push(domIndex);
    });
    return domIndexes;
  });

  function findNode(nodes: ColumnNode[], id: string): ColumnNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const hit = findNode(node.children, id);
        if (hit) return hit;
      }
    }
    return null;
  }

  /** 列设置面板条目：跳过特殊列（selection/index/expand/operation 不可配置） */
  const settingItems = computed<SettingItem[]>(() => {
    const items: SettingItem[] = [];
    const walk = (nodes: ColumnNode[], parentId: string, level: number) => {
      nodes.forEach((node) => {
        if (isSpecialColumn(node.column)) return;
        const leafIds = collectLeafIds(node);
        const visibleCount = leafIds.filter((id) => !hiddenIds.value.has(id)).length;
        items.push({
          id: node.id,
          parentId,
          title: node.column.label ?? node.column.prop ?? node.id,
          level,
          isGroup: !!node.children?.length,
          checked: visibleCount === leafIds.length,
          indeterminate: visibleCount > 0 && visibleCount < leafIds.length,
          disabled: !!node.column.settingDisabled,
        });
        if (node.children?.length) walk(node.children, node.id, level + 1);
      });
    };
    walk(orderedTree.value, ROOT_ID, 0);
    return items;
  });

  function toggleVisible(id: string, visible: boolean) {
    const node = findNode(normalizedTree.value, id);
    if (!node) return;
    const next = new Set(hiddenIds.value);
    for (const leafId of collectLeafIds(node)) {
      if (visible) next.delete(leafId);
      else next.add(leafId);
    }
    hiddenIds.value = next;
  }

  /** 列设置拖拽排序：把 dragId 放到同级 targetId 的前 / 后（跨级拖拽不生效） */
  function reorderNode(dragId: string, targetId: string, position: 'before' | 'after') {
    if (dragId === targetId) return;
    const drag = settingItems.value.find((it) => it.id === dragId);
    const target = settingItems.value.find((it) => it.id === targetId);
    if (!drag || !target || drag.parentId !== target.parentId) return;
    const siblings =
      drag.parentId === ROOT_ID
        ? orderedTree.value
        : (findNode(orderedTree.value, drag.parentId)?.children ?? []);
    const ids = siblings.map((node) => node.id).filter((id) => id !== dragId);
    const index = ids.indexOf(targetId) + (position === 'after' ? 1 : 0);
    ids.splice(index, 0, dragId);
    orderMap.value = { ...orderMap.value, [drag.parentId]: ids };
  }

  /** 记录表头拖拽调宽后的列宽（持久化） */
  function setColumnWidth(id: string, width: number) {
    widthMap.value = { ...widthMap.value, [id]: Math.round(width) };
  }

  function resetSettings() {
    hiddenIds.value = defaultHiddenIds();
    orderMap.value = {};
    widthMap.value = {};
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
  }

  return {
    displayTree,
    leafNodes,
    allLeafNodes,
    leafIndexById,
    leafDomIndexes,
    widthMap,
    settingItems,
    toggleVisible,
    reorderNode,
    setColumnWidth,
    resetSettings,
  };
}

export type ColumnsApi = ReturnType<typeof createColumns>;

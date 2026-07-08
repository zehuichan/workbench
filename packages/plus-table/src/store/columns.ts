import { computed, ref, watch } from 'vue';
import { isPlainObject, sortBy } from 'es-toolkit';
import { isSpecialColumn, SETTINGS_STORAGE_PREFIX } from '../util';
import type { PlusTable } from '../tokens';
import type { RowData } from '../table/defaults';
import type { ColumnNode, PlusTableColumn } from '../table-column/defaults';

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

function normalize<T extends RowData>(
  columns: PlusTableColumn<T>[],
): ColumnNode<T>[] {
  const seen = new Map<string, number>();

  const walk = (list: PlusTableColumn<T>[], path: string): ColumnNode<T>[] =>
    list.map((column, index) => {
      const base =
        column.prop ?? column.label ?? column.type ?? `col-${path}${index}`;
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

function collectLeafIds<T extends RowData>(
  node: ColumnNode<T>,
  into: string[] = [],
): string[] {
  if (node.children?.length) {
    for (const child of node.children) collectLeafIds(child, into);
  } else {
    into.push(node.id);
  }
  return into;
}

function collectConfigurableLeafIds<T extends RowData>(
  node: ColumnNode<T>,
  into: string[] = [],
): string[] {
  if (node.children?.length) {
    for (const child of node.children) collectConfigurableLeafIds(child, into);
  } else if (!isSpecialColumn(node.column)) {
    into.push(node.id);
  }
  return into;
}

function flattenLeaves<T extends RowData>(
  nodes: ColumnNode<T>[],
  into: ColumnNode<T>[] = [],
): ColumnNode<T>[] {
  for (const node of nodes) {
    if (node.children?.length) flattenLeaves(node.children, into);
    else into.push(node);
  }
  return into;
}

/** 可参与数据操作的叶子列：排除特殊列（selection/index/expand 由 el-table 原生渲染；operation 操作列无 prop，不可编辑/校验） */
function flattenDataLeaves<T extends RowData>(
  nodes: ColumnNode<T>[],
): ColumnNode<T>[] {
  return flattenLeaves(nodes).filter((node) => !isSpecialColumn(node.column));
}

function fixedRank<T extends RowData>(column: PlusTableColumn<T>): number {
  if (column.fixed === 'left') return 0;
  if (column.fixed === 'right') return 2;
  return 1;
}

export function useColumns<T extends RowData = RowData>(table: PlusTable<T>) {
  const states = {
    _columns: computed<ColumnNode<T>[]>(() =>
      normalize((table.props.columns ?? []) as PlusTableColumn<T>[]),
    ),
    hiddenIds: ref<Set<string>>(new Set()),
    orderMap: ref<Record<string, string[]>>({}),
    /** 表头拖拽调宽后的覆盖宽度（叶子列 id → px） */
    widthMap: ref<Record<string, number>>({}),
  };

  const storageKey = computed(() =>
    table.props.cache && table.props.id
      ? `${SETTINGS_STORAGE_PREFIX}${table.props.id}`
      : null,
  );

  function defaultHiddenIds(): Set<string> {
    const hidden = new Set<string>();
    const walk = (nodes: ColumnNode<T>[]) => {
      for (const node of nodes) {
        if (!isSpecialColumn(node.column) && node.column.visible === false) {
          for (const id of collectLeafIds(node)) hidden.add(id);
        }
        if (node.children?.length) walk(node.children);
      }
    };
    walk(states._columns.value);
    return hidden;
  }

  function loadPersisted(): PersistedSettings | null {
    if (!storageKey.value) return null;
    try {
      const raw = localStorage.getItem(storageKey.value);
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

  watch(
    storageKey,
    () => {
      const persisted = loadPersisted();
      states.hiddenIds.value = persisted
        ? new Set(persisted.hidden)
        : defaultHiddenIds();
      states.orderMap.value = persisted?.order ?? {};
      states.widthMap.value = persisted?.widths ?? {};
    },
    { immediate: true },
  );

  watch([states.hiddenIds, states.orderMap, states.widthMap], () => {
    if (!storageKey.value) return;
    try {
      const payload: PersistedSettings = {
        hidden: [...states.hiddenIds.value],
        order: states.orderMap.value,
        widths: states.widthMap.value,
      };
      localStorage.setItem(storageKey.value, JSON.stringify(payload));
    } catch {
      // localStorage 不可用（SSR / 隐私模式）时静默降级
    }
  });

  /**
   * 按 orderMap 重排同级列；特殊列（selection/index/expand/operation）不参与排序，锚定在原始下标位置——
   * 声明在最前面的 type: 'index' 列，无论其余列怎么拖拽，永远留在最前面。
   */
  function applyOrder(
    nodes: ColumnNode<T>[],
    parentId: string,
  ): ColumnNode<T>[] {
    const order = states.orderMap.value[parentId];
    let list = nodes;
    if (order?.length) {
      const orderableIndexes: number[] = [];
      const orderable: ColumnNode<T>[] = [];
      nodes.forEach((node, index) => {
        if (!isSpecialColumn(node.column)) {
          orderableIndexes.push(index);
          orderable.push(node);
        }
      });
      const pos = new Map(order.map((id, i) => [id, i]));
      const sorted = sortBy(orderable, [
        (node) => pos.get(node.id) ?? order.length,
      ]);
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
  function filterHidden(nodes: ColumnNode<T>[]): ColumnNode<T>[] {
    const out: ColumnNode<T>[] = [];
    for (const node of nodes) {
      if (node.children?.length) {
        const children = filterHidden(node.children);
        if (children.length) out.push({ ...node, children });
      } else if (
        isSpecialColumn(node.column) ||
        !states.hiddenIds.value.has(node.id)
      ) {
        out.push(node);
      }
    }
    return out;
  }

  const orderedTree = computed(() => applyOrder(states._columns.value, ROOT_ID));
  const visibleTree = computed(() => filterHidden(orderedTree.value));

  /**
   * 渲染用列树。el-table 内部会把 fixed 列重排为 [左固定, 普通, 右固定]，
   * 这里在顶层做相同排序，保证视觉顺序与 columns 下标一致，键盘导航才能按下标定位单元格。
   */
  const originColumns = computed(() =>
    sortBy(visibleTree.value, [(node) => fixedRank(node.column)]),
  );
  const columns = computed(() => flattenDataLeaves(originColumns.value));
  const allColumns = computed(() => flattenDataLeaves(states._columns.value));

  function getColumnIndex(columnKey: string): number {
    return columns.value.findIndex((node) => node.id === columnKey);
  }

  function findNode(nodes: ColumnNode<T>[], id: string): ColumnNode<T> | null {
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
    const walk = (nodes: ColumnNode<T>[], parentId: string, level: number) => {
      nodes.forEach((node) => {
        if (isSpecialColumn(node.column)) return;
        const leafIds = collectLeafIds(node);
        const configurableLeafIds = collectConfigurableLeafIds(node);
        const visibleCount = leafIds.filter(
          (id) => !states.hiddenIds.value.has(id),
        ).length;
        items.push({
          id: node.id,
          parentId,
          title: node.column.label ?? node.column.prop ?? node.id,
          level,
          isGroup: !!node.children?.length,
          checked: visibleCount === leafIds.length,
          indeterminate: visibleCount > 0 && visibleCount < leafIds.length,
          disabled: configurableLeafIds.length === 0,
        });
        if (node.children?.length) walk(node.children, node.id, level + 1);
      });
    };
    walk(orderedTree.value, ROOT_ID, 0);
    return items;
  });

  function toggleColumnVisible(id: string, visible: boolean) {
    const node = findNode(states._columns.value, id);
    if (!node) return;
    const leafIds = collectConfigurableLeafIds(node);
    if (!leafIds.length) return;
    const next = new Set(states.hiddenIds.value);
    for (const leafId of leafIds) {
      if (visible) next.delete(leafId);
      else next.add(leafId);
    }
    states.hiddenIds.value = next;
  }

  /** 列设置拖拽排序：把 dragId 放到同级 targetId 的前 / 后（跨级拖拽不生效） */
  function updateColumnOrder(
    dragId: string,
    targetId: string,
    position: 'before' | 'after',
  ) {
    if (dragId === targetId) return;
    const drag = settingItems.value.find((it) => it.id === dragId);
    const target = settingItems.value.find((it) => it.id === targetId);
    if (!drag || drag.disabled || !target || drag.parentId !== target.parentId)
      return;
    const siblings =
      drag.parentId === ROOT_ID
        ? orderedTree.value
        : (findNode(orderedTree.value, drag.parentId)?.children ?? []);
    const ids = siblings.map((node) => node.id).filter((id) => id !== dragId);
    const index = ids.indexOf(targetId) + (position === 'after' ? 1 : 0);
    ids.splice(index, 0, dragId);
    states.orderMap.value = { ...states.orderMap.value, [drag.parentId]: ids };
  }

  /** 记录表头拖拽调宽后的列宽（持久化） */
  function setColumnWidth(id: string, width: number) {
    states.widthMap.value = { ...states.widthMap.value, [id]: Math.round(width) };
  }

  function resetSettings() {
    states.hiddenIds.value = defaultHiddenIds();
    states.orderMap.value = {};
    states.widthMap.value = {};
    if (storageKey.value) {
      try {
        localStorage.removeItem(storageKey.value);
      } catch {
        // ignore
      }
    }
  }

  return {
    getColumnIndex,
    settingItems,
    toggleColumnVisible,
    updateColumnOrder,
    setColumnWidth,
    resetSettings,
    states: {
      ...states,
      originColumns,
      columns,
      allColumns,
    },
  };
}

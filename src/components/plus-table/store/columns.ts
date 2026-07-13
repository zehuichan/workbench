import { computed, nextTick, ref, watch } from 'vue';
import { defaultWindow } from '@vueuse/core';
import { isNumber, isPlainObject, isString, sortBy } from 'es-toolkit';
import { isSpecialColumn, SETTINGS_STORAGE_PREFIX } from '../util';
import { assertColumnDependencies } from './dependencies';
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOrderMap(value: unknown): value is Record<string, string[]> {
  return isPlainObject(value) && Object.values(value).every(isStringArray);
}

function isWidthMap(value: unknown): value is Record<string, number> {
  return (
    isPlainObject(value) &&
    Object.values(value).every(
      (width) =>
        isNumber(width) && Number.isFinite(width) && width > 0,
    )
  );
}

function parsePersistedSettings(raw: string): PersistedSettings {
  const value: unknown = JSON.parse(raw);
  if (
    !isPlainObject(value) ||
    !isStringArray(value.hidden) ||
    !isOrderMap(value.order) ||
    !isWidthMap(value.widths)
  ) {
    throw new TypeError('[PlusTable] 列设置缓存结构无效。');
  }
  return {
    hidden: value.hidden,
    order: value.order,
    widths: value.widths,
  };
}

interface NormalizedColumns<T extends RowData> {
  tree: ColumnNode<T>[];
  byId: Map<string, ColumnNode<T>>;
  parentById: Map<string, string>;
  byProp: Map<string, ColumnNode<T>[]>;
  leafIdsById: Map<string, readonly string[]>;
  configurableLeafIdsById: Map<string, readonly string[]>;
  allDataColumns: ColumnNode<T>[];
  defaultHiddenIds: Set<string>;
}

interface ColumnView<T extends RowData> {
  originColumns: ColumnNode<T>[];
  columns: ColumnNode<T>[];
  columnIndexMap: Map<string, number>;
  visibleById: Map<string, ColumnNode<T>>;
  settingItems: SettingItem[];
  settingById: Map<string, SettingItem>;
  siblingIdsByParent: Map<string, readonly string[]>;
}

function normalize<T extends RowData>(
  columns: PlusTableColumn<T>[],
): NormalizedColumns<T> {
  const nextSuffix = new Map<string, number>();
  const usedIds = new Set([ROOT_ID]);
  const firstColumnKeyByProp = new Map<string, string | null>();
  const byId = new Map<string, ColumnNode<T>>();
  const parentById = new Map<string, string>();
  const byProp = new Map<string, ColumnNode<T>[]>();
  const leafIdsById = new Map<string, readonly string[]>();
  const configurableLeafIdsById = new Map<string, readonly string[]>();
  const allDataColumns: ColumnNode<T>[] = [];
  const defaultHiddenIds = new Set<string>();

  const walk = (
    list: PlusTableColumn<T>[],
    path: string,
    parentId: string,
  ): ColumnNode<T>[] =>
    list.map((column, index) => {
      assertColumnDependencies(column);
      const explicitId =
        isString(column.columnKey) && column.columnKey.length > 0
          ? column.columnKey
          : null;
      if (!column.children?.length && !isSpecialColumn(column) && column.prop) {
        if (
          firstColumnKeyByProp.has(column.prop) &&
          (!firstColumnKeyByProp.get(column.prop) || !explicitId)
        ) {
          throw new Error(
            `[PlusTable] duplicate prop="${column.prop}" 的列必须分别提供稳定且唯一的 columnKey。`,
          );
        }
        if (!firstColumnKeyByProp.has(column.prop)) {
          firstColumnKeyByProp.set(column.prop, explicitId);
        }
      }
      const base =
        explicitId ??
        column.prop ??
        column.label ??
        column.type ??
        `col-${path}${index}`;
      let id = explicitId;
      if (id) {
        if (usedIds.has(id)) {
          throw new Error(
            `[PlusTable] columnKey="${id}" 重复或与内部保留标识冲突。`,
          );
        }
      } else {
        let suffix = nextSuffix.get(base) ?? 0;
        id = suffix === 0 ? base : `${base}#${suffix}`;
        while (usedIds.has(id)) id = `${base}#${++suffix}`;
        nextSuffix.set(base, suffix + 1);
      }
      usedIds.add(id);
      const children = column.children?.length
        ? walk(column.children, `${path}${index}-`, id)
        : undefined;
      const node = { id, column, children };
      const leafIds = children
        ? children.flatMap((child) => leafIdsById.get(child.id) ?? [])
        : [id];
      const configurableLeafIds = children
        ? children.flatMap(
            (child) => configurableLeafIdsById.get(child.id) ?? [],
          )
        : isSpecialColumn(column)
          ? []
          : [id];

      byId.set(id, node);
      parentById.set(id, parentId);
      leafIdsById.set(id, leafIds);
      configurableLeafIdsById.set(id, configurableLeafIds);
      if (!children && !isSpecialColumn(column)) {
        allDataColumns.push(node);
        if (column.prop) {
          const nodes = byProp.get(column.prop);
          if (nodes) nodes.push(node);
          else byProp.set(column.prop, [node]);
        }
      }
      if (!isSpecialColumn(column) && column.visible === false) {
        for (const leafId of configurableLeafIds) {
          defaultHiddenIds.add(leafId);
        }
      }
      return node;
    });

  return {
    tree: walk(columns, '', ROOT_ID),
    byId,
    parentById,
    byProp,
    leafIdsById,
    configurableLeafIdsById,
    allDataColumns,
    defaultHiddenIds,
  };
}

function fixedRank<T extends RowData>(column: PlusTableColumn<T>): number {
  if (column.fixed === true || column.fixed === 'left') return 0;
  if (column.fixed === 'right') return 2;
  return 1;
}

function orderSiblings<T extends RowData>(
  nodes: ColumnNode<T>[],
  parentId: string,
  orderMap: Record<string, string[]>,
): ColumnNode<T>[] {
  const order = orderMap[parentId];
  if (!order?.length) return nodes;

  const orderableIndexes: number[] = [];
  const orderable: ColumnNode<T>[] = [];
  nodes.forEach((node, index) => {
    if (!isSpecialColumn(node.column)) {
      orderableIndexes.push(index);
      orderable.push(node);
    }
  });
  const position = new Map(order.map((id, index) => [id, index]));
  const sorted = sortBy(orderable, [
    (node) => position.get(node.id) ?? order.length,
  ]);
  const result = [...nodes];
  orderableIndexes.forEach((originalIndex, index) => {
    result[originalIndex] = sorted[index]!;
  });
  return result;
}

function buildColumnView<T extends RowData>(
  normalized: NormalizedColumns<T>,
  hiddenIds: ReadonlySet<string>,
  orderMap: Record<string, string[]>,
): ColumnView<T> {
  const settingItems: SettingItem[] = [];
  const settingById = new Map<string, SettingItem>();
  const siblingIdsByParent = new Map<string, readonly string[]>();

  const visible = (
    nodes: ColumnNode<T>[],
    parentId: string,
    level: number,
  ): ColumnNode<T>[] => {
    const ordered = orderSiblings(nodes, parentId, orderMap);
    siblingIdsByParent.set(
      parentId,
      ordered.map((node) => node.id),
    );
    const result: ColumnNode<T>[] = [];

    for (const node of ordered) {
      if (!isSpecialColumn(node.column)) {
        const configurableIds =
          normalized.configurableLeafIdsById.get(node.id) ?? [];
        const visibleCount = configurableIds.filter(
          (id) => !hiddenIds.has(id),
        ).length;
        const item: SettingItem = {
          id: node.id,
          parentId,
          title: node.column.label ?? node.column.prop ?? node.id,
          level,
          isGroup: !!node.children?.length,
          checked: visibleCount === configurableIds.length,
          indeterminate:
            visibleCount > 0 && visibleCount < configurableIds.length,
          disabled: configurableIds.length === 0,
        };
        settingItems.push(item);
        settingById.set(item.id, item);
      }

      if (node.children?.length) {
        const children = visible(node.children, node.id, level + 1);
        if (children.length) result.push({ ...node, children });
      } else if (isSpecialColumn(node.column) || !hiddenIds.has(node.id)) {
        result.push(node);
      }
    }
    return result;
  };

  const originColumns = sortBy(visible(normalized.tree, ROOT_ID, 0), [
    (node) => fixedRank(node.column),
  ]);
  const columns: ColumnNode<T>[] = [];
  const collectDataColumns = (nodes: ColumnNode<T>[]) => {
    for (const node of nodes) {
      if (node.children?.length) collectDataColumns(node.children);
      else if (!isSpecialColumn(node.column)) columns.push(node);
    }
  };
  collectDataColumns(originColumns);

  return {
    originColumns,
    columns,
    columnIndexMap: new Map(columns.map((node, index) => [node.id, index])),
    visibleById: new Map(columns.map((node) => [node.id, node])),
    settingItems,
    settingById,
    siblingIdsByParent,
  };
}

export function useColumns<T extends RowData = RowData>(table: PlusTable<T>) {
  const normalized = computed<NormalizedColumns<T>>(() => {
    if (!Array.isArray(table.props.columns)) {
      throw new TypeError('[PlusTable] columns 必须是数组。');
    }
    return normalize(table.props.columns as PlusTableColumn<T>[]);
  });
  const states = {
    _columns: computed<ColumnNode<T>[]>(() => normalized.value.tree),
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

  function reportStorageError(
    action: '读取' | '写入' | '重置',
    key: string,
    error: unknown,
  ): void {
    console.error(
      `[PlusTable] 列设置缓存${action}失败（key="${key}"）。`,
      error,
    );
  }

  function defaultHiddenIds(): Set<string> {
    return new Set(normalized.value.defaultHiddenIds);
  }

  function sanitizeSettings(
    settings: PersistedSettings,
    model = normalized.value,
  ): PersistedSettings {
    const configurableIds = new Set(
      model.allDataColumns.map((column) => column.id),
    );
    const order: Record<string, string[]> = {};
    for (const [parentId, ids] of Object.entries(settings.order)) {
      if (parentId !== ROOT_ID && !model.byId.has(parentId)) continue;
      const retained = ids.filter(
        (id) => model.parentById.get(id) === parentId,
      );
      if (retained.length) order[parentId] = retained;
    }
    return {
      hidden: settings.hidden.filter((id) => configurableIds.has(id)),
      order,
      widths: Object.fromEntries(
        Object.entries(settings.widths).filter(([id]) => model.byId.has(id)),
      ),
    };
  }

  function applySettings(settings: PersistedSettings): void {
    states.hiddenIds.value = new Set(settings.hidden);
    states.orderMap.value = settings.order;
    states.widthMap.value = settings.widths;
  }

  function loadPersisted(): PersistedSettings | null {
    const key = storageKey.value;
    if (!key) return null;
    try {
      const storage = defaultWindow?.localStorage;
      if (!storage) throw new Error('localStorage 不可用。');
      const raw = storage.getItem(key);
      if (raw === null) return null;
      return parsePersistedSettings(raw);
    } catch (error) {
      reportStorageError('读取', key, error);
      return null;
    }
  }

  watch(
    storageKey,
    () => {
      const persisted = loadPersisted();
      applySettings(
        sanitizeSettings(
          persisted ?? {
            hidden: [...defaultHiddenIds()],
            order: {},
            widths: {},
          },
        ),
      );
    },
    { immediate: true },
  );

  watch(normalized, (next, previous) => {
    const hiddenIds = new Set(states.hiddenIds.value);
    for (const id of next.defaultHiddenIds) {
      if (!previous.byId.has(id)) hiddenIds.add(id);
    }
    applySettings(
      sanitizeSettings(
        {
          hidden: [...hiddenIds],
          order: states.orderMap.value,
          widths: states.widthMap.value,
        },
        next,
      ),
    );
  });

  watch([states.hiddenIds, states.orderMap, states.widthMap], () => {
    const key = storageKey.value;
    if (!key) return;
    try {
      const storage = defaultWindow?.localStorage;
      if (!storage) throw new Error('localStorage 不可用。');
      const payload: PersistedSettings = {
        hidden: [...states.hiddenIds.value],
        order: states.orderMap.value,
        widths: states.widthMap.value,
      };
      storage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      reportStorageError('写入', key, error);
    }
  });

  /**
   * 一次视图构建同时产出渲染树、可导航叶子、列下标和设置项；归一化树及其索引
   * 只在 props.columns 变化时重建。
   */
  const columnView = computed(() =>
    buildColumnView(
      normalized.value,
      states.hiddenIds.value,
      states.orderMap.value,
    ),
  );
  const originColumns = computed(() => columnView.value.originColumns);
  const columns = computed(() => columnView.value.columns);
  const allColumns = computed(() => normalized.value.allDataColumns);
  const columnIndexMap = computed(() => columnView.value.columnIndexMap);
  const visibleColumnsById = computed(() => columnView.value.visibleById);
  const validationSchema = computed(() =>
    normalized.value.allDataColumns.map((node) => ({
      dependencies: {
        required: node.column.dependencies?.required,
        rules: node.column.dependencies?.rules,
      },
      id: node.id,
      prop: node.column.prop,
      required: node.column.required,
      rules: node.column.rules,
    })),
  );
  const settingItems = computed(() => columnView.value.settingItems);

  function getColumnById(id: string): ColumnNode<T> | null {
    return normalized.value.byId.get(id) ?? null;
  }

  function getColumnsByProp(prop: string): readonly ColumnNode<T>[] {
    return normalized.value.byProp.get(prop) ?? [];
  }

  function getColumnIndex(columnKey: string): number {
    return columnView.value.columnIndexMap.get(columnKey) ?? -1;
  }

  /** 列设置面板跳过 selection/index/expand/operation；组项状态复用归一化叶索引。 */
  function getSettingItem(id: string): SettingItem | undefined {
    return columnView.value.settingById.get(id);
  }

  function getSiblingIds(parentId: string): readonly string[] {
    return columnView.value.siblingIdsByParent.get(parentId) ?? [];
  }

  function toggleColumnVisible(id: string, visible: boolean) {
    const leafIds = normalized.value.configurableLeafIdsById.get(id);
    if (!leafIds?.length) return;
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
    const drag = getSettingItem(dragId);
    const target = getSettingItem(targetId);
    if (!drag || drag.disabled || !target || drag.parentId !== target.parentId)
      return;
    const ids = getSiblingIds(drag.parentId).filter((id) => id !== dragId);
    const index = ids.indexOf(targetId) + (position === 'after' ? 1 : 0);
    ids.splice(index, 0, dragId);
    states.orderMap.value = { ...states.orderMap.value, [drag.parentId]: ids };
  }

  /** 记录表头拖拽调宽后的列宽（持久化） */
  function setColumnWidth(id: string, width: number) {
    if (!getColumnById(id)) {
      throw new Error(`[PlusTable] setColumnWidth 失败：未知列 id="${id}"。`);
    }
    const rounded = Math.round(width);
    if (!Number.isFinite(rounded) || rounded <= 0) {
      throw new RangeError(
        `[PlusTable] setColumnWidth 失败：width 必须是有限正数，收到 ${width}。`,
      );
    }
    states.widthMap.value = {
      ...states.widthMap.value,
      [id]: rounded,
    };
  }

  function resetSettings() {
    const hiddenIds = defaultHiddenIds();
    const orderMap: Record<string, string[]> = {};
    const widthMap: Record<string, number> = {};
    states.hiddenIds.value = hiddenIds;
    states.orderMap.value = orderMap;
    states.widthMap.value = widthMap;
    const key = storageKey.value;
    if (!key) return;
    void nextTick(() => {
      if (
        states.hiddenIds.value.size !== hiddenIds.size ||
        [...hiddenIds].some((id) => !states.hiddenIds.value.has(id)) ||
        Object.keys(states.orderMap.value).length > 0 ||
        Object.keys(states.widthMap.value).length > 0
      ) {
        return;
      }
      try {
        const storage = defaultWindow?.localStorage;
        if (!storage) throw new Error('localStorage 不可用。');
        storage.removeItem(key);
      } catch (error) {
        reportStorageError('重置', key, error);
      }
    });
  }

  return {
    getColumnById,
    getColumnsByProp,
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
      columnIndexMap,
      visibleColumnsById,
      validationSchema,
    },
  };
}

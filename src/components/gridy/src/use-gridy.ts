import type { ColumnDef } from '@tanstack/vue-table';

import type { Ref } from 'vue';

import type { GridyFeatures } from './features';
import type {
  GridyChangeMeta,
  GridyEmits,
  GridyExposed,
  GridyProps,
  GridyRecord,
  GridyRow,
  GridyRowTarget,
  GridyToolbarContext,
  GridyValidateResult,
} from './types';

import { computed, nextTick, shallowRef } from 'vue';

import { useTable } from '@tanstack/vue-table';

import { transferBrand } from './brand';
import {
  useConfig,
  useExpanding,
  usePagination,
  useRowIdentity,
  useSelection,
  useSummary,
  useValidation,
} from './composables';
import { gridyFeatures } from './features';
import {
  appendChild,
  cellContextOf,
  filterTree,
  normalizePath,
  removeAtPath,
  siblingsAt,
  updateAtPath,
  walkTree,
} from './tree';

/** body 注册的滚动宿主：按行 id 滚动（虚拟 / 非虚拟均由 useVirtual 实现） */
export type GridyScrollHost = (rowId: string, align?: 'auto' | 'end') => void;

/** 内部 provide/inject 上下文，形状由 ctx 推导，不进包级公开导出；gridy.vue provide，子组件经 `tokens.ts` 的 `useGridyContext` 取用 */
export type GridyContext = ReturnType<typeof useGridy>['ctx'];

export interface UseGridyOptions {
  hasExpandSlot: () => boolean;
  hasSummarySlot: () => boolean;
  hasToolbarSlot: () => boolean;
}

/**
 * Gridy 核心 setup：编排层，组合各单一职责 composable + TanStack 列/行模型 + 增删改，
 * 返回 { ctx, exposed }。薄壳 gridy.vue 只负责 defineModel / provide / defineExpose，
 * 不下沉任何编排逻辑。
 *
 * 行定位统一用路径（`number[]`）：扁平即 `[index]`，树形是从顶层到目标行的下标链；
 * 写入一律经 `tree.ts` 的不可变工具，沿路径浅拷贝祖先并搬迁 brand。
 */
export function useGridy(
  props: GridyProps,
  emit: GridyEmits,
  model: Ref<GridyRecord[]>,
  selectedRowKeys: Ref<string[]>,
  expandedRowKeys: Ref<string[]>,
  options: UseGridyOptions,
) {
  const rows = computed<GridyRecord[]>(() => model.value ?? []);

  const config = useConfig(props, options);
  const childrenField = computed(() => config.tree.value?.childrenField);
  const identity = useRowIdentity(props, rows, childrenField);
  const pagination = usePagination(props, emit, rows);
  const selection = useSelection({
    emit,
    paginationEnabled: pagination.enabled,
    rowKeys: identity.nodeKeys,
    rows: identity.nodeRows,
    selectedRowKeys,
  });
  const summary = useSummary(props, {
    columns: config.columns,
    hasSummarySlot: options.hasSummarySlot,
    rows,
  });
  const validation = useValidation({
    childrenField,
    dataColumns: config.dataColumns,
    keyOf: identity.keyOf,
    nodeKeys: identity.nodeKeys,
    readonly: config.readonly,
    rows,
  });
  const expanding = useExpanding({
    emit,
    expandColumn: config.expandColumn,
    expandableKeys: () =>
      table
        .getCoreRowModel()
        .flatRows.filter((row) => row.getCanExpand())
        .map((row) => row.id),
    expandedRowKeys,
    hasExpandSlot: options.hasExpandSlot,
    nodeAt: identity.nodeAt,
    nodeKeys: identity.nodeKeys,
    paginationEnabled: pagination.enabled,
    tree: config.tree,
  });

  /** `min` / `max` 只约束顶层行数；子节点增删不受限 */
  const canAdd = computed(
    () =>
      !config.readonly.value &&
      pagination.totalRowCount.value < (props.max ?? Number.POSITIVE_INFINITY),
  );
  const canRemove = computed(
    () => !config.readonly.value && pagination.totalRowCount.value > (props.min ?? 0),
  );

  const columnDefs = computed<ColumnDef<GridyFeatures, GridyRecord>[]>(() =>
    config.dataColumns.value.map((col) => ({
      accessorKey: col.field,
      enableSorting: !!col.sorter,
      header: col.title ?? col.field,
      id: col.field,
      ...(col.width === undefined ? {} : { size: col.width }),
    })),
  );

  /**
   * TanStack Table v9：显式 features + 排序 / 展开行模型；排序态交给 Table 内部 atom，
   * 展开态受控于 `expandedRowKeys`。`autoResetExpanded` 必须关：Gridy 每次编辑都整体换 data，
   * 默认会在 data 变化时 reset expanded 并经 onExpandedChange 回流清空 v-model。
   * 后端分页时切 manualSorting——当前 data 只是一页，客户端排序只能得到「本页序」，
   * 避免静默误导；全量排序需使用方接 sort 事件自行请求（当前未暴露，文档已警示）。
   */
  const table = useTable<GridyFeatures, GridyRecord>({
    features: gridyFeatures,
    columns: columnDefs,
    data: rows,
    autoResetExpanded: false,
    getRowCanExpand: expanding.getRowCanExpand,
    getRowId: (row, index) => identity.keyOf(row, index),
    getSubRows: expanding.getSubRows,
    onExpandedChange: expanding.onExpandedChange,
    state: expanding.tableState,
    get manualSorting() {
      return pagination.enabled.value;
    },
  });

  const renderRows = computed<GridyRow[]>(() => {
    // 冗余保险：显式订阅 sorting / expanded atom（getRowModel 内部也会读）
    void table.atoms.sorting.get();
    void table.atoms.expanded.get();
    return table.getRowModel().rows;
  });

  function defaultRow(parentPath: number[]): GridyRecord {
    if (props.createRow) {
      const parent = identity.nodeAt(parentPath);
      return props.createRow(parent ? cellContextOf(parent.row, parent.path) : undefined);
    }
    return Object.fromEntries(config.dataColumns.value.map((col) => [col.field, undefined]));
  }

  function commitChange(list: GridyRecord[], meta: GridyChangeMeta) {
    model.value = list;
    emit('change', list, meta);
  }

  function setCell(path: number[], field: string, value: unknown) {
    if (config.readonly.value) {
      return;
    }
    const list = updateAtPath(rows.value, path, childrenField.value, (row) => {
      // 不直接改写原始行对象；brand 不可枚举，须显式 transfer 以免丢 key / 重建控件。
      const next = { ...row, [field]: value };
      transferBrand(row, next);
      return next;
    });
    if (list === rows.value) {
      return;
    }
    commitChange(list, { field, index: path.at(-1)!, path, type: 'update' });
    validation.validateCell(path, field, list);
  }

  /** body 注册滚动宿主；公开 scrollToRow 委托于此，能力与 API 同属编排层 */
  const scrollHost = shallowRef<GridyScrollHost | null>(null);
  function registerScrollHost(host: GridyScrollHost | null) {
    scrollHost.value = host;
  }

  /** 树形先展开祖先再滚；刚展开的子行要等一个 tick 才进 renderRows */
  function scrollToRow(target: GridyRowTarget, align: 'auto' | 'end' = 'end') {
    const path = normalizePath(target);
    const node = identity.nodeAt(path);
    if (!node) {
      return;
    }
    if (expanding.expandAncestors(path)) {
      nextTick(() => scrollHost.value?.(node.key, align));
    } else {
      scrollHost.value?.(node.key, align);
    }
  }

  /** 对齐 formApi.validate：有错时滚到首个错误行；errors key 形如 `[index].field` */
  async function validate(): Promise<GridyValidateResult> {
    const { errors, firstErrorPath, valid } = await validation.validate();
    if (firstErrorPath) {
      scrollToRow(firstErrorPath);
    }
    return { errors, valid };
  }

  /** 顶层追加受 `max` 约束；子节点追加要求树形已开启且父节点存在，成功后自动展开父级 */
  function addRow(parentPath: number[] = []) {
    // 模板里 `@click="addRow"` 会把事件对象传进来，按顶层新增处理
    if (!Array.isArray(parentPath)) {
      parentPath = [];
    }
    const isChild = parentPath.length > 0;
    if (isChild ? !canAddChild(parentPath) : !canAdd.value) {
      return;
    }
    const row = defaultRow(parentPath);
    const list = appendChild(rows.value, parentPath, row, childrenField.value);
    const index = siblingsAt(list, parentPath, childrenField.value).length - 1;
    const path = [...parentPath, index];
    commitChange(list, { index, path, type: 'add' });
    emit('add', row, index);
    expanding.expandAncestors(path);
    nextTick(() => scrollToRow(path));
  }

  function canAddChild(parentPath: number[]): boolean {
    if (config.readonly.value) {
      return false;
    }
    if (!childrenField.value) {
      if (import.meta.env?.DEV) {
        console.warn('[Gridy] `addRow(parentPath)` requires `tree` enabled.');
      }
      return false;
    }
    return !!identity.nodeAt(parentPath);
  }

  /** 子树内全部 key（含自身）：删父节点时一并清理选中 / 展开态 */
  function keysWithin(path: number[]): Set<string> {
    const keys = new Set<string>();
    const node = identity.nodeAt(path);
    if (!node) {
      return keys;
    }
    keys.add(node.key);
    walkTree(
      siblingsAt(rows.value, path, childrenField.value),
      childrenField.value,
      (_, subPath) => {
        const key = identity.nodeAt([...path, ...subPath])?.key;
        if (key) {
          keys.add(key);
        }
      },
    );
    return keys;
  }

  function dropKeys(removed: Set<string>) {
    const nextSelected = selectedRowKeys.value.filter((key) => !removed.has(key));
    if (nextSelected.length !== selectedRowKeys.value.length) {
      selection.setSelection(nextSelected);
    }
    const nextExpanded = expandedRowKeys.value.filter((key) => !removed.has(key));
    if (nextExpanded.length !== expandedRowKeys.value.length) {
      expanding.setExpanded(nextExpanded);
    }
  }

  /** 顶层删除受 `min` 约束；删子节点只要求只读关闭。树形连同子树一起删 */
  function removeRow(target: GridyRowTarget) {
    const path = normalizePath(target);
    const node = identity.nodeAt(path);
    if (!node) {
      return;
    }
    const isTopLevel = path.length === 1;
    if (isTopLevel ? !canRemove.value : config.readonly.value) {
      return;
    }
    const list = removeAtPath(rows.value, path, childrenField.value);
    dropKeys(keysWithin(path));
    commitChange(list, { index: node.path.at(-1)!, path, type: 'remove' });
    emit('remove', node.row, path.at(-1)!, list);
  }

  /**
   * 分页时只删除当前页命中的选中项；写入经 commitChange，并对每行 emit remove。
   * 树形：被选父节点连子树一起删，子孙不重复上报；`min` 只按被删的顶层行数校核。
   */
  function removeSelected() {
    if (config.readonly.value || selectedRowKeys.value.length === 0) {
      return;
    }
    const localKeys = selection.localSelectedRowKeys();
    if (localKeys.length === 0) {
      return;
    }
    const localSelected = new Set(localKeys);
    const topLevelCount = identity.flatNodes.value.filter(
      (node) => node.path.length === 1 && localSelected.has(node.key),
    ).length;
    if (pagination.totalRowCount.value - topLevelCount < (props.min ?? 0)) {
      return;
    }
    const { list, removed } = filterTree(
      rows.value,
      childrenField.value,
      (_, path) => !localSelected.has(identity.nodeAt(path)?.key ?? ''),
    );
    const removedKeys = new Set<string>();
    for (const { path } of removed) {
      for (const key of keysWithin(path)) {
        removedKeys.add(key);
      }
    }
    dropKeys(removedKeys);
    const indexes = removed.map(({ path }) => path.at(-1)!);
    commitChange(list, {
      index: indexes[0] ?? 0,
      indexes,
      path: removed[0]?.path,
      paths: removed.map(({ path }) => path),
      type: 'remove',
    });
    for (const { path, row } of removed) {
      emit('remove', row, path.at(-1)!, list);
    }
  }

  function rowOfKey(key: string): GridyRow | undefined {
    return table.getCoreRowModel().rowsById[key];
  }

  function toggleExpanded(rowId: string, expanded?: boolean) {
    const row = rowOfKey(rowId);
    if (row) {
      expanding.toggleRow(row, expanded);
    }
  }

  function toggleRowExpanded(target: GridyRowTarget, expanded?: boolean) {
    const node = identity.nodeAt(normalizePath(target));
    if (node) {
      toggleExpanded(node.key, expanded);
    }
  }

  const toolbarContext = computed<GridyToolbarContext>(() => ({
    addRow,
    clearSelection: selection.clearSelection,
    removeSelected,
    selectedIndexes: selection.selectedIndexes.value,
    selectedPaths: selection.selectedIndexes.value.map(
      (index) => identity.flatNodes.value[index]?.path ?? [index],
    ),
    selectedRowKeys: selectedRowKeys.value,
    selectedRows: selection.selectedRows.value,
    table,
  }));

  /** 只放归一化后的决策值与子组件用到的动作，不整包下发 props（避免绕过归一化） */
  const ctx = {
    actionColumn: config.actionColumn,
    addButton: config.addButton,
    addRow,
    allPageSelected: selection.allPageSelected,
    canAdd,
    canRemove,
    /** 单元格校验错误文案（按行 key + field），只读态恒 `undefined` */
    cellError: validation.errorOf,
    columns: config.columns,
    dataColumns: config.dataColumns,
    elSize: config.elSize,
    expandColumn: config.expandColumn,
    expandMode: expanding.mode,
    isExpanded: expanding.isExpanded,
    /** 列是否带必填语义（表头必填标记） */
    isRequiredColumn: validation.isRequiredColumn,
    isRowSelected: selection.isRowSelected,
    keyboardEnabled: config.keyboardEnabled,
    onPageChange: pagination.onPageChange,
    pageOffset: pagination.pageOffset,
    pageSizeOptions: pagination.pageSizeOptions,
    pagination: pagination.config,
    paginationEnabled: pagination.enabled,
    paginationLayout: pagination.layout,
    paginationSize: pagination.size,
    paginationTotalText: pagination.totalText,
    readonly: config.readonly,
    registerScrollHost,
    removeRow,
    renderRows,
    rows,
    scroll: computed(() => props.scroll),
    selectedRowKeys,
    setCell,
    size: config.size,
    somePageSelected: selection.somePageSelected,
    summary: summary.slotProps,
    summaryCells: summary.cells,
    summaryEnabled: summary.enabled,
    summaryFixed: summary.fixed,
    table,
    toggleAllPage: selection.toggleAllPage,
    toggleExpanded,
    toggleRow: selection.toggleRow,
    toolbar: config.toolbar,
    toolbarContext,
    tree: config.tree,
    virtual: computed(() => props.virtual),
  };

  const exposed = {
    addRow,
    clearSelection: selection.clearSelection,
    clearValidation: validation.clearValidation,
    getSelectedRowKeys: () => selectedRowKeys.value,
    getSelectedRows: () => selection.selectedRows.value,
    removeRow,
    removeSelected,
    scrollToRow,
    table,
    toggleRowExpanded,
    validate,
  } satisfies GridyExposed;

  return { ctx, exposed };
}

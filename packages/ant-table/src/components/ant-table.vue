<script setup lang="ts">
import {
  computed,
  h,
  provide,
  ref,
  toRef,
  useSlots,
} from 'vue';

import { Button as AButton, Table as ATable } from 'ant-design-vue';

import type {
  AdaptiveConfig,
  AntTableColumn,
  AntTableContext,
  AntTableProps,
  RowData,
} from '../types';
import { ANT_TABLE_INJECTION_KEY } from '../constants';
import { columnField, createEditorFocuser, getColumnId } from '../utils';
import {
  type EditCellPayload,
  type EditValueChangePayload,
  useAdaptive,
  useColumnOptions,
  useDependencies,
  useDirtyTracking,
  useEditable,
  useEditActions,
  useEditHistory,
  useHotkey,
  useNavigation,
  useRowOptions,
  useValidation,
} from '../composables';
import AntTableCell from './ant-table-cell.vue';
import AntTableColumnSetting from './ant-table-column-setting.vue';
import AntTablePagination from './ant-table-pagination.vue';

import '../styles/index.scss';

defineOptions({
  name: 'AntTable',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<AntTableProps>(), {
  columns: () => [],
  dataSource: () => [],
  bordered: true,
  editable: false,
  cellActive: true,
  rowActive: true,
  hotkeyEnabled: true,
  adaptive: false,
  columnSetting: true,
  validateTrigger: 'manual',
  validateOnCellExit: false,
  showPaginationTotal: true,
});

const emit = defineEmits<{
  'update:dataSource': [value: RowData[]];
  'cell-edit-start': [payload: EditCellPayload];
  'cell-edit-end': [payload: EditCellPayload];
  'cell-value-change': [payload: EditValueChangePayload];
  'update:current': [current: number];
  'update:pageSize': [size: number];
  change: [payload: { current: number; pageSize: number }];
}>();

const slots = useSlots();
const wrapperEl = ref<HTMLElement | null>(null);
const columnSettingRef = ref<InstanceType<typeof AntTableColumnSetting> | null>(
  null,
);

const hasHeaderContent = computed(
  () => !!slots.title || !!slots.toolbar || props.columnSetting,
);
const hasFooterContent = computed(
  () => props.total != null || !!slots.summary || !!slots.pagination,
);

// ──── 分页（服务端驱动：父级按页提供 dataSource）────

const paginationEnabled = computed(() => props.total != null);
const displayData = computed(() => props.dataSource ?? []);

function handlePageChange(page: number): void {
  emit('update:current', page);
  emit('change', { current: page, pageSize: props.pageSize ?? 10 });
}

function handleSizeChange(size: number): void {
  emit('update:pageSize', size);
  emit('change', { current: props.current ?? 1, pageSize: size });
}

// ──── 列设置 ────

const columnOptions = useColumnOptions({
  initialColumns: computed(() => props.columns ?? []),
  tableKey: props.columnSetting
    ? (props.columnSettingKey ?? 'ant-table-default')
    : undefined,
  storage: props.columnSetting ? 'local' : false,
});

const visibleColumns = columnOptions.visibleColumns;

// ──── 自适应高度 ────

const adaptiveRef = toRef(() => props.adaptive) as ReturnType<
  typeof toRef<boolean | AdaptiveConfig | undefined>
>;

const { scrollY: adaptiveScrollY } = useAdaptive({
  adaptive: adaptiveRef,
  wrapperEl,
});

const scroll = computed(() => {
  const y = adaptiveScrollY.value ?? props.height;
  const result: { x?: number | string; y?: number } = {};
  if (props.scrollX != null) result.x = props.scrollX;
  if (y != null) result.y = y;
  return Object.keys(result).length ? result : undefined;
});

// ──── 导航 ────

const {
  activeRowIndex,
  activeColIndex,
  navigableColumns,
  activeRow,
  activeColumn,
  navigate,
  focusCell,
  handleCellClick,
  isActiveCell,
} = useNavigation({
  data: displayData,
  visibleColumns,
  wrapperEl,
});

// ──── 行操作 ────

const { insertRow, deleteRow, moveRow, duplicateRow } = useRowOptions({
  data: displayData,
  onDataChange: (newData) => emit('update:dataSource', newData),
  activeRowIndex,
});

// ──── 脏数据 ────

const {
  dirtyCells,
  markDirty,
  clearDirty,
  getModifiedRows,
  isRowDirty,
  isCellDirty,
  resetTracking,
  getDirtyCells,
} = useDirtyTracking({ data: displayData });

// ──── 联动 ────

const { resolveDependencyState, onFieldChange } = useDependencies({
  columns: visibleColumns,
  data: displayData,
  markDirty,
});

// ──── 编辑 ────

const {
  isEditing,
  editingRowIndex,
  editingColIndex,
  editMode,
  autoTriggerEnabled,
  isCellEditable,
  startEdit,
  confirmEdit,
  cancelEdit,
  getEditingValue,
  setEditingValue,
  updateEditingValue,
  isEditingCell,
} = useEditable({
  data: displayData,
  navigableColumns,
  activeRowIndex,
  activeColIndex,
  editable: computed(() => props.editable ?? false),
  isDepDisabled: (rowIndex, field) => {
    const column = navigableColumns.value.find((c) => columnField(c) === field);
    if (!column) return false;
    return resolveDependencyState(rowIndex, column).disabled;
  },
  onEditStart: (payload) => emit('cell-edit-start', payload),
  onEditEnd: (payload) => emit('cell-edit-end', payload),
  onValueChange: (payload) => emit('cell-value-change', payload),
});

// ──── 校验 ────

const {
  validate,
  validateField,
  validateFieldsAffectedByChange,
  clearValidation,
  scrollToFirstError,
  getErrorForCell,
} = useValidation({
  data: displayData,
  columns: navigableColumns,
  tableRules: computed(() => props.rules),
  tableEl: wrapperEl,
  trigger: computed(() => props.validateTrigger ?? 'manual'),
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
  resolveDeps: resolveDependencyState,
});

// ──── 编辑历史 ────

const {
  canUndo,
  canRedo,
  pushChange,
  undo: historyUndo,
  redo: historyRedo,
  clearHistory,
} = useEditHistory({ data: displayData });

// ──── 编辑动作（确认 / 撤销 / 重做）────

const { commitEdit, undo, redo } = useEditActions({
  confirmEdit,
  undo: historyUndo,
  redo: historyRedo,
  markDirty,
  pushChange,
  onFieldChange,
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
  validateFieldsAffectedByChange,
});

// ──── 编辑器聚焦 ────

const focusActiveEditor = createEditorFocuser(wrapperEl);

function startEditWithFocus(rowIndex?: number, colIndex?: number): void {
  startEdit(rowIndex, colIndex);
  if (isEditing.value) focusActiveEditor();
}

// ──── 事件 ────

function onCellClick(rowIndex: number, field: string, event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  const clickedInsideEditor = !!target?.closest('.atbl-cell-editor');
  const prevRow = activeRowIndex.value;
  const prevCol = activeColIndex.value;

  handleCellClick(rowIndex, field);

  if (isEditing.value && prevRow >= 0) {
    if (editMode.value === 'row') {
      if (activeRowIndex.value !== prevRow) commitEdit();
    } else if (
      activeRowIndex.value !== prevRow ||
      activeColIndex.value !== prevCol
    ) {
      commitEdit();
    }
  }

  if (!clickedInsideEditor) {
    wrapperEl.value?.focus({ preventScroll: true });
  }
}

function onCellDblClick(rowIndex: number, field: string): void {
  if (!autoTriggerEnabled.value) return;
  handleCellClick(rowIndex, field);
  if (activeRowIndex.value >= 0 && activeColIndex.value >= 0) {
    startEditWithFocus();
  }
}

function onHeaderContextmenu(col: AntTableColumn, event: MouseEvent): void {
  if (!props.columnSetting) return;
  event.preventDefault();
  columnSettingRef.value?.openContextMenu(event, { key: getColumnId(col) });
}

function onResizeColumn(
  width: number,
  column: { key?: string | number },
): void {
  const key = column?.key;
  if (!props.columnSetting || typeof key !== 'string' || typeof width !== 'number')
    return;
  columnOptions.setColumnWidth(key, width);
}

// ──── 列字段查询辅助 ────

function getColIndexByField(field: string): number {
  const idx = navigableColumns.value.findIndex((c) => columnField(c) === field);
  return idx >= 0 ? idx : 0;
}

function focusAndEditByField(rowIndex: number, field: string): void {
  const colIndex = getColIndexByField(field);
  focusCell(rowIndex, colIndex);
  startEditWithFocus(rowIndex, colIndex);
}

// ──── columns → ant-design-vue 列映射 ────

function isColRequired(col: AntTableColumn): boolean {
  if (col.required) return true;
  const rules = Array.isArray(col.rules)
    ? col.rules
    : col.rules
      ? [col.rules]
      : [];
  return rules.some((r) => (r as { required?: boolean }).required);
}

function toAntColumn(col: AntTableColumn): Record<string, any> {
  const {
    customRender: _customRender,
    component: _component,
    componentProps: _componentProps,
    rules: _rules,
    required: _required,
    dependencies: _dependencies,
    editable: _editable,
    hidden: _hidden,
    children,
    customCell: _customCell,
    customHeaderCell: _customHeaderCell,
    ...rest
  } = col;

  const id = getColumnId(col);

  const headerCell = () => ({
    class: isColRequired(col) ? 'atbl-th--required' : undefined,
    onContextmenu: (e: MouseEvent) => onHeaderContextmenu(col, e),
  });

  if (children?.length) {
    return {
      ...rest,
      key: id,
      children: children.map(toAntColumn),
      customHeaderCell: headerCell,
    };
  }

  const field = columnField(col);

  return {
    ...rest,
    key: id,
    customRender: (params: { record: RowData; index: number }) =>
      h(AntTableCell, {
        column: col,
        record: params.record,
        rowIndex: params.index,
        key: id,
      }),
    customCell: (_record: RowData, rowIndex: number) =>
      field
        ? {
            onClick: (e: MouseEvent) => onCellClick(rowIndex, field, e),
            onDblclick: () => onCellDblClick(rowIndex, field),
          }
        : {},
    customHeaderCell: headerCell,
  };
}

const antColumns = computed(() => visibleColumns.value.map(toAntColumn));

// ──── 热键 ────

useHotkey({
  wrapperEl,
  hotkeyEnabled: computed(() => props.hotkeyEnabled ?? true),
  navigate,
  focusCell,
  activeRowIndex,
  activeColIndex,
  data: displayData,
  navigableColumns,
  customHotkeys: computed(() => props.hotkeys),
  editMode,
  autoTriggerEnabled,
  isEditing,
  editingRowIndex,
  startEdit: startEditWithFocus,
  confirmEdit: commitEdit,
  cancelEdit,
  updateCellValue: updateEditingValue,
  isCellEditable,
  undo,
  redo,
  canUndo,
  canRedo,
});

// ──── Provide ────

provide<AntTableContext>(ANT_TABLE_INJECTION_KEY, {
  tableEl: wrapperEl,
  rules: computed(() => props.rules),
  columns: computed(() => props.columns ?? []),
  visibleColumns,
  navigableColumns,
  data: displayData,
  editable: computed(() => props.editable ?? false),
  cellActive: computed(() => props.cellActive ?? true),
  rowActive: computed(() => props.rowActive ?? true),
  activeRowIndex,
  activeColIndex,
  navigate,
  handleCellClick,
  isActiveCell,
  editMode,
  isEditing,
  editingRowIndex,
  editingColIndex,
  isEditingCell,
  isCellEditable,
  startEdit: startEditWithFocus,
  confirmEdit: commitEdit,
  cancelEdit,
  getEditingValue,
  setEditingValue,
  getErrorForCell,
  resolveDependencyState,
  onFieldChange,
  markDirty,
  isCellDirty,
  columnOptions: props.columnSetting
    ? {
        toggleColumn: columnOptions.toggleColumn,
        moveColumn: columnOptions.moveColumn,
        setColumnOrderByIds: columnOptions.setColumnOrderByIds,
        setColumnWidth: columnOptions.setColumnWidth,
        resetColumns: columnOptions.resetColumns,
        snapshotColumnState: columnOptions.snapshotColumnState,
        restoreColumnState: columnOptions.restoreColumnState,
        getColumnSettingTree: columnOptions.getColumnSettingTree,
        isNodeHidden: columnOptions.isNodeHidden,
        columnWidths: columnOptions.columnWidths,
      }
    : undefined,
});

// ──── Expose ────

function openColumnSetting(): void {
  columnSettingRef.value?.open();
}

defineExpose({
  navigate,
  focusCell,
  getColIndexByField,
  focusAndEditByField,
  activeRowIndex,
  activeColIndex,
  activeRow,
  activeColumn,

  editMode,
  isEditing,
  startEdit: startEditWithFocus,
  confirmEdit: commitEdit,
  cancelEdit,

  validate,
  validateField,
  clearValidation,
  scrollToFirstError,

  insertRow,
  deleteRow,
  moveRow,
  duplicateRow,
  getModifiedRows,
  markDirty,
  clearDirty,
  resetTracking,
  getDirtyCells,
  isCellDirty,
  isRowDirty,

  toggleColumn: columnOptions.toggleColumn,
  moveColumn: columnOptions.moveColumn,
  setColumnWidth: columnOptions.setColumnWidth,
  resetColumns: columnOptions.resetColumns,
  openColumnSetting,

  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
});
</script>

<template>
  <div ref="wrapperEl" class="atbl-wrapper" tabindex="0">
    <div v-if="hasHeaderContent" class="atbl-header">
      <div class="atbl-header__title">
        <slot name="title" />
      </div>
      <div class="atbl-header__actions">
        <slot name="toolbar" />
        <a-button
          v-if="columnSetting"
          size="small"
          @click="openColumnSetting"
        >
          列设置
        </a-button>
      </div>
    </div>

    <a-table
      v-bind="$attrs"
      :columns="antColumns"
      :data-source="displayData"
      :row-key="rowKey"
      :bordered="bordered"
      :size="size"
      :scroll="scroll"
      :pagination="false"
      @resize-column="onResizeColumn"
    >
      <template v-if="$slots.expandedRowRender" #expandedRowRender="scope">
        <slot name="expandedRowRender" v-bind="scope" />
      </template>
      <template v-if="$slots.emptyText" #emptyText>
        <slot name="emptyText" />
      </template>
    </a-table>

    <div v-if="hasFooterContent" class="atbl-footer">
      <div class="atbl-footer__summary">
        <slot name="summary" />
      </div>
      <slot name="pagination">
        <ant-table-pagination
          v-if="paginationEnabled"
          :current="current ?? 1"
          :page-size="pageSize ?? 10"
          :total="total ?? 0"
          :page-sizes="pageSizes"
          :show-total="showPaginationTotal"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </slot>
    </div>

    <ant-table-column-setting v-if="columnSetting" ref="columnSettingRef" />
  </div>
</template>

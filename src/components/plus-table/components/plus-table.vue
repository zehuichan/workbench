<script setup lang="ts">
import { computed, nextTick, provide, ref, toRef, useSlots, watch } from 'vue';

import type { AdaptiveConfig, PlusTableContext, PlusTableProps, RowData } from '../types';
import type { EditCellPayload, EditValueChangePayload } from '../composables';
import {
  EXPAND_COLUMN,
  INDEX_COLUMN,
  PLUS_TABLE_INJECTION_KEY,
  SELECTION_COLUMN,
} from '../constants';
import { createEditorFocuser } from '../utils';
import {
  useAdaptive,
  useClassNames,
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
import PlusTableColumn from './plus-table-column.vue';
import PlusTableColumnSetting from './plus-table-column-setting.vue';
import PlusTablePagination from './plus-table-pagination.vue';

import '../styles/index.scss';

defineOptions({
  name: 'PlusTable',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<PlusTableProps>(), {
  columns: () => [],
  data: () => [],
  stripe: false,
  border: true,
  showOverflowTooltip: true,
  editable: false,
  cellActive: true,
  rowActive: true,
  hotkeyEnabled: true,
  adaptive: false,
  columnSetting: true,
  validateTrigger: 'manual',
  validateOnCellExit: false,
});

const emit = defineEmits<{
  scroll: [event: Event];
  'update:data': [value: RowData[]];
  'cell-edit-start': [payload: EditCellPayload];
  'cell-edit-end': [payload: EditCellPayload];
  'cell-value-change': [payload: EditValueChangePayload];
  'update:currentPage': [current: number];
  'update:pageSize': [size: number];
  pagination: [payload: { currentPage: number; pageSize: number }];
}>();

// ──── Slots & Refs ────

const slots = useSlots();
const wrapperEl = ref<HTMLElement | null>(null);
const tableRef = ref<Record<string, any> | null>(null);

const hasHeaderContent = computed(
  () => !!props.columnSetting || !!slots.title || !!slots.actions,
);

const hasFooterContent = computed(
  () => props.total != null || !!slots.summary || !!slots.pagination,
);

// ──── Pagination (server-driven: data provided by parent per page) ────

const paginationEnabled = computed(() => props.total != null);

const displayData = computed(() => props.data ?? []);

function handlePageChange(page: number): void {
  emit('update:currentPage', page);
  emit('pagination', { currentPage: page, pageSize: props.pageSize ?? 10 });
}

function handleSizeChange(size: number): void {
  emit('update:pageSize', size);
  emit('pagination', { currentPage: props.currentPage ?? 1, pageSize: size });
}

// ──── Column Options ────

const columnOptions = useColumnOptions({
  initialColumns: computed(() => props.columns ?? []),
  tableKey: props.columnSetting
    ? (props.columnSettingKey ?? 'plus-table-default')
    : undefined,
  storage: props.columnSetting ? 'local' : false,
});

const visibleColumns = columnOptions.visibleColumns;

// ──── Adaptive Height ────

const adaptiveRef = toRef(() => props.adaptive) as ReturnType<
  typeof toRef<boolean | AdaptiveConfig | undefined>
>;

const { maxHeight: adaptiveMaxHeight } = useAdaptive({
  adaptive: adaptiveRef,
  wrapperEl,
});

watch(adaptiveMaxHeight, () => {
  if (adaptiveMaxHeight.value === '' || adaptiveMaxHeight.value == null) {
    nextTick(() => tableRef.value?.doLayout?.());
  }
});

// ──── Navigation ────

const {
  activeRowIndex,
  activeColIndex,
  navigableColumns,
  activeRow,
  activeColumn,
  navigate,
  focusCell,
  handleCellClick,
  getCellClassName,
  getRowClassName,
} = useNavigation({
  data: displayData,
  visibleColumns,
  tableRef,
});

// ──── Row Operations ────

const { insertRow, deleteRow, moveRow, duplicateRow } = useRowOptions({
  data: displayData,
  onDataChange: (newData) => emit('update:data', newData),
  activeRowIndex,
});

// ──── Dirty Tracking ────

const {
  dirtyCells,
  markDirty,
  clearDirty,
  getModifiedRows,
  isRowDirty,
  isCellDirty,
  resetTracking,
  getDirtyCells,
} = useDirtyTracking({
  data: displayData,
});

// ──── Dependencies ────

const { resolveDependencyState, onFieldChange } = useDependencies({
  columns: visibleColumns,
  data: displayData,
  markDirty,
});

// ──── Editable ────

const {
  isEditing,
  editingRowIndex,
  editingColIndex,
  editingValue,
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
  isDepDisabled: (rowIndex, colProp) => {
    const column = navigableColumns.value.find((c) => c.prop === colProp);
    if (!column) return false;
    return resolveDependencyState(rowIndex, column).disabled;
  },
  onEditStart: (payload) => emit('cell-edit-start', payload),
  onEditEnd: (payload) => emit('cell-edit-end', payload),
  onValueChange: (payload) => emit('cell-value-change', payload),
});

// ──── Validation ────

const {
  validate,
  validateField,
  validateFieldsAffectedByChange,
  clearValidation,
  scrollToFirstError,
  getErrorForCell: getErrorForCellRaw,
} = useValidation({
  data: displayData,
  columns: navigableColumns,
  tableRules: computed(() => props.rules),
  tableEl: wrapperEl,
  trigger: computed(() => props.validateTrigger ?? 'manual'),
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
  resolveDeps: resolveDependencyState,
});

// ──── Edit History ────

const {
  canUndo,
  canRedo,
  pushChange,
  undo: historyUndo,
  redo: historyRedo,
  clearHistory,
} = useEditHistory({
  data: displayData,
});

// ──── Class Names ────

const {
  rowClassNameBinding: getRowClassNameBinding,
  cellClassNameBinding: getCellClassNameBinding,
} = useClassNames({
  cellActive: computed(() => props.cellActive ?? true),
  rowActive: computed(() => props.rowActive ?? true),
  activeRowIndex,
  activeColIndex,
  dirtyCells,
  getCellClassName,
  getRowClassName,
  getErrorForCell: getErrorForCellRaw,
  isCellDirty,
  isRowDirty,
});

// ──── Edit Actions ────

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

// ──── Event Handlers ────

const focusActiveEditor = createEditorFocuser(wrapperEl);

function startEditWithFocus(rowIndex?: number, colIndex?: number): void {
  startEdit(rowIndex, colIndex);
  if (isEditing.value) focusActiveEditor();
}

function onCellClick(
  row: RowData,
  column: any,
  _cell: any,
  event: MouseEvent,
): void {
  const target = event.target as HTMLElement | null;
  const clickedInsideEditor = !!target?.closest('.plus-table-cell-editor');
  const prevRow = activeRowIndex.value;
  const prevCol = activeColIndex.value;
  handleCellClick(row, column);

  if (isEditing.value && prevRow >= 0) {
    if (editMode.value === 'row') {
      if (activeRowIndex.value !== prevRow) {
        commitEdit();
      }
    } else {
      if (
        activeRowIndex.value !== prevRow ||
        activeColIndex.value !== prevCol
      ) {
        commitEdit();
      }
    }
  }

  if (!clickedInsideEditor) {
    wrapperEl.value?.focus({ preventScroll: true });
  }
}

function getColIndexByProp(colProp: string): number {
  const idx = navigableColumns.value.findIndex((c) => c.prop === colProp);
  return idx >= 0 ? idx : 0;
}

function focusAndEditByProp(rowIndex: number, colProp: string): void {
  const colIndex = getColIndexByProp(colProp);
  focusCell(rowIndex, colIndex);
  startEditWithFocus(rowIndex, colIndex);
}

function onCellDblClick(row: RowData, column: any): void {
  if (!autoTriggerEnabled.value) return;
  handleCellClick(row, column);
  if (activeRowIndex.value >= 0 && activeColIndex.value >= 0) {
    startEditWithFocus();
  }
}

function onHeaderDragEnd(
  newWidth: number,
  _oldWidth: number,
  column: { property?: string },
): void {
  if (
    !props.columnSetting ||
    !column?.property ||
    typeof newWidth !== 'number' ||
    newWidth <= 0
  )
    return;
  columnOptions.setColumnWidth(column.property, newWidth);
}

// ──── Hotkey ────

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

provide<PlusTableContext>(PLUS_TABLE_INJECTION_KEY, {
  tableEl: wrapperEl,
  tableInstance: tableRef,
  rules: computed(() => props.rules),
  columns: computed(() => props.columns ?? []),
  visibleColumns,
  navigableColumns,
  data: displayData,
  editable: computed(() => props.editable ?? false),
  activeRowIndex,
  activeColIndex,
  navigate,
  editMode,
  isEditing,
  editingRowIndex,
  editingColIndex,
  editingValue,
  isEditingCell,
  isCellEditable,
  startEdit: startEditWithFocus,
  confirmEdit: commitEdit,
  cancelEdit,
  updateEditingValue,
  getEditingValue,
  setEditingValue,
  getErrorForCell: getErrorForCellRaw,
  resolveDependencyState,
  onFieldChange,
  markDirty,
  columnOptions: props.columnSetting
    ? {
        toggleColumn: columnOptions.toggleColumn,
        reorderColumns: columnOptions.reorderColumns,
        setColumnOrderByIds: columnOptions.setColumnOrderByIds,
        setColumnWidth: columnOptions.setColumnWidth,
        resetColumns: columnOptions.resetColumns,
        snapshotColumnState: columnOptions.snapshotColumnState,
        restoreColumnState: columnOptions.restoreColumnState,
        getOrderedColumnsWithProp: columnOptions.getOrderedColumnsWithProp,
        getColumnSettingTree: columnOptions.getColumnSettingTree,
        isColumnHidden: columnOptions.isColumnHidden,
        isNodeHidden: columnOptions.isNodeHidden,
        columnWidths: columnOptions.columnWidths,
      }
    : undefined,
});

// ──── Expose ────

const getElTable = () => tableRef.value;

defineExpose({
  getElTable,

  navigate,
  focusCell,
  getColIndexByProp,
  focusAndEditByProp,
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
  reorderColumns: columnOptions.reorderColumns,
  setColumnWidth: columnOptions.setColumnWidth,
  resetColumns: columnOptions.resetColumns,

  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,

  clearSelection: () => getElTable()?.clearSelection(),
  getSelectionRows: () => getElTable()?.getSelectionRows(),
  toggleRowSelection: (...args: any[]) =>
    getElTable()?.toggleRowSelection(...args),
  toggleAllSelection: () => getElTable()?.toggleAllSelection(),
  toggleRowExpansion: (...args: any[]) =>
    getElTable()?.toggleRowExpansion(...args),
  setCurrentRow: (...args: any[]) => getElTable()?.setCurrentRow(...args),
  clearSort: () => getElTable()?.clearSort(),
  clearFilter: (...args: any[]) => getElTable()?.clearFilter(...args),
  doLayout: () => getElTable()?.doLayout(),
  sort: (...args: any[]) => getElTable()?.sort(...args),
  scrollTo: (...args: any[]) => getElTable()?.scrollTo(...args),
  setScrollTop: (...args: any[]) => getElTable()?.setScrollTop(...args),
  setScrollLeft: (...args: any[]) => getElTable()?.setScrollLeft(...args),
});
</script>

<template>
  <div ref="wrapperEl" class="plus-table-wrapper" tabindex="0">
    <div
      v-if="hasHeaderContent"
      class="plus-table-header flex items-center justify-between py-2"
    >
      <slot name="title" />
      <div>
        <slot name="actions" />
        <plus-table-column-setting v-if="columnSetting" />
      </div>
    </div>
    <el-table
      v-bind="$attrs"
      ref="tableRef"
      :data="displayData"
      :row-key="rowKey"
      :stripe="stripe"
      :border="border"
      :show-overflow-tooltip="showOverflowTooltip"
      :max-height="maxHeight ?? adaptiveMaxHeight"
      :cell-class-name="getCellClassNameBinding"
      :row-class-name="getRowClassNameBinding"
      highlight-current-row
      @cell-click="onCellClick"
      @cell-dblclick="onCellDblClick"
      @header-dragend="onHeaderDragEnd"
    >
      <template #default>
        <slot>
          <template
            v-for="(column, idx) in visibleColumns"
            :key="(column as any).key ?? column.prop ?? column.type ?? idx"
          >
            <el-table-column
              v-if="
                [SELECTION_COLUMN, INDEX_COLUMN].includes(column.type as any)
              "
              v-bind="column"
            />

            <el-table-column
              v-else-if="column.type === EXPAND_COLUMN"
              v-bind="column"
            >
              <template #default="scope">
                <slot name="expand" v-bind="scope" />
              </template>
            </el-table-column>

            <plus-table-column v-else :item="column">
              <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
                <slot :name="name" v-bind="scope ?? {}" />
              </template>
            </plus-table-column>
          </template>
        </slot>
      </template>

      <template #append>
        <slot name="append" />
      </template>

      <template #empty>
        <slot name="empty" />
      </template>
    </el-table>
    <div
      v-if="hasFooterContent"
      class="plus-table-footer flex items-center justify-between py-2"
    >
      <slot name="summary" />
      <slot name="pagination">
        <plus-table-pagination
          v-if="paginationEnabled"
          :current-page="currentPage ?? 1"
          :page-size="pageSize ?? 10"
          :total="total ?? 0"
          :page-sizes="pageSizes"
          :layout="paginationLayout"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </slot>
    </div>
  </div>
</template>

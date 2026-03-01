<template>
  <div ref="wrapperEl" class="re-table-next-wrapper" tabindex="0">
    <div
      v-if="hasHeaderContent"
      class="re-table-next-header flex items-center justify-between py-2"
    >
      <slot name="title" />
      <div>
        <slot name="actions" />
        <re-table-next-column-setting v-if="columnSetting" />
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
            <component
              v-if="
                [SELECTION_COLUMN, INDEX_COLUMN].includes(column.type as any)
              "
              :is="h(ElTableColumn, column, slots)"
            />

            <component
              v-else-if="[EXPAND_COLUMN].includes(column.type as any)"
              :is="
                h(ElTableColumn, column, {
                  default: (scope: unknown) =>
                    slots.expand && slots.expand(scope),
                })
              "
            />

            <component
              v-else
              :is="h(ReTableNextColumn, { item: column }, slots)"
            />
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
      class="re-table-next-footer flex items-center justify-between py-2"
    >
      <slot name="summary" />
      <slot name="pagination">
        <re-table-next-pagination
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

<script setup lang="ts">
import {
  computed,
  h,
  nextTick,
  provide,
  ref,
  toRef,
  useSlots,
  watch,
} from 'vue';

import { ElTableColumn } from 'element-plus';

import type {
  AdaptiveConfig,
  ReTableNextContext,
  ReTableNextProps,
  RowData,
} from './types';
import type {
  EditCellPayload,
  EditValueChangePayload,
} from './composables/use-editable';
import {
  EXPAND_COLUMN,
  INDEX_COLUMN,
  RE_TABLE_NEXT_INJECTION_KEY,
  SELECTION_COLUMN,
} from './constants';
import {
  useAdaptive,
  useClassNames,
  useColumnOptions,
  useDirtyTracking,
  useEditable,
  useEditHistory,
  useHotkey,
  useNavigation,
  useRowOptions,
  useValidation,
} from './composables';
import { createEditorFocuser } from './utils';
import ReTableNextColumn from './re-table-next-column.vue';
import ReTableNextColumnSetting from './re-table-next-column-setting.vue';
import ReTableNextPagination from './re-table-next-pagination.vue';

import './styles/index.scss';

defineOptions({
  name: 'ReTableNext',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ReTableNextProps>(), {
  columns: () => [],
  data: () => [],
  stripe: false,
  border: true,
  showOverflowTooltip: true,
  editable: false,
  cellActive: true,
  rowActive: false,
  hotkeyEnabled: true,
  adaptive: false,
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

// ──── 分页（传 total 即启用，仅服务端分页：data 由 parent 按页传入）────

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

// ──── 列可见性（含列设置：显隐、排序、持久化）────

const columnOptions = useColumnOptions({
  initialColumns: computed(() => props.columns ?? []),
  tableKey: props.columnSetting ? 're-table-next-default' : undefined,
  storage: props.columnSetting ? 'local' : false,
});

const visibleColumns = columnOptions.visibleColumns;

// ──── 自适应高度 ────

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

// ──── 单元格导航 ────

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

// ──── 行操作（依赖 activeRowIndex，移动行后会同步更新激活行）────

const { insertRow, deleteRow, moveRow, duplicateRow } = useRowOptions({
  data: computed(() => props.data ?? []),
  onDataChange: (newData) => emit('update:data', newData),
  activeRowIndex,
});

// ──── 编辑系统 ────

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
  getErrorForCell: getErrorForCellRaw,
} = useValidation({
  data: computed(() => props.data ?? []),
  columns: navigableColumns,
  tableRules: computed(() => props.rules),
  tableEl: wrapperEl,
  trigger: computed(() => props.validateTrigger ?? 'manual'),
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
});

// ──── 编辑历史 ────

const { canUndo, canRedo, pushChange, undo, redo, clearHistory } =
  useEditHistory({
    data: computed(() => props.data ?? []),
  });

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
  data: computed(() => props.data ?? []),
});

const {
  rowClassNameBinding: getRowClassNameBinding,
  cellClassNameBinding: getCellClassNameBinding,
} = useClassNames({
  cellActive: computed(() => props.cellActive),
  rowActive: computed(() => props.rowActive),
  activeRowIndex,
  activeColIndex,
  dirtyCells,
  getCellClassName,
  getRowClassName,
  getErrorForCell: getErrorForCellRaw,
  isCellDirty,
  isRowDirty,
});

const confirmEditWithHistory = () => {
  const changes = confirmEdit();
  if (changes && props.validateOnCellExit) {
    for (const c of changes) {
      const globalRow = c.rowIndex;
      validateFieldsAffectedByChange(globalRow, c.colProp).catch(() => {});
    }
  }
  if (changes) {
    for (const c of changes) {
      markDirty(c.rowIndex, c.colProp);
    }
    pushChange(changes);
  }
  return changes;
};

/** 包装 undo：执行撤销后清除本批涉及单元格的 dirty 标识 */
const wrappedUndo = () => {
  const reverted = undo();
  if (reverted) {
    reverted.forEach((c) => clearDirty(c.rowIndex, c.colProp));
  }
};

/** 包装 redo：执行重做后把本批涉及单元格标记为 dirty */
const wrappedRedo = () => {
  const redone = redo();
  if (redone) {
    redone.forEach((c) => markDirty(c.rowIndex, c.colProp));
  }
};

// ──── 事件处理 ────

function onCellClick(
  row: RowData,
  column: any,
  _cell: any,
  event: MouseEvent,
): void {
  const target = event.target as HTMLElement | null;
  const clickedInsideEditor = !!target?.closest('.re-table-next-cell-editor');
  const prevRow = activeRowIndex.value;
  const prevCol = activeColIndex.value;
  handleCellClick(row, column);

  if (isEditing.value && prevRow >= 0) {
    if (editMode.value === 'row') {
      // Row 模式：切换到不同行时确认
      if (activeRowIndex.value !== prevRow) {
        confirmEditWithHistory();
      }
    } else {
      // Cell / manual 模式：切换到不同单元格时确认
      if (
        activeRowIndex.value !== prevRow ||
        activeColIndex.value !== prevCol
      ) {
        confirmEditWithHistory();
      }
    }
  }

  if (!clickedInsideEditor) {
    wrapperEl.value?.focus({ preventScroll: true });
  }
}

const focusActiveEditor = createEditorFocuser(wrapperEl);

/** 进入编辑并随后聚焦编辑器（对外/热键/双击统一走此入口） */
function startEditWithFocus(rowIndex?: number, colIndex?: number): void {
  startEdit(rowIndex, colIndex);
  if (isEditing.value) focusActiveEditor();
}

function onCellDblClick(row: RowData, column: any): void {
  if (!autoTriggerEnabled.value) return;
  handleCellClick(row, column);
  if (activeRowIndex.value >= 0 && activeColIndex.value >= 0) {
    startEditWithFocus();
  }
}

/** 表头拖拽结束（调整列宽）：将新列宽写入列配置并持久化。参数为 (newWidth, oldWidth, column)。 */
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

// ──── 热键引擎 ────

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
  confirmEdit: confirmEditWithHistory,
  cancelEdit,
  updateCellValue: updateEditingValue,
  isCellEditable,
  undo: wrappedUndo,
  redo: wrappedRedo,
  canUndo,
  canRedo,
});

// ──── Provide ────

provide<ReTableNextContext>(RE_TABLE_NEXT_INJECTION_KEY, {
  tableEl: wrapperEl,
  tableInstance: computed(() => tableRef.value) as any,
  rules: computed(() => props.rules),
  columns: computed(() => props.columns ?? []),
  visibleColumns,
  navigableColumns,
  data: computed(() => props.data ?? []),
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
  confirmEdit: confirmEditWithHistory,
  cancelEdit,
  updateEditingValue,
  getEditingValue,
  setEditingValue,
  getErrorForCell: (localRowIndex: number, prop: string) =>
    getErrorForCellRaw(localRowIndex, prop),
  columnOptions: props.columnSetting
    ? {
        toggleColumn: columnOptions.toggleColumn,
        reorderColumns: columnOptions.reorderColumns,
        setColumnWidth: columnOptions.setColumnWidth,
        resetColumns: columnOptions.resetColumns,
        getOrderedColumnsWithProp: columnOptions.getOrderedColumnsWithProp,
        isColumnHidden: columnOptions.isColumnHidden,
        columnWidths: columnOptions.columnWidths,
      }
    : undefined,
});

// ──── Expose ────

const getElTable = () => tableRef.value;

defineExpose({
  getElTable,

  // 导航
  navigate,
  focusCell,
  activeRowIndex,
  activeColIndex,
  activeRow,
  activeColumn,

  // 编辑
  editMode,
  isEditing,
  startEdit: startEditWithFocus,
  confirmEdit: confirmEditWithHistory,
  cancelEdit,

  // 校验
  validate,
  validateField,
  clearValidation,
  scrollToFirstError,

  // 行操作（索引即 data 数组下标）
  insertRow: (index?: number, defaultRow?: RowData, count?: number) =>
    insertRow(index, defaultRow, count),
  deleteRow: (localIndex?: number | number[]) => deleteRow(localIndex),
  moveRow: (from: number, to: number) => moveRow(from, to),
  duplicateRow: (localIndex?: number | number[]) => duplicateRow(localIndex),
  deleteSelectedRows: () => {
    const selected: RowData[] = getElTable()?.getSelectionRows() ?? [];
    if (!selected.length) return;
    const indices = selected
      .map((row: RowData) => (props.data ?? []).indexOf(row))
      .filter((i: number) => i >= 0);
    deleteRow(indices);
    getElTable()?.clearSelection();
  },
  duplicateSelectedRows: () => {
    const selected: RowData[] = getElTable()?.getSelectionRows() ?? [];
    if (!selected.length) return;
    const indices = selected
      .map((row: RowData) => (props.data ?? []).indexOf(row))
      .filter((i: number) => i >= 0);
    duplicateRow(indices);
    getElTable()?.clearSelection();
  },
  getModifiedRows,
  markDirty,
  clearDirty,
  resetTracking,
  getDirtyCells,
  isCellDirty,
  isRowDirty,

  // 列操作
  toggleColumn: columnOptions.toggleColumn,
  reorderColumns: columnOptions.reorderColumns,
  setColumnWidth: columnOptions.setColumnWidth,
  resetColumns: columnOptions.resetColumns,

  // 编辑历史（undo/redo 已包装：执行后同步 dirty 标识）
  undo: wrappedUndo,
  redo: wrappedRedo,
  canUndo,
  canRedo,
  clearHistory,

  // el-table 原生方法透传
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

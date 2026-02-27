<template>
  <div ref="wrapperEl" class="re-table-next-wrapper" tabindex="0">
    <!--header（可选，参与自适应高度计算时会被扣除）-->
    <div class="re-table-next-header flex items-center justify-between p-2">
      <slot name="title">
        <div>todo title</div>
      </slot>
      <slot name="actions">
        <re-table-next-column-setting v-if="columnSetting" />
      </slot>
    </div>
    <el-table
      v-bind="$attrs"
      ref="tableRef"
      :data="data"
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
    <!--footer（可选，参与自适应高度计算时会被扣除）-->
    <div class="re-table-next-footer flex items-center justify-between p-2">
      <slot name="summary">
        <div>todo summary</div>
      </slot>
      <slot name="pagination">
        <div>todo pagination</div>
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
  ReTableNextColumn as ColumnType,
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
  useColumnOptions,
  useDirtyTracking,
  useEditable,
  useEditHistory,
  useHotkey,
  useNavigation,
  useRowOptions,
  useValidation,
} from './composables';
import ReTableNextColumn from './re-table-next-column.vue';
import ReTableNextColumnSetting from './re-table-next-column-setting.vue';

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
  tabNavigation: true,
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
}>();

// ──── Slots & Refs ────

const slots = useSlots();
const wrapperEl = ref<HTMLElement | null>(null);
const tableRef = ref<Record<string, any> | null>(null);

// ──── 列可见性（含列设置：显隐、排序、持久化）────

const columnOptions = useColumnOptions({
  initialColumns: computed(() => props.columns ?? []),
  tableKey: props.columnSetting ? 're-table-next-default' : undefined,
  storage: props.columnSetting ? 'local' : false,
});

const visibleColumns = columnOptions.visibleColumns;

// ──── 行操作 ────

const { insertRow, deleteRow, moveRow, duplicateRow } = useRowOptions({
  data: computed(() => props.data ?? []),
  onDataChange: (newData) => emit('update:data', newData),
});

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
  data: computed(() => props.data ?? []),
  visibleColumns,
  tableRef,
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
  data: computed(() => props.data ?? []),
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
  getErrorForCell,
} = useValidation({
  data: computed(() => props.data ?? []),
  columns: navigableColumns,
  tableRules: computed(() => props.tableRules),
  tableEl: wrapperEl,
  trigger: computed(() => props.validateTrigger ?? 'manual'),
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
});

/** 合并导航高亮 + 校验错误 + 脏单元格样式 */
function getCellClassNameCombined(payload: {
  row: RowData;
  column: any;
  rowIndex: number;
  columnIndex: number;
}): string {
  const classes: string[] = [];
  const navClass = getCellClassName(payload);
  if (navClass) classes.push(navClass);
  const prop = payload.column?.property;
  if (prop && getErrorForCell(payload.rowIndex, prop)) {
    classes.push('re-table-next-cell--error');
  }
  if (prop && isCellDirty(payload.rowIndex, prop)) {
    classes.push('re-table-next-cell--dirty');
  }
  return classes.join(' ');
}

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

/** 合并导航高亮行 + 脏数据行类（供 :row-class-name 使用） */
function getRowClassNameCombined(payload: {
  row: RowData;
  rowIndex: number;
}): string {
  const classes: string[] = [];
  const navClass = getRowClassName(payload);
  if (navClass) classes.push(navClass);
  if (isRowDirty(payload.rowIndex)) {
    classes.push('re-table-next-row--dirty');
  }
  return classes.join(' ');
}

/** 使 row-class-name 依赖 activeRowIndex、dirtyCells，热键导航或脏数据变化时 el-table 会重新应用行类 */
const getRowClassNameBinding = computed(() => {
  void activeRowIndex.value;
  void dirtyCells.value;
  return props.rowActive ? getRowClassNameCombined : undefined;
});

/** 使 cell-class-name 依赖 activeRowIndex、activeColIndex、dirtyCells，热键导航或脏数据变化时重新应用 */
const getCellClassNameBinding = computed(() => {
  void activeRowIndex.value;
  void activeColIndex.value;
  void dirtyCells.value;
  return props.cellActive ? getCellClassNameCombined : undefined;
});

const confirmEditWithHistory = () => {
  const changes = confirmEdit();
  if (changes && props.validateOnCellExit) {
    const rowIndex = changes[0].rowIndex;
    for (const c of changes) {
      validateField(rowIndex, c.colProp).catch(() => {});
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

/** 主动将焦点移到当前激活单元格的编辑器（input/textarea）。进入编辑后由 startEditWithFocus 调用，避免用 watch 监听。 */
function focusActiveEditor(): void {
  nextTick(() => {
    nextTick(() => {
      const wrapper = wrapperEl.value;
      if (!wrapper) return;
      const activeCell = wrapper.querySelector('td.re-table-next-cell--active');
      const editorEl = (activeCell?.querySelector(
        'input, textarea, [contenteditable="true"]',
      ) ??
        wrapper.querySelector(
          'input, textarea, [contenteditable="true"]',
        )) as HTMLElement | null;
      if (document.activeElement !== editorEl) {
        editorEl?.focus();
      }
    });
  });
}

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
  if (!props.columnSetting || !column?.property || typeof newWidth !== 'number' || newWidth <= 0)
    return;
  columnOptions.setColumnWidth(column.property, newWidth);
}

// ──── 热键引擎 ────

useHotkey({
  wrapperEl,
  hotkeyEnabled: computed(() => props.hotkeyEnabled ?? true),
  tabNavigation: computed(() => props.tabNavigation ?? true),
  navigate,
  focusCell,
  activeRowIndex,
  activeColIndex,
  data: computed(() => props.data ?? []),
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
  getErrorForCell,
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

  // 行操作
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

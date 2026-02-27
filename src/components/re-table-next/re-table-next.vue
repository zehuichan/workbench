<template>
  <div
    ref="wrapperEl"
    class="re-table-next-wrapper"
    tabindex="0"
  >
    <!--header（可选，参与自适应高度计算时会被扣除）-->
    <div class="re-table-next-header flex items-center justify-between p-2">
      <slot name="title">
        <div>todo title</div>
      </slot>
      <slot name="actions">
        <div>todo actions</div>
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
      :cell-class-name="cellActive ? getCellClassName : undefined"
      :row-class-name="rowActive ? getRowClassName : undefined"
      @cell-click="onCellClick"
      @cell-dblclick="onCellDblClick"
    >
      <template #default>
        <slot>
          <template
            v-for="(column, idx) in visibleColumns"
            :key="(column as any).key ?? column.prop ?? column.type ?? idx"
          >
            <component
              v-if="[SELECTION_COLUMN, INDEX_COLUMN].includes(column.type as any)"
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

import { isBoolean } from '@/utils';

import type {
  AdaptiveConfig,
  ReTableNextColumn as ColumnType,
  ReTableNextContext,
  ReTableNextProps,
  RowData,
} from './types';
import type { EditCellPayload, EditValueChangePayload } from './composables/use-editable';
import {
  EXPAND_COLUMN,
  INDEX_COLUMN,
  RE_TABLE_NEXT_INJECTION_KEY,
  SELECTION_COLUMN,
} from './constants';
import {
  useAdaptive,
  useEditable,
  useEditHistory,
  useHotkey,
  useNavigation,
} from './composables';
import ReTableNextColumn from './re-table-next-column.vue';

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
});

const emit = defineEmits<{
  scroll: [event: Event];
  'cell-edit-start': [payload: EditCellPayload];
  'cell-edit-end': [payload: EditCellPayload];
  'cell-value-change': [payload: EditValueChangePayload];
}>();

// ──── Slots & Refs ────

const slots = useSlots();
const wrapperEl = ref<HTMLElement | null>(null);
const tableRef = ref<Record<string, any> | null>(null);

// ──── 列可见性 ────

const visibleColumns = computed<ColumnType[]>(() =>
  (props.columns ?? []).filter((col) => {
    if (isBoolean(col.hidden)) return !col.hidden;
    return true;
  }),
);

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

// ──── 编辑历史 ────

const {
  canUndo,
  canRedo,
  pushChange,
  undo,
  redo,
  clearHistory,
} = useEditHistory({
  data: computed(() => props.data ?? []),
});

const confirmEditWithHistory = () => {
  const changes = confirmEdit();
  if (changes) {
    pushChange(changes);
  }
  return changes;
};

// ──── 事件处理 ────

function onCellClick(row: RowData, column: any, _cell: any, event: MouseEvent): void {
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
      if (activeRowIndex.value !== prevRow || activeColIndex.value !== prevCol) {
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
      ) ?? wrapper.querySelector(
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
  undo,
  redo,
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

  // 编辑历史
  undo,
  redo,
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

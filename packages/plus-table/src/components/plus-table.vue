<script setup lang="ts" generic="T extends RowData = RowData">
import { computed, provide, ref, useSlots } from 'vue';
import { ElPagination, ElTable } from 'element-plus';
import '../styles/index.scss';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import { createTableEngine } from '../engine';
import PlusTableColumnSettings from './plus-table-column-settings.vue';
import PlusTableColumnNode from './plus-table-column';
import type { TableInstance } from 'element-plus';
import type { EditorSlotProps, HeaderSlotProps } from '../engine';
import type { PlusTableEmits, PlusTableProps, RowData } from '../types';

defineOptions({ name: 'PlusTable', inheritAttrs: false });

const props = withDefaults(defineProps<PlusTableProps<T>>(), {
  editMode: 'cell',
  validateOn: 'change',
  columnSetting: false,
  adaptive: false,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  history: false,
  dirtyTracking: false,
});

const emit = defineEmits<PlusTableEmits<T>>();
const slots = useSlots();

/**
 * header-${prop} / editor-${prop} 是按列 prop 动态生成的插槽名，模板里不会字面出现，
 * 只能靠显式声明让消费方在使用处获得类型提示（否则 vue-tsc 按模板实际用到的插槽推断类型，
 * 这两类动态插槽会被判定为不存在）。
 */
defineSlots<{
  toolbar?: () => unknown;
  empty?: () => unknown;
  [key: `header-${string}`]: (props: HeaderSlotProps<T>) => unknown;
  [key: `editor-${string}`]: (props: EditorSlotProps<T>) => unknown;
}>();

const gridRef = ref<HTMLElement>();
const paginationRef = ref<HTMLElement>();
const tableRef = ref<TableInstance>();

const engine = createTableEngine<T>({
  props,
  emit,
  slots,
  gridRef,
  paginationRef,
});
provide(PLUS_TABLE_INJECTION_KEY, engine);

const displayTree = engine.columns.displayTree;
const tableHeight = engine.adaptive.tableHeight;
const isAdaptiveContainer = engine.adaptive.isContainerMode;
const onKeydown = engine.keyboard.onKeydown;

// el-table 的 row-key 类型签名比本组件窄（函数变体只接受返回 string），做一次适配
const rowKeyProp = computed(
  () => props.rowKey as string | ((row: T) => string),
);

const paginationEnabled = computed(() => props.total !== undefined);

function handlePageChange(page: number) {
  emit('update:page', page);
  emit('page-change', { page, pageSize: props.pageSize! });
}

function handlePageSizeChange(pageSize: number) {
  emit('update:pageSize', pageSize);
  emit('page-change', { page: props.page!, pageSize });
}

/** 表头拖拽调宽（el-table 需 border 才出现拖拽柄），记录并持久化 */
function handleHeaderDragend(
  newWidth: number,
  _oldWidth: number,
  column: { columnKey?: string },
) {
  if (column.columnKey)
    engine.columns.setColumnWidth(column.columnKey, newWidth);
}

defineExpose({
  /** 全表校验 */
  validate: engine.validation.validate,
  clearValidate: engine.validation.clearValidate,
  getErrors: engine.validation.getErrors,
  /** 行操作 */
  insertRow: engine.rows.insertRow,
  removeRow: engine.rows.removeRow,
  moveRow: engine.rows.moveRow,
  duplicateRow: engine.rows.duplicateRow,
  /** row 模式行编辑 */
  startRowEdit: engine.editing.startRowEdit,
  commitRowEdit: engine.editing.commitRowEdit,
  cancelRowEdit: engine.editing.cancelRowEdit,
  /** cell 模式单元格编辑 */
  startEdit: engine.editing.startEdit,
  cancelEdit: engine.editing.cancelEdit,
  setActiveCell: engine.selection.setActiveCell,
  /** 列设置 */
  resetColumnSettings: engine.columns.resetSettings,
  setColumnWidth: engine.columns.setColumnWidth,
  /** 撤销重做（history prop 关闭时栈恒为空，undo/redo 为安全空操作） */
  undo: engine.undo,
  redo: engine.redo,
  canUndo: engine.history.canUndo,
  canRedo: engine.history.canRedo,
  clearHistory: engine.history.clearHistory,
  /** 脏行 / 脏格追踪（dirtyTracking prop 关闭时恒无脏格） */
  getModifiedRows: engine.dirty.getModifiedRows,
  getDirtyCells: engine.dirty.getDirtyCells,
  isCellDirty: engine.dirty.isCellDirty,
  isRowDirty: engine.dirty.isRowDirty,
  resetTracking: engine.dirty.resetTracking,
  clearDirty: engine.dirty.clearDirty,
  /** el-table 实例直通 */
  getElTable: () => tableRef.value,
});
</script>

<template>
  <div
    class="plus-table"
    :class="{ 'plus-table--adaptive-container': isAdaptiveContainer }"
  >
    <div v-if="columnSetting || $slots.toolbar" class="plus-table__toolbar">
      <slot name="toolbar" />
      <PlusTableColumnSettings v-if="columnSetting" />
    </div>

    <div
      ref="gridRef"
      class="plus-table__grid"
      tabindex="0"
      @keydown="onKeydown"
    >
      <el-table
        ref="tableRef"
        :data="data"
        :row-key="rowKeyProp"
        :height="tableHeight"
        v-bind="$attrs"
        @cell-click="engine.handleCellClick"
        @cell-dblclick="engine.handleCellDblclick"
        @header-dragend="handleHeaderDragend"
      >
        <PlusTableColumnNode
          v-for="(node, index) in displayTree"
          :key="`${index}:${node.id}`"
          :node="node"
        />
        <template v-if="$slots.empty" #empty>
          <slot name="empty" />
        </template>
      </el-table>
    </div>

    <div
      v-if="paginationEnabled"
      ref="paginationRef"
      class="plus-table__pagination"
    >
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        @update:current-page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

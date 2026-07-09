<script setup lang="ts" generic="T extends RowData = RowData">
import { computed, provide, ref, useSlots } from 'vue';
import { ElPagination, ElTable } from 'element-plus';
import './styles/index.scss';
import { PLUS_TABLE_INJECTION_KEY } from './tokens';
import { createStore } from './store/helper';
import { useEvents } from './table/events-helper';
import { useKeyboard } from './table/keyboard-helper';
import { useStyle } from './table/style-helper';
import PlusTableColumnSettings from './column-settings/index.vue';
import PlusTableColumnNode from './table-column';
import type { TableInstance } from 'element-plus';
import type { PlusTable } from './tokens';
import type { Store } from './store';
import type {
  EditorSlotProps,
  HeaderSlotProps,
} from './table-cell/render-helper';
import type { PlusTableEmits, PlusTableProps, RowData } from './table/defaults';
import type { CellContext } from './table-column/defaults';

defineOptions({ name: 'PlusTable', inheritAttrs: false });

const props = withDefaults(defineProps<PlusTableProps<T>>(), {
  editMode: 'cell',
  validateEvent: true,
  cache: false,
  adaptive: false,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  history: false,
  dirtyTracking: false,
  hotkeyEnabled: true,
});

const emit = defineEmits<PlusTableEmits<T>>();
const slots = useSlots();

/**
 * header-${prop} / editor-${prop} 是按列 prop 动态生成的插槽名，模板里不会字面出现，
 * 只能靠显式声明让消费方在使用处获得类型提示。
 */
defineSlots<{
  toolbar?: () => unknown;
  empty?: () => unknown;
  [key: `cell-${string}`]: (props: CellContext<T>) => unknown;
  [key: `header-${string}`]: (props: HeaderSlotProps<T>) => unknown;
  [key: `editor-${string}`]: (props: EditorSlotProps<T>) => unknown;
}>();

const gridRef = ref<HTMLElement>();
const paginationRef = ref<HTMLElement>();
const tableRef = ref<TableInstance>();

const table: PlusTable<T> = {
  props,
  emit,
  slots,
  gridRef,
  paginationRef,
  store: null as unknown as Store<T>,
};
const store = createStore<T>(table, props);
provide(PLUS_TABLE_INJECTION_KEY, table);

const style = useStyle(table);
const events = useEvents(table);
const keyboard = useKeyboard(table);

const displayTree = store.states.originColumns;
const tableData = store.states.data;
const tableHeight = style.tableHeight;
const isAdaptiveContainer = style.isContainerMode;

// el-table 的 row-key 类型签名比本组件窄（函数变体只接受返回 string），做一次适配
const rowKeyProp = computed(
  () => props.rowKey as string | ((row: T) => string),
);

const paginationEnabled = computed(() => props.total !== undefined);

defineExpose(
  new Proxy(
    {
      /** 全表校验 */
      validate: store.validate,
      clearValidate: store.clearValidate,
      getErrors: store.getErrors,
      /** 行操作 */
      insertRow: store.insertRow,
      removeRow: store.removeRow,
      moveRow: store.moveRow,
      duplicateRow: store.duplicateRow,
      /** row 模式行编辑 */
      startRowEdit: store.startRowEdit,
      commitRowEdit: store.commitRowEdit,
      cancelRowEdit: store.cancelRowEdit,
      /** cell 模式单元格编辑 */
      startEdit: store.startEdit,
      cancelEdit: store.cancelEdit,
      // 内部按 E-P 命名为 setCurrentCell；公开 API 继续保留 setActiveCell。
      setActiveCell: store.setCurrentCell,
      /** 列设置 */
      resetColumnSettings: store.resetSettings,
      setColumnWidth: store.setColumnWidth,
      /** 撤销重做（history prop 关闭时栈恒为空，undo/redo 为安全空操作） */
      undo: store.undo,
      redo: store.redo,
      canUndo: store.canUndo,
      canRedo: store.canRedo,
      clearHistory: store.clearHistory,
      /** 脏行 / 脏格追踪（dirtyTracking prop 关闭时恒无脏格） */
      getModifiedRows: store.getModifiedRows,
      getDirtyCells: store.getDirtyCells,
      isCellDirty: store.isCellDirty,
      isRowDirty: store.isRowDirty,
      resetTracking: store.resetTracking,
      clearDirty: store.clearDirty,
    },
    {
      get(target, prop, receiver) {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }
        return tableRef.value
          ? Reflect.get(tableRef.value, prop, tableRef.value)
          : undefined;
      },
      has(target, prop) {
        return (
          Reflect.has(target, prop) ||
          (!!tableRef.value && Reflect.has(tableRef.value, prop))
        );
      },
    },
  ),
);
</script>

<template>
  <div
    class="plus-table"
    :class="{ 'plus-table--adaptive-container': isAdaptiveContainer }"
  >
    <div class="plus-table__toolbar">
      <slot name="toolbar" />
      <PlusTableColumnSettings />
    </div>

    <div
      ref="gridRef"
      class="plus-table__grid"
      tabindex="0"
      @keydown="keyboard.handleKeydown"
    >
      <el-table
        ref="tableRef"
        :data="tableData"
        :row-key="rowKeyProp"
        :height="tableHeight"
        v-bind="$attrs"
        @cell-click="events.handleCellClick"
        @cell-dblclick="events.handleCellDblclick"
        @header-dragend="events.handleHeaderDragend"
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
        @update:current-page="events.handlePageChange"
        @update:page-size="events.handlePageSizeChange"
      />
    </div>
  </div>
</template>

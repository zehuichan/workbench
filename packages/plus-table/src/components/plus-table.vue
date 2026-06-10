<script setup lang="ts">
import { computed, provide, ref, useSlots } from 'vue';
import { ElPagination, ElTable } from 'element-plus';
import '../styles/index.scss';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import { createTableEngine } from '../engine';
import ColumnSettings from './column-settings.vue';
import TableColumnNode from './table-column';
import type { PlusTableEmits, PlusTableProps } from '../types';

defineOptions({ name: 'PlusTable', inheritAttrs: false });

const props = withDefaults(defineProps<PlusTableProps>(), {
  editMode: 'cell',
  validateOn: 'change',
  columnSetting: false,
  adaptive: false,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
});

const emit = defineEmits<PlusTableEmits>();
const slots = useSlots();

const gridRef = ref<HTMLElement>();
const paginationRef = ref<HTMLElement>();
const tableRef = ref<InstanceType<typeof ElTable>>();

const engine = createTableEngine({ props, emit, slots, gridRef, paginationRef });
provide(PLUS_TABLE_INJECTION_KEY, engine);

const displayTree = engine.columns.displayTree;
const tableHeight = engine.adaptive.tableHeight;
const onKeydown = engine.keyboard.onKeydown;

// el-table 的 row-key 类型签名比本组件窄，做一次适配
const rowKeyProp = computed(() => props.rowKey as string | ((row: Record<string, any>) => string));

const paginationEnabled = computed(() => props.total !== undefined);

function handlePageChange(page: number) {
  emit('update:page', page);
  emit('page-change', { page, pageSize: props.pageSize });
}

function handlePageSizeChange(pageSize: number) {
  emit('update:pageSize', pageSize);
  emit('page-change', { page: props.page, pageSize });
}

/** 表头拖拽调宽（el-table 需 border 才出现拖拽柄），记录并持久化 */
function handleHeaderDragend(
  newWidth: number,
  _oldWidth: number,
  column: { columnKey?: string },
) {
  if (column.columnKey) engine.columns.setColumnWidth(column.columnKey, newWidth);
}

defineExpose({
  /** 全表校验 */
  validate: engine.validation.validate,
  clearValidate: engine.validation.clearValidate,
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
  /** el-table 实例直通 */
  getElTable: () => tableRef.value,
});
</script>

<template>
  <div class="plus-table">
    <div v-if="columnSetting || $slots.toolbar" class="plus-table__toolbar">
      <slot name="toolbar" />
      <ColumnSettings v-if="columnSetting" />
    </div>

    <div ref="gridRef" class="plus-table__grid" tabindex="0" @keydown="onKeydown">
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
        <TableColumnNode
          v-for="(node, index) in displayTree"
          :key="`${index}:${node.id}`"
          :node="node"
        />
        <template v-if="$slots.empty" #empty>
          <slot name="empty" />
        </template>
      </el-table>
    </div>

    <div v-if="paginationEnabled" ref="paginationRef" class="plus-table__pagination">
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

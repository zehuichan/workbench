<script setup lang="ts">
import type {
  GridyActionSlotProps,
  GridyColumn,
  GridyDataColumn,
  GridyExpandSlotProps,
  GridyRow,
} from '../types';

import { computed, onBeforeUnmount, useTemplateRef } from 'vue';

import { ElCheckbox } from 'element-plus';

import { alignClass, columnKey, specialClass, widthStyle } from '../column';
import { useKeyboard, useVirtual } from '../composables';
import { VIEW_INDEX_ATTR } from '../dom';
import { useGridyContext } from '../tokens';
import { cellContextOf, pathKey, pathOfRow } from '../tree';
import GridyActions from './actions.vue';
import GridyCell from './cell.vue';
import GridyExpandIcon from './expand-icon.vue';

defineOptions({ name: 'GridyBody' });

const ctx = useGridyContext();
const {
  addRow,
  allPageSelected,
  canRemove,
  columns,
  dataColumns,
  expandColumn,
  expandMode,
  isExpanded,
  isRequiredColumn,
  isRowSelected,
  keyboardEnabled,
  pageOffset,
  paginationEnabled,
  readonly,
  removeRow,
  renderRows,
  setCell,
  somePageSelected,
  summary,
  summaryCells,
  summaryEnabled,
  summaryFixed,
  toggleAllPage,
  toggleExpanded,
  toggleRow,
} = ctx;

const scrollRef = useTemplateRef<HTMLDivElement>('scrollRef');
const {
  displayRows,
  ensureRowVisible,
  measureRow,
  paddingBottom,
  paddingTop,
  scrollStyle,
  scrollToRowId,
  tableStyle,
  virtualEnabled,
} = useVirtual({
  getScrollElement: () => scrollRef.value,
  renderRows,
  scroll: () => ctx.scroll.value,
  size: () => ctx.size.value,
  summaryFixed: () => summaryFixed.value,
  virtual: () => ctx.virtual.value,
});

ctx.registerScrollHost(scrollToRowId);
onBeforeUnmount(() => ctx.registerScrollHost(null));

/** 树形缩进 + 图标落在哪个数据列：没有独立 expand 列时用首个数据列（对齐 a-table 默认） */
const treeHostField = computed(() =>
  expandMode.value === 'tree' && !expandColumn.value ? dataColumns.value[0]?.field : undefined,
);

function rowPathKey(row: GridyRow): string {
  return pathKey(pathOfRow(row));
}

function showPanel(row: GridyRow): boolean {
  return expandMode.value === 'detail' && isExpanded(row.id) && row.getCanExpand();
}

function expandSlotProps(row: GridyRow): GridyExpandSlotProps {
  const path = pathOfRow(row);
  return {
    ...cellContextOf(row.original, path),
    collapse: () => toggleExpanded(row.id, false),
    disabled: readonly.value,
    setValue: (field, value) => setCell(path, field, value),
  };
}

const { isActiveCell, onFocusIn, onKeydown } = useKeyboard({
  dataColumns,
  ensureRowVisible,
  getScrollElement: () => scrollRef.value,
  keyboardEnabled: () => keyboardEnabled.value,
  renderRows,
});

const colCount = computed(() => columns.value.length);
const viewIndexAttr = VIEW_INDEX_ATTR;

/** 序号 / 操作 / 展开列表头文案；选择列表头是全选框，无文案 */
function specialTitle(col: GridyColumn): string {
  switch (col.type) {
    case 'action': {
      return col.title ?? '操作';
    }
    case 'expand': {
      return col.title ?? '';
    }
    case 'index': {
      return col.title ?? '#';
    }
    default: {
      return '';
    }
  }
}

function sortDirection(col: GridyDataColumn): 'asc' | 'desc' | false {
  if (!col.sorter) {
    return false;
  }
  return ctx.table.getColumn(col.field)?.getIsSorted() ?? false;
}

function toggleSort(col: GridyDataColumn) {
  if (!col.sorter || paginationEnabled.value) {
    // 后端分页下 manualSorting，表头点击不改客户端序
    return;
  }
  ctx.table.getColumn(col.field)?.toggleSorting();
}

function actionSlotProps(row: GridyRow): GridyActionSlotProps {
  const path = pathOfRow(row);
  return {
    ...cellContextOf(row.original, path),
    addChild: () => addRow(path),
    // `min` 只约束顶层行数，子节点删除不受限
    disabled: readonly.value || (row.depth === 0 && !canRemove.value),
    remove: () => removeRow(path),
  };
}
</script>

<template>
  <div
    ref="scrollRef"
    class="gridy__scroll"
    :style="scrollStyle"
    @focusin="onFocusIn"
    @keydown="onKeydown"
  >
    <table class="gridy__table" :style="tableStyle">
      <thead :class="{ 'gridy__thead--sticky': virtualEnabled }">
        <tr>
          <template v-for="col in columns" :key="columnKey(col)">
            <th
              v-if="col.type"
              class="gridy__th"
              :class="[specialClass(col), alignClass(col, 'th')]"
              :style="widthStyle(col)"
            >
              <ElCheckbox
                v-if="col.type === 'selection'"
                :disabled="renderRows.length === 0"
                :indeterminate="somePageSelected && !allPageSelected"
                :model-value="allPageSelected"
                @change="(val: boolean | string | number) => toggleAllPage(!!val)"
              />
              <template v-else>{{ specialTitle(col) }}</template>
            </th>
            <th
              v-else
              class="gridy__th"
              :class="[
                alignClass(col, 'th'),
                {
                  'gridy__th--sortable': col.sorter && !paginationEnabled,
                  'gridy__th--required': !readonly && isRequiredColumn(col),
                },
              ]"
              :style="widthStyle(col)"
              @click="toggleSort(col)"
            >
              <span class="gridy__th-label">
                <slot :name="`header-${col.field}`" :column="col">
                  {{ col.title ?? col.field }}
                </slot>
                <span
                  v-if="col.sorter"
                  class="gridy__sort"
                  :class="`gridy__sort--${sortDirection(col) || 'none'}`"
                  aria-hidden="true"
                ></span>
              </span>
            </th>
          </template>
        </tr>
      </thead>
      <!--
        每行一个 tbody：主行 + 可选的展开面板行绑在一起，虚拟滚动量的是 tbody 整体高度，
        面板 / 嵌套子表撑高后由 ResizeObserver 回流；tbody 与 tr 都带 data-view-index——
        前者给 virtualizer 的 indexAttribute，后者给行查询与键盘导航。
      -->
      <tbody v-if="paddingTop > 0" class="gridy__spacer" aria-hidden="true">
        <tr>
          <td :colspan="colCount" :style="{ height: `${paddingTop}px`, padding: 0 }"></td>
        </tr>
      </tbody>
      <tbody
        v-for="{ row, viewIndex } in displayRows"
        :key="row.id"
        :ref="measureRow"
        class="gridy__row-group"
        :[viewIndexAttr]="viewIndex"
      >
        <tr
          class="gridy__tr"
          :class="{ 'gridy__tr--expanded': showPanel(row) }"
          :[viewIndexAttr]="viewIndex"
        >
          <template v-for="col in columns" :key="columnKey(col)">
            <td
              v-if="col.type"
              class="gridy__td"
              :class="[specialClass(col), alignClass(col, 'td')]"
            >
              <ElCheckbox
                v-if="col.type === 'selection'"
                :model-value="isRowSelected(row.id)"
                @change="(val: boolean | string | number) => toggleRow(row.id, !!val)"
              />
              <template v-else-if="col.type === 'index'">
                {{ pageOffset + viewIndex + 1 }}
              </template>
              <GridyExpandIcon
                v-else-if="col.type === 'expand'"
                :can-expand="row.getCanExpand()"
                :expanded="isExpanded(row.id)"
                :row-id="row.id"
                :row-path="rowPathKey(row)"
              />
              <slot v-else name="action" v-bind="actionSlotProps(row)">
                <GridyActions :row="row.original" :row-path="rowPathKey(row)" />
              </slot>
            </td>
            <GridyCell
              v-else
              :active="isActiveCell(row.id, col.field)"
              :can-expand="row.getCanExpand()"
              :col="col"
              :expanded="isExpanded(row.id)"
              :index="row.index"
              :record="row.original"
              :row-id="row.id"
              :row-path="rowPathKey(row)"
              :tree-host="col.field === treeHostField"
            >
              <template v-if="$slots[`cell-${col.field}`]" #default="slotProps">
                <slot :name="`cell-${col.field}`" v-bind="slotProps"></slot>
              </template>
            </GridyCell>
          </template>
        </tr>
        <tr v-if="showPanel(row)" class="gridy__expanded-row">
          <td class="gridy__td gridy__expanded-cell" :colspan="colCount">
            <slot name="expand" v-bind="expandSlotProps(row)"> </slot>
          </td>
        </tr>
      </tbody>
      <tbody v-if="paddingBottom > 0" class="gridy__spacer" aria-hidden="true">
        <tr>
          <td :colspan="colCount" :style="{ height: `${paddingBottom}px`, padding: 0 }"></td>
        </tr>
      </tbody>
      <tfoot
        v-if="summaryEnabled"
        class="gridy__tfoot"
        :class="{ 'gridy__tfoot--sticky': summaryFixed }"
      >
        <slot name="summary" v-bind="summary">
          <tr class="gridy__summary">
            <td
              v-for="cell in summaryCells"
              :key="cell.key"
              class="gridy__td"
              :class="[cell.tdClass, cell.className]"
              :colspan="cell.colspan"
              :style="cell.style"
            >
              <span v-if="cell.label" class="gridy__summary-label">
                {{ cell.label }}
              </span>
              {{ cell.content }}
            </td>
          </tr>
        </slot>
      </tfoot>
    </table>
  </div>
</template>

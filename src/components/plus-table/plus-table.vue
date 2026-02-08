<template>
  <div ref="tableWrapperInstance" class="re-table" v-loading="loading">
    <el-table
      v-bind="$attrs"
      border
      highlight-current-row
      show-overflow-tooltip
      scrollbar-always-on
      :ref="changeInstance"
      :data="data"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      @cell-click="handleCellClick"
    >
      <template #default>
        <slot>
          <component
            :is="h(PlusTableColumn, null, $slots)"
            :columns="refColumns"
            :rules="rules"
            :editable="editable"
          />
        </slot>
      </template>

      <!-- 插入至表格最后一行之后的内容 -->
      <template #append>
        <slot name="append" />
      </template>

      <!-- 当数据为空时自定义的内容 -->
      <template #empty>
        <slot name="empty" />
      </template>
    </el-table>
    <pre>{{ dirtyCells }}</pre>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  getCurrentInstance,
  reactive,
  onMounted,
  onUnmounted,
  onDeactivated,
  provide,
  nextTick,
  h,
  watch,
  shallowRef,
} from 'vue';

import { useRoute } from 'vue-router';

import { cloneDeep, isEqual } from 'es-toolkit';
import { findIndex } from 'es-toolkit/compat';

import { getEventTargetNode, isBoolean, isFunction } from '@/utils';

import {
  IGNORE_COLUMN_FLAG,
  ORIGINAL_CELL_META,
  PLUS_TABLE_FORM_INJECTION_KEY,
  PLUS_TABLE_INJECTION_KEY,
  type CellMeta,
  type PlusTableColumnOption,
  type PlusTableProps,
} from './tokens';

import PlusTableColumn from './plus-table-column.vue';

const props = withDefaults(defineProps<PlusTableProps>(), {
  tableKey: '0',
  columns: () => [],
  data: () => [],
  loading: false,
  editable: false,
});

const vm = getCurrentInstance()!;

const route = useRoute();

const tableKey = `table/${props.tableKey}${route.path.split('/').join('\/')}`;
const columnsKey = `columns/${props.tableKey}${route.path.split('/').join('\/')}`;

const tableWrapperInstance = ref<HTMLElement | null>(null);
const tableInstance = ref<Record<string, any> | null>(null);
const paginationInstance = ref<unknown>(null);
const activated = ref(false);
const cellMeta = ref<CellMeta>({ ...ORIGINAL_CELL_META });

const hasHidden = (column: PlusTableColumnOption) => {
  const hidden = column.hidden;
  if (isBoolean(hidden)) {
    return !hidden;
  }
  if (isFunction(hidden)) {
    return !hidden(column);
  }
  return true;
};

const cachedData = shallowRef<any[]>([]);

const formRefs = shallowRef<Record<number, Record<number, { validate?: () => Promise<unknown> }>>>({});
const validationErrors = ref(new Map<string, string>());

const cachedColumns = computed(() => {
  if (props.columns.length > 0) {
    return props.columns.map((column) => ({ ...column }));
  }
  return (tableInstance.value ?? {}).columns;
});
const refColumns = computed(() => {
  if (props.columns.length > 0) {
    return props.columns.filter((column) => hasHidden(column));
  }
  return (tableInstance.value ?? {}).columns;
});

// 行元数据
const rowMeta = computed(() => props.data[cellMeta.value.row]);
// 列元数据
const columnMeta = computed(() => refColumns.value[cellMeta.value.col]);

const dirtyCells = computed(() => {
  const dirty = new Set<string>();
  const columns = refColumns.value;
  const data = props.data ?? [];
  const cache = cachedData.value;

  if (!cache || !data || cache.length === 0 || data.length === 0) {
    return dirty;
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const oldRow = cache[i];

    if (!oldRow) continue;

    for (let j = 0; j < columns.length; j++) {
      const column = columns[j];
      const prop = column.prop;

      if (prop && !isEqual(row[prop], oldRow[prop])) {
        dirty.add(`${i}:${j}`);
      }
    }
  }

  return dirty;
});

const rowClassName = ({ rowIndex }: { rowIndex: number }) => `re-table-row-${rowIndex}`;

const cellClassName = ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
  const classNames = [`re-table-cell-${rowIndex}-${columnIndex}`];
  const { row, col } = cellMeta.value;

  if (rowIndex === row && columnIndex === col) {
    classNames.push('current-cell');
  }

  if (dirtyCells.value.has(`${rowIndex}:${columnIndex}`)) {
    classNames.push('dirty-cell');
  }

  return classNames.join(' ');
};

const updateCell = (data: Partial<CellMeta>) => {
  cellMeta.value = { ...cellMeta.value, ...data };
};

const getRowIdentity = (row: any) => {
  if (!props.rowKey) return row;
  if (typeof props.rowKey === 'function') return (props.rowKey as (row: any) => any)(row);
  return row?.[props.rowKey as string];
};

const findRowIndex = (row: any) => {
  if (!props.data || props.data.length === 0) return -1;

  if (props.rowKey) {
    const targetKey = getRowIdentity(row);
    return findIndex(props.data, (item) =>
      isEqual(getRowIdentity(item), targetKey),
    );
  }

  return findIndex(props.data, (item) => item === row);
};

/**
 * 对表格中的表单进行校验
 * @param rows - true: 校验所有行; false: 仅校验变动(dirty)行; number/number[]: 校验指定行索引
 * @returns Promise，包含校验结果（无表单时返回 null）
 */
const validate = async (rows: boolean | number | number[] = true): Promise<Record<number, Record<number, unknown>> | null> => {
  if (Object.keys(formRefs.value).length === 0) {
    return Promise.resolve(null);
  }

  const getDirtyRowIndices = (): number[] => {
    const indices = new Set<number>();
    for (const key of dirtyCells.value) {
      const [rowIndex] = key.split(':');
      const n = Number(rowIndex);
      if (!Number.isNaN(n)) indices.add(n);
    }
    return Array.from(indices);
  };

  const normalizeRowIndices = (input: boolean | number | number[]): number[] => {
    if (input === true) {
      return (props.data ?? []).map((_, i) => i);
    }
    if (input === false) {
      return getDirtyRowIndices();
    }
    if (typeof input === 'number') {
      return [input];
    }
    if (Array.isArray(input) && input.every((x) => typeof x === 'number')) {
      return input;
    }
    return [];
  };

  const extractErrorMessage = (error: unknown): string => {
    if (!error) return 'Invalid';
    if (typeof error === 'string') return error;
    if (Array.isArray(error) && error[0] && typeof (error[0] as { message?: string }).message === 'string')
      return (error[0] as { message: string }).message;
    if (typeof error === 'object' && error !== null) {
      const firstKey = Object.keys(error as object)[0];
      const firstVal = firstKey ? (error as Record<string, unknown>)[firstKey] : undefined;
      if (Array.isArray(firstVal) && firstVal[0] && typeof (firstVal[0] as { message?: string }).message === 'string')
        return (firstVal[0] as { message: string }).message;
    }
    return 'Invalid';
  };

  const rowIndices = normalizeRowIndices(rows);
  const validRest: Record<number, Record<number, unknown>> = {};
  const nextErrors = new Map(validationErrors.value);

  for (const rowIndex of rowIndices) {
    const rowForms = formRefs.value?.[rowIndex];
    if (!rowForms) continue;

    for (let columnIndex = 0; columnIndex < rowForms.length; columnIndex++) {
      const form = rowForms[columnIndex];
      if (!form?.validate) continue;

      const cellKey = `${rowIndex}-${columnIndex}`;

      try {
        await form.validate();
        nextErrors.delete(cellKey);
      } catch (errors) {
        validRest[rowIndex] = validRest[rowIndex] || {};
        validRest[rowIndex][columnIndex] = errors;
        nextErrors.set(cellKey, extractErrorMessage(errors));
      }
    }
  }

  validationErrors.value = nextErrors;
  return Promise.resolve(validRest);
};

/**
 * 实现表格单元格的导航
 * @param {Number} rowDelta - 行偏移量，正数表示向下，负数表示向上
 * @param {Number} colDelta - 列偏移量，正数表示向右，负数表示向左
 * @returns {Object} 返回新的单元格位置 { row, col }
 * @description 需求1：跳过selection、index特殊列
 * @description 需求2：按下ArrowLeft键时的边界处理，导航到当前行第一列时，下一次向左导航到上一行最后一列
 * @description 需求3：按下ArrowRight键时的边界处理，导航到当前行最后一列时，下一次向右导航到下一行第一列
 * @description 需求4：按下ArrowUp键时的边界处理，导航到第一行时，下一次向上导航到最后一行
 * @description 需求5：按下ArrowDown键时的边界处理，导航到最后一行时，下一次向下导航到第一行
 */
const transformStart = (rowDelta: number, colDelta: number): { row: number; col: number } => {
  const totalRows = (props.data ?? []).length;
  const totalColumns = refColumns.value.length;

  if (totalRows === 0 || totalColumns === 0) {
    return { row: -1, col: -1 };
  }

  let { row, col } = cellMeta.value;
  let newRow = row + rowDelta;
  let newCol = col + colDelta;
  let attempts = 0;
  const maxAttempts = totalRows * totalColumns;

  while (attempts < maxAttempts) {
    if (newCol < 0) {
      newRow -= 1;
      newCol = totalColumns - 1;
    } else if (newCol >= totalColumns) {
      newRow += 1;
      newCol = 0;
    }
    if (newRow < 0) {
      newRow = totalRows - 1;
    } else if (newRow >= totalRows) {
      newRow = 0;
    }

    const colDef = refColumns.value[newCol];
    if (!colDef || !IGNORE_COLUMN_FLAG.includes(colDef.type)) {
      return { row: newRow, col: newCol };
    }

    newRow += rowDelta;
    newCol += colDelta;
    attempts++;
  }

  return { row: -1, col: -1 };
};

const transformEnd = (scrollIntoView: boolean) => {
  const { row, activated, editable, col } = cellMeta.value;

  // 检查当前单元格是否有校验错误
  const cellKey = `${row}-${col}`;
  const hasValidationError = validationErrors.value.has(cellKey);

  if (activated && (props.editable || editable || hasValidationError)) {
    nextTick(() => {
      const el = tableInstance.value?.$el;
      const currentCell = el?.querySelector('.current-cell');
      if (currentCell) {
        const input = currentCell.querySelector('input, textarea');
        if (input) {
          (input as HTMLInputElement).focus({ preventScroll: true });
        }
      }
    });
  }

  if (scrollIntoView && row >= 0) {
    nextTick(() => {
      const el = tableInstance.value?.$el;
      const rowElement = el?.querySelector(`.re-table-row-${row}`);
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    });
  }
};

/**
 * 处理单元格编辑事件
 * @description 需求1：忽略 selection、index 等特殊列
 * @description 需求2：props.editable = true 时，表格整体可编辑
 * @description 以下的前置需求：当前行或者当前单元格处于编辑状态时，点击行或者单元格不做任何处理
 * @description 需求3：props.editable = 'row' 时，点击行编辑
 * @description 需求4：props.editable = 'cell' 时，点击单元格编辑
 */
const handleCellClick = (row: any, column: { type?: string; getColumnIndex: () => number }, _cell: unknown, event: MouseEvent) => {
  if (IGNORE_COLUMN_FLAG.includes(column.type ?? '')) {
    return;
  }

  const {
    row: currentRowIndex,
    col: currentColIndex,
    editable,
  } = cellMeta.value;

  const rowIndex = findRowIndex(row);
  const columnIndex = column.getColumnIndex();

  const currentCell =
    currentRowIndex === rowIndex &&
    currentColIndex === columnIndex &&
    (props.editable === 'cell' || props.editable === 'manual');
  const currentRow = currentRowIndex === rowIndex && props.editable === 'row';

  // 前置需求：当前行或者当前单元格处于编辑状态时，点击行或者单元格不做任何处理
  if (currentCell || currentRow) {
    return;
  }

  let shouldEdit = editable;

  // 需求2：props.editable = true 时，表格整体可编辑
  if (props.editable === true) {
    shouldEdit = true;
  }
  // 需求3：props.editable = row 时，点击行编辑
  else if (props.editable === 'row') {
    shouldEdit = true;
  }
  // 需求4：props.editable = cell 时，点击单元格编辑
  else if (props.editable === 'cell') {
    shouldEdit = true;
  }

  // 清除该单元格的校验错误标记（用户开始编辑时）
  const cellKey = `${rowIndex}-${columnIndex}`;
  if (validationErrors.value.has(cellKey)) {
    const newErrors = new Map(validationErrors.value);
    newErrors.delete(cellKey);
    validationErrors.value = newErrors;
  }

  updateCell({
    row: rowIndex,
    col: columnIndex,
    activated: true,
    editable: shouldEdit,
    contextmenu: event.button === 2,
  });
};

// 注册按键导航，涉及以下按键：
// ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'F2', 'Escape']
const registerGlobalKeydownEvent = (event: KeyboardEvent) => {
  if (!activated.value) {
    return;
  }

  const { editable, readonly, disabled, contextmenu } = cellMeta.value;

  if (
    contextmenu &&
    [
      'Enter',
      ' ',
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ].includes(event.key)
  ) {
    return;
  }

  switch (event.key) {
    // 移动到当前活动单元格上面的单元格
    case 'ArrowUp':
      event.preventDefault();
      updateCell({ ...transformStart(-1, 0) });
      transformEnd(true);
      break;
    // 移动到当前活动单元格下面的单元格
    case 'ArrowDown':
      event.preventDefault();
      updateCell({ ...transformStart(1, 0) });
      transformEnd(true);
      break;
    // 移动到当前活动单元格左边的单元格
    case 'ArrowLeft':
      event.preventDefault();
      updateCell({ ...transformStart(0, -1) });
      transformEnd(false);
      break;
    // 移动到当前活动单元格右边的单元格
    case 'ArrowRight':
      event.preventDefault();
      updateCell({ ...transformStart(0, 1) });
      transformEnd(false);
      break;
    // Tab 移动到当前选中或活动单元格的右侧单元格，如果到最后一列且存在下一行，则从下一行开始移动
    // Tab + Shift 移动到当前选中或活动单元格的左侧单元格，如果到第一列且存在上一行，则从上一行开始移动
    case 'Tab':
      event.preventDefault();
      updateCell({
        ...transformStart(0, event.shiftKey ? -1 : 1),
        editable: false,
      });
      transformEnd(true);
      break;
    // 取消编辑并移动到当前活动单元格下面的单元格
    case 'Enter':
      event.preventDefault();
      updateCell({ ...transformStart(1, 0), editable: false });
      transformEnd(true);
      break;
    // 激活单元格编辑
    case 'F2':
      updateCell({ editable: true });
      transformEnd(false);
      break;
    // 取消单元格编辑
    case 'Escape':
      updateCell({ editable: false });
      transformEnd(false);
      break;
  }
};

const registerGlobalMousedownEvent = (event: MouseEvent) => {
  const el = tableInstance.value?.$el;
  const { flag } = el ? getEventTargetNode(event, el as Element) : { flag: false };
  activated.value = flag;
};

const changeInstance = (instance: Record<string, any> | null) => {
  if (instance) {
    instance.validate = validate;
  }
  (vm as any).exposed = (vm as any).exposeProxy = tableInstance.value = instance ?? {};
};

watch(activated, (value) => {
  !value && updateCell({ ...ORIGINAL_CELL_META });
});

watch(
  () => props.data,
  (data) => {
    cachedData.value = cloneDeep(data);
  },
  { immediate: true },
);

provide(
  PLUS_TABLE_INJECTION_KEY,
  reactive({
    tableKey: props.tableKey,
    rowKey: props.rowKey,
    tableWrapperInstance,
    tableInstance,
    paginationInstance,
    activated,
    cellMeta,
    cachedData,
    refColumns,
    cachedColumns,
    rowMeta,
    columnMeta,
    hasHidden,
    validationErrors,
  }),
);

provide(PLUS_TABLE_FORM_INJECTION_KEY, formRefs);

onMounted(() => {
  document.addEventListener('keydown', registerGlobalKeydownEvent, false);
  window.addEventListener('mousedown', registerGlobalMousedownEvent, false);
});

onUnmounted(() => {
  document.removeEventListener('keydown', registerGlobalKeydownEvent, false);
  window.removeEventListener('mousedown', registerGlobalMousedownEvent, false);
});

onDeactivated(() => {
  document.removeEventListener('keydown', registerGlobalKeydownEvent, false);
  window.removeEventListener('mousedown', registerGlobalMousedownEvent, false);
});
</script>

<style lang="scss">
.re-table {
  .el-table {
    --el-table-header-bg-color: #f5f7fa;
    --el-table-header-text-color: #606266;
    --el-table-text-color: var(--el-text-color-regular);

    thead {
      th {
        font-weight: 500;
      }
    }
  }

  .current-cell {
    box-shadow: inset 0 0 0 1px var(--el-color-success-dark-2);
  }

  .dirty-cell {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent var(--el-color-danger) transparent transparent;
      transform: rotate(45deg);
    }
  }

  .el-form-item {
    margin-bottom: 0;
  }
}
</style>

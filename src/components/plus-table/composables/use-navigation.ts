import { computed, nextTick, ref, type Ref } from 'vue'

import type { PlusTableColumn, RowData } from '../types'
import { flattenColumnsWithProp, isSpecialColumn } from '../utils'

export interface UseNavigationOptions {
  data: Ref<RowData[]>
  visibleColumns: Ref<PlusTableColumn[]>
  tableRef: Ref<Record<string, any> | null>
}

/** 判断列是否可导航（非特殊列、非隐藏列） */
function isNavigableColumn(col: PlusTableColumn): boolean {
  if (col.hidden) return false
  if (isSpecialColumn(col)) return false
  return true
}

/**
 * 单元格导航 composable
 *
 * - activeRowIndex：data 行索引（-1 表示无激活）
 * - activeColIndex：navigableColumns 中的列索引（-1 表示无激活）
 * - navigate(rowDelta, colDelta)：相对导航，列边界自动换行
 * - focusCell(rowIndex, colIndex)：绝对定位并 clamp 到合法范围
 * - handleCellClick：供主组件绑定 @cell-click
 * - getCellClassName / getRowClassName：供主组件绑定 :cell-class-name / :row-class-name
 */
export function useNavigation(options: UseNavigationOptions) {
  const { data, visibleColumns, tableRef } = options;

  /** 当前激活行（data 行索引） */
  const activeRowIndex = ref(-1);
  /** 当前激活列（navigableColumns 中的索引） */
  const activeColIndex = ref(-1);

  /** 可导航列：展平多级表头，过滤掉 selection/index/expand 及 hidden 列 */
  const navigableColumns = computed(() =>
    flattenColumnsWithProp(visibleColumns.value).filter(isNavigableColumn),
  );

  /** 行对象 → data 索引映射（O(1) 查找，替代 indexOf） */
  const rowIndexMap = computed(() => {
    const map = new Map<RowData, number>();
    data.value.forEach((row, i) => map.set(row, i));
    return map;
  });

  /** 激活列的列配置（从 navigableColumns 中取） */
  const activeColumn = computed(() =>
    activeColIndex.value >= 0
      ? (navigableColumns.value[activeColIndex.value] ?? null)
      : null,
  );

  /** 激活行的行数据 */
  const activeRow = computed(() =>
    activeRowIndex.value >= 0
      ? (data.value[activeRowIndex.value] ?? null)
      : null,
  );

  /** 是否存在激活单元格 */
  const hasActiveCell = computed(
    () => activeRowIndex.value >= 0 && activeColIndex.value >= 0,
  );

  /** 滚动到激活单元格，确保在视口内 */
  function scrollToActiveCell(): void {
    nextTick(() => {
      const tableEl = tableRef.value?.$el as HTMLElement | undefined;
      if (!tableEl) return;
      const cell = tableEl.querySelector(
        'td.plus-table-cell--active',
      ) as HTMLElement | null;
      cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  /**
   * 绝对定位到指定单元格
   * @param rowIndex data 行索引
   * @param colIndex navigableColumns 中的列索引
   */
  function focusCell(rowIndex: number, colIndex: number): void {
    const rowCount = data.value.length;
    const colCount = navigableColumns.value.length;
    if (rowCount === 0 || colCount === 0) return;

    activeRowIndex.value = Math.max(0, Math.min(rowIndex, rowCount - 1));
    activeColIndex.value = Math.max(0, Math.min(colIndex, colCount - 1));
    scrollToActiveCell();
  }

  /**
   * 相对导航
   * - 列溢出时自动换行（上一行末列 / 下一行首列）
   * - 行边界 clamp（不超出数据范围）
   */
  function navigate(rowDelta: number, colDelta: number): void {
    const rowCount = data.value.length;
    const colCount = navigableColumns.value.length;
    if (rowCount === 0 || colCount === 0) return;

    let newRow = activeRowIndex.value < 0 ? 0 : activeRowIndex.value + rowDelta;
    let newCol = activeColIndex.value < 0 ? 0 : activeColIndex.value + colDelta;

    // 列换行
    if (newCol < 0) {
      newRow -= 1;
      newCol = colCount - 1;
    } else if (newCol >= colCount) {
      newRow += 1;
      newCol = 0;
    }

    // 行边界 clamp
    newRow = Math.max(0, Math.min(newRow, rowCount - 1));

    activeRowIndex.value = newRow;
    activeColIndex.value = newCol;
    scrollToActiveCell();
  }

  /**
   * 处理 el-table cell-click 事件
   * 跳过不可导航列（selection / index / expand）
   */
  function handleCellClick(row: RowData, column: any): void {
    if (!column) return;

    // 跳过特殊列
    if (column?.type && isSpecialColumn({ type: column.type } as PlusTableColumn))
      return;

    const rowIndex = rowIndexMap.value.get(row) ?? -1;
    if (rowIndex < 0) return;

    const navIdx = navigableColumns.value.findIndex(
      (col) => col.prop === column.property,
    );
    if (navIdx < 0) return;

    activeRowIndex.value = rowIndex;
    activeColIndex.value = navIdx;
  }

  /**
   * 供 el-table :cell-class-name 使用
   * 激活单元格加 'plus-table-cell--active'
   */
  function getCellClassName({
    row,
    column,
  }: {
    row: RowData;
    column: any;
    rowIndex: number;
    columnIndex: number;
  }): string {
    if (!hasActiveCell.value) return '';
    // el-table 在排序后传入的 rowIndex 是渲染顺序（$index），与 data 下标不一致；用行引用判断
    const ar = activeRow.value;
    if (
      ar != null &&
      row === ar &&
      column.property === activeColumn.value?.prop
    ) {
      return 'plus-table-cell--active';
    }
    return '';
  }

  /**
   * 供 el-table :row-class-name 使用
   * 激活行加 'plus-table-row--active'
   */
  function getRowClassName({ row }: { row: RowData; rowIndex: number }): string {
    const ar = activeRow.value;
    return ar != null && row === ar ? 'plus-table-row--active' : '';
  }

  return {
    activeRowIndex,
    activeColIndex,
    navigableColumns,
    activeRow,
    activeColumn,
    hasActiveCell,
    navigate,
    focusCell,
    scrollToActiveCell,
    handleCellClick,
    getCellClassName,
    getRowClassName,
  };
}

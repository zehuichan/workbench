import { computed, nextTick, ref, type Ref } from 'vue';

import type { AntTableColumn, RowData } from '../types';
import { columnField, flattenLeafColumns } from '../utils';

export interface UseNavigationOptions {
  data: Ref<RowData[]>;
  visibleColumns: Ref<AntTableColumn[]>;
  wrapperEl: Ref<HTMLElement | null>;
}

/**
 * 单元格导航 composable
 *
 * - activeRowIndex：data 行索引（-1 表示无激活）
 * - activeColIndex：navigableColumns 中的列索引（-1 表示无激活）
 * - navigate(rowDelta, colDelta)：相对导航，列边界自动换行
 * - focusCell(rowIndex, colIndex)：绝对定位并 clamp 到合法范围
 * - handleCellClick(rowIndex, field)：供 customCell.onClick 调用
 * - isActiveCell(rowIndex, field)：供 Cell 组件判断激活态
 */
export function useNavigation(options: UseNavigationOptions) {
  const { data, visibleColumns, wrapperEl } = options;

  const activeRowIndex = ref(-1);
  const activeColIndex = ref(-1);

  /** 可导航列：展平多级表头，仅保留含字段(dataIndex string)且未隐藏的叶子列 */
  const navigableColumns = computed(() =>
    flattenLeafColumns(visibleColumns.value).filter(
      (col) => !col.hidden && !!columnField(col),
    ),
  );

  const activeColumn = computed(() =>
    activeColIndex.value >= 0
      ? (navigableColumns.value[activeColIndex.value] ?? null)
      : null,
  );

  const activeRow = computed(() =>
    activeRowIndex.value >= 0
      ? (data.value[activeRowIndex.value] ?? null)
      : null,
  );

  function scrollToActiveCell(): void {
    nextTick(() => {
      const cell = wrapperEl.value?.querySelector(
        '.atbl-cell--active',
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

    let newRow =
      activeRowIndex.value < 0 ? 0 : activeRowIndex.value + rowDelta;
    let newCol =
      activeColIndex.value < 0 ? 0 : activeColIndex.value + colDelta;

    if (newCol < 0) {
      newRow -= 1;
      newCol = colCount - 1;
    } else if (newCol >= colCount) {
      newRow += 1;
      newCol = 0;
    }

    newRow = Math.max(0, Math.min(newRow, rowCount - 1));

    activeRowIndex.value = newRow;
    activeColIndex.value = newCol;
    scrollToActiveCell();
  }

  /** 点击单元格（rowIndex 为 dataSource 索引，field 为列字段） */
  function handleCellClick(rowIndex: number, field: string): void {
    if (rowIndex < 0 || !field) return;
    const navIdx = navigableColumns.value.findIndex(
      (col) => columnField(col) === field,
    );
    if (navIdx < 0) return;
    activeRowIndex.value = rowIndex;
    activeColIndex.value = navIdx;
  }

  /** 判断单元格是否激活 */
  function isActiveCell(rowIndex: number, field: string | undefined): boolean {
    if (!field) return false;
    if (activeRowIndex.value !== rowIndex) return false;
    return columnField(activeColumn.value ?? {}) === field;
  }

  return {
    activeRowIndex,
    activeColIndex,
    navigableColumns,
    activeRow,
    activeColumn,
    navigate,
    focusCell,
    scrollToActiveCell,
    handleCellClick,
    isActiveCell,
  };
}

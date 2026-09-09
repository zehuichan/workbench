import type { GridyColumn, GridyDataColumn, GridyRecord, GridySummaryCell } from './types';

import { isFunction } from 'es-toolkit';

import { alignClass, columnKey, specialClass, widthStyle } from './column';

export function isSummaryDataColumn(column: GridyColumn): column is GridyDataColumn {
  return column.type === undefined && isFunction(column.summary);
}

export function aggregateColumn(column: GridyDataColumn, rows: GridyRecord[]): number | string {
  const summary = column.summary;
  if (!isFunction(summary)) {
    return '';
  }
  return summary({
    field: column.field,
    rows,
    values: rows.map((row) => row[column.field]),
  });
}

function emptyCell(column: GridyColumn): GridySummaryCell {
  return {
    className: specialClass(column),
    content: '',
    key: columnKey(column),
    style: widthStyle(column),
    tdClass: alignClass(column, 'td'),
  };
}

function valueCell(
  column: GridyDataColumn,
  rows: GridyRecord[],
  prefix?: string,
): GridySummaryCell {
  return {
    className: specialClass(column),
    content: aggregateColumn(column, rows),
    field: column.field,
    key: column.field,
    label: prefix,
    style: widthStyle(column),
    tdClass: alignClass(column, 'td'),
  };
}

/**
 * 合计行单元格：前导非合计列合并后放 label；其余非合计列留空；合计数据列写宿主函数返回值。
 * 若所有列都要合计，label 作为第一格前缀，避免把首列汇总值挤掉。
 */
export function buildSummaryCells(
  columns: GridyColumn[],
  rows: GridyRecord[],
  label: string,
): GridySummaryCell[] {
  const cells: GridySummaryCell[] = [];
  let placedLabel = false;
  let index = 0;

  while (index < columns.length) {
    const column = columns[index]!;
    if (isSummaryDataColumn(column)) {
      cells.push(valueCell(column, rows, placedLabel ? undefined : label));
      placedLabel = true;
      index += 1;
      continue;
    }

    if (!placedLabel) {
      let span = 1;
      let cursor = index + 1;
      while (cursor < columns.length && !isSummaryDataColumn(columns[cursor]!)) {
        span += 1;
        cursor += 1;
      }
      cells.push({
        className: specialClass(column),
        colspan: span > 1 ? span : undefined,
        content: label,
        key: `label-${columnKey(column)}`,
        style: widthStyle(column),
        tdClass: alignClass(column, 'td'),
      });
      placedLabel = true;
      index = cursor;
      continue;
    }

    cells.push(emptyCell(column));
    index += 1;
  }

  return cells;
}

import type { TestTable } from '../helpers/create-test-table';

import { afterEach, describe, expect, it } from 'vitest';

import { cellPosition } from '../helpers/cell-position';
import { createTestTable } from '../helpers/create-test-table';

interface Row {
  a: string;
  b: string;
  c: string;
  id: number;
}

const data: Row[] = [
  { id: 1, a: '1a', b: '1b', c: '1c' },
  { id: 2, a: '2a', b: '2b', c: '2c' },
];
const columns = [{ prop: 'a' }, { prop: 'b' }, { prop: 'c' }];

describe('PlusTable current-cell navigation', () => {
  const tables: TestTable<Row>[] = [];

  function setup(rows: Row[] = data) {
    const testTable = createTestTable<Row>({ data: rows, columns });
    tables.push(testTable);
    return testTable;
  }

  afterEach(() => {
    for (const testTable of tables.splice(0)) testTable.dispose();
  });

  it('starts each movement at the first cell when no cell is active', () => {
    const firstCell = { rowIndex: 0, colIndex: 0 };

    {
      const { table } = setup();
      table.moveCurrent(1, 1);
      expect(cellPosition(table.getCurrentCellLocation())).toEqual(firstCell);
    }

    {
      const { table } = setup();
      table.moveSequential(1);
      expect(cellPosition(table.getCurrentCellLocation())).toEqual(firstCell);
    }

    {
      const { table } = setup();
      table.moveToRowEdge(true);
      expect(cellPosition(table.getCurrentCellLocation())).toEqual(firstCell);
    }
  });

  it('moves by row and column deltas and clamps at table corners', () => {
    const { table } = setup();

    table.setCurrentCell(0, 0, false);
    table.moveCurrent(1, 0);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    table.moveCurrent(0, 1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 1,
    });

    table.setCurrentCell(0, 0, false);
    table.moveCurrent(-1, -1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });

    table.setCurrentCell(1, 2, false);
    table.moveCurrent(1, 1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves sequentially across rows and clamps at table ends', () => {
    const { table } = setup();

    table.setCurrentCell(0, 2, false);
    table.moveSequential(1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    table.moveSequential(-1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 0,
      colIndex: 2,
    });

    table.setCurrentCell(0, 0, false);
    table.moveSequential(-1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });

    table.setCurrentCell(1, 2, false);
    table.moveSequential(1);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves to either row edge without changing rows', () => {
    const { table } = setup();

    table.setCurrentCell(1, 1, false);
    table.moveToRowEdge(false);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    table.setCurrentCell(1, 1, false);
    table.moveToRowEdge(true);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves to either table corner', () => {
    const { table } = setup();

    table.moveToTableCorner(true);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });

    table.moveToTableCorner(false);
    expect(cellPosition(table.getCurrentCellLocation())).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });
  });

  it('keeps the current cell null when moving through an empty table', () => {
    const { table } = setup([]);

    table.moveCurrent(1, 1);
    expect(cellPosition(table.getCurrentCellLocation())).toBeNull();

    table.moveSequential(1);
    expect(cellPosition(table.getCurrentCellLocation())).toBeNull();

    table.moveToRowEdge(true);
    expect(cellPosition(table.getCurrentCellLocation())).toBeNull();

    table.moveToTableCorner(true);
    expect(cellPosition(table.getCurrentCellLocation())).toBeNull();
  });
});

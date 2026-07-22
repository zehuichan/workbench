import { afterEach, describe, expect, it } from 'vitest';
import { createTestTable, type TestTable } from '../helpers/create-test-table';

interface Row {
  id: number;
  a: string;
  b: string;
  c: string;
}

const data: Row[] = [
  { id: 1, a: '1a', b: '1b', c: '1c' },
  { id: 2, a: '2a', b: '2b', c: '2c' },
];
const columns = [{ prop: 'a' }, { prop: 'b' }, { prop: 'c' }];

describe('PlusTable current-cell navigation', () => {
  const tables: TestTable<Row>[] = [];

  function setup(rows: Row[] = data) {
    const table = createTestTable<Row>({ data: rows, columns });
    tables.push(table);
    return table;
  }

  afterEach(() => {
    for (const table of tables.splice(0)) table.dispose();
  });

  it('starts each movement at the first cell when no cell is active', () => {
    const { store } = setup();
    const firstCell = { rowIndex: 0, colIndex: 0 };

    store.moveCurrent(1, 1);
    expect(store.states.currentCell.value).toEqual(firstCell);

    store.states.currentCell.value = null;
    store.moveSequential(1);
    expect(store.states.currentCell.value).toEqual(firstCell);

    store.states.currentCell.value = null;
    store.moveToRowEdge(true);
    expect(store.states.currentCell.value).toEqual(firstCell);
  });

  it('moves by row and column deltas and clamps at table corners', () => {
    const { store } = setup();

    store.setCurrentCell(0, 0, false);
    store.moveCurrent(1, 0);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    store.moveCurrent(0, 1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 1,
    });

    store.setCurrentCell(0, 0, false);
    store.moveCurrent(-1, -1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });

    store.setCurrentCell(1, 2, false);
    store.moveCurrent(1, 1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves sequentially across rows and clamps at table ends', () => {
    const { store } = setup();

    store.setCurrentCell(0, 2, false);
    store.moveSequential(1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    store.moveSequential(-1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 0,
      colIndex: 2,
    });

    store.setCurrentCell(0, 0, false);
    store.moveSequential(-1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });

    store.setCurrentCell(1, 2, false);
    store.moveSequential(1);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves to either row edge without changing rows', () => {
    const { store } = setup();

    store.setCurrentCell(1, 1, false);
    store.moveToRowEdge(false);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 0,
    });

    store.setCurrentCell(1, 1, false);
    store.moveToRowEdge(true);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });
  });

  it('moves to either table corner', () => {
    const { store } = setup();

    store.moveToTableCorner(true);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 1,
      colIndex: 2,
    });

    store.moveToTableCorner(false);
    expect(store.states.currentCell.value).toEqual({
      rowIndex: 0,
      colIndex: 0,
    });
  });

  it('keeps the current cell null when moving through an empty table', () => {
    const { store } = setup([]);

    store.moveCurrent(1, 1);
    expect(store.states.currentCell.value).toBeNull();

    store.moveSequential(1);
    expect(store.states.currentCell.value).toBeNull();

    store.moveToRowEdge(true);
    expect(store.states.currentCell.value).toBeNull();

    store.moveToTableCorner(true);
    expect(store.states.currentCell.value).toBeNull();
  });
});

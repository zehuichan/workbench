import { nextTick } from 'vue';
import { afterAll, bench, describe } from 'vitest';
import { createTestTable } from './helpers/create-test-table';
import type { ColumnNode } from '../types';

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
  note: string;
  [key: string]: string | number;
}

const BENCHMARK_OPTIONS = { time: 1000, warmupTime: 200 } as const;
const ROW_COUNT = 1000;
const DEPENDENT_COUNT = 20;
const EDIT_ROW_INDEX = 500;

function createRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `row-${index}`,
    amount: index,
    status: index % 2 === 0 ? 'open' : 'locked',
    note: `note-${index}`,
  }));
}

const editColumns = [
  { prop: 'name', label: '名称', editable: true },
  { prop: 'amount', label: '金额', editable: true },
  { prop: 'note', label: '备注', editable: true },
];

const dependencyColumns = [
  { prop: 'status', label: '状态', editable: true },
  ...Array.from({ length: DEPENDENT_COUNT }, (_, index) => ({
    prop: `dep${index}`,
    label: `依赖 ${index}`,
    editable: true,
    dependencies: {
      triggerFields: ['status'],
      disabled: (row: Row) => row.status === 'locked',
      componentProps: (row: Row) => ({ placeholder: row.status }),
      trigger: (row: Row) => {
        void row.status;
      },
    },
  })),
];

const validationColumns = [
  { prop: 'name', label: '名称', editable: true, required: true },
  {
    prop: 'amount',
    label: '金额',
    editable: true,
    rules: [{ type: 'number', min: 0, message: '金额不能为负' }],
  },
];

const editTable = createTestTable<Row>({
  data: createRows(ROW_COUNT),
  columns: editColumns,
  history: true,
  dirtyTracking: true,
});

const syncTable = createTestTable<Row>({
  data: createRows(ROW_COUNT),
  columns: editColumns,
});

const dependencyTable = createTestTable<Row>({
  data: createRows(ROW_COUNT).map((row) => {
    const next: Row = { ...row };
    for (let index = 0; index < DEPENDENT_COUNT; index += 1) {
      next[`dep${index}`] = row.status;
    }
    return next;
  }),
  columns: dependencyColumns,
});

const validationTable = createTestTable<Row>({
  data: createRows(ROW_COUNT),
  columns: validationColumns,
});

const rowOpsTable = createTestTable<Row>({
  data: createRows(ROW_COUNT),
  columns: editColumns,
});

const rowModeTable = createTestTable<Row>({
  data: createRows(ROW_COUNT),
  columns: editColumns,
  mode: 'row',
  history: true,
  dirtyTracking: true,
});

const dependentNodes: ColumnNode<Row>[] = Array.from({ length: DEPENDENT_COUNT }, (_, index) => {
  const node = dependencyTable.table.getColumnById(`dep${index}`);
  if (!node) throw new Error(`[benchmark] missing dependent column dep${index}`);
  return node;
});

const dependencyRow = dependencyTable.table.data.value[0]!;
const editRow = editTable.table.data.value[EDIT_ROW_INDEX]!;
const editRowKey = String(editRow.id);

// Seed one history entry so undo / redo always has work.
editTable.table.setCellValue(editRow, EDIT_ROW_INDEX, 'name', 'seed');

// Leave every name empty so getErrors() sorts a full error list.
for (const row of validationTable.table.data.value) {
  const location = validationTable.table.keysMap.value.get(String(row.id));
  if (!location) throw new Error('[benchmark] missing validation row');
  validationTable.table.setCellValue(location.row, location.rowIndex, 'name', '');
}
await validationTable.table.validate(false);

let writeIteration = 0;
let dependencyIteration = 0;
let cellEditIteration = 0;
let rowEditIteration = 0;
let replaceIteration = 0;

afterAll(() => {
  editTable.dispose();
  syncTable.dispose();
  dependencyTable.dispose();
  validationTable.dispose();
  rowOpsTable.dispose();
  rowModeTable.dispose();
});

describe('table data sync performance', () => {
  bench(
    'assemble and dispose a 1000-row table',
    () => {
      const table = createTestTable<Row>({
        data: createRows(ROW_COUNT),
        columns: editColumns,
      });
      table.dispose();
    },
    BENCHMARK_OPTIONS,
  );

  bench(
    'reorder 1000 rows in place',
    async () => {
      syncTable.props.data = [...syncTable.table.data.value].reverse();
      await nextTick();
    },
    BENCHMARK_OPTIONS,
  );

  bench(
    'replace 1000 rows with new objects',
    async () => {
      replaceIteration += 1;
      const rows = createRows(ROW_COUNT);
      for (const row of rows) {
        row.name = `replace-${replaceIteration}-${row.id}`;
      }
      syncTable.props.data = rows;
      await nextTick();
    },
    BENCHMARK_OPTIONS,
  );
});

describe('table write pipeline performance', () => {
  bench(
    'write one cell with history and dirty tracking',
    () => {
      writeIteration += 1;
      editTable.table.setCellValue(editRow, EDIT_ROW_INDEX, 'name', `v${writeIteration}`);
    },
    BENCHMARK_OPTIONS,
  );

  bench(
    'undo and redo one cell write',
    () => {
      editTable.table.undo();
      editTable.table.redo();
    },
    BENCHMARK_OPTIONS,
  );
});

describe('table dependency performance', () => {
  bench(
    'trigger 20 dependent columns from one field',
    () => {
      dependencyIteration += 1;
      dependencyTable.table.setCellValue(
        dependencyRow,
        0,
        'status',
        dependencyIteration % 2 === 0 ? 'locked' : 'open',
      );
      for (const node of dependentNodes) {
        dependencyTable.table.getDependencyState(dependencyRow, 0, node);
      }
    },
    BENCHMARK_OPTIONS,
  );
});

describe('table validation performance', () => {
  bench(
    'validate 1000 rows with static rules',
    async () => {
      await validationTable.table.validate(false);
    },
    BENCHMARK_OPTIONS,
  );

  bench(
    'collect sorted errors',
    () => {
      validationTable.table.getErrors();
    },
    BENCHMARK_OPTIONS,
  );
});

describe('table row operation performance', () => {
  bench(
    'insert and remove one row in a 1000-row table',
    async () => {
      rowOpsTable.table.insertRow({
        id: ROW_COUNT + 1,
        name: 'temporary',
        amount: 0,
        status: 'open',
        note: '',
      });
      await nextTick();
      rowOpsTable.table.removeRow(ROW_COUNT);
      await nextTick();
    },
    BENCHMARK_OPTIONS,
  );
});

describe('table editing performance', () => {
  bench(
    'start and commit one cell edit',
    () => {
      cellEditIteration += 1;
      editTable.table.setCurrentCell(EDIT_ROW_INDEX, 0, false);
      editTable.table.startEdit(EDIT_ROW_INDEX, 0);
      editTable.table.setDraft(editRowKey, 'name', `cell-${cellEditIteration}`);
      editTable.table.commitEdit();
    },
    BENCHMARK_OPTIONS,
  );

  bench(
    'start and commit one row edit',
    async () => {
      rowEditIteration += 1;
      const row = rowModeTable.table.data.value[EDIT_ROW_INDEX]!;
      const rowKey = String(row.id);
      rowModeTable.table.startRowEdit(EDIT_ROW_INDEX);
      rowModeTable.table.setDraft(rowKey, 'name', `row-${rowEditIteration}`);
      rowModeTable.table.setDraft(rowKey, 'note', `note-${rowEditIteration}`);
      await rowModeTable.table.commitRowEdit(EDIT_ROW_INDEX);
    },
    BENCHMARK_OPTIONS,
  );
});

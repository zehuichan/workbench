import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestTable, type TestTable } from '../helpers/create-test-table';
import type { RuleItem } from 'async-validator';

interface Row {
  id: number;
  a: string;
  b: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: index + 1, a: '', b: '' }));
}

describe('PlusTable validation', () => {
  const tables: TestTable<Row>[] = [];

  function setup(data: Row[], columns: Record<string, unknown>[]) {
    const testTable = createTestTable<Row>({ data, columns });
    tables.push(testTable);
    return testTable;
  }

  afterEach(() => {
    for (const testTable of tables.splice(0)) testTable.dispose();
    vi.restoreAllMocks();
  });

  it('validates rows through a bounded concurrency pool', async () => {
    let active = 0;
    let peak = 0;
    const validatedIds: number[] = [];
    const rule: RuleItem = {
      asyncValidator: async (_rule, _value, _callback, source) => {
        active += 1;
        peak = Math.max(peak, active);
        validatedIds.push((source as Row).id);
        await delay(1);
        active -= 1;
      },
    };
    const { table } = setup(createRows(12), [{ prop: 'a', label: 'A', rules: [rule] }]);

    const result = await table.validate(false);

    // 12 行只有 4 条在飞：既不是串行（1），也不是一次性全放出去（12）
    expect(peak).toBe(4);
    expect(validatedIds).toHaveLength(12);
    expect(new Set(validatedIds).size).toBe(12);
    expect(result.valid).toBe(true);
  });

  /**
   * 让错误的写入顺序与视觉顺序完全相反：末行的 A 最先失败，首行的 B 最后失败，
   * 且 fixed 把 B 排到了 A 前面。
   */
  function setupScrambledErrors() {
    const failAfter = (ms: (row: Row) => number): RuleItem => ({
      asyncValidator: async (_rule, _value, _callback, source) => {
        await delay(ms(source as Row));
        throw new Error('不能为空');
      },
    });
    const testTable = setup(createRows(2), [
      { prop: 'a', label: 'A', rules: [failAfter((row) => (row.id === 1 ? 20 : 0))] },
      { prop: 'b', label: 'B', fixed: 'left', rules: [failAfter(() => 40)] },
    ]);
    return testTable.table;
  }

  it('returns errors ordered by visual row and column position', async () => {
    const table = setupScrambledErrors();

    const result = await table.validate(false);

    expect(table.columns.value.map((node) => node.column.prop)).toEqual(['b', 'a']);
    expect(result.errors.map((error) => [error.rowIndex, error.prop])).toEqual([
      [0, 'b'],
      [0, 'a'],
      [1, 'b'],
      [1, 'a'],
    ]);
    expect(table.getErrors()).toEqual(result.errors);
  });

  it('activates the visually first error cell', async () => {
    const table = setupScrambledErrors();

    await table.validate();

    expect(table.currentCell.value).toEqual({ rowIndex: 0, colIndex: 0 });
  });

  it('keeps hidden-column errors last and skips scrolling to them', async () => {
    const { table } = setup(createRows(1), [
      { prop: 'a', label: 'A', required: true, visible: false },
      { prop: 'b', label: 'B', required: true },
    ]);

    const result = await table.validate();

    expect(result.errors.map((error) => error.prop)).toEqual(['b', 'a']);
    expect(table.currentCell.value).toEqual({ rowIndex: 0, colIndex: 0 });
  });

  it('stops retrying a row that keeps being preempted by newer input', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let attempts = 0;
    let preempting = false;
    let testTable!: TestTable<Row>;
    const preemptedRule: RuleItem = {
      asyncValidator: async (_rule, _value, _callback, source) => {
        // 抢占用的那次校验不再自我递归，每一轮重试只被打断一次
        if (preempting) return;
        preempting = true;
        attempts += 1;
        void testTable.table.validateCell(source as Row, 0, 'a');
        preempting = false;
        await delay(0);
      },
    };
    testTable = setup(createRows(1), [{ prop: 'a', label: 'A', rules: [preemptedRule] }]);

    await expect(testTable.table.validateRow(0)).resolves.toEqual([]);

    // 首次 + 5 次重试后放弃，不再无限重试
    expect(attempts).toBe(6);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('放弃重试'));
  });

  it('rebuilds required-field messages after the column label changes', async () => {
    const testTable = setup(createRows(1), [{ prop: 'a', label: 'A', required: true }]);
    const row = testTable.table.data.value[0]!;

    await testTable.table.validateCell(row, 0, 'a');
    expect(testTable.table.getCellError(row, 'a')?.message).toBe('A不能为空');

    testTable.props.columns[0]!.label = 'A 列';
    await testTable.table.validateCell(row, 0, 'a');

    expect(testTable.table.getCellError(row, 'a')?.message).toBe('A 列不能为空');
  });
});

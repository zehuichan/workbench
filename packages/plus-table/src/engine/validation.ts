import { reactive } from 'vue';
import Schema from 'async-validator';
import type { ComputedRef } from 'vue';
import type { ValidateError } from 'async-validator';
import type {
  CellError,
  CellRule,
  ColumnNode,
  PlusTableColumn,
  PlusTableProps,
  RowData,
  ValidateResult,
} from '../types';
import type { DependencyState } from './dependencies';

export interface ValidationOptions {
  props: PlusTableProps;
  data: () => RowData[];
  leafNodes: ComputedRef<ColumnNode[]>;
  getRowKeyStr: (row: RowData) => string;
  getDependencyState: (
    row: RowData,
    rowIndex: number,
    column: PlusTableColumn,
  ) => DependencyState;
  scrollToCell: (rowIndex: number, colIndex: number) => void;
}

export function createValidation(options: ValidationOptions) {
  const { data, leafNodes, getRowKeyStr, getDependencyState, scrollToCell } = options;

  /** key 为 `${rowKey}:${field}` */
  const errors = reactive(new Map<string, CellError>());

  const errorKey = (rowKey: string, field: string) => `${rowKey}:${field}`;

  function getCellError(row: RowData, field: string): CellError | undefined {
    return errors.get(errorKey(getRowKeyStr(row), field));
  }

  function buildRules(row: RowData, rowIndex: number, node: ColumnNode): CellRule[] {
    const column = node.column;
    const depState = getDependencyState(row, rowIndex, column);
    const rules: CellRule[] = [];
    if (column.required || depState.required) {
      rules.push({
        required: true,
        message: `${column.title ?? column.field}不能为空`,
      });
    }
    if (column.rules?.length) rules.push(...column.rules);
    if (depState.rules?.length) rules.push(...depState.rules);
    return rules;
  }

  async function validateCellNode(
    row: RowData,
    rowIndex: number,
    node: ColumnNode,
  ): Promise<CellError | null> {
    const field = node.column.field;
    if (!field) return null;
    const rowKey = getRowKeyStr(row);
    const key = errorKey(rowKey, field);
    const rules = buildRules(row, rowIndex, node);
    if (!rules.length) {
      errors.delete(key);
      return null;
    }
    try {
      // source 传整行，规则中的自定义 validator 可做跨字段校验
      await new Schema({ [field]: rules }).validate(row, {
        first: true,
        suppressWarning: true,
      });
      errors.delete(key);
      return null;
    } catch (err) {
      const validateErrors = (err as { errors?: ValidateError[] })?.errors;
      const message = validateErrors?.[0]?.message ?? '校验失败';
      const cellError: CellError = { rowKey, rowIndex, field, message };
      errors.set(key, cellError);
      return cellError;
    }
  }

  async function validateCellByField(
    row: RowData,
    rowIndex: number,
    field: string,
  ): Promise<CellError | null> {
    const node = leafNodes.value.find((n) => n.column.field === field);
    if (!node) return null;
    return validateCellNode(row, rowIndex, node);
  }

  async function validateRow(rowIndex: number): Promise<CellError[]> {
    const row = data()[rowIndex];
    if (!row) return [];
    const results = await Promise.all(
      leafNodes.value.map((node) => validateCellNode(row, rowIndex, node)),
    );
    return results.filter((item): item is CellError => item !== null);
  }

  /** 全表校验；默认滚动并激活到首个错误格 */
  async function validate(scrollToFirstError = true): Promise<ValidateResult> {
    const rows = data();
    const collected: CellError[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      collected.push(...(await validateRow(rowIndex)));
    }
    if (scrollToFirstError && collected.length) {
      const first = collected[0];
      const colIndex = leafNodes.value.findIndex(
        (node) => node.column.field === first.field,
      );
      if (colIndex >= 0) scrollToCell(first.rowIndex, colIndex);
    }
    return { valid: collected.length === 0, errors: collected };
  }

  function clearValidate() {
    errors.clear();
  }

  function clearRowValidate(row: RowData) {
    const prefix = `${getRowKeyStr(row)}:`;
    for (const key of [...errors.keys()]) {
      if (key.startsWith(prefix)) errors.delete(key);
    }
  }

  return {
    errors,
    getCellError,
    validateCellByField,
    validateRow,
    validate,
    clearValidate,
    clearRowValidate,
  };
}

export type ValidationApi = ReturnType<typeof createValidation>;

import { reactive } from 'vue';
import { compact } from 'es-toolkit';
import Schema from 'async-validator';
import type { ValidateError } from 'async-validator';
import type { PlusTable } from '../tokens';
import type {
  CellError,
  CellRule,
  RowData,
  ValidateResult,
} from '../table/defaults';
import type { ColumnNode } from '../table-column/defaults';

export function useValidation<T extends RowData = RowData>(
  table: PlusTable<T>,
) {
  /** rowKey -> prop -> 单元格错误 */
  const errors = reactive(new Map<string, Map<string, CellError>>());

  /** rowKey -> prop -> 最新一次发起校验的版本号；异步 resolve 时非最新版本的结果直接丢弃，避免旧结果覆盖新结果。 */
  const versions = new Map<string, Map<string, number>>();
  /** 全局单调递增，行版本表清除后也不会复用旧校验的版本号。 */
  let nextVersion = 0;

  function bumpVersion(rowKey: string, prop: string): number {
    let propVersions = versions.get(rowKey);
    if (!propVersions) {
      propVersions = new Map();
      versions.set(rowKey, propVersions);
    }
    const next = ++nextVersion;
    propVersions.set(prop, next);
    return next;
  }

  function isLatestVersion(
    rowKey: string,
    prop: string,
    version: number,
  ): boolean {
    return versions.get(rowKey)?.get(prop) === version;
  }

  function setCellError(error: CellError): void {
    let rowErrors = errors.get(error.rowKey);
    if (!rowErrors) {
      rowErrors = reactive(new Map<string, CellError>());
      errors.set(error.rowKey, rowErrors);
    }
    rowErrors.set(error.prop, error);
  }

  function deleteCellError(rowKey: string, prop: string): void {
    const rowErrors = errors.get(rowKey);
    if (!rowErrors?.delete(prop)) return;
    if (rowErrors.size === 0) errors.delete(rowKey);
  }

  function getCellError(row: T, prop: string): CellError | undefined {
    return errors.get(table.store.getRowKey(row))?.get(prop);
  }

  /** 只读访问器：供业务侧渲染自定义错误汇总面板 */
  function getErrors(): CellError[] {
    const result: CellError[] = [];
    for (const rowErrors of errors.values()) {
      result.push(...rowErrors.values());
    }
    return result;
  }

  function buildRules(
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
  ): CellRule[] {
    const column = node.column;
    const depState = table.store.getDependencyState(row, rowIndex, column);
    const rules: CellRule[] = [];
    if (column.required || depState.required) {
      rules.push({
        required: true,
        message: `${column.label ?? column.prop}不能为空`,
      });
    }
    if (column.rules?.length) rules.push(...column.rules);
    if (depState.rules?.length) rules.push(...depState.rules);
    return rules;
  }

  async function validateCellNode(
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
  ): Promise<CellError | null> {
    const prop = node.column.prop;
    if (!prop) return null;
    const rowKey = table.store.getRowKey(row);
    const version = bumpVersion(rowKey, prop);
    const rules = buildRules(row, rowIndex, node);

    /** 非最新版本（被后一次输入触发的校验抢先）或该行已被移除时，结果作废；否则返回校验时行的最新下标 */
    const resolveCurrentRowIndex = (): number | null => {
      if (!isLatestVersion(rowKey, prop, version)) return null;
      const location = table.store.states.keysMap.value.get(rowKey);
      return location?.row === row ? location.rowIndex : null;
    };

    if (!rules.length) {
      deleteCellError(rowKey, prop);
      return null;
    }
    try {
      // source 传整行，规则中的自定义 validator 可做跨字段校验。
      await new Schema({ [prop]: rules }).validate(row, {
        first: true,
        suppressWarning: true,
        suppressValidatorError: true,
      });
      if (resolveCurrentRowIndex() === null) return null;
      deleteCellError(rowKey, prop);
      return null;
    } catch (err) {
      const currentIndex = resolveCurrentRowIndex();
      if (currentIndex === null) return null;
      const validateErrors = (err as { errors?: ValidateError[] })?.errors;
      const message = validateErrors?.[0]?.message ?? '校验失败';
      const cellError: CellError = {
        rowKey,
        rowIndex: currentIndex,
        prop,
        message,
      };
      setCellError(cellError);
      return cellError;
    }
  }

  async function validateCell(
    row: T,
    rowIndex: number,
    prop: string,
  ): Promise<CellError | null> {
    const node = table.store.states.allColumns.value.find(
      (n: ColumnNode<T>) => n.column.prop === prop,
    );
    if (!node) return null;
    return validateCellNode(row, rowIndex, node);
  }

  async function validateRow(rowIndex: number): Promise<CellError[]> {
    const row = table.store.states.data.value[rowIndex];
    if (!row) return [];
    const results = await Promise.all(
      table.store.states.allColumns.value.map((node: ColumnNode<T>) =>
        validateCellNode(row, rowIndex, node),
      ),
    );
    return compact(results);
  }

  /** 全表校验；默认滚动并激活到首个错误格（错误列被列设置隐藏时找不到 colIndex，跳过滚动） */
  async function validate(scrollToFirstError = true): Promise<ValidateResult> {
    const rows = table.store.states.data.value;
    const collected: CellError[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      collected.push(...(await validateRow(rowIndex)));
    }
    if (scrollToFirstError && collected.length) {
      const first = collected[0]!;
      const colIndex = table.store.states.columns.value.findIndex(
        (node: ColumnNode<T>) => node.column.prop === first.prop,
      );
      if (colIndex >= 0) table.store.setCurrentCell(first.rowIndex, colIndex);
    }
    return { valid: collected.length === 0, errors: collected };
  }

  function clearValidate(): void {
    errors.clear();
    versions.clear();
  }

  /** 数据行身份失效时调用：清错误与版本表，使该行所有在飞校验结果作废。 */
  function invalidateValidationRow(rowKey: string): void {
    errors.delete(rowKey);
    versions.delete(rowKey);
  }

  function clearRowValidate(row: T): void {
    invalidateValidationRow(table.store.getRowKey(row));
  }

  /** 行失效后调用：清掉该行残留的错误与版本号，避免长会话下无限增长 */
  function cleanValidation(): void {
    const keysMap = table.store.states.keysMap.value;
    const invalidRowKeys = new Set<string>();
    for (const rowKey of errors.keys()) {
      if (!keysMap.has(rowKey)) invalidRowKeys.add(rowKey);
    }
    for (const rowKey of versions.keys()) {
      if (!keysMap.has(rowKey)) invalidRowKeys.add(rowKey);
    }
    for (const rowKey of invalidRowKeys) invalidateValidationRow(rowKey);

    for (const [rowKey, rowErrors] of errors) {
      const rowIndex = keysMap.get(rowKey)?.rowIndex;
      if (rowIndex === undefined) continue;
      for (const [prop, error] of rowErrors) {
        if (error.rowIndex !== rowIndex) {
          rowErrors.set(prop, { ...error, rowIndex });
        }
      }
    }
  }

  return {
    getCellError,
    getErrors,
    validateCell,
    validateRow,
    validate,
    clearValidate,
    clearRowValidate,
    invalidateValidationRow,
    cleanValidation,
  };
}

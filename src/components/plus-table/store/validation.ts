import { reactive } from 'vue';
import Schema from 'async-validator';
import { isString } from 'es-toolkit';
import type { ValidateError } from 'async-validator';
import type { PlusTable } from '../tokens';
import type {
  CellError,
  CellRule,
  RowData,
  ValidateResult,
} from '../table/defaults';
import type { ColumnNode } from '../table-column/defaults';

const staleValidation = Symbol('stale-validation');
type CellValidationResult = CellError | null | typeof staleValidation;

export function useValidation<T extends RowData = RowData>(
  table: PlusTable<T>,
) {
  /** rowKey -> prop -> 单元格错误 */
  const errors = reactive(new Map<string, Map<string, CellError>>());

  /** rowKey -> prop -> 最新一次发起校验的版本号；异步 resolve 时非最新版本的结果直接丢弃，避免旧结果覆盖新结果。 */
  const versions = new Map<string, Map<string, number>>();
  /** 全局单调递增，行版本表清除后也不会复用旧校验的版本号。 */
  let nextVersion = 0;
  const rowValidationTails = new WeakMap<T, Promise<void>>();

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

  async function validateCellNodes(
    row: T,
    rowIndex: number,
    nodes: readonly ColumnNode<T>[],
  ): Promise<CellValidationResult> {
    const prop = nodes[0]?.column.prop;
    if (!prop) return null;
    const rowKey = table.store.getRowKey(row);
    const version = bumpVersion(rowKey, prop);
    const rules = nodes.flatMap((node) => buildRules(row, rowIndex, node));

    /** 非最新版本（被后一次输入触发的校验抢先）或该行已被移除时，结果作废；否则返回校验时行的最新下标 */
    const resolveCurrentRowIndex = ():
      number | null | typeof staleValidation => {
      if (!isLatestVersion(rowKey, prop, version)) return staleValidation;
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
      const currentIndex = resolveCurrentRowIndex();
      if (currentIndex === staleValidation) return staleValidation;
      if (currentIndex === null) return null;
      deleteCellError(rowKey, prop);
      return null;
    } catch (err) {
      const currentIndex = resolveCurrentRowIndex();
      if (currentIndex === staleValidation) return staleValidation;
      if (currentIndex === null) return null;
      const validateErrors = (err as { errors?: ValidateError[] })?.errors;
      const message = validateErrors?.[0]?.message;
      if (!isString(message)) throw err;
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
    if (
      !Number.isInteger(rowIndex) ||
      table.store.states.data.value[rowIndex] !== row
    ) {
      throw new RangeError(
        `[PlusTable] validateCell 失败：第 ${rowIndex} 行与当前数据不匹配。`,
      );
    }
    const nodes = table.store.getColumnsByProp(prop);
    if (!nodes.length) return null;
    const result = await validateCellNodes(row, rowIndex, nodes);
    return result === staleValidation ? null : result;
  }

  async function validateStableRow(row: T): Promise<CellError[]> {
    while (true) {
      const currentIndex = table.store.states.data.value.indexOf(row);
      if (currentIndex < 0) return [];
      const props = new Set(
        table.store.states.allColumns.value
          .map((node: ColumnNode<T>) => node.column.prop)
          .filter((prop): prop is string => !!prop),
      );
      const results = await Promise.all(
        [...props].map((prop) =>
          validateCellNodes(
            row,
            currentIndex,
            table.store.getColumnsByProp(prop),
          ),
        ),
      );
      if (results.includes(staleValidation)) continue;
      return results.filter(
        (result): result is CellError =>
          result !== null && result !== staleValidation,
      );
    }
  }

  async function validateRow(rowIndex: number): Promise<CellError[]> {
    if (!Number.isInteger(rowIndex)) {
      throw new RangeError(
        `[PlusTable] validateRow 失败：行下标 ${rowIndex} 不是整数。`,
      );
    }
    const row = table.store.states.data.value[rowIndex];
    if (!row) {
      throw new RangeError(
        `[PlusTable] validateRow 失败：行下标 ${rowIndex} 超出有效范围。`,
      );
    }

    const previous = rowValidationTails.get(row);
    const operation = (async () => {
      if (previous) await previous;
      return validateStableRow(row);
    })();
    const tail = operation.then(
      () => undefined,
      () => undefined,
    );
    rowValidationTails.set(row, tail);
    void tail.then(() => {
      if (rowValidationTails.get(row) === tail) rowValidationTails.delete(row);
    });
    return operation;
  }

  /** 全表校验；默认滚动并激活到首个错误格（错误列被列设置隐藏时找不到 colIndex，跳过滚动） */
  async function validate(scrollToFirstError = true): Promise<ValidateResult> {
    const rows = [...table.store.states.data.value];
    for (const row of rows) {
      const rowKey = table.store.getRowKey(row);
      const current = table.store.states.keysMap.value.get(rowKey);
      if (current?.row === row) {
        await validateRow(current.rowIndex);
      }
    }
    const canonicalErrors = getErrors();
    if (scrollToFirstError && canonicalErrors.length) {
      const first = canonicalErrors[0]!;
      const colIndex = table.store.states.columns.value.findIndex(
        (node: ColumnNode<T>) => node.column.prop === first.prop,
      );
      if (colIndex >= 0) table.store.setCurrentCell(first.rowIndex, colIndex);
    }
    return { valid: canonicalErrors.length === 0, errors: canonicalErrors };
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

  function invalidateColumnProps(props: Iterable<string>): void {
    const removed = new Set(props);
    if (!removed.size) return;
    for (const [rowKey, rowErrors] of errors) {
      for (const prop of removed) rowErrors.delete(prop);
      if (!rowErrors.size) errors.delete(rowKey);
    }
    for (const [rowKey, propVersions] of versions) {
      for (const prop of removed) propVersions.delete(prop);
      if (!propVersions.size) versions.delete(rowKey);
    }
  }

  function clearRowValidate(row: T): void {
    invalidateValidationRow(table.store.getRowKey(row));
  }

  /** 行顺序变化后，只重算仍存续错误的公开 rowIndex；身份失效由统一行生命周期先行清理。 */
  function reindexValidationErrors(): void {
    const keysMap = table.store.states.keysMap.value;
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
    invalidateColumnProps,
    reindexValidationErrors,
  };
}

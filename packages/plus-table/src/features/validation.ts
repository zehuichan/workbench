import { reactive } from 'vue';
import { compact } from 'es-toolkit';
import Schema from 'async-validator';
import type { ComputedRef } from 'vue';
import type { ValidateError } from 'async-validator';
import type { TableContext } from '../core/context';
import type {
  CellError,
  CellRule,
  ColumnNode,
  PlusTableColumn,
  RowData,
  ValidateResult,
} from '../types';
import type { DependencyState } from './dependencies';

export interface ValidationOptions<T extends RowData = RowData> {
  context: TableContext<T>;
  /** 可见叶子列，仅用于「首个错误格」的滚动定位（对应 DOM td 序） */
  leafNodes: ComputedRef<ColumnNode<T>[]>;
  /** 全部叶子列（含列设置隐藏的列），校验必须遍历这份而不是可见列，否则隐藏必填列永远不会被校验到 */
  allLeafNodes: ComputedRef<ColumnNode<T>[]>;
  getDependencyState: (
    row: T,
    rowIndex: number,
    column: PlusTableColumn<T>,
  ) => DependencyState;
  scrollToCell: (rowIndex: number, colIndex: number) => void;
}

export function createValidation<T extends RowData = RowData>(
  options: ValidationOptions<T>,
) {
  const { context, leafNodes, allLeafNodes, getDependencyState, scrollToCell } =
    options;

  /** key 为 `${rowKey}:${prop}` */
  const errors = reactive(new Map<string, CellError>());

  /** rowKey -> prop -> 最新一次发起校验的版本号；异步 resolve 时非最新版本的结果直接丢弃，避免旧结果覆盖新结果。
   * 按 rowKey 分层（不是拼接成扁平字符串 key）是为了行被移除时能直接 delete(rowKey) 清理，不必猜测分隔符位置。 */
  const versions = new Map<string, Map<string, number>>();

  function bumpVersion(rowKey: string, prop: string): number {
    let propVersions = versions.get(rowKey);
    if (!propVersions) {
      propVersions = new Map();
      versions.set(rowKey, propVersions);
    }
    const next = (propVersions.get(prop) ?? 0) + 1;
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

  const errorKey = (rowKey: string, prop: string) => `${rowKey}:${prop}`;

  function getCellError(row: T, prop: string): CellError | undefined {
    return errors.get(errorKey(context.getRowKeyStr(row), prop));
  }

  /** 只读访问器：供业务侧渲染自定义错误汇总面板 */
  function getErrors(): CellError[] {
    return [...errors.values()];
  }

  function buildRules(
    row: T,
    rowIndex: number,
    node: ColumnNode<T>,
  ): CellRule[] {
    const column = node.column;
    const depState = getDependencyState(row, rowIndex, column);
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
    const rowKey = context.getRowKeyStr(row);
    const key = errorKey(rowKey, prop);
    const version = bumpVersion(rowKey, prop);
    const rules = buildRules(row, rowIndex, node);

    /** 非最新版本（被后一次输入触发的校验抢先）或该行已被移除时，结果作废；否则返回校验时行的最新下标 */
    const resolveCurrentRowIndex = (): number | null => {
      if (!isLatestVersion(rowKey, prop, version)) return null;
      const location = context.findByKey(rowKey);
      return location ? location.rowIndex : null;
    };

    if (!rules.length) {
      errors.delete(key);
      return null;
    }
    try {
      // source 传整行，规则中的自定义 validator 可做跨字段校验；
      // suppressValidatorError 避免业务侧 rules[].validator 抛错时 async-validator 内部 setTimeout 再抛一次（uncaught，刷屏控制台）
      await new Schema({ [prop]: rules }).validate(row, {
        first: true,
        suppressWarning: true,
        suppressValidatorError: true,
      });
      if (resolveCurrentRowIndex() === null) return null;
      errors.delete(key);
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
      errors.set(key, cellError);
      return cellError;
    }
  }

  async function validateCellByField(
    row: T,
    rowIndex: number,
    prop: string,
  ): Promise<CellError | null> {
    const node = allLeafNodes.value.find((n) => n.column.prop === prop);
    if (!node) return null;
    return validateCellNode(row, rowIndex, node);
  }

  async function validateRow(rowIndex: number): Promise<CellError[]> {
    const row = context.data()[rowIndex];
    if (!row) return [];
    const results = await Promise.all(
      allLeafNodes.value.map((node) => validateCellNode(row, rowIndex, node)),
    );
    return compact(results);
  }

  /** 全表校验；默认滚动并激活到首个错误格（错误列被列设置隐藏时找不到 colIndex，跳过滚动） */
  async function validate(scrollToFirstError = true): Promise<ValidateResult> {
    const rows = context.data();
    const collected: CellError[] = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      collected.push(...(await validateRow(rowIndex)));
    }
    if (scrollToFirstError && collected.length) {
      const first = collected[0]!;
      const colIndex = leafNodes.value.findIndex(
        (node) => node.column.prop === first.prop,
      );
      if (colIndex >= 0) scrollToCell(first.rowIndex, colIndex);
    }
    return { valid: collected.length === 0, errors: collected };
  }

  function clearValidate() {
    errors.clear();
  }

  function clearRowValidate(row: T) {
    const prefix = `${context.getRowKeyStr(row)}:`;
    for (const key of [...errors.keys()]) {
      if (key.startsWith(prefix)) errors.delete(key);
    }
  }

  /** 行被结构性移除后调用：清掉该行残留的错误与版本号，避免长会话下无限增长 */
  function pruneRowKeys(removedRowKeys: Set<string>) {
    if (removedRowKeys.size === 0) return;
    for (const [key, error] of [...errors]) {
      if (removedRowKeys.has(error.rowKey)) errors.delete(key);
    }
    for (const rowKey of removedRowKeys) {
      versions.delete(rowKey);
    }
  }

  return {
    errors,
    getCellError,
    getErrors,
    validateCellByField,
    validateRow,
    validate,
    clearValidate,
    clearRowValidate,
    pruneRowKeys,
  };
}

export type ValidationApi<T extends RowData = RowData> = ReturnType<
  typeof createValidation<T>
>;

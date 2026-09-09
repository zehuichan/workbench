import type { ZodType } from 'zod';

import type { ComputedRef } from 'vue';

import type {
  GridyCellValidateContext,
  GridyCellValidator,
  GridyColumnRule,
  GridyDataColumn,
  GridyRecord,
  GridyValidateResult,
} from '../types';

import { computed, ref, toRaw, watch } from 'vue';

import { isFunction, isString } from 'es-toolkit';

import { errorKeyOf, getAtPath, walkTree } from '../tree';

export interface UseValidationOptions {
  /** 树形子节点字段；未开启树形为 `undefined` */
  childrenField: ComputedRef<string | undefined>;
  dataColumns: ComputedRef<GridyDataColumn[]>;
  /** 行身份解析（同 `useRowIdentity.keyOf`）：change 校验时 `v-model` 可能尚未回流，需按快照行取 key */
  keyOf: (row: GridyRecord, index: number) => string;
  /** 全部节点 key（含折叠子节点），删行后清理错误用 */
  nodeKeys: ComputedRef<string[]>;
  readonly: ComputedRef<boolean>;
  rows: ComputedRef<GridyRecord[]>;
}

/** 内部校验结果：多带首个错误行路径，供编排层滚动定位 */
export interface GridyInternalValidateResult extends GridyValidateResult {
  firstErrorPath?: number[];
}

type BuiltInRuleName = 'required' | 'selectRequired';

const REQUIRED_RULE_NAMES = new Set(['required', 'selectRequired']);

function labelOf(column: GridyDataColumn): string {
  return column.title ?? column.field;
}

/** 内置必填：空值判定与文案镜像 vben 表单适配器的 `required` / `selectRequired` */
const builtInRules: Record<BuiltInRuleName, GridyCellValidator> = {
  required: (value, { column }) => {
    if (value === undefined || value === null || value.length === 0) {
      return `请输入${labelOf(column)}`;
    }
    return true;
  },
  selectRequired: (value, { column }) => {
    if (value === undefined || value === null) {
      return `请选择${labelOf(column)}`;
    }
    return true;
  },
};

function isZodRule(rule: GridyColumnRule): rule is ZodType {
  return isFunction((rule as null | ZodType)?.safeParseAsync);
}

const warnedUnknownRules = new Set<string>();
function warnUnknownRule(name: string) {
  if (!import.meta.env?.DEV || warnedUnknownRules.has(name)) {
    return;
  }
  warnedUnknownRules.add(name);
  console.warn(
    `[Gridy] Rule "${name}" is not supported. Only "required" / "selectRequired" are built in; use a zod schema or a validator function instead.`,
  );
}

/**
 * 列级 rules 校验：错误按行 key 存储（排序 / 重建行对象后不漂移），
 * 每个单元格带 run id 守卫，异步校验只落最新一次结果。
 */
export function useValidation({
  childrenField,
  dataColumns,
  keyOf,
  nodeKeys,
  readonly,
  rows,
}: UseValidationOptions) {
  const errorMap = ref(new Map<string, Record<string, string>>());
  const runIds = new Map<string, number>();

  const ruledColumns = computed(() => dataColumns.value.filter((column) => !!column.rules));

  function normalizeRule(column: GridyDataColumn): GridyColumnRule | undefined {
    const rule = column.rules;
    return rule && !isString(rule) ? toRaw(rule) : rule;
  }

  function isRequiredColumn(column: GridyDataColumn): boolean {
    const rule = normalizeRule(column);
    if (!rule) {
      return false;
    }
    if (isString(rule)) {
      return REQUIRED_RULE_NAMES.has(rule);
    }
    if (isZodRule(rule)) {
      return !rule.isOptional();
    }
    return false;
  }

  async function resolveMessage(
    column: GridyDataColumn,
    value: unknown,
    ctx: GridyCellValidateContext,
  ): Promise<string | undefined> {
    const rule = normalizeRule(column);
    if (!rule) {
      return undefined;
    }
    if (isZodRule(rule)) {
      const result = await rule.safeParseAsync(value);
      return result.success ? undefined : result.error.issues[0]?.message;
    }
    const validator = isString(rule) ? builtInRules[rule as BuiltInRuleName] : rule;
    if (!validator) {
      warnUnknownRule(rule as string);
      return undefined;
    }
    const result = await validator(value, ctx);
    if (result === true) {
      return undefined;
    }
    return result === false ? `${labelOf(column)}校验未通过` : result || undefined;
  }

  function setError(key: string, field: string, message: string | undefined) {
    const rowErrors = errorMap.value.get(key);
    if (message) {
      errorMap.value.set(key, { ...rowErrors, [field]: message });
      return;
    }
    if (!rowErrors || !(field in rowErrors)) {
      return;
    }
    const { [field]: _removed, ...rest } = rowErrors;
    if (Object.keys(rest).length === 0) {
      errorMap.value.delete(key);
    } else {
      errorMap.value.set(key, rest);
    }
  }

  function nextRunId(key: string, field: string): number {
    const runKey = `${key}::${field}`;
    const runId = (runIds.get(runKey) ?? 0) + 1;
    runIds.set(runKey, runId);
    return runId;
  }

  function isLatestRun(key: string, field: string, runId: number): boolean {
    return runIds.get(`${key}::${field}`) === runId;
  }

  async function validateCellOf(
    column: GridyDataColumn,
    path: number[],
    list: GridyRecord[],
  ): Promise<string | undefined> {
    const row = getAtPath(list, path, childrenField.value);
    const index = path.at(-1);
    if (!row || index === undefined) {
      return undefined;
    }
    const key = keyOf(row, index);
    const runId = nextRunId(key, column.field);
    const message = await resolveMessage(column, row[column.field], {
      column,
      depth: path.length - 1,
      index,
      path,
      row,
      rows: list,
    });
    if (!isLatestRun(key, column.field, runId)) {
      return undefined;
    }
    setError(key, column.field, message);
    return message;
  }

  /** change 即时校验：传入刚提交的列表快照，不依赖 `v-model` 是否已回流 */
  function validateCell(path: number[], field: string, list = rows.value) {
    const column = ruledColumns.value.find((item) => item.field === field);
    if (!column) {
      return;
    }
    void validateCellOf(column, path, list);
  }

  async function validate(): Promise<GridyInternalValidateResult> {
    if (readonly.value) {
      return { errors: {}, valid: true };
    }
    const columns = ruledColumns.value;
    const list = rows.value;
    const paths: number[][] = [];
    walkTree(list, childrenField.value, (_, path) => paths.push(path));
    const results = await Promise.all(
      paths.flatMap((path) =>
        columns.map(async (column) => ({
          field: column.field,
          message: await validateCellOf(column, path, list),
          path,
        })),
      ),
    );
    // Promise.all 保序，results 天然按深度优先行序、行内按列序
    const errors: Record<string, string> = {};
    let firstErrorPath: number[] | undefined;
    for (const { field, message, path } of results) {
      if (message) {
        errors[errorKeyOf(path, field, childrenField.value)] = message;
        firstErrorPath ??= path;
      }
    }
    return { errors, firstErrorPath, valid: Object.keys(errors).length === 0 };
  }

  function clearValidation() {
    runIds.clear();
    errorMap.value.clear();
  }

  function errorOf(key: string, field: string): string | undefined {
    if (readonly.value) {
      return undefined;
    }
    return errorMap.value.get(key)?.[field];
  }

  watch(nodeKeys, (keys) => {
    if (errorMap.value.size === 0) {
      return;
    }
    const alive = new Set(keys);
    for (const key of [...errorMap.value.keys()]) {
      if (!alive.has(key)) {
        errorMap.value.delete(key);
      }
    }
  });

  return {
    clearValidation,
    errorOf,
    isRequiredColumn,
    validate,
    validateCell,
  };
}

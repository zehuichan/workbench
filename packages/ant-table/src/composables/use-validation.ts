import { computed, nextTick, ref, type Ref } from 'vue';

import Schema, { type RuleItem, type Rules } from 'async-validator';

import type { AntTableColumn, DependencyState, RowData } from '../types';
import { columnField } from '../utils';

export interface ValidationResult {
  valid: boolean;
  errors: Record<number, Record<string, string>>;
}

/** 扩展规则：声明跨字段依赖，触发联动重校验 */
export interface RuleItemWithDeps extends RuleItem {
  dependencies?: string[];
}

export interface UseValidationOptions {
  data: Ref<RowData[]>;
  /** 参与校验的列（通常为 navigableColumns，仅含字段的列） */
  columns: Ref<AntTableColumn[]>;
  tableRules: Ref<Record<string, RuleItem | RuleItem[]> | undefined>;
  tableEl: Ref<HTMLElement | null>;
  trigger?: Ref<'change' | 'blur' | 'manual'>;
  validateOnCellExit?: Ref<boolean>;
  /** 单元格联动：解析依赖状态（动态 rules/required） */
  resolveDeps?: (rowIndex: number, column: AntTableColumn) => DependencyState;
}

/** Map: 当字段 A 变化时，需要重新校验字段 [B, C, ...] */
function buildDependencyGraph(
  columns: AntTableColumn[],
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const column of columns) {
    const field = columnField(column);
    if (!field) continue;
    const rules = Array.isArray(column.rules)
      ? column.rules
      : column.rules
        ? [column.rules]
        : [];
    for (const r of rules) {
      const rule = r as RuleItemWithDeps;
      const deps = rule.dependencies;
      if (deps?.length) {
        for (const dep of deps) {
          if (!graph.has(dep)) graph.set(dep, new Set());
          graph.get(dep)!.add(field);
        }
      }
    }
  }
  return graph;
}

export function useValidation(options: UseValidationOptions) {
  const {
    data,
    columns,
    tableRules,
    tableEl,
    trigger: _trigger = ref('manual'),
    validateOnCellExit: _validateOnCellExit = ref(false),
    resolveDeps,
  } = options;

  const errors = ref(new Map<string, string>());
  const dependencyGraph = computed(() => buildDependencyGraph(columns.value));

  function mergeRules(
    field: string,
    column: AntTableColumn,
    rowIndex?: number,
  ): RuleItem[] {
    const tableLevel = tableRules.value?.[field];
    const columnLevel = column.rules;

    const rules: RuleItem[] = [];

    if (tableLevel) {
      rules.push(...(Array.isArray(tableLevel) ? tableLevel : [tableLevel]));
    }
    if (columnLevel) {
      rules.push(...(Array.isArray(columnLevel) ? columnLevel : [columnLevel]));
    }

    if (column.required) {
      rules.push({ required: true });
    }

    if (rowIndex != null && resolveDeps && column.dependencies) {
      const depState = resolveDeps(rowIndex, column);
      if (depState.rules) {
        rules.push(
          ...(Array.isArray(depState.rules)
            ? depState.rules
            : [depState.rules]),
        );
      }
      if (depState.required) {
        const label = typeof column.title === 'string' ? column.title : field;
        rules.push({ required: true, message: `${label} 必填` });
      }
    }

    return rules;
  }

  async function validateRow(
    rowIndex: number,
  ): Promise<Record<string, string>> {
    const row = data.value[rowIndex];
    if (!row) return {};

    const rowErrors: Record<string, string> = {};
    const rules: Rules = {};

    for (const column of columns.value) {
      const field = columnField(column);
      if (!field) continue;
      const fieldRules = mergeRules(field, column, rowIndex);
      if (fieldRules.length > 0) {
        rules[field] = fieldRules;
      }
    }

    if (Object.keys(rules).length === 0) return {};

    const validator = new Schema(rules);

    try {
      await validator.validate(row, { firstFields: true });
    } catch (e: unknown) {
      const err = e as { errors?: Array<{ field: string; message: string }> };
      const validationErrors = err?.errors;
      if (validationErrors) {
        for (const item of validationErrors) {
          rowErrors[item.field] = item.message;
        }
      }
    }

    return rowErrors;
  }

  function normalizeRowIndices(input: boolean | number | number[]): number[] {
    if (input === true) return data.value.map((_, i) => i);
    if (input === false) return [];
    if (typeof input === 'number') return [input];
    return input;
  }

  async function validate(
    rows: boolean | number | number[] = true,
  ): Promise<ValidationResult> {
    const rowIndices = normalizeRowIndices(rows);
    const allErrors: Record<number, Record<string, string>> = {};
    const nextErrorMap = new Map(errors.value);

    for (const rowIndex of rowIndices) {
      for (const column of columns.value) {
        const field = columnField(column);
        if (field) nextErrorMap.delete(`${rowIndex}:${field}`);
      }
    }

    for (const rowIndex of rowIndices) {
      const rowErrors = await validateRow(rowIndex);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[rowIndex] = rowErrors;
        for (const [field, message] of Object.entries(rowErrors)) {
          nextErrorMap.set(`${rowIndex}:${field}`, message);
        }
      }
    }

    errors.value = nextErrorMap;
    return {
      valid: Object.keys(allErrors).length === 0,
      errors: allErrors,
    };
  }

  async function validateField(
    rowIndex: number,
    field: string,
  ): Promise<boolean> {
    const row = data.value[rowIndex];
    if (!row) return true;

    const column = columns.value.find((c) => columnField(c) === field);
    if (!column) return true;

    const fieldRules = mergeRules(field, column, rowIndex);
    if (fieldRules.length === 0) return true;

    const validator = new Schema({ [field]: fieldRules });
    const key = `${rowIndex}:${field}`;
    const nextErrors = new Map(errors.value);

    try {
      await validator.validate(row, { firstFields: true });
      nextErrors.delete(key);
      errors.value = nextErrors;
      return true;
    } catch (e: unknown) {
      const err = e as { errors?: Array<{ message: string }> };
      const message = err?.errors?.[0]?.message ?? 'Invalid';
      nextErrors.set(key, message);
      errors.value = nextErrors;
      return false;
    }
  }

  /** 校验变更字段 + 所有依赖它的字段 */
  async function validateFieldsAffectedByChange(
    rowIndex: number,
    changedField: string,
  ): Promise<void> {
    const toValidate = new Set<string>([changedField]);
    const dependents = dependencyGraph.value.get(changedField);
    if (dependents) {
      for (const f of dependents) toValidate.add(f);
    }
    for (const field of toValidate) {
      await validateField(rowIndex, field);
    }
  }

  function clearValidation(rowIndex?: number, field?: string): void {
    if (rowIndex === undefined) {
      errors.value = new Map();
      return;
    }

    const nextErrors = new Map(errors.value);

    if (field) {
      nextErrors.delete(`${rowIndex}:${field}`);
    } else {
      for (const key of [...nextErrors.keys()]) {
        if (key.startsWith(`${rowIndex}:`)) nextErrors.delete(key);
      }
    }

    errors.value = nextErrors;
  }

  function scrollToFirstError(): void {
    const el = tableEl.value;
    if (!el || errors.value.size === 0) return;

    let minRow = Infinity;
    for (const key of errors.value.keys()) {
      const [rowStr] = key.split(':');
      const rowIndex = Number(rowStr);
      if (!Number.isNaN(rowIndex) && rowIndex < minRow) minRow = rowIndex;
    }
    if (minRow === Infinity) return;

    nextTick(() => {
      const rows = el.querySelectorAll('.ant-table-tbody tr.ant-table-row');
      const rowEl = rows[minRow] as HTMLElement | undefined;
      rowEl?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  function getErrorForCell(rowIndex: number, field: string): string | undefined {
    return errors.value.get(`${rowIndex}:${field}`);
  }

  return {
    errors,
    validate,
    validateField,
    validateFieldsAffectedByChange,
    clearValidation,
    scrollToFirstError,
    getErrorForCell,
  };
}

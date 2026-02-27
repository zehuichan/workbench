import { computed, nextTick, ref, type Ref } from 'vue';

import Schema, { type Rules, type RuleItem } from 'async-validator';

import type { ReTableNextColumn, RowData } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<number, Record<string, string>>;
}

/** Extended rule with dependencies for cross-field validation */
export interface RuleItemWithDeps extends RuleItem {
  dependencies?: string[];
}

export interface UseValidationOptions {
  data: Ref<RowData[]>;
  /** 参与校验的列（通常为 navigableColumns，仅含 prop 的列） */
  columns: Ref<ReTableNextColumn[]>;
  tableRules: Ref<Record<string, RuleItem | RuleItem[]> | undefined>;
  tableEl: Ref<HTMLElement | null>;
  trigger?: Ref<'change' | 'blur' | 'manual'>;
  validateOnCellExit?: Ref<boolean>;
}

/** Map: when prop A changes, re-validate props [B, C, ...] */
function buildDependencyGraph(
  columns: ReTableNextColumn[],
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const column of columns) {
    if (!column.prop) continue;
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
          graph.get(dep)!.add(column.prop);
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
  } = options;

  const errors = ref(new Map<string, string>());
  const dependencyGraph = computed(() => buildDependencyGraph(columns.value));

  function mergeRules(
    prop: string,
    column: ReTableNextColumn,
  ): RuleItem[] {
    const tableLevel = tableRules.value?.[prop];
    const columnLevel = column.rules;

    const rules: RuleItem[] = [];

    if (tableLevel) {
      rules.push(...(Array.isArray(tableLevel) ? tableLevel : [tableLevel]));
    }
    if (columnLevel) {
      rules.push(
        ...(Array.isArray(columnLevel) ? columnLevel : [columnLevel]),
      );
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
      if (!column.prop) continue;
      const fieldRules = mergeRules(column.prop, column);
      if (fieldRules.length > 0) {
        rules[column.prop] = fieldRules;
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

  function normalizeRowIndices(
    input: boolean | number | number[],
  ): number[] {
    if (input === true) {
      return data.value.map((_, i) => i);
    }
    if (input === false) {
      return [];
    }
    if (typeof input === 'number') {
      return [input];
    }
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
        if (column.prop) {
          nextErrorMap.delete(`${rowIndex}-${column.prop}`);
        }
      }
    }

    for (const rowIndex of rowIndices) {
      const rowErrors = await validateRow(rowIndex);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[rowIndex] = rowErrors;
        for (const [prop, message] of Object.entries(rowErrors)) {
          nextErrorMap.set(`${rowIndex}-${prop}`, message);
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
    prop: string,
  ): Promise<boolean> {
    const row = data.value[rowIndex];
    if (!row) return true;

    const column = columns.value.find((c) => c.prop === prop);
    if (!column) return true;

    const fieldRules = mergeRules(prop, column);
    if (fieldRules.length === 0) return true;

    const validator = new Schema({ [prop]: fieldRules });
    const key = `${rowIndex}-${prop}`;
    const nextErrors = new Map(errors.value);

    try {
      await validator.validate(row, { firstFields: true });
      nextErrors.delete(key);
      errors.value = nextErrors;
      return true;
    } catch (e: unknown) {
      const err = e as { errors?: Array<{ message: string }> };
      const validationErrors = err?.errors;
      const message = validationErrors?.[0]?.message ?? 'Invalid';
      nextErrors.set(key, message);
      errors.value = nextErrors;
      return false;
    }
  }

  /** Validate changed prop + all props that depend on it */
  async function validateFieldsAffectedByChange(
    rowIndex: number,
    changedProp: string,
  ): Promise<void> {
    const toValidate = new Set<string>([changedProp]);
    const dependents = dependencyGraph.value.get(changedProp);
    if (dependents) {
      for (const p of dependents) toValidate.add(p);
    }
    for (const prop of toValidate) {
      await validateField(rowIndex, prop);
    }
  }

  function clearValidation(rowIndex?: number, prop?: string): void {
    if (rowIndex === undefined) {
      errors.value = new Map();
      return;
    }

    const nextErrors = new Map(errors.value);

    if (prop) {
      nextErrors.delete(`${rowIndex}-${prop}`);
    } else {
      for (const key of [...nextErrors.keys()]) {
        if (key.startsWith(`${rowIndex}-`)) {
          nextErrors.delete(key);
        }
      }
    }

    errors.value = nextErrors;
  }

  function scrollToFirstError(): void {
    const el = tableEl.value;
    if (!el || errors.value.size === 0) return;

    let minRow = Infinity;

    for (const key of errors.value.keys()) {
      const [rowStr] = key.split('-');
      const rowIndex = Number(rowStr);
      if (!Number.isNaN(rowIndex) && rowIndex < minRow) {
        minRow = rowIndex;
      }
    }

    if (minRow === Infinity) return;

    nextTick(() => {
      const tableBody = (el as HTMLElement).querySelector?.('.el-table__body-wrapper');
      const rowEl = tableBody?.querySelector?.(`tbody tr:nth-child(${minRow + 1})`);
      rowEl?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  function getErrorForCell(rowIndex: number, prop: string): string | undefined {
    return errors.value.get(`${rowIndex}-${prop}`);
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

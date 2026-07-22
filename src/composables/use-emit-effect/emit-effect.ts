import { cloneDeep, isEqual } from 'es-toolkit';

export type FieldSource = 'inherited' | 'manual';
export type EmitEffectPolicy = 'force' | 'inherit' | 'recalculate';

export interface DocumentLine {
  id: string;
  fieldSources: Record<string, FieldSource>;
  [field: string]: unknown;
}

export interface DocumentSummary {
  [field: string]: number;
}

export interface DocumentDraft<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  header: H;
  lines: L[];
  summary: DocumentSummary;
  dirty: boolean;
}

export interface HeaderLineEffect {
  patch?: Record<string, unknown>;
  sourcePatch?: Record<string, FieldSource>;
  preservedFields?: string[];
}

export interface HeaderEmitRule {
  policy: EmitEffectPolicy;
  requiresConfirmation?: boolean;
  apply: (
    line: DocumentLine,
    nextHeader: Record<string, unknown>,
    previousHeader: Record<string, unknown>,
  ) => HeaderLineEffect;
}

export interface EmitEffectRules<
  H extends Record<string, unknown> = Record<string, unknown>,
  L extends DocumentLine = DocumentLine,
> {
  /** Detail props that track inherited/manual sources. */
  sourceFields: string[];
  headerRules: Record<string, HeaderEmitRule>;
  createLine: (draft: DocumentDraft<H, L>, id: string) => L;
  recalculateLine: (line: L, header: H) => L;
  summarize: (lines: L[], header: H) => DocumentSummary;
}

export interface EmitEffectConfirmation {
  affectedCount: number;
  preservedCount: number;
  fields: string[];
  message: string;
}

export interface EmitEffectMutation {
  nextDraft: DocumentDraft;
  affectedLineIds: string[];
  preservedLineIds: string[];
  confirmation?: EmitEffectConfirmation;
}

export interface DetailChangeCommand {
  rowId: string;
  prop: string;
  value: unknown;
  oldValue: unknown;
}

function changedFields(before: DocumentLine, after: DocumentLine): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (field) => field !== 'fieldSources' && !isEqual(before[field], after[field]),
  );
}

function finalize<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  draft: DocumentDraft<H, L>,
  dirty: boolean,
): DocumentDraft<H, L> {
  const lines = draft.lines.map((line) => rules.recalculateLine(cloneDeep(line), draft.header));
  return {
    ...draft,
    lines,
    summary: rules.summarize(lines, draft.header),
    dirty,
  };
}

export function normalizeDraft<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  source: DocumentDraft<H, L>,
): DocumentDraft<H, L> {
  return finalize(rules, cloneDeep(source), source.dirty);
}

export function buildHeaderMutation<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  source: DocumentDraft<H, L>,
  field: string,
  value: unknown,
): EmitEffectMutation {
  const rule = rules.headerRules[field];
  if (!rule) throw new Error(`表头字段 "${field}" 未配置副作用规则`);

  const working = cloneDeep(source);
  const previousHeader = cloneDeep(working.header) as Record<string, unknown>;
  (working.header as Record<string, unknown>)[field] = value;
  const affectedLineIds: string[] = [];
  const preservedLineIds: string[] = [];
  const affectedFields = new Set<string>();

  working.lines = working.lines.map((line) => {
    const before = cloneDeep(line);
    const effect = rule.apply(line, working.header as Record<string, unknown>, previousHeader);
    Object.assign(line, effect.patch);
    Object.assign(line.fieldSources, effect.sourcePatch);
    const recalculated = rules.recalculateLine(line, working.header);
    const lineChangedFields = changedFields(before, recalculated);
    if (lineChangedFields.length > 0) {
      affectedLineIds.push(line.id);
      lineChangedFields.forEach((changedField) => affectedFields.add(changedField));
    }
    if (effect.preservedFields?.length) preservedLineIds.push(line.id);
    return recalculated;
  });

  working.summary = rules.summarize(working.lines, working.header);
  working.dirty = true;

  const mutation: EmitEffectMutation = {
    nextDraft: working,
    affectedLineIds,
    preservedLineIds,
  };

  if (rule.requiresConfirmation && affectedLineIds.length > 0) {
    const fields = [...affectedFields];
    mutation.confirmation = {
      affectedCount: affectedLineIds.length,
      preservedCount: preservedLineIds.length,
      fields,
      message: `将更新 ${affectedLineIds.length} 行字段（${fields.join('、')}），保留 ${preservedLineIds.length} 行人工值。`,
    };
  }

  return mutation;
}

export function applyDetailMutation<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  source: DocumentDraft<H, L>,
  command: DetailChangeCommand,
): EmitEffectMutation {
  const working = cloneDeep(source);
  const line = working.lines.find((item) => item.id === command.rowId);
  if (!line) throw new Error(`明细行 "${command.rowId}" 不存在`);

  (line as Record<string, unknown>)[command.prop] = command.value;
  if (rules.sourceFields.includes(command.prop)) {
    line.fieldSources[command.prop] = 'manual';
  }

  const index = working.lines.indexOf(line);
  working.lines[index] = rules.recalculateLine(line, working.header);
  working.summary = rules.summarize(working.lines, working.header);
  working.dirty = true;

  return {
    nextDraft: working,
    affectedLineIds: [command.rowId],
    preservedLineIds: [],
  };
}

export function addLineMutation<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  source: DocumentDraft<H, L>,
  id: string,
): EmitEffectMutation {
  const working = cloneDeep(source);
  working.lines.push(rules.createLine(working, id));
  const nextDraft = finalize(rules, working, true);

  return {
    nextDraft,
    affectedLineIds: [id],
    preservedLineIds: [],
  };
}

export function removeLineMutation<H extends Record<string, unknown>, L extends DocumentLine>(
  rules: EmitEffectRules<H, L>,
  source: DocumentDraft<H, L>,
  id: string,
): EmitEffectMutation {
  const working = cloneDeep(source);
  working.lines = working.lines.filter((line) => line.id !== id);
  const nextDraft = finalize(rules, working, true);

  return {
    nextDraft,
    affectedLineIds: [id],
    preservedLineIds: [],
  };
}

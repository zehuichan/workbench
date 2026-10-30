import type { MaybeRef, Ref } from 'vue';

import type {
  EmitEffectConfirmation,
  EmitEffectRules,
  FieldRef,
  HeaderTrigger,
  MaybePromise,
  PropagateOptions,
  PropagateResult,
} from './emit-effect';

import { reactive, readonly, shallowRef, toRaw, toValue, watch } from 'vue';

import { tryOnScopeDispose } from '@vueuse/core';
import { cloneDeep, isEqual } from 'es-toolkit';

import {
  createEmitEngine,
  detectEntities,
  entityKey,
  headerKey,
  refKey,
  rowFieldKey,
} from './emit-effect';

export interface UseEmitEffectOptions {
  /** Asked once when a header change makes `confirm` rules rewrite values; `false` rolls the header field back. */
  confirm?: (confirmation: EmitEffectConfirmation) => MaybePromise<boolean>;
  /** Value equality used to detect edits; defaults to numeric-aware deep equality. */
  equals?: (a: unknown, b: unknown) => boolean;
  /** Run `normalize()` right after attaching (new documents / demos). */
  immediate?: boolean;
  /**
   * Receives propagation failures raised by form edits; defaults to `console.error`.
   * A failed propagation writes nothing, and its edits are retried with the next propagation.
   */
  onError?: (error: unknown) => void;
}

/** Header field name, or `[row, field]` for a row field. */
export type ManualTarget<F> = [row: object, field: string] | keyof F;

export interface UseEmitEffectReturn<F extends object> {
  /**
   * Runs `load` with linkage paused, then rebuilds the baseline without rewriting any value.
   * Propagations queued or running when it starts write nothing.
   */
  hydrate: (load: () => MaybePromise<void>) => Promise<void>;
  /** Whether the field holds a value the user typed over its default rule. */
  isManual: (target: ManualTarget<F>) => boolean;
  /** Recomputes every `compute` field and fills empty `default` fields. */
  normalize: () => Promise<void>;
  /** Whether a propagation is running or queued. */
  pending: Readonly<Ref<boolean>>;
  /**
   * Drops the manual mark and re-derives the field from its rule.
   * Rejects when the row is not in the form or the field has no rule.
   */
  restore: (target: ManualTarget<F>) => Promise<void>;
}

interface EntityBaseline {
  rows: object[];
  values: Map<object, Record<string, unknown>>;
}

interface Baseline {
  entities: Map<string, EntityBaseline>;
  header: Map<string, unknown>;
  root: object;
}

interface Job {
  all?: boolean;
  dirty: string[];
  dryRun?: boolean;
  force?: FieldRef[];
  /** Baseline generation the job was queued against; stale jobs are dropped. */
  generation: number;
  headerTrigger?: HeaderTrigger;
  /** Manual marks added by this edit; undone when the confirmation is rejected. */
  marked: FieldRef[];
  triggers: FieldRef[];
}

interface PendingWork {
  dirty: string[];
  force: FieldRef[];
  triggers: FieldRef[];
}

function refLabel(ref: FieldRef): string {
  return ref.entity === undefined ? ref.field : `${ref.entity}.${ref.field}`;
}

function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return !Number.isNaN(value);
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(Number(value))
  );
}

/** `1023` and `"1023"` are the same edit; el-input rewrites numbers as strings. */
export function defaultEquals(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (isNumeric(a) && isNumeric(b)) return Number(a) === Number(b);
  return isEqual(a, b);
}

/**
 * Attaches field linkage rules to an existing form.
 *
 * The form stays the single source of truth: bind it with `v-model` / `:data`,
 * mutate it with plain assignments, `push` and `splice`. Replacing `form.value`
 * counts as loading a document and rewrites nothing.
 *
 * @param form Reactive form (a `ref` or `reactive` object) shaped like the DTO.
 * @param rules Rule table shaped like the form.
 *
 * @example
 * const form = ref({ ...defaultForm })
 * const { normalize } = useEmitEffect(form, orderRules, { confirm })
 * const getDetail = async () => { form.value = (await getOrder(id)).data }
 */
export function useEmitEffect<F extends object>(
  form: MaybeRef<F>,
  rules: EmitEffectRules<F>,
  options: UseEmitEffectOptions = {},
): UseEmitEffectReturn<F> {
  const {
    confirm,
    equals = defaultEquals,
    immediate = false,
    onError = (error: unknown) => console.error(error),
  } = options;

  const engine = createEmitEngine(rules);
  const pending = shallowRef(false);

  const rowIds = new WeakMap<object, string>();
  let rowSeq = 0;
  const idOf = (row: object): string => {
    let id = rowIds.get(row);
    if (!id) {
      id = `r${++rowSeq}`;
      rowIds.set(row, id);
    }
    return id;
  };

  const manualHeader = new Set<string>();
  let manualRows = new WeakMap<object, Set<string>>();
  // Bumped on every mark change so templates calling `isManual` re-render without reactive collections.
  const manualVersion = shallowRef(0);
  const touchManual = (): void => {
    manualVersion.value += 1;
  };

  const getReactiveRoot = (): Record<string, unknown> => {
    const root: object = toValue(form);
    return root as Record<string, unknown>;
  };
  const getRoot = (): Record<string, unknown> => toRaw(getReactiveRoot());

  let baseline: Baseline = { root: {}, header: new Map(), entities: new Map() };
  let generation = 0;

  function rawRows(root: Record<string, unknown>, entity: string): object[] {
    const list = root[entity];
    return Array.isArray(list) ? list.map((row) => toRaw(row) as object) : [];
  }

  function snapshotRow(row: object): Record<string, unknown> {
    return cloneDeep(row) as Record<string, unknown>;
  }

  function buildBaseline(root: Record<string, unknown>): Baseline {
    const entities = detectEntities(root, rules);
    const header = new Map<string, unknown>();
    for (const [field, value] of Object.entries(root)) {
      if (!entities.has(field)) header.set(field, cloneDeep(value));
    }
    const entityBaselines = new Map<string, EntityBaseline>();
    for (const entity of entities) {
      const rows = rawRows(root, entity);
      const values = new Map<object, Record<string, unknown>>();
      for (const row of rows) {
        idOf(row);
        values.set(row, snapshotRow(row));
      }
      entityBaselines.set(entity, { rows, values });
    }
    return { root, header, entities: entityBaselines };
  }

  // ---- manual marks ----

  function findEntity(
    root: Record<string, unknown>,
    row: object,
  ): string | undefined {
    for (const entity of detectEntities(root, rules)) {
      if (rawRows(root, entity).includes(row)) return entity;
    }
    return undefined;
  }

  function toRef(target: ManualTarget<F>): { ref: FieldRef; row?: object } {
    if (!Array.isArray(target)) return { ref: { field: String(target) } };
    const [row, field] = target;
    const raw = toRaw(row);
    const entity = findEntity(getRoot(), raw);
    if (entity === undefined) {
      throw new Error(
        `[useEmitEffect] 行不在表单的任何明细表中，无法定位字段 ${field}。`,
      );
    }
    return { ref: { entity, rowId: idOf(raw), field }, row: raw };
  }

  function rowOf(
    ref: FieldRef,
    rowsById: Map<string, object>,
  ): object | undefined {
    return ref.rowId === undefined ? undefined : rowsById.get(ref.rowId);
  }

  function markManual(ref: FieldRef, rowsById: Map<string, object>): void {
    if (ref.entity === undefined) {
      manualHeader.add(ref.field);
      touchManual();
      return;
    }
    const row = rowOf(ref, rowsById);
    if (!row) return;
    let fields = manualRows.get(row);
    if (!fields) {
      fields = new Set();
      manualRows.set(row, fields);
    }
    fields.add(ref.field);
    touchManual();
  }

  function unmarkManual(ref: FieldRef, rowsById: Map<string, object>): void {
    if (ref.entity === undefined) {
      manualHeader.delete(ref.field);
    } else {
      const row = rowOf(ref, rowsById);
      if (row) manualRows.get(row)?.delete(ref.field);
    }
    touchManual();
  }

  function collectRows(root: Record<string, unknown>): {
    byId: Map<string, object>;
    ids: Record<string, string[]>;
  } {
    const ids: Record<string, string[]> = {};
    const byId = new Map<string, object>();
    for (const entity of detectEntities(root, rules)) {
      ids[entity] = rawRows(root, entity).map((row) => {
        const id = idOf(row);
        byId.set(id, row);
        return id;
      });
    }
    return { ids, byId };
  }

  // ---- change detection ----

  let applying = 0;

  interface Diff {
    dirty: Set<string>;
    headerChanges: HeaderTrigger[];
    structural: boolean;
    triggers: FieldRef[];
  }

  function diff(root: Record<string, unknown>): Diff {
    const entities = detectEntities(root, rules);
    const dirty = new Set<string>();
    const triggers: FieldRef[] = [];
    const headerChanges: HeaderTrigger[] = [];
    let structural = false;

    const headerFields = new Set([
      ...baseline.header.keys(),
      ...Object.keys(root),
    ]);
    for (const field of headerFields) {
      if (entities.has(field)) continue;
      const previous = baseline.header.get(field);
      const current = root[field];
      if (equals(previous, current)) continue;
      dirty.add(headerKey(field));
      triggers.push({ field });
      headerChanges.push({ field, oldValue: previous, newValue: current });
    }

    for (const entity of entities) {
      const previous = baseline.entities.get(entity);
      const rows = rawRows(root, entity);
      if (
        !previous ||
        previous.rows.length !== rows.length ||
        previous.rows.some((row, index) => row !== rows[index])
      ) {
        dirty.add(entityKey(entity));
        structural = true;
      }
      for (const row of rows) {
        const snapshot = previous?.values.get(row);
        if (!snapshot) continue;
        const rowId = idOf(row);
        const fields = new Set([...Object.keys(snapshot), ...Object.keys(row)]);
        for (const field of fields) {
          if (equals(snapshot[field], (row as Record<string, unknown>)[field]))
            continue;
          dirty.add(rowFieldKey(entity, rowId, field));
          triggers.push({ entity, rowId, field });
        }
      }
    }

    return { dirty, triggers, headerChanges, structural };
  }

  // ---- queue ----

  let tail: Promise<void> = Promise.resolve();
  let depth = 0;
  /** Work of a failed propagation; the next job of the same generation runs it again. */
  let unsettled: PendingWork | undefined;
  /** Keys of fields the user edited while the running job propagated; its write-back leaves them alone. */
  let editedDuringRun: Set<string> | undefined;

  function enqueue(job: Omit<Job, 'generation'>): Promise<void> {
    depth += 1;
    pending.value = true;
    const queued: Job = { ...job, generation };
    const run = tail.then(() => runJob(queued));
    tail = run.catch(() => undefined);
    return run.finally(() => {
      depth -= 1;
      if (depth === 0) pending.value = false;
    });
  }

  async function runJob(job: Job): Promise<void> {
    // The form was replaced after this edit was queued; the hydrate that follows owns the new baseline.
    if (job.generation !== generation) return;
    const work: PendingWork = {
      dirty: [...(unsettled?.dirty ?? []), ...job.dirty],
      force: [...(unsettled?.force ?? []), ...(job.force ?? [])],
      triggers: [...(unsettled?.triggers ?? []), ...job.triggers],
    };
    unsettled = undefined;
    const root = getRoot();
    const { ids, byId } = collectRows(root);
    const request: PropagateOptions = {
      form: root,
      rowIds: ids,
      manual: {
        has: (ref) => {
          if (ref.entity === undefined) return manualHeader.has(ref.field);
          const row = rowOf(ref, byId);
          return row ? (manualRows.get(row)?.has(ref.field) ?? false) : false;
        },
      },
      ...work,
      headerTrigger: job.headerTrigger,
      all: job.all,
      dryRun: job.dryRun,
    };
    const edited = new Set<string>();
    editedDuringRun = edited;
    try {
      await settleJob(job, request, work, byId, edited);
    } finally {
      editedDuringRun = undefined;
    }
  }

  async function settleJob(
    job: Job,
    request: PropagateOptions,
    work: PendingWork,
    byId: Map<string, object>,
    edited: Set<string>,
  ): Promise<void> {
    let result: PropagateResult;
    try {
      result = await engine.propagate(request);
    } catch (error) {
      if (job.generation === generation) unsettled = work;
      throw error;
    }
    // A load replaced the form while the rules ran; its rebase owns the new document.
    if (job.generation !== generation) return;

    if (result.confirmation && confirm) {
      const accepted = await confirm(result.confirmation);
      if (job.generation !== generation) return;
      if (!accepted) {
        rollback(job, byId, edited);
        return;
      }
    }
    apply(result, byId, edited);
  }

  function writeHeader(field: string, value: unknown): void {
    getReactiveRoot()[field] = value;
    baseline.header.set(field, cloneDeep(value));
  }

  function writeRow(
    entity: string,
    row: object,
    field: string,
    value: unknown,
  ): void {
    (reactive(row) as Record<string, unknown>)[field] = value;
    const snapshot = baseline.entities.get(entity)?.values.get(row);
    if (snapshot) snapshot[field] = cloneDeep(value);
  }

  function apply(
    result: PropagateResult,
    byId: Map<string, object>,
    edited: Set<string>,
  ): void {
    applying += 1;
    try {
      for (const change of result.changes) {
        if (edited.has(refKey(change))) continue;
        if (change.entity === undefined) {
          writeHeader(change.field, change.value);
          continue;
        }
        const row = rowOf(change, byId);
        if (row) writeRow(change.entity, row, change.field, change.value);
      }
      for (const ref of result.clearedManual) {
        if (!edited.has(refKey(ref))) unmarkManual(ref, byId);
      }
    } finally {
      applying -= 1;
    }
  }

  function rollback(
    job: Job,
    byId: Map<string, object>,
    edited: Set<string>,
  ): void {
    applying += 1;
    try {
      const trigger = job.headerTrigger;
      if (trigger && !edited.has(headerKey(trigger.field)))
        writeHeader(trigger.field, trigger.oldValue);
      for (const ref of job.marked) unmarkManual(ref, byId);
    } finally {
      applying -= 1;
    }
  }

  // ---- hydrate ----

  function rebase(): Promise<void> {
    const root = getRoot();
    generation += 1;
    unsettled = undefined;
    engine.reset();
    manualHeader.clear();
    manualRows = new WeakMap();
    touchManual();
    baseline = buildBaseline(root);
    return enqueue({
      dirty: [],
      triggers: [],
      marked: [],
      all: true,
      dryRun: true,
    });
  }

  function onFormChange(): void {
    if (applying > 0) return;
    const root = getRoot();
    if (root !== baseline.root) {
      void rebase().catch(onError);
      return;
    }

    const changes = diff(root);
    if (changes.dirty.size === 0) return;

    const { byId } = collectRows(root);
    const marked: FieldRef[] = [];
    for (const ref of changes.triggers) {
      editedDuringRun?.add(refKey(ref));
      const rule = engine.ruleOf(ref);
      if (!rule) continue;
      if (rule.kind === 'default') {
        markManual(ref, byId);
        marked.push(ref);
      } else if (import.meta.env.DEV) {
        console.warn(
          `[useEmitEffect] 字段 ${refLabel(ref)} 是 compute 规则，人工输入会被重算覆盖。`,
        );
      }
    }
    baseline = buildBaseline(root);

    const headerTrigger =
      changes.headerChanges.length === 1 &&
      changes.triggers.length === 1 &&
      !changes.structural
        ? changes.headerChanges[0]
        : undefined;

    void enqueue({
      dirty: [...changes.dirty],
      triggers: changes.triggers,
      headerTrigger,
      marked,
    }).catch(onError);
  }

  const stop = watch(() => toValue(form), onFormChange, {
    deep: true,
    flush: 'sync',
  });
  tryOnScopeDispose(stop);

  // ---- public API ----

  const initial = rebase();
  if (immediate) {
    void initial.then(() => normalize()).catch(onError);
  } else {
    void initial.catch(onError);
  }

  function isManual(target: ManualTarget<F>): boolean {
    void manualVersion.value;
    if (Array.isArray(target)) {
      return manualRows.get(toRaw(target[0]))?.has(target[1]) ?? false;
    }
    return manualHeader.has(String(target));
  }

  async function restore(target: ManualTarget<F>): Promise<void> {
    const { ref, row } = toRef(target);
    if (!engine.ruleOf(ref)) {
      throw new Error(
        `[useEmitEffect] 字段 ${refLabel(ref)} 没有规则，无法恢复。`,
      );
    }
    if (row) {
      manualRows.get(row)?.delete(ref.field);
    } else {
      manualHeader.delete(ref.field);
    }
    touchManual();
    await enqueue({ dirty: [], triggers: [], marked: [], force: [ref] });
  }

  function normalize(): Promise<void> {
    return enqueue({ dirty: [], triggers: [], marked: [], all: true });
  }

  async function hydrate(load: () => MaybePromise<void>): Promise<void> {
    // Drops queued and in-flight propagations so none writes into the document being loaded.
    generation += 1;
    applying += 1;
    try {
      await load();
    } finally {
      applying -= 1;
    }
    await rebase();
  }

  return {
    pending: readonly(pending),
    isManual,
    restore,
    normalize,
    hydrate,
  };
}

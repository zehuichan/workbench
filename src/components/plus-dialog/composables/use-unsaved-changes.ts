import type { MaybeRefOrGetter, Ref } from 'vue';

import { computed, shallowRef, toValue } from 'vue';

import { cloneDeep, isEqual } from 'es-toolkit';

export interface UseUnsavedChangesOptions {
  /**
   * When false, `isDirty` is always false and restore / reset stay no-ops for dirty checks.
   * View mode sets this false so the guard never fires.
   */
  enabled?: MaybeRefOrGetter<boolean>;
}

export interface UseUnsavedChangesReturn<
  T extends object = Record<string, unknown>,
> {
  /** True when enabled and form differs from the baseline captured by `reset`. */
  isDirty: Readonly<Ref<boolean>>;
  /**
   * Capture a clean baseline. Pass `snapshot` when the form model may still
   * reflect a stale prop (e.g. right after assigning through `defineModel`).
   */
  reset: (snapshot?: T) => void;
  /** Replace form with the baseline. No-op when no baseline exists. */
  restore: () => void;
}

/**
 * Tracks whether a form diverges from a baseline snapshot.
 *
 * Baseline is taken explicitly via `reset` after the form finishes loading.
 * View mode should pass `enabled: false` so no dirty state is recorded.
 *
 * @param form Mutable form state compared deeply against the baseline.
 *
 * @example
 * const { isDirty, reset, restore } = useUnsavedChanges(form, {
 *   enabled: () => mode.value === 'edit' || mode.value === 'create',
 * })
 *
 * async function loadRecord(index: number) {
 *   form.value = await api.get(index)
 *   reset()
 * }
 */
export function useUnsavedChanges<T extends object>(
  form: Ref<T>,
  options: UseUnsavedChangesOptions = {},
): UseUnsavedChangesReturn<T> {
  const { enabled = true } = options;
  const baseline = shallowRef<null | T>(null);

  const isDirty = computed(() => {
    if (!toValue(enabled)) return false;
    if (baseline.value === null) return false;
    return !isEqual(form.value, baseline.value);
  });

  const reset = (snapshot?: T): void => {
    baseline.value = cloneDeep(snapshot ?? form.value);
  };

  const restore = (): void => {
    if (baseline.value === null) return;
    form.value = cloneDeep(baseline.value);
  };

  return {
    isDirty,
    reset,
    restore,
  };
}

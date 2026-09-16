import { readonly, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import {
  defaultWindow,
  tryOnScopeDispose,
  useTimeoutFn,
  type ConfigurableWindow,
} from '@vueuse/core';
import { isPlainObject, isString, omit } from 'es-toolkit';
import { watchReadable } from '../shared/watch-readable';

export interface UseFormDraftOptions<
  T extends object = Record<string, unknown>,
> extends ConfigurableWindow {
  /** Whether form changes may currently be persisted. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Values shallowly merged below a restored draft. */
  defaults?: MaybeRefOrGetter<Partial<T>>;
  /** Keys never persisted or restored, e.g. collections the server owns once the record exists. */
  omit?: MaybeRefOrGetter<ReadonlyArray<keyof T>>;
  /** Delay before persisting form changes. */
  debounceMs?: MaybeRefOrGetter<number>;
  /** Receives key, serialization, and storage failures. */
  onError?: (error: unknown) => void;
}

export interface FormDraftRestoreOptions<T extends object> {
  /** Combines the stored draft with the current form. Defaults to `{ ...defaults, ...draft }`. */
  merge?: (draft: Partial<T>, current: T, defaults: Partial<T>) => T;
}

export interface UseFormDraftReturn<T extends object = Record<string, unknown>> {
  /** Last draft operation failure. */
  error: Readonly<Ref<unknown | null>>;
  /** Whether a form change is waiting for its debounce window. */
  isPending: Readonly<Ref<boolean>>;
  /** Restores and shallowly merges the draft stored under the current key. */
  restore: (options?: FormDraftRestoreOptions<T>) => boolean;
  /** Removes the draft stored under the current key. */
  clear: () => boolean;
  /** Cancels the debounce and immediately persists the current form. */
  flush: () => boolean;
  /**
   * Ignores form changes while an operation runs; nested calls are supported.
   * On the outermost exit, records a clean baseline so later equal writes are skipped.
   */
  withPaused: <R>(task: () => R | Promise<R>) => Promise<R>;
}

/**
 * Persists a form draft in localStorage for crash and refresh recovery.
 *
 * Restoring is explicit so local data cannot silently overwrite server data.
 * Load server state inside `withPaused`, then call `restore` — never restore on mount alone.
 *
 * @param form Mutable form state persisted as one JSON object.
 * @param key Complete localStorage key. Key changes never restore or migrate data.
 *
 * @example
 * const { restore, clear, withPaused } = useFormDraft(form, () => `order:${id.value}`, {
 *   omit: () => (id.value ? (['listOrders'] as const) : []),
 *   defaults: defaultForm,
 * })
 *
 * await withPaused(async () => {
 *   form.value = await api.getOrder(id.value)
 *   restore({
 *     merge: (draft, current, defaults) => {
 *       // Prefer filled draft fields; keep server values for empty draft slots.
 *       return { ...defaults, ...current, ...pickFilled(draft) }
 *     },
 *   })
 * })
 */
export function useFormDraft<T extends object = Record<string, unknown>>(
  form: Ref<T>,
  key: MaybeRefOrGetter<string>,
  options: UseFormDraftOptions<T> = {},
): UseFormDraftReturn<T> {
  const {
    window = defaultWindow,
    enabled = true,
    defaults,
    omit: omitKeys,
    debounceMs = 500,
    onError,
  } = options;

  const error = shallowRef<unknown | null>(null);
  let pauseDepth = 0;
  let disposed = false;
  let baseline: string | null = null;
  const createDisposedError = (): Error => new Error('[useFormDraft] Scope was disposed.');

  const reportError = (failure: unknown): false => {
    if (disposed) return false;
    error.value = failure;
    if (disposed) return false;
    if (onError) {
      try {
        onError(failure);
      } catch (onErrorFailure) {
        console.error('[useFormDraft] Error handler failed.', onErrorFailure);
      }
    }
    return false;
  };

  const reportAndThrow = (failure: unknown): never => {
    reportError(failure);
    throw failure;
  };

  const readValue = <Value>(value: MaybeRefOrGetter<Value>): Value => {
    try {
      return toValue(value);
    } catch (failure) {
      return reportAndThrow(failure);
    }
  };

  const resolveKey = (): string => {
    const value = readValue(key);
    if (!isString(value) || value.trim().length === 0) {
      return reportAndThrow(new TypeError('[useFormDraft] "key" must be a non-empty string.'));
    }
    return value.trim();
  };

  const resolveOmitKeys = (): ReadonlyArray<keyof T> => {
    if (omitKeys === undefined) return [];
    const keys = readValue(omitKeys);
    return Array.isArray(keys) ? keys : [];
  };

  const resolveStorage = (): Storage | null => {
    try {
      const storage = window?.localStorage;
      if (!storage) {
        throw new Error('[useFormDraft] localStorage is unavailable.');
      }
      return storage;
    } catch (failure) {
      reportError(failure);
      return null;
    }
  };

  const serializeForm = (): string => {
    if (!isPlainObject(form.value)) {
      return reportAndThrow(new TypeError('[useFormDraft] Form value must be a plain object.'));
    }
    const keys = resolveOmitKeys();
    const payload =
      keys.length === 0
        ? form.value
        : (omit(form.value as Record<PropertyKey, unknown>, keys as unknown as PropertyKey[]) as T);
    let serialized: string | undefined;
    try {
      serialized = JSON.stringify(payload);
    } catch (failure) {
      return reportAndThrow(failure);
    }
    if (serialized === undefined) {
      return reportAndThrow(new TypeError('[useFormDraft] Form cannot be serialized as JSON.'));
    }
    return serialized;
  };

  // The key watcher cancels reactive changes synchronously; expectedKey prevents stale writes for non-reactive getters it cannot observe.
  const writeDraft = (expectedKey?: string, options?: { skipIfBaseline?: boolean }): boolean => {
    if (disposed || pauseDepth > 0) return false;
    const enabledValue = readValue(enabled);
    if (!enabledValue) return false;
    const currentKey = resolveKey();
    if (expectedKey !== undefined && expectedKey !== currentKey) return false;
    const serialized = serializeForm();
    if (options?.skipIfBaseline && baseline !== null && serialized === baseline) return false;
    const storage = resolveStorage();
    if (!storage) return false;
    try {
      storage.setItem(currentKey, serialized);
      error.value = null;
      return true;
    } catch (failure) {
      return reportError(failure);
    }
  };

  let scheduledKey: string | null = null;
  const draftTimer = useTimeoutFn(
    () => {
      const expectedKey = scheduledKey;
      scheduledKey = null;
      if (expectedKey !== null) writeDraft(expectedKey, { skipIfBaseline: true });
    },
    debounceMs,
    { immediate: false },
  );

  const cancelScheduledDraft = (): void => {
    scheduledKey = null;
    draftTimer.stop();
  };

  const startDraftTimer = (): void => {
    try {
      draftTimer.start();
    } catch (failure) {
      cancelScheduledDraft();
      reportAndThrow(failure);
    }
  };

  const scheduleDraft = (): void => {
    if (disposed || pauseDepth > 0) return;
    try {
      const enabledValue = readValue(enabled);
      if (!enabledValue) return;
      scheduledKey = resolveKey();
    } catch (failure) {
      cancelScheduledDraft();
      throw failure;
    }
    startDraftTimer();
  };

  const captureBaseline = (): void => {
    if (disposed) return;
    try {
      baseline = serializeForm();
    } catch {
      // serializeForm already reported the failure via reportAndThrow.
      baseline = null;
    }
  };

  watchReadable(
    () => toValue(debounceMs),
    () => {
      if (disposed || !draftTimer.isPending.value) return;
      draftTimer.stop();
      startDraftTimer();
    },
    (failure) => {
      cancelScheduledDraft();
      reportError(failure);
    },
  );

  const restore = (restoreOptions: FormDraftRestoreOptions<T> = {}): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    const currentKey = resolveKey();
    const storage = resolveStorage();
    if (!storage) return false;

    let raw: string | null;
    try {
      raw = storage.getItem(currentKey);
    } catch (failure) {
      return reportError(failure);
    }
    if (raw === null) {
      error.value = null;
      return false;
    }

    let draft: unknown;
    try {
      draft = JSON.parse(raw);
    } catch (failure) {
      return reportError(failure);
    }
    if (!isPlainObject(draft)) {
      return reportError(new TypeError('[useFormDraft] Stored draft must be a plain object.'));
    }

    const fallback = defaults === undefined ? {} : readValue(defaults);
    if (!isPlainObject(fallback)) {
      return reportAndThrow(new TypeError('[useFormDraft] "defaults" must be a plain object.'));
    }

    const keys = resolveOmitKeys();
    const draftPartial =
      keys.length === 0
        ? (draft as Partial<T>)
        : (omit(
            draft as Record<PropertyKey, unknown>,
            keys as unknown as PropertyKey[],
          ) as Partial<T>);

    let next: T;
    if (restoreOptions.merge) {
      next = restoreOptions.merge(draftPartial, form.value, fallback as Partial<T>);
      if (!isPlainObject(next)) {
        return reportAndThrow(new TypeError('[useFormDraft] "merge" must return a plain object.'));
      }
    } else {
      next = { ...fallback, ...draftPartial } as T;
    }

    pauseDepth += 1;
    try {
      form.value = next;
    } finally {
      pauseDepth -= 1;
    }
    error.value = null;
    return true;
  };

  const clear = (): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    const currentKey = resolveKey();
    const storage = resolveStorage();
    if (!storage) return false;
    try {
      storage.removeItem(currentKey);
      error.value = null;
      return true;
    } catch (failure) {
      return reportError(failure);
    }
  };

  const flush = (): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    return writeDraft();
  };

  const withPaused = async <R>(task: () => R | Promise<R>): Promise<R> => {
    if (disposed) throw createDisposedError();
    pauseDepth += 1;
    cancelScheduledDraft();
    try {
      if (disposed) throw createDisposedError();
      return await task();
    } finally {
      pauseDepth -= 1;
      if (pauseDepth === 0 && !disposed) captureBaseline();
    }
  };

  watch(form, scheduleDraft, {
    deep: true,
    flush: 'sync',
  });
  watchReadable(
    resolveKey,
    () => {
      cancelScheduledDraft();
      if (disposed) return;
      error.value = null;
    },
    cancelScheduledDraft,
  );
  watchReadable(
    () => toValue(enabled),
    (value) => {
      if (!value) cancelScheduledDraft();
    },
    (failure) => {
      cancelScheduledDraft();
      reportError(failure);
    },
  );
  if (omitKeys !== undefined) {
    watchReadable(
      () => toValue(omitKeys),
      () => {
        // Reactive omit only affects subsequent writes; pending work stays valid.
      },
      (failure) => {
        cancelScheduledDraft();
        reportError(failure);
      },
    );
  }

  tryOnScopeDispose(() => {
    disposed = true;
    cancelScheduledDraft();
  });

  return {
    error: readonly(error),
    isPending: draftTimer.isPending,
    restore,
    clear,
    flush,
    withPaused,
  };
}

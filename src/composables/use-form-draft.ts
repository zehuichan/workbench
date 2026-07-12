import {
  onScopeDispose,
  readonly,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';
import { defaultWindow, useTimeoutFn } from '@vueuse/core';
import { isPlainObject } from 'es-toolkit';

export interface UseFormDraftOptions<
  T extends object = Record<string, unknown>,
> {
  /** Mutable form state persisted as one JSON object. */
  form: Ref<T>;
  /** Complete localStorage key. Key changes never restore or migrate data. */
  key: MaybeRefOrGetter<string>;
  /** Whether form changes may currently be persisted. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Values shallowly merged below a restored draft. */
  defaults?: MaybeRefOrGetter<Partial<T>>;
  /** Delay before persisting form changes. */
  debounceMs?: MaybeRefOrGetter<number>;
  /** Receives key, serialization, and storage failures. */
  onError?: (error: unknown) => void;
}

export interface UseFormDraftReturn {
  /** Last draft operation failure. */
  error: Readonly<Ref<unknown | null>>;
  /** Whether a form change is waiting for its debounce window. */
  isPending: Readonly<Ref<boolean>>;
  /** Restores and shallowly merges the draft stored under the current key. */
  restore: () => boolean;
  /** Removes the draft stored under the current key. */
  clear: () => boolean;
  /** Cancels the debounce and immediately persists the current form. */
  flush: () => boolean;
  /** Ignores form changes while an operation runs; nested calls are supported. */
  withPaused: <R>(task: () => R | Promise<R>) => Promise<R>;
}

/**
 * Persists a form draft in localStorage for crash and refresh recovery.
 *
 * Restoring is explicit so local data cannot silently overwrite server data.
 */
export function useFormDraft<T extends object = Record<string, unknown>>(
  options: UseFormDraftOptions<T>,
): UseFormDraftReturn {
  const {
    form,
    key,
    enabled = true,
    defaults,
    debounceMs = 500,
    onError,
  } = options;

  const error = shallowRef<unknown | null>(null);
  let pauseDepth = 0;
  let disposed = false;

  onScopeDispose(() => {
    disposed = true;
  }, true);

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

  const resolveKey = (): string => {
    const resolved = toValue(key).trim();
    if (!resolved) {
      throw new TypeError('[useFormDraft] "key" must be a non-empty string.');
    }
    return resolved;
  };

  const resolveStorage = (): Storage => {
    const storage = defaultWindow?.localStorage;
    if (!storage) {
      throw new Error('[useFormDraft] localStorage is unavailable.');
    }
    return storage;
  };

  const writeDraft = (expectedKey?: string): boolean => {
    try {
      if (disposed || pauseDepth > 0) return false;
      const enabledValue = toValue(enabled);
      if (disposed || !enabledValue) return false;
      const currentKey = resolveKey();
      if (disposed) return false;
      if (expectedKey !== undefined && expectedKey !== currentKey) return false;
      if (!isPlainObject(form.value)) {
        throw new TypeError(
          '[useFormDraft] Form value must be a plain object.',
        );
      }
      const serialized = JSON.stringify(form.value);
      if (serialized === undefined) {
        throw new TypeError(
          '[useFormDraft] Form cannot be serialized as JSON.',
        );
      }
      if (disposed) return false;
      const storage = resolveStorage();
      if (disposed) return false;
      storage.setItem(currentKey, serialized);
      if (disposed) return false;
      error.value = null;
      return !disposed;
    } catch (failure) {
      return reportError(failure);
    }
  };

  let scheduledKey: string | null = null;
  const draftTimer = useTimeoutFn(
    () => {
      const expectedKey = scheduledKey;
      scheduledKey = null;
      if (expectedKey !== null) writeDraft(expectedKey);
    },
    debounceMs,
    { immediate: false },
  );

  const cancelScheduledDraft = (): void => {
    scheduledKey = null;
    draftTimer.stop();
  };

  const scheduleDraft = (): void => {
    try {
      if (disposed || pauseDepth > 0) return;
      const enabledValue = toValue(enabled);
      if (disposed || !enabledValue) return;
      const nextKey = resolveKey();
      if (disposed) return;
      scheduledKey = nextKey;
      draftTimer.start();
      if (disposed) cancelScheduledDraft();
    } catch (failure) {
      cancelScheduledDraft();
      reportError(failure);
    }
  };

  let debounceReadable = true;
  const stopDebounceWatch = watch(
    () => {
      try {
        const value = toValue(debounceMs);
        debounceReadable = true;
        return value;
      } catch (failure) {
        debounceReadable = false;
        cancelScheduledDraft();
        reportError(failure);
        return undefined;
      }
    },
    () => {
      if (!debounceReadable || disposed || !draftTimer.isPending.value) {
        return;
      }

      draftTimer.stop();
      if (disposed) return;
      try {
        draftTimer.start();
        if (disposed) draftTimer.stop();
      } catch (failure) {
        cancelScheduledDraft();
        reportError(failure);
      }
    },
    { flush: 'sync' },
  );

  const restore = (): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    if (disposed) return false;
    try {
      const storage = resolveStorage();
      if (disposed) return false;
      const currentKey = resolveKey();
      if (disposed) return false;
      const raw = storage.getItem(currentKey);
      if (disposed) return false;
      if (raw === null) {
        error.value = null;
        return false;
      }

      const draft: unknown = JSON.parse(raw);
      if (!isPlainObject(draft)) {
        throw new TypeError(
          '[useFormDraft] Stored draft must be a plain object.',
        );
      }

      const fallback = defaults === undefined ? {} : toValue(defaults);
      if (disposed) return false;
      if (!isPlainObject(fallback)) {
        throw new TypeError(
          '[useFormDraft] "defaults" must be a plain object.',
        );
      }

      pauseDepth += 1;
      try {
        form.value = { ...fallback, ...draft } as T;
      } finally {
        pauseDepth -= 1;
      }
      if (disposed) return false;
      error.value = null;
      return !disposed;
    } catch (failure) {
      return reportError(failure);
    }
  };

  const clear = (): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    if (disposed) return false;
    try {
      const storage = resolveStorage();
      if (disposed) return false;
      const currentKey = resolveKey();
      if (disposed) return false;
      storage.removeItem(currentKey);
      if (disposed) return false;
      error.value = null;
      return !disposed;
    } catch (failure) {
      return reportError(failure);
    }
  };

  const flush = (): boolean => {
    if (disposed) return false;
    cancelScheduledDraft();
    if (disposed) return false;
    return writeDraft();
  };

  const withPaused = async <R>(task: () => R | Promise<R>): Promise<R> => {
    pauseDepth += 1;
    cancelScheduledDraft();
    try {
      return await task();
    } finally {
      pauseDepth -= 1;
    }
  };

  const stopFormWatch = watch(form, scheduleDraft, {
    deep: true,
    flush: 'sync',
  });
  let keyReadable = true;
  const stopKeyWatch = watch(
    () => {
      try {
        const value = resolveKey();
        keyReadable = true;
        return value;
      } catch (failure) {
        keyReadable = false;
        reportError(failure);
        return undefined;
      }
    },
    () => {
      cancelScheduledDraft();
      if (disposed) return;
      if (keyReadable) error.value = null;
    },
    { flush: 'sync' },
  );
  let enabledReadable = true;
  const stopEnabledWatch = watch(
    () => {
      try {
        const value = toValue(enabled);
        enabledReadable = true;
        return value;
      } catch (failure) {
        enabledReadable = false;
        reportError(failure);
        return false;
      }
    },
    (value) => {
      if (!enabledReadable || !value) cancelScheduledDraft();
    },
    { flush: 'sync' },
  );

  onScopeDispose(() => {
    cancelScheduledDraft();
    stopFormWatch();
    stopKeyWatch();
    stopEnabledWatch();
    stopDebounceWatch();
  }, true);

  return {
    error: readonly(error),
    isPending: draftTimer.isPending,
    restore,
    clear,
    flush,
    withPaused,
  };
}

import {
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';
import { useTimeoutFn } from '@vueuse/core';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  /** Reactive value observed with deep semantics. */
  source: MaybeRefOrGetter<T>;
  /**
   * Persists the latest value evaluated when a save starts.
   * Must not call this instance's flush or withPaused controls.
   */
  save: (value: T) => void | Promise<void>;
  /** Whether source changes may schedule automatic saves. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Delay before an automatic save starts. */
  debounceMs?: MaybeRefOrGetter<number>;
  /** Called after a value is persisted successfully. */
  onSuccess?: (value: T) => void;
  /** Receives source evaluation, persistence, and control failures. */
  onError?: (error: unknown) => void;
}

export interface UseAutoSaveReturn {
  /** Current state of the automatic save pipeline. */
  status: Readonly<Ref<AutoSaveStatus>>;
  /** Epoch timestamp of the latest successful save. */
  lastSavedAt: Readonly<Ref<number | null>>;
  /** Last source evaluation, persistence, or control failure. */
  error: Readonly<Ref<unknown | null>>;
  /**
   * Cancels the debounce and persists every revision known when called.
   * Rejects when paused, disposed before completion, or persistence fails.
   */
  flush: () => Promise<void>;
  /**
   * Discards pending and nested changes while the operation runs.
   * The existing save pipeline settles before the operation starts.
   */
  withPaused: <R>(task: () => R | Promise<R>) => Promise<R>;
}

/**
 * Serializes debounced server-side draft saves without overlapping requests.
 *
 * Local drafts and save hotkeys remain separate concerns. A save callback that
 * requires an immutable payload should provide a getter that creates one.
 */
export function useAutoSave<T>(
  options: UseAutoSaveOptions<T>,
): UseAutoSaveReturn {
  const {
    source,
    save,
    enabled = true,
    debounceMs = 2000,
    onSuccess,
    onError,
  } = options;

  const status = ref<AutoSaveStatus>('idle');
  const lastSavedAt = ref<number | null>(null);
  const error = shallowRef<unknown | null>(null);

  let revision = 0;
  let savedRevision = 0;
  let handledRevision = 0;
  let errorEpoch = 0;
  let pauseDepth = 0;
  let disposed = false;
  let invokingSaveSynchronously = false;
  let inFlight: Promise<void> | null = null;
  const activeFlushes = new Set<Promise<void>>();

  const reportError = (failure: unknown): void => {
    errorEpoch += 1;
    error.value = failure;
    status.value = 'error';
    if (onError) {
      try {
        onError(failure);
      } catch (onErrorFailure) {
        console.error('[useAutoSave] Error handler failed.', onErrorFailure);
      }
    }
  };

  const performSave = async (): Promise<void> => {
    const savingRevision = revision;
    const startingErrorEpoch = errorEpoch;
    let value: T;

    try {
      value = toValue(source);
      status.value = 'saving';
      error.value = null;

      let saveResult: void | Promise<void>;
      invokingSaveSynchronously = true;
      try {
        saveResult = save(value);
      } finally {
        invokingSaveSynchronously = false;
      }
      await saveResult;

      savedRevision = Math.max(savedRevision, savingRevision);
      handledRevision = Math.max(handledRevision, savingRevision);
      lastSavedAt.value = Date.now();
      if (onSuccess) {
        try {
          onSuccess(value);
        } catch (onSuccessFailure) {
          console.error(
            '[useAutoSave] Success handler failed.',
            onSuccessFailure,
          );
        }
      }
      if (errorEpoch === startingErrorEpoch) {
        status.value = handledRevision < revision ? 'pending' : 'saved';
      }
    } catch (failure) {
      reportError(failure);
      throw failure;
    }
  };

  const getOrStartSave = (): Promise<void> => {
    if (inFlight) return inFlight;

    const task = Promise.resolve().then(performSave);
    inFlight = task;
    void task
      .finally(() => {
        if (inFlight === task) inFlight = null;
      })
      .catch(() => undefined);
    return task;
  };

  const discardThrough = (targetRevision: number): void => {
    handledRevision = Math.max(handledRevision, targetRevision);
    if (!inFlight && status.value === 'pending') {
      status.value = lastSavedAt.value === null ? 'idle' : 'saved';
    }
  };

  const drainThrough = async (
    targetRevision: number,
    automatic = false,
    generation?: number,
  ): Promise<void> => {
    const isComplete = () =>
      (automatic ? handledRevision : savedRevision) >= targetRevision;

    while (!isComplete()) {
      if (disposed) {
        if (automatic) return;
        const failure = new Error(
          '[useAutoSave] Scope was disposed before flush completed.',
        );
        reportError(failure);
        throw failure;
      }
      if (automatic) {
        if (generation !== autoSaveGeneration) return;
        try {
          if (pauseDepth > 0 || !toValue(enabled)) {
            discardThrough(targetRevision);
            return;
          }
        } catch (failure) {
          reportError(failure);
          throw failure;
        }
      }
      await getOrStartSave();
    }
  };

  let autoSaveGeneration = 0;
  let scheduledGeneration = 0;
  const saveTimer = useTimeoutFn(
    () => {
      const targetRevision = revision;
      const generation = scheduledGeneration;
      void drainThrough(targetRevision, true, generation).catch(
        () => undefined,
      );
    },
    debounceMs,
    { immediate: false },
  );

  const cancelScheduledSave = (): void => {
    autoSaveGeneration += 1;
    scheduledGeneration = autoSaveGeneration;
    saveTimer.stop();
  };

  const scheduleSave = (): void => {
    scheduledGeneration = ++autoSaveGeneration;
    saveTimer.start();
  };

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
      if (!enabledReadable || !value) {
        cancelScheduledSave();
        discardThrough(revision);
      }
    },
    { flush: 'sync' },
  );

  let sourceReadable = true;
  const stopSourceWatch = watch(
    () => {
      try {
        const value = toValue(source);
        sourceReadable = true;
        return value;
      } catch (failure) {
        sourceReadable = false;
        cancelScheduledSave();
        reportError(failure);
        return undefined;
      }
    },
    () => {
      try {
        if (
          !sourceReadable ||
          disposed ||
          pauseDepth > 0 ||
          !toValue(enabled)
        ) {
          return;
        }
        revision += 1;
        if (!inFlight) status.value = 'pending';
        scheduleSave();
      } catch (failure) {
        cancelScheduledSave();
        reportError(failure);
      }
    },
    { deep: true, flush: 'sync' },
  );

  const flush = (): Promise<void> => {
    if (invokingSaveSynchronously) {
      const failure = new Error(
        '[useAutoSave] flush cannot be called from the save callback.',
      );
      reportError(failure);
      return Promise.reject(failure);
    }

    cancelScheduledSave();
    if (pauseDepth > 0) {
      const failure = new Error(
        '[useAutoSave] Cannot flush while auto-save is paused.',
      );
      reportError(failure);
      return Promise.reject(failure);
    }

    const targetRevision = revision;
    const operation = (async () => {
      if (inFlight) await inFlight;
      await drainThrough(targetRevision);
    })();

    activeFlushes.add(operation);
    void operation
      .finally(() => {
        activeFlushes.delete(operation);
      })
      .catch(() => undefined);
    return operation;
  };

  const withPaused = async <R>(task: () => R | Promise<R>): Promise<R> => {
    if (invokingSaveSynchronously) {
      const failure = new Error(
        '[useAutoSave] withPaused cannot be called from the save callback.',
      );
      reportError(failure);
      throw failure;
    }

    pauseDepth += 1;
    cancelScheduledSave();
    discardThrough(revision);
    try {
      while (activeFlushes.size > 0) {
        await Promise.allSettled([...activeFlushes]);
      }
      if (inFlight) {
        try {
          await inFlight;
        } catch {
          // The save state and callback already contain the failure.
        }
      }
      return await task();
    } finally {
      pauseDepth -= 1;
    }
  };

  onScopeDispose(() => {
    disposed = true;
    cancelScheduledSave();
    discardThrough(revision);
    stopSourceWatch();
    stopEnabledWatch();
  }, true);

  return {
    status: readonly(status),
    lastSavedAt: readonly(lastSavedAt),
    error: readonly(error),
    flush,
    withPaused,
  };
}

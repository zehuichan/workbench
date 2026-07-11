import {
  getCurrentInstance,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import { registerSaveHotkey } from './save-hotkey-registry';

export interface UseSaveHotkeyOptions {
  /** Save operation shared with the primary save action. */
  handler: () => void | Promise<void>;
  /** Whether the registered entry may currently execute. */
  enabled?: MaybeRefOrGetter<boolean>;
  /** Whether a mounted page or dialog currently owns the shortcut. */
  active?: MaybeRefOrGetter<boolean>;
  /** Receives handler and reactive predicate failures. */
  onError?: (error: unknown) => void;
}

/**
 * Registers Ctrl/Cmd+S for the active component or KeepAlive instance.
 *
 * Nested scopes outrank ancestors and same-depth registrations use LIFO
 * priority. A disabled owner intentionally blocks lower entries.
 */
export function useSaveHotkey(options: UseSaveHotkeyOptions): void {
  const { handler, enabled = true, active = true, onError } = options;

  let priority = 0;
  let ancestor = getCurrentInstance()?.parent;
  while (ancestor) {
    priority += 1;
    ancestor = ancestor.parent;
  }

  let lifecycleActive = false;
  let unregister: (() => void) | null = null;

  const reportError = (error: unknown): void => {
    if (!onError) {
      console.error('[useSaveHotkey] Active predicate failed.', error);
      return;
    }
    try {
      onError(error);
    } catch (onErrorFailure) {
      console.error('[useSaveHotkey] Error handler failed.', onErrorFailure);
    }
  };

  const readActive = (): boolean => {
    try {
      return toValue(active);
    } catch (error) {
      reportError(error);
      return false;
    }
  };

  let activeValue = readActive();

  const removeRegistration = () => {
    unregister?.();
    unregister = null;
  };

  const syncRegistration = () => {
    const shouldRegister = lifecycleActive && activeValue;
    if (!shouldRegister) {
      removeRegistration();
      return;
    }
    if (unregister) return;

    unregister = registerSaveHotkey({
      handler,
      enabled: () => toValue(enabled),
      onError,
      priority,
    });
  };

  watch(
    readActive,
    (value) => {
      activeValue = value;
      syncRegistration();
    },
    { flush: 'sync' },
  );

  onMounted(() => {
    lifecycleActive = true;
    syncRegistration();
  });
  onActivated(() => {
    lifecycleActive = true;
    syncRegistration();
  });
  onDeactivated(() => {
    lifecycleActive = false;
    removeRegistration();
  });
  onScopeDispose(() => {
    lifecycleActive = false;
    removeRegistration();
  });
}

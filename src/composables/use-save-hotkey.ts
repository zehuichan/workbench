import {
  getCurrentInstance,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  onUpdated,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import { registerSaveHotkey } from './save-hotkey-registry';

function asElement(value: unknown): Element | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    (value as Node).nodeType !== 1 ||
    typeof (value as Node).contains !== 'function'
  ) {
    return null;
  }
  return value as Element;
}

function asAppScope(value: unknown): Node | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    ![1, 11].includes((value as Node).nodeType) ||
    typeof (value as Node).contains !== 'function'
  ) {
    return null;
  }
  return value as Node;
}

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
  const instance = getCurrentInstance();
  const owner = instance?.appContext.app ?? null;

  let priority = 0;
  let ancestor = instance?.parent;
  while (ancestor) {
    priority += 1;
    ancestor = ancestor.parent;
  }

  let lifecycleActive = false;
  let scope: Node | null = null;
  let appScope: Node | null = null;
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

  const resolveAppScope = (): Node | null => {
    if (!instance) return null;
    const container = (instance.appContext.app as { _container?: unknown })
      ._container;
    return asAppScope(container);
  };

  const resolveScope = (fallback: Node | null): Node | null => {
    let current = instance;
    while (current) {
      const root =
        asElement(current.subTree?.el) ?? asElement(current.vnode.el);
      if (root) return root;
      current = current.parent;
    }

    return fallback;
  };

  const syncRegistration = () => {
    const shouldRegister = lifecycleActive && activeValue;
    if (!shouldRegister) {
      removeRegistration();
      return;
    }

    const nextAppScope = resolveAppScope();
    const nextScope = resolveScope(nextAppScope);
    if (scope !== nextScope || appScope !== nextAppScope) {
      removeRegistration();
      scope = nextScope;
      appScope = nextAppScope;
    }
    if (!owner || !scope || !appScope) return;
    if (unregister) return;

    unregister = registerSaveHotkey({
      handler,
      enabled: () => toValue(enabled),
      onError,
      scope,
      owner,
      appScope,
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
  onUpdated(syncRegistration);
  onDeactivated(() => {
    lifecycleActive = false;
    removeRegistration();
    scope = null;
    appScope = null;
  });
  onScopeDispose(() => {
    lifecycleActive = false;
    removeRegistration();
    scope = null;
    appScope = null;
  });
}

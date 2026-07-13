interface SaveHotkeyEntry {
  handler: () => void | Promise<void>;
  enabled: () => boolean;
  onError?: (error: unknown) => void;
  resolveScopes: () => readonly Node[];
  owner: object;
  appScope: Node;
  priority: number;
  execution: { busy: boolean };
  order: number;
}

export type SaveHotkeyRegistration = Omit<SaveHotkeyEntry, 'order'>;

const stack: SaveHotkeyEntry[] = [];

let listening = false;
let registrationOrder = 0;

function reportError(entry: SaveHotkeyEntry, error: unknown): void {
  if (!entry.onError) {
    console.error('[useSaveHotkey] Save handler failed.', error);
    return;
  }
  try {
    entry.onError(error);
  } catch (onErrorFailure) {
    console.error('[useSaveHotkey] Error handler failed.', onErrorFailure);
  }
}

async function triggerEntry(entry: SaveHotkeyEntry): Promise<void> {
  if (entry.execution.busy) return;
  try {
    if (!entry.enabled()) return;
    entry.execution.busy = true;
    await entry.handler();
  } catch (error) {
    reportError(entry, error);
  } finally {
    entry.execution.busy = false;
  }
}

function getScopePathIndex(
  scopes: readonly Node[],
  path: readonly EventTarget[],
): number | undefined {
  let bestIndex = Number.POSITIVE_INFINITY;
  let containsPath = false;

  for (const scope of scopes) {
    const index = path.indexOf(scope);
    if (index !== -1) {
      bestIndex = Math.min(bestIndex, index);
    } else if (
      path.some((target) => target instanceof Node && scope.contains(target))
    ) {
      containsPath = true;
    }
  }

  if (bestIndex !== Number.POSITIVE_INFINITY) return bestIndex;
  return containsPath ? Number.POSITIVE_INFINITY : undefined;
}

type ScopeCache = Map<SaveHotkeyEntry, readonly Node[]>;

function getScopes(entry: SaveHotkeyEntry, cache: ScopeCache): readonly Node[] {
  const cached = cache.get(entry);
  if (cached) return cached;
  const scopes = entry.resolveScopes();
  cache.set(entry, scopes);
  return scopes;
}

function isConnectedEntry(entry: SaveHotkeyEntry, cache: ScopeCache): boolean {
  return (
    entry.appScope.isConnected &&
    getScopes(entry, cache).some((scope) => scope.isConnected)
  );
}

function isDocumentLevelTarget(
  target: EventTarget | null | undefined,
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  return (
    target === window ||
    target === document ||
    target === document.documentElement ||
    target === document.body
  );
}

/**
 * Resolves which Vue app owns the shortcut.
 * Nested component priority is applied later; this only picks the app.
 */
function findEventOwner(
  path: readonly EventTarget[],
  cache: ScopeCache,
): object | undefined {
  let owner: object | undefined;
  let bestScopeIndex = Number.POSITIVE_INFINITY;
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (!entry || !isConnectedEntry(entry, cache)) continue;

    const scopeIndex = getScopePathIndex(getScopes(entry, cache), path);
    if (scopeIndex === undefined) continue;
    if (scopeIndex < bestScopeIndex) {
      owner = entry.owner;
      bestScopeIndex = scopeIndex;
    } else if (scopeIndex === Number.POSITIVE_INFINITY && owner === undefined) {
      owner = entry.owner;
    }
  }

  if (owner) return owner;

  let bestAppIndex = Number.POSITIVE_INFINITY;
  const seenOwners = new Set<object>();
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (
      !entry ||
      !isConnectedEntry(entry, cache) ||
      seenOwners.has(entry.owner)
    ) {
      continue;
    }
    seenOwners.add(entry.owner);

    const appIndex = path.indexOf(entry.appScope);
    if (appIndex !== -1 && appIndex < bestAppIndex) {
      owner = entry.owner;
      bestAppIndex = appIndex;
    }
  }

  if (owner) return owner;

  // Focus on body/html/document (common before any input is focused): still own the
  // shortcut so Ctrl/Cmd+S does not fall through to the browser save dialog.
  const focusTarget = path[0];
  if (!isDocumentLevelTarget(focusTarget)) return undefined;

  let latest: SaveHotkeyEntry | undefined;
  for (const entry of stack) {
    if (
      isConnectedEntry(entry, cache) &&
      (!latest || entry.order > latest.order)
    ) {
      latest = entry;
    }
  }

  return latest?.owner;
}

/** Highest-priority connected entry for the given app (deeper / later wins). */
function findTopEntry(
  owner: object,
  cache: ScopeCache,
): SaveHotkeyEntry | undefined {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const candidate = stack[index];
    if (
      candidate &&
      candidate.owner === owner &&
      isConnectedEntry(candidate, cache)
    ) {
      return candidate;
    }
  }
  return undefined;
}

function handleKeydown(event: KeyboardEvent): void {
  if (
    event.key.toLowerCase() !== 's' ||
    event.ctrlKey === event.metaKey ||
    event.altKey ||
    event.shiftKey ||
    event.repeat
  ) {
    return;
  }

  const path = event.composedPath();
  const cache: ScopeCache = new Map();
  const owner = findEventOwner(path, cache);
  if (!owner) return;

  const top = findTopEntry(owner, cache);
  if (!top) return;

  event.preventDefault();
  void triggerEntry(top);
}

function ensureListening(): void {
  if (listening || typeof window === 'undefined') return;
  window.addEventListener('keydown', handleKeydown);
  listening = true;
}

function stopListening(): void {
  if (!listening || typeof window === 'undefined') return;
  window.removeEventListener('keydown', handleKeydown);
  listening = false;
}

/**
 * Registers one save handler and returns an idempotent disposer.
 * Deeper component scopes win; entries at the same depth use LIFO priority.
 */
export function registerSaveHotkey(
  registration: SaveHotkeyRegistration,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const entry: SaveHotkeyEntry = {
    ...registration,
    order: ++registrationOrder,
  };
  let registered = true;

  const insertAt = stack.findIndex(
    (candidate) => candidate.priority > entry.priority,
  );
  if (insertAt === -1) stack.push(entry);
  else stack.splice(insertAt, 0, entry);
  ensureListening();

  return () => {
    if (!registered) return;
    registered = false;

    const index = stack.indexOf(entry);
    if (index !== -1) stack.splice(index, 1);
    if (stack.length === 0) stopListening();
  };
}

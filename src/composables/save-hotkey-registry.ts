interface SaveHotkeyEntry {
  handler: () => void | Promise<void>;
  enabled: () => boolean;
  onError?: (error: unknown) => void;
  scope: Node;
  owner: object;
  appScope: Node;
  priority: number;
  busy: boolean;
}

export type SaveHotkeyRegistration = Omit<SaveHotkeyEntry, 'busy'>;

const stack: SaveHotkeyEntry[] = [];

let listening = false;

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
  if (entry.busy) return;
  try {
    if (!entry.enabled()) return;
    entry.busy = true;
    await entry.handler();
  } catch (error) {
    reportError(entry, error);
  } finally {
    entry.busy = false;
  }
}

function scopeContainsEventPath(
  scope: Node,
  path: readonly EventTarget[],
): boolean {
  return path.some(
    (target) =>
      target === scope || (target instanceof Node && scope.contains(target)),
  );
}

function isConnectedEntry(entry: SaveHotkeyEntry): boolean {
  return entry.scope.isConnected && entry.appScope.isConnected;
}

function findEventOwner(path: readonly EventTarget[]): object | undefined {
  let owner: object | undefined;
  let bestAppIndex = Number.POSITIVE_INFINITY;
  const seenOwners = new Set<object>();

  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (!entry || !isConnectedEntry(entry) || seenOwners.has(entry.owner)) {
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

  let bestScopeIndex = Number.POSITIVE_INFINITY;
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (
      !entry ||
      !isConnectedEntry(entry) ||
      !scopeContainsEventPath(entry.scope, path)
    ) {
      continue;
    }

    const scopeIndex = path.indexOf(entry.scope);
    if (scopeIndex !== -1 && scopeIndex < bestScopeIndex) {
      owner = entry.owner;
      bestScopeIndex = scopeIndex;
    }
  }

  return owner;
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
  const owner = findEventOwner(path);
  if (!owner) return;

  let top: SaveHotkeyEntry | undefined;
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const candidate = stack[index];
    if (
      candidate &&
      candidate.owner === owner &&
      isConnectedEntry(candidate) &&
      scopeContainsEventPath(candidate.scope, path)
    ) {
      top = candidate;
      break;
    }
  }
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
    busy: false,
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

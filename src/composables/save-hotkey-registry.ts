interface SaveHotkeyEntry {
  handler: () => void | Promise<void>;
  enabled: () => boolean;
  onError?: (error: unknown) => void;
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

  const top = stack[stack.length - 1];
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

import { watch } from 'vue';

interface WatchReadableOptions {
  deep?: boolean | number;
}

/**
 * Watches a getter without letting Vue's component error handling turn a
 * failed read into a successful callback with `undefined`.
 */
export function watchReadable<Value>(
  read: () => Value,
  onChange: (value: Value) => void,
  onReadError: (failure: unknown) => void,
  options: WatchReadableOptions = {},
): void {
  let readFailed = false;
  watch(
    () => {
      readFailed = false;
      try {
        return read();
      } catch (failure) {
        readFailed = true;
        onReadError(failure);
        throw failure;
      }
    },
    (value) => {
      if (!readFailed) onChange(value);
    },
    { ...options, flush: 'sync' },
  );
}

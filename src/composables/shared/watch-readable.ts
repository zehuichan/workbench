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
      } catch (error) {
        readFailed = true;
        onReadError(error);
        throw error;
      }
    },
    (value) => {
      if (!readFailed) onChange(value);
    },
    { ...options, flush: 'sync' },
  );
}

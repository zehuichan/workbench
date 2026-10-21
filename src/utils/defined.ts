/**
 * Returns `value` when it is present.
 *
 * Call sites that already require a value use this instead of a non-null
 * assertion. A missing value throws, which is the same failure the assertion
 * would have reached on the next property access.
 *
 * @example
 * const row = defined(rows[index]);
 */
export function defined<T>(value: null | T | undefined): T {
  if (value === undefined || value === null) {
    throw new TypeError('Expected a value.');
  }
  return value;
}

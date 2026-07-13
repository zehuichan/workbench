import { isFunction } from 'es-toolkit';
import type { Ref } from 'vue';

export function createTableExpose<Local extends object, Table extends object>(
  local: Local,
  tableRef: Readonly<Ref<Table | undefined>>,
): Local & Table {
  type Method = (...args: unknown[]) => unknown;
  let boundTable: Table | undefined;
  const boundMethods = new Map<
    PropertyKey,
    { source: Method; bound: Method }
  >();

  return new Proxy(local, {
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }
      const table = tableRef.value;
      if (!table) return undefined;
      if (table !== boundTable) {
        boundTable = table;
        boundMethods.clear();
      }
      const value = Reflect.get(table, property, table);
      if (!isFunction(value)) return value;
      const source = value as Method;
      const cached = boundMethods.get(property);
      if (cached?.source === source) return cached.bound;
      const bound = source.bind(table);
      boundMethods.set(property, { source, bound });
      return bound;
    },
    has(target, property) {
      return (
        Reflect.has(target, property) ||
        (!!tableRef.value && Reflect.has(tableRef.value, property))
      );
    },
  }) as Local & Table;
}

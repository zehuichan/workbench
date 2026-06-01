import { inject } from 'vue';

import type { AntTableContext } from '../types';
import { ANT_TABLE_INJECTION_KEY } from '../constants';

/**
 * 安全获取 AntTableContext。
 * 必须在 `<AntTable>` 的后代组件中调用。
 */
export function useAntTableContext(): AntTableContext {
  const ctx = inject(ANT_TABLE_INJECTION_KEY);
  if (!ctx) {
    throw new Error(
      '[AntTable] useAntTableContext() must be used inside <AntTable>',
    );
  }
  return ctx;
}

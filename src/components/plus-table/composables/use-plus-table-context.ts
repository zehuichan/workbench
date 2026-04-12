import { inject } from 'vue'

import type { PlusTableContext } from '../types'
import { PLUS_TABLE_INJECTION_KEY } from '../constants'

/**
 * Safe injection helper for PlusTableContext.
 * Must be called inside a `<PlusTable>` descendant component.
 */
export function usePlusTableContext(): PlusTableContext {
  const ctx = inject(PLUS_TABLE_INJECTION_KEY)
  if (!ctx) {
    throw new Error(
      '[PlusTable] usePlusTableContext() must be used inside <PlusTable>',
    )
  }
  return ctx
}

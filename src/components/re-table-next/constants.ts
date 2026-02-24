import type { InjectionKey, Ref } from 'vue'

import type { ReTableNextColumn, RowData } from './types'

// ──── 特殊列类型 ────

export const SELECTION_COLUMN = 'selection'
export const INDEX_COLUMN = 'index'
export const EXPAND_COLUMN = 'expand'

export const SPECIAL_COLUMN_TYPES = [
  SELECTION_COLUMN,
  INDEX_COLUMN,
  EXPAND_COLUMN,
] as const

// ──── 自适应高度默认值 ────

export const DEFAULT_ADAPTIVE_OFFSET_TOP = 0
export const DEFAULT_ADAPTIVE_OFFSET_BOTTOM = 0

// ──── Provide / Inject ────

export interface ReTableNextContext {
  tableEl: Ref<HTMLElement | null>
  tableInstance: Ref<Record<string, any> | null>
  columns: Ref<ReTableNextColumn[]>
  visibleColumns: Ref<ReTableNextColumn[]>
  data: Ref<RowData[]>
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>
}

export const RE_TABLE_NEXT_INJECTION_KEY: InjectionKey<ReTableNextContext> =
  Symbol('ReTableNext')

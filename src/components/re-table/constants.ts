import type { InjectionKey, Ref, ShallowRef } from 'vue'

import type { CellMeta, ReTableColumn, RowData } from './types'

export const SELECTION_COLUMN = 'selection'
export const INDEX_COLUMN = 'index'
export const EXPAND_COLUMN = 'expand'

export const SPECIAL_COLUMN_TYPES = [
  SELECTION_COLUMN,
  INDEX_COLUMN,
  EXPAND_COLUMN,
] as const

export const DEFAULT_CELL_META: CellMeta = {
  row: -1,
  col: -1,
  activated: false,
  editing: false,
  contextmenu: false,
}

export interface ColumnOpsContext {
  visibleColumns: Ref<ReTableColumn[]>
  hiddenColumns: Ref<Set<string>>
  toggleColumn: (prop: string, visible: boolean) => void
  reorderColumns: (fromIndex: number, toIndex: number) => void
  resetColumns: () => void
  getOrderedColumnsWithProp: () => ReTableColumn[]
  isColumnHidden: (prop: string) => boolean
}

export interface ReTableContext {
  tableKey: string
  tableEl: Ref<HTMLElement | null>
  tableInstance: Ref<Record<string, any> | null>
  activated: Ref<boolean>
  cellMeta: Ref<CellMeta>
  columns: Ref<ReTableColumn[]>
  visibleColumns: Ref<ReTableColumn[]>
  data: Ref<RowData[]>
  cachedData: ShallowRef<RowData[]>
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>
  validationErrors: Ref<Map<string, string>>
  columnOps?: ColumnOpsContext | null
}

export const RE_TABLE_INJECTION_KEY: InjectionKey<ReTableContext> =
  Symbol('ReTable')

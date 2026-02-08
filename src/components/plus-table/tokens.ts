import type { InjectionKey } from 'vue'

export const SELECTION_COLUMN_FLAG = 'selection'

/** 表格列配置（与 Element Plus TableColumn 对齐） */
export interface PlusTableColumnOption {
  type?: string
  prop?: string
  label?: string
  hidden?: boolean | ((column: PlusTableColumnOption) => boolean)
  editable?: boolean
  formatter?: (row: any, column: PlusTableColumnOption, cellValue: any, rowIndex: number) => any
  component?: string | import('vue').Component
  componentProps?: Record<string, any>
  [key: string]: any
}

/** 表格 Props */
export interface PlusTableProps {
  tableKey?: string | number
  rowKey?: string | ((row: any) => any)
  columns?: PlusTableColumnOption[]
  data?: any[]
  loading?: boolean
  editable?: boolean | 'row' | 'cell' | 'manual' | object
  rules?: Record<string, any>
}

export const INDEX_COLUMN_FLAG = 'index'

export const IGNORE_COLUMN_FLAG = [SELECTION_COLUMN_FLAG, INDEX_COLUMN_FLAG]

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<any> = Symbol('PlusTable')

export const PLUS_TABLE_FORM_INJECTION_KEY: InjectionKey<any> = Symbol('PlusTableForm')

export interface CellMeta {
  row: number
  col: number
  activated: boolean
  contextmenu: boolean
  disabled: boolean
  editable: boolean
  readonly: boolean
  valid?: boolean
}

export const ORIGINAL_CELL_META: CellMeta = {
  row: -1,
  col: -1,
  activated: false,
  contextmenu: false,
  disabled: false,
  editable: false,
  readonly: false,
  valid: undefined,
}

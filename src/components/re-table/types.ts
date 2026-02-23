import type { Component, VNode } from 'vue'

// ──── 基础类型 ────

export type RowData = Record<string, any>

// ──── 单元格作用域 ────

export interface CellScope<T = RowData> {
  row: T
  column: ReTableColumn<T>
  rowIndex: number
  colIndex: number
}

// ──── 列配置 ────

export interface ReTableColumn<T = RowData> {
  type?: 'selection' | 'index' | 'expand'
  prop?: keyof T & string
  label?: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right' | boolean
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'

  hidden?: boolean | ((column: ReTableColumn<T>) => boolean)

  editable?: boolean | ((row: T) => boolean)
  component?: string | Component
  componentProps?:
    | Record<string, any>
    | ((row: T, column: ReTableColumn<T>) => Record<string, any>)
  componentSlots?: Record<string, (...args: any[]) => VNode>

  required?: boolean
  rules?: Record<string, any> | Record<string, any>[]

  formatter?: (
    row: T,
    column: ReTableColumn<T>,
    cellValue: any,
    rowIndex: number,
  ) => any
  renderHeader?: (column: ReTableColumn<T>) => VNode
  renderCell?: (scope: CellScope<T>) => VNode
  renderEditor?: (scope: CellScope<T>) => VNode

  disabled?: boolean | ((row: T) => boolean)
  readonly?: boolean | ((row: T) => boolean)
  tooltip?: string
  cellClassName?: string | ((scope: CellScope<T>) => string)

  [key: string]: any
}

// ──── 单元格元数据 ────

export interface CellMeta {
  row: number
  col: number
  activated: boolean
  editing: boolean
  contextmenu: boolean
}

// ──── 分页配置 ────

export interface PaginationConfig {
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  total?: number
  layout?: string
}

// ──── 热键 ────

export interface HotkeyBinding {
  key: string
  handler: (ctx: HotkeyContext) => void | boolean
  when?: (ctx: HotkeyContext) => boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  override?: boolean
}

export interface HotkeyContext {
  event: KeyboardEvent
  cellMeta: CellMeta
  row: RowData | null
  column: ReTableColumn | null
  tableData: RowData[]
  columns: ReTableColumn[]
  navigate: (rowDelta: number, colDelta: number) => void
  startEdit: () => void
  cancelEdit: () => void
  updateCellValue: (value: any) => void
}

// ──── 编辑历史 ────

export interface EditRecord {
  rowIndex: number
  colIndex: number
  prop: string
  oldValue: any
  newValue: any
  timestamp: number
}

// ──── 表格 Props ────

export interface CellEditPayload<T = RowData> {
  row: T
  column: ReTableColumn<T>
  rowIndex: number
  colIndex: number
}

export interface ReTableProps<T = RowData> {
  data?: T[]
  rowKey?: string | ((row: T) => string | number)
  columns?: ReTableColumn<T>[]
  loading?: boolean

  editable?: boolean | 'row' | 'cell' | 'manual'
  beforeCellEdit?: (payload: CellEditPayload<T>) => boolean | void

  rules?: Record<string, Record<string, any> | Record<string, any>[]>
  validateTrigger?: 'change' | 'blur' | 'manual'
  validateOnCellExit?: boolean

  hotkeys?: HotkeyBinding[]
  hotkeyEnabled?: boolean

  tableKey?: string
  columnSetting?: boolean
  columnSettingStorage?: 'local' | 'session' | false

  pagination?: false | PaginationConfig
}

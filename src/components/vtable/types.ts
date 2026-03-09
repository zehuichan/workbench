/**
 * VTablePlus 列配置（兼容 PlusTableColumn 子集）
 */
export interface VTablePlusColumn<T = Record<string, unknown>> {
  /** 字段名，对应 data 中的 key */
  prop: string
  /** 表头文案 */
  label?: string
  /** 列宽 */
  width?: number | string
  /** 最小列宽 */
  minWidth?: number | string
  /** 最大列宽 */
  maxWidth?: number | string
  /** 是否支持排序 */
  sortable?: boolean | 'custom'
  /** 固定列：'left' | 'right'，阶段 2 实现 */
  fixed?: 'left' | 'right'
  /** 列显隐 */
  hidden?: boolean
  /** 预留：formatter/render 阶段 3 */
  // formatter?: ...
  // render?: ...
}

/** 分页配置 */
export interface VTablePlusPagination {
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  layout?: string
}

/**
 * VTablePlus 表格 Props
 */
export interface VTablePlusProps<T = Record<string, unknown>> {
  /** 列配置 */
  columns?: VTablePlusColumn<T>[]
  /** 表格数据（对象数组） */
  data?: T[]
  /** 行唯一标识字段，预留 */
  rowKey?: string | ((row: T) => string | number)
  /** 分页配置；有 total 时启用客户端分页（对 data 切片） */
  pagination?: VTablePlusPagination
  /** 表格宽度（adaptive 为 false 时生效） */
  width?: number
  /** 表格高度（adaptive 为 false 时生效） */
  height?: number
  /** 是否自适应填满父容器 */
  adaptive?: boolean
}

/** VTable option 中的 header 项 */
export interface VTableHeaderItem {
  field: string
  caption?: string
  width?: number
  minWidth?: number
  maxWidth?: number
  sort?: boolean | { order: 'asc' | 'desc' }
}

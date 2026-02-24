import type { Component, VNode } from 'vue';

// ──── 基础类型 ────

export type RowData = Record<string, any>;

// ──── 单元格上下文 ────

export interface CellContext<T = RowData> {
  row: T;
  column: ReTableNextColumn<T>;
  value: any;
  rowIndex: number;
  colIndex: number;
}

// ──── 列配置 ────

export interface ReTableNextColumn<T = RowData> {
  type?: 'selection' | 'index' | 'expand';
  key?: string;
  prop?: keyof T & string;
  label?: string;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  fixed?: 'left' | 'right' | boolean;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean | 'custom';
  resizable?: boolean;
  ellipsis?: boolean;

  // 显隐
  hidden?: boolean;

  // 编辑
  editable?: boolean | ((row: T) => boolean);
  component?: string | Component;
  componentProps?:
    | Record<string, any>
    | ((row: T, column: ReTableNextColumn<T>) => Record<string, any>);

  // 校验
  rules?: Record<string, any> | Record<string, any>[];

  // 渲染
  formatter?: (value: any, row: T, rowIndex: number) => any;
  render?: (ctx: CellContext<T>) => VNode;
  renderHeader?: (column: ReTableNextColumn<T>) => VNode;

  // 多级表头
  children?: ReTableNextColumn<T>[];

  [key: string]: any;
}

// ──── 分页配置 ────

export interface PaginationConfig {
  currentPage?: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  layout?: string;
}

// ──── 热键 ────

export interface HotkeyBinding {
  key: string;
  handler: (ctx: HotkeyContext) => void | boolean;
  when?: (ctx: HotkeyContext) => boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  override?: boolean;
}

export interface HotkeyContext {
  event: KeyboardEvent;
  activeRowIndex: number;
  activeColIndex: number;
  row: RowData | null;
  column: ReTableNextColumn | null;
  tableData: RowData[];
  columns: ReTableNextColumn[];
  navigate: (rowDelta: number, colDelta: number) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  updateCellValue: (value: any) => void;
}

// ──── 自适应高度配置 ────

export interface AdaptiveConfig {
  /** 顶部偏移（px），如导航栏、工具栏高度 */
  offsetTop?: number;
  /** 底部偏移（px），如分页器、页脚高度 */
  offsetBottom?: number;
  /** 排除的兄弟选择器，计算高度时不计入 */
  excludeSelectors?: string[];
}

// ──── 表格 Props ────

export interface ReTableNextProps<T = RowData> {
  data?: T[];
  columns?: ReTableNextColumn<any>[];
  rowKey?: string | ((row: T) => string | number);

  // 基础展示
  stripe?: boolean;
  border?: boolean;
  showOverflowTooltip?: boolean;

  maxHeight?: string | number;

  // 交互
  cellActive?: boolean;
  rowActive?: boolean;
  areaSelection?: boolean;

  // 编辑
  editable?: boolean | 'row' | 'cell' | 'manual';

  // 列
  columnSetting?: boolean;
  colDrag?: boolean | { mode?: 'insert' | 'swap' };

  // 行拖拽
  rowDrag?: boolean | { handle?: string };

  // 热键
  hotkeys?: HotkeyBinding[];
  hotkeyEnabled?: boolean;

  // 分页
  pagination?: false | PaginationConfig;

  // 自适应高度
  adaptive?: boolean | AdaptiveConfig;
}

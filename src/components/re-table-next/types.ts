import type { Component, VNode, Ref } from 'vue';
import type { TableColumnCtx } from 'element-plus';

// ──── 基础类型 ────

export type RowData = Record<string, any>;

export interface ReTableNextContext {
  tableEl: Ref<HTMLElement | null>;
  tableInstance: Ref<Record<string, any> | null>;
  columns: Ref<ReTableNextColumn[]>;
  visibleColumns: Ref<ReTableNextColumn[]>;
  data: Ref<RowData[]>;
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>;
}

// ──── 单元格上下文 ────

export interface CellContext<T = RowData> {
  row: T;
  column: ReTableNextColumn<T>;
  value: any;
  rowIndex: number;
  colIndex: number;
}

// ──── 列配置（继承 Element Plus TableColumnCtx，仅声明扩展项）────

/** 列配置：继承 el-table-column 的 TableColumnCtx，prop/label/width/formatter/renderHeader 等由基类提供 */
export interface ReTableNextColumn<T = RowData> extends Partial<
  Omit<TableColumnCtx, 'children'>
> {
  /** 列显隐（扩展，非 el-table 原生） */
  hidden?: boolean;
  /** 单元格是否可编辑（扩展） */
  editable?: boolean | ((row: T) => boolean);
  /** 编辑态使用的组件（扩展） */
  component?: string | Component;
  /** 编辑组件 props（扩展） */
  componentProps?:
    | Record<string, any>
    | ((row: T, column: ReTableNextColumn<T>) => Record<string, any>);
  /** 校验规则（扩展） */
  rules?: Record<string, any> | Record<string, any>[];
  /** 单元格自定义渲染（扩展，与 formatter 并存） */
  render?: (ctx: CellContext<T>) => VNode;
  /** 多级表头子列（与 TableColumnCtx.children 兼容） */
  children?: ReTableNextColumn<T>[];
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

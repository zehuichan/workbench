import type { Component, VNode, Ref } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { RuleItem } from 'async-validator';

// ──── 基础类型 ────

export type RowData = Record<string, any>;

export interface PlusTableContext {
  tableEl: Ref<HTMLElement | null>;
  tableInstance: Ref<Record<string, any> | null>;
  rules: Ref<Record<string, RuleItem | RuleItem[]> | undefined>;
  columns: Ref<PlusTableColumn[]>;
  visibleColumns: Ref<PlusTableColumn[]>;
  navigableColumns: Ref<PlusTableColumn[]>;
  data: Ref<RowData[]>;
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>;
  /** 当前激活行索引（-1 表示无激活） */
  activeRowIndex: Ref<number>;
  /** 当前激活列索引（navigableColumns 中，-1 表示无激活） */
  activeColIndex: Ref<number>;
  /** 导航函数 */
  navigate: (rowDelta: number, colDelta: number) => void;

  // ──── 编辑状态 ────
  editMode: Ref<'none' | 'cell' | 'row' | 'manual' | 'all'>;
  isEditing: Ref<boolean>;
  editingRowIndex: Ref<number>;
  editingColIndex: Ref<number>;
  editingValue: Ref<any>;
  isEditingCell: (rowIndex: number, colProp: string | undefined) => boolean;
  isCellEditable: (rowIndex: number, colIndex: number) => boolean;
  startEdit: (rowIndex?: number, colIndex?: number) => void;
  confirmEdit: () => any;
  cancelEdit: () => void;
  updateEditingValue: (value: any) => void;
  getEditingValue: (colProp: string) => any;
  setEditingValue: (colProp: string, value: any) => void;

  /** 校验：获取单元格错误信息（供 Cell 红框 + tooltip） */
  getErrorForCell?: (rowIndex: number, prop: string) => string | undefined;

  /** 单元格联动：解析依赖状态（供 Cell 消费 disabled/componentProps 等） */
  resolveDependencyState?: (rowIndex: number, column: PlusTableColumn) => DependencyState;
  /** 单元格联动：字段变更时触发依赖方 trigger 回调 */
  onFieldChange?: (rowIndex: number, changedProp: string) => void;
  /** 脏数据：标记单元格已修改（all 模式 Cell 用） */
  markDirty?: (rowIndex: number, prop: string) => void;

  /** 列设置（列显隐、排序、列宽、持久化），仅当 columnSetting 为 true 时存在 */
  columnOptions?: {
    toggleColumn: (prop: string, visible: boolean) => void;
    reorderColumns: (fromIndex: number, toIndex: number) => void;
    setColumnWidth: (prop: string, width: string | number) => void;
    resetColumns: () => void;
    getOrderedColumnsWithProp: () => PlusTableColumn[];
    isColumnHidden: (prop: string) => boolean;
    /** 列宽覆盖（prop -> width），供列设置面板显示与绑定 */
    columnWidths: Ref<Record<string, number>>;
  };
}

// ──── 单元格上下文 ────

export interface CellContext<T = RowData> {
  row: T;
  column: PlusTableColumn<T>;
  value: any;
  rowIndex: number;
  colIndex: number;
}

// ──── 单元格联动（Cell Dependencies）────

/** 依赖 API — 传给各回调函数的第二参数 */
export interface DependencyApi<T = RowData> {
  /** 当前行索引 */
  rowIndex: number;
  /** 当前行数据（引用） */
  row: T;
  /** 当前列配置 */
  column: PlusTableColumn<T>;
  /** 读取当前行任意字段值 */
  getFieldValue: (prop: string) => any;
  /** 设置当前行任意字段值（直接写入 row，同步标记 dirty） */
  setFieldValue: (prop: string, value: any) => void;
}

/** 依赖配置 — 挂载在列配置的 dependencies 字段 */
export interface ColumnDependencies<T = RowData> {
  /** 监听哪些字段的值变动 */
  triggerFields: string[];
  /** 动态禁用（true → 阻止进入编辑 + 编辑器 disabled） */
  disabled?: (values: T, api: DependencyApi<T>) => boolean;
  /** 字段变更后的副作用（联动赋值等） */
  trigger?: (values: T, api: DependencyApi<T>) => void;
  /** 动态校验规则 */
  rules?: (values: T, api: DependencyApi<T>) => RuleItem | RuleItem[];
  /** 动态必填 */
  required?: (values: T, api: DependencyApi<T>) => boolean;
  /** 动态编辑组件 props */
  componentProps?: (values: T, api: DependencyApi<T>) => Record<string, any>;
}

/** 依赖解析结果 — Cell 组件消费 */
export interface DependencyState {
  disabled: boolean;
  required?: boolean;
  rules?: RuleItem | RuleItem[];
  componentProps?: Record<string, any>;
}

// ──── 列配置（继承 Element Plus TableColumnCtx，仅声明扩展项）────

/** 列配置：继承 el-table-column 的 TableColumnCtx，prop/label/width/formatter/renderHeader 等由基类提供 */
export interface PlusTableColumn<T = RowData> extends Partial<
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
    | ((row: T, column: PlusTableColumn<T>) => Record<string, any>);
  /** 校验规则（扩展，async-validator RuleItem） */
  rules?: RuleItem | RuleItem[];
  /** 是否必填 */
  required?: boolean;
  /** 单元格联动依赖（扩展） */
  dependencies?: ColumnDependencies<T>;
  /** 单元格自定义渲染（扩展，与 formatter 并存） */
  render?: (ctx: CellContext<T>) => VNode;
  /** 多级表头子列（与 TableColumnCtx.children 兼容） */
  children?: PlusTableColumn<T>[];
}

// ──── 分页事件 ────

export interface PaginationPayload {
  currentPage: number;
  pageSize: number;
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
  column: PlusTableColumn | null;
  tableData: RowData[];
  columns: PlusTableColumn[];
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

export interface PlusTableProps<T = RowData> {
  data?: T[];
  columns?: PlusTableColumn<any>[];
  rowKey?: string | ((row: T) => string | number);

  // 基础展示
  stripe?: boolean;
  border?: boolean;
  showOverflowTooltip?: boolean;

  maxHeight?: string | number;

  // 交互
  cellActive?: boolean;
  rowActive?: boolean;

  // 编辑
  editable?: boolean | 'row' | 'cell' | 'manual';

  /** 表级校验规则（按 prop 聚合） */
  rules?: Record<string, RuleItem | RuleItem[]>;
  /** 校验触发时机：change | blur | manual */
  validateTrigger?: 'change' | 'blur' | 'manual';
  /** 单元格失焦时是否校验（blur 时或 confirm 时） */
  validateOnCellExit?: boolean;

  // 列
  columnSetting?: boolean;

  // 热键（含 Tab/Shift+Tab 导航，由 hotkeyEnabled 统一控制）
  hotkeys?: HotkeyBinding[];
  hotkeyEnabled?: boolean;

  // 分页（传 total 即启用分页）
  currentPage?: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  paginationLayout?: string;

  // 自适应高度
  adaptive?: boolean | AdaptiveConfig;
}

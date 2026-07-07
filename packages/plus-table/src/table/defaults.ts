import type { RuleItem } from 'async-validator';
import type { PlusTableColumn, PlusTableColumnDef } from '../table-column/defaults';

export type RowData = Record<string, any>;

export type RowKey<T extends RowData = RowData> =
  | (keyof T & string)
  | ((row: T) => string | number);

/** 编辑模式：不可编辑 / 单元格 / 整行 / 全表常驻 */
export type EditMode = 'none' | 'cell' | 'row' | 'table';

/** 自动校验时机；manual 时仅 ref.validate() 触发 */
export type ValidateOn = 'change' | 'blur' | 'manual';

export type CellRule = RuleItem;

export interface CellError {
  rowKey: string;
  rowIndex: number;
  prop: string;
  message: string;
}

/** 行级上下文：editable / dependencies.componentProps 等回调的最小参数集 */
export interface RowContext<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
}

export interface ColumnSettingConfig {
  /** 显隐 / 顺序 / 列宽持久化到 localStorage 的 key；不传则不持久化 */
  storageKey?: string;
}

export interface HistoryConfig {
  /** 撤销栈上限，默认 50 */
  limit?: number;
}

export interface AdaptiveConfig {
  /** 'viewport'：按视口高度计算（默认，行为不变）；'container'：交给 CSS flex 父级撑满，适合卡片/弹窗等自身高度受限的容器 */
  mode?: 'viewport' | 'container';
  /** 表格底部到视口底部预留的间距，默认 16；仅 viewport 模式生效 */
  offsetBottom?: number;
  /** 计算出的最小高度，默认 200；仅 viewport 模式生效 */
  minHeight?: number;
}

/** 自定义热键的回调上下文，贴合 PlusTable 现有概念（row/rowIndex/prop/column） */
export interface HotkeyContext<T extends RowData = RowData> {
  event: KeyboardEvent;
  rowIndex: number;
  colIndex: number;
  row: T | null;
  prop: string | undefined;
  column: PlusTableColumn<T> | null;
  data: T[];
  /** 移动活动格（不改变编辑态） */
  navigate: (rowDelta: number, colDelta: number) => void;
  /** 对活动格进编；仅 cell 模式有效 */
  startEdit: () => void;
  cancelEdit: () => void;
  /** 写活动格的值，经完整 setCellValue 流水线（联动/校验/脏追踪/历史） */
  setValue: (value: unknown) => void;
  undo: () => void;
  redo: () => void;
}

export interface HotkeyBinding<T extends RowData = RowData> {
  /** 'Ctrl+Shift+Z' 风格组合键字符串，大小写不敏感 */
  key: string;
  /** 返回 false 表示不处理，继续走后续逻辑（其余绑定 / 内置热键） */
  handler: (ctx: HotkeyContext<T>) => void | boolean;
  /** 命中 key 后的附加判定条件 */
  when?: (ctx: HotkeyContext<T>) => boolean;
  /** 默认 true */
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** true：先于内置热键判定，可完全替换内置行为；false（默认）：内置热键优先，未处理时才轮到 */
  override?: boolean;
}

export interface CellChangePayload<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
  prop: string;
  value: unknown;
  oldValue: unknown;
}

export interface PageChangePayload {
  page: number;
  pageSize: number;
}

export interface ValidateResult {
  valid: boolean;
  errors: CellError[];
}

export interface PlusTableProps<T extends RowData = RowData> {
  data: T[];
  columns: PlusTableColumnDef[];
  rowKey: RowKey<T>;
  editMode?: EditMode | string;
  validateOn?: ValidateOn | string;
  /** 是否显示列设置入口；传对象可配置 localStorage 持久化 key */
  columnSetting?: boolean | ColumnSettingConfig;
  adaptive?: boolean | AdaptiveConfig;
  /** 传入即启用分页（服务端驱动，组件不切片） */
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  /** 撤销重做；传对象可配置撤销栈上限，默认 false */
  history?: boolean | HistoryConfig;
  /** 脏行/脏格追踪，默认 false */
  dirtyTracking?: boolean;
  /** 自定义热键绑定 */
  hotkeys?: HotkeyBinding<T>[];
}

export interface PlusTableEmits<T extends RowData = RowData> {
  (e: 'update:data', data: T[]): void;
  (e: 'cell-change', payload: CellChangePayload<T>): void;
  (e: 'update:page', page: number): void;
  (e: 'update:pageSize', pageSize: number): void;
  (e: 'page-change', payload: PageChangePayload): void;
}

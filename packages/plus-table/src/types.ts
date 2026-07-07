import type { Component, VNodeChild } from 'vue';
import type { RuleItem } from 'async-validator';
import type { TableColumnCtx } from 'element-plus';
import type { BuiltinEditorType } from './editors/registry';

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

/** 单元格级上下文：render 回调参数，在行上下文基础上附带列与当前值 */
export interface CellContext<
  T extends RowData = RowData,
> extends RowContext<T> {
  column: PlusTableColumn<T>;
  value: unknown;
}

/** 联动回调的行级上下文 */
export interface DependencyApi<T extends RowData = RowData> {
  row: T;
  rowIndex: number;
  /** 声明该 dependencies 的列字段 */
  prop: string;
  /** 写本行其他字段（会继续触发联动与校验流水线） */
  setValue: (prop: string, value: unknown) => void;
}

/** vben form 风格的字段联动配置（values 换成当前行数据） */
export interface ColumnDependencies<T extends RowData = RowData> {
  /** 仅这些字段变动时触发 trigger 副作用 */
  triggerFields: string[];
  /** 动态禁用本格编辑 */
  disabled?: (row: T, api: DependencyApi<T>) => boolean;
  /** 动态必填 */
  required?: (row: T, api: DependencyApi<T>) => boolean;
  /** 动态校验规则（与列静态 rules 合并） */
  rules?: (row: T, api: DependencyApi<T>) => CellRule[] | null | undefined;
  /** 动态编辑器参数（如下拉选项） */
  componentProps?: (row: T, api: DependencyApi<T>) => Record<string, unknown>;
  /** 依赖字段变更时的副作用，经 api.setValue 改本行其他字段 */
  trigger?: (row: T, api: DependencyApi<T>) => void;
}

/** 编辑器配置：内置类型标识 / 自定义组件 / 详细配置对象，三者选一 */
export interface EditorConfig<T extends RowData = RowData> {
  /** 内置编辑器标识；与 component 二选一 */
  type?: BuiltinEditorType;
  /** 自定义组件；与 type 二选一 */
  component?: Component;
  /** 透传给编辑器的 props（联动 dependencies.componentProps 会覆盖同名项） */
  props?:
    | Record<string, unknown>
    | ((ctx: RowContext<T>) => Record<string, unknown>);
  /** 自定义组件的 v-model prop 名，默认 modelValue */
  modelProp?: string;
}

/** 列上的 editor 配置：内置类型标识 / 自定义组件 / 详细配置对象 */
export type ColumnEditor<T extends RowData = RowData> =
  | BuiltinEditorType
  | Component
  | EditorConfig<T>;

/**
 * 列配置：继承 el-table-column 的 TableColumnCtx，width/align/fixed/sortable/formatter 等原生属性
 * 直接可用（含 type: 'index' | 'selection' | 'expand' 特殊列原生直通）。此处仅收窄 prop/type，
 * 并声明 PlusTable 扩展项；type 额外支持 'operation'：业务自定义的操作列（配合 render 渲染按钮），
 * 渲染方式不变，但同样归入特殊列——不进列设置面板、不参与键盘导航与拖拽排序、始终可见。
 */
export interface PlusTableColumn<T extends RowData = RowData> extends Partial<
  Omit<TableColumnCtx<T>, 'children' | 'prop' | 'type'>
> {
  prop?: keyof T & string;
  type?: 'index' | 'selection' | 'expand' | 'operation';
  /** 多级表头，组节点只需 label */
  children?: PlusTableColumn<T>[];
  /** 单元格是否可编辑 */
  editable?: boolean | ((ctx: RowContext<T>) => boolean);
  /** 编辑器；editable 且未配置时默认 input */
  editor?: ColumnEditor<T>;
  required?: boolean;
  rules?: CellRule[];
  dependencies?: ColumnDependencies<T>;
  /** 展示态自定义渲染，优先级高于 formatter */
  render?: (ctx: CellContext<T>) => VNodeChild;
  /** 初始是否可见（列设置） */
  visible?: boolean;
}

/**
 * 开发侧列配置：字面量数组直接传入即可，无需显式标注 PlusTableColumn<T>[]。
 * 运行时由 createColumns 归一化；类型上保持宽松以匹配日常 object 字面量写法。
 */
export type PlusTableColumnDef = Record<string, any> & {
  children?: PlusTableColumnDef[];
};

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
  /** 写活动格的值，经完整 writeCell 流水线（联动/校验/脏追踪/历史） */
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

/** 归一化后的列节点（列设置 / 渲染共用） */
export interface ColumnNode<T extends RowData = RowData> {
  id: string;
  column: PlusTableColumn<T>;
  children?: ColumnNode<T>[];
}

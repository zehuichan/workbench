import type { Component, VNodeChild } from 'vue';
import type { RuleItem } from 'async-validator';

export type RowData = Record<string, any>;

export type RowKey = string | ((row: RowData) => string | number);

/** 编辑模式：不可编辑 / 单元格 / 整行 / 全表常驻 */
export type EditMode = 'none' | 'cell' | 'row' | 'table';

/** 自动校验时机；manual 时仅 ref.validate() 触发 */
export type ValidateOn = 'change' | 'blur' | 'manual';

export type CellRule = RuleItem;

export interface CellError {
  rowKey: string;
  rowIndex: number;
  field: string;
  message: string;
}

/** 联动回调的行级上下文 */
export interface DependencyApi {
  row: RowData;
  rowIndex: number;
  /** 声明该 dependencies 的列字段 */
  field: string;
  /** 写本行其他字段（会继续触发联动与校验流水线） */
  setValue: (field: string, value: unknown) => void;
}

/** vben form 风格的字段联动配置（values 换成当前行数据） */
export interface ColumnDependencies {
  /** 仅这些字段变动时触发 trigger 副作用 */
  triggerFields: string[];
  /** 动态禁用本格编辑 */
  disabled?: (row: RowData, api: DependencyApi) => boolean;
  /** 动态必填 */
  required?: (row: RowData, api: DependencyApi) => boolean;
  /** 动态校验规则（与列静态 rules 合并） */
  rules?: (row: RowData, api: DependencyApi) => CellRule[] | null | undefined;
  /** 动态编辑器参数（如下拉选项） */
  componentProps?: (row: RowData, api: DependencyApi) => Record<string, unknown>;
  /** 依赖字段变更时的副作用，经 api.setValue 改本行其他字段 */
  trigger?: (row: RowData, api: DependencyApi) => void;
}

export type BuiltinEditorType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'date-picker'
  | 'time-picker'
  | 'switch'
  | 'checkbox';

export interface EditorOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface ColumnEditorConfig {
  type?: BuiltinEditorType;
  /** 自定义编辑器组件，优先于 type */
  component?: Component;
  /** 透传给编辑器的 props（联动 componentProps 会覆盖同名项） */
  props?: Record<string, unknown>;
  /** select 类编辑器的选项 */
  options?: EditorOption[] | ((row: RowData, rowIndex: number) => EditorOption[]);
  /** 自定义组件的 v-model prop 名，默认 modelValue */
  modelProp?: string;
}

export type ColumnEditor = BuiltinEditorType | ColumnEditorConfig | Component;

export interface CellRenderParams {
  row: RowData;
  rowIndex: number;
  column: PlusTableColumn;
  value: unknown;
}

export interface PlusTableColumn {
  /** 字段名；可编辑 / 校验 / 联动列必须提供 */
  field?: string;
  title?: string;
  /** 多级表头，组节点只需 title */
  children?: PlusTableColumn[];
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  /** 透传 el-table-column 的其他属性 */
  columnProps?: Record<string, unknown>;
  editable?: boolean | ((row: RowData, rowIndex: number) => boolean);
  /** 编辑器；editable 且未配置时默认 input */
  editor?: ColumnEditor;
  required?: boolean;
  rules?: CellRule[];
  dependencies?: ColumnDependencies;
  /** 展示态格式化，优先级低于 render */
  formatter?: (value: unknown, row: RowData, rowIndex: number) => string;
  /** 展示态自定义渲染 */
  render?: (params: CellRenderParams) => VNodeChild;
  /** 初始是否可见（列设置） */
  visible?: boolean;
  /** 列设置面板中不可操作（始终显示） */
  settingDisabled?: boolean;
}

export interface AdaptiveConfig {
  /** 表格底部到视口底部预留的间距，默认 16 */
  offsetBottom?: number;
  /** 计算出的最小高度，默认 200 */
  minHeight?: number;
}

export interface CellChangePayload {
  row: RowData;
  rowIndex: number;
  field: string;
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

export interface PlusTableProps {
  data: RowData[];
  columns: PlusTableColumn[];
  rowKey: RowKey;
  editMode?: EditMode;
  validateOn?: ValidateOn;
  /** 是否显示列设置入口 */
  columnSetting?: boolean;
  /** 列设置 localStorage 持久化 key；不传则不持久化 */
  settingsKey?: string;
  adaptive?: boolean | AdaptiveConfig;
  /** 传入即启用分页（服务端驱动，组件不切片） */
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
}

export interface PlusTableEmits {
  (e: 'update:data', data: RowData[]): void;
  (e: 'cell-change', payload: CellChangePayload): void;
  (e: 'update:page', page: number): void;
  (e: 'update:pageSize', pageSize: number): void;
  (e: 'page-change', payload: PageChangePayload): void;
}

/** 归一化后的列节点（列设置 / 渲染共用） */
export interface ColumnNode {
  id: string;
  column: PlusTableColumn;
  children?: ColumnNode[];
}

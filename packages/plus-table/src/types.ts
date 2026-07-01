import type { Component, VNodeChild } from 'vue';
import type { RuleItem } from 'async-validator';
import type { TableColumnCtx } from 'element-plus';
import type { BuiltinEditorType } from './editors/registry';

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
  prop: string;
  message: string;
}

/** 联动回调的行级上下文 */
export interface DependencyApi {
  row: RowData;
  rowIndex: number;
  /** 声明该 dependencies 的列字段 */
  prop: string;
  /** 写本行其他字段（会继续触发联动与校验流水线） */
  setValue: (prop: string, value: unknown) => void;
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

export interface CellRenderParams {
  row: RowData;
  rowIndex: number;
  column: PlusTableColumn;
  value: unknown;
}

/**
 * 列配置：继承 el-table-column 的 TableColumnCtx，prop/label/type/width/align/formatter 等原生属性
 * 直接可用（含 type: 'index' | 'selection' | 'expand' 特殊列原生直通）。此处仅声明 PlusTable 扩展项，
 * 其中 type 额外支持 'operation'：业务自定义的操作列（配合 render 渲染按钮），渲染方式不变，
 * 但同样归入特殊列——不进列设置面板、不参与键盘导航与拖拽排序、始终可见。
 */
export interface PlusTableColumn extends Partial<Omit<TableColumnCtx<RowData>, 'children'>> {
  /** 多级表头，组节点只需 label */
  children?: PlusTableColumn[];
  /** 单元格是否可编辑 */
  editable?: boolean | ((row: RowData, rowIndex: number) => boolean);
  /** 编辑器；editable 且未配置时默认 input */
  component?: BuiltinEditorType | Component;
  /** 透传给编辑器的 props（联动 dependencies.componentProps 会覆盖同名项） */
  componentProps?:
    | Record<string, unknown>
    | ((row: RowData, column: PlusTableColumn) => Record<string, unknown>);
  /** 自定义组件的 v-model prop 名，默认 modelValue */
  modelProp?: string;
  required?: boolean;
  rules?: CellRule[];
  dependencies?: ColumnDependencies;
  /** 展示态自定义渲染，优先级高于 formatter */
  render?: (params: CellRenderParams) => VNodeChild;
  /** 初始是否可见（列设置） */
  visible?: boolean;
  /** 列设置面板中不可操作（始终显示） */
  settingDisabled?: boolean;
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
export interface HotkeyContext {
  event: KeyboardEvent;
  rowIndex: number;
  colIndex: number;
  row: RowData | null;
  prop: string | undefined;
  column: PlusTableColumn | null;
  data: RowData[];
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

export interface HotkeyBinding {
  /** 'Ctrl+Shift+Z' 风格组合键字符串，大小写不敏感 */
  key: string;
  /** 返回 false 表示不处理，继续走后续逻辑（其余绑定 / 内置热键） */
  handler: (ctx: HotkeyContext) => void | boolean;
  /** 命中 key 后的附加判定条件 */
  when?: (ctx: HotkeyContext) => boolean;
  /** 默认 true */
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** true：先于内置热键判定，可完全替换内置行为；false（默认）：内置热键优先，未处理时才轮到 */
  override?: boolean;
}

export interface CellChangePayload {
  row: RowData;
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
  /** 撤销重做，默认 false */
  history?: boolean;
  /** 撤销栈上限，默认 50 */
  historyLimit?: number;
  /** 脏行/脏格追踪，默认 false */
  dirtyTracking?: boolean;
  /** 自定义热键绑定 */
  hotkeys?: HotkeyBinding[];
  /** 自定义热键总开关（不影响内置键盘导航），默认 true */
  hotkeyEnabled?: boolean;
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

import type { TableInstance } from 'element-plus';

import type { ComputedRef, Ref, ShallowUnwrapRef, Slots } from 'vue';

import type { ColumnSettingsExpose } from './column-settings';
import type { DirtyCell } from './composables/use-dirty';
import type { ContextMenuExpose } from './context-menu';
import type {
  CellError,
  EditMode,
  PlusTableColumn,
  PlusTableColumnDef,
  RowData,
  RowKey,
} from './types';

/**
 * Param types
 */

export interface AdaptiveConfig {
  /** 计算出的最小高度，默认 200；仅 viewport 模式生效 */
  minHeight?: number;
  /** 'viewport'：按视口高度计算（默认）；'container'：交给 CSS flex 父级撑满，适合卡片/弹窗等自身高度受限的容器 */
  mode?: 'container' | 'viewport';
  /** 表格底部到视口底部预留的间距，默认 16；仅 viewport 模式生效 */
  offsetBottom?: number;
}

/** 自定义热键的回调上下文，贴合 PlusTable 现有概念（row/rowIndex/prop/column） */
export interface HotkeyContext<T extends RowData = RowData> {
  cancelEdit: () => void;
  colIndex: number;
  column: null | PlusTableColumn<T>;
  data: T[];
  event: KeyboardEvent;
  /** 移动活动格（不改变编辑态） */
  navigate: (rowDelta: number, colDelta: number) => void;
  prop: string | undefined;
  redo: () => void;
  row: null | T;
  rowIndex: number;
  /** 写活动格的值，经完整 setCellValue 流水线（联动/校验/脏追踪/历史） */
  setValue: (value: unknown) => void;
  /** 对活动格进编；仅 cell 模式有效 */
  startEdit: () => void;
  undo: () => void;
}

export interface HotkeyBinding<T extends RowData = RowData> {
  /** 返回 false 表示不处理，继续走后续逻辑（其余绑定 / 内置热键） */
  handler: (ctx: HotkeyContext<T>) => boolean | undefined;
  /** 'Ctrl+Shift+Z' 风格组合键字符串，大小写不敏感 */
  key: string;
  /** true：先于内置热键判定，可完全替换内置行为；false（默认）：内置热键优先，未处理时才轮到 */
  override?: boolean;
  /** 默认 true */
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** 命中 key 后的附加判定条件 */
  when?: (ctx: HotkeyContext<T>) => boolean;
}

/** 表体右键菜单回调上下文 */
export interface ContextMenuContext<T extends RowData = RowData> {
  /** 特殊列为 -1 */
  colIndex: number;
  column: null | PlusTableColumn<T>;
  data: T[];
  event: MouseEvent;
  prop: string | undefined;
  row: T;
  rowIndex: number;
}

/**
 * `#context-menu-item-${key}` 插槽参数。
 * 对齐 `#editor-${prop}`：作用域带壳能力（close ≈ editor 的 commit/cancel）。
 */
export interface ContextMenuItemSlotProps<
  T extends RowData = RowData,
> extends ContextMenuContext<T> {
  /** 关闭右键菜单（内嵌控件确认后调用） */
  close: () => void;
}

export interface ContextMenuItem<T extends RowData = RowData> {
  /**
   * 选中时是否关闭并执行 handler；默认 true。
   * 内嵌控件的插槽项设为 false，由插槽内主动调用 close / 业务逻辑。
   */
  closeOnSelect?: boolean;
  disabled?: ((ctx: ContextMenuContext<T>) => boolean) | boolean;
  handler: (ctx: ContextMenuContext<T>) => void;
  /**
   * 唯一标识；缺省时用 label + 下标兜底。
   * 提供 `#context-menu-item-${key}` 插槽时必须显式设置，用于匹配插槽名。
   */
  key?: string;
  /** 无同名插槽时显示的纯文本标签 */
  label: string;
  /** 该项之后画分隔线 */
  separator?: boolean;
  /** 返回 false 则整项不渲染 */
  when?: (ctx: ContextMenuContext<T>) => boolean;
}

export interface CellChangePayload<T extends RowData = RowData> {
  oldValue: unknown;
  prop: string;
  row: T;
  rowIndex: number;
  value: unknown;
}

export interface PageChangePayload {
  page: number;
  pageSize: number;
}

export interface ValidateResult {
  errors: CellError[];
  valid: boolean;
}

/**
 * Props / emits
 */

export interface PlusTableProps<T extends RowData = RowData> {
  adaptive?: AdaptiveConfig | boolean;
  /** 是否缓存列设置（显隐 / 顺序 / 列宽）；为 true 时需同时传 `id` 才写入 localStorage */
  cache?: boolean;
  /**
   * 默认可直接传普通对象数组；如需严格校验 prop 与回调行类型，
   * 可在业务侧显式使用 defineColumns<T>()。
   */
  columns: PlusTableColumnDef[];
  /** 表体自定义右键菜单；不传或解析为空则保留浏览器原生菜单 */
  contextMenu?:
    | ((ctx: ContextMenuContext<T>) => ContextMenuItem<T>[])
    | ContextMenuItem<T>[];
  /** 右键菜单总开关，默认 true；false 时表头菜单也不弹 */
  contextMenuEnabled?: boolean;
  /**
   * 行数据源。每行必须是可写的普通对象：不能冻结，参与编辑的字段不能是访问器，
   * 且 rowKey 解析出的身份在行的生命周期内保持不变。
   *
   * 字段编辑走 writeRowField 就地修改行对象，**不会** emit('update:data')；
   * 只有 insertRow / removeRow / moveRow / duplicateRow 这类行结构变更才回传新数组。
   */
  data: T[];
  /** 脏行/脏格追踪，默认 false */
  dirtyTracking?: boolean;
  /** 撤销重做，默认 false */
  history?: boolean;
  /** 自定义热键总开关，不影响内置键盘导航 */
  hotkeyEnabled?: boolean;
  /** 自定义热键绑定 */
  hotkeys?: HotkeyBinding<T>[];
  /** 列设置缓存标识，多实例需各自唯一 */
  id?: string;
  mode?: EditMode;
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  rowKey: RowKey<T>;
  /** 传入即启用分页（服务端驱动，组件不切片） */
  total?: number;
  /** 是否在单元格变更时自动触发校验；false 时仅 ref.validate() 触发 */
  validateEvent?: boolean;
}

/**
 * props 默认值的单一来源：table.vue 的 withDefaults 与测试 helper 都取这里，
 * 免得同一个默认值在组件和 composable 各写一遍、改一处漏一处。
 * pageSizes 按 withDefaults 对数组默认值的要求写成工厂函数。
 */
export const DEFAULT_PROPS = {
  mode: 'cell' as EditMode,
  validateEvent: true,
  cache: false,
  adaptive: false,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  history: false,
  dirtyTracking: false,
  hotkeyEnabled: true,
  contextMenuEnabled: true,
};

type DefaultedKey = keyof typeof DEFAULT_PROPS;

/**
 * withDefaults 之后的 props 形态。composable 一律按这个类型读取 props，
 * 带默认值的字段直接取值。
 */
export type PlusTableResolvedProps<T extends RowData = RowData> = Omit<
  PlusTableProps<T>,
  DefaultedKey
> &
  Required<Pick<PlusTableProps<T>, DefaultedKey>>;

export interface PlusTableEmits<T extends RowData = RowData> {
  (e: 'update:data', data: T[]): void;
  (e: 'cell-change', payload: CellChangePayload<T>): void;
  (e: 'update:page' | 'update:pageSize', value: number): void;
  (e: 'page-change', payload: PageChangePayload): void;
}

/**
 * Host
 */

/**
 * 根组件交给 useTable 的宿主能力：事件、插槽、DOM / 子组件引用、id 生成。
 * 不持有 props（props 单独作首参传入），也不持有 useTable 的返回值，避免装配期环。
 */
export interface TableHost<T extends RowData = RowData> {
  columnSettingsRef: Ref<ColumnSettingsExpose | undefined>;
  contextMenuRef: Ref<ContextMenuExpose | undefined>;
  emit: PlusTableEmits<T>;
  gridRef: Ref<HTMLElement | undefined>;
  /** 当前是否有人监听 update:data；行结构操作用它在开发期点破"看起来成功实际无效"的情况 */
  hasDataListener: () => boolean;
  ids: {
    cell: (rowKey: string, colId: string) => string;
    description: string;
    error: (rowKey: string, colId: string) => string;
  };
  paginationRef: Ref<HTMLElement | undefined>;
  slots: Slots;
}

/**
 * defineExpose 字面量的形态：canUndo / canRedo 仍是 ComputedRef。
 * table.vue 的 expose 对象按此标注，名单对不上就编译失败。
 */
export interface PlusTableLocalExpose<T extends RowData = RowData> {
  cancelEdit: () => void;
  cancelRowEdit: (rowIndex: number) => void;
  canRedo: ComputedRef<boolean>;
  canUndo: ComputedRef<boolean>;
  clearColumnWidth: (id: string) => void;
  clearDirty: (rowKey?: string, prop?: string) => void;
  clearHistory: () => void;
  clearValidate: () => void;
  commitRowEdit: (rowIndex: number) => Promise<boolean>;
  duplicateRow: (index: number, patch: Partial<T>) => T | undefined;
  getDirtyCells: () => DirtyCell[];
  getErrors: () => CellError[];
  getModifiedRows: () => T[];
  insertRow: (row: T, index?: number) => T;
  isCellDirty: (rowKey: string, prop: string) => boolean;
  isRowDirty: (rowKey: string) => boolean;
  moveRow: (from: number, to: number) => boolean;
  redo: () => void;
  removeRow: (index: number) => T | undefined;
  resetColumnSettings: () => void;
  resetTracking: () => void;
  setActiveCell: (rowIndex: number, colIndex: number, scroll?: boolean) => void;
  setColumnWidth: (id: string, width: null | number) => void;
  startEdit: (
    rowIndex: number,
    colIndex: number,
    opts?: { defaultValue?: unknown },
  ) => boolean;
  startRowEdit: (rowIndex: number) => boolean;
  undo: () => void;
  validate: (scrollToFirstError?: boolean) => Promise<ValidateResult>;
}

/**
 * 模板 ref 拿到的实例形态：ComputedRef 已解包成 boolean，并透传 Partial<TableInstance>。
 */
export type PlusTableExpose<T extends RowData = RowData> =
  Partial<TableInstance> & ShallowUnwrapRef<PlusTableLocalExpose<T>>;

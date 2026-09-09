import type { Row, Table } from '@tanstack/vue-table';
import type { ZodType } from 'zod';

import type { Component, VNodeChild } from 'vue';

import type { GridyFeatures } from './features';

/** 行数据：键值对象 */
export type GridyRecord = Record<string, any>;

/** TanStack 行实例（`table.getRowModel().rows` 元素） */
export type GridyRow = Row<GridyFeatures, GridyRecord>;

/** 行定位：顶层下标，或树形模式下从顶层到目标行的完整下标路径 */
export type GridyRowTarget = number | number[];

/**
 * `componentProps` / `formatter` / `render` 的上下文。
 * `index` 是行在父级 `children` 中的下标（顶层即原始数据下标），不受排序影响；
 * 非树形模式 `path` 恒为 `[index]`、`depth` 恒为 0。
 */
export interface GridyCellContext {
  /** 层级深度，顶层为 0 */
  depth: number;
  /** 行在父级 `children` 中的下标（顶层即原始数据下标） */
  index: number;
  /** 从顶层到本行的下标路径 */
  path: number[];
  /** 当前行数据 */
  row: GridyRecord;
}

/** 单元格插槽参数（`#cell-[field]`） */
export interface GridyCellSlotProps extends GridyCellContext {
  /** 是否为只读展示态（`disabled` 时为 true） */
  disabled: boolean;
  /** 当前单元格的校验错误文案，无错误时为 `undefined` */
  error?: string;
  /** 写回当前单元格的值 */
  setValue: (value: any) => void;
  /** 当前单元格的值 */
  value: any;
}

/** 校验函数上下文：行上下文 + 当前列 + 全部行（跨行校验用）；`label` / `name` 取 `column.title` / `column.field` */
export interface GridyCellValidateContext extends GridyCellContext {
  column: GridyDataColumn;
  rows: GridyRecord[];
}

/**
 * 自定义校验函数——对 VbenForm `FormRuleValidator` 的扩展（多了行上下文，省去恒为空的 `params`）。
 * 返回 `true` 通过；返回字符串为错误文案；返回 `false` 落为错误并回退默认文案。
 */
export type GridyCellValidator = (
  value: any,
  ctx: GridyCellValidateContext,
) => boolean | Promise<boolean | string> | string;

/**
 * 列校验规则，形态对齐 VbenForm schema 的 `rules`：
 * - `'required'` / `'selectRequired'`：内置必填（文案 `请输入{title}` / `请选择{title}`），不走适配器注册表
 * - `ZodType`：`safeParseAsync` 取首条 issue 文案
 * - 函数：自定义校验，见 `GridyCellValidator`
 * - `null`：显式无规则
 * 单元格 change 时即时校验该格；`validate()` 全量校验。
 */
export type GridyColumnRule = 'required' | 'selectRequired' | GridyCellValidator | null | ZodType;

/** `validate()` 返回值，对齐 `formApi.validate()`；`errors` key 为 `[index].field`，树形为 `[0].children[1].field` */
export interface GridyValidateResult {
  errors: Record<string, string>;
  valid: boolean;
}

/** 操作列上下文：行上下文 + 增删当前行的快捷方法 */
export interface GridyActionContext extends GridyCellContext {
  /** 在当前行下新增一个子节点并展开（仅 `tree` 开启时生效） */
  addChild: () => void;
  /** 删除当前行（树形模式下连同子树） */
  remove: () => void;
}

/** 操作列插槽参数（`#action`） */
export interface GridyActionSlotProps extends GridyActionContext {
  /** 是否禁用删除 */
  disabled: boolean;
}

/**
 * 配置式操作列按钮。
 * - `label` / `disabled` / `show` / `confirm` 支持函数形态，入参为当前行上下文
 * - 省略 `items`（`GridyActionColumn.items`）时操作列回退到默认「删除」按钮
 */
export interface GridyActionItem {
  /** 稳定 key，缺省回退到 label */
  code?: string;
  /** 二次确认文案；传函数可按行定制，缺省直接执行 */
  confirm?: ((ctx: GridyActionContext) => string) | string;
  /** 是否危险态（红色） */
  danger?: boolean;
  /** 是否禁用 */
  disabled?: ((ctx: GridyActionContext) => boolean) | boolean;
  /** 按钮图标组件 */
  icon?: Component;
  /** 按钮文案 */
  label: ((ctx: GridyActionContext) => string) | string;
  /** 点击回调 */
  onClick: (ctx: GridyActionContext) => void;
  /** 是否展示，缺省展示 */
  show?: ((ctx: GridyActionContext) => boolean) | boolean;
}

/** 单元格 / 表头对齐方式 */
export type GridyColumnAlign = 'center' | 'left' | 'right';

/** 选择列：声明即启用多选 + 表头全选，替代旧版 `selectable` 开关 */
export interface GridySelectionColumn {
  align?: GridyColumnAlign;
  type: 'selection';
  width?: number;
}

/** 序号列 */
export interface GridyIndexColumn {
  align?: GridyColumnAlign;
  /** 表头文案，缺省 `'#'` */
  title?: string;
  type: 'index';
  width?: number;
}

/** 操作列：省略 `items` 时渲染默认「删除」按钮 */
export interface GridyActionColumn {
  align?: GridyColumnAlign;
  /** 配置式操作按钮；提供后取代默认删除按钮 */
  items?: GridyActionItem[];
  /** 最多内联展示的按钮数，超出收进「更多」下拉 */
  maxVisible?: number;
  /** 删除确认（仅默认删除按钮生效）：`true` 用默认文案，字符串作为确认标题 */
  removeConfirm?: boolean | string;
  /** 默认删除按钮文案 */
  removeText?: string;
  /** 表头文案，缺省 `'操作'` */
  title?: string;
  type: 'action';
  width?: number;
}

/**
 * 展开列：声明即启用「子组件面板」——每行下方渲染 `#expand` 插槽内容。
 * `tree` 开启时不渲染面板，改为承载树形展开图标的独立列（缺省图标落在首个数据列）。
 */
export interface GridyExpandColumn {
  align?: GridyColumnAlign;
  /** 行是否可展开（仅面板模式），缺省全部可展开；不可展开的行留空占位 */
  rowExpandable?: (ctx: GridyCellContext) => boolean;
  /** 表头文案，缺省为空 */
  title?: string;
  type: 'expand';
  width?: number;
}

/** `#expand` 插槽参数 */
export interface GridyExpandSlotProps extends GridyCellContext {
  /** 收起当前行 */
  collapse: () => void;
  /** 是否只读展示态（`disabled` 时为 true） */
  disabled: boolean;
  /** 写回当前行任意字段，走与单元格相同的 change / 校验链路 */
  setValue: (field: string, value: any) => void;
}

/** 树形配置，传 `true` 全部走默认值 */
export interface GridyTreeConfig {
  /** 子节点字段名，缺省 `'children'` */
  childrenField?: string;
  /** 每层缩进像素，缺省 15（对齐 a-table `indentSize`） */
  indentSize?: number;
}

/** 数据列：编辑控件或只读展示 */
export interface GridyDataColumn {
  align?: GridyColumnAlign;
  /**
   * 单元格编辑控件：
   * - 注册组件名字符串（如 `input` / `select` / `date-picker`），从 `initComponentAdapter` 注册的全局组件表解析，与 Filters / PlusTable 同源
   * - 任意 Vue 组件（配合 `modelProp` 指定双向绑定的 prop）
   * - 省略：只读展示（优先 `render`，再 `formatter`，否则按纯文本）
   */
  component?: Component | string;
  /** 传给编辑控件的 props，函数形态可拿到当前行 */
  componentProps?: ((ctx: GridyCellContext) => Record<string, any>) | Record<string, any>;
  /** 行对象字段名，取值与写值的 key */
  field: string;
  /**
   * 只读展示的文本格式化：无 `component` 的列与 `disabled` 只读态生效；
   * 与 `render` 不冲突——两者都提供时 `render` 优先（能力是超集），排序仍按原始值不受影响
   */
  formatter?: (ctx: GridyCellContext & { value: any }) => string;
  /** 单元格双向绑定的 prop 名；缺省为 Element Plus 的 `modelValue`。开关 / 复选类一般无需改 */
  modelProp?: string;
  /** 只读渲染函数，优先于 `formatter` 与纯文本 */
  render?: (ctx: GridyCellContext & { value: any }) => VNodeChild;
  /** 校验规则，见 `GridyColumnRule`；`disabled` 只读态不校验 */
  rules?: GridyColumnRule;
  /**
   * 启用排序（对齐 a-table `column.sorter`）：传 `true` 开启本地展示序排序；
   * 基于 TanStack 仅改变展示顺序，写值仍落到原始行。分页开启时客户端排序关闭。
   */
  sorter?: boolean;
  /**
   * 尾行合计：传入函数即在该列渲染汇总值，算法由宿主实现（求和 / 均价 / 后端回写均可）。
   * 任一数据列声明后即出现合计行；可用顶层 `summary.disabled` 关闭。
   * 分页时默认只合计当前 `v-model`（本页）；全量合计请用顶层 `summary.rows`。
   */
  summary?: GridyColumnSummary;
  /** 表头文案，缺省回退到 `field` */
  title?: string;
  type?: undefined;
  width?: number;
}

/** 列定义：选择 / 序号 / 操作 / 展开四种特殊列 + 数据列，渲染顺序即数组顺序 */
export type GridyColumn =
  GridyActionColumn | GridyDataColumn | GridyExpandColumn | GridyIndexColumn | GridySelectionColumn;

/** 组件尺寸：`middle` 对应 Element Plus `default` */
export type GridySize = 'large' | 'middle' | 'small';

/** 工具栏 / 选择态上下文，供工具栏按钮回调与 `#toolbar` 插槽使用 */
export interface GridyToolbarContext {
  /** 新增一行（等价于底部「添加一行」） */
  addRow: () => void;
  /** 清空当前选中 */
  clearSelection: () => void;
  /** 删除选中行 */
  removeSelected: () => void;
  /** 选中行下标：非树形即原始数据下标；树形为深度优先扁平序，按路径操作请用 `selectedPaths` */
  selectedIndexes: number[];
  /** 选中行路径（非树形为 `[index]`） */
  selectedPaths: number[][];
  /** 选中行的 key（对齐 a-table `rowSelection.selectedRowKeys`） */
  selectedRowKeys: string[];
  /** 选中行数据 */
  selectedRows: GridyRecord[];
  /** 底层 TanStack Table 实例（v9，含 rowSorting / rowExpanding feature） */
  table: Table<GridyFeatures, GridyRecord>;
}

/** 配置式工具栏按钮 */
export interface GridyToolbarItem {
  /** 稳定 key，缺省回退到 label */
  code?: string;
  /** 是否禁用 */
  disabled?: ((ctx: GridyToolbarContext) => boolean) | boolean;
  /** 按钮图标组件 */
  icon?: Component;
  /** 按钮文案 */
  label: string;
  /** 点击回调 */
  onClick?: (ctx: GridyToolbarContext) => void;
  /** 按钮类型，`danger` 映射为危险态 */
  type?: 'danger' | 'default' | 'primary';
}

/** 工具栏配置：传 `true` 仅在已有标题 / `items` / `#toolbar` 插槽时显示，传对象自定义 */
export interface GridyToolbarConfig {
  /** 配置式工具栏按钮（导入 / 新增 / 批量编辑…） */
  items?: GridyToolbarItem[];
  /** 工具栏左侧标题文案 */
  title?: string;
}

/** 「添加一行」按钮配置：传 `true` 用默认文案，传对象自定义文案 */
export interface GridyAddButtonConfig {
  /** 按钮文案，缺省 `'添加一行'` */
  text?: string;
}

/**
 * 分页配置（后端分页）：组件不做本地切片，`v-model` 只放当前页数据；
 * `current` / `total` 由使用方持有，翻页 / 改每页条数后组件只 emit `pageChange`，
 * 请求后端与写回 `v-model` + `current`/`total` 都是使用方的职责。
 */
export interface GridyPagination {
  /** 当前页码，从 1 开始 */
  current: number;
  /** 每页条数 */
  pageSize?: number;
  /** 每页条数可选项 */
  pageSizeOptions?: (number | string)[];
  /** 是否展示快速跳转 */
  showQuickJumper?: boolean;
  /** 是否允许改变每页条数 */
  showSizeChanger?: boolean;
  /** 是否展示总数（true 用默认文案，或传函数自定义） */
  showTotal?: ((total: number, range: [number, number]) => string) | boolean;
  /** 总条数（后端返回的全量行数；用于渲染分页器，也用于 max/min 的总行数判断） */
  total: number;
}

/**
 * 表格滚动区域（对齐 a-table `scroll`）。
 * `y` 指定纵向高度（虚拟滚动与固定表头共用）；`x` 指定横向滚动宽度。
 */
export interface GridyScroll {
  /** 横向滚动区域宽度，number 视为 px */
  x?: number | string;
  /** 纵向滚动区域高度，number 视为 px；缺省虚拟滚动时回退 400 */
  y?: number | string;
}

/** 列合计函数入参：当前参与合计的行（缺省为 `v-model`） */
export interface GridySummaryContext {
  field: string;
  rows: GridyRecord[];
  values: unknown[];
}

/** 列合计：只接受宿主函数，组件不内置 sum / avg 等算法 */
export type GridyColumnSummary = (ctx: GridySummaryContext) => number | string;

/**
 * 合计行配置。列 `summary` 负责「这一列怎么算」；本对象负责「文案 / 吸底 / 数据范围」。
 * 不把 `boolean` 放进顶层 prop 类型——Vue 会把未传入的 Boolean 合成 `false`，导致列上的合计被静默关掉。
 */
export interface GridySummary {
  /** 关闭合计行（即使列上写了 `summary`） */
  disabled?: boolean;
  /**
   * 吸底固定在滚动容器底部（对齐 a-table `Table.Summary` `fixed`）。
   * 缺省：存在 `scroll.y` 或 `virtual` 时为 true，否则 false。
   */
  fixed?: boolean;
  /** 合计文案，缺省 `'合计'` */
  label?: string;
  /**
   * 参与合计的行；缺省为当前 `v-model`（分页即本页）。
   * 后端分页要展示全量合计时传入全量数组或工厂。
   */
  rows?: (() => GridyRecord[]) | GridyRecord[];
}

/** `#summary` 插槽参数 */
export interface GridySummarySlotProps {
  /** 已算好的单元格（与列顺序对应，含 colspan） */
  cells: GridySummaryCell[];
  label: string;
  rows: GridyRecord[];
}

/** 内置合计行的一个单元格 */
export interface GridySummaryCell {
  className: string;
  colspan?: number;
  content: number | string;
  field?: string;
  key: string;
  /** 无独立 label 列时，写在首个合计格前的文案 */
  label?: string;
  style?: { width: string };
  tdClass: string;
}

/**
 * 行虚拟滚动配置，传 `true` 全部走默认值。
 * 基于 `@tanstack/vue-virtual`：只渲染可视窗口内的行，两端用 spacer 行撑开滚动高度，
 * 不改变现有 `<table>` 布局，与不开启时共用同一套单元格渲染逻辑。
 * 滚动高度用顶层 `scroll.y`。
 */
export interface GridyVirtual {
  /** 行高估算值（px），缺省按 `size` 估算；实际高度仍由 `measureElement` 动态修正，估算越接近真实高度首屏越不易跳动 */
  estimateSize?: number;
  /** 可视窗口外额外渲染的行数（上下各一份），缺省 5 */
  overscan?: number;
}

/** 数据变更类型 */
export type GridyChangeType = 'add' | 'remove' | 'update';

/** change 事件携带的元信息 */
export interface GridyChangeMeta {
  /** 更新型变更涉及的字段 */
  field?: string;
  /** 受影响行在父级中的下标（批量删除时为第一个被删行的下标） */
  index: number;
  /** 批量删除时全部受影响行的下标（当前页内，深度优先序） */
  indexes?: number[];
  /** 受影响行的路径（非树形为 `[index]`） */
  path?: number[];
  /** 批量删除时全部受影响行的路径 */
  paths?: number[][];
  /** 变更类型 */
  type: GridyChangeType;
}

/** Gridy 组件 props */
export interface GridyProps {
  /**
   * 「添加一行」按钮：传 `true` 用默认文案，传对象自定义文案，传 `false` 隐藏。
   * 只管编辑态下内置新增入口的显隐，与 `disabled` 正交——`disabled` 时无论此项如何配置都不渲染。
   */
  addButton?: boolean | GridyAddButtonConfig;
  /** 是否显示外边框与列分隔线（对齐 a-table `bordered`）；缺省只有行分隔线 */
  bordered?: boolean;
  /** 列定义：选择 / 序号 / 操作 / 展开四种特殊列 + 数据列，渲染顺序即数组顺序 */
  columns: GridyColumn[];
  /** 新增一行时生成的默认数据；缺省时按数据列 `field` 生成空对象。新增子节点时传入父级上下文 */
  createRow?: (parent?: GridyCellContext) => GridyRecord;
  /**
   * 只读展示态：编辑入口一律不渲染（新增按钮 / 单元格编辑控件 / 选择列 / 操作列 / 工具栏配置式按钮 / 键盘导航），
   * 浏览能力全保留（序号列 / 排序 / 分页 / 虚拟滚动 / 工具栏标题与 `#toolbar` 插槽）。
   * 数据列没有编辑控件可渲染时天然走只读路径，因此同一份 `columns` 可以在编辑页与详情页间共用，只切这一个开关。
   */
  disabled?: boolean;
  /** 空数据文案（也可用 `#emptyText` 插槽覆盖，对齐 a-table） */
  emptyText?: string;
  /**
   * 是否启用仿 Excel 的单元格键盘导航与活动单元格高亮：方向键 / Tab / Enter 在数据单元格间移动焦点，
   * 落点单元格高亮显示；选择列 / 序号列 / 操作列不参与。缺省开启，可显式传 `false` 关闭；`disabled` 时始终关闭。
   */
  keyboard?: boolean;
  /** 页面是否加载中，用 Element Plus `v-loading` 包裹主体 */
  loading?: boolean;
  /** 最多行数 */
  max?: number;
  /** 最少行数 */
  min?: number;
  /**
   * 分页（后端驱动）：传配置对象开启，此时 `v-model` 须为当前页数据；缺省不分页。
   * 组件只渲染分页器并 emit `pageChange`，翻页 / 改每页条数后请求后端、
   * 写回 `v-model` 与 `pagination.current`/`total` 都由使用方负责。
   */
  pagination?: GridyPagination;
  /** 行主键：字段名或取值函数；缺省按行对象引用生成稳定 key */
  rowKey?: ((row: GridyRecord, index: number) => number | string) | string;
  /** 表格滚动区域（对齐 a-table `scroll`）；虚拟滚动高度用 `scroll.y` */
  scroll?: GridyScroll;
  /**
   * 尾行合计（对齐 a-table `#summary`）：列 `summary` 传入函数后自动出现合计行。
   * 对象自定义 label / 吸底 / 数据范围；`disabled: true` 关闭。
   */
  summary?: GridySummary;
  /** 组件尺寸，同时透传给内置 Element Plus 编辑控件 */
  size?: GridySize;
  /** 工具栏：传 `true` 仅在已有标题 / `items` / `#toolbar` 插槽时显示，传对象自定义；缺省按同等条件自动显示 */
  toolbar?: boolean | GridyToolbarConfig;
  /**
   * 树形数据：行对象的 `children`（可配 `childrenField`）作为子行渲染，首个数据列缩进并带展开图标；
   * 任意层级均可编辑 / 校验 / 增删。与 `#expand` 面板互斥（对齐 a-table，开启后忽略面板）。
   * `min` / `max` 与合计行仍按顶层行计算。
   */
  tree?: boolean | GridyTreeConfig;
  /**
   * 行虚拟滚动（大数据量场景，opt-in）：传 `true` 用默认配置，或传对象自定义；缺省不开启。
   * 滚动高度请配 `scroll.y`。面向不分页的全量数据；分页场景一般不需要再开虚拟滚动。
   */
  virtual?: boolean | GridyVirtual;
}

/** Gridy emits 类型 */
export interface GridyEmits {
  (event: 'add', row: GridyRecord, index: number): void;
  (event: 'change', value: GridyRecord[], meta: GridyChangeMeta): void;
  (event: 'expand', expanded: boolean, row: GridyRecord, index: number): void;
  (event: 'expandedRowsChange', keys: string[]): void;
  (event: 'pageChange', page: number, pageSize: number): void;
  (event: 'remove', item: GridyRecord, index: number, list: GridyRecord[]): void;
  (event: 'selectionChange', keys: string[], rows: GridyRecord[]): void;
}

/** Gridy 通过 ref 暴露的方法与实例 */
export interface GridyExposed {
  /** 新增一行；传入父级路径时在该节点下新增子节点并展开（仅 `tree`） */
  addRow: (parentPath?: number[]) => void;
  /** 清空选中 */
  clearSelection: () => void;
  /** 清空全部校验错误（对齐 `formApi.clearValidation()`） */
  clearValidation: () => void;
  /** 获取选中行 key（对齐 a-table `selectedRowKeys`） */
  getSelectedRowKeys: () => string[];
  /** 获取选中行数据 */
  getSelectedRows: () => GridyRecord[];
  /** 删除指定行（顶层下标或路径；树形连同子树） */
  removeRow: (target: GridyRowTarget) => void;
  /** 删除当前选中行 */
  removeSelected: () => void;
  /** 滚动到指定行（顶层下标或路径，不受排序影响；树形会先展开祖先），仅 `virtual` 开启或容器可滚动时生效 */
  scrollToRow: (target: GridyRowTarget, align?: 'auto' | 'end') => void;
  /** 底层 TanStack Table 实例（v9，含 rowSorting / rowExpanding feature） */
  table: Table<GridyFeatures, GridyRecord>;
  /** 切换指定行的展开态（顶层下标或路径），省略 `expanded` 即取反；不可展开的行忽略 */
  toggleRowExpanded: (target: GridyRowTarget, expanded?: boolean) => void;
  /** 全量校验当前 `v-model`（分页即本页），有错时滚到首个错误行（对齐 `formApi.validate()`） */
  validate: () => Promise<GridyValidateResult>;
}

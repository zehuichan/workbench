import type { Component, VNodeChild } from 'vue';
import type { RuleItem } from 'async-validator';

// ──── 基础类型 ────

export type RowData = Record<string, any>;

export type ColumnAlign = 'left' | 'center' | 'right';

export interface CellContext<T = RowData> {
  row: T;
  column: AntTableColumn<T>;
  value: any;
  rowIndex: number;
  colIndex: number;
}

/** customRender 回调参数（对齐 ant-design-vue 列 customRender 的入参） */
export interface CellRenderParams<T = RowData> {
  text: any;
  value: any;
  record: T;
  index: number;
  column: AntTableColumn<T>;
}

// ──── 单元格联动（Cell Dependencies）────

/** 依赖 API — 传给各回调函数的第二参数 */
export interface DependencyApi<T = RowData> {
  /** 当前行索引 */
  rowIndex: number;
  /** 当前行数据（引用） */
  row: T;
  /** 当前列配置 */
  column: AntTableColumn<T>;
  /** 读取当前行任意字段值 */
  getFieldValue: (field: string) => any;
  /** 设置当前行任意字段值（直接写入 row，同步标记 dirty） */
  setFieldValue: (field: string, value: any) => void;
}

/** 依赖配置 — 挂载在列配置的 dependencies 字段 */
export interface ColumnDependencies<T = RowData> {
  /** 监听哪些字段（dataIndex）的值变动 */
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

// ──── 列配置（ant-design-vue 风格 + 编辑增强扩展）────

/**
 * 列配置：尽量贴近 ant-design-vue 的列定义（dataIndex / title / customRender / children 等），
 * 在其基础上扩展 editable / component / rules / dependencies 等编辑能力。
 *
 * 约束：可编辑列的 `dataIndex` 必须为 string（作为行字段键 + 编辑/校验/脏标记的标识）。
 */
export interface AntTableColumn<T = RowData> {
  // ── ant-design-vue 原生（透传给 a-table 列）──
  title?: VNodeChild | (() => VNodeChild);
  /** 数据字段；可编辑列必须为 string */
  dataIndex?: string | string[];
  /** 列唯一 key（无 dataIndex 的分组/操作列建议设置） */
  key?: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  fixed?: boolean | 'left' | 'right';
  align?: ColumnAlign;
  ellipsis?: boolean | { showTitle?: boolean };
  /** 是否允许拖拽调整列宽（开启时 width 需为 number） */
  resizable?: boolean;
  /** 展示态自定义渲染（ant-design-vue 风格） */
  customRender?: (params: CellRenderParams<T>) => VNodeChild;
  /** 多级表头子列 */
  children?: AntTableColumn<T>[];

  // ── 编辑增强扩展 ──
  /** 列显隐（列设置面板控制） */
  hidden?: boolean;
  /** 单元格是否可编辑 */
  editable?: boolean | ((row: T) => boolean);
  /** 编辑态使用的组件（适配器名称或组件） */
  component?: string | Component;
  /** 编辑组件 props */
  componentProps?:
    | Record<string, any>
    | ((row: T, column: AntTableColumn<T>) => Record<string, any>);
  /** 校验规则（async-validator RuleItem） */
  rules?: RuleItem | RuleItem[];
  /** 是否必填 */
  required?: boolean;
  /** 单元格联动依赖 */
  dependencies?: ColumnDependencies<T>;

  /** 其余 ant-design-vue 列属性透传（sorter / filters / customFilterDropdown 等） */
  [key: string]: any;
}

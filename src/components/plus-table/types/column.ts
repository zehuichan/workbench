import type { Component, VNode } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { RuleItem } from 'async-validator';

// ──── 基础类型 ────

export type RowData = Record<string, any>;

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

import type { Component, VNodeChild } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { BuiltinEditorType } from '../editors/registry';
import type { CellRule, RowContext, RowData } from '../table/defaults';

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

/** 单元格级上下文：render 回调参数，在行上下文基础上附带列与当前值 */
export interface CellContext<
  T extends RowData = RowData,
> extends RowContext<T> {
  column: PlusTableColumn<T>;
  value: unknown;
}

/**
 * 列配置：继承 el-table-column 的 TableColumnCtx，width/align/fixed/sortable/formatter 等原生属性
 * 直接可用（含 type: 'index' | 'selection' | 'expand' 特殊列原生直通）。
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
 * 运行时由 useColumns 归一化；类型上保持宽松以匹配日常 object 字面量写法。
 */
export type PlusTableColumnDef = Record<string, any> & {
  children?: PlusTableColumnDef[];
};

/** 归一化后的列节点（列设置 / 渲染共用） */
export interface ColumnNode<T extends RowData = RowData> {
  id: string;
  column: PlusTableColumn<T>;
  children?: ColumnNode<T>[];
}

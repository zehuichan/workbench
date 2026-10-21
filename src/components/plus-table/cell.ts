import type { Component } from 'vue';

import type { CellError, EditMode, PlusTableColumn, RowData } from './types';

/** editor-${prop} 插槽的统一读写接口，与内置/自定义编辑器共享同一套取值 / 写值策略 */
export interface EditorSlotProps<T extends RowData = RowData> {
  cancel: () => void;
  column: PlusTableColumn<T>;
  commit: () => void;
  row: T;
  rowIndex: number;
  setValue: (value: unknown) => void;
  value: unknown;
}

/** header-${prop} 插槽参数 */
export interface HeaderSlotProps<T extends RowData = RowData> {
  column: PlusTableColumn<T>;
}

/** 内置 / 自定义编辑器组件的完整绑定，可直接 h(component, bind) 展开渲染 */
export interface EditorBinding {
  bind: Record<string, unknown>;
  component: Component;
}

/** 供 PlusTableCell 消费的单元格视图模型 */
export interface CellView<T extends RowData = RowData> {
  active: boolean;
  dirty: boolean;
  disabled: boolean;
  editable: boolean;
  editing: boolean;
  /** editing 为 true 且未使用 editor-${prop} 插槽时非空 */
  editorBind: EditorBinding | null;
  /** editing 为 true 且存在 editor-${prop} 插槽时非空 */
  editorSlotProps: EditorSlotProps<T> | null;
  error: CellError | undefined;
  mode: EditMode;
  required: boolean;
  value: unknown;
}

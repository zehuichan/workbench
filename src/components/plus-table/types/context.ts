import type { Ref } from 'vue';
import type { RuleItem } from 'async-validator';

import type { ColumnSettingNode } from '../utils/column-utils';
import type {
  DependencyState,
  PlusTableColumn,
  RowData,
} from './column';

export interface PlusTableContext {
  tableEl: Ref<HTMLElement | null>;
  tableInstance: Ref<Record<string, any> | null>;
  rules: Ref<Record<string, RuleItem | RuleItem[]> | undefined>;
  columns: Ref<PlusTableColumn[]>;
  visibleColumns: Ref<PlusTableColumn[]>;
  navigableColumns: Ref<PlusTableColumn[]>;
  data: Ref<RowData[]>;
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>;
  /** 当前激活行索引（-1 表示无激活） */
  activeRowIndex: Ref<number>;
  /** 当前激活列索引（navigableColumns 中，-1 表示无激活） */
  activeColIndex: Ref<number>;
  /** 导航函数 */
  navigate: (rowDelta: number, colDelta: number) => void;

  // ──── 编辑状态 ────
  editMode: Ref<'none' | 'cell' | 'row' | 'manual' | 'all'>;
  isEditing: Ref<boolean>;
  editingRowIndex: Ref<number>;
  editingColIndex: Ref<number>;
  editingValue: Ref<any>;
  isEditingCell: (rowIndex: number, colProp: string | undefined) => boolean;
  isCellEditable: (rowIndex: number, colIndex: number) => boolean;
  startEdit: (rowIndex?: number, colIndex?: number) => void;
  confirmEdit: () => any;
  cancelEdit: () => void;
  updateEditingValue: (value: any) => void;
  getEditingValue: (colProp: string) => any;
  setEditingValue: (colProp: string, value: any) => void;

  /** 校验：获取单元格错误信息（供 Cell 红框 + tooltip） */
  getErrorForCell: (rowIndex: number, prop: string) => string | undefined;

  /** 单元格联动：解析依赖状态（供 Cell 消费 disabled/componentProps 等） */
  resolveDependencyState: (rowIndex: number, column: PlusTableColumn) => DependencyState;
  /** 单元格联动：字段变更时触发依赖方 trigger 回调 */
  onFieldChange: (rowIndex: number, changedProp: string) => void;
  /** 脏数据：标记单元格已修改（all 模式 Cell 用） */
  markDirty: (rowIndex: number, prop: string) => void;

  /** 列设置（列显隐、排序、列宽、持久化），仅当 columnSetting 为 true 时存在 */
  columnOptions?: {
    toggleColumn: (prop: string, visible: boolean) => void;
    reorderColumns: (fromIndex: number, toIndex: number) => void;
    setColumnOrderByIds: (ids: string[]) => void;
    setColumnWidth: (prop: string, width: string | number) => void;
    resetColumns: () => void;
    snapshotColumnState: () => void;
    restoreColumnState: () => void;
    getOrderedColumnsWithProp: () => PlusTableColumn[];
    getColumnSettingTree: () => ColumnSettingNode[];
    isColumnHidden: (prop: string) => boolean;
    isNodeHidden: (node: ColumnSettingNode) => boolean;
    /** 列宽覆盖（prop -> width），供列设置面板显示与绑定 */
    columnWidths: Ref<Record<string, number>>;
  };
}

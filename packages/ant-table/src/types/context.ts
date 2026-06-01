import type { Ref } from 'vue';
import type { RuleItem } from 'async-validator';

import type { ColumnSettingNode } from '../utils';
import type { AntTableColumn, DependencyState, RowData } from './column';

export interface AntTableContext {
  tableEl: Ref<HTMLElement | null>;
  rules: Ref<Record<string, RuleItem | RuleItem[]> | undefined>;
  columns: Ref<AntTableColumn[]>;
  visibleColumns: Ref<AntTableColumn[]>;
  navigableColumns: Ref<AntTableColumn[]>;
  data: Ref<RowData[]>;
  editable: Ref<boolean | 'row' | 'cell' | 'manual'>;

  /** 高亮开关 */
  cellActive: Ref<boolean>;
  rowActive: Ref<boolean>;

  /** 当前激活行索引（-1 表示无激活） */
  activeRowIndex: Ref<number>;
  /** 当前激活列索引（navigableColumns 中，-1 表示无激活） */
  activeColIndex: Ref<number>;
  /** 导航函数 */
  navigate: (rowDelta: number, colDelta: number) => void;
  /** 点击单元格（由 customCell.onClick 调用） */
  handleCellClick: (rowIndex: number, field: string) => void;
  /** 判断单元格是否处于激活态 */
  isActiveCell: (rowIndex: number, field: string | undefined) => boolean;

  // ──── 编辑状态 ────
  editMode: Ref<'none' | 'cell' | 'row' | 'manual' | 'all'>;
  isEditing: Ref<boolean>;
  editingRowIndex: Ref<number>;
  editingColIndex: Ref<number>;
  isEditingCell: (rowIndex: number, field: string | undefined) => boolean;
  isCellEditable: (rowIndex: number, colIndex: number) => boolean;
  startEdit: (rowIndex?: number, colIndex?: number) => void;
  confirmEdit: () => any;
  cancelEdit: () => void;
  getEditingValue: (field: string) => any;
  setEditingValue: (field: string, value: any) => void;

  /** 校验：获取单元格错误信息（供 Cell 红框 + tooltip） */
  getErrorForCell: (rowIndex: number, field: string) => string | undefined;

  /** 单元格联动：解析依赖状态（供 Cell 消费 disabled/componentProps 等） */
  resolveDependencyState: (
    rowIndex: number,
    column: AntTableColumn,
  ) => DependencyState;
  /** 单元格联动：字段变更时触发依赖方 trigger 回调 */
  onFieldChange: (rowIndex: number, changedField: string) => void;
  /** 脏数据：标记单元格已修改（all 模式 Cell 用） */
  markDirty: (rowIndex: number, field: string) => void;
  /** 脏数据：判断单元格是否被修改 */
  isCellDirty: (rowIndex: number, field: string) => boolean;

  /** 列设置（列显隐、排序、列宽、持久化），仅当 columnSetting 为 true 时存在 */
  columnOptions?: {
    toggleColumn: (id: string, visible: boolean) => void;
    moveColumn: (id: string, delta: number) => void;
    setColumnOrderByIds: (ids: string[]) => void;
    setColumnWidth: (field: string, width: string | number) => void;
    resetColumns: () => void;
    snapshotColumnState: () => void;
    restoreColumnState: () => void;
    getColumnSettingTree: () => ColumnSettingNode[];
    isNodeHidden: (node: ColumnSettingNode) => boolean;
    columnWidths: Ref<Record<string, number>>;
  };
}

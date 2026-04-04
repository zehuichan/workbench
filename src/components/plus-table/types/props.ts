import type { RuleItem } from 'async-validator';

import type { PlusTableColumn, RowData } from './column';
import type { HotkeyBinding } from './hotkey';

// ──── 分页事件 ────

export interface PaginationPayload {
  currentPage: number;
  pageSize: number;
  pageSizes?: number[];
  total?: number;
  layout?: string;
}

// ──── 自适应高度配置 ────

export interface AdaptiveConfig {
  /** 顶部偏移（px），如导航栏、工具栏高度 */
  offsetTop?: number;
  /** 底部偏移（px），如分页器、页脚高度 */
  offsetBottom?: number;
  /** 排除的兄弟选择器，计算高度时不计入 */
  excludeSelectors?: string[];
}

// ──── 表格 Props ────

export interface PlusTableProps<T = RowData> {
  data?: T[];
  columns?: PlusTableColumn<any>[];
  rowKey?: string | ((row: T) => string | number);

  // 基础展示
  stripe?: boolean;
  border?: boolean;
  showOverflowTooltip?: boolean;

  maxHeight?: string | number;

  // 交互
  cellActive?: boolean;
  rowActive?: boolean;

  // 编辑
  editable?: boolean | 'row' | 'cell' | 'manual';

  /** 表级校验规则（按 prop 聚合） */
  rules?: Record<string, RuleItem | RuleItem[]>;
  /** 校验触发时机：change | blur | manual */
  validateTrigger?: 'change' | 'blur' | 'manual';
  /** 单元格失焦时是否校验（blur 时或 confirm 时） */
  validateOnCellExit?: boolean;

  // 列
  columnSetting?: boolean;
  /** 列设置持久化 key（多实例时需各自不同，否则互相覆盖） */
  columnSettingKey?: string;

  // 热键（含 Tab/Shift+Tab 导航，由 hotkeyEnabled 统一控制）
  hotkeys?: HotkeyBinding[];
  hotkeyEnabled?: boolean;

  // 分页（传 total 即启用分页）
  currentPage?: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  paginationLayout?: string;

  // 自适应高度
  adaptive?: boolean | AdaptiveConfig;
}

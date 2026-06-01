import type { RuleItem } from 'async-validator';

import type { AntTableColumn, RowData } from './column';
import type { HotkeyBinding } from './hotkey';

// ──── 分页事件 ────

export interface PaginationPayload {
  current: number;
  pageSize: number;
  total?: number;
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

export interface AntTableProps<T = RowData> {
  /** 数据源（ant-design-vue 风格命名） */
  dataSource?: T[];
  columns?: AntTableColumn<any>[];
  rowKey?: string | ((row: T) => string | number);

  // 基础展示（透传 a-table）
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';

  // 交互
  cellActive?: boolean;
  rowActive?: boolean;

  // 编辑
  editable?: boolean | 'row' | 'cell' | 'manual';

  /** 表级校验规则（按 dataIndex 聚合） */
  rules?: Record<string, RuleItem | RuleItem[]>;
  /** 校验触发时机：change | blur | manual */
  validateTrigger?: 'change' | 'blur' | 'manual';
  /** 单元格失焦/确认时是否校验 */
  validateOnCellExit?: boolean;

  // 列设置
  columnSetting?: boolean;
  /** 列设置持久化 key（多实例时需各自不同，否则互相覆盖） */
  columnSettingKey?: string;

  /**
   * 表级列宽拖拽开关：开启后所有叶子列默认可拖拽调整列宽（需为列设 number 类型 width）。
   * 单列可通过列配置 `resizable: false` 单独关闭、`resizable: true` 单独开启（列级优先）。
   */
  resizable?: boolean;

  // 热键（含 Tab/Shift+Tab 导航，由 hotkeyEnabled 统一控制）
  hotkeys?: HotkeyBinding[];
  hotkeyEnabled?: boolean;

  // 分页（传 total 即启用分页，服务端驱动）
  current?: number;
  pageSize?: number;
  pageSizes?: number[];
  total?: number;
  showPaginationTotal?: boolean;

  // 高度
  /** 固定表体高度（px），对应 a-table scroll.y */
  height?: number;
  /** 横向滚动宽度，对应 a-table scroll.x（固定列时需设置） */
  scrollX?: number | string;
  /** 自适应高度（自动计算 scroll.y 填满视口剩余空间） */
  adaptive?: boolean | AdaptiveConfig;
}

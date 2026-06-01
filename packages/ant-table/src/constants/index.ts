import type { InjectionKey } from 'vue';

import type { AntTableContext } from '../types';

// ──── 自适应高度默认值 ────

export const DEFAULT_ADAPTIVE_OFFSET_TOP = 0;
export const DEFAULT_ADAPTIVE_OFFSET_BOTTOM = 0;

/** 自适应高度时表体最小高度（px） */
export const MIN_ADAPTIVE_BODY_HEIGHT = 100;

/** 测不到表头高度时的兜底值（px） */
export const FALLBACK_HEADER_HEIGHT = 55;

// ──── 列设置持久化 ────

export const COLUMN_SETTING_STORAGE_PREFIX = 'ant-table';

// ──── Provide / Inject ────

export const ANT_TABLE_INJECTION_KEY: InjectionKey<AntTableContext> =
  Symbol('AntTable');

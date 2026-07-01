import type { InjectionKey } from 'vue';
import type { TableEngine } from './engine';
import type { PlusTableColumn } from './types';

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<TableEngine> = Symbol('plus-table');

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';

/** 特殊列类型：由 el-table 原生渲染（勾选框/序号/展开），不进列设置面板、不参与键盘导航 */
export const SPECIAL_COLUMN_TYPES = ['selection', 'index', 'expand'] as const;

export function isSpecialColumn(column: PlusTableColumn): boolean {
  return !!column.type && (SPECIAL_COLUMN_TYPES as readonly string[]).includes(column.type);
}

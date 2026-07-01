import type { InjectionKey } from 'vue';
import type { TableEngine } from './engine';
import type { PlusTableColumn } from './types';

export const PLUS_TABLE_INJECTION_KEY: InjectionKey<TableEngine> = Symbol('plus-table');

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';

/** 由 el-table 原生渲染的特殊列类型（勾选框/序号/展开图标），不接管 header/default slot */
const NATIVE_RENDER_COLUMN_TYPES = ['selection', 'index', 'expand'] as const;

/**
 * 特殊列类型：selection/index/expand 由 el-table 原生渲染；operation（操作列）渲染方式不变
 * （仍走 render/formatter），但同样不进列设置面板、不参与键盘导航与拖拽排序、始终可见。
 */
export const SPECIAL_COLUMN_TYPES = [...NATIVE_RENDER_COLUMN_TYPES, 'operation'] as const;

export function isSpecialColumn(column: PlusTableColumn): boolean {
  return !!column.type && (SPECIAL_COLUMN_TYPES as readonly string[]).includes(column.type);
}

/** 特殊列中由 el-table 原生渲染的子集（selection/index/expand），仅用于渲染分支判断是否接管 header/default slot */
export function isNativeRenderColumn(column: PlusTableColumn): boolean {
  return !!column.type && (NATIVE_RENDER_COLUMN_TYPES as readonly string[]).includes(column.type);
}

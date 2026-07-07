import type { InjectionKey } from 'vue';
import type { TableEngine } from './engine';

/**
 * provide/inject 用 T=any 抹平行类型：engine 内部大量回调（editable/render/dependencies.*）把 T
 * 用在参数位置（逆变），泛型 T 与具体行类型互相赋值会被 TS 判定不安全（"T could be instantiated
 * with a different subtype"）。跨组件共享本就要在某处抹平类型，用 any 而非默认的 RowData，
 * 是因为 RowData=Record<string, any> 的宽松只在最外层生效，套进 RowContext<T> 这类嵌套泛型
 * 参数位置后一样会被判定不安全；子组件（plus-table-cell.ts 等）本来就按 RowData 消费，无损失。
 */
export const PLUS_TABLE_INJECTION_KEY: InjectionKey<TableEngine<any>> =
  Symbol('plus-table');

export const SETTINGS_STORAGE_PREFIX = 'plus-table:settings:';

/** 由 el-table 原生渲染的特殊列类型（勾选框/序号/展开图标），不接管 header/default slot */
const NATIVE_RENDER_COLUMN_TYPES = ['selection', 'index', 'expand'] as const;

/**
 * 特殊列类型：selection/index/expand 由 el-table 原生渲染；operation（操作列）渲染方式不变
 * （仍走 render/formatter），但同样不进列设置面板、不参与键盘导航与拖拽排序、始终可见。
 */
export const SPECIAL_COLUMN_TYPES = [
  ...NATIVE_RENDER_COLUMN_TYPES,
  'operation',
] as const;

/** 只依赖 type 字段，用最小结构类型而非完整 PlusTableColumn<T>，让泛型 columns.ts 调用时不必为 T 传参 */
interface ColumnTypeLike {
  type?: string;
}

export function isSpecialColumn(column: ColumnTypeLike): boolean {
  return (
    !!column.type &&
    (SPECIAL_COLUMN_TYPES as readonly string[]).includes(column.type)
  );
}

/** 特殊列中由 el-table 原生渲染的子集（selection/index/expand），仅用于渲染分支判断是否接管 header/default slot */
export function isNativeRenderColumn(column: ColumnTypeLike): boolean {
  return (
    !!column.type &&
    (NATIVE_RENDER_COLUMN_TYPES as readonly string[]).includes(column.type)
  );
}

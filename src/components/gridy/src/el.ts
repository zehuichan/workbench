import type { GridySize } from './types';

/** Element Plus 控件尺寸：`middle` 对齐 `default` */
export type ElSize = 'default' | 'large' | 'small';

export function toElSize(size: GridySize): ElSize {
  return size === 'middle' ? 'default' : size;
}

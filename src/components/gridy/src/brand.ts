import type { GridyRecord } from './types';

/**
 * 无 rowKey 时的行身份兜底：不可枚举 Symbol 直接打在行对象上。
 * - 不用 WeakMap：model 经 defineModel round-trip 会被 Vue 重新包一层 Proxy，按引用查表落空；
 *   Symbol 属性读写穿透 Proxy 落到原始对象，且不进 Object.keys / JSON.stringify。
 * - 必须不可枚举：否则 `{ ...row }` 会把身份一并复制，复制行与原行撞 key；
 *   不可变更新改走 `transferBrand` 显式搬迁。
 * - uid 用模块级计数：行对象在多个 Gridy 间流转时不撞 `row-0`。
 */
const ROW_ID = Symbol('gridy-row-id');
let uid = 0;

function readBrand(row: unknown): string | undefined {
  return (row as null | { [ROW_ID]?: string })?.[ROW_ID];
}

/** 冻结 / 不可扩展对象无法打标，返回 false */
function writeBrand(row: object, id: string): boolean {
  try {
    Object.defineProperty(row, ROW_ID, { configurable: true, value: id });
    return true;
  } catch {
    return false;
  }
}

/** 强制换新 brand（品牌撞车时给后出现的行自愈） */
export function rebrand(row: object): string | undefined {
  const id = `row-${uid++}`;
  return writeBrand(row, id) ? id : undefined;
}

/** 已有 brand 直接复用，没有则打新标 */
export function brandOf(row: object): string | undefined {
  return readBrand(row) ?? rebrand(row);
}

/** 不可变更新时把原行 brand 搬到新对象 */
export function transferBrand(from: GridyRecord, to: GridyRecord): void {
  const id = readBrand(from);
  if (id) {
    writeBrand(to, id);
  }
}

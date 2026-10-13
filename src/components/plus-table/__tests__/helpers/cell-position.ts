import type { CellPosition } from '../../types';

/** 从 location getter 抽出公开下标，断言时保持 `{ rowIndex, colIndex }` 形状。 */
export function cellPosition(
  location: { rowIndex: number; colIndex: number } | null | undefined,
): CellPosition | null {
  if (!location) return null;
  return { rowIndex: location.rowIndex, colIndex: location.colIndex };
}

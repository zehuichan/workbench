import type { AntTableColumn, RowData } from './column';

// ──── 热键 ────

export interface HotkeyBinding {
  key: string;
  handler: (ctx: HotkeyContext) => void | boolean;
  when?: (ctx: HotkeyContext) => boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  override?: boolean;
}

export interface HotkeyContext {
  event: KeyboardEvent;
  activeRowIndex: number;
  activeColIndex: number;
  row: RowData | null;
  column: AntTableColumn | null;
  tableData: RowData[];
  columns: AntTableColumn[];
  navigate: (rowDelta: number, colDelta: number) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  updateCellValue: (value: any) => void;
}

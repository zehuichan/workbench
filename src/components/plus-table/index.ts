import PlusTable from './table.vue';

export { PlusTable };

export { resolveEditor } from './adapter';
export type {
  ColumnComponent,
  EditorColumnFields,
  EditorTrigger,
  ResolvedEditor,
} from './adapter';
export type {
  CellView,
  EditorBinding,
  EditorSlotProps,
  HeaderSlotProps,
} from './cell';
export { defineColumns } from './column';

export type { SettingItem } from './composables/use-columns';
export type { DependencyState } from './composables/use-dependencies';
export type { DirtyCell } from './composables/use-dirty';
export { useSummaries } from './composables/use-summaries';
export type {
  SummaryColumnOptions,
  SummaryColumns,
  SummaryFormatContext,
  UseSummariesOptions,
  UseSummariesReturn,
} from './composables/use-summaries';
export type {
  AdaptiveConfig,
  CellChangePayload,
  ContextMenuContext,
  ContextMenuItem,
  ContextMenuItemSlotProps,
  HotkeyBinding,
  HotkeyContext,
  PageChangePayload,
  PlusTableEmits,
  PlusTableExpose,
  PlusTableLocalExpose,
  PlusTableProps,
  PlusTableResolvedProps,
  ValidateResult,
} from './table';
export { PLUS_TABLE_INJECTION_KEY, usePlusTable } from './tokens';
export type { PlusTableContext } from './tokens';
export type {
  CellContext,
  CellError,
  CellPosition,
  CellRule,
  ColumnDependencies,
  ColumnNode,
  DependencyApi,
  EditMode,
  PlusTableColumn,
  PlusTableColumnDef,
  PlusTableDataColumn,
  PlusTableSpecialColumn,
  RowContext,
  RowData,
  RowKey,
  SpecialColumnType,
} from './types';
export type { UseTableReturn } from './use-table';
export type { ComponentType } from '@/adapter';

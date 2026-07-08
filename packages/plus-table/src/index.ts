import PlusTable from './table.vue';

export { PlusTable };

export { PLUS_TABLE_INJECTION_KEY } from './tokens';
export { EDITOR_REGISTRY, resolveEditor } from './editors/registry';
export { createStore } from './store/helper';

export type {
  SettingItem,
} from './store/columns';
export type {
  Store,
} from './store';
export type {
  CellPosition,
} from './store/current';
export type {
  DependencyState,
} from './store/dependencies';
export type {
  HistoryApi,
} from './store/history';
export type {
  DirtyApi,
} from './store/dirty';
export type {
  EditorSlotProps,
  HeaderSlotProps,
  EditorBinding,
  CellView,
} from './table-cell/render-helper';
export type {
  BuiltinEditorType,
  EditorAdapter,
  ResolvedEditor,
} from './editors/registry';
export type {
  AdaptiveConfig,
  CellChangePayload,
  CellError,
  CellRule,
  EditMode,
  HotkeyBinding,
  HotkeyContext,
  PageChangePayload,
  PlusTableEmits,
  PlusTableProps,
  RowContext,
  RowData,
  RowKey,
  ValidateResult,
} from './table/defaults';
export type {
  CellContext,
  ColumnDependencies,
  ColumnEditor,
  ColumnNode,
  DependencyApi,
  EditorConfig,
  PlusTableColumn,
  PlusTableColumnDef,
} from './table-column/defaults';

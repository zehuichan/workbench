import PlusTable from './components/plus-table.vue';

export { PlusTable };

export { PLUS_TABLE_INJECTION_KEY } from './constants';
export { EDITOR_REGISTRY, resolveEditor } from './editors/registry';
export { createTableEngine } from './engine';

export type {
  TableEngine,
  TableEngineOptions,
  SettingItem,
  CellPosition,
  DependencyState,
  HistoryApi,
  DirtyApi,
  EditorSlotProps,
  HeaderSlotProps,
  EditorBinding,
  CellView,
} from './engine';
export type {
  BuiltinEditorType,
  EditorAdapter,
  ResolvedEditor,
} from './editors/registry';
export type {
  AdaptiveConfig,
  CellChangePayload,
  CellContext,
  CellError,
  CellRule,
  ColumnDependencies,
  ColumnEditor,
  ColumnNode,
  ColumnSettingConfig,
  DependencyApi,
  EditMode,
  EditorConfig,
  HistoryConfig,
  HotkeyBinding,
  HotkeyContext,
  PageChangePayload,
  PlusTableColumn,
  PlusTableColumnDef,
  PlusTableEmits,
  PlusTableProps,
  RowContext,
  RowData,
  RowKey,
  ValidateOn,
  ValidateResult,
} from './types';

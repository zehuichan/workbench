import PlusTable from './components/plus-table.vue';

export { PlusTable };

export { PLUS_TABLE_INJECTION_KEY } from './constants';
export { EDITOR_REGISTRY, resolveEditor } from './editors/registry';
export { createTableEngine } from './engine';

export type { TableEngine, TableEngineOptions, SettingItem, CellPosition, DependencyState } from './engine';
export type { EditorAdapter, ResolvedEditor } from './editors/registry';
export type {
  AdaptiveConfig,
  BuiltinEditorType,
  CellChangePayload,
  CellError,
  CellRenderParams,
  CellRule,
  ColumnDependencies,
  ColumnEditor,
  ColumnEditorConfig,
  ColumnNode,
  DependencyApi,
  EditMode,
  EditorOption,
  PageChangePayload,
  PlusTableColumn,
  PlusTableEmits,
  PlusTableProps,
  RowData,
  RowKey,
  ValidateOn,
  ValidateResult,
} from './types';

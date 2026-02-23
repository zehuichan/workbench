import { computed, provide, ref, shallowRef, type Ref, type ShallowRef } from 'vue'

import type { CellMeta, ReTableColumn, RowData } from '../types'
import {
  DEFAULT_CELL_META,
  RE_TABLE_INJECTION_KEY,
  type ColumnOpsContext,
  type ReTableContext,
} from '../constants'

/** 集中式状态 + provide，简化主组件为纯组装层 */
export function useStore() {
  const tableWrapperEl = ref<HTMLElement | null>(null)
  const tableRef = ref<Record<string, any> | null>(null)
  const tableBodyEl = ref<HTMLElement | null>(null)
  const activated = ref(false)
  const activeRow = ref(DEFAULT_CELL_META.row)
  const activeCol = ref(DEFAULT_CELL_META.col)
  const isEditing = ref(DEFAULT_CELL_META.editing)
  const contextmenu = ref(DEFAULT_CELL_META.contextmenu)

  const cellMeta = computed<CellMeta>(() => ({
    row: activeRow.value,
    col: activeCol.value,
    activated: activated.value,
    editing: isEditing.value,
    contextmenu: contextmenu.value,
  }))

  const updateCell = (patch: Partial<CellMeta>) => {
    if ('row' in patch && patch.row !== undefined) activeRow.value = patch.row
    if ('col' in patch && patch.col !== undefined) activeCol.value = patch.col
    if ('activated' in patch && patch.activated !== undefined)
      activated.value = patch.activated
    if ('editing' in patch && patch.editing !== undefined)
      isEditing.value = patch.editing
    if ('contextmenu' in patch && patch.contextmenu !== undefined)
      contextmenu.value = patch.contextmenu
  }

  const provideStore = (ctx: {
    tableKey: string
    columns: Ref<ReTableColumn[]>
    visibleColumns: Ref<ReTableColumn[]>
    data: Ref<RowData[]>
    editable: Ref<boolean | 'row' | 'cell' | 'manual'>
    validationErrors: Ref<Map<string, string>>
    columnOps: ColumnOpsContext | null
    cachedData?: ShallowRef<RowData[]>
  }) => {
    provide<ReTableContext>(RE_TABLE_INJECTION_KEY, {
      ...ctx,
      tableEl: tableWrapperEl,
      tableInstance: computed(() => tableRef.value) as Ref<Record<string, any> | null>,
      activated,
      cellMeta,
      cachedData: ctx.cachedData ?? shallowRef<RowData[]>([]),
    })
  }

  return {
    tableWrapperEl,
    tableRef,
    tableBodyEl,
    activated,
    activeRow,
    activeCol,
    isEditing,
    contextmenu,
    cellMeta,
    updateCell,
    provideStore,
  }
}

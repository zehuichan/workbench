<template>
  <div class="re-table-wrapper">
    <div
      v-if="showColumnSetting"
      class="re-table-toolbar"
    >
      <slot name="toolbar" />
      <slot name="column-setting">
        <ReTableColumnSetting />
      </slot>
    </div>
    <div ref="store.tableWrapperEl" class="re-table" v-loading="loading">
      <el-table
      v-bind="$attrs"
      ref="tableRef"
      border
      show-overflow-tooltip
      scrollbar-always-on
      :data="displayData"
      :row-class-name="getRowClassName"
      :cell-class-name="getCellClassName"
      @cell-click="handleCellClick"
    >
      <template #default>
        <slot>
          <ReTableColumn :columns="visibleColumns" :editable="editable" />
        </slot>
      </template>

      <template #append>
        <slot name="append" />
      </template>

      <template #empty>
        <slot name="empty" />
      </template>
    </el-table>
    </div>
    <slot
      v-if="pagination"
      name="footer"
    >
      <ReTableFooter
        :pagination="pagination"
        :total="paginationTotal"
        @update:current-page="emit('update:current-page', $event)"
        @update:page-size="emit('update:page-size', $event)"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, toRef, watch } from 'vue'

import { cloneDeep } from 'es-toolkit'
import { findIndex } from 'es-toolkit/compat'
import { useEventListener } from '@vueuse/core'

import { getEventTargetNode, isBoolean, isFunction } from '@/utils'

import type {
  HotkeyContext,
  ReTableColumn as ReTableColumnType,
  ReTableProps,
  RowData,
} from './types'
import { DEFAULT_CELL_META, SPECIAL_COLUMN_TYPES } from './constants'
import {
  createBuiltinHotkeys,
  isPrintableKey,
  useColumnOptions,
  useDirtyTracking,
  useEditable,
  useEditHistory,
  useHotkey,
  useNavigation,
  useRowOptions,
  useStore,
  useValidation,
} from './composables'
import ReTableColumn from './re-table-column.vue'
import ReTableColumnSetting from './re-table-column-setting.vue'
import ReTableFooter from './re-table-footer.vue'

import './styles/index.scss'

const props = withDefaults(defineProps<ReTableProps>(), {
  columns: () => [],
  data: () => [],
  loading: false,
  editable: false,
  hotkeyEnabled: true,
  validateTrigger: 'manual',
  validateOnCellExit: false,
  columnSetting: false,
  columnSettingStorage: 'local',
  pagination: undefined,
})

const emit = defineEmits<{
  'cell-edit-start': [payload: { row: any; column: ReTableColumnType; rowIndex: number; colIndex: number }]
  'cell-edit-end': [payload: { row: any; column: ReTableColumnType; value: any; oldValue: any; rowIndex: number; colIndex: number }]
  'cell-edit-cancel': [payload: { row: any; column: ReTableColumnType; rowIndex: number; colIndex: number }]
  'cell-value-change': [payload: { row: any; column: ReTableColumnType; prop: string; value: any; oldValue: any; rowIndex: number; colIndex: number }]
  'row-edit-start': [payload: { row: any; rowIndex: number }]
  'row-edit-end': [payload: { row: any; rowIndex: number }]
  'scroll': [event: Event]
  'update:current-page': [value: number]
  'update:page-size': [value: number]
}>()

const store = useStore()
const {
  tableRef,
  tableBodyEl,
  activated,
  activeRow,
  activeCol,
  isEditing,
  cellMeta,
  updateCell,
  provideStore,
} = store

// ──── 脏数据追踪（仅 editable 时启用）────
const dataRef = computed(() => props.data ?? [])
const cachedData = shallowRef<RowData[]>([])

const dirtyTracking =
  props.editable !== false
    ? useDirtyTracking({
        data: dataRef as any,
        cachedData,
      })
    : null

const dirtyCells = dirtyTracking?.dirtyCells ?? shallowRef(new Set<string>())
const markDirty = dirtyTracking?.markDirty ?? (() => {})
const resetDirtyTracking = dirtyTracking?.resetTracking ?? (() => {})
const getDirtyCells = dirtyTracking?.getDirtyCells ?? (() => new Set<string>())

// 数据源变化时重置脏追踪；editable 时初始化 cachedData
watch(
  [dataRef, () => props.editable],
  () => {
    if (props.editable === false) return
    dirtyTracking?.resetTracking()
  },
  { immediate: true, deep: false },
)

const useColumnSetting = !!props.columnSetting && !!props.tableKey
const showColumnSetting = useColumnSetting

const columnsRef = shallowRef<ReTableColumnType[]>([])

if (useColumnSetting) {
  columnsRef.value = [...props.columns]
  watch(
    () => props.columns,
    (cols) => {
      columnsRef.value = [...cols]
    },
    { immediate: true, deep: true },
  )
}

const columnOptions = useColumnSetting
  ? useColumnOptions({
      initialColumns: columnsRef,
      tableKey: props.tableKey!,
      storage: props.columnSettingStorage ?? 'local',
    })
  : null

// 5.2.4 非 columnSetting 时用 shallowRef，避免 computed 每次新建数组
const visibleColumnsFromProps = shallowRef<ReTableColumnType[]>([])
const updateVisibleColumnsFromProps = () => {
  visibleColumnsFromProps.value = props.columns.filter((col) => {
    if (isBoolean(col.hidden)) return !col.hidden
    if (isFunction(col.hidden)) return !col.hidden(col)
    return true
  })
}
watch(() => props.columns, updateVisibleColumnsFromProps, {
  immediate: true,
  deep: true,
})

const visibleColumns =
  useColumnSetting && columnOptions ? columnOptions.visibleColumns : visibleColumnsFromProps

// 5.5 分页：客户端分页时切片数据，total 优先用 pagination.total（服务端）否则用 data.length
const paginationOffset = computed(() => {
  if (!props.pagination) return 0
  const page = props.pagination.currentPage ?? 1
  const size = props.pagination.pageSize ?? 10
  return (page - 1) * size
})

const displayData = computed(() => {
  if (!props.pagination) return props.data ?? []
  const size = props.pagination.pageSize ?? 10
  const start = paginationOffset.value
  const arr = props.data ?? []
  return arr.slice(start, start + size)
})

const paginationTotal = computed(() => {
  if (!props.pagination) return 0
  return props.pagination.total ?? (props.data?.length ?? 0)
})

const getRowClassName = ({ rowIndex }: { rowIndex: number }) =>
  `re-table-row-${rowIndex}`

const getCellClassName = ({
  row,
  rowIndex,
  columnIndex,
}: {
  row: any
  rowIndex: number
  columnIndex: number
}) => {
  const globalRowIndex = paginationOffset.value + rowIndex
  const classes = [`re-table-cell-${rowIndex}-${columnIndex}`]
  if (rowIndex === activeRow.value && columnIndex === activeCol.value) {
    classes.push('re-table-cell--active')
  }

  const column = visibleColumns.value[columnIndex]
  if (column?.prop && validation.errors.value.has(`${globalRowIndex}-${column.prop}`)) {
    classes.push('re-table-cell--error')
  }

  const cellClass = column?.cellClassName
  if (cellClass) {
    const scope = { row, column, rowIndex, colIndex: columnIndex }
    const cls = isFunction(cellClass) ? cellClass(scope) : cellClass
    if (cls) classes.push(cls)
  }

  // 脏单元格标记（右上角三角）
  if (column?.prop && dirtyCells.value.has(`${globalRowIndex}:${column.prop}`)) {
    classes.push('re-table-cell--dirty')
  }

  return classes.join(' ')
}

const getRowIdentity = (row: any) => {
  if (!props.rowKey) return row
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return row?.[props.rowKey]
}

const findRowIndex = (row: any) => {
  if (!props.data?.length) return -1
  if (props.rowKey) {
    const targetKey = getRowIdentity(row)
    return findIndex(props.data, (item) => getRowIdentity(item) === targetKey)
  }
  return findIndex(props.data, (item) => item === row)
}

/** 分页时：行索引为 displayData 内局部索引，需转为 props.data 内全局索引 */
const toGlobalRowIndex = (localRow: number) => paginationOffset.value + localRow

const isSpecialColumn = (type?: string) =>
  SPECIAL_COLUMN_TYPES.includes(type as any)

// ──── 校验系统 ────

const validation = useValidation({
  data: computed(() => props.data),
  columns: visibleColumns,
  tableRules: computed(() => props.rules),
  tableEl: computed(() => tableRef.value?.$el ?? null),
  trigger: computed(() => props.validateTrigger ?? 'manual'),
  validateOnCellExit: computed(() => props.validateOnCellExit ?? false),
})

// ──── 导航系统 ────

const { navigate, focusCell } = useNavigation({
  data: displayData,
  columns: visibleColumns,
  cellMeta,
  tableEl: computed(() => tableRef.value?.$el ?? null),
})

const doNavigate = (rowDelta: number, colDelta: number) => {
  // 编辑态下导航前先确认当前编辑，触发 cell-value-change 以记录历史
  if (isEditing.value) {
    confirmEdit()
  }
  if (props.validateOnCellExit) {
    const row = activeRow.value
    const col = activeCol.value
    if (row >= 0 && col >= 0) {
      const colDef = visibleColumns.value[col]
      if (colDef?.prop) {
        validation.validateField(toGlobalRowIndex(row), colDef.prop).catch(() => {})
      }
    }
  }
  const target = navigate(rowDelta, colDelta)
  if (target.row < 0) return
  updateCell({ ...target, editing: false })
  focusCell(true)
}

// ──── 编辑历史 ────

const editHistory = useEditHistory({ maxHistory: 50 })

// 包装 emit：cell-value-change 时记录历史 + validateTrigger: 'change' + 脏追踪
const wrappedEmit: typeof emit = ((event: string, ...args: any[]) => {
  if (event === 'cell-value-change') {
    const payload = args[0] as any
    const globalRowIndex = toGlobalRowIndex(payload.rowIndex ?? 0)
    const payloadWithGlobal = { ...payload, rowIndex: globalRowIndex }
    if (props.editable !== false) {
      editHistory.record({
        rowIndex: globalRowIndex,
        colIndex: payload.colIndex,
        prop: payload.prop,
        oldValue: payload.oldValue,
        newValue: payload.value,
        timestamp: Date.now(),
      })
      if (payload.prop) markDirty(globalRowIndex, payload.prop)
    }
    if (props.validateTrigger === 'change' && payload.rowIndex != null && payload.prop) {
      validation.validateFieldsAffectedByChange(globalRowIndex, payload.prop).catch(() => {})
    }
    ;(emit as any)(event, payloadWithGlobal)
  } else {
    ;(emit as any)(event, ...args)
  }
}) as any

// ──── 编辑系统 ────

const { startEdit, confirmEdit, cancelEdit } = useEditable({
  editableMode: computed(() => props.editable),
  activeRow,
  activeCol,
  isEditing,
  data: displayData,
  columns: visibleColumns,
  emit: wrappedEmit as any,
  beforeCellEdit: (payload) => props.beforeCellEdit?.(payload),
})

// ──── 行操作 ────

const rowOptions = useRowOptions({
  data: computed(() => props.data),
  columns: visibleColumns,
  rowKey: props.rowKey as any,
})

// ──── 热键系统 ────

const hotkeyContextFactory = (): HotkeyContext => {
  const meta = cellMeta.value
  const row = meta.row >= 0 ? displayData.value[meta.row] ?? null : null
  const column = meta.col >= 0 ? visibleColumns.value[meta.col] ?? null : null

  return {
    event: null as any,
    cellMeta: meta,
    row,
    column,
    tableData: displayData.value,
    columns: visibleColumns.value,
    navigate: doNavigate,
    startEdit: () => {
      startEdit()
      focusCell(false)
    },
    cancelEdit: () => {
      cancelEdit()
      ;(document.activeElement as HTMLElement)?.blur()
    },
    updateCellValue: (value: any) => {
      if (row && column?.prop) {
        const oldValue = row[column.prop]
        row[column.prop] = value

        if (value !== oldValue) {
          wrappedEmit('cell-value-change', {
            row,
            column,
            prop: column.prop,
            value,
            oldValue,
            rowIndex: meta.row,
            colIndex: meta.col,
          })
        }
      }
    },
  }
}

const builtinHotkeys = createBuiltinHotkeys()

// Ctrl+Z / Ctrl+Shift+Z 集成
builtinHotkeys.push(
  {
    key: 'Ctrl+Z',
    handler: () => {
      editHistory.undo(props.data ?? [], visibleColumns.value)
    },
    when: (ctx) => ctx.cellMeta.activated,
  },
  {
    key: 'Ctrl+Shift+Z',
    handler: () => {
      editHistory.redo(props.data ?? [], visibleColumns.value)
    },
    when: (ctx) => ctx.cellMeta.activated,
  },
)

useHotkey({
  enabled: toRef(() => props.hotkeyEnabled),
  activated,
  contextFactory: hotkeyContextFactory,
  builtinBindings: builtinHotkeys,
  customBindings: computed(() => props.hotkeys ?? []),
})

// 字母/数字直接输入触发编辑模式
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (!props.hotkeyEnabled || !activated.value) return
  if (isEditing.value) return
  if (props.editable === false) return
  if (event.ctrlKey || event.altKey || event.metaKey) return

  if (isPrintableKey(event.key)) {
    const rowIdx = activeRow.value
    const colIdx = activeCol.value
    if (rowIdx < 0 || colIdx < 0) return

    const row = displayData.value[rowIdx]
    const column = visibleColumns.value[colIdx]
    if (!row || !column?.prop) return
    if (resolveColumnFlag(column.disabled, row) || resolveColumnFlag(column.readonly, row)) return

    row[column.prop] = ''
    startEdit()
    focusCell(false)
  }
})

// ──── 单元格点击 ────

const resolveColumnFlag = (
  flag: boolean | ((row: any) => boolean) | undefined,
  row: any,
): boolean => {
  if (isFunction(flag)) return flag(row)
  return flag === true
}

const handleCellClick = (
  row: any,
  column: { type?: string; getColumnIndex: () => number },
  _cell: unknown,
  event: MouseEvent,
) => {
  if (isSpecialColumn(column.type)) return

  const globalRowIndex = findRowIndex(row)
  const localRowIndex = globalRowIndex >= 0 ? globalRowIndex - paginationOffset.value : -1
  const rowIndex = localRowIndex >= 0 && localRowIndex < displayData.value.length ? localRowIndex : -1
  const columnIndex = column.getColumnIndex()
  const curRow = activeRow.value
  const curCol = activeCol.value
  const editing = isEditing.value
  const colConfig = visibleColumns.value[columnIndex]

  const isSameCell = curRow === rowIndex && curCol === columnIndex
  const isSameRow = curRow === rowIndex

  if (isSameCell && (props.editable === 'cell' || props.editable === 'manual')) return
  if (isSameRow && editing && props.editable === 'row') return

  if (curRow !== rowIndex || curCol !== columnIndex) {
    if (editing) confirmEdit()
    if (props.validateOnCellExit) {
      const prevCol = visibleColumns.value[curCol]
      if (prevCol?.prop && curRow >= 0 && curCol >= 0) {
        validation.validateField(toGlobalRowIndex(curRow), prevCol.prop).catch(() => {})
      }
    }
  }

  const cellDisabled = colConfig && resolveColumnFlag(colConfig.disabled, row)
  const cellReadonly = colConfig && resolveColumnFlag(colConfig.readonly, row)

  let shouldEdit = false
  if (props.editable === true) shouldEdit = true
  else if (cellDisabled || cellReadonly) shouldEdit = false
  else if (props.editable === 'row') shouldEdit = true
  else if (props.editable === 'cell') shouldEdit = true

  if (shouldEdit && colConfig && props.beforeCellEdit) {
    const allowed = props.beforeCellEdit({ row, column: colConfig, rowIndex, colIndex: columnIndex })
    if (allowed === false) shouldEdit = false
  }

  updateCell({
    row: rowIndex,
    col: columnIndex,
    activated: true,
    editing: shouldEdit,
    contextmenu: event.button === 2,
  })

  if (shouldEdit) {
    startEdit(rowIndex, columnIndex)
    focusCell(false)
  }
}

// ──── 聚焦/失焦检测 ────

/** 点击在 Select/DatePicker 等 teleport 出的浮层内时，不视为点击表格外 */
const isInsidePopper = (target: Element | null): boolean =>
  !!target?.closest?.('.el-select-dropdown, .el-picker-panel, .el-popper')

useEventListener(window, 'mousedown', (event: MouseEvent) => {
  const el = tableRef.value?.$el
  if (!el) return
  if (isInsidePopper(event.target as Element)) return
  const { flag } = getEventTargetNode(event, el as Element)
  activated.value = flag
})

// 5.3.3 表格体滚动使用 passive: true，提升滚动流畅度
watch(
  () => tableRef.value?.$el,
  (el) => {
    nextTick(() => {
      tableBodyEl.value = el
        ? (el.querySelector('.el-table__body-wrapper') as HTMLElement | null)
        : null
    })
  },
  { immediate: true, flush: 'post' },
)
useEventListener(
  tableBodyEl,
  'scroll',
  (e) => emit('scroll', e),
  { passive: true },
)

watch(activated, (value) => {
  if (!value) {
    if (cellMeta.value.editing) confirmEdit()
    updateCell({ ...DEFAULT_CELL_META })
  }
})

// ──── Provide ────

provideStore({
  tableKey: props.tableKey ?? '',
  columns: computed(() => props.columns),
  visibleColumns,
  data: displayData,
  editable: computed(() => props.editable),
  validationErrors: validation.errors,
  cachedData,
  columnOptions: columnOptions
    ? {
        visibleColumns: columnOptions.visibleColumns,
        hiddenColumns: columnOptions.hiddenColumns,
        toggleColumn: columnOptions.toggleColumn,
        reorderColumns: columnOptions.reorderColumns,
        resetColumns: columnOptions.resetColumns,
        getOrderedColumnsWithProp: columnOptions.getOrderedColumnsWithProp,
        isColumnHidden: columnOptions.isColumnHidden,
      }
    : null,
})

// ──── Expose ────

const getElTable = () => tableRef.value
defineExpose({
  getElTable,

  // 编辑
  startEdit,
  confirmEdit,
  cancelEdit,

  // 编辑历史（暴露为 ref 以便父组件响应式追踪）
  undo: () => editHistory.undo(props.data ?? [], visibleColumns.value),
  redo: () => editHistory.redo(props.data ?? [], visibleColumns.value),
  clearHistory: editHistory.clear,
  canUndo: computed(() => editHistory.canUndo()),
  canRedo: computed(() => editHistory.canRedo()),

  // 行操作
  insertRow: rowOptions.insertRow,
  deleteRow: rowOptions.deleteRow,
  moveRow: rowOptions.moveRow,
  duplicateRow: rowOptions.duplicateRow,
  getModifiedRows: rowOptions.getModifiedRows,

  // 校验
  validate: validation.validate,
  validateField: validation.validateField,
  clearValidation: validation.clearValidation,
  scrollToFirstError: validation.scrollToFirstError,

  // 脏数据
  dirtyCells,
  getDirtyCells,
  resetDirtyTracking,

  // 列操作
  addColumn: columnOptions?.addColumn ?? (() => {}),
  removeColumn: columnOptions?.removeColumn ?? (() => {}),
  updateColumn: columnOptions?.updateColumn ?? (() => {}),
  resetColumns: columnOptions?.resetColumns ?? (() => {}),

  // el-table 原生方法透传
  clearSelection: () => getElTable()?.clearSelection(),
  getSelectionRows: () => getElTable()?.getSelectionRows(),
  toggleRowSelection: (...args: any[]) => getElTable()?.toggleRowSelection(...args),
  toggleAllSelection: () => getElTable()?.toggleAllSelection(),
  toggleRowExpansion: (...args: any[]) => getElTable()?.toggleRowExpansion(...args),
  setCurrentRow: (...args: any[]) => getElTable()?.setCurrentRow(...args),
  clearSort: () => getElTable()?.clearSort(),
  clearFilter: (...args: any[]) => getElTable()?.clearFilter(...args),
  doLayout: () => getElTable()?.doLayout(),
  sort: (...args: any[]) => getElTable()?.sort(...args),
  scrollTo: (...args: any[]) => getElTable()?.scrollTo(...args),
  setScrollTop: (...args: any[]) => getElTable()?.setScrollTop(...args),
  setScrollLeft: (...args: any[]) => getElTable()?.setScrollLeft(...args),
})
</script>

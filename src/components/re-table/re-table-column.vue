<template>
  <template v-for="(column, index) in columns" :key="getColumnKey(column, index)">
    <el-table-column
      v-if="isSpecialColumn(column.type)"
      v-bind="column"
    />

    <el-table-column v-else v-bind="getColumnBindings(column)">
      <template #header="scope">
        <slot :name="`header-${column.prop}`" v-bind="scope">
          <component
            v-if="column.renderHeader"
            :is="column.renderHeader(column)"
          />
          <template v-else>
            <span v-if="column.required" class="re-table-header--required">
              {{ column.label }}
            </span>
            <el-tooltip
              v-else-if="column.tooltip"
              :content="column.tooltip"
              placement="top"
            >
              <span>
                {{ column.label }}
                <el-icon :size="14" style="vertical-align: -2px; margin-left: 2px">
                  <QuestionFilled />
                </el-icon>
              </span>
            </el-tooltip>
            <span v-else>{{ column.label }}</span>
          </template>
        </slot>
      </template>

      <template #default="scope">
        <!-- 5.2.3 仅当前激活的编辑单元格挂载 component，其余纯文本 span 减少组件实例 -->
        <template v-if="isActiveEditingCell(scope.$index, index, column)">
          <!-- 编辑态 -->
          <el-tooltip
            v-if="column.prop && getCellError(scope.$index, column.prop)"
            :content="getCellError(scope.$index, column.prop)"
            placement="top"
            :popper-options="{ strategy: 'fixed' }"
          >
            <div class="re-table-cell-content re-table-cell-content--with-tooltip">
              <slot :name="`editor-${column.prop}`" v-bind="scope">
                <component
                  v-if="column.renderEditor"
                  :is="column.renderEditor({
                    row: scope.row,
                    column,
                    rowIndex: scope.$index,
                    colIndex: index,
                  })"
                />
                <component
                  v-else-if="column.component"
                  :is="resolveComponent(column.component)"
                  v-model="scope.row[column.prop!]"
                  v-bind="resolveComponentProps(column, scope.row)"
                >
                  <template
                    v-for="(slotFn, slotName) in (column.componentSlots || {})"
                    :key="slotName"
                    #[slotName]
                  >
                    <component
                      :is="slotFn({
                        row: scope.row,
                        column,
                        rowIndex: scope.$index,
                        colIndex: index,
                      })"
                    />
                  </template>
                </component>
              </slot>
            </div>
          </el-tooltip>
          <template v-else>
            <slot :name="`editor-${column.prop}`" v-bind="scope">
              <component
                v-if="column.renderEditor"
                :is="column.renderEditor({
                  row: scope.row,
                  column,
                  rowIndex: scope.$index,
                  colIndex: index,
                })"
              />
              <component
                v-else-if="column.component"
                :is="resolveComponent(column.component)"
                v-model="scope.row[column.prop!]"
                v-bind="resolveComponentProps(column, scope.row)"
              >
                <template
                  v-for="(slotFn, slotName) in (column.componentSlots || {})"
                  :key="slotName"
                  #[slotName]
                >
                  <component
                    :is="slotFn({
                      row: scope.row,
                      column,
                      rowIndex: scope.$index,
                      colIndex: index,
                    })"
                  />
                </template>
              </component>
            </slot>
          </template>
        </template>

        <!-- 展示态 -->
        <template v-else>
          <el-tooltip
            v-if="column.prop && getCellError(scope.$index, column.prop)"
            :content="getCellError(scope.$index, column.prop)"
            placement="top"
            :popper-options="{ strategy: 'fixed' }"
          >
            <div class="re-table-cell-content re-table-cell-content--with-tooltip">
              <slot
                v-if="$slots[`column-${column.prop}`]"
                :name="`column-${column.prop}`"
                v-bind="scope"
              />
              <component
                v-else-if="column.renderCell"
                :is="column.renderCell({
                  row: scope.row,
                  column,
                  rowIndex: scope.$index,
                  colIndex: index,
                })"
              />
              <span v-else>{{ formatCellText(scope.row, column, scope.$index) }}</span>
            </div>
          </el-tooltip>
          <template v-else>
            <slot
              v-if="$slots[`column-${column.prop}`]"
              :name="`column-${column.prop}`"
              v-bind="scope"
            />
            <component
              v-else-if="column.renderCell"
              :is="column.renderCell({
                row: scope.row,
                column,
                rowIndex: scope.$index,
                colIndex: index,
              })"
            />
            <span v-else>{{ formatCellText(scope.row, column, scope.$index) }}</span>
          </template>
        </template>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { inject, type Component } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

import { globalShareState } from '@/adapter/component'
import { isFunction, isString } from '@/utils'

import type { ReTableColumn } from './types'
import { RE_TABLE_INJECTION_KEY, SPECIAL_COLUMN_TYPES } from './constants'

const props = withDefaults(
  defineProps<{
    columns?: ReTableColumn[]
    editable?: boolean | string
  }>(),
  {
    columns: () => [],
    editable: false,
  },
)

const tableCtx = inject(RE_TABLE_INJECTION_KEY, null)
const registeredComponents = globalShareState.getComponents()

const getCellError = (rowIndex: number, prop: string): string | undefined =>
  tableCtx?.validationErrors.value.get(`${rowIndex}-${prop}`)

const getColumnKey = (column: ReTableColumn, index: number) =>
  column.prop ?? column.type ?? index

const isSpecialColumn = (type?: string) =>
  SPECIAL_COLUMN_TYPES.includes(type as any)

const getColumnBindings = (column: ReTableColumn) => {
  const {
    component: _component,
    componentProps: _componentProps,
    componentSlots: _componentSlots,
    renderHeader: _renderHeader,
    renderCell: _renderCell,
    renderEditor: _renderEditor,
    editable: _editable,
    hidden: _hidden,
    required: _required,
    rules: _rules,
    tooltip: _tooltip,
    cellClassName: _cellClassName,
    disabled: _disabled,
    readonly: _readonly,
    ...rest
  } = column
  return rest
}

const resolveComponent = (
  component?: string | Component,
): Component | undefined => {
  if (!component) return undefined
  const resolved = isString(component)
    ? registeredComponents?.[component]
    : component
  if (!resolved) {
    console.warn(`[ReTable] Component "${component}" is not registered`)
  }
  return resolved as Component
}

const resolveColumnFlag = (
  flag: boolean | ((row: any) => boolean) | undefined,
  row: any,
): boolean => {
  if (isFunction(flag)) return flag(row)
  return flag === true
}

const resolveComponentProps = (column: ReTableColumn, row: any) => {
  const base = isFunction(column.componentProps)
    ? column.componentProps(row, column)
    : column.componentProps ?? {}

  const extra: Record<string, any> = {}
  if (resolveColumnFlag(column.disabled, row)) extra.disabled = true
  if (resolveColumnFlag(column.readonly, row)) extra.readonly = true

  return Object.keys(extra).length > 0 ? { ...base, ...extra } : base
}

const formatCellText = (row: any, column: ReTableColumn, rowIndex: number) => {
  const value = column.prop ? row?.[column.prop] : undefined
  if (isFunction(column.formatter)) {
    return column.formatter(row, column, value, rowIndex)
  }
  return value
}

/** 5.2.3 全部模式：所有可编辑列显示 component；行模式：当前行所有可编辑列；单元格/手动：仅当前激活 */
const isActiveEditingCell = (
  rowIndex: number,
  columnIndex: number,
  column: ReTableColumn,
): boolean => {
  const meta = tableCtx?.cellMeta.value
  if (!meta) return false

  // 全部模式：所有非特殊列且非 column.editable=false 的单元格显示编辑器
  if (props.editable === true) {
    if (!column.prop || isSpecialColumn(column.type)) return false
    if (column.editable === false) return false
    if (isFunction(column.editable)) {
      const row = tableCtx?.data.value?.[rowIndex]
      if (row && !column.editable(row)) return false
    }
    return true
  }

  // 行模式：当前激活行的所有可编辑列显示编辑器
  if (props.editable === 'row' && meta.editing) {
    if (meta.row !== rowIndex) return false
    if (!column.prop || isSpecialColumn(column.type)) return false
    if (column.editable === false) return false
    if (isFunction(column.editable)) {
      const row = tableCtx?.data.value?.[rowIndex]
      if (row && !column.editable(row)) return false
    }
    return true
  }

  // 单元格/手动模式：仅当前激活的编辑单元格
  return !!(
    meta.row === rowIndex &&
    meta.col === columnIndex &&
    meta.editing === true
  )
}
</script>

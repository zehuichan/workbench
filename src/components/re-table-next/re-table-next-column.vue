<template>
  <template v-for="(column, index) in columns" :key="getColumnKey(column, index)">
    <!-- 特殊列：selection / index / expand -->
    <el-table-column
      v-if="isSpecialColumn(column.type)"
      v-bind="column"
    />

    <!-- 多级表头 -->
    <el-table-column
      v-else-if="column.children?.length"
      v-bind="getColumnBindings(column)"
    >
      <template #header="scope">
        <slot :name="`header-${column.prop ?? index}`" v-bind="scope">
          <component
            v-if="column.renderHeader"
            :is="renderHeaderFn(column)"
          />
          <span v-else>{{ column.label }}</span>
        </slot>
      </template>

      <!-- 递归渲染子列 -->
      <ReTableNextColumn :columns="column.children" />
    </el-table-column>

    <!-- 普通列 -->
    <el-table-column v-else v-bind="getColumnBindings(column)">
      <template #header="scope">
        <slot :name="`header-${column.prop}`" v-bind="scope">
          <component
            v-if="column.renderHeader"
            :is="renderHeaderFn(column)"
          />
          <span v-else>{{ column.label }}</span>
        </slot>
      </template>

      <template #default="scope">
        <!-- 插槽优先级最高 -->
        <slot
          v-if="column.prop && $slots[`cell-${column.prop}`]"
          :name="`cell-${column.prop}`"
          v-bind="{ ...scope, column }"
        />
        <!-- render 函数 -->
        <component
          v-else-if="column.render"
          :is="column.render({
            row: scope.row,
            column,
            value: getCellValueFn(scope.row, column),
            rowIndex: scope.$index,
            colIndex: index,
          })"
        />
        <!-- formatter -->
        <span v-else>{{ formatCellText(scope.row, column, scope.$index) }}</span>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { isFunction } from '@/utils'

import type { ReTableNextColumn } from './types'
import { SPECIAL_COLUMN_TYPES } from './constants'
import { getCellValue } from './renderers/cell-renderer'
import { renderHeader } from './renderers/header-renderer'

defineOptions({ name: 'ReTableNextColumn' })

defineProps<{
  columns?: ReTableNextColumn[]
}>()

const renderHeaderFn = renderHeader
const getCellValueFn = getCellValue

const getColumnKey = (column: ReTableNextColumn, index: number) =>
  column.key ?? column.prop ?? column.type ?? index

const isSpecialColumn = (type?: string) =>
  SPECIAL_COLUMN_TYPES.includes(type as any)

/**
 * 过滤掉自定义扩展属性，只保留 el-table-column 可接受的 props
 */
const getColumnBindings = (column: ReTableNextColumn) => {
  const {
    // 过滤自定义属性
    key: _key,
    render: _render,
    renderHeader: _renderHeader,
    formatter: _formatter,
    editable: _editable,
    component: _component,
    componentProps: _componentProps,
    hidden: _hidden,
    rules: _rules,
    children: _children,
    ellipsis,
    ...rest
  } = column

  // ellipsis 映射为 el-table-column 的 show-overflow-tooltip
  if (ellipsis != null) {
    rest.showOverflowTooltip = ellipsis
  }

  return rest
}

const formatCellText = (row: any, column: ReTableNextColumn, rowIndex: number) => {
  const value = column.prop ? row?.[column.prop] : undefined
  if (isFunction(column.formatter)) {
    return column.formatter(value, row, rowIndex)
  }
  return value == null ? '' : value
}
</script>

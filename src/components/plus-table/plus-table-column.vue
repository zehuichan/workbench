<template>
  <template
    v-for="(column, index) in columns"
    :key="getColumnKey(column, index)"
  >
    <el-table-column
      v-if="IGNORE_COLUMN_FLAG.includes(column.type)"
      v-bind="column"
    />

    <el-table-column v-else v-bind="column">
      <template #header="scope">
        <slot :name="`header-${column.prop}`" v-bind="scope" />
      </template>

      <template #default="scope">
        <el-form
          v-if="hasEditable(scope.$index, index, column)"
          :model="scope.row"
          :rules="rules"
          :ref="
            (instance) => changeInstance(instance, scope.$index, index, column)
          "
          :show-message="false"
        >
          <el-form-item :prop="column.prop">
            <slot :name="`editor-${column.prop}`" v-bind="scope || {}">
              <component
                :is="
                  h(
                    fieldComponent(column.component),
                    column.componentProps || {},
                  )
                "
                v-model="scope.row[column.prop]"
              />
            </slot>
          </el-form-item>
        </el-form>

        <slot
          v-else-if="$slots[column.prop]"
          :name="column.prop"
          v-bind="scope || {}"
        />

        <template v-else>
          {{ getCellText(scope.row, column, scope.$index) }}
        </template>
      </template>
    </el-table-column>
  </template>
</template>

<script setup lang="ts">
import { inject, h, type Component, type VNode } from 'vue'

import { set } from 'es-toolkit/compat'

import { globalShareState } from '@/adapter/component'
import { isString, isFunction } from '@/utils'

import {
  IGNORE_COLUMN_FLAG,
  PLUS_TABLE_INJECTION_KEY,
  PLUS_TABLE_FORM_INJECTION_KEY,
  type CellMeta
} from './tokens'

const props = withDefaults(
  defineProps<{
    columns?: any[]
    rules?: Record<string, any>
    editable?: boolean | string | object
  }>(),
  {
    columns: () => [],
    editable: false,
  },
)

const tableRef = inject(PLUS_TABLE_INJECTION_KEY, null)
const formRefs = inject(PLUS_TABLE_FORM_INJECTION_KEY, null)

const components = globalShareState.getComponents()

const getColumnKey = (column: any, index: number) => {
  return column?.prop ?? column?.type ?? index
}

const fieldComponent = (component: string | Component): Component | undefined => {
  const finalComponent = isString(component)
    ? components?.[component]
    : component
  if (!finalComponent) {
    // 组件未注册
    console.warn(`Component ${component} is not registered`)
  }
  return finalComponent as Component
}

const getCellText = (row: any, column: any, rowIndex: number) => {
  const prop = column?.prop
  const value = prop ? row?.[prop] : undefined

  if (isFunction(column?.formatter)) {
    return column.formatter(row, column, value, rowIndex)
  }

  return value
}

/**
 * @description 需求1：忽略 selection、index 等特殊列
 * @description 需求2：props.editable = true 时，表格整体可编辑
 * @description 需求3：props.editable = 'row' 时，行编辑
 * @description 需求5：props.editable = 'cell' 时，单元格编辑
 * @description 需求6：props.editable = 'manual' 时，手动单元格编辑
 * @description todo需求7：如果单元格有校验错误，自动开启编辑模式（用于显示错误样式）
 */
const hasEditable = (rowIndex: number, columnIndex: number, column: any) => {
  if (IGNORE_COLUMN_FLAG.includes(column.type)) {
    return false
  }

  const cellMeta = tableRef?.cellMeta

  if (column.editable === true) {
    return true
  }
  if (column.editable === false) {
    return false
  }

  if (props.editable === true) {
    return true
  }

  if (isString(props.editable)) {
    if (props.editable === 'row') {
      return cellMeta?.row === rowIndex && cellMeta?.editable
    }
    if (props.editable === 'cell' || props.editable === 'manual') {
      return (
        cellMeta?.row === rowIndex &&
        cellMeta?.col === columnIndex &&
        cellMeta?.editable
      )
    }
  }

  return false
}

const changeInstance = (instance: any, rowIndex: number, columnIndex: number, column: any) => {
  const rules = props.rules
  const field = column.prop
  if (field && rules && rules[field] && formRefs && formRefs.value) {
    set(formRefs.value, [rowIndex, columnIndex], instance)
  }
}
</script>

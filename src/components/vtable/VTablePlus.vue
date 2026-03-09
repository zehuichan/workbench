<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import { ListTable } from '@visactor/vue-vtable'

import { useVTableAdaptive, useVTableAdapter } from './composables'
import type { VTablePlusColumn, VTablePlusProps } from './types'

import './styles/index.scss'

// ──── Props ────

const props = withDefaults(defineProps<VTablePlusProps>(), {
  columns: () => [],
  data: () => [],
  width: 800,
  height: 500,
  adaptive: false,
})

const emit = defineEmits<{
  clickCell: [event: unknown]
  dblClickCell: [event: unknown]
  keyDown: [event: unknown]
}>()

// ──── 适配层：columns + data → option + records ────

const columnsRef = computed(() => props.columns as VTablePlusColumn[])
const dataRef = computed(() => props.data ?? [])

const { tableOption: adapterOption, records: adapterRecords } = useVTableAdapter({
  columns: columnsRef,
  data: dataRef,
})

// 当 columns 和 data 有内容时使用 adapter，否则使用兜底数据（兼容阶段 0）
const useAdapter = computed(
  () =>
    columnsRef.value.length > 0 &&
    columnsRef.value.some((c) => c.prop) &&
    dataRef.value.length >= 0,
)

const fallbackOption = {
  header: [
    { field: '0', caption: '序号' },
    { field: '1', caption: '姓名' },
    { field: '2', caption: '年龄' },
    { field: '3', caption: '性别' },
    { field: '4', caption: '爱好' },
  ],
}

const fallbackRecords = Array.from({ length: 1000 }, (_, i) => [
  i + 1,
  `Name${i + 1}`,
  18 + (i % 50),
  ['男', '女'][i % 2] as string,
  '爱好',
])

const tableOption = computed(() =>
  useAdapter.value ? adapterOption.value : fallbackOption,
)
const tableRecords = computed(() =>
  useAdapter.value ? adapterRecords.value : fallbackRecords,
)

// ──── 尺寸（整数，避免 Canvas 抖动）────

const wrapperEl = ref<HTMLElement | null>(null)
const tableRef = ref<InstanceType<typeof ListTable> | null>(null)
const adaptiveRef = toRef(() => props.adaptive)
const enabled = computed(() => !!adaptiveRef.value)

const { width: adaptiveWidth, height: adaptiveHeight } = useVTableAdaptive({
  enabled,
  wrapperEl,
})

const tableWidth = computed(() => {
  const w = adaptiveRef.value ? adaptiveWidth.value : props.width
  return Math.floor(w)
})

const tableHeight = computed(() => {
  const h = adaptiveRef.value ? adaptiveHeight.value : props.height
  return Math.floor(h)
})

// ──── 事件透传 ────

function onClickCell(e: unknown) {
  emit('clickCell', e)
}

function onDblClickCell(e: unknown) {
  emit('dblClickCell', e)
}

function onKeyDown(e: unknown) {
  emit('keyDown', e)
}

// ──── 暴露实例 ────

defineExpose({
  getTableInstance: () =>
    (tableRef.value as { table?: unknown } | null)?.table ?? null,
})
</script>

<template>
  <div ref="wrapperEl" class="vtable-wrapper" tabindex="0">
    <ListTable
      ref="tableRef"
      :options="tableOption"
      :records="tableRecords"
      :width="tableWidth"
      :height="tableHeight"
      @onClickCell="onClickCell"
      @onDblClickCell="onDblClickCell"
      @onKeyDown="onKeyDown"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import { ListTable } from '@visactor/vue-vtable'

import { useVTableAdaptive } from './composables'

import './styles/index.scss'

// ──── Props ────

interface VTablePlusProps {
  /** 表格宽度（adaptive 为 false 时生效） */
  width?: number
  /** 表格高度（adaptive 为 false 时生效） */
  height?: number
  /** 是否自适应填满父容器 */
  adaptive?: boolean
}

const props = withDefaults(defineProps<VTablePlusProps>(), {
  width: 800,
  height: 500,
  adaptive: false,
})

// ──── 硬编码 option / records（阶段 0）────

const tableOption = {
  header: [
    { field: '0', caption: '序号' },
    { field: '1', caption: '姓名' },
    { field: '2', caption: '年龄' },
    { field: '3', caption: '性别' },
    { field: '4', caption: '爱好' },
  ],
}

const tableRecords = Array.from({ length: 1000 }, (_, i) => [
  i + 1,
  `Name${i + 1}`,
  18 + (i % 50),
  ['男', '女'][i % 2] as string,
  '爱好',
])

// ──── 尺寸（整数，避免 Canvas 抖动）────

const wrapperEl = ref<HTMLElement | null>(null)
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
</script>

<template>
  <div ref="wrapperEl" class="vtable-wrapper" tabindex="0">
    <ListTable
      :options="tableOption"
      :records="tableRecords"
      :width="tableWidth"
      :height="tableHeight"
    />
  </div>
</template>

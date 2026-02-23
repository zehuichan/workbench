<template>
  <div
    v-if="pagination"
    class="re-table-footer"
  >
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      background
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { PaginationConfig } from './types'

const props = withDefaults(
  defineProps<{
    pagination: PaginationConfig
    total: number
  }>(),
  {
    total: 0,
  },
)

const emit = defineEmits<{
  'update:current-page': [value: number]
  'update:page-size': [value: number]
  'current-change': [value: number]
  'size-change': [value: number]
}>()

const currentPage = computed({
  get: () => props.pagination.currentPage ?? 1,
  set: (v: number) => emit('update:current-page', v),
})

const pageSize = computed({
  get: () => props.pagination.pageSize ?? 10,
  set: (v: number) => emit('update:page-size', v),
})

const pageSizes = computed(() => props.pagination.pageSizes ?? [10, 20, 50, 100])
const layout = computed(
  () => props.pagination.layout ?? 'total, sizes, prev, pager, next, jumper',
)

const handleCurrentChange = (val: number) => {
  emit('current-change', val)
}

const handleSizeChange = (val: number) => {
  emit('size-change', val)
}
</script>

<style scoped lang="scss">
.re-table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>

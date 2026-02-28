<template>
  <div class="re-table-next-pagination">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="computedPageSizes"
      :layout="computedLayout"
      background
      @current-change="$emit('current-change', $event)"
      @size-change="$emit('size-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'ReTableNextPagination',
});

const props = withDefaults(
  defineProps<{
    currentPage?: number;
    pageSize?: number;
    total?: number;
    pageSizes?: number[];
    layout?: string;
  }>(),
  {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
);

defineEmits<{
  'current-change': [value: number];
  'size-change': [value: number];
}>();

const computedPageSizes = computed(
  () => props.pageSizes ?? [10, 20, 50, 100],
);

const computedLayout = computed(
  () => props.layout ?? 'total, sizes, prev, pager, next, jumper',
);
</script>

<style scoped lang="scss">
.re-table-next-pagination {
  display: flex;
  justify-content: flex-end;
}
</style>

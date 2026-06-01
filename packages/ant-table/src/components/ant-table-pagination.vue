<template>
  <div class="atbl-pagination">
    <a-pagination
      :current="current"
      :page-size="pageSize"
      :total="total"
      :page-size-options="pageSizeOptions"
      :show-size-changer="true"
      :show-quick-jumper="true"
      :show-total="showTotalFn"
      size="small"
      @change="onChange"
      @show-size-change="onShowSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Pagination as APagination } from 'ant-design-vue';

defineOptions({
  name: 'AntTablePagination',
});

const props = withDefaults(
  defineProps<{
    current?: number;
    pageSize?: number;
    total?: number;
    pageSizes?: number[];
    showTotal?: boolean;
  }>(),
  {
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
  },
);

const emit = defineEmits<{
  'current-change': [value: number];
  'size-change': [value: number];
}>();

const pageSizeOptions = computed(() =>
  (props.pageSizes ?? [10, 20, 50, 100]).map((n) => String(n)),
);

const showTotalFn = computed(() =>
  props.showTotal ? (t: number) => `共 ${t} 条` : undefined,
);

function onChange(page: number, size: number): void {
  if (size !== props.pageSize) {
    emit('size-change', size);
    return;
  }
  emit('current-change', page);
}

function onShowSizeChange(_current: number, size: number): void {
  emit('size-change', size);
}
</script>

<style lang="scss">
.atbl-pagination {
  display: flex;
  justify-content: flex-end;
}
</style>

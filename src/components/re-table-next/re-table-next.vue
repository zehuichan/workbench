<template>
  <div ref="wrapperEl" class="re-table-next-wrapper">
    <el-table
      v-bind="$attrs"
      ref="tableRef"
      :data="data"
      :row-key="rowKey"
      :stripe="stripe"
      :border="border"
      :show-overflow-tooltip="showOverflowTooltip"
      :max-height="maxHeight ?? adaptiveMaxHeight"
    >
      <template #default>
        <slot>
          <ReTableNextColumn :columns="visibleColumns" />
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
</template>

<script setup lang="ts">
import { computed, nextTick, provide, ref, toRef, watch } from 'vue';

import { isBoolean, isFunction } from '@/utils';

import type {
  AdaptiveConfig,
  ReTableNextColumn as ColumnType,
  ReTableNextProps,
} from './types';
import {
  RE_TABLE_NEXT_INJECTION_KEY,
  type ReTableNextContext,
} from './constants';
import { useAdaptive } from './composables';
import ReTableNextColumn from './re-table-next-column.vue';

import './styles/index.scss';

defineOptions({ name: 'ReTableNext' });

const props = withDefaults(defineProps<ReTableNextProps>(), {
  columns: () => [],
  data: () => [],
  stripe: false,
  border: true,
  showOverflowTooltip: true,
  editable: false,
  hotkeyEnabled: true,
  adaptive: false,
});

const emit = defineEmits<{
  scroll: [event: Event];
}>();

// ──── Refs ────

const wrapperEl = ref<HTMLElement | null>(null);
const tableRef = ref<Record<string, any> | null>(null);

// ──── 列可见性 ────

const visibleColumns = computed<ColumnType[]>(() =>
  (props.columns ?? []).filter((col) => {
    if (isBoolean(col.hidden)) return !col.hidden;
    return true;
  }),
);

// ──── 自适应高度 ────

const adaptiveRef = toRef(() => props.adaptive) as ReturnType<
  typeof toRef<boolean | AdaptiveConfig | undefined>
>;

const { maxHeight: adaptiveMaxHeight } = useAdaptive({
  adaptive: adaptiveRef,
  wrapperEl,
});

// 当自适应关闭时（maxHeight 变为 ''），强制 el-table 重新布局
watch(adaptiveMaxHeight, (val, oldVal) => {
  if (val === '' || val == null) {
    nextTick(() => tableRef.value?.doLayout?.());
  }
});

// ──── Provide ────

provide<ReTableNextContext>(RE_TABLE_NEXT_INJECTION_KEY, {
  tableEl: wrapperEl,
  tableInstance: computed(() => tableRef.value) as any,
  columns: computed(() => props.columns ?? []),
  visibleColumns,
  data: computed(() => props.data ?? []),
  editable: computed(() => props.editable ?? false),
});

// ──── Expose: el-table 原生方法透传 ────

const getElTable = () => tableRef.value;

defineExpose({
  /** 获取 el-table 实例 */
  getElTable,

  // el-table 原生方法透传
  clearSelection: () => getElTable()?.clearSelection(),
  getSelectionRows: () => getElTable()?.getSelectionRows(),
  toggleRowSelection: (...args: any[]) =>
    getElTable()?.toggleRowSelection(...args),
  toggleAllSelection: () => getElTable()?.toggleAllSelection(),
  toggleRowExpansion: (...args: any[]) =>
    getElTable()?.toggleRowExpansion(...args),
  setCurrentRow: (...args: any[]) => getElTable()?.setCurrentRow(...args),
  clearSort: () => getElTable()?.clearSort(),
  clearFilter: (...args: any[]) => getElTable()?.clearFilter(...args),
  doLayout: () => getElTable()?.doLayout(),
  sort: (...args: any[]) => getElTable()?.sort(...args),
  scrollTo: (...args: any[]) => getElTable()?.scrollTo(...args),
  setScrollTop: (...args: any[]) => getElTable()?.setScrollTop(...args),
  setScrollLeft: (...args: any[]) => getElTable()?.setScrollLeft(...args),
});
</script>

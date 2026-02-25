<template>
  <div ref="wrapperEl" class="re-table-next-wrapper">
    <!--header（可选，参与自适应高度计算时会被扣除）-->
    <div class="re-table-next-header flex items-center justify-between p-2">
      <slot name="title">
        <div>todo title</div>
      </slot>
      <slot name="actions">
        <div>todo actions</div>
      </slot>
    </div>
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
          <template
            v-for="(column, idx) in visibleColumns"
            :key="column.key ?? column.prop ?? column.type ?? idx"
          >
            <component
              v-if="[SELECTION_COLUMN, INDEX_COLUMN].includes(column.type)"
              :is="h(ElTableColumn, column, slots)"
            />

            <component
              v-else-if="[EXPAND_COLUMN].includes(column.type)"
              :is="
                h(ElTableColumn, column, {
                  default: (scope: unknown) =>
                    slots.expand && slots.expand(scope),
                })
              "
            />

            <ReTableNextColumn v-else :item="column" v-slot="slots" />
          </template>
        </slot>
      </template>

      <template #append>
        <slot name="append" />
      </template>

      <template #empty>
        <slot name="empty" />
      </template>
    </el-table>
    <!--footer（可选，参与自适应高度计算时会被扣除）-->
    <div class="re-table-next-footer flex items-center justify-between p-2">
      <slot name="summary">
        <div>todo summary</div>
      </slot>
      <slot name="pagination">
        <div>todo pagination</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  h,
  nextTick,
  provide,
  ref,
  toRef,
  useSlots,
  watch,
} from 'vue';

import { ElTableColumn } from 'element-plus';

import { isBoolean } from '@/utils';

import type {
  AdaptiveConfig,
  ReTableNextColumn as ColumnType,
  ReTableNextProps,
  ReTableNextContext,
} from './types';
import {
  EXPAND_COLUMN,
  INDEX_COLUMN,
  RE_TABLE_NEXT_INJECTION_KEY,
  SELECTION_COLUMN,
} from './constants';
import { useAdaptive } from './composables';
import ReTableNextColumn from './re-table-next-column.vue';

import './styles/index.scss';

defineOptions({
  name: 'ReTableNext',
  inheritAttrs: false,
});

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

// ──── Slots & Refs ────

const slots = useSlots();
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

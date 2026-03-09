<script setup lang="ts">
import { computed, ref, toRef, useSlots } from 'vue';

import { ListTable, ListColumn, Group } from '@visactor/vue-vtable';

import { useVTableAdaptive } from './composables';
import type { VTablePlusProps } from './types';
import { theme } from './theme';

import VisTableCell from './vis-table-cell.vue';

import './styles/index.scss';

// ──── Props ────

const props = withDefaults(defineProps<VTablePlusProps>(), {
  options: () => ({}),
  columns: () => [],
  data: () => [],
  width: 800,
  height: 500,
  adaptive: false,
});

const slots = useSlots();

// ──── 分页与展示数据 ────
const delegatedOptions = computed(() => {
  return {
    ...props.options,
    containerFit: {
      width: true,
      height: true,
    },
    theme,
    defaultHeaderRowHeight: 40,
    defaultRowHeight: 40,
    customConfig: {
      createReactContainer: true,
    },
    editCellTrigger: 'doubleclick',
    keyboardOptions: {
      copySelected: true,
      cutSelected: true,
      pasteValueToCell: true,
      selectAllOnCtrlA: true,
    },
  };
});

// ──── 尺寸（整数，避免 Canvas 抖动）────

const wrapperEl = ref<HTMLElement | null>(null);
const tableRef = ref<InstanceType<typeof ListTable> | null>(null);
const adaptiveRef = toRef(() => props.adaptive);
const enabled = computed(() => !!adaptiveRef.value);

const { width: adaptiveWidth, height: adaptiveHeight } = useVTableAdaptive({
  enabled,
  wrapperEl,
});

const tableWidth = computed(() => {
  const w = adaptiveRef.value ? adaptiveWidth.value : props.width;
  return Math.floor(w);
});

const tableHeight = computed(() => {
  const h = adaptiveRef.value ? adaptiveHeight.value : props.height;
  return Math.floor(h);
});

// 判断某个列是否有对应的自定义插槽
const hasSlot = (field: string) => !!slots[field];

// ──── 暴露实例 ────

defineExpose({
  getTableInstance: () =>
    (tableRef.value as { table?: unknown } | null)?.table ?? null,
});
</script>

<template>
  <div ref="wrapperEl" class="vtable-wrapper" tabindex="0">
    <div class="vtable-inner flex h-full flex-col">
      <div class="vtable-table-area min-h-0 flex-1">
        <ListTable
          ref="tableRef"
          :options="delegatedOptions"
          :records="data"
          :width="tableWidth"
          :height="tableHeight"
        >
          <!-- ListTable 只认默认插槽的【直接子节点】为列，且需为 ListColumn；
               用 VisTableColumn 包一层后直接子节点变成 VisTableColumn，内部的 ListColumn 不会被识别，故这里必须直接用 ListColumn -->
          <ListColumn
            v-for="(column, idx) in columns"
            :key="
              (column as any).key ?? column.prop ?? (column as any).type ?? idx
            "
            v-bind="column"
            :field="column.prop ?? (column as any).field"
            :title="column.label ?? (column as any).title"
            editor="dynamic-render-editor"
          >
            <template v-if="hasSlot(`editor-${column.prop}`)" #edit="scope">
              <slot :name="'editor-' + column.prop" v-bind="scope" />
            </template>
            <template v-if="hasSlot(column.prop)" #customLayout="scope">
              <Group
                v-bind="scope"
                :vue="{}"
                display="flex"
                align-items="center"
              >
                <div class="text-[12px]">
                  <slot :name="column.prop" v-bind="scope"></slot>
                </div>
              </Group>
            </template>
          </ListColumn>
        </ListTable>
      </div>
    </div>
  </div>
</template>

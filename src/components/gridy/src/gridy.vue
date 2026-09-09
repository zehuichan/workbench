<script setup lang="ts">
import type { GridyEmits, GridyProps, GridyRecord } from './types';

import { provide, useSlots } from 'vue';

import { ElButton, ElPagination, vLoading } from 'element-plus';

import { GridyBody, GridyToolbar } from './components';
import { GRIDY_CONTEXT_KEY } from './tokens';
import { useGridy } from './use-gridy';
import './gridy.scss';

defineOptions({ name: 'Gridy' });

// `max` / `min` / `loading` 的兜底在 composable 内完成，这里只放模板与 Boolean 合成需要的默认；
// `addButton` 含 Boolean 类型，不给默认会被 Vue 布尔转换成 `false` 而非 `undefined`
const props = withDefaults(defineProps<GridyProps>(), {
  addButton: true,
  emptyText: '暂无数据',
  keyboard: true,
  size: 'small',
});

const emit = defineEmits<GridyEmits>();
const slots = useSlots();

const model = defineModel<GridyRecord[]>({ default: () => [] });
const selectedRowKeys = defineModel<string[]>('selectedRowKeys', {
  default: () => [],
});
const expandedRowKeys = defineModel<string[]>('expandedRowKeys', {
  default: () => [],
});

const { ctx, exposed } = useGridy(props, emit, model, selectedRowKeys, expandedRowKeys, {
  hasExpandSlot: () => !!slots.expand,
  hasSummarySlot: () => !!slots.summary,
  hasToolbarSlot: () => !!slots.toolbar,
});
provide(GRIDY_CONTEXT_KEY, ctx);

const {
  addButton,
  addRow,
  canAdd,
  elSize,
  onPageChange,
  pageSizeOptions,
  pagination,
  paginationEnabled,
  paginationLayout,
  paginationSize,
  paginationTotalText,
  rows,
  size,
  toolbar,
} = ctx;

/** 只把 body 消费的插槽转发下去：`action` / `summary` / `expand` / `cell-*` / `header-*` */
function isBodySlot(name: string): boolean {
  return (
    name === 'action' ||
    name === 'summary' ||
    name === 'expand' ||
    name.startsWith('cell-') ||
    name.startsWith('header-')
  );
}

defineExpose(exposed);
</script>

<template>
  <div class="gridy" :class="[`gridy--${size}`, { 'gridy--bordered': props.bordered }]">
    <div v-if="$slots.title" class="gridy__title">
      <slot name="title" :current-page-data="rows"></slot>
    </div>

    <GridyToolbar v-if="toolbar.show">
      <template v-if="$slots.toolbar" #toolbar="slotProps">
        <slot name="toolbar" v-bind="slotProps"></slot>
      </template>
    </GridyToolbar>

    <div v-loading="!!props.loading" class="gridy__spin">
      <div class="gridy__main">
        <GridyBody>
          <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
            <slot v-if="isBodySlot(name)" :name="name" v-bind="slotProps || {}"></slot>
          </template>
        </GridyBody>

        <div v-if="rows.length === 0" class="gridy__empty">
          <slot name="emptyText">{{ props.emptyText }}</slot>
        </div>
      </div>
    </div>

    <div v-if="paginationEnabled && pagination.total > 0" class="gridy__pager">
      <ElPagination
        :current-page="pagination.current"
        :layout="paginationLayout"
        :page-size="pagination.pageSize"
        :page-sizes="pageSizeOptions"
        :size="paginationSize"
        :total="pagination.total"
        @update:current-page="(page: number) => onPageChange(page, pagination.pageSize)"
        @update:page-size="(pageSize: number) => onPageChange(pagination.current, pageSize)"
      >
        <template v-if="paginationTotalText" #total>{{ paginationTotalText }}</template>
      </ElPagination>
    </div>

    <ElButton
      v-if="addButton.show"
      class="gridy__add"
      :disabled="!canAdd"
      :size="elSize"
      plain
      @click="addRow()"
    >
      <span class="gridy__add-icon" aria-hidden="true">+</span>
      {{ addButton.text }}
    </ElButton>
  </div>
</template>

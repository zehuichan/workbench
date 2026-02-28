<template>
  <el-button
    :icon="Setting"
    circle
    title="列设置"
    class="column-setting-trigger"
    @click="show = true"
  />
  <el-drawer
    v-model="show"
    title="列设置"
    size="360"
    direction="rtl"
    class="re-table-next-column-setting-drawer"
  >
    <template #default>
      <el-scrollbar class="column-setting-scrollbar">
        <div class="re-table-next-column-setting">
          <p class="column-setting-hint">勾选显示列，拖拽调整顺序</p>
          <div ref="listEl" class="column-setting-list">
            <div
              v-for="(col, idx) in orderedColumns"
              :key="col.prop"
              class="column-setting-item"
              draggable="true"
              :data-index="idx"
              @dragstart="handleDragStart"
              @dragover.prevent="handleDragOver"
              @drop="handleDrop"
            >
              <el-icon class="drag-handle" title="拖拽排序">
                <Rank />
              </el-icon>
              <el-checkbox
                :model-value="!isHidden(col.prop!)"
                @update:model-value="toggle(col.prop!, $event)"
                class="column-setting-checkbox"
              >
                {{ col.label ?? col.prop }}
              </el-checkbox>
              <el-input
                :model-value="getEffectiveWidth(col)"
                @update:model-value="handleWidthInput(col.prop!, $event)"
                placeholder="宽度"
                class="column-width-input"
              />
            </div>
          </div>
        </div>
      </el-scrollbar>
    </template>
    <template #footer>
      <div class="column-setting-footer">
        <el-button @click="handleInvert">反选</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSelectAll">全选</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { Rank, Setting } from '@element-plus/icons-vue';

import type { ReTableNextContext } from './types';
import { RE_TABLE_NEXT_INJECTION_KEY } from './constants';

defineOptions({
  name: 'ReTableNextColumnSetting',
});

const ctx = inject<ReTableNextContext>(RE_TABLE_NEXT_INJECTION_KEY, null);

const show = ref(false);

const columnOptions = computed(() => ctx?.columnOptions ?? null);

const orderedColumns = computed(() => {
  const ops = columnOptions.value;
  if (!ops) return [];
  return ops.getOrderedColumnsWithProp();
});

const isHidden = (prop: string) =>
  columnOptions.value?.isColumnHidden(prop) ?? false;

const toggle = (prop: string, visible: boolean) => {
  columnOptions.value?.toggleColumn(prop, visible);
};

/** 列设置面板显示的宽度：优先使用 columnWidths 中的覆盖值，否则用列定义的 width */
function getEffectiveWidth(col: {
  prop?: string;
  width?: string | number;
}): string | number | undefined {
  const widths = columnOptions.value?.columnWidths?.value ?? {};
  if (col.prop && col.prop in widths) return widths[col.prop];
  return col.width;
}

function handleWidthInput(prop: string, value: string | number): void {
  columnOptions.value?.setColumnWidth(prop, value ?? '');
}

function handleSelectAll(): void {
  for (const col of orderedColumns.value) {
    if (col.prop) columnOptions.value?.toggleColumn(col.prop, true);
  }
}

function handleInvert(): void {
  for (const col of orderedColumns.value) {
    if (col.prop) {
      const hidden = columnOptions.value?.isColumnHidden(col.prop);
      columnOptions.value?.toggleColumn(col.prop, !!hidden);
    }
  }
}

function handleReset(): void {
  columnOptions.value?.resetColumns();
}

const listEl = ref<HTMLElement | null>(null);
let dragFromIndex = -1;

function handleDragStart(e: DragEvent): void {
  const target = e.target as HTMLElement;
  const item = target.closest('.column-setting-item') as HTMLElement;
  const idx = item?.dataset.index;
  if (idx != null) {
    dragFromIndex = Number(idx);
    e.dataTransfer?.setData('text/plain', idx);
    e.dataTransfer!.effectAllowed = 'move';
  }
}

function handleDragOver(e: DragEvent): void {
  e.dataTransfer!.dropEffect = 'move';
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  const target = (e.target as HTMLElement).closest(
    '.column-setting-item',
  ) as HTMLElement;
  if (!target || dragFromIndex < 0) return;
  const toIndex = Number(target.dataset.index);
  if (!Number.isNaN(toIndex) && toIndex >= 0 && toIndex !== dragFromIndex) {
    columnOptions.value?.reorderColumns(dragFromIndex, toIndex);
  }
  dragFromIndex = -1;
}
</script>

<style lang="scss">
.column-setting-trigger {
  cursor: pointer;
}

.re-table-next-column-setting-drawer {
  .el-drawer__header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 0;
  }

  .el-drawer__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .el-drawer__footer {
    padding: 12px 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.column-setting-scrollbar {
  flex: 1;
  min-height: 0;
}

.re-table-next-column-setting {
  padding: 12px;

  .column-setting-hint {
    padding: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .column-setting-list {
  }

  .column-setting-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 10px 12px;
    margin-bottom: 4px;
    border-radius: 6px;
    cursor: grab;
    transition: background-color 0.2s ease;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .drag-handle {
      flex-shrink: 0;
      color: var(--el-text-color-placeholder);
      font-size: 16px;
      padding: 4px;
      margin: -4px;
      border-radius: 4px;

      &:hover {
        color: var(--el-text-color-regular);
        background-color: var(--el-fill-color);
      }
    }

    .column-setting-checkbox {
      flex: 1;
      min-width: 0;
      margin-right: 8px;
    }

    .column-width-input {
      flex-shrink: 0;
      width: 80px;
    }
  }
}
</style>

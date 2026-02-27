<template>
  <el-popover
    placement="bottom-end"
    :width="260"
    trigger="click"
  >
    <template #reference>
      <el-button
        :icon="Setting"
        circle
        size="small"
        title="列设置"
      />
    </template>
    <div class="re-table-next-column-setting">
      <div class="column-setting-actions">
        <el-button
          link
          size="small"
          type="primary"
          @click="handleSelectAll"
        >
          全选
        </el-button>
        <el-button
          link
          size="small"
          @click="handleInvert"
        >
          反选
        </el-button>
        <el-button
          link
          size="small"
          @click="handleReset"
        >
          重置
        </el-button>
      </div>
      <div
        ref="listEl"
        class="column-setting-list"
      >
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
          <el-icon class="drag-handle">
            <Rank />
          </el-icon>
          <el-checkbox
            :model-value="!isHidden(col.prop!)"
            @update:model-value="toggle(col.prop!, $event)"
          >
            {{ col.label ?? col.prop }}
          </el-checkbox>
        </div>
      </div>
    </div>
  </el-popover>
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

<style scoped lang="scss">
.re-table-next-column-setting {
  .column-setting-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .column-setting-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .column-setting-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .drag-handle {
      color: var(--el-text-color-placeholder);
      font-size: 14px;
    }

    .el-checkbox {
      flex: 1;
    }
  }
}
</style>

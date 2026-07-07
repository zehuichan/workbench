<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { ElButton, ElCheckbox, ElPopover } from 'element-plus';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import type { SettingItem } from '../core';

defineOptions({ name: 'PlusTableColumnSettings' });

const engine = inject(PLUS_TABLE_INJECTION_KEY);
if (!engine) {
  throw new Error(
    '[PlusTable] PlusTableColumnSettings 必须在 PlusTable 内部使用',
  );
}

const items = computed(() => engine!.columns.settingItems.value);

function handleToggle(id: string, checked: boolean | string | number) {
  engine!.columns.toggleVisible(id, !!checked);
}

// ──── 拖拽排序（仅限同级节点之间） ────

const dragItem = ref<SettingItem | null>(null);
const dropTargetId = ref<string | null>(null);
const dropPosition = ref<'before' | 'after'>('before');

function canDropOn(item: SettingItem): boolean {
  return (
    !!dragItem.value &&
    dragItem.value.id !== item.id &&
    dragItem.value.parentId === item.parentId
  );
}

function onDragStart(event: DragEvent, item: SettingItem) {
  dragItem.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox 必须 setData 才会启动拖拽
    event.dataTransfer.setData('text/plain', item.id);
  }
}

function onDragOver(event: DragEvent, item: SettingItem) {
  if (!canDropOn(item)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  dropPosition.value =
    event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  dropTargetId.value = item.id;
}

function onDrop(event: DragEvent, item: SettingItem) {
  if (!canDropOn(item)) return;
  event.preventDefault();
  engine!.columns.reorderNode(dragItem.value!.id, item.id, dropPosition.value);
  onDragEnd();
}

function onDragEnd() {
  dragItem.value = null;
  dropTargetId.value = null;
}
</script>

<template>
  <el-popover trigger="click" placement="bottom-end" :width="280">
    <template #reference>
      <el-button size="small">列设置</el-button>
    </template>
    <div class="ptbl-column-settings">
      <ul class="ptbl-column-settings__list">
        <li
          v-for="item in items"
          :key="item.id"
          class="ptbl-column-settings__item"
          :class="{
            'is-dragging': dragItem?.id === item.id,
            'is-drop-before':
              dropTargetId === item.id && dropPosition === 'before',
            'is-drop-after':
              dropTargetId === item.id && dropPosition === 'after',
          }"
          :style="{ paddingLeft: `${item.level * 16}px` }"
          draggable="true"
          @dragstart="onDragStart($event, item)"
          @dragover="onDragOver($event, item)"
          @drop="onDrop($event, item)"
          @dragend="onDragEnd"
        >
          <span class="ptbl-column-settings__handle" aria-hidden="true">
            ⠿
          </span>
          <el-checkbox
            :model-value="item.checked"
            :indeterminate="item.indeterminate"
            @change="handleToggle(item.id, $event)"
          >
            {{ item.title }}
          </el-checkbox>
        </li>
      </ul>
      <div class="ptbl-column-settings__actions">
        <el-button text size="small" @click="engine!.columns.resetSettings()">
          重置
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

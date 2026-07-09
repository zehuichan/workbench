<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElButton, ElCheckbox, ElPopover } from 'element-plus';
import { usePlusTable } from '../tokens';
import type { SettingItem } from '../store/columns';

defineOptions({ name: 'PlusTableColumnSettings' });

const table = usePlusTable();

const items = computed(() => table.store.settingItems.value);

function handleToggle(id: string, checked: boolean | string | number) {
  const item = items.value.find((it) => it.id === id);
  if (item?.disabled) return;
  table.store.commit('toggleColumnVisible', id, !!checked);
}

const dragItem = ref<SettingItem | null>(null);
const dropTargetId = ref<string | null>(null);
const dropPosition = ref<'before' | 'after'>('before');

function canDropOn(item: SettingItem): boolean {
  return (
    !!dragItem.value &&
    !dragItem.value.disabled &&
    !item.disabled &&
    dragItem.value.id !== item.id &&
    dragItem.value.parentId === item.parentId
  );
}

function handleDragStart(event: DragEvent, item: SettingItem) {
  if (item.disabled) {
    event.preventDefault();
    return;
  }
  dragItem.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox 必须 setData 才会启动拖拽
    event.dataTransfer.setData('text/plain', item.id);
  }
}

function handleDragOver(event: DragEvent, item: SettingItem) {
  if (!canDropOn(item)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  dropPosition.value =
    event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  dropTargetId.value = item.id;
}

function handleDrop(event: DragEvent, item: SettingItem) {
  if (!canDropOn(item)) return;
  event.preventDefault();
  table.store.commit(
    'updateColumnOrder',
    dragItem.value!.id,
    item.id,
    dropPosition.value,
  );
  handleDragEnd();
}

function handleDragEnd() {
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
            'is-disabled': item.disabled,
          }"
          :style="{ paddingLeft: `${item.level * 16}px` }"
          :draggable="!item.disabled"
          @dragstart="handleDragStart($event, item)"
          @dragover="handleDragOver($event, item)"
          @drop="handleDrop($event, item)"
          @dragend="handleDragEnd"
        >
          <span class="ptbl-column-settings__handle" aria-hidden="true">
            ⠿
          </span>
          <el-checkbox
            :model-value="item.checked"
            :indeterminate="item.indeterminate"
            :disabled="item.disabled"
            @change="handleToggle(item.id, $event)"
          >
            {{ item.title }}
          </el-checkbox>
        </li>
      </ul>
      <div class="ptbl-column-settings__actions">
        <el-button text size="small" @click="table.store.resetSettings()">
          重置
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

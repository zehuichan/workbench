<template>
  <!-- 表头右键上下文菜单 -->
  <teleport to="body">
    <div
      v-if="menuOpen"
      class="atbl-context-menu"
      :style="{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }"
      @click.stop
    >
      <div class="atbl-context-menu__item" @click="onMenuSetting">列设置</div>
      <div
        class="atbl-context-menu__item"
        :class="{ 'is-disabled': !contextColumnId }"
        @click="onMenuHide"
      >
        隐藏此列
      </div>
    </div>
  </teleport>

  <a-drawer
    v-model:open="show"
    title="列设置"
    placement="right"
    :width="360"
    class="atbl-column-setting-drawer"
  >
    <div class="atbl-column-setting">
      <div class="atbl-column-setting__header">
        <a-checkbox
          :checked="isAllChecked"
          :indeterminate="isIndeterminate"
          @change="(e: any) => handleSelectAllOrNone(e.target.checked)"
        >
          全部
        </a-checkbox>
      </div>
      <p class="atbl-column-setting__hint">勾选显示列，用上下按钮调整顺序</p>

      <div class="atbl-column-setting__list">
        <div
          v-for="(node, idx) in treeData"
          :key="node.id"
          class="atbl-column-setting__group"
        >
          <div class="atbl-column-setting__row">
            <a-checkbox
              :checked="!isNodeHidden(node)"
              :indeterminate="isGroupIndeterminate(node)"
              @change="(e: any) => handleToggle(node, e.target.checked)"
            >
              {{ node.label }}
            </a-checkbox>
            <span class="atbl-column-setting__row-actions">
              <a-input-number
                v-if="!node.children?.length && node.column.dataIndex"
                :value="getEffectiveWidth(node)"
                :min="0"
                size="small"
                placeholder="宽度"
                class="atbl-column-setting__width"
                @change="(v: any) => handleWidthInput(node.id, v)"
              />
              <a-button
                size="small"
                type="text"
                :disabled="idx === 0"
                @click="columnOptions?.moveColumn(node.id, -1)"
              >
                ↑
              </a-button>
              <a-button
                size="small"
                type="text"
                :disabled="idx === treeData.length - 1"
                @click="columnOptions?.moveColumn(node.id, 1)"
              >
                ↓
              </a-button>
            </span>
          </div>

          <!-- 分组：展平其叶子列做显隐 -->
          <div
            v-for="leaf in groupLeaves(node)"
            :key="leaf.id"
            class="atbl-column-setting__row atbl-column-setting__row--child"
          >
            <a-checkbox
              :checked="!isNodeHidden(leaf)"
              @change="(e: any) => handleToggle(leaf, e.target.checked)"
            >
              {{ leaf.label }}
            </a-checkbox>
            <a-input-number
              v-if="leaf.column.dataIndex"
              :value="getEffectiveWidth(leaf)"
              :min="0"
              size="small"
              placeholder="宽度"
              class="atbl-column-setting__width"
              @change="(v: any) => handleWidthInput(leaf.id, v)"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="atbl-column-setting__footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button danger @click="handleReset">重置</a-button>
        <a-button type="primary" @click="handleConfirm">确认</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  Button as AButton,
  Checkbox as ACheckbox,
  Drawer as ADrawer,
  InputNumber as AInputNumber,
} from 'ant-design-vue';
import { useEventListener } from '@vueuse/core';

import { collectLeafNodes } from '../utils';
import type { ColumnSettingNode } from '../utils';
import { useAntTableContext } from '../composables';

defineOptions({ name: 'AntTableColumnSetting' });

const ctx = useAntTableContext();

const show = ref(false);
const columnOptions = computed(() => ctx.columnOptions ?? null);

watch(show, (v) => {
  if (v) columnOptions.value?.snapshotColumnState?.();
});

const treeData = computed<ColumnSettingNode[]>(
  () => columnOptions.value?.getColumnSettingTree() ?? [],
);

const isNodeHidden = (node: ColumnSettingNode) =>
  columnOptions.value?.isNodeHidden(node) ?? false;

function groupLeaves(node: ColumnSettingNode): ColumnSettingNode[] {
  if (!node.children?.length) return [];
  return collectLeafNodes(node.children);
}

function isGroupIndeterminate(node: ColumnSettingNode): boolean {
  const leaves = groupLeaves(node);
  if (leaves.length === 0) return false;
  const hidden = leaves.filter((l) => isNodeHidden(l)).length;
  return hidden > 0 && hidden < leaves.length;
}

function handleToggle(node: ColumnSettingNode, visible: boolean): void {
  columnOptions.value?.toggleColumn(node.id, visible);
}

function getEffectiveWidth(node: ColumnSettingNode): number | undefined {
  const widths = columnOptions.value?.columnWidths?.value ?? {};
  if (node.id in widths) return widths[node.id];
  const w = node.column.width;
  return typeof w === 'number' ? w : undefined;
}

function handleWidthInput(id: string, value: number | string): void {
  columnOptions.value?.setColumnWidth(id, value ?? '');
}

const allLeaves = computed(() => collectLeafNodes(treeData.value));

const isAllChecked = computed(() => {
  const leaves = allLeaves.value;
  if (leaves.length === 0) return false;
  return leaves.every((n) => !isNodeHidden(n));
});

const isIndeterminate = computed(() => {
  const leaves = allLeaves.value;
  if (leaves.length === 0) return false;
  const hidden = leaves.filter((n) => isNodeHidden(n)).length;
  return hidden > 0 && hidden < leaves.length;
});

function handleSelectAllOrNone(checked: boolean): void {
  for (const node of allLeaves.value) {
    columnOptions.value?.toggleColumn(node.id, checked);
  }
}

function handleCancel(): void {
  columnOptions.value?.restoreColumnState?.();
  show.value = false;
}

function handleConfirm(): void {
  show.value = false;
}

function handleReset(): void {
  columnOptions.value?.resetColumns();
}

// ──── 表头右键菜单 ────

const menuOpen = ref(false);
const menuPos = ref({ x: 0, y: 0 });
const contextColumnId = ref<string | null>(null);

function openContextMenu(event: MouseEvent, column: any): void {
  contextColumnId.value =
    (typeof column?.key === 'string' && column.key) ||
    (typeof column?.dataIndex === 'string' && column.dataIndex) ||
    null;
  menuPos.value = { x: event.clientX, y: event.clientY };
  menuOpen.value = true;
}

function onMenuSetting(): void {
  menuOpen.value = false;
  show.value = true;
}

function onMenuHide(): void {
  if (contextColumnId.value) {
    columnOptions.value?.toggleColumn(contextColumnId.value, false);
  }
  menuOpen.value = false;
}

useEventListener(document, 'click', () => {
  if (menuOpen.value) menuOpen.value = false;
});
useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') menuOpen.value = false;
});

function open(): void {
  show.value = true;
}

defineExpose({ openContextMenu, open });
</script>

<style lang="scss">
.atbl-context-menu {
  position: fixed;
  z-index: 2000;
  min-width: 120px;
  padding: 4px;
  background: #fff;
  border-radius: 6px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12);

  &__item {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &.is-disabled {
      color: rgba(0, 0, 0, 0.25);
      pointer-events: none;
    }
  }
}

.atbl-column-setting {
  &__header {
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__hint {
    margin: 8px 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 36px;

    &--child {
      padding-left: 24px;
    }
  }

  &__row-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__width {
    width: 84px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>

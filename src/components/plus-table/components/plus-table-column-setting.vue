<template>
  <el-dropdown
    ref="dropdownRef"
    :virtual-ref="triggerRef"
    :show-arrow="false"
    :popper-options="{
      modifiers: [{ name: 'offset', options: { offset: [0, 0] } }],
    }"
    virtual-triggering
    trigger="contextmenu"
    placement="bottom-start"
    @command="handleDropdownCommand"
  >
    <template #dropdown>
      <el-dropdown-menu style="min-width: 120px">
        <el-dropdown-item command="setting">设置</el-dropdown-item>
        <el-dropdown-item command="hide" :disabled="!contextColumn?.property">
          隐藏
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-drawer
    v-model="show"
    title="列设置"
    size="360"
    direction="rtl"
    append-to-body
    class="plus-table-column-setting-drawer"
  >
    <template #default>
      <el-scrollbar class="column-setting-scrollbar">
        <div class="plus-table-column-setting">
          <div class="column-setting-header">
            <el-checkbox
              :model-value="isAllChecked"
              :indeterminate="isIndeterminate"
              @update:model-value="handleSelectAllOrNone"
            >
              全部
            </el-checkbox>
          </div>
          <p class="column-setting-hint">
            勾选显示列，拖拽调整顺序（仅顶层可拖拽）
          </p>
          <el-tree
            :data="treeData"
            node-key="id"
            default-expand-all
            draggable
            :allow-drag="allowDrag"
            :allow-drop="allowDrop"
            class="column-setting-tree"
            @node-drop="handleNodeDrop"
          >
            <template #default="{ data }">
              <div class="column-setting-item">
                <el-checkbox
                  :model-value="!isNodeHidden(data)"
                  @update:model-value="handleToggle(data, $event)"
                  @click.stop
                  class="column-setting-checkbox"
                >
                  {{ data.label }}
                </el-checkbox>
                <el-input
                  v-if="data.column.prop"
                  :model-value="getEffectiveWidth(data.column)"
                  @update:model-value="
                    handleWidthInput(data.column.prop!, $event)
                  "
                  placeholder="宽度"
                  class="column-width-input"
                  @click.stop
                />
              </div>
            </template>
          </el-tree>
        </div>
      </el-scrollbar>
    </template>
    <template #footer>
      <div class="column-setting-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="warning" @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  collectLeafNodes,
  collectAllNodes,
  extractTopLevelIds,
} from '../utils';
import type { ColumnSettingNode } from '../utils';
import { useDropdownMenu, usePlusTableContext } from '../composables';

defineOptions({
  name: 'PlusTableColumnSetting',
});

const ctx = usePlusTableContext();

const show = ref(false);
const contextColumn = ref<any>(null);
const { dropdownRef, triggerRef, open: openDropdown } = useDropdownMenu();

const columnOptions = computed(() => ctx.columnOptions ?? null);

watch(show, (v) => {
  if (v) columnOptions.value?.snapshotColumnState?.();
});

const treeData = computed<ColumnSettingNode[]>(
  () => columnOptions.value?.getColumnSettingTree() ?? [],
);

const isNodeHidden = (node: ColumnSettingNode) =>
  columnOptions.value?.isNodeHidden(node) ?? false;

function handleToggle(node: ColumnSettingNode, visible: boolean): void {
  columnOptions.value?.toggleColumn(node.id, visible);
}

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

const isAllChecked = computed(() => {
  const ops = columnOptions.value;
  if (!ops || treeData.value.length === 0) return false;
  const leaves = collectLeafNodes(treeData.value);
  if (leaves.length === 0) return true;
  return leaves.every((n) => !ops.isNodeHidden(n));
});

const isIndeterminate = computed(() => {
  const ops = columnOptions.value;
  if (!ops || treeData.value.length === 0) return false;
  const leaves = collectLeafNodes(treeData.value);
  if (leaves.length === 0) return false;
  const hiddenCount = leaves.filter((n) => ops.isNodeHidden(n)).length;
  return hiddenCount > 0 && hiddenCount < leaves.length;
});

function handleSelectAllOrNone(checked: boolean): void {
  const all = collectAllNodes(treeData.value);
  for (const node of all) {
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

function allowDrag(node: { data: ColumnSettingNode }) {
  return node.data?.isTopLevel === true;
}

function allowDrop(
  _draggingNode: { data: ColumnSettingNode },
  dropNode: { data: ColumnSettingNode },
  type: 'prev' | 'next' | 'inner',
) {
  if (type === 'inner') return false;
  return dropNode.data?.isTopLevel === true;
}

function handleNodeDrop(): void {
  const ids = extractTopLevelIds(treeData.value);
  columnOptions.value?.setColumnOrderByIds(ids);
}

function openContextMenu(event: MouseEvent, column: any) {
  contextColumn.value = column;
  openDropdown(event);
}

function handleDropdownCommand(command: string) {
  if (command === 'setting') {
    show.value = true;
  } else if (command === 'hide') {
    const prop = contextColumn.value?.property;
    if (prop) columnOptions.value?.toggleColumn(prop, false);
  }
}

defineExpose({ openContextMenu });
</script>

<style lang="scss">
.plus-table-column-setting-drawer {
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

.plus-table-column-setting {
  padding: 12px;

  .column-setting-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 8px;
  }

  .column-setting-hint {
    padding: 8px 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;
  }

  .column-setting-tree {
    .el-tree-node__content {
      min-height: 40px;
    }

    .column-setting-item {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
      padding-right: 8px;

      .column-setting-checkbox {
        flex: 1;
        min-width: 0;
      }

      .column-width-input {
        flex-shrink: 0;
        width: 80px;
      }
    }
  }
}
</style>

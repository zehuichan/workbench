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
          <p class="column-setting-hint">勾选显示列，拖拽调整顺序（仅顶层可拖拽）</p>
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
                  @update:model-value="handleWidthInput(data.column.prop!, $event)"
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
        <el-button @click="handleInvert">反选</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSelectAll">全选</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue';
import { Setting } from '@element-plus/icons-vue';

import type { PlusTableContext } from './types';
import { PLUS_TABLE_INJECTION_KEY } from './constants';
import { extractTopLevelIds } from './utils/column-utils';
import type { ColumnSettingNode } from './utils/column-utils';

defineOptions({
  name: 'PlusTableColumnSetting',
});

const ctx = inject<PlusTableContext>(PLUS_TABLE_INJECTION_KEY, null);

const show = ref(false);

const columnOptions = computed(() => ctx?.columnOptions ?? null);

const treeData = ref<ColumnSettingNode[]>([]);

watchEffect(() => {
  const ops = columnOptions.value;
  if (ops) {
    treeData.value = ops.getColumnSettingTree();
  } else {
    treeData.value = [];
  }
});

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

/** 递归收集所有叶子节点（有 prop 的） */
function collectLeafNodes(nodes: ColumnSettingNode[]): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    if (n.children?.length) {
      result.push(...collectLeafNodes(n.children));
    } else if (n.column.prop) {
      result.push(n);
    }
  }
  return result;
}

/** 递归收集所有节点（含组） */
function collectAllNodes(nodes: ColumnSettingNode[]): ColumnSettingNode[] {
  const result: ColumnSettingNode[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children?.length) {
      result.push(...collectAllNodes(n.children));
    }
  }
  return result;
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

function handleSelectAll(): void {
  handleSelectAllOrNone(true);
}

function handleInvert(): void {
  const all = collectAllNodes(treeData.value);
  for (const node of all) {
    const hidden = columnOptions.value?.isNodeHidden(node);
    columnOptions.value?.toggleColumn(node.id, !!hidden);
  }
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
</script>

<style lang="scss">
.column-setting-trigger {
  cursor: pointer;
}

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

.column-setting-footer {
  display: flex;
  gap: 8px;
}
</style>

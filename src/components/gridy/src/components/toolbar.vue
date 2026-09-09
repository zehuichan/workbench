<script setup lang="ts">
import type { GridyToolbarItem } from '../types';

import { ElButton } from 'element-plus';

import { useGridyContext } from '../tokens';
import { isFunction } from 'es-toolkit';

defineOptions({ name: 'GridyToolbar' });

const ctx = useGridyContext();
const { elSize, selectedRowKeys, toolbar, toolbarContext } = ctx;

function toolbarKey(item: GridyToolbarItem): string {
  return item.code ?? item.label;
}

function toolbarType(item: GridyToolbarItem): 'danger' | 'default' | 'primary' {
  if (item.type === 'danger') {
    return 'danger';
  }
  return item.type === 'primary' ? 'primary' : 'default';
}

function toolbarDisabled(item: GridyToolbarItem): boolean {
  if (ctx.readonly.value) {
    return true;
  }
  return isFunction(item.disabled) ? item.disabled(toolbarContext.value) : !!item.disabled;
}

function onToolbarClick(item: GridyToolbarItem) {
  if (toolbarDisabled(item)) {
    return;
  }
  item.onClick?.(toolbarContext.value);
}
</script>

<template>
  <div class="gridy__toolbar">
    <div class="gridy__toolbar-left">
      <slot name="toolbar" v-bind="toolbarContext">
        <span v-if="toolbar.title" class="gridy__toolbar-title">
          {{ toolbar.title }}
        </span>
        <span v-if="selectedRowKeys.length > 0" class="gridy__toolbar-count">
          已选 {{ selectedRowKeys.length }} 项
        </span>
      </slot>
    </div>
    <div class="gridy__toolbar-right">
      <ElButton
        v-for="item in toolbar.items"
        :key="toolbarKey(item)"
        :disabled="toolbarDisabled(item)"
        :size="elSize"
        :type="toolbarType(item)"
        @click="onToolbarClick(item)"
      >
        <component :is="item.icon" v-if="item.icon" />
        {{ item.label }}
      </ElButton>
    </div>
  </div>
</template>

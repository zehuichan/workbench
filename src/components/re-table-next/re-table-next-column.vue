<template>
  <el-table-column v-bind="item">
    <template #header="scope">
      <slot :name="`header-${item.prop}`" v-bind="scope" />
    </template>
    <template #default="scope">
      <template v-if="item.children && item.children.length">
        <component :is="h(ReTableNextColumnComponent, { item }, $slots)" />
      </template>
      <template v-else-if="$slots[`cell-${item.prop}`]">
        <slot :name="`cell-${item.prop}`" v-bind="scope"> </slot>
      </template>
      <template v-else-if="item.render">
        <Renderer :render="item.render" :data="scope.row" />
      </template>
      <template v-else>
        {{ get(scope.row, item.prop, '') }}
      </template>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { h } from 'vue';

import type { ReTableNextColumn } from './types';
import ReTableNextColumnComponent from './re-table-next-column.vue';
import { get } from 'es-toolkit/compat';
import Renderer from './renderers/renderer';

defineOptions({
  name: 'ReTableNextColumn',
  inheritAttrs: false,
});

defineProps<{
  item?: ReTableNextColumn;
}>();
</script>

<template>
  <el-table-column v-bind="item">
    <template #header="scope">
      <slot
        v-if="$slots[`header-${item.prop}`]"
        :name="`header-${item.prop}`"
        v-bind="scope"
      />
    </template>
    <template #default="scope">
      <template v-if="item.children && item.children.length">
        <template
          v-for="(child, cIdx) in item.children"
          :key="child.key ?? child.prop ?? child.label ?? cIdx"
        >
          <component
            :is="h(ReTableNextColumnComponent, { item: child }, $slots)"
          />
        </template>
      </template>
      <template v-else-if="$slots[`cell-${item.prop}`]">
        <slot :name="`cell-${item.prop}`" v-bind="scope"> </slot>
      </template>
      <template v-else-if="item.render">
        <component :is="h(item.render, scope, $slots)" />
      </template>
      <template v-else>
        {{ get(scope.row, item.prop, '') }}
      </template>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { h } from 'vue';

import { get } from 'es-toolkit/compat';

import type { ReTableNextColumn } from './types';
import ReTableNextColumnComponent from './re-table-next-column.vue';

defineOptions({
  name: 'ReTableNextColumn',
  inheritAttrs: false,
});

defineProps<{
  item?: ReTableNextColumn;
}>();
</script>

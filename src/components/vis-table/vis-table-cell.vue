<script setup lang="ts">
import { Group } from '@visactor/vue-vtable';
</script>

<template>
  <!-- Group 的 :vue="{}" 需要【单个 DOM 子节点】才能正确创建 Vue 容器；用 div 包一层 slot 与 vis-table.vue 内直接写 Group+div 行为一致 -->
  <Group v-bind="$attrs" display="flex" align-items="center" :vue="{}">
    <div class="vis-table-cell-inner">
      <slot v-bind="$attrs ?? {}" />
    </div>
  </Group>
</template>

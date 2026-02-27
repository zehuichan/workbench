<template>
  <el-table-column v-bind="columnBindings">
    <template #header="scope">
      <slot
        v-if="$slots[`header-${item.prop}`]"
        :name="`header-${item.prop}`"
        v-bind="scope"
      />
    </template>
    <template #default="scope">
      <!-- 多级表头：递归子列 -->
      <template v-if="item.children && item.children.length">
        <template
          v-for="(child, cIdx) in item.children"
          :key="(child as any).key ?? child.prop ?? child.label ?? cIdx"
        >
          <component
            :is="h(ReTableNextColumnSelf, { item: child }, $slots)"
          />
        </template>
      </template>

      <!-- 单元格渲染（编辑/展示）委托给 Cell 组件 -->
      <re-table-next-cell
        v-else
        :item="item"
        :scope="scope"
      >
        <template
          v-for="(_, slotName) in $slots"
          :key="slotName"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope ?? {}" />
        </template>
      </re-table-next-cell>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';

import type { ReTableNextColumn } from './types';
import ReTableNextCell from './re-table-next-cell.vue';
import ReTableNextColumnSelf from './re-table-next-column.vue';

defineOptions({
  name: 'ReTableNextColumn',
  inheritAttrs: false,
});

const props = defineProps<{
  item?: ReTableNextColumn;
}>();

/** 过滤掉不应透传给 el-table-column 的扩展属性 */
const columnBindings = computed(() => {
  if (!props.item) return {};
  const {
    hidden: _hidden,
    editable: _editable,
    component: _component,
    componentProps: _componentProps,
    rules: _rules,
    render: _render,
    children: _children,
    ...rest
  } = props.item;
  return rest;
});
</script>

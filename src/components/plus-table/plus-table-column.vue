<template>
  <el-table-column v-bind="columnBindings">
    <template #header="scope">
      <slot
        v-if="$slots[`header-${item.prop}`]"
        :name="`header-${item.prop}`"
        v-bind="scope"
      >
      </slot>
      <template v-else>
        <span v-if="isRequired" class="plus-table-header--required" />
        {{ item.label }}
      </template>
    </template>
    <template #default="scope">
      <!-- 多级表头：递归子列 -->
      <template v-if="item.children && item.children.length">
        <template
          v-for="(child, cIdx) in item.children"
          :key="(child as any).key ?? child.prop ?? child.label ?? cIdx"
        >
          <component :is="h(PlusTableColumnSelf, { item: child }, $slots)" />
        </template>
      </template>

      <!-- 单元格渲染（编辑/展示）委托给 Cell 组件 -->
      <plus-table-cell v-else :item="item" :scope="scope">
        <template
          v-for="(_, slotName) in $slots"
          :key="slotName"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope ?? {}" />
        </template>
      </plus-table-cell>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { computed, h, inject } from 'vue';
import type { RuleItem } from 'async-validator';
import { castArray } from 'es-toolkit/compat';
import type { PlusTableColumn, PlusTableContext } from './types';
import { PLUS_TABLE_INJECTION_KEY } from './constants';
import PlusTableCell from './plus-table-cell.vue';
import PlusTableColumnSelf from './plus-table-column.vue';

defineOptions({
  name: 'PlusTableColumn',
  inheritAttrs: false,
});

const props = defineProps<{
  item?: PlusTableColumn;
}>();

const ctx = inject<PlusTableContext>(PLUS_TABLE_INJECTION_KEY, null);

const isRequired = computed(() =>
  normalizedRules.value.some((rule) => rule.required),
);

const normalizedRules = computed(() => {
  const { item } = props;
  const { required } = item;

  const rules: RuleItem[] = [];

  if (item.rules) {
    rules.push(...castArray(item.rules));
  }

  if (required !== undefined) {
    rules.push({ required });
  }

  return rules;
});

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
    dependencies: _dependencies,
    ...rest
  } = props.item;
  return rest;
});
</script>

<template>
  <!-- 多级表头：子列作为 el-table-column 直接子组件（非 scoped slot），避免每行重复实例化 -->
  <el-table-column v-if="hasChildren" v-bind="bindings">
    <template #header="scope">
      <slot
        v-if="$slots[`header-${item.prop}`]"
        :name="`header-${item.prop}`"
        v-bind="scope"
      />
      <component
        v-else-if="item.renderHeader"
        :is="() => item.renderHeader?.(scope)"
      />
      <template v-else>
        <span v-if="isRequired" class="plus-table-header--required" />
        {{ item.label }}
      </template>
    </template>
    <plus-table-column-self
      v-for="(child, cIdx) in item!.children"
      :key="(child as any).key ?? child.prop ?? child.label ?? cIdx"
      :item="child"
    >
      <template
        v-for="(_, slotName) in $slots"
        :key="slotName"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope ?? {}" />
      </template>
    </plus-table-column-self>
  </el-table-column>

  <!-- 叶子列：单元格渲染（编辑/展示）委托给 Cell 组件 -->
  <el-table-column v-else v-bind="bindings">
    <template #header="scope">
      <slot
        v-if="$slots[`header-${item.prop}`]"
        :name="`header-${item.prop}`"
        v-bind="scope"
      />
      <component
        v-else-if="item.renderHeader"
        :is="() => item.renderHeader?.(scope)"
      />
      <template v-else>
        <span v-if="isRequired" class="plus-table-header--required" />
        {{ item.label }}
      </template>
    </template>
    <template #default="scope">
      <plus-table-cell :item="item" :scope="scope">
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
import { computed } from 'vue';
import type { RuleItem } from 'async-validator';
import { castArray } from 'es-toolkit/compat';
import type { PlusTableColumn } from './types';
import PlusTableCell from './plus-table-cell.vue';
import PlusTableColumnSelf from './plus-table-column.vue';

defineOptions({
  name: 'PlusTableColumn',
  inheritAttrs: false,
});

const props = defineProps<{
  item?: PlusTableColumn;
}>();

const hasChildren = computed(() => !!(props.item?.children?.length));

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

/** 过滤掉不应透传给 el-table-column 的扩展属性（含 renderHeader，Element Plus 推荐用 scoped-slot header） */
const bindings = computed(() => {
  if (!props.item) return {};
  const {
    hidden: _hidden,
    editable: _editable,
    component: _component,
    componentProps: _componentProps,
    rules: _rules,
    render: _render,
    renderHeader: _renderHeader,
    children: _children,
    dependencies: _dependencies,
    ...rest
  } = props.item;
  return rest;
});
</script>

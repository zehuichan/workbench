<template>
  <!-- 编辑态：仅在当前单元格处于编辑状态时挂载编辑器（零开销） -->
  <template v-if="showEditor">
    <!-- 自定义编辑器插槽 #editor-${prop} -->
    <slot
      v-if="$slots[`editor-${item.prop}`]"
      :name="`editor-${item.prop}`"
      v-bind="editorSlotScope"
    />
    <!-- 默认编辑器：用 div 在 capture 阶段拦截 Esc，防止下拉框等弹层吞掉事件 -->
    <component
      v-else
      :is="editorComponent"
      :model-value="cellEditorValue"
      v-bind="mergedEditorProps"
      :disabled="depState.disabled"
      class="plus-table-cell-editor w-full!"
      size="small"
      @update:model-value="setCellEditorValue"
      @keydown.esc.capture.stop="onEditorEsc"
    />
  </template>
  <!-- 展示态（校验错误时用 tooltip 显示错误信息） -->
  <template v-else-if="cellError">
    <el-tooltip :content="cellError">
      <span
        class="plus-table-cell-content plus-table-cell-content--with-tooltip"
      >
        <template v-if="$slots[`cell-${item.prop}`]">
          <slot :name="`cell-${item.prop}`" v-bind="scope" />
        </template>
        <template v-else-if="item.render">
          <component :is="h(item.render, scope, $slots)" />
        </template>
        <template v-else>
          {{ get(scope.row, item.prop, '') }}
        </template>
      </span>
    </el-tooltip>
  </template>
  <template v-else-if="$slots[`cell-${item.prop}`]">
    <slot :name="`cell-${item.prop}`" v-bind="scope" />
  </template>
  <template v-else-if="item.render">
    <component :is="h(item.render, scope, $slots)" />
  </template>
  <template v-else>
    {{ get(scope.row, item.prop, '') }}
  </template>
</template>

<script setup lang="ts">
import { type Component, computed, h, nextTick } from 'vue';

import { get } from 'es-toolkit/compat';

import { isString } from '../utils';

import type { PlusTableColumn } from '../types';
import { ELEMENT_ADAPTER_MAP } from '../adapters';
import { usePlusTableContext } from '../composables';

const ctx = usePlusTableContext();

/** 当前单元格校验错误（用于红框由父级 cell-class-name 控制，此处用于 tooltip） */
const cellError = computed(() =>
  ctx.getErrorForCell(props.scope.$index, props.item.prop ?? ''),
);

/** 单元格联动：依赖解析状态（disabled / componentProps 等） */
const depState = computed(() =>
  ctx.resolveDependencyState(props.scope.$index, props.item),
);

defineOptions({
  name: 'PlusTableCell',
  inheritAttrs: false,
});

const props = defineProps<{
  /** 列配置 */
  item: PlusTableColumn;
  /** el-table-column #default scope（含 row、column、$index） */
  scope: Record<string, any>;
}>();

// ──── 编辑态判断与值访问 ────

const isAllMode = computed(() => ctx.editMode.value === 'all');

const showEditor = computed(() =>
  ctx.isEditingCell(props.scope.$index, props.item.prop),
);

const cellEditorValue = computed(() => {
  if (isAllMode.value) {
    return props.item.prop ? props.scope.row[props.item.prop] : undefined;
  }
  return ctx.getEditingValue(props.item.prop!);
});

function setCellEditorValue(val: any) {
  const prop = props.item.prop;
  if (!prop) return;

  if (isAllMode.value) {
    const oldVal = props.scope.row[prop];
    props.scope.row[prop] = val;
    if (oldVal !== val) {
      ctx.markDirty(props.scope.$index, prop);
      ctx.onFieldChange(props.scope.$index, prop);
    }
    return;
  }
  ctx.setEditingValue(prop, val);
}

const editorSlotScope = computed(() => ({
  row: props.scope.row,
  column: props.item,
  modelValue: cellEditorValue.value,
  'onUpdate:modelValue': setCellEditorValue,
  confirm: ctx.confirmEdit,
  cancel: ctx.cancelEdit,
}));

const editorComponent = computed(() => resolveComponent(props.item.component));

const editorBindProps = computed(() => {
  const cp = props.item.componentProps;
  if (!cp) return {};
  if (typeof cp === 'function') return cp(props.scope.row, props.item);
  return cp;
});

/** 合并静态 componentProps 与 dependencies.componentProps（动态优先） */
const mergedEditorProps = computed(() => ({
  ...editorBindProps.value,
  ...(depState.value.componentProps ?? {}),
}));

// ──── 编辑器组件解析 ────

function resolveComponent(component?: string | Component) {
  if (!component) return ELEMENT_ADAPTER_MAP.input;
  const resolved = isString(component)
    ? ELEMENT_ADAPTER_MAP?.[component]
    : component;
  if (!resolved) {
    console.warn(`[PlusTable] Component "${component}" is not registered`);
  }
  return resolved as Component;
}

// ──── 编辑器 Esc ────

function onEditorEsc(): void {
  ctx.cancelEdit();
  nextTick(() => {
    ctx.tableEl.value?.focus({ preventScroll: true });
  });
}
</script>

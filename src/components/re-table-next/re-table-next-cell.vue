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
      v-bind="editorBindProps"
      class="re-table-next-cell-editor w-full!"
      size="small"
      @update:model-value="setCellEditorValue"
      @keydown.esc.capture.stop="onEditorEsc"
    />
  </template>
  <!-- 展示态（校验错误时用 tooltip 显示错误信息） -->
  <template v-else-if="cellError">
    <el-tooltip :content="cellError" placement="top" effect="dark">
      <span
        class="re-table-next-cell-content re-table-next-cell-content--with-tooltip"
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
import { type Component, computed, h, inject, nextTick } from 'vue';

import { get } from 'es-toolkit/compat';

import { isString } from '@/utils';

import type { ReTableNextColumn, ReTableNextContext } from './types';
import { RE_TABLE_NEXT_INJECTION_KEY } from './constants';
import { ELEMENT_ADAPTER_MAP } from './adapter';

const ctx = inject<ReTableNextContext>(
  RE_TABLE_NEXT_INJECTION_KEY,
  undefined as any,
);

/** 当前单元格校验错误（用于红框由父级 cell-class-name 控制，此处用于 tooltip） */
const cellError = computed(() =>
  ctx?.getErrorForCell?.(props.scope.$index, props.item.prop ?? ''),
);

defineOptions({
  name: 'ReTableNextCell',
  inheritAttrs: false,
});

const props = defineProps<{
  /** 列配置 */
  item: ReTableNextColumn;
  /** el-table-column #default scope（含 row、column、$index） */
  scope: Record<string, any>;
}>();

// ──── 编辑态判断与值访问 ────

const isAllMode = computed(() => ctx?.editMode?.value === 'all');

const showEditor = computed(() => {
  if (!ctx) return false;
  return ctx.isEditingCell(props.scope.$index, props.item.prop);
});

const cellEditorValue = computed(() => {
  if (isAllMode.value) {
    return props.item.prop ? props.scope.row[props.item.prop] : undefined;
  }
  return ctx!.getEditingValue(props.item.prop!);
});

function setCellEditorValue(val: any) {
  if (isAllMode.value) {
    if (props.item.prop) {
      props.scope.row[props.item.prop] = val;
    }
    return;
  }
  ctx!.setEditingValue(props.item.prop!, val);
}

const editorSlotScope = computed(() => ({
  row: props.scope.row,
  column: props.item,
  modelValue: cellEditorValue.value,
  'onUpdate:modelValue': setCellEditorValue,
  confirm: ctx!.confirmEdit,
  cancel: ctx!.cancelEdit,
}));

// ──── 编辑器组件解析 ────

function resolveComponent(component?: string | Component) {
  if (!component) return ELEMENT_ADAPTER_MAP.input;
  const resolved = isString(component)
    ? ELEMENT_ADAPTER_MAP?.[component]
    : component;
  if (!resolved) {
    console.warn(`[ReTableNext] Component "${component}" is not registered`);
  }
  return resolved as Component;
}

const editorComponent = computed(() => resolveComponent(props.item.component));

const editorBindProps = computed(() => {
  const cp = props.item.componentProps;
  if (!cp) return {};
  if (typeof cp === 'function') return cp(props.scope.row, props.item);
  return cp;
});

// ──── 编辑器 Esc ────

function onEditorEsc(): void {
  ctx?.cancelEdit();
  nextTick(() => {
    ctx?.tableEl?.value?.focus({ preventScroll: true });
  });
}
</script>

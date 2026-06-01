<template>
  <div
    class="atbl-cell"
    :class="{
      'atbl-cell--active': isActive,
      'atbl-cell--dirty': isDirty,
      'atbl-cell--error': !!cellError,
      'atbl-cell--editing': showEditor,
    }"
  >
    <!-- 编辑态 -->
    <component
      v-if="showEditor"
      :is="editorComponent"
      v-bind="editorBindings"
      @keydown.esc.capture.stop="onEditorEsc"
    />

    <!-- 展示态：校验错误时用 tooltip 显示错误信息 -->
    <a-tooltip v-else-if="cellError" :title="cellError">
      <span class="atbl-cell-content atbl-cell-content--error">
        <component v-if="column.customRender" :is="renderedContent" />
        <template v-else>{{ displayText }}</template>
      </span>
    </a-tooltip>

    <template v-else>
      <component v-if="column.customRender" :is="renderedContent" />
      <template v-else>{{ displayText }}</template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Component, computed, nextTick } from 'vue';

import { Tooltip as ATooltip } from 'ant-design-vue';
import { get } from 'es-toolkit/compat';

import type { AntTableColumn, RowData } from '../types';
import { ANT_ADAPTER_MAP } from '../adapters';
import { columnField, isString } from '../utils';
import { useAntTableContext } from '../composables';

defineOptions({
  name: 'AntTableCell',
  inheritAttrs: false,
});

const props = defineProps<{
  column: AntTableColumn;
  record: RowData;
  rowIndex: number;
}>();

const ctx = useAntTableContext();

const field = computed(() => columnField(props.column));

const dataPath = computed<string | string[] | undefined>(() => {
  const di = props.column.dataIndex;
  if (typeof di === 'string' || Array.isArray(di)) return di;
  return undefined;
});

/** 展示值（响应式读取 record，确认编辑后原地修改也能刷新） */
const displayValue = computed(() => {
  const path = dataPath.value;
  if (path == null) return undefined;
  return get(props.record, path as any);
});

const displayText = computed(() => {
  const v = displayValue.value;
  return v == null ? '' : v;
});

const renderedContent = computed(() => {
  const render = props.column.customRender;
  if (!render) return null;
  return () =>
    render({
      text: displayValue.value,
      value: displayValue.value,
      record: props.record,
      index: props.rowIndex,
      column: props.column,
    });
});

// ──── 状态 ────

const isAllMode = computed(() => ctx.editMode.value === 'all');

const showEditor = computed(() =>
  ctx.isEditingCell(props.rowIndex, field.value),
);

const isActive = computed(
  () => ctx.cellActive.value && ctx.isActiveCell(props.rowIndex, field.value),
);

const isDirty = computed(
  () => !!field.value && ctx.isCellDirty(props.rowIndex, field.value),
);

const cellError = computed(() =>
  field.value ? ctx.getErrorForCell(props.rowIndex, field.value) : undefined,
);

const depState = computed(() =>
  ctx.resolveDependencyState(props.rowIndex, props.column),
);

// ──── 编辑值访问 ────

const editorValue = computed(() => {
  if (!field.value) return undefined;
  if (isAllMode.value) return props.record[field.value];
  return ctx.getEditingValue(field.value);
});

function setEditorValue(val: any): void {
  const f = field.value;
  if (!f) return;

  if (isAllMode.value) {
    const oldVal = props.record[f];
    props.record[f] = val;
    if (oldVal !== val) {
      ctx.markDirty(props.rowIndex, f);
      ctx.onFieldChange(props.rowIndex, f);
    }
    return;
  }
  ctx.setEditingValue(f, val);
}

// ──── 编辑器组件解析 ────

const adapter = computed(() => {
  const component = props.column.component;
  if (!component) return ANT_ADAPTER_MAP.input;
  if (isString(component)) {
    const found = ANT_ADAPTER_MAP[component];
    if (!found) {
      console.warn(`[AntTable] 编辑器 "${component}" 未注册`);
      return ANT_ADAPTER_MAP.input;
    }
    return found;
  }
  // 自定义组件：默认按 value 双向绑定
  return { component: component as Component, valueProp: 'value' };
});

const editorComponent = computed(() => adapter.value.component);

const staticEditorProps = computed(() => {
  const cp = props.column.componentProps;
  if (!cp) return {};
  if (typeof cp === 'function') return cp(props.record, props.column);
  return cp;
});

/** v-model + 合并 props（动态 componentProps 优先） */
const editorBindings = computed(() => {
  const { valueProp } = adapter.value;
  return {
    [valueProp]: editorValue.value,
    [`onUpdate:${valueProp}`]: setEditorValue,
    ...staticEditorProps.value,
    ...(depState.value.componentProps ?? {}),
    disabled: depState.value.disabled,
    size: 'small',
    class: 'atbl-cell-editor',
  } as Record<string, any>;
});

// ──── 编辑器 Esc ────

function onEditorEsc(): void {
  ctx.cancelEdit();
  nextTick(() => {
    ctx.tableEl.value?.focus({ preventScroll: true });
  });
}
</script>

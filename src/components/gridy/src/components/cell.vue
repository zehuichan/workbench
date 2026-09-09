<script setup lang="tsx">
import type { FunctionalComponent } from 'vue';

import type { GridyCellContext, GridyCellSlotProps, GridyDataColumn, GridyRecord } from '../types';

import { computed } from 'vue';

import { ElTooltip } from 'element-plus';

import { alignClass, widthStyle } from '../column';
import { buildEditorProps, resolveEditor } from '../editor';
import { useGridyContext } from '../tokens';
import { cellContextOf, parsePathKey } from '../tree';
import { isPlainObject } from 'es-toolkit';
import GridyExpandIcon from './expand-icon.vue';

defineOptions({ name: 'GridyCell' });

/** props 只放基本类型 + 原始行引用：未被改动的行引用不变，本格跳过重渲染 */
const props = defineProps<{
  /** 是否为键盘导航的活动单元格 */
  active: boolean;
  /** 树形：本行是否有子节点（仅 `treeHost` 时有意义） */
  canExpand?: boolean;
  col: GridyDataColumn;
  expanded?: boolean;
  /** 行在父级中的下标（顶层即原始数据下标） */
  index: number;
  /** 原始行对象（`row.original`） */
  record: GridyRecord;
  rowId: string;
  /** 路径的字符串形态（`'0.2.1'`），基本类型便于跳过重渲染 */
  rowPath: string;
  /** 树形模式下承载缩进 + 展开图标的那一列（缺省首个数据列） */
  treeHost?: boolean;
}>();

defineSlots<{
  default?: (props: GridyCellSlotProps) => any;
}>();

const { cellError, elSize, keyboardEnabled, readonly, setCell } = useGridyContext();

const path = computed(() => parsePathKey(props.rowPath));
const cellCtx = computed<GridyCellContext>(() => cellContextOf(props.record, path.value));
const value = computed(() => props.record[props.col.field]);
const error = computed(() => cellError(props.rowId, props.col.field));
const editor = computed(() => resolveEditor(props.col, readonly.value));

function setValue(next: unknown) {
  setCell(path.value, props.col.field, next);
}

const slotProps = computed<GridyCellSlotProps>(() => ({
  ...cellCtx.value,
  disabled: readonly.value,
  error: error.value,
  setValue,
  value: value.value,
}));

/** 控件 props + 双向绑定合成一个 v-bind，避免模板里的动态 prop / 事件名 */
const editorBind = computed(() => {
  if (!editor.value) {
    return undefined;
  }
  const { model } = editor.value;
  return {
    ...buildEditorProps(editor.value, props.col, cellCtx.value, elSize.value, error.value),
    [model]: value.value,
    [`onUpdate:${model}`]: setValue,
  };
});

function formatText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  if (!isPlainObject(value)) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** 只读展示：`render` > `formatter` > 纯文本 */
const ReadonlyCell: FunctionalComponent<{
  column: GridyDataColumn;
  context: GridyCellContext;
}> = ({ column, context }) => {
  const value = context.row[column.field];
  if (column.render) {
    return column.render({ ...context, value });
  }
  if (column.formatter) {
    return column.formatter({ ...context, value });
  }
  return formatText(value);
};
ReadonlyCell.props = ['column', 'context'];

/**
 * 有错时把单元格内容包进 Tooltip（hover 看文案），无错时原样渲染。
 * 不额外渲染图标——图标出现 / 消失会挤压控件宽度导致抖动。
 */
const CellErrorTooltip: FunctionalComponent<{ error?: string }> = (tooltipProps, { slots }) => {
  const content = slots.default?.() ?? [];
  if (!tooltipProps.error) {
    return content;
  }
  return (
    <ElTooltip content={tooltipProps.error} placement="top" showAfter={300}>
      {content}
    </ElTooltip>
  );
};
CellErrorTooltip.props = ['error'];
</script>

<template>
  <td
    class="gridy__td"
    :class="[alignClass(col, 'td'), { 'gridy__td--active': active, 'gridy__td--error': !!error }]"
    :data-field="keyboardEnabled ? col.field : undefined"
    :style="widthStyle(col)"
    :tabindex="keyboardEnabled ? -1 : undefined"
  >
    <CellErrorTooltip :error="error">
      <div class="gridy__cell" :class="{ 'gridy__cell--tree': treeHost }">
        <GridyExpandIcon
          v-if="treeHost"
          :can-expand="!!canExpand"
          :expanded="!!expanded"
          :row-id="rowId"
          :row-path="rowPath"
        />
        <div class="gridy__cell-main">
          <slot v-bind="slotProps">
            <component :is="editor.is" v-if="editor" v-bind="editorBind" />
            <ReadonlyCell v-else :column="col" :context="cellCtx" />
          </slot>
        </div>
      </div>
    </CellErrorTooltip>
  </td>
</template>

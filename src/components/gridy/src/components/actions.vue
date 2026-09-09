<script setup lang="tsx">
import type { FunctionalComponent } from 'vue';

import type { GridyActionContext, GridyActionItem, GridyRecord } from '../types';

import { computed, h } from 'vue';

import { ElButton, ElDropdown, ElPopconfirm } from 'element-plus';

import { useGridyContext } from '../tokens';
import { cellContextOf, parsePathKey } from '../tree';
import { isFunction, isString } from 'es-toolkit';

defineOptions({ name: 'GridyActions' });

const props = defineProps<{
  /** 当前行数据 */
  row: GridyRecord;
  /** 路径的字符串形态（`'0.2.1'`），基本类型便于跳过重渲染 */
  rowPath: string;
}>();

const { actionColumn, addRow, canRemove, elSize, readonly, removeRow } = useGridyContext();

const ctx = computed<GridyActionContext>(() => {
  const path = parsePathKey(props.rowPath);
  return {
    ...cellContextOf(props.row, path),
    addChild: () => addRow(path),
    remove: () => removeRow(path),
  };
});

/** 未配置 `items` 时的默认「删除」，与配置式按钮走同一条渲染路径 */
const defaultRemoveItem = computed<GridyActionItem>(() => {
  const { removeConfirm, removeText } = actionColumn.value ?? {};
  let confirm: string | undefined;
  if (removeConfirm) {
    confirm = isString(removeConfirm) ? removeConfirm : '确认删除该行？';
  }
  return {
    code: 'remove',
    confirm,
    danger: true,
    disabled: ({ depth }) => depth === 0 && !canRemove.value,
    label: removeText ?? '删除',
    onClick: ({ remove }) => remove(),
  };
});

const visibleActions = computed(() =>
  (actionColumn.value?.items ?? [defaultRemoveItem.value]).filter((item) => resolveShow(item)),
);

const maxVisible = computed(() => actionColumn.value?.maxVisible ?? Number.POSITIVE_INFINITY);

const primaryActions = computed(() => visibleActions.value.slice(0, maxVisible.value));

const moreActions = computed(() => visibleActions.value.slice(maxVisible.value));

function resolveShow(item: GridyActionItem): boolean {
  return isFunction(item.show) ? item.show(ctx.value) : item.show !== false;
}

function resolveDisabled(item: GridyActionItem): boolean {
  if (readonly.value) {
    return true;
  }
  return isFunction(item.disabled) ? item.disabled(ctx.value) : !!item.disabled;
}

function resolveLabel(item: GridyActionItem): string {
  return isFunction(item.label) ? item.label(ctx.value) : item.label;
}

function resolveConfirm(item: GridyActionItem): string | undefined {
  if (!item.confirm) {
    return undefined;
  }
  return isFunction(item.confirm) ? item.confirm(ctx.value) : item.confirm;
}

function actionKey(item: GridyActionItem, idx: number): string {
  return item.code ?? (isString(item.label) ? item.label : `act-${idx}`);
}

function handleClick(item: GridyActionItem) {
  if (resolveDisabled(item)) {
    return;
  }
  item.onClick(ctx.value);
}

/**
 * 内联与「更多」下拉里的按钮共用 danger / disabled / size；
 * 配了 `confirm` 时外包 ElPopconfirm。
 */
const ActionButton: FunctionalComponent<{
  item: GridyActionItem;
  variant: 'inline' | 'more';
}> = ({ item, variant }) => {
  const isMore = variant === 'more';
  const confirm = resolveConfirm(item);
  const disabled = resolveDisabled(item);
  const button = (
    <ElButton
      class={isMore ? 'gridy-actions__more-btn' : 'gridy-actions__btn'}
      disabled={disabled}
      link
      onClick={confirm ? undefined : () => handleClick(item)}
      size={elSize.value}
      type={item.danger ? 'danger' : 'primary'}
    >
      {item.icon ? h(item.icon) : null}
      {resolveLabel(item)}
    </ElButton>
  );
  if (!confirm || disabled) {
    return button;
  }
  return (
    <ElPopconfirm onConfirm={() => handleClick(item)} title={confirm}>
      {{ reference: () => button }}
    </ElPopconfirm>
  );
};
ActionButton.props = ['item', 'variant'];
</script>

<template>
  <div class="gridy-actions">
    <ActionButton
      v-for="(item, idx) in primaryActions"
      :key="actionKey(item, idx)"
      :item="item"
      variant="inline"
    />

    <ElDropdown v-if="moreActions.length > 0" trigger="click">
      <ElButton class="gridy-actions__btn" link :size="elSize" type="primary"> 更多 </ElButton>
      <template #dropdown>
        <div class="gridy-actions__more">
          <ActionButton
            v-for="(item, idx) in moreActions"
            :key="actionKey(item, idx)"
            :item="item"
            variant="more"
          />
        </div>
      </template>
    </ElDropdown>
  </div>
</template>

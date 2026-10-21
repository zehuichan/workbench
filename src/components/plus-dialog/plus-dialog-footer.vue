<script setup lang="ts" generic="T extends object = Record<string, unknown>">
import type { PlusDialogAction, PlusDialogMode } from './types';

import { computed } from 'vue';

import { ElButton } from 'element-plus';

defineOptions({ name: 'PlusDialogFooter' });

const props = withDefaults(
  defineProps<{
    actions?: PlusDialogAction<T>[];
    form: T;
    loading?: boolean;
    mode: PlusDialogMode;
    submitting?: boolean;
  }>(),
  {
    loading: false,
    submitting: false,
    actions: () => [],
  },
);

const emit = defineEmits<{
  cancel: [];
  close: [];
  create: [];
  refresh: [];
  save: [];
  saveAndClose: [];
}>();

interface ResolvedAction {
  disabled: boolean;
  handler: () => Promise<void> | void;
  key: string;
  label: string;
}

const resolvedActions = computed((): ResolvedAction[] => {
  if (props.mode === 'create') return [];
  const result: ResolvedAction[] = [];
  for (const action of props.actions) {
    const ok = action.when ? action.when(props.form) : true;
    if (!ok) {
      if ((action.fallback ?? 'hide') === 'disable') {
        result.push({
          key: action.key,
          label: action.label,
          disabled: true,
          handler: () => action.handler(props.form),
        });
      }
      continue;
    }
    result.push({
      key: action.key,
      label: action.label,
      disabled: false,
      handler: () => action.handler(props.form),
    });
  }
  return result;
});
</script>

<template>
  <div class="plus-dialog-footer flex flex-wrap justify-end">
    <template v-if="mode === 'edit'">
      <ElButton :disabled="submitting" @click="emit('cancel')">取消</ElButton>
      <ElButton :disabled="loading || submitting" @click="emit('refresh')">
        刷新
      </ElButton>
      <ElButton
        v-for="action in resolvedActions"
        :key="action.key"
        dashed
        :disabled="action.disabled || loading || submitting"
        @click="action.handler"
      >
        {{ action.label }}
      </ElButton>
      <ElButton :disabled="submitting" @click="emit('save')">保存</ElButton>
      <ElButton
        type="primary"
        :disabled="submitting"
        @click="emit('saveAndClose')"
      >
        保存并关闭
      </ElButton>
    </template>

    <template v-else-if="mode === 'view'">
      <ElButton
        v-for="action in resolvedActions"
        :key="action.key"
        dashed
        :disabled="action.disabled || loading || submitting"
        @click="action.handler"
      >
        {{ action.label }}
      </ElButton>
      <ElButton :disabled="loading || submitting" @click="emit('refresh')">
        刷新
      </ElButton>
      <ElButton @click="emit('close')">关闭</ElButton>
    </template>

    <template v-else>
      <ElButton :disabled="submitting" @click="emit('cancel')">取消</ElButton>
      <ElButton type="primary" :disabled="submitting" @click="emit('create')">
        新增
      </ElButton>
    </template>
  </div>
</template>

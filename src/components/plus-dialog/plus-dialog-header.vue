<script setup lang="ts">
import type { Component } from 'vue';

import type {
  PlusDialogMode,
  PlusDialogPermissions,
  PlusDialogShape,
} from './types';

import { computed } from 'vue';

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Fullscreen,
  PanelRight,
  Pencil,
  SquareSquare,
  Trash2,
  X,
} from '@lucide/vue';
import { ElButton, ElDivider } from 'element-plus';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/tooltip';
import { cn } from '@/utils';

defineOptions({ name: 'PlusDialogHeader' });

const props = withDefaults(
  defineProps<{
    /** Prevents record-changing actions while a load or mutation is in flight. */
    busy?: boolean;
    /** When true, the title row is the drag handle for the center shape. */
    draggable?: boolean;
    mode: PlusDialogMode;
    permissions?: PlusDialogPermissions;
    /** 1-based position in the full table; ignored in create. */
    position?: number;
    shape: PlusDialogShape;
    total?: number;
  }>(),
  {
    position: 1,
    total: 0,
    permissions: () => ({}),
    draggable: false,
    busy: false,
  },
);

const emit = defineEmits<{
  close: [];
  next: [];
  prev: [];
  remove: [];
  toggleMode: [];
  'update:shape': [shape: PlusDialogShape];
}>();

const titleText = computed(() => {
  switch (props.mode) {
    case 'create': {
      return '新建';
    }
    case 'edit': {
      return '编辑';
    }
    case 'view': {
      return '查看';
    }
    default: {
      const exhaustive: never = props.mode;
      return exhaustive;
    }
  }
});

const showPager = computed(() => props.mode !== 'create' && props.total > 0);

const canPrev = computed(
  () => !props.busy && showPager.value && props.position > 1,
);
const canNext = computed(
  () => !props.busy && showPager.value && props.position < props.total,
);

const showToggleMode = computed(() => {
  if (props.mode === 'edit') return !!props.permissions.view;
  if (props.mode === 'view') return !!props.permissions.edit;
  return false;
});

const toggleModeLabel = computed(() =>
  props.mode === 'edit' ? '查看' : '编辑',
);

const showRemove = computed(
  () => props.mode !== 'create' && !!props.permissions.remove,
);

const showRecordActions = computed(
  () => showToggleMode.value || showRemove.value,
);

const shapes: { icon: Component; key: PlusDialogShape; label: string }[] = [
  { key: 'center', label: '中间弹窗', icon: SquareSquare },
  { key: 'side', label: '侧边面板', icon: PanelRight },
  { key: 'fullscreen', label: '全屏', icon: Fullscreen },
];

const iconButton =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-(--el-border-radius-base) text-(--el-text-color-secondary) transition-colors outline-none hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary) focus-visible:outline-1 focus-visible:outline-(--el-border-color) disabled:cursor-not-allowed disabled:bg-transparent disabled:text-(--el-text-color-placeholder) disabled:hover:bg-transparent [&_svg]:size-4';
const recordActionButton = '!size-7 !p-0';
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div
      class="plus-dialog-header flex min-w-0 items-center gap-3 select-none"
      :class="{ 'cursor-move': draggable }"
      data-plus-dialog-drag-handle
    >
      <h2
        class="plus-dialog-header__title m-0 min-w-0 flex-[0_1_auto] truncate text-(length:--el-font-size-medium) font-medium text-(--el-text-color-primary)"
        aria-hidden="true"
      >
        {{ titleText }}
      </h2>
      <span class="flex-1"></span>

      <div
        v-if="showPager"
        class="plus-dialog-header__pager inline-flex items-center"
        @pointerdown.stop
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              :class="iconButton"
              :disabled="!canPrev"
              aria-label="上一条"
              @click="emit('prev')"
            >
              <ChevronLeft />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">上一条</TooltipContent>
        </Tooltip>
        <span
          class="plus-dialog-header__pager-text px-0.5 text-(length:--el-font-size-extra-small)! text-(--el-text-color-secondary) tabular-nums"
          aria-live="polite"
        >
          {{ position }} / {{ total }}
        </span>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              :class="iconButton"
              :disabled="!canNext"
              aria-label="下一条"
              @click="emit('next')"
            >
              <ChevronRight />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">下一条</TooltipContent>
        </Tooltip>
      </div>
      <ElDivider v-if="showPager" class="!mx-0" direction="vertical" />

      <div
        v-if="showRecordActions"
        class="plus-dialog-header__actions inline-flex items-center"
        @pointerdown.stop
      >
        <Tooltip v-if="showToggleMode">
          <TooltipTrigger as-child>
            <ElButton
              dashed
              :class="recordActionButton"
              :disabled="busy"
              :aria-label="toggleModeLabel"
              @click="emit('toggleMode')"
            >
              <template #icon>
                <Eye v-if="mode === 'edit'" />
                <Pencil v-else />
              </template>
            </ElButton>
          </TooltipTrigger>
          <TooltipContent side="bottom">{{ toggleModeLabel }}</TooltipContent>
        </Tooltip>
        <Tooltip v-if="showRemove">
          <TooltipTrigger as-child>
            <ElButton
              dashed
              :class="recordActionButton"
              :disabled="busy"
              aria-label="删除"
              @click="emit('remove')"
            >
              <template #icon>
                <Trash2 />
              </template>
            </ElButton>
          </TooltipTrigger>
          <TooltipContent side="bottom">删除</TooltipContent>
        </Tooltip>
      </div>
      <ElDivider v-if="showRecordActions" class="!mx-0" direction="vertical" />

      <div
        class="plus-dialog-header__shapes inline-flex shrink-0 gap-0.5 rounded-(--el-border-radius-base) bg-(--el-fill-color-lighter) p-0.5"
        @pointerdown.stop
      >
        <Tooltip v-for="item in shapes" :key="item.key">
          <TooltipTrigger as-child>
            <button
              type="button"
              :class="
                cn(
                  'inline-flex h-[22px] w-7 items-center justify-center rounded-(--el-border-radius-small) text-(--el-text-color-secondary) transition-colors outline-none hover:text-(--el-text-color-primary) focus-visible:outline-1 focus-visible:outline-(--el-border-color)',
                  shape === item.key &&
                    'is-active bg-(--el-bg-color-overlay) text-(--el-text-color-primary)',
                )
              "
              :aria-label="item.label"
              :aria-pressed="shape === item.key"
              @click="emit('update:shape', item.key)"
            >
              <component :is="item.icon" class="size-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{{ item.label }}</TooltipContent>
        </Tooltip>
      </div>

      <div class="plus-dialog-header__close flex shrink-0" @pointerdown.stop>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              :class="iconButton"
              aria-label="关闭"
              @click="emit('close')"
            >
              <X />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">关闭</TooltipContent>
        </Tooltip>
      </div>
    </div>
  </TooltipProvider>
</template>

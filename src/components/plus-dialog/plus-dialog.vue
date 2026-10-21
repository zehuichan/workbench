<script setup lang="ts" generic="T extends object = Record<string, unknown>">
import type { CSSProperties } from 'vue';

import type {
  PlusDialogAction,
  PlusDialogMode,
  PlusDialogPermissions,
  PlusDialogShape,
  PlusDialogSlotProps,
} from './types';

import {
  computed,
  nextTick,
  onScopeDispose,
  reactive,
  ref,
  useId,
  watch,
} from 'vue';

import { useLocalStorage } from '@vueuse/core';
import { ElButton, ElMessage } from 'element-plus';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import { cn } from '@/utils';

import { useDrag, useUnsavedChanges } from './composables';
import PlusDialogFooter from './plus-dialog-footer.vue';
import PlusDialogHeader from './plus-dialog-header.vue';

defineOptions({ name: 'PlusDialog' });

const props = withDefaults(
  defineProps<{
    actions?: PlusDialogAction<T>[];
    create?: (form: T) => Promise<void>;
    load?: (index: number) => Promise<T>;
    permissions?: PlusDialogPermissions;
    remove?: (form: T) => Promise<void>;
    save?: (form: T) => Promise<T>;
    shapeStorageKey?: string;
    total?: number;
    validate?: () => boolean | Promise<boolean>;
    /** Width of the center shape; side and fullscreen size themselves. */
    width?: string;
  }>(),
  {
    actions: () => [],
    create: undefined,
    load: undefined,
    permissions: () => ({}),
    remove: undefined,
    save: undefined,
    shapeStorageKey: 'workbench:plus-dialog:shape',
    total: 0,
    validate: undefined,
    width: '900px',
  },
);

const emit = defineEmits<{
  closed: [];
  created: [];
  removed: [index: number];
  saved: [record: T];
}>();

defineSlots<{
  default?: (props: PlusDialogSlotProps<T>) => unknown;
}>();
const visible = defineModel<boolean>({ default: false });
const mode = defineModel<PlusDialogMode>('mode', { default: 'view' });
const index = defineModel<number | undefined>('index', { default: undefined });
const form = defineModel<T>('form', { required: true });

const loading = ref(false);
const submitting = ref(false);
let syncingIndex = false;
let submitLock = false;
let loadRevision = 0;
const contentId = useId();

const SHAPES: readonly PlusDialogShape[] = ['center', 'side', 'fullscreen'];

function isShape(value: unknown): value is PlusDialogShape {
  return (
    typeof value === 'string' && (SHAPES as readonly string[]).includes(value)
  );
}

const storedShape = useLocalStorage<string>(props.shapeStorageKey, 'center');
const shape = computed({
  get(): PlusDialogShape {
    return isShape(storedShape.value) ? storedShape.value : 'center';
  },
  set(value: PlusDialogShape) {
    storedShape.value = value;
  },
});

const trackingEnabled = computed(
  () => mode.value === 'edit' || mode.value === 'create',
);
const { isDirty, reset, restore } = useUnsavedChanges(form, {
  enabled: trackingEnabled,
});

const position = computed(() =>
  typeof index.value === 'number' ? index.value + 1 : 1,
);
const readonly = computed(() => mode.value === 'view');
const isView = computed(() => mode.value === 'view');
const isCenter = computed(() => shape.value === 'center');

/** Side + view lets the list behind stay clickable, so the host can swap records in place. */
const passthrough = computed(() => shape.value === 'side' && isView.value);

const titleText = computed(() => {
  switch (mode.value) {
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
      const exhaustive: never = mode.value;
      return exhaustive;
    }
  }
});

const shapeClass = computed(() => {
  switch (shape.value) {
    case 'center': {
      return 'rounded-(--el-border-radius-base)';
    }
    case 'fullscreen': {
      return 'rounded-none shadow-none';
    }
    case 'side': {
      return 'rounded-none shadow-(--el-box-shadow-dark)';
    }
    default: {
      const exhaustive: never = shape.value;
      return exhaustive;
    }
  }
});

const restingStyle = computed((): CSSProperties => {
  switch (shape.value) {
    case 'center': {
      return {
        top: '60px',
        left: `calc(50% - min(${props.width}, 100% - 2rem) / 2)`,
        right: 'auto',
        bottom: 'auto',
        width: `min(${props.width}, calc(100% - 2rem))`,
        height: 'auto',
        maxHeight: 'calc(100svh - 120px)',
      };
    }
    case 'fullscreen': {
      return {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '100%',
        maxHeight: 'none',
      };
    }
    case 'side': {
      return {
        top: '0',
        right: '0',
        bottom: '0',
        left: 'auto',
        width: 'min(75vw, 1080px)',
        height: '100%',
        maxHeight: 'none',
      };
    }
    default: {
      const exhaustive: never = shape.value;
      return exhaustive;
    }
  }
});

const SHAPE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SHAPE_MS = 320;
const shapeMotion = ref<CSSProperties>({});
let shapeMotionTimer = 0;
let shapeMotionRevision = 0;

function pinBox(rect: DOMRect): CSSProperties {
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    right: 'auto',
    bottom: 'auto',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    maxWidth: 'none',
    maxHeight: 'none',
  };
}

function prefersReducedMotion(): boolean {
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

/** Reka remounts the content when `modal` flips; a shape switch must not replay the open zoom. */
const shapeSwitched = ref(false);

function queryContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-plus-dialog-id="${contentId}"]`,
  );
}

watch(shape, async (next, prev) => {
  if (prev === undefined || next === prev || !visible.value) return;
  const revision = ++shapeMotionRevision;
  shapeSwitched.value = true;
  window.clearTimeout(shapeMotionTimer);
  shapeMotion.value = {};
  if (prefersReducedMotion()) return;
  const before = queryContent();
  if (!before) return;
  const first = before.getBoundingClientRect();
  await nextTick();
  if (revision !== shapeMotionRevision) return;
  const el = queryContent();
  if (!el) return;
  const last = el.getBoundingClientRect();
  shapeMotion.value = { ...pinBox(first), transition: 'none' };
  await nextTick();
  if (revision !== shapeMotionRevision) return;
  el.getBoundingClientRect();
  requestAnimationFrame(() => {
    if (revision !== shapeMotionRevision) return;
    shapeMotion.value = {
      ...pinBox(last),
      transition: `top ${SHAPE_MS}ms ${SHAPE_EASE}, left ${SHAPE_MS}ms ${SHAPE_EASE}, width ${SHAPE_MS}ms ${SHAPE_EASE}, height ${SHAPE_MS}ms ${SHAPE_EASE}, border-radius ${SHAPE_MS}ms ${SHAPE_EASE}`,
    };
  });
  window.clearTimeout(shapeMotionTimer);
  shapeMotionTimer = window.setTimeout(() => {
    shapeMotion.value = {};
  }, SHAPE_MS + 40);
});

onScopeDispose(() => window.clearTimeout(shapeMotionTimer));

const overlayClass =
  'bg-(--el-overlay-color-lighter) supports-backdrop-filter:backdrop-blur-none';
const confirmOverlayClass = cn(overlayClass, 'z-[60]');

const {
  onPointerDown: onDragStart,
  reset: resetDrag,
  translate: dragTranslate,
} = useDrag(queryContent, { enabled: isCenter });

watch(shape, resetDrag);

const contentStyle = computed((): CSSProperties => ({
  translate: dragTranslate,
  transform: 'none',
  ...restingStyle.value,
  ...shapeMotion.value,
}));

const confirmOpen = ref(false);
const confirmContent = reactive({ message: '', confirmText: '' });
let settleConfirm: ((ok: boolean) => void) | null = null;

/** Stays inside the record dialog's focus trap, so confirming does not count as an outside click. */
function askConfirm(message: string, confirmText: string): Promise<boolean> {
  settleConfirm?.(false);
  confirmContent.message = message;
  confirmContent.confirmText = confirmText;
  confirmOpen.value = true;
  return new Promise((resolve) => {
    settleConfirm = resolve;
  });
}

function answerConfirm(ok: boolean): void {
  confirmOpen.value = false;
  const settle = settleConfirm;
  settleConfirm = null;
  settle?.(ok);
}

function cancelConfirm(): void {
  if (settleConfirm || confirmOpen.value) answerConfirm(false);
}

async function confirmDiscard(): Promise<boolean> {
  if (!trackingEnabled.value || !isDirty.value) return true;
  if (!(await askConfirm('有未保存的修改，确定放弃吗？', '放弃修改')))
    return false;
  restore();
  return true;
}

async function loadAt(nextIndex: number): Promise<void> {
  if (!props.load) {
    throw new Error(
      '[PlusDialog] "load" is required when opening an existing record.',
    );
  }
  const revision = ++loadRevision;
  loading.value = true;
  try {
    const loaded = await props.load(nextIndex);
    if (revision !== loadRevision || !visible.value) return;
    form.value = loaded;
    syncingIndex = true;
    try {
      index.value = nextIndex;
    } finally {
      syncingIndex = false;
    }
    reset(loaded);
  } catch {
    if (revision === loadRevision && visible.value) {
      ElMessage.error('加载失败，请重试');
    }
  } finally {
    if (revision === loadRevision) loading.value = false;
  }
}

async function goTo(nextIndex: number): Promise<void> {
  if (!(await confirmDiscard())) return;
  await loadAt(nextIndex);
}

async function handlePrev(): Promise<void> {
  if (typeof index.value !== 'number' || index.value <= 0) return;
  await goTo(index.value - 1);
}

async function handleNext(): Promise<void> {
  if (typeof index.value !== 'number' || index.value >= props.total - 1) return;
  await goTo(index.value + 1);
}

async function handleToggleMode(): Promise<void> {
  if (mode.value === 'edit') {
    if (!(await confirmDiscard())) return;
    mode.value = 'view';
    return;
  }
  if (mode.value === 'view' && props.permissions.edit) {
    mode.value = 'edit';
    reset();
  }
}

async function handleRemove(): Promise<void> {
  if (
    loading.value ||
    submitLock ||
    submitting.value ||
    !props.remove ||
    typeof index.value !== 'number'
  ) {
    return;
  }
  if (!(await askConfirm('确认删除吗？', '删除'))) return;
  if (loading.value || submitLock || submitting.value) return;

  const removedIndex = index.value;
  const remainingTotal = Math.max(0, props.total - 1);
  submitLock = true;
  submitting.value = true;
  try {
    await props.remove(form.value);
  } catch {
    ElMessage.error('删除失败，请重试');
    return;
  } finally {
    submitLock = false;
    submitting.value = false;
  }

  emit('removed', removedIndex);
  if (remainingTotal === 0) {
    visible.value = false;
    return;
  }
  const nextIndex = Math.min(removedIndex, remainingTotal - 1);
  await loadAt(nextIndex);
}

async function handleRefresh(): Promise<void> {
  if (loading.value || typeof index.value !== 'number') return;
  await loadAt(index.value);
}

async function runValidate(): Promise<boolean> {
  if (!props.validate) return true;
  return await props.validate();
}

async function handleSave(closeAfter: boolean): Promise<void> {
  if (loading.value) {
    ElMessage.warning('正在加载');
    return;
  }
  if (submitLock || submitting.value || !props.save) return;
  submitLock = true;
  submitting.value = true;
  try {
    if (!(await runValidate())) return;
    const saved = await props.save(form.value);
    form.value = saved;
    reset(saved);
    ElMessage.success('更新成功');
    emit('saved', saved);
    if (closeAfter) visible.value = false;
  } catch {
    ElMessage.error('保存失败，请重试');
  } finally {
    submitLock = false;
    submitting.value = false;
  }
}

async function handleCreate(): Promise<void> {
  if (loading.value) {
    ElMessage.warning('正在加载');
    return;
  }
  if (submitLock || submitting.value || !props.create) return;
  submitLock = true;
  submitting.value = true;
  try {
    if (!(await runValidate())) return;
    await props.create(form.value);
    ElMessage.success('新增成功');
    emit('created');
    visible.value = false;
  } catch {
    ElMessage.error('新增失败，请重试');
  } finally {
    submitLock = false;
    submitting.value = false;
  }
}

async function requestClose(): Promise<void> {
  if (!(await confirmDiscard())) return;
  visible.value = false;
}

function onOpenChange(open: boolean): void {
  if (open) {
    visible.value = true;
    return;
  }
  void requestClose();
}

function onInteractOutside(event: Event): void {
  if (!isView.value || passthrough.value) event.preventDefault();
}

/** Focusing the first header button would pop its tooltip, which then swallows Escape. */
function onOpenAutoFocus(event: Event): void {
  event.preventDefault();
  if (event.target instanceof HTMLElement) event.target.focus();
}

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!isView.value) event.preventDefault();
}

watch(
  visible,
  async (open, wasOpen) => {
    if (!open) {
      loadRevision += 1;
      loading.value = false;
      shapeMotionRevision += 1;
      window.clearTimeout(shapeMotionTimer);
      shapeMotion.value = {};
      shapeSwitched.value = false;
      cancelConfirm();
      if (wasOpen) emit('closed');
      return;
    }
    resetDrag();
    if (mode.value === 'create') {
      reset();
      return;
    }
    if (typeof index.value === 'number' && props.load) {
      await loadAt(index.value);
    }
  },
  { immediate: true },
);

watch(
  index,
  async (next, prev) => {
    if (syncingIndex) return;
    if (!visible.value) return;
    if (mode.value === 'create') return;
    if (typeof next !== 'number' || next === prev) return;
    if (props.load) await loadAt(next);
  },
  { flush: 'sync' },
);

onScopeDispose(() => {
  loadRevision += 1;
  shapeMotionRevision += 1;
  cancelConfirm();
});

defineExpose({
  reload: handleRefresh,
  close: requestClose,
  isDirty,
});
</script>

<template>
  <Dialog :open="visible" :modal="!passthrough" @update:open="onOpenChange">
    <DialogContent
      :data-plus-dialog-id="contentId"
      :show-close-button="false"
      :show-overlay="!passthrough"
      :overlay-class="overlayClass"
      :class="
        cn(
          'plus-dialog flex max-w-none flex-col gap-0 overflow-hidden bg-(--el-bg-color-overlay) p-0 text-(length:--el-font-size-base) text-(--el-text-color-regular) shadow-(--el-box-shadow) ring-0 transition-[border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-none',
          shapeClass,
          shapeSwitched && 'data-open:animate-none',
        )
      "
      :style="contentStyle"
      @interact-outside="onInteractOutside"
      @escape-key-down="onEscapeKeyDown"
      @open-auto-focus="onOpenAutoFocus"
    >
      <DialogHeader
        class="shrink-0 border-b border-(--el-border-color-lighter) px-4 py-2.5"
        @pointerdown="onDragStart"
      >
        <DialogTitle class="sr-only">{{ titleText }}</DialogTitle>
        <DialogDescription class="sr-only">记录弹框</DialogDescription>
        <PlusDialogHeader
          :mode="mode"
          :position="position"
          :total="total"
          :permissions="permissions"
          :shape="shape"
          :draggable="isCenter"
          :busy="loading || submitting"
          @prev="handlePrev"
          @next="handleNext"
          @toggle-mode="handleToggleMode"
          @remove="handleRemove"
          @update:shape="shape = $event"
          @close="requestClose"
        />
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-auto px-6 py-4">
        <slot
          :form="form"
          :readonly="readonly"
          :loading="loading"
          :submitting="submitting"
          :mode="mode"
        ></slot>
      </div>

      <DialogFooter
        class="mx-0 mb-0 shrink-0 rounded-none border-(--el-border-color-lighter) bg-transparent px-4 py-2.5"
      >
        <PlusDialogFooter
          :mode="mode"
          :loading="loading"
          :submitting="submitting"
          :actions="actions"
          :form="form"
          @cancel="requestClose"
          @refresh="handleRefresh"
          @save="handleSave(false)"
          @save-and-close="handleSave(true)"
          @create="handleCreate"
          @close="requestClose"
        />
      </DialogFooter>

      <Dialog
        :open="confirmOpen"
        @update:open="(open) => !open && answerConfirm(false)"
      >
        <DialogContent
          :show-close-button="false"
          :overlay-class="confirmOverlayClass"
          class="plus-dialog-confirm z-[60] rounded-(--el-border-radius-base) bg-(--el-bg-color-overlay) text-(--el-text-color-regular) shadow-(--el-box-shadow) ring-0 sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle
              class="text-(length:--el-font-size-large) text-(--el-text-color-primary)"
            >
              提示
            </DialogTitle>
            <DialogDescription
              class="text-(length:--el-font-size-base) text-(--el-text-color-regular)"
            >
              {{ confirmContent.message }}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            class="-mx-4 -mb-4 border-0 bg-transparent [&_.el-button+.el-button]:ml-0"
          >
            <ElButton @click="answerConfirm(false)">取消</ElButton>
            <ElButton type="danger" @click="answerConfirm(true)">
              {{ confirmContent.confirmText }}
            </ElButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  </Dialog>
</template>

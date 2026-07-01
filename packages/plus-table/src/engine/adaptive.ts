import { computed } from 'vue';
import { useElementBounding, useWindowSize } from '@vueuse/core';
import type { Ref } from 'vue';
import type { AdaptiveConfig, PlusTableProps } from '../types';

const DEFAULT_OFFSET_BOTTOM = 16;
const DEFAULT_MIN_HEIGHT = 200;

export interface AdaptiveOptions {
  props: PlusTableProps;
  gridRef: Ref<HTMLElement | undefined>;
  paginationRef: Ref<HTMLElement | undefined>;
}

/** 按视口剩余空间计算 el-table 的 height，随窗口与布局变化响应 */
export function createAdaptive(options: AdaptiveOptions) {
  const { props, gridRef, paginationRef } = options;

  const config = computed<Required<AdaptiveConfig>>(() => {
    const overrides = typeof props.adaptive === 'object' ? props.adaptive : {};
    return {
      mode: overrides.mode ?? 'viewport',
      offsetBottom: overrides.offsetBottom ?? DEFAULT_OFFSET_BOTTOM,
      minHeight: overrides.minHeight ?? DEFAULT_MIN_HEIGHT,
    };
  });

  /** container 模式：表格放进卡片/弹窗/分栏等自身高度受限的容器，视口像素运算天然算错 */
  const isContainerMode = computed(() => !!props.adaptive && config.value.mode === 'container');

  const { top: gridTop } = useElementBounding(gridRef);
  const { height: paginationHeight } = useElementBounding(paginationRef);
  const { height: windowHeight } = useWindowSize();

  const tableHeight = computed<number | string | undefined>(() => {
    if (!props.adaptive) return undefined;
    if (isContainerMode.value) return '100%';
    const available =
      windowHeight.value -
      gridTop.value -
      paginationHeight.value -
      config.value.offsetBottom;
    return Math.max(available, config.value.minHeight);
  });

  return { tableHeight, isContainerMode };
}

export type AdaptiveApi = ReturnType<typeof createAdaptive>;

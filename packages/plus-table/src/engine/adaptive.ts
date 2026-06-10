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
      offsetBottom: overrides.offsetBottom ?? DEFAULT_OFFSET_BOTTOM,
      minHeight: overrides.minHeight ?? DEFAULT_MIN_HEIGHT,
    };
  });

  const { top: gridTop } = useElementBounding(gridRef);
  const { height: paginationHeight } = useElementBounding(paginationRef);
  const { height: windowHeight } = useWindowSize();

  const tableHeight = computed<number | undefined>(() => {
    if (!props.adaptive) return undefined;
    const available =
      windowHeight.value -
      gridTop.value -
      paginationHeight.value -
      config.value.offsetBottom;
    return Math.max(available, config.value.minHeight);
  });

  return { tableHeight };
}

export type AdaptiveApi = ReturnType<typeof createAdaptive>;

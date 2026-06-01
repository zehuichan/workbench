import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue';

import { useEventListener, useThrottleFn } from '@vueuse/core';

import type { AdaptiveConfig } from '../types';
import {
  DEFAULT_ADAPTIVE_OFFSET_BOTTOM,
  DEFAULT_ADAPTIVE_OFFSET_TOP,
  FALLBACK_HEADER_HEIGHT,
  MIN_ADAPTIVE_BODY_HEIGHT,
} from '../constants';

export interface UseAdaptiveOptions {
  /** 自适应配置，false/undefined 表示禁用 */
  adaptive: Ref<boolean | AdaptiveConfig | undefined>;
  /** 表格容器 el（.atbl-wrapper） */
  wrapperEl: Ref<HTMLElement | null>;
}

/** 取元素占位高度（含 margin） */
function getElementFullHeight(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return rect.height + marginTop + marginBottom;
}

/**
 * 表格自适应高度 composable（输出 a-table 的 scroll.y）
 *
 * scrollY = 视口高度 - wrapper.top - offsetTop - offsetBottom
 *           - 布局占用(下方兄弟/父 padding) - 内部 header/footer - 表头高度
 *
 * 表体最小高度 MIN_ADAPTIVE_BODY_HEIGHT。
 */
export function useAdaptive(options: UseAdaptiveOptions) {
  const { adaptive, wrapperEl } = options;
  const scrollY = ref<number | undefined>(undefined);

  const enabled = computed(() => !!adaptive.value);

  const config = computed<AdaptiveConfig>(() => {
    const val = adaptive.value;
    if (!val || val === true) return {};
    return val;
  });

  const getLayoutOffset = (el: HTMLElement): number => {
    let reserved = 0;

    const style = getComputedStyle(el);
    reserved += parseFloat(style.marginBottom) || 0;

    const parentEl = el.parentElement;
    if (parentEl) {
      const parentStyle = getComputedStyle(parentEl);
      reserved += parseFloat(parentStyle.paddingBottom) || 0;
      reserved += parseFloat(parentStyle.borderBottomWidth) || 0;
    }

    const counted = new Set<Element>();
    let sibling = el.nextElementSibling;
    while (sibling) {
      counted.add(sibling);
      const sibRect = sibling.getBoundingClientRect();
      const sibStyle = getComputedStyle(sibling as HTMLElement);
      reserved += sibRect.height;
      reserved += parseFloat(sibStyle.marginTop) || 0;
      reserved += parseFloat(sibStyle.marginBottom) || 0;
      sibling = sibling.nextElementSibling;
    }

    if (config.value.excludeSelectors?.length && parentEl) {
      for (const selector of config.value.excludeSelectors) {
        const target = parentEl.querySelector(selector);
        if (target && target !== el && !counted.has(target)) {
          reserved += target.getBoundingClientRect().height;
        }
      }
    }

    return reserved;
  };

  const calcScrollY = () => {
    if (!enabled.value) {
      scrollY.value = undefined;
      return;
    }

    const el = wrapperEl.value;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const offsetTop = config.value.offsetTop ?? DEFAULT_ADAPTIVE_OFFSET_TOP;
    const offsetBottom =
      config.value.offsetBottom ?? DEFAULT_ADAPTIVE_OFFSET_BOTTOM;

    const layoutOffset = getLayoutOffset(el);

    // 扣除 wrapper 内 header/footer 高度（可选区域）
    let innerReserved = 0;
    const headerEl = el.querySelector('.atbl-header') as HTMLElement | null;
    const footerEl = el.querySelector('.atbl-footer') as HTMLElement | null;
    if (headerEl) innerReserved += getElementFullHeight(headerEl);
    if (footerEl) innerReserved += getElementFullHeight(footerEl);

    // 扣除 a-table 表头高度（scroll.y 仅控制表体）
    const theadEl = el.querySelector('.ant-table-thead') as HTMLElement | null;
    const headHeight = theadEl
      ? theadEl.getBoundingClientRect().height
      : FALLBACK_HEADER_HEIGHT;

    const calculated =
      viewportHeight -
      rect.top -
      offsetTop -
      offsetBottom -
      layoutOffset -
      innerReserved -
      headHeight;

    scrollY.value = Math.max(calculated, MIN_ADAPTIVE_BODY_HEIGHT);
  };

  const throttledCalc = useThrottleFn(calcScrollY, 100);

  useEventListener(window, 'resize', () => {
    if (enabled.value) throttledCalc();
  });

  watch(wrapperEl, (el) => {
    if (el && enabled.value) nextTick(calcScrollY);
  });

  watch([enabled, config], () => {
    if (enabled.value && wrapperEl.value) nextTick(calcScrollY);
    else if (!enabled.value) calcScrollY();
  });

  onMounted(() => {
    if (enabled.value) nextTick(calcScrollY);
  });

  return {
    /** 计算出的 scroll.y（px），undefined 表示禁用自适应 */
    scrollY,
    /** 手动触发重新计算 */
    recalculate: calcScrollY,
  };
}

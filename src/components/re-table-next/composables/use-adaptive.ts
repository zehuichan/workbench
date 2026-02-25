import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'

import { useEventListener, useThrottleFn } from '@vueuse/core'

import type { AdaptiveConfig } from '../types'
import {
  DEFAULT_ADAPTIVE_OFFSET_BOTTOM,
  DEFAULT_ADAPTIVE_OFFSET_TOP,
} from '../constants'

export interface UseAdaptiveOptions {
  /** 自适应配置，false/undefined 表示禁用 */
  adaptive: Ref<boolean | AdaptiveConfig | undefined>
  /** 表格容器 el（.re-table-next-wrapper） */
  wrapperEl: Ref<HTMLElement | null>
}

/** 取元素占位高度（含 margin），用于扣除 header/footer */
function getElementFullHeight(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const marginTop = parseFloat(style.marginTop) || 0
  const marginBottom = parseFloat(style.marginBottom) || 0
  return rect.height + marginTop + marginBottom
}

/**
 * 表格自适应高度 composable
 *
 * 计算 maxHeight = 视口高度 - rect.top - offsetTop - offsetBottom - bottomReserved - headerHeight - footerHeight
 *
 * 其中 bottomReserved 自动探测：
 *   - wrapper 自身 margin-bottom
 *   - 父元素 padding-bottom / border-bottom
 *   - wrapper 之后的兄弟元素高度 + margin
 *   - excludeSelectors 指定的元素
 *
 * header/footer 为 wrapper 内可选区域，若存在则自动测量并扣除，避免双滚动条。
 *
 * 确保表格恰好填满剩余视口，只保留表格内部滚动条，不产生页面级滚动条。
 */
export function useAdaptive(options: UseAdaptiveOptions) {
  const { adaptive, wrapperEl } = options
  const maxHeight = ref<number | string | undefined>(undefined)

  const enabled = computed(() => !!adaptive.value)

  const config = computed<AdaptiveConfig>(() => {
    const val = adaptive.value
    if (!val || val === true) return {}
    return val
  })

  /**
   * 计算 wrapper 下方被布局消耗的空间：
   *   - wrapper 自身 margin-bottom
   *   - 父元素 padding-bottom / border-bottom
   *   - wrapper 之后的所有兄弟元素（高度 + margin）
   *   - excludeSelectors 指定的元素
   */
  const getLayoutOffset = (el: HTMLElement): number => {
    let reserved = 0

    // 1. wrapper 自身 margin-bottom
    const style = getComputedStyle(el)
    reserved += parseFloat(style.marginBottom) || 0

    // 2. 父元素 padding-bottom + border-bottom
    const parentEl = el.parentElement
    if (parentEl) {
      const parentStyle = getComputedStyle(parentEl)
      reserved += parseFloat(parentStyle.paddingBottom) || 0
      reserved += parseFloat(parentStyle.borderBottomWidth) || 0
    }

    // 3. wrapper 之后的兄弟元素
    let sibling = el.nextElementSibling
    while (sibling) {
      const sibRect = sibling.getBoundingClientRect()
      const sibStyle = getComputedStyle(sibling as HTMLElement)
      reserved += sibRect.height
      reserved += parseFloat(sibStyle.marginTop) || 0
      reserved += parseFloat(sibStyle.marginBottom) || 0
      sibling = sibling.nextElementSibling
    }

    // 4. excludeSelectors 指定的额外元素
    if (config.value.excludeSelectors?.length && parentEl) {
      for (const selector of config.value.excludeSelectors) {
        const target = parentEl.querySelector(selector)
        if (target && target !== el) {
          reserved += target.getBoundingClientRect().height
        }
      }
    }

    return reserved
  }

  const calcMaxHeight = () => {
    if (!enabled.value) {
      // 传空字符串让 el-table 清除 max-height 内联样式
      maxHeight.value = ''
      return
    }

    const el = wrapperEl.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    const offsetTop = config.value.offsetTop ?? DEFAULT_ADAPTIVE_OFFSET_TOP
    const offsetBottom =
      config.value.offsetBottom ?? DEFAULT_ADAPTIVE_OFFSET_BOTTOM

    const layoutOffset = getLayoutOffset(el)

    // 扣除 wrapper 内 header/footer 高度（可选区域），避免双滚动条
    let innerReserved = 0
    const headerEl = el.querySelector('.re-table-next-header') as HTMLElement | null
    const footerEl = el.querySelector('.re-table-next-footer') as HTMLElement | null
    if (headerEl) innerReserved += getElementFullHeight(headerEl)
    if (footerEl) innerReserved += getElementFullHeight(footerEl)

    const calculatedHeight =
      viewportHeight -
      rect.top -
      offsetTop -
      offsetBottom -
      layoutOffset -
      innerReserved
    maxHeight.value = Math.max(calculatedHeight, 100) // 最小 100px
  }

  // 节流：resize 时最多 100ms 执行一次
  const throttledCalc = useThrottleFn(calcMaxHeight, 100)

  // ── 监听 window resize（使用 useEventListener 自动清理） ──
  useEventListener(window, 'resize', () => {
    if (enabled.value) throttledCalc()
  })

  // ── 核心：当 wrapperEl 就位后首次计算 ──
  watch(wrapperEl, (el) => {
    if (el && enabled.value) {
      // 使用 nextTick 确保 DOM 完全稳定后再取 getBoundingClientRect
      nextTick(calcMaxHeight)
    }
  })

  // ── 当 adaptive 开关或配置变化时重新计算 ──
  watch(
    [enabled, config],
    () => {
      if (enabled.value && wrapperEl.value) {
        nextTick(calcMaxHeight)
      } else if (!enabled.value) {
        // 调用 calcMaxHeight 统一走清除逻辑（设置 '' 而非 undefined）
        calcMaxHeight()
      }
    },
  )

  // ── onMounted 兜底：确保首次计算一定发生 ──
  onMounted(() => {
    if (enabled.value) {
      nextTick(calcMaxHeight)
    }
  })

  return {
    /** 计算出的 max-height（px），undefined 表示禁用自适应 */
    maxHeight,
    /** 手动触发重新计算 */
    recalculate: calcMaxHeight,
  }
}

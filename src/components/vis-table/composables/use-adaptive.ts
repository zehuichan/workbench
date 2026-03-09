import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

import { useThrottleFn } from '@vueuse/core'

export interface UseVTableAdaptiveOptions {
  /** 是否启用自适应 */
  enabled: Ref<boolean>
  /** 表格容器 el（.vtable-wrapper） */
  wrapperEl: Ref<HTMLElement | null>
}

/**
 * VTable 容器自适应 composable
 *
 * 使用 ResizeObserver 监听容器尺寸变化，返回 width、height 整数（VTable 要求避免 Canvas 抖动）。
 */
export function useVTableAdaptive(options: UseVTableAdaptiveOptions) {
  const { enabled, wrapperEl } = options
  const width = ref<number>(800)
  const height = ref<number>(500)

  const calcSize = () => {
    if (!enabled.value) return

    const el = wrapperEl.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const w = Math.max(Math.floor(rect.width), 100)
    const h = Math.max(Math.floor(rect.height), 100)

    width.value = w
    height.value = h
  }

  const throttledCalc = useThrottleFn(calcSize, 100)

  let observer: ResizeObserver | null = null

  const setupObserver = () => {
    const el = wrapperEl.value
    if (!el || !enabled.value) return

    observer = new ResizeObserver(() => {
      throttledCalc()
    })
    observer.observe(el)
    nextTick(calcSize)
  }

  const disconnectObserver = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  watch(
    [enabled, wrapperEl],
    () => {
      disconnectObserver()
      if (enabled.value && wrapperEl.value) {
        setupObserver()
      } else if (wrapperEl.value) {
        nextTick(calcSize)
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    if (enabled.value && wrapperEl.value) {
      nextTick(calcSize)
    }
  })

  onUnmounted(() => {
    disconnectObserver()
  })

  return {
    width,
    height,
    recalculate: calcSize,
  }
}

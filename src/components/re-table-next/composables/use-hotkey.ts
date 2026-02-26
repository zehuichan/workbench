import { ref, type Ref } from 'vue'

import { useEventListener } from '@vueuse/core'

import type { HotkeyBinding, HotkeyContext, ReTableNextColumn, RowData } from '../types'

export interface UseHotkeyOptions {
  /** 表格外层容器元素，需要设置 tabindex 使其可聚焦 */
  wrapperEl: Ref<HTMLElement | null>
  /** 是否启用热键（hotkeyEnabled prop） */
  hotkeyEnabled: Ref<boolean>
  /** Tab 键是否在表格内导航（tabNavigation prop） */
  tabNavigation: Ref<boolean>
  /** 导航函数（来自 useNavigation） */
  navigate: (rowDelta: number, colDelta: number) => void
  /** 绝对定位函数（来自 useNavigation） */
  focusCell: (rowIndex: number, colIndex: number) => void
  /** 当前激活行索引 */
  activeRowIndex: Ref<number>
  /** 当前激活列索引（navigableColumns 中） */
  activeColIndex: Ref<number>
  /** 表格数据 */
  data: Ref<RowData[]>
  /** 可导航列 */
  navigableColumns: Ref<ReTableNextColumn[]>
  /** 用户自定义热键（hotkeys prop） */
  customHotkeys?: Ref<HotkeyBinding[] | undefined>
}

/** 热键字符串格式：`ctrl+shift+key`，不区分大小写 */
function matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.toLowerCase().split('+').map((s) => s.trim())
  const mainKey = parts.find(
    (p) => !['ctrl', 'shift', 'alt', 'meta'].includes(p),
  )
  if (!mainKey) return false

  return (
    event.ctrlKey === parts.includes('ctrl') &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt') &&
    event.metaKey === parts.includes('meta') &&
    event.key.toLowerCase() === mainKey
  )
}

/**
 * 热键引擎 composable
 *
 * 分发顺序：
 *   1. 用户自定义热键中 override: true 的条目（先于内置热键）
 *   2. 内置热键（Arrow、Tab、Enter、Home、End、Ctrl+Home/End）
 *   3. 用户自定义热键中非 override 的条目（内置热键未处理才走这里）
 *
 * 焦点管理：
 *   - 监听 wrapperEl focusin / focusout 跟踪 hasFocus
 *   - 仅 hasFocus 为 true 时响应 keydown
 */
export function useHotkey(options: UseHotkeyOptions) {
  const {
    wrapperEl,
    hotkeyEnabled,
    tabNavigation,
    navigate,
    focusCell,
    activeRowIndex,
    activeColIndex,
    data,
    navigableColumns,
    customHotkeys,
  } = options

  /** 表格容器是否持有焦点 */
  const hasFocus = ref(false)

  // ── 焦点跟踪 ──

  useEventListener(wrapperEl, 'focusin', () => {
    hasFocus.value = true
  })

  useEventListener(wrapperEl, 'focusout', (e: FocusEvent) => {
    // relatedTarget 为 null 或不在 wrapper 内时，才真正失焦
    if (!wrapperEl.value?.contains(e.relatedTarget as Node | null)) {
      hasFocus.value = false
    }
  })

  // ── 热键处理 ──

  function buildContext(event: KeyboardEvent): HotkeyContext {
    return {
      event,
      activeRowIndex: activeRowIndex.value,
      activeColIndex: activeColIndex.value,
      row:
        activeRowIndex.value >= 0
          ? (data.value[activeRowIndex.value] ?? null)
          : null,
      column:
        activeColIndex.value >= 0
          ? (navigableColumns.value[activeColIndex.value] ?? null)
          : null,
      tableData: data.value,
      columns: navigableColumns.value,
      navigate,
      // 阶段 3 实现
      startEdit: () => {},
      cancelEdit: () => {},
      updateCellValue: () => {},
    }
  }

  /** 确保存在激活单元格，若无则激活首个 */
  function ensureActive(): boolean {
    if (activeRowIndex.value < 0 || activeColIndex.value < 0) {
      focusCell(0, 0)
      return true
    }
    return false
  }

  /**
   * 处理内置热键
   * @returns true 表示已处理，false 表示未处理（交给后续自定义热键）
   */
  function handleBuiltinKey(event: KeyboardEvent): boolean {
    const rowCount = data.value.length
    const colCount = navigableColumns.value.length
    if (rowCount === 0 || colCount === 0) return false

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        ensureActive() || navigate(-1, 0)
        return true

      case 'ArrowDown':
        event.preventDefault()
        ensureActive() || navigate(1, 0)
        return true

      case 'ArrowLeft':
        event.preventDefault()
        ensureActive() || navigate(0, -1)
        return true

      case 'ArrowRight':
        event.preventDefault()
        ensureActive() || navigate(0, 1)
        return true

      case 'Tab':
        if (!tabNavigation.value) return false
        event.preventDefault()
        ensureActive() || navigate(0, event.shiftKey ? -1 : 1)
        return true

      case 'Enter':
        event.preventDefault()
        ensureActive() || navigate(event.shiftKey ? -1 : 1, 0)
        return true

      case 'Home':
        event.preventDefault()
        if (event.ctrlKey) {
          // Ctrl+Home → 跳到第一行第一列
          focusCell(0, 0)
        } else {
          // Home → 当前行首列
          focusCell(Math.max(0, activeRowIndex.value), 0)
        }
        return true

      case 'End':
        event.preventDefault()
        if (event.ctrlKey) {
          // Ctrl+End → 跳到最后一行最后一列
          focusCell(rowCount - 1, colCount - 1)
        } else {
          // End → 当前行末列
          focusCell(Math.max(0, activeRowIndex.value), colCount - 1)
        }
        return true

      default:
        return false
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!hotkeyEnabled.value || !hasFocus.value) return

    const ctx = buildContext(event)

    // 1. 用户 override 热键（先于内置）
    for (const binding of customHotkeys?.value?.filter((h) => h.override) ?? []) {
      if (!matchesHotkey(event, binding.key)) continue
      if (binding.when && !binding.when(ctx)) continue
      if (binding.preventDefault !== false) event.preventDefault()
      if (binding.stopPropagation) event.stopPropagation()
      const result = binding.handler(ctx)
      if (result !== false) return
    }

    // 2. 内置热键
    if (handleBuiltinKey(event)) return

    // 3. 用户普通自定义热键
    for (const binding of customHotkeys?.value?.filter((h) => !h.override) ?? []) {
      if (!matchesHotkey(event, binding.key)) continue
      if (binding.when && !binding.when(ctx)) continue
      if (binding.preventDefault !== false) event.preventDefault()
      if (binding.stopPropagation) event.stopPropagation()
      binding.handler(ctx)
      return
    }
  }

  useEventListener(wrapperEl, 'keydown', handleKeydown)

  return {
    hasFocus,
  }
}

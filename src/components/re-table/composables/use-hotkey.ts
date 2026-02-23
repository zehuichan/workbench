import { computed, type Ref } from 'vue'

import { useEventListener } from '@vueuse/core'

import type { HotkeyBinding, HotkeyContext } from '../types'

export interface UseHotkeyOptions {
  enabled: Ref<boolean>
  activated: Ref<boolean>
  contextFactory: () => HotkeyContext
  builtinBindings: HotkeyBinding[]
  customBindings: Ref<HotkeyBinding[]>
}

// Ctrl=1, Shift=2, Alt=4, Meta=8
const MODIFIER_CTRL = 1
const MODIFIER_SHIFT = 2
const MODIFIER_ALT = 4
const MODIFIER_META = 8

const MODIFIER_MAP: Record<string, number> = {
  ctrl: MODIFIER_CTRL,
  control: MODIFIER_CTRL,
  shift: MODIFIER_SHIFT,
  alt: MODIFIER_ALT,
  meta: MODIFIER_META,
  cmd: MODIFIER_META,
  command: MODIFIER_META,
}

interface ParsedKey {
  baseKey: string
  modifierMask: number
}

function parseKeyDescriptor(key: string): ParsedKey {
  const parts = key.split('+').map((p) => p.trim().toLowerCase())
  let modifierMask = 0
  let baseKey = ''

  for (const part of parts) {
    if (part in MODIFIER_MAP) {
      modifierMask |= MODIFIER_MAP[part]
    } else {
      baseKey = part
    }
  }

  return { baseKey, modifierMask }
}

function getModifierMask(e: KeyboardEvent): number {
  return (
    (e.ctrlKey ? MODIFIER_CTRL : 0) |
    (e.shiftKey ? MODIFIER_SHIFT : 0) |
    (e.altKey ? MODIFIER_ALT : 0) |
    (e.metaKey ? MODIFIER_META : 0)
  )
}

function buildMapKey(modifierMask: number, baseKey: string): string {
  return `${modifierMask}:${baseKey}`
}

export function useHotkey(options: UseHotkeyOptions) {
  const { enabled, activated, contextFactory, builtinBindings, customBindings } =
    options

  const hotkeyMap = computed(() => {
    const map = new Map<string, HotkeyBinding[]>()

    const addBinding = (binding: HotkeyBinding) => {
      const { baseKey, modifierMask } = parseKeyDescriptor(binding.key)
      const mapKey = buildMapKey(modifierMask, baseKey)

      if (binding.override) {
        map.set(mapKey, [binding])
      } else {
        const existing = map.get(mapKey) ?? []
        existing.push(binding)
        map.set(mapKey, existing)
      }
    }

    for (const binding of builtinBindings) {
      addBinding(binding)
    }

    for (const binding of customBindings.value) {
      addBinding(binding)
    }

    return map
  })

  // 5.3.2 连续快速按键时用 requestAnimationFrame 节流，避免卡顿
  let rafId = 0
  let pending: { event: KeyboardEvent; binding: HotkeyBinding } | null = null

  function flushPending() {
    rafId = 0
    if (!pending) return
    const { event, binding } = pending
    pending = null
    const ctx = contextFactory()
    ctx.event = event
    if (binding.when && !binding.when(ctx)) return
    binding.handler(ctx)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!enabled.value || !activated.value) return

    const modifierMask = getModifierMask(event)
    const baseKey = event.key.toLowerCase()
    const mapKey = buildMapKey(modifierMask, baseKey)
    const bindings = hotkeyMap.value.get(mapKey)

    if (!bindings?.length) return

    const ctx = contextFactory()
    ctx.event = event

    for (const binding of bindings) {
      if (binding.when && !binding.when(ctx)) continue

      // preventDefault 必须同步调用
      if (binding.preventDefault !== false) {
        event.preventDefault()
      }
      if (binding.stopPropagation) {
        event.stopPropagation()
      }

      // 节流：将 handler 推迟到下一帧
      pending = { event, binding }
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(flushPending)
      return
    }
  }

  // 使用 capture 阶段，优先于 el-select 等 popper 组件捕获 ESC
  useEventListener(document, 'keydown', handleKeydown, { capture: true })
}

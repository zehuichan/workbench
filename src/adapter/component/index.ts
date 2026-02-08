import type { Component } from 'vue'
import components from './element'

import { createGlobalState } from '@vueuse/core'

const useGlobalState = createGlobalState(() => {
  const components: Record<string, Component> = {}

  function getComponents() {
    return components
  }

  function setComponents(value: Record<string, Component>) {
    Object.assign(components, value)
  }

  return {
    components,
    getComponents,
    setComponents,
  }
})

export const globalShareState = useGlobalState()

export async function initComponentAdapter() {
  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components)
}

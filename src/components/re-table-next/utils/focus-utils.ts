import { nextTick, type Ref } from 'vue'

const EDITOR_INPUT_SELECTOR = 'input, textarea, [contenteditable="true"]'

/**
 * 创建编辑器聚焦函数，绑定到指定容器。
 * 使用双 nextTick 确保编辑器组件已完成渲染后再聚焦。
 */
export function createEditorFocuser(wrapperEl: Ref<HTMLElement | null>) {
  return (): void => {
    nextTick(() => {
      nextTick(() => {
        const wrapper = wrapperEl.value
        if (!wrapper) return
        const activeCell = wrapper.querySelector('td.re-table-next-cell--active')
        const editorEl = (
          activeCell?.querySelector(EDITOR_INPUT_SELECTOR) ??
          wrapper.querySelector(EDITOR_INPUT_SELECTOR)
        ) as HTMLElement | null
        if (editorEl && document.activeElement !== editorEl) {
          editorEl.focus()
        }
      })
    })
  }
}

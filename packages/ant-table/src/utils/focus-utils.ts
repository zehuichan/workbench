import { nextTick, type Ref } from 'vue';

const EDITOR_INPUT_SELECTOR =
  'input, textarea, [contenteditable="true"], .ant-select-selector';

/**
 * 创建编辑器聚焦函数，绑定到指定容器。
 * 双 nextTick 确保编辑器组件渲染完成后再聚焦。
 */
export function createEditorFocuser(wrapperEl: Ref<HTMLElement | null>) {
  return (): void => {
    nextTick(() => {
      nextTick(() => {
        const wrapper = wrapperEl.value;
        if (!wrapper) return;
        const activeCell = wrapper.querySelector('.atbl-cell--active');
        const editorEl = (activeCell?.querySelector(EDITOR_INPUT_SELECTOR) ??
          wrapper.querySelector(EDITOR_INPUT_SELECTOR)) as HTMLElement | null;
        if (editorEl && document.activeElement !== editorEl) {
          editorEl.focus();
        }
      });
    });
  };
}

<script setup lang="ts">
import { computed, createApp, h, ref } from 'vue';

import { useElementSize } from '@vueuse/core';
import { ElOption, ElSelect } from 'element-plus';
import type { EditContext } from '@visactor/vtable-editors';
import { InputEditor } from '@visactor/vtable-editors';
import { ListTable, register } from '@visactor/vue-vtable';

/**
 * 与官方 Arco 示例（ListTable-editor-arco）同思路：在 IEditor.onStart 里用 createApp + h()
 * 挂载 Vue 组件，实现与 Element Plus 等 UI 库的自定义编辑器集成。
 * @see https://github.com/VisActor/VTable/issues/5061
 */
class ElementPlusSelectEditor {
  root: ReturnType<typeof createApp> | null = null;
  element: HTMLElement | null = null;
  container: HTMLElement | null = null;
  currentValue: string | null = null;

  onStart(editorContext: EditContext) {
    const { container, referencePosition, value } = editorContext;
    this.container = container;
    this.createElement(String(value ?? ''));
    if (value != null && value !== '') this.setValue(String(value));
    if (referencePosition?.rect) this.adjustPosition(referencePosition.rect);
  }

  createElement(defaultValue: string) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.padding = '1px';
    div.style.boxSizing = 'border-box';
    this.container?.appendChild(div);

    const app = this.createVueApp(defaultValue);
    app.mount(div);
    this.root = app;
    this.element = div;
  }

  createVueApp(defaultValue: string) {
    const self = this;
    return createApp({
      data() {
        return {
          currentValue: defaultValue,
          cities: ['北京', '上海', '广州', '深圳'],
        };
      },
      render() {
        return h('div', { class: 'vtable-el-plus-editor-root' }, [
          h(
            ElSelect,
            {
              modelValue: this.currentValue,
              placeholder: '选择城市',
              style: { width: '100%', height: '32px' },
              teleported: true,
              popperClass: 'vtable-el-select-dropdown',
              'onUpdate:modelValue': (value: string) => {
                this.currentValue = value;
                self.setValue(value);
              },
            },
            {
              default: () =>
                this.cities.map((city: string) =>
                  h(ElOption, {
                    key: city,
                    label: city,
                    value: city,
                    class: 'vtable-el-option',
                  }),
                ),
            },
          ),
        ]);
      },
    });
  }

  getValue() {
    return this.currentValue;
  }

  setValue(value: string) {
    this.currentValue = value;
  }

  adjustPosition(rect: { top: number; left: number; width: number; height: number }) {
    if (this.element) {
      this.element.style.top = `${rect.top}px`;
      this.element.style.left = `${rect.left}px`;
      this.element.style.width = `${rect.width}px`;
      this.element.style.height = `${rect.height}px`;
    }
  }

  onEnd() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.element && this.container) {
      this.container.removeChild(this.element);
      this.element = null;
    }
  }

  isEditorElement(target: HTMLElement) {
    return (this.element?.contains(target) ?? false) || this.isClickPopUp(target);
  }

  isClickPopUp(target: HTMLElement | null) {
    let el: HTMLElement | null = target;
    while (el) {
      if (
        el.classList?.contains('vtable-el-option') ||
        el.classList?.contains('vtable-el-select-dropdown') ||
        el.classList?.contains('el-select-dropdown') ||
        el.classList?.contains('el-popper')
      ) {
        return true;
      }
      el = el.parentNode as HTMLElement | null;
    }
    return false;
  }
}

const inputEditor = new InputEditor();
register.editor('input-editor', inputEditor);
register.editor('el-plus-select-editor', new ElementPlusSelectEditor());

function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const records = Array.from({ length: 10 }).map((_, i) => {
  const first = generateRandomString(10);
  const last = generateRandomString(4);
  return {
    id: i + 1,
    email1: `${first}_${last}@xxx.com`,
    name: first,
    lastName: last,
    address: `No.${i + 100} ${generateRandomString(10)} ${generateRandomString(5)} ${generateRandomString(5)}`,
    sex: i % 2 === 0 ? 'boy' : 'girl',
    work: i % 2 === 0 ? 'back-end engineer' : 'front-end engineer',
    city: 'beijing',
  };
});

const tableOptions = {
  columns: [
    { field: 'id', title: 'ID', width: 80, sort: true },
    {
      field: 'full name',
      title: 'Full name',
      columns: [
        {
          field: 'name',
          title: 'First Name\n(input editor)',
          width: 140,
          editor: 'input-editor',
        },
        {
          field: 'lastName',
          title: 'Last Name\n(input editor)',
          width: 100,
          editor: 'input-editor',
        },
      ],
    },
    {
      field: 'address',
      title: 'location\n(el-plus-select)',
      width: 400,
      editor: 'el-plus-select-editor',
    },
  ],
  enableLineBreak: true,
  autoWrapText: true,
  limitMaxAutoWidth: 700,
  heightMode: 'autoHeight',
  editCellTrigger: 'click',
  keyboardOptions: {
    copySelected: true,
    pasteValueToCell: true,
    selectAllOnCtrlA: true,
  },
};

/** 画布需要明确像素宽高：用容器尺寸驱动，随窗口与布局变化自动更新 */
const tableHostRef = ref<HTMLElement | null>(null);
const { width: hostWidth, height: hostHeight } = useElementSize(tableHostRef);
const tablePixelSize = computed(() => {
  const w = Math.max(0, Math.floor(hostWidth.value));
  const h = Math.max(0, Math.floor(hostHeight.value));
  return { w, h };
});
</script>

<template>
  <div class="vtable-el-plus-demo">
    <p class="vtable-el-plus-demo__intro">
      复现
      <a
        href="https://github.com/VisActor/VTable/issues/5061"
        target="_blank"
        rel="noopener noreferrer"
      >
        VTable #5061
      </a>
      ：用 Vue 虚拟 DOM（<code>createApp</code> + <code>h()</code>）挂载 Element Plus
      <code>ElSelect</code> 作为自定义单元格编辑器（与官方 Arco Select 示例同模式）。
    </p>
    <div ref="tableHostRef" class="vtable-el-plus-demo__table-host">
      <ListTable
        v-if="tablePixelSize.w > 0 && tablePixelSize.h > 0"
        :options="tableOptions"
        :records="records"
        :width="tablePixelSize.w"
        :height="tablePixelSize.h"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.vtable-el-plus-demo {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - var(--docs-header-h, 56px) - 88px);
  padding: 8px 0;
}

.vtable-el-plus-demo__intro {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);

  a {
    color: var(--el-color-primary);
  }

  code {
    padding: 0 4px;
    font-size: 13px;
    border-radius: 4px;
    background: var(--el-fill-color-light);
  }
}

.vtable-el-plus-demo__table-host {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>

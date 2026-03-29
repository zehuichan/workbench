<script setup lang="ts">
import { computed, createVNode, h, nextTick, onMounted, ref, render } from 'vue';

import { useElementSize } from '@vueuse/core';
import { ElInput, ElPopover, ElTable, ElTableColumn } from 'element-plus';
import type { EditContext, RectProps } from '@visactor/vtable-editors';
import { ListTable, register } from '@visactor/vue-vtable';

/**
 * 与官方 PR 一致：用 Vue 的 render + vnode（h / createVNode）把 Element Plus 挂进编辑器容器，
 * 单价列使用 ElInput + ElPopover（内嵌 ElTable 展示历史价）。
 * @see https://github.com/VisActor/VTable/pull/5080
 */
const inputValue = ref('');

const HISTORY_COLUMNS = [
  { prop: 'price', label: '历史单价', width: 80 },
  { prop: 'date', label: '更新时间', width: 130 },
] as const;

const HISTORY_DATA = [
  { price: 2.41, date: '2026-03-27' },
  { price: 5.67, date: '2026-03-28' },
];

class PriceInputEditor {
  private container: HTMLElement | null = null;
  private editorDom: HTMLElement | null = null;

  async onStart({ container, referencePosition, value }: EditContext<string>) {
    this.container = container;
    inputValue.value = value ?? '';

    const editorVNode = h(
      'div',
      {
        id: 'vtable-elplus-price-editor',
        style: {
          position: 'absolute',
          padding: '4px',
          width: '100%',
          boxSizing: 'border-box',
        },
      },
      h(
        ElPopover,
        { placement: 'right', trigger: 'hover', width: 200, teleported: true },
        {
          reference: () =>
            createVNode(ElInput, {
              modelValue: inputValue.value,
              'onUpdate:modelValue': (val: string) => {
                inputValue.value = val;
              },
              type: 'number',
              min: 0,
              style: { width: '100%' },
            }),
          default: () =>
            h(
              ElTable,
              { width: '200px', data: HISTORY_DATA },
              () => HISTORY_COLUMNS.map((col) => h(ElTableColumn, { ...col })),
            ),
        },
      ),
    );

    render(editorVNode, container);

    await nextTick();
    this.editorDom = document.getElementById('vtable-elplus-price-editor');
    if (referencePosition?.rect && this.editorDom) {
      this.adjustPosition(referencePosition.rect);
    }
  }

  adjustPosition(rect: RectProps) {
    if (!this.editorDom) return;
    this.editorDom.style.top = `${rect.top}px`;
    this.editorDom.style.left = `${rect.left}px`;
    this.editorDom.style.width = `${rect.width}px`;
    this.editorDom.style.height = `${rect.height}px`;
  }

  getValue() {
    return inputValue.value?.toString() ?? '';
  }

  onEnd() {
    if (this.container) {
      render(null, this.container);
    }
    this.container = null;
    this.editorDom = null;
  }

  isEditorElement(target: HTMLElement) {
    if (this.editorDom?.contains(target)) return true;
    let el: HTMLElement | null = target;
    while (el) {
      if (el.classList?.contains('el-popper') || el.classList?.contains('el-select-dropdown')) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }
}

register.editor('price-editor', new PriceInputEditor());

const SUPERSTORE_JSON =
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/North_American_Superstore_data.json';

const tableOptions = {
  columns: [
    { field: 'Order ID', title: 'Order ID', width: 'auto' },
    /** 数据源字段为 Sales；放在左侧避免要横向滚到最右才看得见 */
    {
      field: 'Sales',
      title: '单价（Sales）\n点击编辑',
      width: 130,
      minWidth: 110,
      editor: 'price-editor',
    },
    { field: 'Customer ID', title: 'Customer ID', width: 'auto' },
    { field: 'Product Name', title: 'Product Name', width: 'auto' },
    { field: 'Category', title: 'Category', width: 'auto' },
    { field: 'Sub-Category', title: 'Sub-Category', width: 'auto' },
    { field: 'Region', title: 'Region', width: 'auto' },
    { field: 'City', title: 'City', width: 'auto' },
    { field: 'Order Date', title: 'Order Date', width: 'auto' },
    { field: 'Quantity', title: 'Quantity', width: 'auto' },
    { field: 'Profit', title: 'Profit', width: 'auto' },
  ],
  enableLineBreak: true,
  autoWrapText: true,
  limitMaxAutoWidth: 700,
  heightMode: 'autoHeight' as const,
  editCellTrigger: 'click' as const,
  keyboardOptions: {
    copySelected: true,
    pasteValueToCell: true,
    selectAllOnCtrlA: true,
  },
};

const records = ref<Record<string, unknown>[]>([]);
const loadError = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch(SUPERSTORE_JSON);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    records.value = (await res.json()) as Record<string, unknown>[];
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e);
  }
});

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
      对齐
      <a
        href="https://github.com/VisActor/VTable/pull/5080"
        target="_blank"
        rel="noopener noreferrer"
      >
        VTable PR #5080
      </a>
      ：使用 <code>render</code> + <code>h</code> / <code>createVNode</code> 在单元格编辑器中渲染 Element Plus。第二列标题为「单价（Sales）」：单击该列任意单元格进入编辑；鼠标悬停在输入框上可展开 Popover 查看示例历史价表。数据为 North American Superstore JSON。
    </p>
    <p v-if="loadError" class="vtable-el-plus-demo__error">数据加载失败：{{ loadError }}</p>
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

.vtable-el-plus-demo__error {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-color-danger);
}

.vtable-el-plus-demo__table-host {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>

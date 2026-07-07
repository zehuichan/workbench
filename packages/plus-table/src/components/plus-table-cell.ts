import { defineComponent, h, inject } from 'vue';
import { ElTooltip } from 'element-plus';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import type { PropType, VNodeChild } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { ColumnNode, RowData } from '../types';

/**
 * 单元格纯渲染：全部状态与编辑绑定来自 engine.getCellView 一次性算出的视图模型，
 * 本组件只做「读取视图模型 -> 拼 VNode / 类名」，不触达 editing/selection/validation 等内部状态。
 */
export default defineComponent({
  name: 'PlusTableCell',
  props: {
    row: { type: Object as PropType<RowData>, required: true },
    rowIndex: { type: Number, required: true },
    node: { type: Object as PropType<ColumnNode>, required: true },
  },
  setup(props) {
    const engine = inject(PLUS_TABLE_INJECTION_KEY);
    if (!engine) {
      throw new Error('[PlusTable] PlusTableCell 必须在 PlusTable 内部使用');
    }

    function renderDisplay(value: unknown): VNodeChild {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const slot = column.prop
        ? engine!.slots[`cell-${column.prop}`]
        : undefined;
      if (slot) return slot({ row, rowIndex, column, value });
      if (column.render) {
        return column.render({ row, rowIndex, column, value });
      }
      if (column.formatter) {
        return column.formatter(
          row,
          column as TableColumnCtx<RowData>,
          value,
          rowIndex,
        );
      }
      return value == null ? '' : String(value);
    }

    function editorWrapperClass(
      align: string | undefined,
    ): (string | Record<string, boolean>)[] {
      return ['ptbl-cell__editor', align ? `ptbl-cell__editor--${align}` : ''];
    }

    return () => {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const prop = column.prop;
      const editorSlot = prop ? engine!.slots[`editor-${prop}`] : undefined;
      const view = engine!.getCellView(row, rowIndex, node, !!editorSlot);

      const content = view.editing
        ? h('div', { class: editorWrapperClass(column.align) }, [
            view.editorSlotProps
              ? editorSlot!(view.editorSlotProps)
              : view.editorBind
                ? h(view.editorBind.component as never, view.editorBind.bind)
                : null,
          ])
        : renderDisplay(view.value);

      const cell = h(
        'div',
        {
          class: [
            'ptbl-cell',
            {
              'ptbl-cell--active': view.active && !view.editing,
              'ptbl-cell--editing': view.editing,
              // cell 模式编辑中：单元格蓝框是唯一边框（编辑器内部去边框）
              'ptbl-cell--editing-focus': view.editing && view.mode === 'cell',
              // row 模式整行进编：编辑器平时无边框，仅聚焦格高亮
              'ptbl-cell--editing-quiet': view.editing && view.mode === 'row',
              'ptbl-cell--editable':
                view.editable && !view.editing && view.mode === 'cell',
              'ptbl-cell--disabled': view.disabled,
              'ptbl-cell--error': !!view.error,
              'ptbl-cell--required': view.required,
              'ptbl-cell--dirty': view.dirty,
            },
          ],
          'data-ptbl-col': node.id,
        },
        [content],
      );

      return view.error
        ? h(
            ElTooltip,
            { content: view.error.message, placement: 'top', effect: 'dark' },
            { default: () => cell },
          )
        : cell;
    };
  },
});

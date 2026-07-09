import { defineComponent, h } from 'vue';
import { ElTooltip } from 'element-plus';
import { usePlusTable } from '../tokens';
import { getCellView } from './render-helper';
import { getCellClasses, getEditorWrapperClass } from './style-helper';
import type { PropType, VNodeChild } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { RowData } from '../table/defaults';
import type { ColumnNode } from '../table-column/defaults';

/**
 * 单元格纯渲染：全部状态与编辑绑定来自 getCellView 一次性算出的视图模型，
 * 本组件只做「读取视图模型 -> 拼 VNode / 类名」，不触达 editing/current/validation 等内部状态。
 */
export default defineComponent({
  name: 'PlusTableCell',
  props: {
    row: { type: Object as PropType<RowData>, required: true },
    rowIndex: { type: Number, required: true },
    node: { type: Object as PropType<ColumnNode>, required: true },
  },
  setup(props) {
    const table = usePlusTable();

    function renderDisplay(value: unknown): VNodeChild {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const slot = column.prop ? table.slots[`cell-${column.prop}`] : undefined;
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

    return () => {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const prop = column.prop;
      const editorSlot = prop ? table.slots[`editor-${prop}`] : undefined;
      const view = getCellView(table, row, rowIndex, node, !!editorSlot);

      const content = view.editing
        ? h('div', { class: getEditorWrapperClass(column.align) }, [
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
          class: getCellClasses(view),
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

import { defineComponent, h, inject } from 'vue';
import { ElTableColumn } from 'element-plus';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import TableCell from './table-cell';
import type { PropType, VNodeChild } from 'vue';
import type { ColumnNode, RowData } from '../types';

/** 递归渲染列（多级表头 children），叶子列承载 PlusTableCell */
export default defineComponent({
  name: 'PlusTableColumnNode',
  props: {
    node: { type: Object as PropType<ColumnNode>, required: true },
  },
  setup(props) {
    const engine = inject(PLUS_TABLE_INJECTION_KEY);
    if (!engine) {
      throw new Error('[PlusTable] PlusTableColumnNode 必须在 PlusTable 内部使用');
    }

    function renderNode(node: ColumnNode, index: number): VNodeChild {
      const column = node.column;

      if (node.children?.length) {
        return h(
          ElTableColumn,
          {
            // index 进 key：顺序变化时强制重挂载，确保 el-table store 的列序与渲染一致
            key: `${index}:${node.id}`,
            label: column.title,
            align: column.align,
            ...column.columnProps,
          },
          {
            default: () => node.children!.map((child, i) => renderNode(child, i)),
          },
        );
      }

      const headerSlot = column.field
        ? engine!.slots[`header-${column.field}`]
        : undefined;

      return h(
        ElTableColumn,
        {
          key: `${index}:${node.id}`,
          prop: column.field,
          label: column.title,
          minWidth: column.minWidth,
          fixed: column.fixed,
          align: column.align,
          // header-dragend 调宽时用 columnKey 找回叶子列
          columnKey: node.id,
          ...column.columnProps,
          width: engine!.columns.widthMap.value[node.id] ?? column.width,
        },
        {
          header: () =>
            h(
              'span',
              {
                class: [
                  'ptbl-header-cell',
                  { 'ptbl-header-cell--required': column.required },
                ],
              },
              headerSlot
                ? headerSlot({ column })
                : (column.title ?? column.field ?? ''),
            ),
          default: (scope: { row: RowData; $index: number }) =>
            scope.$index >= 0
              ? h(TableCell, { row: scope.row, rowIndex: scope.$index, node })
              : null,
        },
      );
    }

    return () => renderNode(props.node, 0);
  },
});

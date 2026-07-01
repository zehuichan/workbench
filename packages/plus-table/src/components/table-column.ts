import { defineComponent, h, inject } from 'vue';
import { ElTableColumn } from 'element-plus';
import { isSpecialColumn, PLUS_TABLE_INJECTION_KEY } from '../constants';
import TableCell from './table-cell';
import type { PropType, VNodeChild } from 'vue';
import type { ColumnNode, PlusTableColumn, RowData } from '../types';

/** 过滤掉不透传给 el-table-column 的 PlusTable 扩展属性，其余原生 TableColumnCtx 属性直接透传 */
function nativeProps(column: PlusTableColumn): Record<string, unknown> {
  const {
    component: _component,
    componentProps: _componentProps,
    modelProp: _modelProp,
    editable: _editable,
    rules: _rules,
    required: _required,
    dependencies: _dependencies,
    render: _render,
    visible: _visible,
    settingDisabled: _settingDisabled,
    children: _children,
    ...rest
  } = column;
  return rest;
}

/** 递归渲染列（多级表头 children），叶子列承载 PlusTableCell；特殊列（selection/index/expand）交给 el-table 原生渲染 */
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

    function renderHeader(column: PlusTableColumn): VNodeChild {
      const headerSlot = column.prop ? engine!.slots[`header-${column.prop}`] : undefined;
      return h(
        'span',
        { class: ['ptbl-header-cell', { 'ptbl-header-cell--required': column.required }] },
        headerSlot ? headerSlot({ column }) : (column.label ?? column.prop ?? ''),
      );
    }

    function renderNode(node: ColumnNode, index: number): VNodeChild {
      const column = node.column;

      if (node.children?.length) {
        return h(
          ElTableColumn,
          {
            // index 进 key：顺序变化时强制重挂载，确保 el-table store 的列序与渲染一致
            key: `${index}:${node.id}`,
            ...nativeProps(column),
          },
          {
            header: () => renderHeader(column),
            default: () => node.children!.map((child, i) => renderNode(child, i)),
          },
        );
      }

      // 特殊列（selection/index/expand）：不接管 default/header slot，原生勾选框/序号/展开图标由 el-table 自行渲染
      if (isSpecialColumn(column)) {
        return h(ElTableColumn, {
          key: `${index}:${node.id}`,
          columnKey: node.id,
          ...nativeProps(column),
        });
      }

      return h(
        ElTableColumn,
        {
          key: `${index}:${node.id}`,
          // header-dragend 调宽时用 columnKey 找回叶子列
          columnKey: node.id,
          ...nativeProps(column),
          width: engine!.columns.widthMap.value[node.id] ?? column.width,
        },
        {
          header: () => renderHeader(column),
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

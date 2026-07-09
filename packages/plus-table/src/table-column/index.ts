import { defineComponent, h } from 'vue';
import { ElTableColumn } from 'element-plus';
import { usePlusTable } from '../tokens';
import { isNativeRenderColumn } from '../util';
import PlusTableCell from '../table-cell';
import type { PropType, VNodeChild } from 'vue';
import type { RowData } from '../table/defaults';
import type { ColumnNode, PlusTableColumn } from './defaults';

/** 过滤掉不透传给 el-table-column 的 PlusTable 扩展属性，其余原生 TableColumnCtx 属性直接透传 */
function nativeProps(column: PlusTableColumn): Record<string, unknown> {
  const {
    editor: _editor,
    editable: _editable,
    rules: _rules,
    required: _required,
    dependencies: _dependencies,
    render: _render,
    visible: _visible,
    children: _children,
    ...rest
  } = column;
  return rest;
}

/**
 * 递归渲染列（多级表头 children），叶子列承载 PlusTableCell；
 * 原生特殊列（selection/index/expand）交给 el-table 原生渲染；operation（操作列）仍走 PlusTableCell。
 */
export default defineComponent({
  name: 'PlusTableColumnNode',
  props: {
    node: { type: Object as PropType<ColumnNode<any>>, required: true },
  },
  setup(props) {
    const table = usePlusTable();

    function renderHeader(column: PlusTableColumn): VNodeChild {
      const headerSlot = column.prop
        ? table.slots[`header-${column.prop}`]
        : undefined;
      return h(
        'span',
        {
          class: [
            'ptbl-header-cell',
            { 'ptbl-header-cell--required': column.required },
          ],
        },
        headerSlot
          ? headerSlot({ column })
          : (column.label ?? column.prop ?? ''),
      );
    }

    /**
     * 子树叶子 id 指纹。分组列的 default slot 在 el-table-column 内部的渲染器里执行，
     * 闭包捕获的 children 是普通数组，slot 执行时不读任何响应式源——子列显隐/排序后
     * slot 不会重新渲染。把指纹编进 key，子树变化时强制重挂载整组来同步 el-table 列注册。
     */
    function subtreeKey(node: ColumnNode): string {
      return node.children?.length
        ? node.children.map(subtreeKey).join(',')
        : node.id;
    }

    function renderNode(node: ColumnNode, index: number): VNodeChild {
      const column = node.column;

      if (node.children?.length) {
        return h(
          ElTableColumn,
          {
            // index 进 key：顺序变化时强制重挂载，确保 el-table store 的列序与渲染一致
            key: `${index}:${node.id}:${subtreeKey(node)}`,
            ...nativeProps(column),
          },
          {
            header: () => renderHeader(column),
            default: () =>
              node.children!.map((child, i) => renderNode(child, i)),
          },
        );
      }

      // 原生特殊列（selection/index/expand）：不接管 default/header slot，勾选框/序号/展开图标由 el-table 自行渲染
      if (isNativeRenderColumn(column)) {
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
          width: table.store.states.widthMap.value[node.id] ?? column.width,
        },
        {
          header: () => renderHeader(column),
          default: (scope: { row: RowData; $index: number }) =>
            scope.$index >= 0
              ? h(PlusTableCell, {
                  row: scope.row,
                  rowIndex: scope.$index,
                  node,
                })
              : null,
        },
      );
    }

    return () => renderNode(props.node, 0);
  },
});

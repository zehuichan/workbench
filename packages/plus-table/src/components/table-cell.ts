import { defineComponent, h, inject } from 'vue';
import { ElOption, ElTooltip } from 'element-plus';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import { resolveEditor } from '../editors/registry';
import type { PropType, VNodeChild } from 'vue';
import type { ColumnNode, EditorOption, RowData } from '../types';

/**
 * 单元格：展示态 / 编辑器 / 错误 tooltip / 状态类名。
 * 状态类名打在本组件内层元素上（而非 el-table 的 cell-class-name 回调），
 * 使 active / error / editing 随响应式状态即时刷新。
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
      const slot = column.field ? engine!.slots[`cell-${column.field}`] : undefined;
      if (slot) return slot({ row, rowIndex, column, value });
      if (column.render) return column.render({ row, rowIndex, column, value });
      if (column.formatter) return column.formatter(value, row, rowIndex);
      return value == null ? '' : String(value);
    }

    function renderEditor(componentProps: Record<string, unknown>): VNodeChild {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const field = column.field!;
      const isCellMode = (engine!.props.editMode ?? 'cell') === 'cell';
      const current = isCellMode ? engine!.editing.draft.value : row[field];
      // 编辑器文本对齐跟随列对齐
      const editorClass = [
        'ptbl-cell__editor',
        column.align ? `ptbl-cell__editor--${column.align}` : '',
      ];

      const setValue = (value: unknown) => {
        if (isCellMode) engine!.editing.updateDraft(value);
        else engine!.writeCell(row, rowIndex, field, value);
      };

      const editorSlot = engine!.slots[`editor-${field}`];
      if (editorSlot) {
        return h('div', { class: editorClass }, [
          ...editorSlot({
            row,
            rowIndex,
            column,
            value: current,
            setValue,
            commit: () => engine!.editing.commitEdit(),
            cancel: () => engine!.editing.cancelEdit(),
          }),
        ]);
      }

      const resolved = resolveEditor(column.editor);

      const { options: depOptions, ...depProps } = componentProps;
      const optionsRaw =
        (depOptions as EditorOption[] | undefined) ?? resolved.options;
      const optionList =
        typeof optionsRaw === 'function' ? optionsRaw(row, rowIndex) : (optionsRaw ?? []);

      const bind: Record<string, unknown> = {
        ...resolved.props,
        ...depProps,
        [resolved.modelProp]: current,
        [`onUpdate:${resolved.modelProp}`]: (value: unknown) => {
          setValue(value);
          if (isCellMode && resolved.trigger === 'change') {
            engine!.editing.commitEdit();
          }
        },
        onBlur: () => {
          if (isCellMode) {
            if (resolved.trigger === 'blur') engine!.editing.commitEdit();
          } else {
            engine!.handleEditorBlur(row, rowIndex, field);
          }
        },
      };

      let children: Record<string, () => VNodeChild> | undefined;
      if (resolved.withOptions) {
        children = {
          default: () =>
            optionList.map((opt) =>
              h(ElOption, {
                key: String(opt.value),
                label: opt.label,
                value: opt.value,
                disabled: opt.disabled,
              }),
            ),
        };
      } else if (optionList.length && bind.options === undefined) {
        // 自定义组件的 options 以 prop 透传
        bind.options = optionList;
      }

      return h('div', { class: editorClass }, [
        h(resolved.component as never, bind, children),
      ]);
    }

    return () => {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const field = column.field;
      const value = field ? row[field] : undefined;
      const mode = engine!.props.editMode ?? 'cell';

      const colIndex = engine!.columns.leafIndexById.value.get(node.id) ?? -1;
      const inGrid = colIndex >= 0;
      const editing = inGrid && engine!.editing.isCellEditing(rowIndex, colIndex);
      const canEdit = inGrid && engine!.editing.canEditCell(rowIndex, colIndex);
      const active = inGrid && engine!.selection.isActive(rowIndex, colIndex);
      const error = field ? engine!.validation.getCellError(row, field) : undefined;

      const depState = column.dependencies
        ? engine!.dependencies.getState(row, rowIndex, column)
        : undefined;
      const rawEditable =
        mode !== 'none' &&
        !!field &&
        (typeof column.editable === 'function'
          ? column.editable(row, rowIndex)
          : !!column.editable);
      const disabledByDep = rawEditable && !!depState?.disabled;

      const content = editing
        ? renderEditor(depState?.componentProps ?? {})
        : renderDisplay(value);

      const cell = h(
        'div',
        {
          class: [
            'ptbl-cell',
            {
              'ptbl-cell--active': active && !editing,
              'ptbl-cell--editing': editing,
              // cell 模式编辑中：单元格蓝框是唯一边框（编辑器内部去边框）
              'ptbl-cell--editing-focus': editing && mode === 'cell',
              // row 模式整行进编：编辑器平时无边框，仅聚焦格高亮
              'ptbl-cell--editing-quiet': editing && mode === 'row',
              'ptbl-cell--editable': canEdit && !editing && mode === 'cell',
              'ptbl-cell--disabled': disabledByDep,
              'ptbl-cell--error': !!error,
            },
          ],
        },
        [content],
      );

      return error
        ? h(
            ElTooltip,
            { content: error.message, placement: 'top', effect: 'dark' },
            { default: () => cell },
          )
        : cell;
    };
  },
});

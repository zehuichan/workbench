import { defineComponent, h, inject } from 'vue';
import { ElTooltip } from 'element-plus';
import { PLUS_TABLE_INJECTION_KEY } from '../constants';
import { resolveEditor } from '../editors/registry';
import type { PropType, VNodeChild } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import type { ColumnNode, RowData } from '../types';

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
      const slot = column.prop ? engine!.slots[`cell-${column.prop}`] : undefined;
      if (slot) return slot({ row, rowIndex, column, value });
      if (column.render) {
        return column.render({ row, rowIndex, column, value });
      }
      if (column.formatter) {
        return column.formatter(row, column as TableColumnCtx<RowData>, value, rowIndex);
      }
      return value == null ? '' : String(value);
    }

    function renderEditor(dynamicProps: Record<string, unknown>): VNodeChild {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const prop = column.prop!;
      const isCellMode = (engine!.props.editMode ?? 'cell') === 'cell';
      // 编辑器文本对齐跟随列对齐
      const editorClass = [
        'ptbl-cell__editor',
        column.align ? `ptbl-cell__editor--${column.align}` : '',
      ];

      const editorSlot = engine!.slots[`editor-${prop}`];
      if (editorSlot) {
        const current = isCellMode ? engine!.editing.draft.value : row[prop];
        const setValue = (value: unknown) => {
          if (isCellMode) engine!.editing.updateDraft(value);
          else engine!.writeCell(row, rowIndex, prop, value);
        };
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

      const resolved = resolveEditor(column.component);
      const modelProp = column.modelProp ?? resolved.modelProp;

      // row/table 模式下文本类（trigger: 'blur'）编辑器走按 rowKey:prop 缓冲的 live draft，
      // 失焦才真正 writeCell 提交；否则每敲一个字符都直写会把撤销粒度、脏追踪、校验打得很碎。
      // 离散型（trigger: 'change'）编辑器与 cell 模式维持「变更/提交即写」的原语义不变。
      const rowKey = !isCellMode ? engine!.getRowKeyStr(row) : '';
      const useLiveDraft = !isCellMode && resolved.trigger === 'blur';
      const liveDraft = useLiveDraft ? engine!.editing.getLiveDraft(rowKey, prop) : undefined;

      const current = isCellMode
        ? engine!.editing.draft.value
        : liveDraft?.has
          ? liveDraft.value
          : row[prop];

      const setValue = (value: unknown) => {
        if (isCellMode) engine!.editing.updateDraft(value);
        else if (useLiveDraft) engine!.editing.setLiveDraft(rowKey, prop, value);
        else engine!.writeCell(row, rowIndex, prop, value);
      };

      // 静态 componentProps（可为函数）→ 联动 componentProps 覆盖同名项，优先级更高
      const staticProps =
        typeof column.componentProps === 'function'
          ? column.componentProps(row, column)
          : column.componentProps ?? {};

      const bind: Record<string, unknown> = {
        ...resolved.componentProps,
        ...staticProps,
        ...dynamicProps,
        [modelProp]: current,
        [`onUpdate:${modelProp}`]: (value: unknown) => {
          setValue(value);
          if (isCellMode && resolved.trigger === 'change') {
            engine!.editing.commitEdit();
          }
        },
        onBlur: () => {
          if (isCellMode) {
            // 失焦统一提交：change 型编辑器选值时已经 commitEdit 过（此时是安全空操作），
            // 这里补上「未触发 change 就失焦」的兜底，修复此前卡在编辑态不出来的问题
            engine!.editing.commitEdit();
            return;
          }
          if (useLiveDraft) engine!.editing.flushLiveDraft(row, rowIndex, rowKey, prop);
          engine!.handleEditorBlur(row, rowIndex, prop);
        },
      };

      return h('div', { class: editorClass }, [h(resolved.component as never, bind)]);
    }

    return () => {
      const { row, rowIndex, node } = props;
      const column = node.column;
      const prop = column.prop;
      const value = prop ? row[prop] : undefined;
      const mode = engine!.props.editMode ?? 'cell';

      const colIndex = engine!.columns.leafIndexById.value.get(node.id) ?? -1;
      const inGrid = colIndex >= 0;
      const editing = inGrid && engine!.editing.isCellEditing(rowIndex, colIndex);
      const canEdit = inGrid && engine!.editing.canEditCell(rowIndex, colIndex);
      const active = inGrid && engine!.selection.isActive(rowIndex, colIndex);
      const error = prop ? engine!.validation.getCellError(row, prop) : undefined;

      const depState = column.dependencies
        ? engine!.dependencies.getState(row, rowIndex, column)
        : undefined;
      const rawEditable =
        mode !== 'none' &&
        !!prop &&
        (typeof column.editable === 'function'
          ? !!column.editable(row, rowIndex)
          : !!column.editable);
      const disabledByDep = rawEditable && !!depState?.disabled;
      // 动态必填：联动算出来的必填状态格内即时可见，不必等提交校验失败才发现
      const isRequired = !!column.required || !!depState?.required;
      const isDirty = !!prop && engine!.dirty.isCellDirty(engine!.getRowKeyStr(row), prop);

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
              'ptbl-cell--required': isRequired,
              'ptbl-cell--dirty': isDirty,
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

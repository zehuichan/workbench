import type { CellView } from './render-helper';

export function getCellClasses(view: CellView) {
  return [
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
  ];
}

export function getEditorWrapperClass(
  align: string | undefined,
): (string | Record<string, boolean>)[] {
  return ['ptbl-cell__editor', align ? `ptbl-cell__editor--${align}` : ''];
}

import {
  ElCheckbox,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElSwitch,
  ElTimePicker,
} from 'element-plus';
import type { Component } from 'vue';
import type {
  BuiltinEditorType,
  ColumnEditor,
  ColumnEditorConfig,
  EditorOption,
  RowData,
} from '../types';

export interface EditorAdapter {
  component: Component;
  componentProps?: Record<string, unknown>;
  /** 提交时机：blur=失焦提交（文本类）；change=变更即提交（选择类） */
  trigger: 'blur' | 'change';
}

export const EDITOR_REGISTRY: Record<BuiltinEditorType, EditorAdapter> = {
  input: { component: ElInput, trigger: 'blur' },
  textarea: {
    component: ElInput,
    componentProps: { type: 'textarea', autosize: true },
    trigger: 'blur',
  },
  number: { component: ElInputNumber, trigger: 'blur' },
  select: { component: ElSelect, trigger: 'change' },
  'date-picker': { component: ElDatePicker, trigger: 'change' },
  'time-picker': { component: ElTimePicker, trigger: 'change' },
  switch: { component: ElSwitch, trigger: 'change' },
  checkbox: { component: ElCheckbox, trigger: 'change' },
};

export interface ResolvedEditor {
  component: Component;
  props: Record<string, unknown>;
  trigger: 'blur' | 'change';
  /** options 渲染为 el-option 子节点（编辑器是 ElSelect 时） */
  withOptions: boolean;
  modelProp: string;
  options?: EditorOption[] | ((row: RowData, rowIndex: number) => EditorOption[]);
}

function isComponentLike(value: unknown): value is Component {
  if (typeof value === 'function') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    ('setup' in value || 'render' in value || 'template' in value)
  );
}

/** 把列上的 editor 配置归一化为可直接渲染的描述 */
export function resolveEditor(editor?: ColumnEditor): ResolvedEditor {
  if (typeof editor === 'string') {
    const adapter = EDITOR_REGISTRY[editor] ?? EDITOR_REGISTRY.input;
    return {
      component: adapter.component,
      props: { ...adapter.componentProps },
      trigger: adapter.trigger,
      withOptions: adapter.component === ElSelect,
      modelProp: 'modelValue',
    };
  }

  if (editor && isComponentLike(editor)) {
    return {
      component: editor,
      props: {},
      trigger: 'blur',
      withOptions: editor === ElSelect,
      modelProp: 'modelValue',
    };
  }

  const config = (editor ?? {}) as ColumnEditorConfig;
  if (config.component) {
    return {
      component: config.component,
      props: { ...config.props },
      trigger: 'blur',
      withOptions: config.component === ElSelect,
      modelProp: config.modelProp ?? 'modelValue',
      options: config.options,
    };
  }

  const adapter = EDITOR_REGISTRY[config.type ?? 'input'] ?? EDITOR_REGISTRY.input;
  return {
    component: adapter.component,
    props: { ...adapter.componentProps, ...config.props },
    trigger: adapter.trigger,
    withOptions: adapter.component === ElSelect,
    modelProp: config.modelProp ?? 'modelValue',
    options: config.options,
  };
}

/**
 * 「选中即输入」时把首个可打印字符转换为编辑器草稿。
 * 返回 undefined 表示该编辑器不种入字符，仅进入编辑态。
 */
export function typedCharToDraft(editor: ColumnEditor | undefined, char: string): unknown {
  const component = resolveEditor(editor).component;
  if (component === ElInput) return char;
  if (component === ElInputNumber) {
    return /^[0-9]$/.test(char) ? Number(char) : undefined;
  }
  return undefined;
}

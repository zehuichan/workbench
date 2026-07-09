/**
 * 单元格编辑器组件适配器：把列上的 editor 配置归一化为可渲染的组件描述。
 * 命名与 vben 体系的 component adapter 对齐。
 */
import {
  ElCheckbox,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSwitch,
  ElTimePicker,
} from 'element-plus';
import type { Component } from 'vue';
import type { RowContext, RowData } from '../table/defaults';
import type { ColumnEditor, EditorConfig } from '../table-column/defaults';

export interface EditorAdapter {
  component: Component;
  componentProps?: Record<string, unknown>;
  /** 提交时机：blur=失焦提交（文本类）；change=变更即提交（选择类） */
  trigger: 'blur' | 'change';
}

export const EDITOR_REGISTRY = {
  input: { component: ElInput, trigger: 'blur' },
  textarea: {
    component: ElInput,
    componentProps: { type: 'textarea', autosize: true },
    trigger: 'blur',
  },
  'input-number': { component: ElInputNumber, trigger: 'blur' },
  select: { component: ElSelectV2, trigger: 'change' },
  'date-picker': { component: ElDatePicker, trigger: 'change' },
  'time-picker': { component: ElTimePicker, trigger: 'change' },
  switch: { component: ElSwitch, trigger: 'change' },
  checkbox: { component: ElCheckbox, trigger: 'change' },
} satisfies Record<string, EditorAdapter>;

/** 内置编辑器标识，由 EDITOR_REGISTRY 的键推导——新增编辑器只需扩展注册表 */
export type BuiltinEditorType = keyof typeof EDITOR_REGISTRY;

/** satisfies 会保留每个条目各自的窄类型（如无 componentProps），这里收敛成统一形状供查表用 */
const TYPED_REGISTRY: Record<BuiltinEditorType, EditorAdapter> =
  EDITOR_REGISTRY;

export interface ResolvedEditor {
  component: Component;
  /** 内置编辑器默认 props 与 editor.props（静态/函数式）按此优先级合并后的最终 props；
   * dependencies.componentProps 覆盖同名项由渲染层负责，不在此处合并 */
  componentProps: Record<string, unknown>;
  trigger: 'blur' | 'change';
  modelProp: string;
}

interface EditorBase {
  component: Component;
  trigger: 'blur' | 'change';
  modelProp: string;
  adapterProps: Record<string, unknown>;
}

function isBuiltinType(value: unknown): value is BuiltinEditorType {
  return typeof value === 'string' && value in TYPED_REGISTRY;
}

function isComponentLike(value: unknown): value is Component {
  if (typeof value === 'function') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    ('setup' in value || 'render' in value || 'template' in value)
  );
}

/** 解析出编辑器的组件本体 / 提交时机 / v-model prop 名 / 内置适配器默认 props，不涉及 editor.props（可能是函数，需要行上下文） */
function resolveEditorBase<T extends RowData = RowData>(
  editor: ColumnEditor<T> | undefined,
): EditorBase {
  if (isBuiltinType(editor)) {
    const adapter = TYPED_REGISTRY[editor];
    return {
      component: adapter.component,
      trigger: adapter.trigger,
      modelProp: 'modelValue',
      adapterProps: { ...adapter.componentProps },
    };
  }
  if (isComponentLike(editor)) {
    return {
      component: editor,
      trigger: 'blur',
      modelProp: 'modelValue',
      adapterProps: {},
    };
  }
  const config = (editor ?? {}) as EditorConfig<T>;
  if (config.component) {
    return {
      component: config.component,
      trigger: 'blur',
      modelProp: config.modelProp ?? 'modelValue',
      adapterProps: {},
    };
  }
  const adapter =
    TYPED_REGISTRY[config.type as BuiltinEditorType] ?? TYPED_REGISTRY.input;
  return {
    component: adapter.component,
    trigger: adapter.trigger,
    modelProp: config.modelProp ?? 'modelValue',
    adapterProps: { ...adapter.componentProps },
  };
}

/** 把列上的 editor 配置归一化为可直接渲染的描述；ctx 供 editor.props 为函数时求值 */
export function resolveEditor<T extends RowData = RowData>(
  editor: ColumnEditor<T> | undefined,
  ctx: RowContext<T>,
): ResolvedEditor {
  const base = resolveEditorBase(editor);
  const configProps =
    isBuiltinType(editor) || isComponentLike(editor)
      ? undefined
      : (editor as EditorConfig<T> | undefined)?.props;
  const resolvedProps =
    typeof configProps === 'function' ? configProps(ctx) : (configProps ?? {});
  return {
    component: base.component,
    componentProps: { ...base.adapterProps, ...resolvedProps },
    trigger: base.trigger,
    modelProp: base.modelProp,
  };
}

/**
 * 「选中即输入」时把首个可打印字符转换为编辑器草稿。
 * 返回 undefined 表示该编辑器不种入字符，仅进入编辑态。
 */
export function typedCharToDraft<T extends RowData = RowData>(
  editor: ColumnEditor<T> | undefined,
  char: string,
): unknown {
  const { component } = resolveEditorBase(editor);
  if (component === ElInput) return char;
  if (component === ElInputNumber) {
    return /^[0-9]$/.test(char) ? Number(char) : undefined;
  }
  return undefined;
}

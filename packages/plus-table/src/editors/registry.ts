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
const TYPED_REGISTRY: Record<BuiltinEditorType, EditorAdapter> = EDITOR_REGISTRY;

export interface ResolvedEditor {
  component: Component;
  /** 内置编辑器的默认 props（textarea 的 autosize 等），静态/联动 componentProps 在调用处覆盖同名项 */
  componentProps: Record<string, unknown>;
  trigger: 'blur' | 'change';
  modelProp: string;
}

function isComponentLike(value: unknown): value is Component {
  if (typeof value === 'function') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    ('setup' in value || 'render' in value || 'template' in value)
  );
}

/** 把列上的 component 配置归一化为可直接渲染的描述 */
export function resolveEditor(component?: BuiltinEditorType | Component): ResolvedEditor {
  if (component && isComponentLike(component)) {
    return { component, componentProps: {}, trigger: 'blur', modelProp: 'modelValue' };
  }

  const adapter = TYPED_REGISTRY[component as BuiltinEditorType] ?? TYPED_REGISTRY.input;
  return {
    component: adapter.component,
    componentProps: { ...adapter.componentProps },
    trigger: adapter.trigger,
    modelProp: 'modelValue',
  };
}

/**
 * 「选中即输入」时把首个可打印字符转换为编辑器草稿。
 * 返回 undefined 表示该编辑器不种入字符，仅进入编辑态。
 */
export function typedCharToDraft(
  component: BuiltinEditorType | Component | undefined,
  char: string,
): unknown {
  const resolved = resolveEditor(component).component;
  if (resolved === ElInput) return char;
  if (resolved === ElInputNumber) {
    return /^[0-9]$/.test(char) ? Number(char) : undefined;
  }
  return undefined;
}

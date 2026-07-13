/**
 * 单元格编辑器组件适配器：把列上的 component / componentProps 归一化为可渲染描述。
 * 命名与 vben FormSchema 的 component adapter 对齐。
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
import { isPlainObject } from 'es-toolkit';
import type { Component } from 'vue';
import type { RowContext, RowData } from '../table/defaults';

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

/** 列上的编辑控件：内置标识或自定义 Vue 组件 */
export type ColumnComponent = BuiltinEditorType | Component;

export interface EditorColumnFields<T extends RowData = RowData> {
  /**
   * 编辑控件；editable 且未配置时默认 input。
   * 内置标识见 BuiltinEditorType，或传入自定义 Vue 组件。
   */
  component?: ColumnComponent;
  /** 透传给编辑控件的 props；dependencies.componentProps 覆盖同名项 */
  componentProps?:
    | Record<string, unknown>
    | ((ctx: RowContext<T>) => Record<string, unknown>);
  /** 自定义组件的 v-model prop 名，默认 modelValue */
  modelProp?: string;
}

export interface ResolvedEditor {
  component: Component;
  /** 注册表默认 props 与列 componentProps 合并后的最终 props；
   * dependencies.componentProps 覆盖同名项由渲染层负责，不在此处合并 */
  componentProps: Record<string, unknown>;
  trigger: 'blur' | 'change';
  modelProp: string;
}

function isBuiltinType(value: unknown): value is BuiltinEditorType {
  return typeof value === 'string' && Object.hasOwn(TYPED_REGISTRY, value);
}

function isComponentLike(value: unknown): value is Component {
  if (typeof value === 'function') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    ('setup' in value || 'render' in value || 'template' in value)
  );
}

function resolveModelProp(value: unknown): string {
  if (value === undefined) return 'modelValue';
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError('[PlusTable] modelProp 必须是非空字符串。');
  }
  return value;
}

function resolveComponent(
  component: ColumnComponent | undefined,
  modelProp = 'modelValue',
): Pick<ResolvedEditor, 'component' | 'trigger' | 'modelProp'> & {
  defaults: Record<string, unknown>;
} {
  if (component === undefined || isBuiltinType(component)) {
    const adapter = TYPED_REGISTRY[component ?? 'input'];
    return {
      component: adapter.component,
      trigger: adapter.trigger,
      modelProp,
      defaults: { ...adapter.componentProps },
    };
  }
  if (isComponentLike(component)) {
    return { component, trigger: 'blur', modelProp, defaults: {} };
  }
  throw new TypeError(
    `[PlusTable] 未知的 component="${String(component)}"。`,
  );
}

/** 把列上的 component / componentProps 归一化为可直接渲染的描述 */
export function resolveEditor<T extends RowData = RowData>(
  fields: EditorColumnFields<T> | undefined,
  ctx: RowContext<T>,
): ResolvedEditor {
  const base = resolveComponent(
    fields?.component,
    resolveModelProp(fields?.modelProp),
  );
  const configProps = fields?.componentProps;
  const resolvedProps =
    typeof configProps === 'function' ? configProps(ctx) : configProps;
  if (resolvedProps !== undefined && !isPlainObject(resolvedProps)) {
    throw new TypeError(
      '[PlusTable] componentProps 必须是普通对象，函数式 componentProps 也必须返回普通对象。',
    );
  }
  return {
    component: base.component,
    componentProps: { ...base.defaults, ...(resolvedProps ?? {}) },
    trigger: base.trigger,
    modelProp: base.modelProp,
  };
}

/**
 * 「选中即输入」时把首个可打印字符转换为编辑器草稿。
 * 返回 undefined 表示该编辑器不种入字符，仅进入编辑态。
 */
export function typedCharToDraft<T extends RowData = RowData>(
  fields: EditorColumnFields<T> | undefined,
  char: string,
): unknown {
  const { component } = resolveComponent(fields?.component);
  if (component === ElInput) return char;
  if (component === ElInputNumber) {
    return /^[0-9]$/.test(char) ? Number(char) : undefined;
  }
  return undefined;
}

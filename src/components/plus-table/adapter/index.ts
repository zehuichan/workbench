/**
 * 单元格编辑器组件适配器：把列上的 component / componentProps 归一化为可渲染描述。
 * 命名与 vben FormSchema 的 component adapter 对齐。
 * 内置组件注册见 ./component。
 */
import { isFunction, isPlainObject, isString } from 'es-toolkit';
import type { Component } from 'vue';
import type { RowContext, RowData } from '../table/defaults';
import {
  EDITOR_REGISTRY,
  TYPED_REGISTRY,
  type BuiltinEditorType,
} from './component';

export type { BuiltinEditorType, EditorAdapter } from './component';
export { EDITOR_REGISTRY } from './component';

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

/**
 * 与 vben FormField 一致：string → 查注册表；否则直接当自定义组件。
 */
function resolveComponent(
  component: ColumnComponent | undefined,
  modelProp = 'modelValue',
): Pick<ResolvedEditor, 'component' | 'trigger' | 'modelProp'> & {
  defaults: Record<string, unknown>;
} {
  if (component === undefined || isString(component)) {
    if (isString(component) && !Object.hasOwn(TYPED_REGISTRY, component)) {
      throw new TypeError(`[PlusTable] 未知的 component="${component}"。`);
    }
    const adapter = isString(component)
      ? TYPED_REGISTRY[component as BuiltinEditorType]
      : TYPED_REGISTRY.input;
    return {
      component: adapter.component,
      trigger: adapter.trigger,
      modelProp,
      defaults: { ...adapter.componentProps },
    };
  }
  return { component, trigger: 'blur', modelProp, defaults: {} };
}

/** 把列上的 component / componentProps 归一化为可直接渲染的描述 */
export function resolveEditor<T extends RowData = RowData>(
  fields: EditorColumnFields<T> | undefined,
  ctx: RowContext<T>,
): ResolvedEditor {
  const base = resolveComponent(
    fields?.component,
    fields?.modelProp ?? 'modelValue',
  );
  const configProps = fields?.componentProps;
  const resolvedProps =
    isFunction(configProps) ? configProps(ctx) : configProps;
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
  if (component === EDITOR_REGISTRY.input.component) return char;
  if (component === EDITOR_REGISTRY['input-number'].component) {
    return /^[0-9]$/.test(char) ? Number(char) : undefined;
  }
  return undefined;
}

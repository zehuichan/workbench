/**
 * 内置单元格编辑器组件注册表。
 * 新增编辑器只需在此扩展，adapter 解析逻辑无需改动。
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
export const TYPED_REGISTRY: Record<BuiltinEditorType, EditorAdapter> =
  EDITOR_REGISTRY;

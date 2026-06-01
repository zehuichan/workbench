import type { Component } from 'vue';

import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Switch,
  TimePicker,
} from 'ant-design-vue';

export interface EditorAdapter {
  component: Component;
  /** v-model 绑定的 prop 名（多数为 value，开关/勾选为 checked） */
  valueProp: string;
}

/**
 * 内置编辑器适配器映射。
 * 注意 ant-design-vue 的双向绑定 prop：多数组件用 `value`，Switch/Checkbox 用 `checked`。
 */
export const ANT_ADAPTER_MAP: Record<string, EditorAdapter> = {
  input: { component: Input, valueProp: 'value' },
  'input-number': { component: InputNumber, valueProp: 'value' },
  select: { component: Select, valueProp: 'value' },
  'date-picker': { component: DatePicker, valueProp: 'value' },
  'time-picker': { component: TimePicker, valueProp: 'value' },
  switch: { component: Switch, valueProp: 'checked' },
  checkbox: { component: Checkbox, valueProp: 'checked' },
};

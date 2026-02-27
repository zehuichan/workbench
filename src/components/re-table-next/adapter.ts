import type { Component } from 'vue';

import {
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElSelectV2,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
} from 'element-plus';

export const ELEMENT_ADAPTER_MAP: Record<string, Component> = {
  input: ElInput,
  'input-number': ElInputNumber,
  select: ElSelectV2,
  'date-picker': ElDatePicker,
  switch: ElSwitch,
  'time-picker': ElTimePicker,
  'time-select': ElTimeSelect,
};

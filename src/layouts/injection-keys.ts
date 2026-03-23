import type { InjectionKey, Ref } from 'vue';

/** 文档/示例页右侧栏挂载点，供子页面 Teleport 使用（优于 #id 选择器，避免挂载顺序问题） */
export const LAYOUT_RIGHT_PANEL: InjectionKey<Ref<HTMLElement | null>> =
  Symbol('layoutRightPanel');

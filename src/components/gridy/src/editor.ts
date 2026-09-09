import type { Component } from 'vue';

import type { ComponentType } from '@/adapter';
import { useGlobalShareState } from '@/adapter';

import type { ElSize } from './el';
import type { GridyCellContext, GridyDataColumn } from './types';
import { isFunction, isString } from 'es-toolkit';

export interface GridyCellEditor {
  is: Component;
  /** 双向绑定的 prop 名，事件名恒为 `update:${model}` */
  model: string;
}

const TOGGLE_COMPONENTS = new Set<string>(['checkbox', 'switch']);

const warnedMissingEditors = new Set<string>();
function warnMissingEditor(name: string) {
  if (!import.meta.env?.DEV || warnedMissingEditors.has(name)) {
    return;
  }
  warnedMissingEditors.add(name);
  console.warn(
    `[Gridy] Unknown editor component "${name}". Register it via initComponentAdapter before using it as a column editor, otherwise the cell falls back to read-only text.`,
  );
}

/**
 * 解析单元格编辑控件；`readonly` 或无 `component` 时返回 null，由 cell.vue 走只读渲染。
 * 字符串名走 `useGlobalShareState`（与 Filters / PlusTable 同一张组件表）。
 */
export function resolveEditor(col: GridyDataColumn, readonly: boolean): GridyCellEditor | null {
  const { component } = col;
  if (readonly || !component) {
    return null;
  }
  if (!isString(component)) {
    return { is: component, model: col.modelProp ?? 'modelValue' };
  }
  const is = useGlobalShareState().getComponents()[component as ComponentType] as
    Component | undefined;
  if (!is) {
    warnMissingEditor(component);
    return null;
  }
  return { is, model: col.modelProp ?? 'modelValue' };
}

function isToggleEditor(col: GridyDataColumn): boolean {
  return isString(col.component) && TOGGLE_COMPONENTS.has(col.component);
}

/** 有错时给输入类控件加 `is-error`；开关 / 复选不注入宽高与校验 class */
export function buildEditorProps(
  editor: GridyCellEditor,
  col: GridyDataColumn,
  ctx: GridyCellContext,
  size: ElSize,
  error?: string,
): Record<string, any> {
  const base = isFunction(col.componentProps)
    ? { ...col.componentProps(ctx) }
    : { ...col.componentProps };
  if (!isToggleEditor(col) && editor.model !== 'checked') {
    base.size ??= size;
    base.style ??= { width: '100%' };
    if (error) {
      const extra = 'is-error';
      base.class = [base.class, extra].flat().filter(Boolean);
    }
  }
  return base;
}

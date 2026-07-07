import { computed } from 'vue';
import { useElementBounding, useWindowSize } from '@vueuse/core';
import type { PlusTable } from '../tokens';
import type { AdaptiveConfig, RowData } from './defaults';

const DEFAULT_OFFSET_BOTTOM = 16;
const DEFAULT_MIN_HEIGHT = 200;

/** 按视口剩余空间计算 el-table 的 height，随窗口与布局变化响应 */
export function useStyle<T extends RowData = RowData>(table: PlusTable<T>) {
  const config = computed<Required<AdaptiveConfig>>(() => {
    const adaptive = table.props.adaptive;
    const overrides = typeof adaptive === 'object' ? adaptive : {};
    return {
      mode: overrides.mode ?? 'viewport',
      offsetBottom: overrides.offsetBottom ?? DEFAULT_OFFSET_BOTTOM,
      minHeight: overrides.minHeight ?? DEFAULT_MIN_HEIGHT,
    };
  });

  /** container 模式：表格放进卡片/弹窗/分栏等自身高度受限的容器，视口像素运算天然算错 */
  const isContainerMode = computed(
    () => !!table.props.adaptive && config.value.mode === 'container',
  );

  const { top: gridTop } = useElementBounding(table.gridRef);
  const { height: paginationHeight } = useElementBounding(table.paginationRef);
  const { height: windowHeight } = useWindowSize();

  const tableHeight = computed<number | string | undefined>(() => {
    if (!table.props.adaptive) return undefined;
    if (isContainerMode.value) return '100%';
    const available =
      windowHeight.value -
      gridTop.value -
      paginationHeight.value -
      config.value.offsetBottom;
    return Math.max(available, config.value.minHeight);
  });

  return { tableHeight, isContainerMode };
}

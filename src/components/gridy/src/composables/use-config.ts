import type {
  GridyActionColumn,
  GridyColumn,
  GridyDataColumn,
  GridyExpandColumn,
  GridyProps,
  GridySize,
  GridyToolbarItem,
} from '../types';

import { computed } from 'vue';

import { toElSize } from '../el';
import { isPlainObject } from 'es-toolkit';

/** 四种特殊列的判别值，用于归一化时的去重检测 */
type GridySpecialColumnType = 'action' | 'expand' | 'index' | 'selection';

const DEFAULT_CHILDREN_FIELD = 'children';
/** 对齐 a-table `indentSize` 默认值 */
const DEFAULT_INDENT_SIZE = 15;

const warnedDuplicateColumns = new Set<GridySpecialColumnType>();
function warnDuplicateColumn(type: GridySpecialColumnType) {
  if (!import.meta.env?.DEV || warnedDuplicateColumns.has(type)) {
    return;
  }
  warnedDuplicateColumns.add(type);
  console.warn(
    `[Gridy] Duplicate "${type}" column detected in columns; only the first one is rendered.`,
  );
}

export interface GridyResolvedAddButton {
  show: boolean;
  text: string;
}

export interface GridyResolvedToolbar {
  items: GridyToolbarItem[];
  show: boolean;
  title?: string;
}

export interface GridyResolvedTree {
  childrenField: string;
  indentSize: number;
}

export interface UseConfigOptions {
  /** 是否存在 `#toolbar` 插槽（由薄壳传入，避免 composable 绑 useSlots） */
  hasToolbarSlot: () => boolean;
}

/**
 * props 归一化（`columns` / `addButton` / `toolbar` / `tree` …）：把「联合类型该怎么理解」
 * 「只读态该裁掉什么」这两类判断收敛到这一处，下游只看到已经决策完的形状。
 */
export function useConfig(props: GridyProps, { hasToolbarSlot }: UseConfigOptions) {
  const readonly = computed(() => !!props.disabled);
  const keyboardEnabled = computed(() => props.keyboard !== false && !readonly.value);
  const size = computed<GridySize>(() => props.size ?? 'small');
  const elSize = computed(() => toElSize(size.value));

  /**
   * 渲染用有序列表：只读态下滤掉选择列 / 操作列（都是编辑入口，禁用态不渲染），序号列保留；
   * 同一特殊 type 重复声明时只保留第一个，其余丢弃并警告——避免渲染出重复的勾选框 / 操作列。
   */
  const columns = computed<GridyColumn[]>(() => {
    const seenSpecial = new Set<GridySpecialColumnType>();
    const result: GridyColumn[] = [];
    for (const col of props.columns) {
      if (col.type === undefined) {
        result.push(col);
        continue;
      }
      if ((col.type === 'action' || col.type === 'selection') && readonly.value) {
        continue;
      }
      if (seenSpecial.has(col.type)) {
        warnDuplicateColumn(col.type);
        continue;
      }
      seenSpecial.add(col.type);
      result.push(col);
    }
    return result;
  });

  /** 数据列（无 `type`）：供 TanStack 列模型与键盘导航网格使用，不受只读态影响 */
  const dataColumns = computed<GridyDataColumn[]>(
    () => props.columns.filter((col) => col.type === undefined) as GridyDataColumn[],
  );

  /** 操作列配置（`components/actions.vue` 独立消费） */
  const actionColumn = computed<GridyActionColumn | undefined>(() =>
    readonly.value
      ? undefined
      : (props.columns.find((col) => col.type === 'action') as GridyActionColumn | undefined),
  );

  /** 展开列配置：声明即启用面板 / 承载树形图标，只读态不裁掉（属浏览能力） */
  const expandColumn = computed<GridyExpandColumn | undefined>(
    () => props.columns.find((col) => col.type === 'expand') as GridyExpandColumn | undefined,
  );

  const tree = computed<GridyResolvedTree | null>(() => {
    const config = props.tree;
    if (!config) {
      return null;
    }
    const resolvedConfig = isPlainObject(config) ? config : {};
    return {
      childrenField: resolvedConfig.childrenField ?? DEFAULT_CHILDREN_FIELD,
      indentSize: resolvedConfig.indentSize ?? DEFAULT_INDENT_SIZE,
    };
  });

  const addButton = computed<GridyResolvedAddButton>(() => {
    const config = props.addButton;
    return {
      show: !readonly.value && config !== false,
      text: (isPlainObject(config) ? config.text : undefined) ?? '添加一行',
    };
  });

  /**
   * 显隐规则：`false` 隐藏；`true` 或传对象都视为「有意展示」，直接显示；
   * 缺省（`undefined`）时自动探测——有 `#toolbar` 插槽即显示，否则隐藏。
   */
  const toolbar = computed<GridyResolvedToolbar>(() => {
    const config = props.toolbar;
    if (config === false) {
      return { items: [], show: false, title: undefined };
    }
    const resolved = isPlainObject(config) ? config : {};
    return {
      items: readonly.value ? [] : (resolved.items ?? []),
      show: config !== undefined || hasToolbarSlot(),
      title: resolved.title,
    };
  });

  return {
    actionColumn,
    addButton,
    columns,
    dataColumns,
    elSize,
    expandColumn,
    keyboardEnabled,
    readonly,
    size,
    toolbar,
    tree,
  };
}

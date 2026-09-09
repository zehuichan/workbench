<script setup lang="ts">
import { computed } from 'vue';

import { useGridyContext } from '../tokens';
import { parsePathKey } from '../tree';

defineOptions({ name: 'GridyExpandIcon' });

/**
 * 展开图标 + 树形缩进，面板列与树形首列共用（样式见 gridy.scss，对齐 el-table 的箭头图标，不开放自定义）：
 * 不可展开的行留同宽占位，让同层文字对齐；`tabindex=-1` 让它不进 Tab 序，方向键落格也不聚焦它。
 */
const props = defineProps<{
  canExpand: boolean;
  expanded: boolean;
  rowId: string;
  /** 路径的字符串形态（`'0.2.1'`），基本类型便于跳过重渲染 */
  rowPath: string;
}>();

const { toggleExpanded, tree } = useGridyContext();

const indentWidth = computed(
  () => (parsePathKey(props.rowPath).length - 1) * (tree.value?.indentSize ?? 0),
);

function toggle() {
  toggleExpanded(props.rowId);
}
</script>

<template>
  <span
    v-if="indentWidth > 0"
    class="gridy__indent"
    :style="{ width: `${indentWidth}px` }"
    aria-hidden="true"
  ></span>
  <button
    v-if="canExpand"
    type="button"
    class="gridy__expand-icon"
    :class="{ 'gridy__expand-icon--expanded': expanded }"
    :aria-expanded="expanded"
    :aria-label="expanded ? '收起' : '展开'"
    tabindex="-1"
    @click="toggle"
  ></button>
  <span v-else class="gridy__expand-icon gridy__expand-icon--leaf" aria-hidden="true"></span>
</template>

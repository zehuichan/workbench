<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';

const props = withDefaults(
  defineProps<{
    /** 展示用源码（通常来自 `*.vue?raw`） */
    source: string;
    /** 示例区块标题 */
    title?: string;
    /** 简短说明 */
    description?: string;
  }>(),
  {
    title: '示例',
  },
);

const copied = ref(false);
const highlightedSource = ref('');
const highlightFailed = ref(false);
const isSourceExpanded = ref(false);

let highlightRequestId = 0;
const { isDark } = useData();

async function renderHighlightedSource(source: string) {
  const { codeToHtml } = await import('shiki');

  return codeToHtml(source, {
    lang: 'vue',
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
  });
}

onMounted(() => {
  watch(
    () => props.source,
    async (source) => {
      const currentRequestId = ++highlightRequestId;
      highlightedSource.value = '';
      highlightFailed.value = false;
      isSourceExpanded.value = false;

      if (!source) {
        return;
      }

      try {
        const html = await renderHighlightedSource(source);

        if (currentRequestId === highlightRequestId) {
          highlightedSource.value = html;
        }
      } catch {
        if (currentRequestId === highlightRequestId) {
          highlightFailed.value = true;
        }
      }
    },
    { immediate: true },
  );
});

function toggleSourceExpanded() {
  isSourceExpanded.value = !isSourceExpanded.value;
}

async function copySource() {
  try {
    await navigator.clipboard.writeText(props.source);
    copied.value = true;
    globalThis.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    // 忽略：非安全上下文或无权限
  }
}
</script>

<template>
  <div class="demo-block">
    <div v-if="title || description" class="demo-block__header">
      <div class="demo-block__title">{{ title }}</div>
      <div v-if="description" class="demo-block__desc">{{ description }}</div>
    </div>
    <div class="demo-block__preview">
      <slot />
    </div>
    <div class="demo-block__toolbar">
      <div class="demo-block__actions">
        <button
          type="button"
          class="demo-block__icon-action"
          :aria-label="copied ? '已复制' : '复制代码'"
          :title="copied ? '已复制' : '复制代码'"
          @click="copySource"
        >
          <svg
            v-if="copied"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          type="button"
          class="demo-block__icon-action"
          :class="{ 'demo-block__icon-action--active': isSourceExpanded }"
          :aria-expanded="isSourceExpanded"
          :aria-label="isSourceExpanded ? '收起代码' : '展开代码'"
          :title="isSourceExpanded ? '收起代码' : '展开代码'"
          @click="toggleSourceExpanded"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="isSourceExpanded" class="demo-block__source">
      <!-- eslint-disable vue/no-v-html -- 本地 demo 源码经 Shiki 渲染，来源可信 -->
      <div
        v-if="highlightedSource && !highlightFailed"
        class="demo-block__highlight"
        v-html="highlightedSource"
      ></div>
      <!-- eslint-enable vue/no-v-html -->
      <pre v-else><code>{{ source }}</code></pre>
    </div>
  </div>
</template>

<style>
.demo-block {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-block__header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-block__title {
  font-weight: 600;
}

.demo-block__desc {
  margin-top: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.demo-block__preview {
  padding: 16px;
}

.demo-block__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 36px;
  padding: 0 10px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.demo-block__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.demo-block__icon-action {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-3);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.demo-block__icon-action:hover,
.demo-block__icon-action--active {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.demo-block__icon-action svg {
  width: 14px;
  height: 14px;
}

.demo-block__source {
  border-top: 1px solid var(--vp-c-divider);
  max-height: 520px;
  overflow: auto;
  background: var(--vp-code-block-bg);
}

.demo-block__source pre {
  margin: 0;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
}

.demo-block__highlight pre.shiki {
  margin: 0;
  padding: 12px 14px;
  background: var(--vp-code-block-bg) !important;
  font-size: 12px;
  line-height: 1.5;
}

.demo-block__highlight code {
  display: block;
  width: max-content;
  min-width: 100%;
}

.dark .demo-block__highlight pre.shiki,
.dark .demo-block__highlight pre.shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
</style>

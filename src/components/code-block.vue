<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { getShikiHighlighter } from '@/lib/shiki-highlighter';

defineOptions({ name: 'CodeBlock', inheritAttrs: false });

type DocsCodeLang = 'typescript' | 'javascript' | 'tsx' | 'vue';

const props = withDefaults(
  defineProps<{
    code: string;
    lang?: DocsCodeLang;
  }>(),
  { lang: 'typescript' },
);

const html = ref('');
const failed = ref(false);

const isDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
);

let observer: MutationObserver | undefined;

function readTheme() {
  if (typeof document === 'undefined') return;
  isDark.value = document.documentElement.classList.contains('dark');
}

onMounted(() => {
  readTheme();
  observer = new MutationObserver(readTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => observer?.disconnect());

async function highlight() {
  failed.value = false;
  try {
    const h = await getShikiHighlighter();
    const theme = isDark.value ? 'github-dark' : 'github-light';
    html.value = await h.codeToHtml(props.code, {
      lang: props.lang,
      theme,
    });
  } catch (e) {
    console.error('[code-block]', e);
    failed.value = true;
    html.value = '';
  }
}

watch(
  () => [props.code, props.lang, isDark.value] as const,
  () => {
    void highlight();
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="html && !failed"
    class="code-block code-block-wrap"
    v-bind="$attrs"
    v-html="html"
  />
  <pre v-else class="code-block code-block-wrap code-block-wrap--plain" v-bind="$attrs"><code>{{ code }}</code></pre>
</template>

<style scoped lang="scss">
.code-block-wrap {
  margin: 0;
  overflow-x: auto;
  border-radius: 0;
  border: 1px solid var(--separator);

  &--plain {
    padding: 16px 20px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--foreground);
    background: var(--muted);

    code {
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        'Liberation Mono',
        'Courier New',
        monospace;
      white-space: pre;
    }
  }

  :deep(pre.shiki) {
    margin: 0;
    padding: 16px 20px;
    font-size: 12px;
    line-height: 1.6;
    border-radius: 0;
  }

  :deep(pre.shiki code) {
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      'Liberation Mono',
      'Courier New',
      monospace;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { highlightCode } from './demo-highlighter';

defineOptions({ name: 'DemoCode' });

const props = withDefaults(
  defineProps<{
    code: string;
    lang?: string;
    title?: string;
  }>(),
  { lang: 'ts' },
);

const html = ref('');
const copied = ref(false);
let renderToken = 0;
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

const label = computed(() => props.title ?? props.lang);

async function render() {
  const token = ++renderToken;
  try {
    const next = await highlightCode(props.code, props.lang);
    if (token === renderToken) html.value = next;
  } catch {
    if (token === renderToken) html.value = '';
  }
}

watch(() => [props.code, props.lang] as const, render, { immediate: true });

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="demo-code">
    <div class="demo-code__toolbar">
      <span class="demo-code__label">{{ label }}</span>
      <el-button size="small" text @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </el-button>
    </div>
    <div v-if="html" class="demo-code__body" v-html="html" />
    <pre v-else class="demo-code__fallback">{{ code }}</pre>
  </div>
</template>

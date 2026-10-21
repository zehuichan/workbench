<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'DemoPage' });

const props = withDefaults(
  defineProps<{
    title?: string;
    width?: 'readable' | 'wide';
  }>(),
  { title: undefined, width: 'readable' },
);

const route = useRoute();
const pageTitle = computed(() => props.title ?? String(route.meta.title ?? ''));
</script>

<template>
  <section
    class="demo"
    :class="width === 'wide' ? 'demo--wide' : 'demo--readable'"
  >
    <header class="demo__header">
      <h1 class="demo__title">{{ pageTitle }}</h1>
      <p v-if="$slots.description" class="demo__desc">
        <slot name="description"></slot>
      </p>
    </header>
    <div v-if="$slots.api" class="demo__api">
      <slot name="api"></slot>
    </div>
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoBlock' });

withDefaults(
  defineProps<{
    title?: string;
    hint?: string;
  }>(),
  { title: '试一试' },
);
</script>

<template>
  <div class="demo-block">
    <div class="demo-block__body">
      <h2 class="demo-block__title">{{ title }}</h2>
      <p v-if="hint" class="demo__hint">{{ hint }}</p>
      <slot />
    </div>
    <div class="demo-block__footer">playground</div>
  </div>
</template>

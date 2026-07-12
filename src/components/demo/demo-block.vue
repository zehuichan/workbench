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
  <div class="demo__block">
    <div class="demo__block-body">
      <h2 class="demo__section-title">{{ title }}</h2>
      <p v-if="hint" class="demo__hint">{{ hint }}</p>
      <slot />
    </div>
    <div class="demo__block-footer">playground</div>
  </div>
</template>

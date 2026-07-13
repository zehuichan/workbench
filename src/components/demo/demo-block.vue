<script setup lang="ts">
defineOptions({ name: 'DemoBlock' });

withDefaults(
  defineProps<{
    title?: string;
  }>(),
  { title: '试一试' },
);
</script>

<template>
  <div class="demo-block">
    <div class="demo-block__body">
      <h2 class="demo-block__title">{{ title }}</h2>
      <p v-if="$slots.hint" class="demo__hint">
        <slot name="hint" />
      </p>
      <slot />
    </div>
    <div class="demo-block__footer">playground</div>
  </div>
</template>

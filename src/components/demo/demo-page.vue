<script setup lang="ts">
defineOptions({ name: 'DemoPage' });

withDefaults(
  defineProps<{
    width?: 'wide' | 'readable';
  }>(),
  { width: 'readable' },
);
</script>

<template>
  <section
    class="demo"
    :class="width === 'wide' ? 'demo--wide' : 'demo--readable'"
  >
    <slot />
  </section>
</template>

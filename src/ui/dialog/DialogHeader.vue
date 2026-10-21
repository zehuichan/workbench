<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('flex flex-col gap-2', props.class)"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '@/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn(
        'bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end',
        props.class,
      )
    "
  >
    <slot></slot>
  </div>
</template>

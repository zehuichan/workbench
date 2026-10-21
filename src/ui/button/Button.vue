<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import type { ButtonVariants } from '.';

import { Primitive } from 'reka-ui';

import { cn } from '@/utils';

import { buttonVariants } from '.';

interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class'];
  size?: ButtonVariants['size'];
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  class: undefined,
  size: undefined,
  variant: undefined,
});
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot></slot>
  </Primitive>
</template>

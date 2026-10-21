<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';

import { XIcon } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';

import { Button } from '@/ui/button';
import { cn } from '@/utils';

import DialogOverlay from './DialogOverlay.vue';

interface Props extends DialogContentProps {
  class?: HTMLAttributes['class'];
  overlayClass?: HTMLAttributes['class'];
  showCloseButton?: boolean;
  /** When false, the dimmed overlay is omitted (e.g. penetrable side panel). */
  showOverlay?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  overlayClass: undefined,
  showCloseButton: true,
  showOverlay: true,
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(
  props,
  'class',
  'showCloseButton',
  'showOverlay',
  'overlayClass',
);
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay v-if="showOverlay" :class="overlayClass" />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 text-sm shadow-lg ring-1 duration-100 outline-none sm:max-w-lg',
          props.class,
        )
      "
    >
      <slot></slot>

      <DialogClose v-if="showCloseButton" data-slot="dialog-close" as-child>
        <Button variant="ghost" class="absolute top-3 right-3" size="icon-sm">
          <XIcon />
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>

<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/ui/navigation-menu';
import { cn } from '@/lib/utils';

defineOptions({ name: 'PlaygroundHeader' });

defineProps<{
  categories: { key: string; groups: readonly string[] }[];
  activeCategory: string;
}>();

const emit = defineEmits<{
  select: [key: string];
}>();

function onSelect(key: string, disabled: boolean) {
  if (disabled) return;
  emit('select', key);
}
</script>

<template>
  <header class="flex h-14 shrink-0 items-center border-b bg-background px-4">
    <NavigationMenu :viewport="false" class="max-w-none">
      <NavigationMenuList class="gap-6">
        <NavigationMenuItem
          v-for="category in categories"
          :key="category.key"
        >
          <button
            type="button"
            :class="
              cn(
                navigationMenuTriggerStyle(),
                'cursor-pointer bg-transparent',
                activeCategory === category.key && 'text-primary',
                category.groups.length === 0 && 'pointer-events-none opacity-50',
              )
            "
            :data-active="activeCategory === category.key || undefined"
            :aria-current="
              activeCategory === category.key ? 'page' : undefined
            "
            :disabled="category.groups.length === 0"
            @click="onSelect(category.key, category.groups.length === 0)"
          >
            {{ category.key }}
          </button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </header>
</template>

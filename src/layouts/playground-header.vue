<script setup lang="ts">
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/ui/navigation-menu';
import { cn } from '@/utils';

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
  <header
    class="z-20 flex h-14 shrink-0 items-stretch justify-between border-b border-border bg-background px-6"
  >
    <div class="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        width="22"
        height="22"
        class="size-[22px] shrink-0"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#0B6E6E" />
        <rect x="14" y="14" width="16" height="16" rx="3.5" fill="#F2EFE6" opacity="0.95" />
        <rect x="34" y="14" width="16" height="16" rx="3.5" fill="#F2EFE6" opacity="0.55" />
        <rect x="14" y="34" width="16" height="16" rx="3.5" fill="#F2EFE6" opacity="0.55" />
        <rect x="34" y="34" width="16" height="16" rx="3.5" fill="#F2EFE6" opacity="0.28" />
        <rect x="18" y="18" width="8" height="2.5" rx="1.25" fill="#0B6E6E" />
      </svg>
      <span>Workbench</span>
    </div>

    <NavigationMenu
      :viewport="false"
      class="h-auto max-w-none flex-none items-stretch self-stretch"
    >
      <NavigationMenuList class="h-full items-stretch justify-end gap-1">
        <NavigationMenuItem
          v-for="category in categories"
          :key="category.key"
          class="flex h-full items-stretch"
        >
          <button
            type="button"
            :class="
              cn(
                'relative flex h-full cursor-pointer items-center px-3 text-sm transition-colors',
                activeCategory === category.key
                  ? 'font-medium text-[var(--playground-accent)]'
                  : 'text-muted-foreground hover:text-foreground',
                category.groups.length === 0 && 'cursor-not-allowed pointer-events-none opacity-40',
              )
            "
            :data-active="activeCategory === category.key || undefined"
            :aria-current="activeCategory === category.key ? 'page' : undefined"
            :disabled="category.groups.length === 0"
            @click="onSelect(category.key, category.groups.length === 0)"
          >
            {{ category.key }}
            <span
              v-if="activeCategory === category.key"
              class="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[var(--playground-accent)]"
            />
          </button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </header>
</template>

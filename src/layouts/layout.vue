<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FlaskConical, Moon, Sun } from 'lucide-vue-next';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

import { navGroups } from './nav-config';
import { LAYOUT_RIGHT_PANEL } from './injection-keys';

const route = useRoute();
const rightPanelEl = ref<HTMLElement | null>(null);
provide(LAYOUT_RIGHT_PANEL, rightPanelEl);

const activeRoute = computed(() => route.name);
const hasTocPanel = computed(() =>
  route.name === 'plus-table-docs' || route.name === 'hucre-docs',
);

const pageTitle = computed(() => {
  switch (route.name) {
    case 'plus-table-docs':
      return 'PlusTable 文档';
    case 'plus-table-demo':
      return 'PlusTable 示例';
    case 'hucre-docs':
      return 'hucre 文档';
    case 'hucre-demo':
      return 'hucre 示例';
    default:
      return '';
  }
});

type ThemeMode = 'light' | 'dark';
const themeMode = ref<ThemeMode>('light');

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme-mode', theme);
  themeMode.value = theme;
}

function toggleTheme() {
  applyTheme(themeMode.value === 'light' ? 'dark' : 'light');
}

onMounted(() => {
  const stored = localStorage.getItem('theme-mode');
  const initial = stored === 'dark' ? 'dark' : 'light';
  applyTheme(initial);
});
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              as-child
              tooltip="组件实验室"
            >
              <router-link :to="{ name: 'plus-table-docs' }">
                <div
                  class="flex aspect-square size-8 items-center justify-center border border-border bg-transparent text-foreground"
                >
                  <FlaskConical class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-normal uppercase tracking-[1.2px] font-mono">组件实验室</span>
                  <span class="truncate text-xs text-muted-foreground">
                    Component Labs
                  </span>
                </div>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup v-for="group in navGroups" :key="group.title">
          <SidebarGroupLabel class="uppercase tracking-[1px] text-[11px] font-normal font-mono text-muted-foreground">
            {{ group.title }}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in group.items" :key="item.name">
                <SidebarMenuButton
                  as-child
                  :tooltip="item.label"
                  :data-active="activeRoute === item.name"
                >
                  <router-link :to="item.to">
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

    <SidebarInset>
      <header class="layout-header">
        <span class="layout-header__title">{{ pageTitle }}</span>
        <button class="theme-toggle" type="button" @click="toggleTheme">
          <component :is="themeMode === 'light' ? Moon : Sun" class="size-3.5" />
          {{ themeMode === 'light' ? 'Dark' : 'Light' }}
        </button>
      </header>

      <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div class="lab__main min-w-0 flex-1 overflow-y-auto p-8">
          <router-view />
        </div>

        <aside
          v-if="hasTocPanel"
          class="toc-panel hidden w-[240px] shrink-0 overflow-y-auto bg-background lg:block"
        >
          <div ref="rightPanelEl" class="p-5" />
        </aside>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style lang="scss" src="./page-content.scss" />

<style lang="scss" scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 24px;
  border-bottom: 1px solid var(--separator);
  background: var(--background);

  &__title {
    font-size: 14px;
    font-weight: 400;
    color: var(--foreground);
    letter-spacing: 0;
  }
}

.toc-panel {
  border-left: 1px solid var(--separator);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--foreground);
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.6;
  }
}
</style>

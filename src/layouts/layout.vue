<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FlaskConical, Moon, Sun } from 'lucide-vue-next';

import { navGroups } from './nav-config';
import { LAYOUT_RIGHT_PANEL } from './injection-keys';

const route = useRoute();
const rightPanelEl = ref<HTMLElement | null>(null);
provide(LAYOUT_RIGHT_PANEL, rightPanelEl);

const menuActive = computed(() =>
  typeof route.name === 'string' ? route.name : '',
);

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
  <el-container class="ep-layout" direction="horizontal">
    <el-aside width="220px" class="ep-layout__aside">
      <router-link class="ep-layout__brand" :to="{ name: 'plus-table-docs' }">
        <div
          class="ep-layout__brand-mark flex aspect-square size-8 items-center justify-center border border-border bg-transparent text-foreground"
        >
          <FlaskConical class="size-4" />
        </div>
        <div class="ep-layout__brand-text grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-normal uppercase tracking-[1.2px] font-mono">组件实验室</span>
          <span class="truncate text-xs text-muted-foreground">Component Labs</span>
        </div>
      </router-link>

      <el-menu
        :key="menuActive"
        :router="true"
        :default-active="menuActive"
        class="ep-layout__menu"
      >
        <template v-for="group in navGroups" :key="group.title">
          <el-menu-item-group :title="group.title">
            <el-menu-item
              v-for="item in group.items"
              :key="item.name"
              :index="item.name"
              :route="item.to"
            >
              <el-icon class="ep-layout__menu-icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-menu-item-group>
        </template>
      </el-menu>
    </el-aside>

    <el-container direction="vertical" class="ep-layout__right">
      <el-header class="ep-layout__header">
        <span class="ep-layout__header-title">{{ pageTitle }}</span>
        <el-button class="ep-layout__theme" text size="small" @click="toggleTheme">
          <el-icon class="size-3.5">
            <component :is="themeMode === 'light' ? Moon : Sun" />
          </el-icon>
          {{ themeMode === 'light' ? 'Dark' : 'Light' }}
        </el-button>
      </el-header>

      <el-container direction="horizontal" class="ep-layout__body">
        <el-main class="lab__main ep-layout__main">
          <router-view />
        </el-main>

        <el-aside
          v-if="hasTocPanel"
          width="240px"
          class="ep-layout__toc hidden lg:block"
        >
          <div ref="rightPanelEl" class="ep-layout__toc-inner p-5" />
        </el-aside>
      </el-container>
    </el-container>
  </el-container>
</template>

<style lang="scss" src="./page-content.scss" />

<style lang="scss" scoped>
.ep-layout {
  height: 100%;
  min-height: 100vh;
  min-width: 0;
  background: var(--background);
}

.ep-layout__aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--separator);
  background: var(--background);
}

.ep-layout__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--separator);

  &:hover .ep-layout__brand-mark {
    opacity: 0.85;
  }
}

.ep-layout__brand-text {
  min-width: 0;
}

.ep-layout__menu {
  flex: 1;
  min-height: 0;
  border-right: none !important;
  background: transparent !important;

  :deep(.el-menu-item-group__title) {
    padding: 14px 16px 6px;
    font-size: 12px;
    font-weight: 400;
    font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted-foreground);
    line-height: 1.2;
  }

  :deep(.el-menu-item) {
    height: 40px;
    line-height: 40px;
    margin: 2px 8px;
    border-radius: 0;
    color: var(--foreground);

    &:hover {
      background: var(--muted) !important;
    }

    &.is-active {
      color: var(--foreground);
      background: var(--muted) !important;
      font-weight: 500;
    }
  }
}

.ep-layout__menu-icon {
  margin-right: 8px;
  font-size: 12px;
  vertical-align: middle;
}

.ep-layout__right {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.ep-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 24px;
  margin: 0;
  border-bottom: 1px solid var(--separator);
  background: var(--background);
}

.ep-layout__header-title {
  font-size: 12px;
  font-weight: 400;
  color: var(--foreground);
  letter-spacing: 0;
}

.ep-layout__theme {
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--foreground);

  :deep(.el-icon) {
    margin-right: 4px;
  }
}

.ep-layout__body {
  flex: 1;
  min-height: 0;
}

.ep-layout__main {
  min-width: 0;
  overflow-y: auto;
  padding: 32px !important;
  background: var(--background);
}

.ep-layout__toc {
  flex-shrink: 0;
  border-left: 1px solid var(--separator);
  background: var(--background);
  overflow-y: auto;
}

.ep-layout__toc-inner {
  min-height: 100%;
}
</style>

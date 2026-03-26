<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import { LAYOUT_RIGHT_PANEL } from './injection-keys';

const route = useRoute();

const rightPanelMountEl = ref<HTMLElement | null>(null);
provide(LAYOUT_RIGHT_PANEL, rightPanelMountEl);

const navGroups = [
  {
    title: 'PlusTable',
    items: [
      {
        name: 'plus-table-docs' as const,
        label: '文档',
        to: { name: 'plus-table-docs' as const },
      },
      {
        name: 'plus-table-demo' as const,
        label: '示例',
        to: { name: 'plus-table-demo' as const },
      },
    ],
  },
  {
    title: 'VTable',
    items: [
      {
        name: 'vtable-element-plus-editor' as const,
        label: 'Vue + El-Select 编辑器',
        to: { name: 'vtable-element-plus-editor' as const },
      },
    ],
  },
];

const currentName = computed(() => route.name);

/** 文档页渲染右栏并挂载 TOC；示例页不渲染右栏，主列占满剩余宽度 */
const showDocTocPanel = computed(() => route.name === 'plus-table-docs');
</script>

<template>
  <el-container class="docs-layout">
    <el-header class="docs-layout__header" height="56px">
      <div class="docs-layout__brand">
        <router-link class="docs-layout__logo" :to="{ name: 'plus-table-docs' }">
          组件实验室
        </router-link>
        <span class="docs-layout__tagline">Component Labs</span>
      </div>
    </el-header>

    <!-- 文档页右侧 TOC 须在 el-main 之前挂载，保证 Teleport 目标已存在（v-if）。 -->
    <el-container class="docs-layout__body" direction="horizontal">
      <el-aside class="docs-layout__aside docs-layout__aside--nav" width="220px">
        <div class="docs-layout__sticky-pane">
          <nav class="docs-nav" aria-label="组件文档导航">
            <section
              v-for="group in navGroups"
              :key="group.title"
              class="docs-nav__group"
            >
              <div class="docs-nav__title">{{ group.title }}</div>
              <ul class="docs-nav__list">
                <li v-for="item in group.items" :key="item.name">
                  <router-link
                    class="docs-nav__link"
                    :class="{ 'is-active': currentName === item.name }"
                    :to="item.to"
                  >
                    {{ item.label }}
                  </router-link>
                </li>
              </ul>
            </section>
          </nav>
        </div>
      </el-aside>

      <el-aside
        v-if="showDocTocPanel"
        class="docs-layout__aside docs-layout__aside--right"
        width="280px"
      >
        <div
          id="layout-right-panel"
          ref="rightPanelMountEl"
          class="docs-layout__sticky-pane docs-layout__sticky-pane--toc"
          aria-live="polite"
        />
      </el-aside>

      <el-main class="docs-layout__main">
        <div
          class="docs-layout__content"
          :class="{ 'docs-layout__content--fluid': !showDocTocPanel }"
        >
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.docs-layout {
  --docs-header-h: 56px;

  min-height: 100vh;
  height: 100vh;
  background: var(--el-bg-color);
}

.docs-layout__header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.docs-layout__brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.docs-layout__logo {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-decoration: none;
  letter-spacing: 0.02em;

  &:hover {
    color: var(--el-color-primary);
  }
}

.docs-layout__tagline {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  user-select: none;
}

.docs-layout__body {
  flex: 1;
  min-height: 0;
  flex-direction: row;
  align-items: stretch;
}

.docs-layout__aside {
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.docs-layout__aside--nav {
  order: 1;
}

.docs-layout__aside--right {
  order: 3;
  border-right: none;
  border-left: 1px solid var(--el-border-color-lighter);
}

/** 左栏导航 / 右栏 TOC·工具：在整页滚动或主列超高时仍贴顶，且过长时各自滚动 */
.docs-layout__sticky-pane {
  position: sticky;
  top: 0;
  box-sizing: border-box;
  max-height: calc(100vh - var(--docs-header-h));
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.docs-layout__sticky-pane--toc {
  min-height: 120px;
  padding: 16px 14px 24px;
}

.docs-nav {
  padding: 16px 12px 24px;
}

.docs-nav__group + .docs-nav__group {
  margin-top: 20px;
}

.docs-nav__title {
  padding: 0 10px 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}

.docs-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.docs-nav__link {
  display: block;
  margin: 2px 0;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  &.is-active {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  }
}

.docs-layout__main {
  order: 2;
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: auto;
}

/**
 * 左对齐 + max-width：与 --fluid 示例页共用同一左缘（nav + padding），
 * 避免文档页居中造成侧栏与正文之间大块留白，且与示例切换时标题/表格左对齐。
 */
.docs-layout__content {
  box-sizing: border-box;
  margin: 0;
  padding: 32px 40px 56px;
}

/** 无右侧栏时主内容区在相同左缘下向右铺满 main */
.docs-layout__content--fluid {
  max-width: none;
}
</style>

<!-- 主内容区文档站版式（与 Element Plus 文档站层次接近），仅作用于 layout 中间栏 -->
<style lang="scss">
.docs-layout .docs-layout__content {
  .docs-layout__page {
    min-width: 0;
  }

  .docs-layout__hero {
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .docs-layout__hero-title {
    margin: 0 0 12px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--el-text-color-primary);
  }

  .docs-layout__hero-lead {
    margin: 0 0 10px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--el-text-color-regular);

    &:last-child {
      margin-bottom: 0;
    }

    code {
      padding: 2px 7px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }

    a {
      color: var(--el-color-primary);
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .docs-layout__hero-hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.65;
    color: var(--el-text-color-secondary);

    code {
      padding: 2px 6px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }

  .docs-layout__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);

    .label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>

# Playground Header Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 playground 增加 `components`、`composables`、`packages` 一级 header，并用它过滤现有侧栏分组。

**Architecture:** 分类配置留在 `playground-layout.vue`，以现有 `route.meta.group` 作为唯一映射依据。布局改成“header +（侧栏 + 主内容）”，切换有效分类时按配置顺序进入第一条路由，深层 URL 则反向同步活动分类。

**Tech Stack:** Vue 3.5、Vue Router 5、TypeScript、SCSS、Vite 8。

**Spec:** `docs/superpowers/specs/2026-07-18-playground-header-categories-design.md`

## Global Constraints

- `components` 包含 `PlusTable`、`ERP 场景`；`composables` 包含 `Composables`。
- `packages` 当前可见但禁用，不新增占位路由。
- 不修改现有 demo URL 或各条路由的 `meta`。
- 不引入依赖。
- 已批准本次不新增自动化测试；使用 typecheck、build 与浏览器检查验证。
- 未收到明确要求时不创建 git commit。

## File Structure

- `src/layouts/playground-layout.vue`：一级分类配置、路由同步、分类切换与页面结构。
- `src/styles/index.scss`：header、分类按钮及 header 下方主体布局。

---

### Task 1: Header 分类行为与模板

**Files:**
- Modify: `src/layouts/playground-layout.vue:1-50`

**Interfaces:**
- Consumes: 现有路由 `meta.group`、`meta.order`、`meta.title`。
- Produces: `categories` 一级分类配置、`activeCategory` 活动态、过滤后的 `navGroups`。

- [ ] **Step 1: 替换 layout 的脚本与模板**

将文件替换为：

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import '@/styles/index.scss';

defineOptions({ name: 'PlaygroundLayout' });

type CategoryKey = 'components' | 'composables' | 'packages';

interface CategoryConfig {
  key: CategoryKey;
  groups: readonly string[];
}

const categories: readonly CategoryConfig[] = [
  { key: 'components', groups: ['PlusTable', 'ERP 场景'] },
  { key: 'composables', groups: ['Composables'] },
  { key: 'packages', groups: [] },
];

const route = useRoute();
const router = useRouter();
const activeCategory = ref<CategoryKey>('components');

function groupRoutes(group: string) {
  return router
    .getRoutes()
    .filter((item) => item.meta.group === group)
    .sort(
      (left, right) => Number(left.meta.order) - Number(right.meta.order),
    );
}

function categoryForGroup(group: unknown): CategoryKey | undefined {
  if (typeof group !== 'string') return undefined;
  return categories.find((category) => category.groups.includes(group))?.key;
}

const navGroups = computed(() => {
  const groups =
    categories.find((category) => category.key === activeCategory.value)
      ?.groups ?? [];

  return groups.map((group) => ({
    name: group,
    links: groupRoutes(group).map((item) => ({
      to: item.path,
      label: String(item.meta.title),
    })),
  }));
});

watch(
  () => route.meta.group,
  (group) => {
    const category = categoryForGroup(group);
    if (category) activeCategory.value = category;
  },
  { immediate: true },
);

function selectCategory(category: CategoryConfig): void {
  const firstRoute = category.groups.flatMap(groupRoutes)[0];
  if (!firstRoute) return;

  activeCategory.value = category.key;
  if (route.path !== firstRoute.path) void router.push(firstRoute.path);
}
</script>

<template>
  <div class="playground">
    <header class="playground__header">
      <div class="playground__brand">Workbench</div>
      <nav class="playground__categories" aria-label="Playground categories">
        <button
          v-for="category in categories"
          :key="category.key"
          type="button"
          class="playground__category"
          :class="{ 'is-active': activeCategory === category.key }"
          :aria-current="activeCategory === category.key ? 'page' : undefined"
          :disabled="category.groups.length === 0"
          @click="selectCategory(category)"
        >
          {{ category.key }}
        </button>
      </nav>
    </header>

    <div class="playground__body">
      <aside class="playground__nav">
        <div
          v-for="group in navGroups"
          :key="group.name"
          class="playground__group"
        >
          <div class="playground__group-title">{{ group.name }}</div>
          <router-link
            v-for="link in group.links"
            :key="link.to"
            class="playground__link"
            active-class="is-active"
            :to="link.to"
          >
            {{ link.label }}
          </router-link>
        </div>
      </aside>
      <main class="playground__main">
        <router-view />
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 格式化 layout**

Run: `pnpm exec prettier src/layouts/playground-layout.vue --write`

Expected: 命令退出码为 0，文件保持 Prettier 格式。

- [ ] **Step 3: 验证类型**

Run: `pnpm typecheck`

Expected: PASS，无 TypeScript 或 Vue 模板错误。

---

### Task 2: Header 与主体布局样式

**Files:**
- Modify: `src/styles/index.scss:78-158`

**Interfaces:**
- Consumes: Task 1 生成的 `playground__header`、`playground__categories`、`playground__category`、`playground__body` 类名。
- Produces: 固定 header、可滚动分类栏、独立滚动的侧栏与主内容。

- [ ] **Step 1: 替换 `playground` 样式块**

用以下内容替换现有 `.playground { ... }` 块：

```scss
.playground {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: $demo-bg;
  color: $demo-text;

  &__header {
    display: flex;
    align-items: center;
    height: 60px;
    flex-shrink: 0;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid $demo-border;
  }

  &__brand {
    flex-shrink: 0;
    margin-right: 40px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: $demo-text;
  }

  &__categories {
    display: flex;
    align-items: stretch;
    align-self: stretch;
    min-width: 0;
    gap: 28px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__category {
    position: relative;
    flex-shrink: 0;
    padding: 0 2px;
    border: 0;
    background: transparent;
    color: $demo-text-muted;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      right: 2px;
      bottom: 0;
      left: 2px;
      height: 2px;
      border-radius: 2px 2px 0 0;
      background: $demo-primary;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    &:hover:not(:disabled),
    &.is-active {
      color: $demo-primary;
    }

    &.is-active::after {
      opacity: 1;
    }

    &:focus-visible {
      outline: 2px solid $demo-primary;
      outline-offset: -4px;
      border-radius: $demo-radius;
    }

    &:disabled {
      color: #a8abb2;
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  &__body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  &__nav {
    width: 240px;
    flex-shrink: 0;
    height: 100%;
    padding: 24px 16px;
    overflow-x: hidden;
    overflow-y: auto;
    background: #fff;
    border-right: 1px solid $demo-border;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__group {
    & + & {
      margin-top: 24px;
    }
  }

  &__group-title {
    margin: 0 8px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $demo-text-muted;
  }

  &__link {
    display: block;
    margin-bottom: 4px;
    padding: 8px 12px;
    border-radius: $demo-radius;
    color: $demo-text-secondary;
    text-decoration: none;
    font-size: 13px;
    line-height: 1.5;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: $demo-primary-soft;
      color: $demo-primary;
    }

    &.is-active {
      background: $demo-primary-soft;
      color: $demo-primary;
      font-weight: 600;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 32px 40px 64px;
    overflow-x: hidden;
    overflow-y: auto;
  }
}
```

- [ ] **Step 2: 格式化样式文件**

Run: `pnpm exec prettier src/styles/index.scss --write`

Expected: 命令退出码为 0，SCSS 解析成功。

- [ ] **Step 3: 完整构建**

Run: `pnpm build`

Expected: `vue-tsc -b` 与 `vite build` 均 PASS。

---

### Task 3: 浏览器验收

**Files:**
- Verify only: `src/layouts/playground-layout.vue`
- Verify only: `src/styles/index.scss`

**Interfaces:**
- Consumes: Tasks 1–2 的完整实现。
- Produces: 分类导航、路由同步和布局滚动行为的验收结果。

- [ ] **Step 1: 启动开发服务器**

Run: `pnpm dev`

Expected: Vite 启动成功并给出本地访问地址。

- [ ] **Step 2: 检查 components**

打开 `/plus-table/basic-editing`。

Expected:
- header 中 `components` 为活动项。
- 侧栏只显示 `PlusTable` 与 `ERP 场景`。
- 点击 `components` 后进入 `/plus-table/api-overview`。

- [ ] **Step 3: 检查 composables**

点击 `composables`。

Expected:
- 跳转到 `/composables/use-auto-save`。
- header 中 `composables` 为活动项。
- 侧栏只显示 `Composables`。

- [ ] **Step 4: 检查深层 URL 与 packages**

直接打开 `/erp/sales-order-linkage`，然后观察 `packages`。

Expected:
- `components` 自动恢复为活动项。
- `packages` 可见、禁用且不能获得活动态。

- [ ] **Step 5: 检查滚动与最终状态**

Expected:
- header 不随主内容滚动。
- 侧栏与主内容可独立纵向滚动。
- 浏览器控制台无新增错误。

Run: `git diff --check`

Expected: PASS，无空白错误。

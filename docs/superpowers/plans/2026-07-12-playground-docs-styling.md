# Playground Docs Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 playground 文档壳提升到 Element Plus 风格组件库文档站观感：共享 CSS、`DemoPage`/`DemoBlock` 薄壳、侧栏抛光；七个 demo 页统一套壳；不做 Show Code。

**Architecture:** 在 `playground-layout` 引入单一 `demo-docs.css`；`DemoPage` 控制 `wide`/`readable` 宽度；`DemoBlock` 提供「试一试」卡片（预览 + 底栏 `playground`）。各 demo 只改模板壳，业务逻辑不动。

**Tech Stack:** Vue 3.5、vue-router、Element Plus、Vite、TypeScript。

**Spec:** `docs/superpowers/specs/2026-07-12-playground-docs-styling-design.md`

**验证约定:** 无 demo 单测；每任务用 `pnpm typecheck`；最终在浏览器目视侧栏 + 一页 PlusTable + 一页 Composable。

**Commit 约定:** 仅在用户明确要求时 commit；计划中的 commit step 可跳过。

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/styles/demo-docs.css` | 文档页 + Demo 卡片 + API 表 + composable 布局工具类 |
| `src/components/demo/demo-page.vue` | 页根容器，`width` prop |
| `src/components/demo/demo-block.vue` | 试一试卡片壳 |
| `src/layouts/playground-layout.vue` | 引入 CSS；侧栏视觉增强 |
| `src/views/plus-table/*-demo.vue` ×4 | 套壳，`width="wide"` |
| `src/views/composables/*-demo.vue` ×3 | 套壳，默认 `readable` |
| 删除 `src/views/styles/demo-page.css` | 旧共享样式 |
| 删除 `src/views/composables/composables-demo.css` | 旧 composable 样式 |

---

### Task 1: 共享 CSS + DemoPage + DemoBlock

**Files:**
- Create: `src/styles/demo-docs.css`
- Create: `src/components/demo/demo-page.vue`
- Create: `src/components/demo/demo-block.vue`

- [ ] **Step 1: 创建 `src/styles/demo-docs.css`**

```css
/* Playground documentation chrome (Element Plus docs–like) */
:root {
  --demo-primary: #409eff;
  --demo-primary-soft: #ecf5ff;
  --demo-text: #303133;
  --demo-text-secondary: #606266;
  --demo-text-muted: #909399;
  --demo-border: #e4e7ed;
  --demo-border-light: #ebeef5;
  --demo-bg: #f5f7fa;
  --demo-bg-soft: #fafafa;
  --demo-code-bg: #f0f2f5;
}

.demo {
  color: var(--demo-text);
}

.demo--readable .demo__header,
.demo--readable .demo__api {
  max-width: 56rem;
}

.demo--wide {
  max-width: none;
}

.demo__header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--demo-border-light);
}

.demo__title {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--demo-text);
}

.demo__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--demo-text-secondary);
}

.demo__desc code,
.demo__hint code,
.demo__table code,
.demo__status code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 1px 5px;
  background: var(--demo-code-bg);
  border-radius: 3px;
  color: var(--demo-text);
}

.demo__desc kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  padding: 1px 5px;
  border: 1px solid var(--demo-border);
  border-bottom-width: 2px;
  border-radius: 3px;
  background: #fff;
}

.demo__api {
  margin-bottom: 32px;
}

.demo__api--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px 24px;
}

.demo__api-block {
  min-width: 0;
}

.demo__api-title,
.demo__section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--demo-text);
}

.demo__api-title + .demo__table {
  margin-bottom: 20px;
}

.demo__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
  border: 1px solid var(--demo-border);
  border-radius: 4px;
  overflow: hidden;
}

.demo__table th,
.demo__table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--demo-border-light);
  vertical-align: top;
  color: var(--demo-text-secondary);
  line-height: 1.55;
}

.demo__table th {
  background: var(--demo-bg-soft);
  color: var(--demo-text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.demo__table th:first-child,
.demo__table td:first-child {
  white-space: nowrap;
}

.demo__table tr:last-child td {
  border-bottom: none;
}

.demo__table tr:hover td {
  background: #f9fafc;
}

.demo__hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--demo-text-muted);
}

.demo__hint--tight {
  margin-bottom: 0;
}

.demo__meta {
  margin-left: 12px;
  font-size: 13px;
  color: var(--demo-text-secondary);
}

.demo__block {
  margin-top: 8px;
  border: 1px solid var(--demo-border);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.demo__block-body {
  padding: 20px 20px 16px;
}

.demo__block-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 14px;
  border-top: 1px dashed var(--demo-border);
  background: var(--demo-bg-soft);
  font-size: 12px;
  color: var(--demo-text-muted);
}

.demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  margin-bottom: 16px;
}

.demo__control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--demo-text-secondary);
}

.demo__status {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--demo-text-secondary);
}

.demo__panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px 24px;
  align-items: start;
}

.demo__form,
.demo__snapshot,
.demo__panel {
  padding: 18px 20px;
  background: var(--demo-bg-soft);
  border: 1px solid var(--demo-border-light);
  border-radius: 4px;
}

.demo__snapshot-title,
.demo__panel-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--demo-text);
}

.demo__snapshot pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--demo-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 1100px) {
  .demo__api--split,
  .demo__panels {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: 创建 `src/components/demo/demo-page.vue`**

```vue
<script setup lang="ts">
defineOptions({ name: 'DemoPage' });

withDefaults(
  defineProps<{
    width?: 'wide' | 'readable';
  }>(),
  { width: 'readable' },
);
</script>

<template>
  <section class="demo" :class="width === 'wide' ? 'demo--wide' : 'demo--readable'">
    <slot />
  </section>
</template>
```

- [ ] **Step 3: 创建 `src/components/demo/demo-block.vue`**

```vue
<script setup lang="ts">
defineOptions({ name: 'DemoBlock' });

withDefaults(
  defineProps<{
    title?: string;
    hint?: string;
  }>(),
  { title: '试一试' },
);
</script>

<template>
  <div class="demo__block">
    <div class="demo__block-body">
      <h2 class="demo__section-title">{{ title }}</h2>
      <p v-if="hint" class="demo__hint">{{ hint }}</p>
      <slot />
    </div>
    <div class="demo__block-footer">playground</div>
  </div>
</template>
```

说明：`hint` 若需内嵌 `code` HTML，页面可不用 `hint` prop，改在 default slot 顶部自写 `<p class="demo__hint">...</p>`（见 Task 3/4）。

- [ ] **Step 4: typecheck**

Run: `pnpm typecheck`  
Expected: PASS（或仅有与本任务无关的既有错误）

- [ ] **Step 5: Commit（仅当用户要求）**

```bash
git add src/styles/demo-docs.css src/components/demo/demo-page.vue src/components/demo/demo-block.vue
git commit -m "feat(demo): add docs page shell and shared styles"
```

---

### Task 2: Layout 引入 CSS + 侧栏抛光

**Files:**
- Modify: `src/layouts/playground-layout.vue`

- [ ] **Step 1: 在 script 顶部增加样式 import**

```ts
import '@/styles/demo-docs.css';
```

- [ ] **Step 2: 替换 scoped 侧栏样式为更接近 Element Plus 文档导航**

保留现有模板结构，将 `<style scoped>` 更新为：

```css
.playground {
  display: flex;
  min-height: 100vh;
  background: var(--demo-bg, #f5f7fa);
  color: var(--demo-text, #303133);
}

.playground__nav {
  width: 240px;
  flex-shrink: 0;
  padding: 24px 16px;
  background: #fff;
  border-right: 1px solid var(--demo-border, #e4e7ed);
}

.playground__brand {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 8px 28px;
  color: var(--demo-text, #303133);
}

.playground__group + .playground__group {
  margin-top: 24px;
}

.playground__group-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--demo-text-muted, #909399);
  margin: 0 8px 10px;
}

.playground__link {
  display: block;
  padding: 9px 12px;
  border-radius: 4px;
  color: var(--demo-text-secondary, #606266);
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 2px;
  transition: background 0.15s ease, color 0.15s ease;
}

.playground__link:hover {
  background: var(--demo-primary-soft, #ecf5ff);
  color: var(--demo-primary, #409eff);
}

.playground__link.is-active {
  background: var(--demo-primary-soft, #ecf5ff);
  color: var(--demo-primary, #409eff);
  font-weight: 600;
}

.playground__main {
  flex: 1;
  min-width: 0;
  padding: 32px 40px 64px;
}
```

- [ ] **Step 3: typecheck**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Commit（仅当用户要求）**

```bash
git add src/layouts/playground-layout.vue
git commit -m "style(playground): polish sidebar and load demo docs css"
```

---

### Task 3: 迁移 PlusTable 四个 demo

**Files:**
- Modify: `src/views/plus-table/basic-editing-demo.vue`
- Modify: `src/views/plus-table/dependencies-validation-demo.vue`
- Modify: `src/views/plus-table/history-dirty-demo.vue`
- Modify: `src/views/plus-table/pagination-rows-demo.vue`

每个文件同一模式（以 `history-dirty-demo.vue` 为例；其余三页同样改）：

- [ ] **Step 1: 增加 imports，去掉旧 CSS**

```ts
import DemoPage from '@/components/demo/demo-page.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
```

删除：

```vue
<style src="../styles/demo-page.css"></style>
```

- [ ] **Step 2: 模板套壳**

将外层：

```vue
<section class="demo">
  <header class="demo__header">...</header>
  <div class="demo__api">...</div>
  <h2 class="demo__section-title">试一试</h2>
  <p class="demo__hint">...</p>
  <div class="demo__playground">
    <!-- PlusTable -->
  </div>
</section>
```

改为：

```vue
<DemoPage width="wide">
  <header class="demo__header">...</header>
  <div class="demo__api">...</div>
  <DemoBlock>
    <p class="demo__hint">
      <!-- 原 hint，保留内部 code 标签 -->
    </p>
    <!-- 原 playground 内容（PlusTable），不要再包 demo__playground -->
  </DemoBlock>
</DemoPage>
```

注意：

- 保留原有 `header` / `demo__api` / 表格 HTML 不动
- `hint` 含 HTML 时放在 `DemoBlock` slot 内，不要用 `hint` prop（prop 会转义）
- 不要重复渲染「试一试」标题（`DemoBlock` 已带默认 title）

- [ ] **Step 3: 四个文件全部改完后 typecheck**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 4: Commit（仅当用户要求）**

```bash
git add src/views/plus-table/*.vue
git commit -m "refactor(plus-table): wrap demos with DemoPage and DemoBlock"
```

---

### Task 4: 迁移 Composables 三个 demo

**Files:**
- Modify: `src/views/composables/use-auto-save-demo.vue`
- Modify: `src/views/composables/use-form-draft-demo.vue`
- Modify: `src/views/composables/use-save-hotkey-demo.vue`

- [ ] **Step 1: 每个文件**

1. 删除 `import './composables-demo.css'`
2. 增加：

```ts
import DemoPage from '@/components/demo/demo-page.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
```

3. 外层 `<section class="demo">` → `<DemoPage>`（不传 width，默认 `readable`）
4. API 区：若为 Options/Returns 并排，给容器加 `demo__api demo__api--split`（保留内部 `demo__api-block`）
5. 将原 `demo__playground`（含「试一试」标题、hint、toolbar、panels）包进：

```vue
<DemoBlock>
  <p class="demo__hint">...</p>
  <!-- toolbar / status / panels / form 原样保留 -->
</DemoBlock>
```

删除内部的 `<h2 class="demo__section-title">试一试</h2>` 与外层 `demo__playground` 包装。

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`  
Expected: PASS

- [ ] **Step 3: Commit（仅当用户要求）**

```bash
git add src/views/composables/*.vue
git commit -m "refactor(composables): wrap demos with DemoPage and DemoBlock"
```

---

### Task 5: 删除旧 CSS + 验收

**Files:**
- Delete: `src/views/styles/demo-page.css`
- Delete: `src/views/composables/composables-demo.css`

- [ ] **Step 1: 确认无残留引用**

Run:

```bash
rg "demo-page\.css|composables-demo\.css" src
```

Expected: 无匹配

- [ ] **Step 2: 删除两个旧文件**

- [ ] **Step 3: typecheck + 目视**

Run: `pnpm typecheck`  
Expected: PASS

浏览器（`pnpm dev`）：

1. 侧栏：白底、分组 uppercase、蓝激活
2. `/plus-table/dependencies-validation`：宽内容 + Demo 卡片底栏 `playground`
3. `/composables/use-auto-save`：说明/API 可读宽度 + 同结构卡片

- [ ] **Step 4: Commit（仅当用户要求）**

```bash
git add -u src/views/styles/demo-page.css src/views/composables/composables-demo.css
git add src
git commit -m "chore(demo): remove legacy demo page stylesheets"
```

---

## Spec coverage checklist

| Spec 项 | Task |
|---------|------|
| Element Plus 风侧栏 | Task 2 |
| DemoPage wide/readable | Task 1, 3, 4 |
| DemoBlock 卡片 + playground 底栏 | Task 1, 3, 4 |
| 不做 Show Code | 全任务（未引入源码面板） |
| 合并 CSS、删除旧文件 | Task 1, 5 |
| 七页迁移、业务不动 | Task 3, 4 |
| typecheck | 每任务末步 |

# Tailwind CSS Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本仓接入 Tailwind CSS v4 可运行链路，使 Vue 模板中的 utility class 可用。

**Architecture:** 用官方 `@tailwindcss/vite` 插件接入；独立 `src/styles/tailwind.css` 入口（`@import "tailwindcss"`）；在 `main.ts` 与现有 normalize / Element Plus CSS 并列挂载。不改 playground SCSS、plus-table SCSS、Element Plus 主题。

**Tech Stack:** Tailwind CSS v4、`@tailwindcss/vite`、Vite 8、Vue 3、pnpm。

**Spec:** `docs/superpowers/specs/2026-07-17-tailwindcss-setup-design.md`

## Global Constraints

- 范围：只搭链路；不迁 SCSS；不加 demo 验证页
- 版本：Tailwind CSS v4 + `@tailwindcss/vite`（不用 PostCSS / `tailwind.config.js`）
- 入口：独立 `src/styles/tailwind.css`，不写进 `src/styles/index.scss`
- Preflight：默认开启；本任务不预先关掉
- 外科手术式：不顺手改无关文件/格式
- 验证：`pnpm typecheck` + `pnpm build`；人工确认 utility 可用即可

---

## File Structure

| 路径                              | 职责                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `package.json` / `pnpm-lock.yaml` | 增加 `tailwindcss`、`@tailwindcss/vite`（devDependencies） |
| `vite.config.ts`                  | 注册 `tailwindcss()` 插件                                  |
| `src/styles/tailwind.css`         | Tailwind v4 CSS 入口                                       |
| `src/main.ts`                     | import Tailwind 入口，与现有 CSS 并列                      |

不修改：`src/styles/index.scss`、`src/components/plus-table/styles/**`、Element Plus 相关 import。

---

### Task 1: 安装并接通 Tailwind v4

**Files:**

- Modify: `package.json`（via `pnpm add`）
- Modify: `pnpm-lock.yaml`（via `pnpm add`）
- Modify: `vite.config.ts`
- Create: `src/styles/tailwind.css`
- Modify: `src/main.ts`

**Interfaces:**

- Consumes: 现有 Vite Vue 插件配置；`main.ts` 已有 `modern-normalize` / Element Plus CSS import
- Produces: 全局可用的 Tailwind utility（扫描 `src/**/*.{vue,js,ts,jsx,tsx,html}` 等 Vite 内容源，插件默认处理）

- [x] **Step 1: 安装依赖**

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

Expected: `package.json` 的 `devDependencies` 出现 `tailwindcss` 与 `@tailwindcss/vite`；命令退出码 0。

- [ ] **Step 2: 注册 Vite 插件**

将 `vite.config.ts` 改为：

```ts
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8000,
  },
});
```

- [ ] **Step 3: 创建 Tailwind 入口 CSS**

Create `src/styles/tailwind.css`:

```css
@import 'tailwindcss';
```

- [ ] **Step 4: 在 `main.ts` 挂载入口**

将 `src/main.ts` 改为（仅新增一行 Tailwind import，其余保持原样）：

```ts
import { createApp } from 'vue';

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'modern-normalize/modern-normalize.css';
import 'element-plus/dist/index.css';
import './styles/tailwind.css';

import App from './App.vue';
import { router } from './router';

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount('#app');
```

- [ ] **Step 5: 验证 typecheck + build**

```bash
pnpm typecheck
pnpm build
```

Expected: 两个命令均退出码 0；`vite build` 无 Tailwind / CSS 相关报错。

- [ ] **Step 6: 人工抽查 utility（可选但推荐）**

```bash
pnpm dev
```

在任意已打开的 demo 模板根节点临时加 `class="flex gap-2"`，确认布局生效后**还原该临时改动**（不要提交）。

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts src/styles/tailwind.css src/main.ts
git commit -m "$(cat <<'EOF'
build: add Tailwind CSS v4 via Vite plugin

EOF
)"
```

---

## Spec coverage (self-review)

| Spec 要求                                                | 对应                                           |
| -------------------------------------------------------- | ---------------------------------------------- |
| 装 `tailwindcss` + `@tailwindcss/vite`                   | Task 1 Step 1                                  |
| `vite` 注册插件                                          | Task 1 Step 2                                  |
| 独立 `src/styles/tailwind.css` + `@import "tailwindcss"` | Task 1 Step 3                                  |
| `main.ts` 挂载                                           | Task 1 Step 4                                  |
| Preflight 默认开、不预先关                               | 入口仅 `@import`，无关闭配置                   |
| 不迁 SCSS / 不加验证页                                   | File Structure 明确排除；Step 6 临时改动须还原 |
| `pnpm build` 可通过                                      | Task 1 Step 5                                  |

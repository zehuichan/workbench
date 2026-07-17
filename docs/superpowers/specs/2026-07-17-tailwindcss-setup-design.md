# Tailwind CSS Setup Design

Date: 2026-07-17

## Goal

在本仓接入 Tailwind CSS v4 可运行链路，使 Vue 模板中的 utility class 可用。不迁移既有 SCSS / Element Plus 样式。

## Decisions

| 项 | 选择 |
|----|------|
| 范围 | 只搭链路（依赖 + Vite 插件 + 入口 CSS）；现有 SCSS / Element Plus 不动 |
| 版本 | Tailwind CSS v4 |
| 集成方式 | `@tailwindcss/vite`（不用 PostCSS 经典链路） |
| 入口文件 | 独立 `src/styles/tailwind.css`（不与 `index.scss` 混写） |
| 挂载点 | `main.ts` import（与 `modern-normalize` / Element Plus CSS 同级） |
| Preflight | 先保持默认开启；若与 Element Plus / playground 冲突，再在同一入口关掉 |
| 验证页 / 样式迁移 | 不做（YAGNI） |

## Architecture

```text
package.json
  devDependencies: tailwindcss, @tailwindcss/vite

vite.config.ts
  plugins: [vue(), tailwindcss()]

src/styles/tailwind.css
  @import "tailwindcss";

src/main.ts
  import './styles/tailwind.css'   # 与现有 CSS 入口并列
```

### Why a separate CSS file

- Tailwind v4 走 CSS-first，与现有 playground SCSS（`src/styles/index.scss`，由 layout 按需 import）边界清晰。
- 以后若需关掉 Preflight，只改 `tailwind.css`，不动 SCSS。

### Coexistence with Element Plus / SCSS

- 现有：`modern-normalize` + Element Plus CSS（`main.ts`）+ playground BEM SCSS（layout）+ plus-table SCSS（组件内）。
- Tailwind 仅新增 utility 能力；不改上述文件内容与职责。
- Preflight 默认开启；发现问题时再禁用，不在起步阶段预先关掉。

## Out of scope

- 把 playground / plus-table SCSS 迁到 Tailwind
- 新增 demo 页或刻意验证用的 markup
- 自定义 theme / design tokens / `@apply` 大规模抽取
- Tailwind v3 + `tailwind.config.js` + PostCSS 链路

## Success criteria

1. `pnpm install` 成功，`tailwindcss` 与 `@tailwindcss/vite` 在 `devDependencies`。
2. `pnpm dev` 与 `pnpm build` 可通过。
3. 任意已有模板中临时加 `class="flex gap-2"` 一类 utility 时样式生效（人工抽查即可；不新增专项测试）。

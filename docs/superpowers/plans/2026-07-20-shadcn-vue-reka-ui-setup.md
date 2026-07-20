# shadcn-vue + reka-ui Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在本仓起步接入最新 shadcn-vue（底层 reka-ui），完成 CLI 配置、主题 CSS variables 与 `src/ui` 目录约定，不加任何 UI 组件。

**Architecture:** 用官方 `shadcn-vue@latest init` 安装依赖并写入 theme；`components.json` 的 `aliases.ui` 指向 `@/ui`（与 `src/components` 平级）；保留 Element Plus 全局接入。基建 only：不 `add` 组件、不加 demo。

**Tech Stack:** Vue 3、Vite 8、Tailwind CSS v4、shadcn-vue CLI、reka-ui、pnpm。

**Spec:** `docs/superpowers/specs/2026-07-20-shadcn-vue-reka-ui-setup-design.md`

## Global Constraints

- 范围：仅基建；禁止 `shadcn-vue add <component>`；不加 demo 页
- UI 目录：`src/ui`（不是 `src/components/ui`）
- 基础色：`neutral`；主题：CSS variables
- style / preset：CLI 最新默认（不手写过时的 `new-york` 假设）
- Element Plus：双轨并存；不得拆除 `main.ts` 中的 Element Plus 注册与 CSS
- 外科手术式：不顺手改无关文件/格式/PlusTable
- 验证：`pnpm typecheck`；必要时 `pnpm build`

---

## File Structure

| 路径 | 职责 |
|------|------|
| `tsconfig.json` | 补 `baseUrl` + `paths`，供 shadcn CLI 解析 `@/*` |
| `components.json` | shadcn-vue 项目配置；`aliases.ui` → `@/ui` |
| `package.json` / `pnpm-lock.yaml` | CLI 写入的 `reka-ui` 及配套依赖 |
| `src/styles/tailwind.css` | 保留 Tailwind 入口 + CLI 写入的 theme / CSS variables |
| `src/lib/utils.ts`（或 CLI 实际路径） | `cn` 等工具（CLI 生成） |
| `src/ui/` | shadcn 原子组件落点（本次无组件文件；可用 `.gitkeep` 占位） |
| `src/main.ts` | **只读核对**：Element Plus 仍在；不改业务逻辑 |

不修改（除非 CLI 误改需回滚）：`src/components/plus-table/**`、`src/views/**`、`src/router/**`、playground SCSS。

---

### Task 1: 为 CLI 补齐根 `tsconfig` 路径别名

**Files:**
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: 现有 `tsconfig.app.json` 已有 `"@/*": ["./src/*"]`
- Produces: 根 `tsconfig.json` 含相同 `baseUrl` / `paths`，供 `shadcn-vue` CLI 读取

- [x] **Step 1: 更新 `tsconfig.json`**

将 `tsconfig.json` 改为：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [x] **Step 2: 确认 `tsconfig.app.json` 仍含路径别名**

打开 `tsconfig.app.json`，确认已有：

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

若缺失则按同样内容补上（当前仓库应已具备，通常无需改）。

- [ ] **Step 3: Commit（若用户要求提交时再执行）**

```bash
git add tsconfig.json
git commit -m "$(cat <<'EOF'
chore: add root tsconfig paths for shadcn-vue CLI

EOF
)"
```

---

### Task 2: 运行 shadcn-vue init（neutral + 最新默认）

**Files:**
- Create: `components.json`
- Modify: `package.json` / `pnpm-lock.yaml`（via CLI）
- Modify: `src/styles/tailwind.css`（CLI 注入 theme）
- Create: `src/lib/utils.ts`（或 CLI 实际生成的 utils 路径）
- Possibly create: 其它 CLI 默认辅助文件（以实际输出为准；勿手删）

**Interfaces:**
- Consumes: Task 1 的 `@/*` 路径；已有 Tailwind v4 + `@tailwindcss/vite`
- Produces: 已初始化的 shadcn-vue 工程骨架与 `reka-ui` 依赖

- [x] **Step 1: 确认尚未存在冲突配置**

```bash
test ! -f components.json && echo "no components.json OK" || echo "components.json EXISTS"
```

Expected: `no components.json OK`。若已存在，先停下来对比是否符合本计划，再决定是否加 `--force`（默认不加）。

- [x] **Step 2: 执行 init**

在仓库根目录运行：

```bash
pnpm dlx shadcn-vue@latest init --base-color neutral --css-variables --template vite -y
```

说明：
- 不传 `--style` / `--preset`，使用 CLI 最新默认
- 若 CLI 交互询问 CSS 路径，选择 / 填入 `src/styles/tailwind.css`
- 若 CLI 询问 components 路径且无法指定 `src/ui`，先接受默认，Task 3 再改 `aliases.ui`

Expected: 退出码 0；生成 `components.json`；`package.json` 出现 `reka-ui`。

- [x] **Step 3: 核对 Element Plus 未被拆除**

```bash
rg -n "element-plus|ElementPlus" src/main.ts package.json
```

Expected: `main.ts` 仍 import / `use(ElementPlus, …)`；`package.json` 仍有 `element-plus` 依赖。

若被 CLI 改掉，立即恢复为：

```ts
import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'modern-normalize/modern-normalize.css'
import 'element-plus/dist/index.css'
import './styles/tailwind.css'

import App from './App.vue'
import { router } from './router'

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
```

- [x] **Step 4: 确认 `cn` utils 存在**

```bash
ls src/lib 2>/dev/null; rg -n "export function cn" src/lib -g '*.ts'
```

Expected: 存在导出 `cn` 的 utils 文件（常见为 `src/lib/utils.ts`）。若路径不同，以 CLI 实际为准，并在 Task 3 让 `aliases.utils` 与之对齐。

- [ ] **Step 5: Commit（若用户要求提交时再执行）**

```bash
git add components.json package.json pnpm-lock.yaml src/styles/tailwind.css src/lib
git commit -m "$(cat <<'EOF'
chore: init shadcn-vue with reka-ui and neutral theme

EOF
)"
```

---

### Task 3: 将 UI 别名固定为 `src/ui` 并占位目录

**Files:**
- Modify: `components.json`
- Create: `src/ui/.gitkeep`

**Interfaces:**
- Consumes: Task 2 生成的 `components.json`
- Produces: 后续 `pnpm dlx shadcn-vue@latest add …` 写入 `src/ui`

- [x] **Step 1: 编辑 `components.json` 别名与 CSS 路径**

打开根目录 `components.json`，确保至少包含以下字段（其余字段保留 CLI 写入的最新默认值，不要删）：

```json
{
  "tailwind": {
    "config": "",
    "css": "src/styles/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/ui",
    "lib": "@/lib",
    "composables": "@/composables"
  }
}
```

注意：
- 若 CLI 生成的 `aliases.utils` 不是 `@/lib/utils`，以实际文件路径为准，只强制改 `ui` → `@/ui`，并保证 `tailwind.css` / `baseColor` / `cssVariables` 符合上表
- **不要**把 `ui` 留成 `@/components/ui`

- [x] **Step 2: 若 CLI 已把文件写进 `src/components/ui`，迁到 `src/ui`**

```bash
if [ -d src/components/ui ]; then
  mkdir -p src/ui
  # 仅当 components/ui 非空时迁移
  if [ -n "$(ls -A src/components/ui 2>/dev/null)" ]; then
    mv src/components/ui/* src/ui/
  fi
  rmdir src/components/ui 2>/dev/null || true
fi
```

Expected: 无残留 `src/components/ui` 目录（或为空已删除）；组件/占位均在 `src/ui`。

- [x] **Step 3: 创建 `src/ui` 占位（无组件时）**

```bash
mkdir -p src/ui
test -f src/ui/.gitkeep || echo "# shadcn-vue components land here" > src/ui/.gitkeep
```

（若目录已有真实文件，可跳过 `.gitkeep`。）

- [x] **Step 4: 核对 `tailwind.css` 仍含 Tailwind 入口与 theme**

```bash
rg -n "tailwindcss|@theme|--background|\\.dark" src/styles/tailwind.css
```

Expected: 仍有 `@import "tailwindcss"`（或等价）；并有 CLI 注入的 CSS variables / `@theme` 相关内容。不得清空为仅一行 import 却丢掉 theme（若 theme 被误删，重新跑 Task 2 Step 2，可加 `--force` 仅在确认可覆盖时使用）。

- [ ] **Step 5: Commit（若用户要求提交时再执行）**

```bash
git add components.json src/ui
git commit -m "$(cat <<'EOF'
chore: point shadcn-vue ui alias to src/ui

EOF
)"
```

---

### Task 4: 验证 typecheck / build

**Files:**
- 无新文件；只读验证

**Interfaces:**
- Consumes: Tasks 1–3 完成后的工程状态
- Produces: 可合并的基建状态（满足 spec success criteria）

- [x] **Step 1: 核对 success criteria 清单**

```bash
test -f components.json && echo "components.json OK"
node -e "const c=require('./components.json'); if(c.aliases?.ui!=='@/ui') process.exit(1); if(c.tailwind?.baseColor!=='neutral') process.exit(2); console.log('aliases/baseColor OK')"
rg -n "\"reka-ui\"" package.json
test -d src/ui && echo "src/ui OK"
rg -n "ElementPlus|element-plus" src/main.ts
```

Expected: 全部打印 OK / 匹配成功；`node` 退出码 0。

- [x] **Step 2: typecheck**

```bash
pnpm typecheck
```

Expected: 退出码 0。

- [x] **Step 3: build（若 typecheck 通过仍建议跑一次）**

```bash
pnpm build
```

Expected: 退出码 0。

- [x] **Step 4: 确认未误加 UI 组件**

```bash
find src/ui -type f ! -name '.gitkeep' 2>/dev/null | head
```

Expected: 无业务组件文件（空输出或仅说明性文件）。若出现 `button` 等，删除并检查是否误跑了 `add`。

---

## Spec coverage (self-review)

| Spec 要求 | 对应 Task |
|-----------|-----------|
| CLI init + 最新依赖 / reka-ui | Task 2 |
| `aliases.ui` → `@/ui` | Task 3 |
| baseColor `neutral` + CSS variables | Task 2 + Task 3 |
| `tsconfig` paths 供 CLI | Task 1 |
| theme 写入 `src/styles/tailwind.css` | Task 2 / Task 3 核对 |
| Element Plus 双轨并存 | Task 2 Step 3 + Task 4 |
| 不加组件 / 不加 demo | Global Constraints + Task 4 Step 4 |
| `pnpm typecheck`（及 build） | Task 4 |

无 TBD / 占位步骤；commit 步骤仅在用户明确要求提交时执行。

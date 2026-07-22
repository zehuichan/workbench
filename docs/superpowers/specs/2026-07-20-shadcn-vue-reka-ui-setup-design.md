# shadcn-vue + reka-ui Setup Design

Date: 2026-07-20

## Goal

在本仓起步接入最新 **shadcn-vue**（底层 **reka-ui**），打好 CLI / 主题 / 目录约定，使后续可用 `pnpm dlx shadcn-vue@latest add <component>` 按需拉组件。不迁移现有 Element Plus 业务，不新增 UI 组件与 demo。

## Decisions

| 项               | 选择                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| 范围             | 仅基建（init + 依赖 + CSS variables + `components.json`）；不加 button 等组件 |
| 与 Element Plus  | 双轨并存；`main.ts` 继续全局注册 Element Plus                                 |
| UI 目录          | `src/ui`（与 `src/components` 平级）                                          |
| 基础色           | Neutral                                                                       |
| 主题方式         | CSS variables（CLI 默认）                                                     |
| style / preset   | CLI 最新默认（不手写旧版 `new-york` 等过时假设）                              |
| 工具函数         | CLI 默认 `src/lib`（含 `cn`）                                                 |
| composables 别名 | 指向现有 `@/composables`                                                      |
| 暗色模式开关     | 不做（YAGNI；theme CSS 变量可保留 `.dark` 若 CLI 写入）                       |

## Architecture

```text
package.json
  dependencies: reka-ui + CLI 安装的配套包
  （clsx / tailwind-merge / class-variance-authority / lucide-vue-next 等以 CLI 实际写入为准）

components.json
  aliases.ui → "@/ui"
  aliases.components → "@/components"
  aliases.utils / lib → "@/lib/..."
  aliases.composables → "@/composables"
  tailwind.css → "src/styles/tailwind.css"
  tailwind.baseColor → "neutral"
  tailwind.config → ""（Tailwind v4）

tsconfig.json
  compilerOptions.baseUrl + paths["@/*"]  （CLI 解析需要；tsconfig.app.json 已有）

src/styles/tailwind.css
  保留 @import "tailwindcss"
  + CLI 写入的 shadcn theme（@theme / CSS variables）

src/ui/          # shadcn 原子组件（本次可为空，后续 add 落入）
src/components/  # 业务 / PlusTable / demo（不动）
src/lib/         # cn 等 utils（CLI 生成）
```

### Why `src/ui` not `src/components/ui`

- 与业务组件目录物理隔离，避免与 PlusTable、demo 组件混放。
- 通过 `components.json` 的 `aliases.ui` 定制安装路径，无需 init 后再搬迁。

### Coexistence with Element Plus

- Element Plus：全局 CSS + `app.use(ElementPlus)` 保持不变；PlusTable 与现有 demo 继续依赖它。
- shadcn-vue：按需 import（copy-in 组件），不全局注册。
- 同页混用允许；样式冲突不在本次预做隔离层，出现后再针对性收紧。

### Init approach

使用官方 CLI（推荐路径），避免手写配置漂移：

```bash
pnpm dlx shadcn-vue@latest init --base-color neutral
```

init 后核对并必要时修正 `components.json` 中 `aliases.ui` 为 `@/ui`，以及 `tailwind.css` 指向 `src/styles/tailwind.css`。若 CLI 交互无法一次设好 `ui` 路径，允许 init 后改 JSON（不采用「先装到 components/ui 再移动」）。

## Out of scope

- `add button` 或任何 UI 组件
- 新增 playground / demo 页做冒烟展示
- 移除或替换 Element Plus
- 暗色模式 UI 开关、品牌色定制
- 把 PlusTable / playground SCSS 迁到 shadcn

## Success criteria

1. 根目录存在有效 `components.json`，且 `aliases.ui` 为 `@/ui`，`baseColor` 为 `neutral`。
2. `package.json` 含最新 `reka-ui`（及 CLI 写入的配套依赖）。
3. `src/lib` 具备 `cn`（或 CLI 等价 utils）；`src/ui` 目录约定就位（可无组件文件）。
4. `src/styles/tailwind.css` 含 shadcn CSS variables / theme，且仍保留 Tailwind v4 入口。
5. Element Plus 全局接入未拆除；现有路由与 PlusTable demo 行为不故意破坏。
6. `pnpm typecheck` 通过；必要时 `pnpm build` 通过。

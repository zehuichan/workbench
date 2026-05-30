# 组件实验室（Component Labs）

基于 **Vue 3 + TypeScript + Vite** 的前端组件试验场，使用 **Turborepo + pnpm workspace** 组织。当前重心是围绕 **Element Plus `el-table`** 封装的增强表格 **PlusTable**：通过统一的 VitePress 文档站与可交互示例迭代 API 与行为。

## 仓库结构

```
component-labs/
├── packages/
│   └── plus-table/   # @labs/plus-table —— PlusTable 组件源码（以源码形式被消费）
├── playground/       # @labs/playground —— 本地调试用的精简 Vite 应用
├── docs/             # @labs/docs —— VitePress 文档站（唯一文档站）
├── turbo.json        # Turborepo 任务编排
└── pnpm-workspace.yaml
```

- **组件源码**：[`packages/plus-table/src/`](packages/plus-table/src/)（`types/`、`composables/`、`components/`、`utils/`、`adapters/` 等）。
- **文档与示例**：[`docs/`](docs/) —— Markdown + `<demo src="...">` 自动渲染示例（见 `docs/.vitepress/markdown/`）。
- **本地调试**：[`playground/`](playground/) —— 直接以源码别名引用 `@labs/plus-table`，便于 HMR。

## 快速开始

```bash
pnpm install

# 启动 playground（Vite，默认端口 8000）
pnpm dev

# 启动文档站（VitePress）
pnpm dev:docs
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 通过 turbo 启动 playground 开发服务器 |
| `pnpm dev:docs` | 通过 turbo 启动 VitePress 文档站 |
| `pnpm build` | `turbo run build`，构建所有可构建的 workspace |
| `pnpm build:docs` | 仅构建文档站 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | `vue-tsc` + `tsc` 类型检查 |
| `pnpm format` | 使用 Prettier 格式化（本仓库不使用 ESLint/Stylelint） |
| `pnpm clean` | 清理 `node_modules`、`dist`、`.turbo` 等（见 `scripts/clean.mjs`） |
| `pnpm reinstall` | 深度清理后重新安装依赖 |

## 依赖版本管理

公共依赖版本统一在 [`pnpm-workspace.yaml`](pnpm-workspace.yaml) 的 `catalog:` 中维护，各 workspace 通过 `"catalog:"` 引用，避免版本漂移。

## PlusTable 能做什么

PlusTable 在 `el-table` 之上提供配置式列、多种编辑模式、键盘导航与自定义热键、表级/列级校验、行增删改与撤销重做、列设置（显隐/排序/宽度，可本地持久化）、单元格联动（`dependencies`）、脏数据追踪、分页与自适应高度等能力。在 `docs/components/plus-table` 中查看完整文档与交互示例。

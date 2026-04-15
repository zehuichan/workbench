# 组件实验室（Component Labs）

基于 **Vue 3 + TypeScript + Vite** 的前端组件试验场，当前重心是围绕 **Element Plus `el-table`** 封装的增强表格 **PlusTable**：带文档站与可交互示例页，便于迭代 API 与行为。

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Vue 3（Composition API）、vue-router（Hash 路由） |
| 构建 | Vite 8、@vitejs/plugin-vue / vue-jsx |
| UI 基础 | Element Plus（表格与表单生态） |
| 文档站壳层 | Tailwind CSS v4、Element Plus（布局/菜单）、Tailwind Card 文档块、lucide-vue-next |
| 工具 | VueUse、async-validator、pnpm |

## PlusTable 能做什么

PlusTable 在 `el-table` 之上提供配置式列、多种编辑模式、键盘导航与自定义热键、表级/列级校验、行增删改与撤销重做、列设置（显隐/排序/宽度，可本地持久化）、单元格联动（`dependencies`）、脏数据追踪、分页与自适应高度等能力。

- **应用内文档（推荐）**：启动开发服务器后打开 **`/#/plus-table/docs`**，含 Props、事件、插槽、列配置与各模式说明。  
- **交互示例**：**`/#/plus-table/demo`**。  
- **源码入口**：[`src/components/plus-table/`](src/components/plus-table/)（`types/`、`composables/`、`components/`、`utils/`、`adapters/` 等）。

根路径 **`/`** 会重定向到 PlusTable 文档页。

## 快速开始

```bash
pnpm install
pnpm dev
```

默认开发端口由环境变量 **`VITE_PORT`** 决定（仓库内 [`.env`](.env) 示例为 **`8000`**），浏览器访问：

`http://localhost:8000/#/plus-table/docs`

若修改了 `VITE_BASE`，请使用与 [vite.config.ts](vite.config.ts) 中 `base` 一致的前缀。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | `vue-tsc --noEmit` 类型检查 |
| `pnpm clean` | 清理构建与依赖目录（见 `scripts/clean.mjs`） |
| `pnpm reinstall` | 深度清理后重新安装依赖 |

## 环境变量（`VITE_` 前缀）

| 变量 | 作用 |
|------|------|
| `VITE_PORT` | 开发服务器端口 |
| `VITE_BASE` | 应用 `base` 与 Hash 路由的基路径 |

可按环境在 `.env`、`.env.development`、`.env.production` 中覆盖。

## 仓库结构（节选）

```
src/
  assets/design/     # 全局样式、Tailwind 主题变量
  components/
    plus-table/      # PlusTable 组件与类型导出
    card/            # 文档用 Card（Tailwind）
  layouts/           # 文档/示例共用布局（侧栏、主内容、TOC 挂载等）
  router/            # 路由定义（Hash history）
  views/plus-table/  # 文档页、示例页
```

## 其他依赖说明

`package.json` 中另包含 **ant-design-vue**、**stk-table-vue** 等，可用于对照或后续示例扩展；当前路由与导航主要围绕 PlusTable 文档与 Demo。

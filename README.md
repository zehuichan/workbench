# 组件实验室（Component Labs）

基于 **Vue 3 + TypeScript + Vite 8** 的前端组件试验场。当前重心是围绕 **Element Plus `el-table`** 封装的增强表格 **PlusTable**。

## 仓库结构

```
component-labs/
├── src/
│   ├── App.vue                 # 本地调试入口
│   ├── main.ts
│   └── components/
│       └── plus-table/         # PlusTable 组件源码
├── index.html
├── vite.config.ts
└── package.json
```

## 快速开始

```bash
pnpm install

# 启动开发服务器（默认端口 8000）
pnpm dev
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 类型检查并构建生产产物 |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | `vue-tsc` 类型检查 |
| `pnpm format` | 使用 Prettier 格式化 |
| `pnpm clean` | 清理 `node_modules`、`dist` 等 |
| `pnpm reinstall` | 深度清理后重新安装依赖 |

## PlusTable

组件源码位于 [`src/components/plus-table/`](src/components/plus-table/)。在应用中通过 `@/components/plus-table` 引用：

```ts
import { PlusTable } from '@/components/plus-table'
```

PlusTable 在 `el-table` 之上提供配置式列、多种编辑模式、键盘导航与自定义热键、表级/列级校验、行增删改与撤销重做、列设置、单元格联动、脏数据追踪、分页与自适应高度等能力。

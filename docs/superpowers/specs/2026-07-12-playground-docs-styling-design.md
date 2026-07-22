# Playground Docs Styling Design

Date: 2026-07-12

## Goal

将现有 playground（PlusTable + Composables demos）的观感提升到「正常组件库文档站」验收标准：Element Plus 风格的侧栏与排版、清晰的 API 表、带边框的 Demo 卡片。业务逻辑不变；为后续新增模块留下可复用的文档壳。

## Decisions

| 项       | 选择                                                        |
| -------- | ----------------------------------------------------------- |
| 视觉参考 | Element Plus 文档风（白侧栏、蓝激活、API 表 + Demo 卡片）   |
| 结构深度 | 样式 + Demo 卡片壳；**不做** Show Code                      |
| 内容宽度 | 按页面类型自适应：`wide`（表格）/ `readable`（composables） |
| 实现方式 | 薄壳组件 `DemoPage` / `DemoBlock` + 单一共享 CSS            |
| 明确不做 | VitePress、暗色主题、多语言、源码展开、改 demo 业务逻辑     |

## Page Skeleton

每页固定顺序：

1. **页头** — 标题 + 说明（可含 `code` / `kbd`）
2. **API** — 一个或多个 Attributes / Options / Returns / Expose 表
3. **试一试** — `DemoBlock` 卡片（预览区 + 底栏标签 `playground`）

## Components

路径：`src/components/demo/`

### DemoPage

- 根容器，应用文档页基础排版
- Prop `width`: `'wide' | 'readable'`（默认 `'readable'`）
- Default slot：整页内容

| 页面           | `width`                                 |
| -------------- | --------------------------------------- |
| PlusTable ×4   | `wide`                                  |
| Composables ×3 | `wide`（与 PlusTable 同一通栏文档排版） |

### DemoBlock

- 「试一试」卡片外壳
- Props：`title`（默认「试一试」）、`hint`（可选说明）
- Default slot：预览 / 操作区
- 底栏固定展示 `playground`（无交互、无 Show Code）

### API 表

继续用 HTML `<table class="demo__table">`，不抽组件。

## Styling

- 单一样式文件：`src/styles/index.scss`（SCSS + BEM；取代旧 CSS）
- 在 `playground-layout.vue` 引入一次；demo 页不再各自 import 旧 CSS
- 块：`playground`（壳）、`demo`（文档页）、`demo-block`（试一试卡片）
- Token / mixin 对齐 Element：主色 `#409eff`，边框 `#e4e7ed`，表头 `#fafafa`；API / 卡片标题带左侧主色条
- `wide`：通栏；`readable`：说明与 API 约 `56rem`，`demo-block` 约 `64rem`

### Sidebar（`playground-layout.vue`）

保持白底分组结构，增强：

- 品牌字号略增
- 分组标题更弱、更清晰（小字 / 字距）
- 链接 padding / hover / active 更接近 Element Plus 侧栏

## File Changes

**新增**

- `src/components/demo/demo-page.vue`
- `src/components/demo/demo-block.vue`
- `src/styles/index.scss`

**修改**

- `src/layouts/playground-layout.vue` — 侧栏样式并入 `index.scss`；引入该文件
- PlusTable demos ×4 — 套 `DemoPage`/`DemoBlock`
- Composables demos ×3 — 同上

**删除**

- `src/views/styles/demo-page.css`
- `src/views/composables/composables-demo.css`

## Out of Scope

- Show Code / 语法高亮
- 独立文档站或路由拆分
- 改 PlusTable / composables 运行时行为
- 单元测试（除非 typecheck 需要）

## Acceptance Criteria

1. 侧栏观感接近 Element Plus 文档导航（白底、分组、蓝激活）
2. 每页呈现：标题 → 说明 → API 表 → Demo 卡片，层次清晰
3. PlusTable 页表格可用宽度充足；Composable 页说明行长可读
4. 新增 demo 只需套 `DemoPage` + `DemoBlock` 即可与现网一致
5. `pnpm typecheck` 通过

# Playground Header Categories Design

Date: 2026-07-18

## Goal

为 playground 增加一级 header 导航，按 `components`、`composables`、`packages` 分类现有内容，同时保留侧栏中的二级分组与 demo 链接。

## Decisions

- 在 `playground-layout.vue` 内维护一级分类到现有 `route.meta.group` 的映射，不批量修改路由。
- `components` 包含 `PlusTable` 与 `ERP 场景`；`composables` 包含 `Composables`。
- `packages` 当前没有路由，显示为禁用项。
- 点击有内容的一级分类后，侧栏仅展示该分类的分组，并按分类中的分组顺序及 `meta.order` 自动进入第一条路由。
- 直接访问 demo URL 时，根据当前路由的 `meta.group` 同步一级分类高亮。

## Layout and Interaction

- playground 改为上下结构：白色 header 在上，原“侧栏 + 主内容”区域在下。
- 品牌 `Workbench` 从侧栏移入 header。
- header 使用语义化导航与按钮；活动项、悬停态、键盘焦点态沿用现有 Element Plus 文档风格。
- header 保持不滚动；侧栏和主内容继续各自处理纵向滚动。

## Files

- 修改 `src/layouts/playground-layout.vue`：分类配置、当前分类同步、切换与导航。
- 修改 `src/styles/index.scss`：header、主体容器、分类按钮及焦点样式。

## Validation

- `pnpm typecheck`
- `pnpm build`
- 浏览器检查：
  - `components` 显示 `PlusTable`、`ERP 场景`，并进入第一项。
  - `composables` 只显示 `Composables`，并进入第一项。
  - 深层 URL 能正确恢复一级分类高亮。
  - `packages` 可见但禁用。
  - header 固定，侧栏与主内容滚动正常。

仓库目前没有 layout 测试或 Vue Test Utils，本次不引入新的测试依赖。

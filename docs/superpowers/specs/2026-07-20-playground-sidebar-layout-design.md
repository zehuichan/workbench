# Playground Layout → Sidebar Shell Design

Date: 2026-07-20

## Goal

将 playground 外壳重构为 shadcn-vue **完整 Sidebar 壳**：左侧用 `Sidebar` 做分组菜单（不做展开收起），顶栏 categories 用 `NavigationMenu`（无下拉）。布局文件拆到 `layouts/` 平级后由 `playground-layout.vue` 组装。

## Decisions

| 项 | 选择 |
|----|------|
| 侧栏组件 | shadcn `Sidebar`（非 Navigation Menu） |
| 顶栏 categories | `NavigationMenu` + `NavigationMenuLink`，无 Trigger/Content |
| 分组交互 | 始终展开；不接 `Collapsible` |
| 侧栏整体 | `collapsible="none"`，不做 icon/offcanvas |
| 文件位置 | `playground-sidebar.vue` / `playground-header.vue` 与 layout 平级，均在 `layouts/` |
| 路由数据 | 保留 `router` 的 `meta.group` / `meta.title` / `meta.order`；分类状态仍在 layout |
| 样式 | 壳改用 Tailwind + sidebar token；删除 `index.scss` 中 `.playground*` 壳样式；`.demo*` 保留 |

## File Architecture

```text
src/
├── layouts/
│   ├── playground-layout.vue      # 组装壳 + 分类/路由状态
│   ├── playground-sidebar.vue     # Sidebar：品牌 + 分组菜单
│   └── playground-header.vue      # NavigationMenu categories
├── ui/                            # CLI 安装
│   ├── sidebar/
│   └── navigation-menu/
└── styles/
    └── index.scss                 # 去掉 .playground 壳样式；demo 保留
```

## Composition

```text
playground-layout.vue
└── SidebarProvider
    ├── playground-sidebar.vue
    │   └── Sidebar (collapsible="none")
    │       ├── SidebarHeader → "Workbench"
    │       └── SidebarContent
    │           └── SidebarGroup × N
    │               ├── SidebarGroupLabel
    │               └── SidebarMenu → SidebarMenuButton + RouterLink
    └── SidebarInset
        ├── playground-header.vue → NavigationMenu (categories)
        └── <main><router-view /></main>
```

## Component Contracts

### `playground-layout.vue`

- 保留现有逻辑：`categories`、`activeCategory`、`navGroups`、`groupRoutes`、`categoryForGroup`、`selectCategory`、`watch(route.meta.group)`。
- 模板仅组装 Provider / Sidebar / Header / `router-view`，不再手写 aside/link 列表。

### `playground-sidebar.vue`

| Prop | 类型 | 说明 |
|------|------|------|
| `groups` | `{ name: string; links: { to: string; label: string }[] }[]` | 当前分类下的分组菜单 |

- 品牌文案固定 `Workbench`。
- 链接用 `RouterLink` + `SidebarMenuButton as-child`；激活态用路由匹配（`is-active` / `useRoute`）。
- 无图标、无 footer、无 rail（YAGNI）。

### `playground-header.vue`

| Prop / Emit | 类型 | 说明 |
|-------------|------|------|
| `categories` | `{ key: string; groups: readonly string[] }[]` | 顶栏分类 |
| `activeCategory` | `string` | 当前分类 |
| `select` | emit `(key: string)` | 用户选择分类 |

- 无 groups 的分类禁用（与现状一致）。
- 使用 `NavigationMenuLink` 样式触发选择；不使用下拉。

## Data Flow

1. 路由变化 → layout 根据 `meta.group` 同步 `activeCategory`。
2. `activeCategory` → 计算 `navGroups` → 传入 sidebar。
3. 点击 header category → emit `select` → layout `selectCategory` → 跳转该分类首条路由并更新 `activeCategory`。

## Installation

```bash
pnpm dlx shadcn-vue@latest add sidebar navigation-menu
```

组件落入 `src/ui`（`components.json` aliases.ui）。sidebar 依赖的配套组件（如 button、separator、tooltip、sheet、skeleton）以 CLI 实际写入为准。

## Out of Scope

- 暗色模式开关、侧栏折叠/持久化、移动端 Sheet 定制
- 菜单图标、footer、用户菜单
- 迁移 demo 页 / Element Plus / PlusTable 样式
- 改动 `router/index.ts` 路由表结构（除非组装时发现必要的小修正）

## Success Criteria

1. `layouts/` 下存在三个平级文件，并由 `playground-layout.vue` 组装。
2. 左侧按 group 展示菜单，始终展开；切换顶栏 category 仍跳到该分类首条 demo。
3. 当前路由项高亮正确；空 groups 的 category（如 packages）禁用。
4. `src/ui` 含 sidebar 与 navigation-menu；`.playground*` 壳 SCSS 已移除。
5. `pnpm typecheck` 通过；现有 playground 路由可浏览。

# PlusTable Demos Design

Date: 2026-07-12  
Updated: 2026-07-12（引入 vue-router 与可扩展 playground shell）

## Goal

本地 playground：按场景展示 PlusTable 核心能力；路由与布局一次性按多模块规划，后续可挂 composables 等 demo，互不共享状态。

## Decisions

| 项 | 选择 |
|----|------|
| 路由 | vue-router；一段一路由 |
| 布局 | 左侧分组导航 + 右侧 `router-view` |
| 目录 | `src/views/plus-table/`（页面）、`src/layouts/`、`src/router/` |
| 文件命名 | kebab-case（如 `basic-editing-demo.vue`） |
| 实现风格 | 各 demo 自包含 data/columns/toolbar |
| 本期范围 | router + layout + PlusTable 四页 |
| 明确不做（本期） | composables 页面内容、多语言、真实后端、单元测试、文档站 |
| Composables 导航 | 本期不出现；有页面后再加分组 |

## Routes

| 路径 | 组件 |
|------|------|
| `/` | 重定向 → `/plus-table/basic-editing` |
| `/plus-table/basic-editing` | `basic-editing-demo.vue` |
| `/plus-table/dependencies-validation` | `dependencies-validation-demo.vue` |
| `/plus-table/history-dirty` | `history-dirty-demo.vue` |
| `/plus-table/pagination-rows` | `pagination-rows-demo.vue` |

后续约定（不实现）：`/composables/<name>`，如 `/composables/use-auto-save`。

## File Structure

```
src/
  App.vue                            # el-config-provider + router-view
  main.ts                            # app.use(router)
  router/index.ts
  layouts/playground-layout.vue      # 侧栏分组 + <router-view />
  views/plus-table/
    basic-editing-demo.vue
    dependencies-validation-demo.vue
    history-dirty-demo.vue
    pagination-rows-demo.vue
```

不强制 `demo-section.vue`：单页已有 layout 标题区时，各 demo 自带简短说明即可。

组件 `name` 仍用 PascalCase（如 `BasicEditingDemo`）。

## Layout

`playground-layout.vue`：

- 左侧：分组「PlusTable」，四条 `router-link`
- 右侧：当前 demo
- 轻量样式：侧栏固定宽、内容区 `max-width` + padding；无营销页视觉

`App.vue`：仅 `el-config-provider` + `router-view`（layout 作为父路由组件，或 App 内包 layout）。

推荐父路由：

```ts
{
  path: '/',
  component: PlaygroundLayout,
  children: [ /* plus-table routes */ ],
}
```

## Dependencies

- 增加 `vue-router`（与 Vue 3.5 兼容的现行大版本）

## Demo Pages

### basic-editing-demo.vue

- 多编辑器 + cell 编辑；`editMode="cell"`，`border`
- 列：index、input、input-number、select、date-picker、switch
- 本地 `ref` data，`v-model:data`

### dependencies-validation-demo.vue

- 类别 → 子选项联动（`dependencies.triggerFields` + `componentProps` / `trigger`）
- `required` + `rules`；可触发失败的空值行
- Toolbar「校验」调用 `ref.validate()`；错误用表格自带提示

### history-dirty-demo.vue

- `history` + `dirtyTracking`
- Toolbar：Undo / Redo / 脏行数 / Reset tracking

### pagination-rows-demo.vue

- 内存全量 + `computed` 当前页切片；`total` / `page` / `pageSize`
- Toolbar：新增 / 删除 / 复制（对全量源数据操作后再切片）

## Data & Domain

- 轻量任务 / 订单类字段
- 各文件自备 `data` / `columns`，不抽共享 mock

## Extensibility (composables，后续)

现有 composables：`use-auto-save`、`use-save-hotkey`、`use-form-draft`。

届时：

1. 在 `src/views/composables/` 增加 `*-demo.vue`
2. 在 `router/index.ts` 注册 `/composables/...`
3. 在 layout 侧栏增加「Composables」分组

本期不创建这些文件与路由。

## Styling

- `el-config-provider size="small"`
- 侧栏 + 内容区简单 CSS；不为 demo 写复杂 SCSS

## Acceptance Criteria

1. `pnpm dev` 可打开；侧栏可切换四个 PlusTable 路由，URL 随路由变化
2. `/` 重定向到 `/plus-table/basic-editing`
3. 基础页：至少 5 种编辑器可进编并提交
4. 联动页：改触发字段后子选项或禁用态变化；空必填可出校验提示
5. 历史页：Undo/Redo 有效；脏行数随编辑变化，Reset 后清零
6. 分页页：翻页 / pageSize 正常；增删复制后总数与当前页一致
7. `pnpm typecheck` 通过
8. 侧栏本期无 Composables 分组

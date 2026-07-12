# Composables Demos Design

Date: 2026-07-12

## Goal

在既有 playground 中新增 Composables 分组：三个场景向 demo，分别展示 `useAutoSave`、`useFormDraft`、`useSaveHotkey`；轻量 el-form，与 PlusTable demos 互不共享状态。

## Decisions

| 项 | 选择 |
|----|------|
| 覆盖范围 | 三个 composable，各一页 |
| 深度 | 场景向（典型用法，非全边界） |
| UI 载体 | 轻量 el-form / 输入区 |
| 结构 | 延续 PlusTable 扩展约定：独立页面 + 路由 + 侧栏分组 |
| 共享组件 | 不抽 demo shell |
| 明确不做 | 真实后端、PlusTable 集成、单元测试、文档站 |

## Routes

| 路径 | 组件 |
|------|------|
| `/composables/use-auto-save` | `use-auto-save-demo.vue` |
| `/composables/use-form-draft` | `use-form-draft-demo.vue` |
| `/composables/use-save-hotkey` | `use-save-hotkey-demo.vue` |

`/` 仍重定向到 `/plus-table/basic-editing`，不变。

## File Structure

```
src/
  layouts/playground-layout.vue   # 增加 Composables 分组
  router/index.ts                 # 注册三条路由
  views/composables/
    use-auto-save-demo.vue
    use-form-draft-demo.vue
    use-save-hotkey-demo.vue
```

组件 `name` 用 PascalCase（如 `UseAutoSaveDemo`）。

## Layout

`playground-layout.vue` 在 PlusTable 分组下增加「Composables」分组，三条 `router-link`，样式沿用现有侧栏。

## Demo Pages

### use-auto-save-demo.vue

- 表单字段（如 title / note）作为 `source`
- `save`：模拟异步写入（短 delay + 内存「服务端快照」）
- 展示 `status` / `lastSavedAt` / `error`
- 控件：`enabled` 开关、`debounceMs` 在 500 / 1500 间切换、Flush、withPaused（暂停期间改表单不触发自动保存）
- 旁路展示服务端快照，便于对照 debounce / flush

### use-form-draft-demo.vue

- `el-form` + 固定 localStorage demo key（如 `composables-demo:form-draft`）
- 编辑后 debounce 写入；展示 `isPending` / `error`
- 按钮：Restore、Clear、Flush；`enabled` 开关
- 说明：刷新后需手动 Restore（显式恢复）；Restore 与 `defaults` 浅合并

### use-save-hotkey-demo.vue

- 主表单注册 Ctrl/Cmd+S → 与「保存」按钮同一 handler（`ElMessage` + 保存次数计数）
- `enabled` / `active` 开关
- 嵌套：`el-dialog` 内再注册一层 hotkey，演示深层优先；关闭后回到主表单

## Styling

- 沿用 playground：`el-config-provider size="small"`，页面内轻量布局与说明文字
- 不为 demo 写复杂 SCSS

## Acceptance Criteria

1. 侧栏出现 Composables 分组，可切换三个路由，URL 正确
2. auto-save：编辑后 status 经 pending → saving → saved；Flush / withPaused / enabled 行为可观察
3. form-draft：编辑后可 flush 到 localStorage；Restore / Clear 有效；刷新后需手动 Restore
4. save-hotkey：Ctrl/Cmd+S 触发主 handler；dialog 打开时优先对话框 handler；enabled/active 可关掉响应
5. `pnpm typecheck` 通过

# PlusTable Demos Design

Date: 2026-07-12

## Goal

在本地 playground 中按场景展示 PlusTable 核心能力，方便调试与演示。页面纵向堆叠四段独立 demo，互不共享状态。

## Decisions

| 项 | 选择 |
|----|------|
| 组织方式 | 按场景分四段 |
| 目录 | `src/views/plus-table/` |
| 文件命名 | kebab-case（如 `basic-editing-demo.vue`） |
| 呈现 | 纵向堆叠，一页滚完 |
| 实现风格 | 各 demo 自包含 data/columns/toolbar；可选薄封装 `demo-section.vue` |
| 明确不做 | 路由、多语言、真实后端、单元测试、文档站 |

## File Structure

```
src/views/plus-table/
  demo-section.vue
  basic-editing-demo.vue
  dependencies-validation-demo.vue
  history-dirty-demo.vue
  pagination-rows-demo.vue
src/App.vue
```

组件 `name` 仍用 PascalCase（如 `BasicEditingDemo`）。

`App.vue`：`el-config-provider` + 标题「PlusTable Demos」+ 按序挂载四段。

## Sections

### demo-section.vue

- Props：`title`、`description`
- 默认槽：demo 内容
- 轻量样式：标题 + 一行说明 + 内容区；段间间距；无卡片阴影

### basic-editing-demo.vue

- 展示：多编辑器 + cell 编辑
- `editMode="cell"`，`border`
- 列覆盖：index、input、input-number、select、date-picker、switch
- 本地 `ref` data，`v-model:data`

### dependencies-validation-demo.vue

- 展示：字段联动 + 校验
- 示例：类别 → 子选项（`dependencies.triggerFields` + `componentProps` / `trigger`）
- `required` + `rules`；保留可触发失败的空值行
- 可选 toolbar「校验」调用 `ref.validate()`
- 校验错误使用表格自带单元格提示

### history-dirty-demo.vue

- 展示：撤销重做 + 脏追踪
- Props：`history`、`dirtyTracking`
- Toolbar：Undo / Redo / 显示脏行数 / Reset tracking
- 调用 `undo` / `redo` / `getModifiedRows` / `resetTracking`

### pagination-rows-demo.vue

- 展示：服务端风格分页 + 行操作
- 内存全量数据；`computed` 当前页切片传给表格
- `total` / `page` / `pageSize` + `page-change`
- Toolbar：新增 / 删除 / 复制，经 `tableRef.insertRow` / `removeRow` / `duplicateRow` 操作全量源数据后再切片

## Data & Domain

- 轻量业务主题（任务 / 订单类字段）
- 各文件自备 `data` / `columns`，不抽共享 mock

## Styling

- 沿用现有 playground：居中、`max-width`、适当 padding
- `el-config-provider size="small"`
- 不为 demo 单独写复杂 SCSS

## Acceptance Criteria

1. `pnpm dev` 打开后自上而下可见四段，各自可独立编辑
2. 基础段：至少 5 种编辑器可进编并提交
3. 联动段：改触发字段后子选项或禁用态变化；空必填可出校验提示
4. 历史段：编辑后 Undo/Redo 有效；脏行数随编辑变化，Reset 后清零
5. 分页段：翻页 / 改 pageSize 正常；新增 / 删除 / 复制后总数与当前页一致
6. `pnpm typecheck` 通过

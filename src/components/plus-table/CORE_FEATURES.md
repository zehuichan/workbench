# PlusTable 核心功能归档

本文档面向维护与二次开发，概括模块职责、能力边界与源码映射。使用说明与 API 详见 [README.md](./README.md)。

---

## 1. 能力域一览

| 能力域 | 说明 | 主要实现 |
|--------|------|----------|
| 配置式列 | 继承 `TableColumnCtx`，扩展 `editable` / `component` / `render` / `dependencies` 等 | `types.ts`、`plus-table-column.vue`、`column-utils.ts` |
| 数据双向绑定 | `v-model:data`，行增删改复制由父级数据驱动 | `plus-table.vue`、`use-row-options.ts` |
| 编辑体系 | `cell` / `row` / `manual` / 内部 `all` 模式；确认、取消、编辑值快照 | `use-editable.ts`、`plus-table-cell.vue` |
| 内置编辑器 | 字符串 key → Element Plus 组件映射 | `adapter.ts`（`ELEMENT_ADAPTER_MAP`） |
| 校验 | async-validator，表级 + 列级 + 依赖动态规则 | `use-validation.ts` |
| 单元格联动 | `triggerFields`、`disabled` / `rules` / `componentProps` / `trigger` | `use-dependencies.ts` |
| 脏数据 | 修改单元格标记、导出变更行/单元格 | `use-dirty-tracking.ts` |
| 键盘与热键 | 方向键、Tab、Enter、撤销重做等；可扩展 `hotkeys` | `use-hotkey.ts`、`hotkey-utils.ts` |
| 导航与焦点 | 激活行/列、点击、程序化 `focusCell` | `use-navigation.ts`、`focus-utils.ts` |
| 撤销重做 | 编辑历史栈，与 dirty 同步 | `use-edit-history.ts` |
| 确认/撤销包装 | 确认编辑时校验与历史入栈、undo/redo 时同步 dirty 与联动 | `use-edit-actions.ts` |
| 行级数据操作 | 插入、删除、移动、复制行（依赖 `activeRowIndex` 同步） | `use-row-options.ts` |
| 列设置 | 显隐、排序、列宽、本地持久化 | `use-column-options.ts`、`plus-table-column-setting.vue` |
| 样式状态类 | 激活、错误、脏行/格 | `use-class-names.ts` |
| 分页 | 传 `total` 显示底栏；**不对 data 切片**（服务端分页） | `plus-table-pagination.vue`、`plus-table.vue` |
| 自适应高度 | 视口剩余高度 → `maxHeight` | `use-adaptive.ts` |
| 上下文注入 | 子组件共享编辑/校验/联动 API | `constants.ts`（`PLUS_TABLE_INJECTION_KEY`）、`types.ts`（`PlusTableContext`） |

---

## 2. 目录与文件职责

| 路径 | 职责 |
|------|------|
| `plus-table.vue` | 组装 composables、provide 上下文、分页/自适应/表头表尾布局、`defineExpose` |
| `plus-table-column.vue` | 递归列渲染，对接 `ElTableColumn` |
| `plus-table-cell.vue` | 展示态 / 编辑态切换、依赖解析结果消费、校验展示 |
| `plus-table-column-setting.vue` | 列设置 UI（树、拖拽、宽度） |
| `plus-table-pagination.vue` | 分页条 UI 与事件 |
| `index.ts` | 对外导出组件与类型 |
| `types.ts` | `PlusTableColumn`、`PlusTableContext`、`Hotkey*`、`AdaptiveConfig` 等 |
| `constants.ts` | 特殊列类型常量、`PLUS_TABLE_INJECTION_KEY` |
| `adapter.ts` | 内置编辑组件注册表 |
| `styles/index.scss` | 表格包装与单元格状态类样式 |
| `composables/*.ts` | 见下节 |
| `utils/*.ts` | 列扁平/设置树、焦点、热键解析等纯函数或薄封装 |

---

## 3. Composables 索引

| 模块 | 职责摘要 |
|------|----------|
| `use-column-options` | 列顺序、显隐、宽度覆盖、localStorage 持久化 |
| `use-adaptive` | ResizeObserver / 窗口尺寸，计算 `maxHeight` |
| `use-navigation` | `activeRowIndex` / `activeColIndex`、`navigableColumns`、点击与 class |
| `use-row-options` | `insertRow` / `deleteRow` / `moveRow` / `duplicateRow`，emit `update:data` |
| `use-dirty-tracking` | 脏格集合、`getModifiedRows`、`resetTracking` |
| `use-dependencies` | 按列 `dependencies` 解析 `DependencyState`，字段变更 `onFieldChange` |
| `use-editable` | 编辑进入/退出、编辑值、`editMode`、与导航/热键协作 |
| `use-validation` | 构建校验器、单元格错误查询、`validate` / `scrollToFirstError` |
| `use-hotkey` | 绑定容器键盘事件，合并内置逻辑与自定义 `hotkeys` |
| `use-edit-history` | undo/redo 栈 |
| `use-edit-actions` | `confirmEdit` / `undo` / `redo` 包装：校验、历史、dirty、联动字段变更 |
| `use-class-names` | 行/格 class 名（激活、错误、脏） |

---

## 4. 主组件内组合顺序（数据流要点）

以下为阅读 `plus-table.vue` 时的逻辑顺序（非严格调用栈）：

1. **列**：`useColumnOptions` → `visibleColumns`（后续导航、编辑、联动均基于可见列）。
2. **布局**：`useAdaptive` + `wrapperEl`。
3. **导航**：`useNavigation`（依赖 `data`、`visibleColumns`）。
4. **行数据**：`useRowOptions`（依赖 `activeRowIndex`）。
5. **脏标记**：`useDirtyTracking`。
6. **联动**：`useDependencies`（依赖 `markDirty`）。
7. **编辑**：`useEditable`（消费联动禁用等）。
8. **校验**：`useValidation`。
9. **历史**：`useEditHistory`（undo/redo 栈与 `pushChange`）。
10. **样式类**：`useClassNames`（依赖 dirty、错误、激活状态）。
11. **编辑动作包装**：`useEditActions`（`confirmEditWithHistory` / `wrappedUndo` / `wrappedRedo`，依赖校验与历史）。
12. **热键**：`useHotkey`（使用包装后的确认与撤销）。

13. **注入**：`provide(PLUS_TABLE_INJECTION_KEY)`，将上下文注入 `plus-table-cell` 等子组件。

---

## 5. 对外暴露能力（`defineExpose` 分组）

- **表格实例**：`getElTable` 及透传的 `clearSelection`、`sort`、`scrollTo`、`doLayout` 等。
- **导航**：`navigate`、`focusCell`、`getColIndexByProp`、`focusAndEditByProp`、`activeRowIndex`、`activeColIndex`、`activeRow`、`activeColumn`。
- **编辑**：`editMode`、`isEditing`、`startEdit`、`confirmEdit`、`cancelEdit`。
- **校验**：`validate`、`validateField`、`clearValidation`、`scrollToFirstError`。
- **行与脏数据**：`insertRow`、`deleteRow`、`moveRow`、`duplicateRow`、`getModifiedRows`、`markDirty`、`clearDirty`、`resetTracking`、`getDirtyCells`、`isCellDirty`、`isRowDirty`。
- **列**：`toggleColumn`、`reorderColumns`、`setColumnWidth`、`resetColumns`。
- **历史**：`undo`、`redo`、`canUndo`、`canRedo`、`clearHistory`。

行/列下标约定：**均为当前 `data` 数组下标**（分页场景下即当前页数据）。

---

## 6. 与 README 的分工

| 文档 | 用途 |
|------|------|
| [README.md](./README.md) | Props、事件、插槽、列配置、热键列表、快速示例 |
| **CORE_FEATURES.md（本文）** | 模块边界、源码映射、组合顺序、维护时快速定位 |

新增能力时：先更新实现与 `types.ts`，再同步 **README**（用户可见 API），若涉及模块拆分则补充本文 **§1–§3** 对应行。

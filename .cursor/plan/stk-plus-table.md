# StkPlusTable — 以 stk-table-vue 为基座复现 .plus-table 特性

> **定位**：在保留高性能虚拟滚动的前提下，用 stk-table-vue 作为表格渲染基座，复现 ReTableNext（.plus-table）的企业级能力（自适应高度、单元格导航与热键、编辑系统、校验、单元格联动、行/列操作）。  
> **约束**：基座为 stk-table-vue；不采用 el-table；编辑/校验/联动/行列操作在 customCell 与 composables 层实现。

---

## 〇、进度里程碑

| 阶段 | 名称 | 状态 | 完成度 | Demo |
|------|------|------|--------|------|
| 0 | 脚手架 + 基座接入 + 列映射 + 自适应高度 + header/footer | ⏳ 未开始 | 0/14 | `/stk-plus-table` |
| 1 | 单元格导航 + 热键 | ⏳ 未开始 | 0/14 | `/stk-plus-table/stage1` |
| 2 | 编辑系统 | ⏳ 未开始 | 0/13 | `/stk-plus-table/stage2` |
| 3 | 校验 + 行/列操作 + 列设置 | ⏳ 未开始 | 0/10 | `/stk-plus-table/stage3` |
| 4 | 单元格联动（Cell Dependencies） | ⏳ 未开始 | 0/10 | `/stk-plus-table/stage4` |

**当前进度：** 阶段 0 未开始

**整体完成度：** 0/61 任务（约 0%）

---

## 一、Prompt 增强与需求边界

### 1.1 增强后需求

- **目标**：以 stk-table-vue 为基座，复现 .plus-table.md 中定义的企业级表格能力，在保证**高性能（虚拟滚动）**的前提下，提供与 ReTableNext 对齐的交互与配置。
- **技术约束**：
  - 基座：**stk-table-vue**（虚拟滚动、DOM 渲染、StkTableColumn / customCell / customHeaderCell）。
  - 不采用 el-table；不沿用 re-table-next 的 DOM 结构，需做**列配置与单元格渲染适配层**。
- **范围边界**：
  1. 自适应高度（容器填满剩余视口，高度传给 stk-table 滚动容器）
  2. 单元格导航 + 热键（方向键、Tab、Enter、Home/End、Ctrl+Home/End，可扩展）
  3. 编辑系统 + 校验 + 单元格联动（四种编辑模式、async-validator、dependencies/trigger）
  4. 行/列操作（insertRow/deleteRow/moveRow/duplicateRow、列显隐/排序/持久化、列设置面板）
  5. 虚拟滚动（由 stk-table-vue 基座提供，无需自研）
- **验收标准**：每阶段有对应 Demo 路由可验收；`vue-tsc` 零错误；功能与 .plus-table 清单对齐（允许适配层 API 差异）。

### 1.2 与 .plus-table / .virtual-table 的关系

| 维度 | .plus-table（ReTableNext） | .virtual-table（规划） | 本方案（StkPlusTable） |
|------|---------------------------|------------------------|-------------------------|
| 基座 | el-table | 自研虚拟表格 | **stk-table-vue** |
| 虚拟滚动 | 无 | 自研 | 基座自带 |
| 编辑/校验/联动/行列操作 | 有（已实现） | 有（规划） | 复现，在 stk 之上实现 |
| 选区/剪贴板 | 无 | 有（规划） | 可选后续阶段 |

---

## 二、技术方案（多角度综合）

### 2.1 技术/实现视角

- **基座能力**：stk-table-vue 提供虚拟滚动、固定表头/列（sticky）、行/单元格高亮（rowActive/cellActive）、列配置（dataIndex、width、customCell、customHeaderCell、sort、fixed）。**不提供**：编辑态、校验、导航状态、热键、行列操作 API。
- **适配层**：
  - **列配置映射**：维护一套「Plus 风格」列定义（editable、component、componentProps、rules、dependencies、render 等），在传给 stk-table 前转换为 StkTableColumn，并通过 **customCell** 统一渲染「展示/编辑」分支及高亮。
  - **导航与滚动**：自建 `use-navigation`（activeRowIndex/activeColIndex、navigate、focusCell）；导航后调用 stk-table 的滚动 API（或容器 scrollTo/scrollTop/scrollLeft）保证激活格在视区内。
  - **编辑/校验/联动**：与 .plus-table 相同的 composables 逻辑（use-editable、use-validation、use-dependencies），挂载点改为「stk 的 customCell 返回的单元格内容」；仅当前编辑格挂载编辑器组件，避免性能问题。
- **风险**：stk-table-vue 的滚动 API 与 ref 暴露需查阅官方文档确认（scrollToRow/scrollTo 等）；若 API 不足，需通过容器 ref 自行计算并设置 scrollTop/scrollLeft。

### 2.2 体验视角

- 与 ReTableNext 保持一致：键盘导航、编辑态进入/确认/取消、错误样式与 tooltip、行列操作入口、列设置面板。虚拟滚动下需保证：**激活格滚入视区**、**焦点不丢失**、**浮层编辑器（Select/DatePicker）不触发表格失焦**（与 .plus-table 一致处理）。

### 2.3 性能

- 虚拟滚动由基座保证；data 使用 shallowRef 避免深度响应式；编辑/校验仅作用于当前格或可见行；热键用 when 守卫减少无效构建。

---

## 三、文件结构设计

```
src/components/stk-plus-table/
├── StkPlusTable.vue                  # 主组件（包裹 stk-table-vue + header/footer）
├── StkPlusTableCell.vue              # 单元格封装（展示/编辑分支、插槽、校验样式、联动状态）
├── StkPlusTableColumnSetting.vue     # 列设置面板（显隐、排序、可选树状多级表头）
├── types.ts                          # 类型（Plus 风格 Column、Props、CellContext、AdaptiveConfig 等）
├── constants.ts                      # injectKey、默认值
├── column-map.ts                     # Plus 列 → StkTableColumn 映射 + customCell 注入
├── index.ts                          # 导出
│
├── composables/
│   ├── use-store.ts                  # 集中式状态（可选，与导航/编辑共享）
│   ├── use-adaptive.ts               # 自适应高度（ResizeObserver → 容器高度）
│   ├── use-navigation.ts             # 单元格导航（activeRowIndex/activeColIndex、navigate、focusCell）
│   ├── use-hotkey.ts                 # 热键解析、注册、分发
│   ├── use-editable.ts               # 编辑状态（startEdit、confirmEdit、cancelEdit、四种模式）
│   ├── use-edit-history.ts           # undo/redo
│   ├── use-validation.ts             # async-validator、validate/validateField/clearValidation
│   ├── use-column-options.ts         # 列显隐、排序、持久化
│   ├── use-row-options.ts            # insertRow、deleteRow、moveRow、duplicateRow
│   ├── use-dirty-tracking.ts          # markDirty、getModifiedRows
│   ├── use-dependencies.ts            # 单元格联动（resolveDependencyState、onFieldChange、trigger）
│   └── index.ts
│
├── adapter.ts                        # Element 编辑组件适配（与 .plus-table 一致）
│
└── styles/
    ├── index.scss
    ├── cell.scss
    └── validation.scss
```

**说明**：不包含自研虚拟滚动；stk-table-vue 通过依赖引入，在 `StkPlusTable.vue` 中引用其表格组件并传入映射后的 columns 与 data。

---

## 四、实施步骤（按阶段）

### 阶段 0：脚手架 + 基座接入 + 列映射 + 自适应高度 + header/footer

**目标**：引入 stk-table-vue，搭建 StkPlusTable 目录，实现 Plus 风格 columns 到 StkTableColumn 的映射、customCell 渲染展示态，自适应高度与 header/footer 布局。

- [ ] **0.1** 添加依赖 `stk-table-vue`，确认 Vue 3 兼容性与 TypeScript 类型
- [ ] **0.2** 创建 `src/components/stk-plus-table/` 目录及 `types.ts`、`constants.ts`
- [ ] **0.3** 定义 Plus 风格列类型与 Props（与 .plus-table 对齐：editable、component、componentProps、rules、render、children、dependencies 等扩展项）
- [ ] **0.4** 实现 `column-map.ts`：将 Plus 列转换为 StkTableColumn（dataIndex、width、align、fixed 等），并注入 customCell/customHeaderCell 委托到统一渲染入口
- [ ] **0.5** 实现 `StkPlusTableCell.vue`：仅展示态（插槽 → render → 原始值），接收 row、column、rowIndex、colIndex、slots；不包含编辑与校验逻辑
- [ ] **0.6** 实现 `StkPlusTable.vue` 主组件：挂载 stk-table-vue，传入 data、映射后的 columns、ref 获取滚动容器
- [ ] **0.7** 主组件中实现 header 区域（纯 HTML，插槽 `#title`、`#actions`）
- [ ] **0.8** 主组件中实现 footer 区域（插槽 `#summary`、`#pagination`）
- [ ] **0.9** 创建 `use-adaptive.ts`：ResizeObserver 监听容器，计算 `height = 视口 - offsetTop - offsetBottom`，设置表格容器高度
- [ ] **0.10** 实现 `adaptive` prop（true | AdaptiveConfig），与 use-adaptive 联动；resize 时重新计算，卸载时清理
- [ ] **0.11** 创建 Demo 页面与路由 `/stk-plus-table`，渲染约 100 行 × 10 列
- [ ] **0.12** 验证：斑马纹/边框/对齐、自适应填满剩余视口、header/footer 插槽可用
- [ ] **0.13** 支持多级表头：Plus columns 的 children 递归映射为 stk 的列嵌套（若 stk 支持）；否则首阶段仅扁平列
- [ ] **0.14** 导出 `StkPlusTable` 及类型，`index.ts` 整理

**产出验收**：可展示数据表格，高度自适应，列配置为 Plus 风格且经映射驱动 stk-table-vue；无编辑/导航时无报错。

---

### 阶段 1：单元格导航 + 热键

**目标**：方向键/Tab/Enter/Home/End/Ctrl+Home/End 导航，可扩展热键；激活格高亮并滚动入视区。

- [ ] **1.1** 创建 `use-navigation.ts`：`activeRowIndex`、`activeColIndex`、`navigate(rowDelta, colDelta)`、`focusCell(rowIndex, colIndex)`，可导航列列表（跳过 hidden/selection）
- [ ] **1.2** 在 StkPlusTableCell 或 customCell 中根据 `(rowIndex, colIndex) === (activeRowIndex, activeColIndex)` 应用 cellActive 样式类
- [ ] **1.3** 实现 rowActive：点击行时更新 activeRowIndex（可选保持 colIndex）
- [ ] **1.4** 单元格可 focus（tabindex、ref），点击时更新激活格并 focusCell
- [ ] **1.5** 创建 `use-hotkey.ts`：热键解析、注册、分发；useEventListener keydown，卸载清理
- [ ] **1.6** 内置热键：ArrowUp/Down/Left/Right、Tab、Shift+Tab、Enter、Home、End、Ctrl+Home、Ctrl+End
- [ ] **1.7** 导航后调用 stk-table 滚动 API 或容器 scrollTo，使激活格在视区内（需查阅 stk-table-vue 文档确定 API）
- [ ] **1.8** 支持 `hotkeys` prop 自定义/覆盖、`hotkeyEnabled` 总开关
- [ ] **1.9** 焦点管理：仅表格容器或其子元素获得焦点时响应热键
- [ ] **1.10** 主组件 provide navigation 与 hotkey context，StkPlusTableCell inject 并响应
- [ ] **1.11** Demo `/stk-plus-table/stage1`：键盘导航、激活高亮、滚动跟随
- [ ] **1.12** 字母/数字键直接进入编辑预留（与阶段 2 对接时实现）
- [ ] **1.13** 文档：导航与热键的 Props/Events 说明
- [ ] **1.14** 类型导出：HotkeyBinding、Navigation 相关类型

**产出验收**：键盘可完整遍历可导航单元格，激活格高亮且始终在视区内；热键可配置。

---

### 阶段 2：编辑系统

**目标**：四种编辑模式（none/cell/row/manual）、自定义编辑器插槽、编辑历史（undo/redo）。

- [ ] **2.1** 创建 `use-editable.ts`：`startEdit`、`confirmEdit`、`cancelEdit`；`editingRowIndex`、`editingColProp`（或 colIndex）；四种模式解析
- [ ] **2.2** 实现编辑态判断：`editable`、`column.editable`（布尔或函数），row 级控制
- [ ] **2.3** StkPlusTableCell 中增加编辑分支：`isEditingCell(rowIndex, colProp)` 时渲染编辑器，否则展示态
- [ ] **2.4** 实现 `component`、`componentProps` 动态编辑器；`componentProps` 支持函数 `(row, column) => Record`
- [ ] **2.5** 实现 `#editor-${prop}` 插槽，优先级高于 component；插槽 scope 含 modelValue、onUpdate:modelValue、confirm、cancel
- [ ] **2.6** 编辑器适配 `adapter.ts`：Element Input/InputNumber/Select/DatePicker 等（与 .plus-table 一致）
- [ ] **2.7** Tab/Enter 确认编辑并导航；Escape 取消编辑；row 模式 Tab 行内切换不确认
- [ ] **2.8** 编辑生命周期事件：cell-edit-start、cell-edit-end、cell-value-change（emit 或回调）
- [ ] **2.9** 创建 `use-edit-history.ts`：undo/redo 栈，默认最大 50 条；row 模式分组原子撤销
- [ ] **2.10** 热键集成：Ctrl+Z 撤销、Ctrl+Shift+Z/Ctrl+Y 重做
- [ ] **2.11** 浮层组件（Select、DatePicker）点击不触发表格失焦（focusout 检查 relatedTarget）
- [ ] **2.12** Demo `/stk-plus-table/stage2`：四种模式、插槽编辑器、undo/redo
- [ ] **2.13** expose：startEdit、confirmEdit、cancelEdit、undo、redo、canUndo、canRedo、clearHistory

**产出验收**：单元格/行编辑、确认/取消、历史撤销重做行为与 .plus-table 一致；虚拟滚动下仅当前编辑格挂载编辑器。

---

### 阶段 3：校验 + 行/列操作 + 列设置

**目标**：async-validator 校验、错误样式与 tooltip、行增删移复制、列显隐/排序/持久化、列设置面板、脏数据追踪。

- [ ] **3.1** 创建 `use-validation.ts`：表级 tableRules + 列级 column.rules，errors 存 `${rowIndex}-${prop}`，validate/validateField/clearValidation
- [ ] **3.2** 校验错误样式：单元格红框、el-tooltip 展示错误信息；getCellClassName 合并错误类
- [ ] **3.3** 实现 validateOnCellExit（confirmEdit 后对变更列执行 validateField）、validateTrigger 预留
- [ ] **3.4** 创建 `use-row-options.ts`：insertRow、deleteRow、moveRow、duplicateRow；emit update:data 或内部更新，需 v-model:data
- [ ] **3.5** 创建 `use-dirty-tracking.ts`：markDirty(rowIndex)、getModifiedRows()；confirmEdit 时对变更行 markDirty
- [ ] **3.6** 创建 `use-column-options.ts`：visibleColumns、toggleColumn、reorderColumns、resetColumns、持久化（tableKey + storage）
- [ ] **3.7** 实现 `StkPlusTableColumnSetting.vue`：显隐 checkbox、拖拽排序、全选/反选/重置；inject columnOptions
- [ ] **3.8** 主组件 columnSetting prop 为 true 时在 header actions 展示列设置入口
- [ ] **3.9** Demo `/stk-plus-table/stage3`：校验、行操作、列设置、脏数据
- [ ] **3.10** expose：validate、validateField、clearValidation、scrollToFirstError；insertRow、deleteRow、moveRow、duplicateRow、getModifiedRows、markDirty、clearDirty；toggleColumn、reorderColumns、resetColumns

**产出验收**：校验、行列操作、列设置面板与 .plus-table 能力对齐；expose API 可用。

---

### 阶段 4：单元格联动（Cell Dependencies）

**目标**：列配置 `dependencies`，触发字段变更时更新被依赖列的 disabled/required/rules/componentProps，支持 trigger 联动赋值。

- [ ] **4.1** 类型：DependencyApi、ColumnDependencies、DependencyState；Plus Column 新增 dependencies；Context 新增 resolveDependencyState、onFieldChange
- [ ] **4.2** 创建 `use-dependencies.ts`：buildTriggerMap、createDependencyApi、resolveDependencyState、onFieldChange
- [ ] **4.3** 主组件 useDependencies、provide；confirmEdit 后对每个 change 调用 onFieldChange(rowIndex, changedProp)
- [ ] **4.4** StkPlusTableCell：resolveDependencyState(rowIndex, column)，合并 depState.disabled、depState.componentProps 到编辑器
- [ ] **4.5** use-editable：isCellEditable 接受 isDepDisabled 回调
- [ ] **4.6** use-validation：mergeRules 支持 dependencies.rules、dependencies.required
- [ ] **4.7** trigger 执行与递归保护（v1 不递归）
- [ ] **4.8** column-map 或列绑定过滤 dependencies，不传给 stk 原生列
- [ ] **4.9** Demo `/stk-plus-table/stage4`：联动禁用、联动赋值、动态下拉、动态必填
- [ ] **4.10** 文档：dependencies 配置说明与示例

**产出验收**：与 .plus-table 阶段 5 行为一致；依赖列随触发字段更新。

---

## 五、关键文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 `stk-table-vue` 依赖 |
| `src/components/stk-plus-table/StkPlusTable.vue` | 新增 | 主组件，包裹 stk-table、header/footer、provide |
| `src/components/stk-plus-table/column-map.ts` | 新增 | Plus columns → StkTableColumn + customCell 注入 |
| `src/components/stk-plus-table/StkPlusTableCell.vue` | 新增 | 展示/编辑分支、校验样式、联动状态 |
| `src/components/stk-plus-table/composables/use-adaptive.ts` | 新增 | 自适应高度 |
| `src/components/stk-plus-table/composables/use-navigation.ts` | 新增 | 导航状态与 focusCell |
| `src/components/stk-plus-table/composables/use-hotkey.ts` | 新增 | 热键引擎 |
| `src/components/stk-plus-table/composables/use-editable.ts` | 新增 | 编辑状态与四种模式 |
| `src/components/stk-plus-table/composables/use-validation.ts` | 新增 | 校验 |
| `src/components/stk-plus-table/composables/use-dependencies.ts` | 新增 | 单元格联动 |
| `src/router`（或路由配置） | 修改 | 添加 `/stk-plus-table` 及 stage1～stage4 路由 |
| `views/stk-plus-table/*.vue` | 新增 | 各阶段 Demo 页面 |

---

## 六、风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| stk-table-vue 无滚动到指定行/列 API | 查文档；若无，通过主组件 ref 取滚动容器，自行计算 scrollTop/scrollLeft 并设置 |
| stk-table-vue 列 API 与 Plus 差异大 | column-map 做完整映射，隐藏 stk 专有字段；对外仅暴露 Plus 风格 columns |
| 虚拟列表下编辑格被回收导致失焦 | 仅当前 (editingRowIndex, editingColProp) 渲染编辑器；导航/确认时先确认再移动，避免多格同时编辑 |
| 多级表头 stk 不支持或 API 不同 | 阶段 0 先做扁平列；若 stk 支持嵌套列，在 0.13 中实现；列设置树状面板与 stk 列结构解耦，仅驱动 visibleColumns/order |

---

## 七、验收标准

1. **功能完整**：上述阶段任务清单全部完成。
2. **类型安全**：`vue-tsc` 零错误，类型导出完整。
3. **性能**：万级行依赖 stk-table-vue 虚拟滚动，滚动流畅；编辑/校验不造成全表重渲染。
4. **Demo**：`/stk-plus-table`、`/stk-plus-table/stage1`～`stage4` 可逐阶段验收。
5. **文档**：API、Props、Events、dependencies 有注释或文档。

---

## 八、可选后续

- 列设置多级表头（树状 + 仅顶层可拖拽）：参考 .plus-table 阶段 4 补充，列设置面板用 el-tree 展示层级。
- 选区与剪贴板：参考 .virtual-table 阶段 5，在 stk 的 areaSelection 基础上接 use-clipboard（Ctrl+C/V）。

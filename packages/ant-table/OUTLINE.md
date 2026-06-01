# AntTable 产品大纲

> 包：`@labs/ant-table` ｜ 底层：Ant Design Vue `a-table` ｜ 姊妹组件：[PlusTable](../plus-table/OUTLINE.md)
>
> 本文是**产品定位 + 技术架构**层面的纲要，不替代 API 参考。完整 API 见 `docs/components/ant-table/index.md`。

---

## 一句话定位

在 Ant Design Vue `a-table` 之上，沿用 antd 原生列式 API（`columns` 数组、`dataIndex`/`title`/`customRender`），补齐「类 Excel 编辑表格」所需的一整套交互能力（可编辑单元格、键盘导航、校验、行操作、撤销重做、列设置、单元格联动、脏数据追踪），让业务侧用**配置式列**即可获得接近电子表格的录入体验。

---

## 一、产品篇

### 1.1 背景与要解决的问题

`a-table` 是优秀的**展示型**表格，但中后台大量存在「批量录入 / 在线编辑」场景。原生能力下，每个项目都要重复手写：

- 单元格双击进编辑、Enter 下移、Tab 横移、Esc 取消等键盘交互；
- 表级 / 列级校验，并把错误定位回具体单元格；
- 撤销重做、脏数据高亮、行增删改、列显隐与列宽持久化；
- 字段间联动（A 改了 → B 的可选项 / 必填 / 禁用随之变化）。

这些逻辑零散、易错、难以复用。AntTable 把它们沉淀为一个组件，业务侧只配置 `columns` 即可，且**完全沿用 antd 列式 API 心智**。

### 1.2 目标用户

- **中后台业务前端**：做表单密集、批量录入类页面（财务、供应链、配置后台等）。
- **已用 Ant Design Vue 的团队**：希望沿用 antd `columns` 配置与样式体系，零迁移成本接入。

### 1.3 核心使用场景

1. **批量数据录入 / 编辑**：可编辑单元格 + 键盘导航 + 校验。
2. **可编辑的明细表**：行增删改 + 撤销重做 + 脏数据追踪（只回传被改动的行）。
3. **带联动的录入**：单元格 `dependencies`（动态选项、必填、禁用、联动赋值）。
4. **可定制视图的长列表**：列设置（显隐 / 排序 / 列宽，本地持久化）+ 服务端分页 + 自适应高度。

### 1.4 核心价值 / 差异化

- **antd 原生 API 风格**：列仍是 `columns` 数组（`dataIndex`/`title`/`customRender`/`children`），未识别的 antd 列属性（`sorter`/`filters` 等）原样透传，迁移成本低。
- **配置式驱动**：列的展示态、编辑器、校验、联动都在 `columns` 里声明，**展示态与编辑器都靠列配置**，无需逐列插槽。
- **类 Excel 键盘流**：方向键 / Tab / Enter / F2 / Home·End / Ctrl+Home·End 全覆盖，录入不离手。
- **能力成套且自洽**：编辑→脏标记→历史→联动→校验是一条编排好的流水线（见 §2.5），而非零件拼装。
- **对 `a-table` 友好透传**：未识别属性 / 事件 `v-bind="$attrs"` 直达（`row-selection`、`loading`、`sticky` 等）。
- **与 PlusTable 能力对齐**：同一套交互模型在 Ant Design Vue / Element Plus 两套 UI 库上保持一致，便于跨技术栈复用心智。

### 1.5 能力范围（已实现）

| 能力域 | 内容 |
| --- | --- |
| 列模型 | antd 配置式 `columns`（`dataIndex`/`title`）、多级表头 `children`、`customRender` 展示态、`resizable` 列宽拖拽 |
| 编辑模式 | `false` / `cell` / `row` / `manual` / `true(all)` 五种 |
| 编辑器 | 内置 `input`/`input-number`/`select`/`date-picker`/`time-picker`/`switch`/`checkbox`，或任意自定义组件 |
| 键盘导航 | 方向键、Tab/Shift+Tab、Enter/Esc、F2、Home/End、Ctrl+Home/End、可打印字符自动开编 |
| 自定义热键 | `hotkeys`（`override` 可覆盖内置） |
| 校验 | 表级 `rules` + 列级 `rules`/`required`（async-validator）、`change`/`blur`/`manual` 触发、错误单元格红框 + tooltip、`scrollToFirstError` |
| 行操作 | `insertRow` / `deleteRow` / `moveRow` / `duplicateRow` |
| 撤销重做 | Ctrl+Z / Ctrl+Shift+Z（默认上限 50 步），与脏标记同步 |
| 脏数据 | 基线快照对比，脏单元格 / 脏行高亮，`getModifiedRows` / `getDirtyCells` |
| 单元格联动 | `dependencies`：`disabled` / `required` / `rules` / `componentProps` / `trigger` |
| 列设置 | 显隐 / 排序 / 列宽，localStorage 持久化（`columnSettingKey`），顶部「列设置」按钮 + 右键表头唤起 |
| 分页 | 传 `total` 即启用，**服务端驱动**（父级按页提供 `dataSource`，组件不切片） |
| 自适应 | `adaptive` 按视口计算 `scroll.y`；有固定列时配合 `scrollX` |

### 1.6 非目标（Non-Goals）

- **不做数据层**：不负责请求、分页切片、排序 / 筛选算法；服务端分页时数据由父组件按页传入。
- **不重写 `a-table`**：渲染与布局仍由 `a-table` 承担，AntTable 只增强交互层。
- **不内置虚拟滚动**：超大数据量沿用 `a-table` 自身能力，不额外封装。
- **不做跨 UI 库抽象层**：与 PlusTable 是「能力对齐的两份实现」，刻意不抽公共内核，避免过度抽象（详见 §3）。
- **非通用电子表格**：不支持合并区域选区、公式、跨表引用等 Excel 高级特性。

### 1.7 与 PlusTable 的关系

二者**能力对齐、实现各自独立**，区别只在底层 UI 库与 API 风格：

| 维度 | AntTable | PlusTable |
| --- | --- | --- |
| 底层库 | Ant Design Vue `a-table` | Element Plus `el-table` |
| 列 API | antd `columns` 数组（`dataIndex`/`title`/`customRender`） | `el-table-column` 风格（`prop`/`label`） |
| 数据 v-model | `v-model:dataSource` | `v-model:data` |
| 分页字段 | `current` | `currentPage` |
| 渲染机制 | 列配置驱动（`customRender`/`component`），无逐列插槽 | 模板 + 插槽（`cell-${prop}`/`header-${prop}`/`editor-${prop}`） |
| 单元格样式 | 逐单元格组件（`AntTableCell`）内打类名 | 表级 `cell-class-name`/`row-class-name` 回调 |
| 行选择 | antd `row-selection` 透传 | `type: selection/index/expand` 特殊列 |

> 选型建议：项目已用 Ant Design Vue → AntTable；已用 Element Plus → PlusTable。

### 1.8 演进方向（候选，非承诺）

当前为实验性内部包（`version 0.0.0`、`private`、以**源码形式**被消费）。结合现状可考虑：

- **测试**：补充 composables 单测与交互回归（目前仓库无测试）。
- **持久化抽象**：列设置目前固定 localStorage，可开放自定义 storage 适配。
- **可访问性**：补充 ARIA grid 语义与屏幕阅读器支持。
- **产物化**：若要被外部以 npm 包消费，需补打包与版本策略。

---

## 二、架构篇

### 2.1 设计原则

1. **关注点分离**：每个交互能力一个 composable，主组件只做编排与 `provide`。
2. **单向数据流**：组件不持有数据副本，`props.dataSource` 经编辑后通过 `update:dataSource` 回传，父级是唯一数据源。
3. **不接管渲染**：把内部 `columns` 映射成 antd 列后交给 `a-table` 渲染，增强而非替换。
4. **上下文注入**：主组件 `provide` 一个 `AntTableContext`，子组件（Cell / ColumnSetting）`inject` 消费，避免逐层透传。

### 2.2 分层与目录结构

```
packages/ant-table/src/
├── components/        # 视图层
│   ├── ant-table.vue            # 主组件：编排 composables、columns→antd 列映射、provide、暴露 ref API
│   ├── ant-table-cell.vue       # 单元格组件：由 customRender 渲染，含展示态/编辑器/错误 tooltip/状态类名
│   ├── ant-table-column-setting.vue  # 列设置面板 + 右键菜单
│   └── ant-table-pagination.vue # 内置分页器
├── composables/       # 能力层（“引擎”，见 §2.4）
├── adapters/          # 内置编辑器映射（ANT_ADAPTER_MAP：标识 → 组件 + v-model 绑定）
├── types/             # props / column / context / hotkey 类型
├── utils/             # column-utils / focus-utils / hotkey-utils
├── constants/         # 注入 key 等常量
└── styles/index.scss  # 类名样式（atbl-cell--active/dirty/error 等）
```

> 与 PlusTable 不同，AntTable **没有独立的 `plus-table-column.vue` 式列组件**，列结构通过 `toAntColumn` 映射为 antd `columns`；也**没有 `use-class-names` / `use-dropdown-menu`**（样式在 Cell 组件内逐格处理）。

### 2.3 数据流

```
父组件 v-model:dataSource ─┐
                           ├─> props.dataSource ─> displayData(computed) ─> 各 composable 读取
列操作/编辑/行操作 ────────┘                                                │
                                                                           ▼
                                  emit('update:dataSource' | 'cell-value-change' | ...) ─> 父组件
```

- `displayData` 是只读视图；写操作都走 `emit`，父级更新后回流。
- 服务端分页时，`change` / `update:current` / `update:pageSize` 通知父级换页，父级替换 `dataSource`，组件**不切片**。

### 2.4 composables 职责表

| composable | 职责 |
| --- | --- |
| `use-navigation` | 激活单元格 / 行索引、方向键导航、`focusCell`、`isActiveCell`、单元格点击 |
| `use-editable` | 编辑状态机（5 种模式）、进入 / 确认 / 取消、编辑值读写 |
| `use-edit-actions` | **编排器**：确认编辑 → 脏标记 → 入历史 → 触发联动 → 按需校验 |
| `use-edit-history` | 撤销 / 重做栈（默认 50 步） |
| `use-validation` | 表级 + 列级规则聚合、按触发时机校验、错误定位、滚动到首个错误 |
| `use-dependencies` | 解析 `dependencies`（disabled/required/rules/componentProps）、字段变更触发 `trigger` |
| `use-dirty-tracking` | 基线快照、脏单元格 / 脏行判定、`getModifiedRows` |
| `use-row-options` | 行增 / 删 / 改 / 复制（基于 `emit('update:dataSource')`） |
| `use-column-options` | 列显隐 / 排序 / 列宽 + localStorage 持久化、可见列计算 |
| `use-hotkey` | 键盘事件分发：内置导航/编辑热键 + 用户自定义 `hotkeys` |
| `use-adaptive` | 视口自适应计算 `scroll.y` |
| `use-ant-table-context` | 子组件 `inject` 上下文的封装 |

### 2.5 编辑流水线（关键编排）

一次「确认编辑」由 `use-edit-actions.commitEdit` 串起多个 composable，保证顺序与一致性：

```
确认编辑(confirmEdit) ─> 写回值
   └─> markDirty(脏标记) ─> pushChange(入撤销栈)
       └─> onFieldChange(触发依赖方 trigger 联动)
           └─> validateOnCellExit ? validateFieldsAffectedByChange : 跳过
```

撤销 / 重做后脏标记自动与历史快照同步。

### 2.6 渲染机制

- 主组件用 `toAntColumn` 把每个 `AntTableColumn` 映射为 antd 列：
  - `customRender` → 渲染 `AntTableCell`（承载展示态 / 编辑器 / 错误 tooltip / 状态类名）；
  - `customCell` → 注入单元格 `click` / `dblclick` 事件（驱动导航与进编辑）；
  - `customHeaderCell` → 必填表头标记 + 右键唤起列设置；
  - `children` 递归映射，支持多级表头。
- **样式策略**：与 PlusTable 的表级类名回调不同，AntTable 在 `AntTableCell` 组件内部按上下文（`isActiveCell` / `isCellDirty` / `getErrorForCell` / 编辑态）直接绑定 `atbl-cell--active/dirty/error/editing` 类名，天然随单元格响应式刷新。

### 2.7 扩展点

| 扩展点 | 用途 |
| --- | --- |
| `ANT_ADAPTER_MAP` + 自定义组件 | 新增 / 替换编辑器（内置标识或直接传组件，默认按 `value` 双绑） |
| 列 `customRender` | 自定义展示态（antd 风格入参 `{ text, value, record, index, column }`） |
| `dependencies` | 字段联动逻辑 |
| `hotkeys`（`override`） | 自定义 / 覆盖键盘行为 |
| `$attrs` 透传 | 触达未封装的 `a-table` 原生能力（`row-selection`/`loading`/`sticky` 等） |
| `columnSettingKey` | 列设置持久化（当前为 localStorage） |

### 2.8 关键设计取舍

- **受控数据、不持有副本**：可与父级状态库（Pinia 等）无缝协作，但要求父级正确回写 `dataSource`。
- **服务端分页不切片**：组件只发 `change` 等事件，数据切分交给数据源。
- **可编辑列的 `dataIndex` 必须为 string**：作为编辑 / 校验 / 脏标记的稳定标识。
- **列设置持久化 key 必须唯一**：多实例共用默认 key 会互相覆盖，故 `columnSettingKey` 需各自设置。
- **固定列需配合 `scrollX`**：`adaptive` 自动算 `scroll.y`，但有 `fixed` 列时横向滚动需显式 `scrollX`。

---

## 三、公共 API 速览

```ts
import {
  AntTable, ANT_TABLE_INJECTION_KEY, ANT_ADAPTER_MAP, useAntTableContext,
} from '@labs/ant-table';
import type {
  AntTableColumn, AntTableProps, RowData, CellContext, CellRenderParams, ColumnAlign,
  DependencyApi, DependencyState, ColumnDependencies,
  HotkeyBinding, HotkeyContext, AdaptiveConfig, PaginationPayload, EditorAdapter,
} from '@labs/ant-table';
```

完整 Props / 事件 / 插槽 / `ref` 方法见 `docs/components/ant-table/index.md`。

## 四、约束与已知边界

- 依赖 peer：`ant-design-vue ^4.0.0`、`vue ^3.4.0`；以**源码**形式被工作区消费（无独立构建产物）。
- 行操作下标均为**当前 `dataSource` 数组下标**（服务端分页时即「当前页下标」）。
- 校验 / 脏标记以列 `dataIndex`（string）为标识，可编辑列必须提供。
- 列设置持久化目前仅 localStorage，SSR / 隐私模式需自行处理降级。

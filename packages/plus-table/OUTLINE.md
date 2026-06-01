# PlusTable 产品大纲

> 包：`@labs/plus-table` ｜ 底层：Element Plus `el-table` ｜ 姊妹组件：[AntTable](../ant-table/OUTLINE.md)
>
> 本文是**产品定位 + 技术架构**层面的纲要，不替代 API 参考。完整 API 见 `docs/components/plus-table/index.md`。

---

## 一句话定位

在 Element Plus `el-table` 之上，补齐「类 Excel 编辑表格」所需的一整套交互能力（可编辑单元格、键盘导航、校验、行操作、撤销重做、列设置、单元格联动、脏数据追踪），让业务侧用**配置式列**即可获得接近电子表格的录入体验。

---

## 一、产品篇

### 1.1 背景与要解决的问题

`el-table` 是优秀的**展示型**表格，但中后台大量存在「批量录入 / 在线编辑」场景。原生能力下，每个项目都要重复手写：

- 单元格双击进编辑、Enter 下移、Tab 横移、Esc 取消等键盘交互；
- 表级 / 列级校验，并把错误定位回具体单元格；
- 撤销重做、脏数据高亮、行增删改、列显隐与列宽持久化；
- 字段间联动（A 改了 → B 的可选项 / 必填 / 禁用随之变化）。

这些逻辑零散、易错、难以复用。PlusTable 把它们沉淀为一个组件，业务侧只配置 `columns` 即可。

### 1.2 目标用户

- **中后台业务前端**：做表单密集、批量录入类页面（财务、供应链、配置后台等）。
- **已用 Element Plus 的团队**：希望沿用 `el-table` 的 API 心智与样式体系，零迁移成本接入。

### 1.3 核心使用场景

1. **批量数据录入 / 编辑**：可编辑单元格 + 键盘导航 + 校验。
2. **可编辑的明细表**：行增删改 + 撤销重做 + 脏数据追踪（只回传被改动的行）。
3. **带联动的录入**：单元格 `dependencies`（动态选项、必填、禁用、联动赋值）。
4. **可定制视图的长列表**：列设置（显隐 / 排序 / 列宽，本地持久化）+ 服务端分页 + 自适应高度。

### 1.4 核心价值 / 差异化

- **配置式驱动**：列的展示态、编辑器、校验、联动都在 `columns` 里声明，减少模板样板。
- **类 Excel 键盘流**：方向键 / Tab / Enter / F2 / Home·End / Ctrl+Home·End 全覆盖，录入不离手。
- **能力成套且自洽**：编辑→脏标记→历史→联动→校验是一条编排好的流水线（见 §2.5），而非零件拼装。
- **对 `el-table` 友好透传**：未识别属性 / 事件 `v-bind="$attrs"` 直达，`ref` 暴露 `getElTable` 及常用方法，不阻断原生能力。
- **与 AntTable 能力对齐**：同一套交互模型在 Element Plus / Ant Design Vue 两套 UI 库上保持一致，便于跨技术栈复用心智。

### 1.5 能力范围（已实现）

| 能力域 | 内容 |
| --- | --- |
| 列模型 | 配置式 `columns`（`prop`/`label`）、多级表头 `children`、特殊列 `selection`/`index`/`expand`、`formatter`/`render`/`renderHeader` |
| 编辑模式 | `false` / `cell` / `row` / `manual` / `true(all)` 五种 |
| 编辑器 | 内置 `input`/`input-number`/`select`/`date-picker`/`switch`/`time-picker`/`time-select`，或任意自定义组件，`editor-${prop}` 插槽 |
| 键盘导航 | 方向键、Tab/Shift+Tab、Enter/Esc、F2、Home/End、Ctrl+Home/End、可打印字符自动开编 |
| 自定义热键 | `hotkeys`（`override` 可覆盖内置） |
| 校验 | 表级 `rules` + 列级 `rules`/`required`（async-validator）、`change`/`blur`/`manual` 触发、错误单元格红框 + tooltip、`scrollToFirstError` |
| 行操作 | `insertRow` / `deleteRow` / `moveRow` / `duplicateRow` |
| 撤销重做 | Ctrl+Z / Ctrl+Shift+Z（默认上限 50 步），与脏标记同步 |
| 脏数据 | 基线快照对比，脏单元格 / 脏行高亮，`getModifiedRows` / `getDirtyCells` |
| 单元格联动 | `dependencies`：`disabled` / `required` / `rules` / `componentProps` / `trigger` |
| 列设置 | 显隐 / 排序 / 列宽，localStorage 持久化（`columnSettingKey`），右键表头唤起 |
| 分页 | 传 `total` 即启用，**服务端驱动**（父级按页提供 `data`，组件不切片） |
| 自适应 | `adaptive` 按视口计算 `maxHeight` |

### 1.6 非目标（Non-Goals）

- **不做数据层**：不负责请求、分页切片、排序 / 筛选算法；服务端分页时数据由父组件按页传入。
- **不重写 `el-table`**：渲染与布局仍由 `el-table` 承担，PlusTable 只增强交互层。
- **不内置虚拟滚动**：超大数据量的虚拟化沿用 `el-table` 自身能力，不额外封装。
- **不做跨 UI 库抽象层**：与 AntTable 是「能力对齐的两份实现」，刻意不抽公共内核，避免过度抽象（详见 §3）。
- **非通用电子表格**：不支持合并区域选区、公式、跨表引用等 Excel 高级特性。

### 1.7 与 AntTable 的关系

二者**能力对齐、实现各自独立**，区别只在底层 UI 库与 API 风格：

| 维度 | PlusTable | AntTable |
| --- | --- | --- |
| 底层库 | Element Plus `el-table` | Ant Design Vue `a-table` |
| 列 API | `el-table-column` 风格（`prop`/`label`） | antd `columns` 数组（`dataIndex`/`title`/`customRender`） |
| 数据 v-model | `v-model:data` | `v-model:dataSource` |
| 分页字段 | `currentPage` | `current` |
| 渲染机制 | 模板 + 插槽（`cell-${prop}`/`header-${prop}`/`editor-${prop}`） | 列配置驱动（`customRender`/`component`），无逐列插槽 |
| 单元格样式 | 表级 `cell-class-name`/`row-class-name` 回调 | 逐单元格组件内打类名 |
| 特殊列 | `type: selection/index/expand` | antd `row-selection` 等透传 |

> 选型建议：项目已用 Element Plus → PlusTable；已用 Ant Design Vue → AntTable。

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
2. **单向数据流**：组件不持有数据副本，`props.data` 经编辑后通过 `update:data` 回传，父级是唯一数据源。
3. **不接管渲染**：尽量复用 `el-table` 的列 / 插槽 / 事件，增强而非替换。
4. **上下文注入**：主组件 `provide` 一个 `PlusTableContext`，子组件（Cell / ColumnSetting）`inject` 消费，避免逐层透传。

### 2.2 分层与目录结构

```
packages/plus-table/src/
├── components/        # 视图层
│   ├── plus-table.vue            # 主组件：编排 composables、provide、暴露 ref API
│   ├── plus-table-column.vue     # 递归渲染列（含多级表头 children）
│   ├── plus-table-cell.vue       # 单元格：展示态 / 编辑器 / 错误 tooltip
│   ├── plus-table-column-setting.vue  # 列设置面板 + 右键菜单
│   └── plus-table-pagination.vue # 内置分页器
├── composables/       # 能力层（“引擎”，见 §2.4）
├── adapters/          # 内置编辑器映射（标识 → 组件 + v-model 绑定）
├── types/             # props / column / context / hotkey 类型
├── utils/             # column-utils / focus-utils / hotkey-utils
├── constants/         # 注入 key、特殊列常量（selection/index/expand）
└── styles/index.scss  # 类名样式（active/dirty/error 等）
```

### 2.3 数据流

```
父组件 v-model:data ─┐
                     ├─> props.data ─> displayData(computed) ─> 各 composable 读取
列操作/编辑/行操作 ──┘                                            │
                                                                 ▼
                                       emit('update:data' | 'cell-value-change' | ...) ─> 父组件
```

- `displayData` 是只读视图；写操作都走 `emit`，父级更新后回流。
- 服务端分页时，`pagination` / `update:currentPage` / `update:pageSize` 通知父级换页，父级替换 `data`，组件**不切片**。

### 2.4 composables 职责表

| composable | 职责 |
| --- | --- |
| `use-navigation` | 激活单元格 / 行索引、方向键导航、`focusCell`、单元格点击 |
| `use-editable` | 编辑状态机（5 种模式）、进入 / 确认 / 取消、编辑值读写 |
| `use-edit-actions` | **编排器**：确认编辑 → 脏标记 → 入历史 → 触发联动 → 按需校验 |
| `use-edit-history` | 撤销 / 重做栈（默认 50 步） |
| `use-validation` | 表级 + 列级规则聚合、按触发时机校验、错误定位、滚动到首个错误 |
| `use-dependencies` | 解析 `dependencies`（disabled/required/rules/componentProps）、字段变更触发 `trigger` |
| `use-dirty-tracking` | 基线快照、脏单元格 / 脏行判定、`getModifiedRows` |
| `use-row-options` | 行增 / 删 / 改 / 复制（基于 `emit('update:data')`） |
| `use-column-options` | 列显隐 / 排序 / 列宽 + localStorage 持久化、可见列计算 |
| `use-class-names` | 生成 `el-table` 的 `cell-class-name`/`row-class-name` 绑定（含强制重算依赖） |
| `use-hotkey` | 键盘事件分发：内置导航/编辑热键 + 用户自定义 `hotkeys` |
| `use-adaptive` | 视口自适应计算 `maxHeight` |
| `use-dropdown-menu` | 列设置右键菜单的定位 / 开关 |
| `use-plus-table-context` | 子组件 `inject` 上下文的封装 |

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

- 主组件遍历 `visibleColumns`：特殊列（`selection`/`index`/`expand`）直接渲染 `el-table-column`；普通列交给 `plus-table-column.vue` 递归渲染（支持多级表头）。
- 展示态：`render` / `formatter` / `cell-${prop}` 插槽；编辑态：`plus-table-cell.vue` 根据 `component` 解析编辑器或 `editor-${prop}` 插槽。
- **样式策略**：由于 `el-table` 仅在 prop 引用变化时重算类名，`use-class-names` 用一个 `classNameDeps` computed 显式依赖「激活索引 + 脏数据 Map」，强制激活 / 脏 / 错误类名及时刷新。

### 2.7 扩展点

| 扩展点 | 用途 |
| --- | --- |
| `adapters` + 自定义组件 | 新增 / 替换编辑器（内置标识或直接传组件） |
| `dependencies` | 字段联动逻辑 |
| `hotkeys`（`override`） | 自定义 / 覆盖键盘行为 |
| 插槽 `cell-/header-/editor-${prop}` | 局部接管展示 / 表头 / 编辑器 |
| `$attrs` 透传 + `getElTable()` | 触达未封装的 `el-table` 原生能力 |
| `columnSettingKey` + `storage` | 列设置持久化（当前为 localStorage） |

### 2.8 关键设计取舍

- **受控数据、不持有副本**：可与父级状态库（Pinia 等）无缝协作，但要求父级正确回写 `data`。
- **服务端分页不切片**：组件只发分页事件，数据切分交给数据源，避免「客户端有全量数据」的错误假设。
- **列设置持久化 key 必须唯一**：多实例共用默认 key 会互相覆盖，故 `columnSettingKey` 需各自设置。
- **脏数据基于基线快照**：以 `data` 首次非空值的深拷贝为基线，`resetTracking` 可重设基线。

---

## 三、公共 API 速览

```ts
import { PlusTable, PLUS_TABLE_INJECTION_KEY, usePlusTableContext } from '@labs/plus-table';
import type {
  PlusTableColumn, PlusTableProps, RowData, CellContext,
  DependencyApi, DependencyState, ColumnDependencies,
  HotkeyBinding, HotkeyContext, AdaptiveConfig, PaginationPayload,
} from '@labs/plus-table';
```

完整 Props / 事件 / 插槽 / `ref` 方法见 `docs/components/plus-table/index.md`。

## 四、约束与已知边界

- 依赖 peer：`element-plus ^2.0.0`、`vue ^3.4.0`；以**源码**形式被工作区消费（无独立构建产物）。
- 行操作下标均为**当前 `data` 数组下标**（服务端分页时即「当前页下标」）。
- 校验依赖列有稳定 `prop`；可编辑 / 校验 / 脏标记均以 `prop` 为标识。
- 列设置持久化目前仅 localStorage，SSR / 隐私模式需自行处理降级。

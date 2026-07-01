# PlusTable 产品大纲

> 包：`@labs/plus-table` ｜ 底层：Element Plus `el-table`
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
- 列级校验，并把错误定位回具体单元格；
- 撤销重做、脏数据高亮、行增删改、列显隐与列宽持久化；
- 字段间联动（A 改了 → B 的可选项 / 必填 / 禁用随之变化）。

这些逻辑零散、易错、难以复用。PlusTable 把它们沉淀为一个组件，业务侧只配置 `columns` 即可。

### 1.2 目标用户

- **中后台业务前端**：做表单密集、批量录入类页面（财务、供应链、配置后台等）。
- **已用 Element Plus 的团队**：希望沿用 `el-table` 的 API 心智与样式体系，零迁移成本接入。

### 1.3 核心使用场景

1. **批量数据录入 / 编辑**：可编辑单元格 + 键盘导航（含自定义热键） + 校验。
2. **可编辑的明细表**：行增删改 + 撤销重做 + 脏数据追踪（只回传被改动的行）。
3. **带联动的录入**：单元格 `dependencies`（动态选项、必填、禁用、联动赋值）。
4. **可定制视图的长列表**：列设置（显隐 / 排序 / 列宽，本地持久化）+ 服务端分页 + 自适应高度（视口或容器两种模式）。

### 1.4 核心价值 / 差异化

- **配置式驱动**：列的展示态、编辑器、校验、联动都在 `columns` 里声明，减少模板样板。
- **类 Excel 键盘流**：方向键 / Tab / Enter / F2 / Home·End / Ctrl+Home·End 全覆盖；撤销重做（Ctrl+Z / Ctrl+Shift+Z）与自定义 `hotkeys` 接入同一条按键分发链路。
- **能力成套且自洽**：写值 → 历史 → 脏标记 → 联动 → 校验是一条编排好的流水线（见 §2.5），而非零件拼装。
- **对 `el-table` 友好透传**：未识别属性 / 事件 `v-bind="$attrs"` 直达，`ref` 暴露 `getElTable` 及常用方法，不阻断原生能力。
- **状态管理健壮**：历史 / 脏追踪 / 校验错误按 `rowKey` 寻址，行结构变化（增删移/换页）不会串位；`rowKey` 重复/缺失开发环境有告警；行被删除后，残留状态会被清理，长会话（SPA 不卸载表格）不会无限增长。

### 1.5 能力范围（已实现）

| 能力域 | 内容 |
| --- | --- |
| 列模型 | 配置式 `columns`（继承 el-table-column 原生 `prop`/`label`/`type` 等），多级表头 `children`，`formatter`/`render`；`header-${prop}` / `cell-${prop}` / `editor-${prop}` 插槽局部接管；特殊列 `type: 'index'\|'selection'\|'expand'` 原生直通（不进列设置、不参与键盘导航与拖拽排序） |
| 编辑模式 | `none` / `cell` / `row` / `table` 四种；文本类编辑器统一「草稿缓冲、失焦提交」，离散类（select/switch/date 等）变更即提交 |
| 编辑器 | 内置 `input`/`textarea`/`input-number`/`select`（`ElSelectV2`）/`date-picker`/`time-picker`/`switch`/`checkbox`，或任意自定义组件，`editor-${prop}` 插槽 |
| 键盘导航 | 方向键、Tab/Shift+Tab、Enter/Esc、F2、Home/End、Ctrl+Home/End、可打印字符自动进编；Tab/Esc 任何编辑模式下都由网格统一拦截；row/table 模式下方向键移动会同步真实 DOM 焦点到目标格输入框 |
| 自定义热键 | `hotkeys`（`override` 可先于内置行为判定，`when` 附加判定条件） |
| 校验 | 列级 `required`/`rules`（async-validator）+ 字段联动 `dependencies.rules`；`change`/`blur`/`manual` 触发；遍历**全部列**（不因「列设置」隐藏而漏检）；错误格红框 + tooltip；`scrollToFirstError`；`getErrors()`；同格连续异步校验按版本号丢弃过期结果 |
| 行操作 | `insertRow` / `removeRow` / `moveRow` / `duplicateRow` |
| 撤销重做 | `history` 开启；Ctrl+Z / Ctrl+Shift+Z（或 Ctrl+Y），默认上限 50（`historyLimit`）；按 `rowKey` 寻址，对行结构变化免疫 |
| 脏数据追踪 | `dirtyTracking` 开启；基线快照对比（按 `rowKey` 存），`getModifiedRows` / `getDirtyCells` / `isCellDirty` / `isRowDirty` / `resetTracking` / `clearDirty` |
| 单元格联动 | `dependencies`：`disabled` / `required` / `rules` / `componentProps` / `trigger`，防循环 |
| 列设置 | 工具栏按钮点开面板：显隐（组节点联动子列 / 半选态）、拖拽排序（仅限同级）、列宽拖拽记录；传 `settingsKey` 后持久化到 localStorage |
| 分页 | 传 `total` 即启用，**服务端驱动**（父级按页提供 `data`，组件不切片） |
| 自适应高度 | `adaptive`：`'viewport'`（按视口计算，默认）/ `'container'`（CSS flex 填满父容器，适合卡片/弹窗等自身高度受限场景） |
| 健壮性 | `rowKey` 重复/缺失开发环境 `console.warn`；异步校验竞态按版本号处理；行被移除后清理 history/dirty/validation 残留状态 |

### 1.6 非目标（Non-Goals）

- **不做数据层**：不负责请求、分页切片、排序 / 筛选算法；服务端分页时数据由父组件按页传入。
- **不重写 `el-table`**：渲染与布局仍由 `el-table` 承担，PlusTable 只增强交互层。
- **不内置虚拟滚动**：超大数据量的虚拟化沿用 `el-table` 自身能力，不额外封装；`table` 编辑模式下大数据量的编辑器渲染也不做虚拟化。
- **非通用电子表格**：不支持合并区域选区、公式、跨表引用等 Excel 高级特性；键盘导航也不含多格范围选择 + 剪贴板复制粘贴（Ctrl+C/V 跨格）。
- **不做联动的隐式清空**：字段联动导致下拉选项变化时，不会自动清空已失效的当前值——需要业务侧在 `dependencies.trigger` 里用 `api.setValue` 显式处理，避免静默丢数据。
- **列设置不含「固定列」开关**、**持久化不支持可插拔 storage**：当前仅 localStorage，见 §1.7。

### 1.7 演进方向（候选，非承诺）

当前为实验性内部包（`version 0.0.0`、`private`、以**源码形式**被消费）。结合现状可考虑：

- **测试**：补充 engine 单测与交互回归（目前仓库无测试框架）。
- **持久化抽象**：列设置目前固定 localStorage，可开放自定义 storage 适配（session / 自定义后端）。
- **可访问性**：补充 ARIA grid 语义与屏幕阅读器支持。
- **产物化**：若要被外部以 npm 包消费，需补打包与版本策略。
- **多格范围选择 + 复制粘贴**：涉及范围选区模型和 TSV 解析，超出当前「键盘导航」范围，暂不做。

---

## 二、架构篇

### 2.1 设计原则

1. **关注点分离**：每个交互能力是 `engine/` 下一个工厂函数（`createXxx(options)`），返回一组响应式状态 + 方法；`createTableEngine` 统一组装依赖关系并编排。
2. **单向数据流**：组件不持有数据副本；结构性变更（增删移复制）经 `emit('update:data')` 回传，取值变更直接写行对象引用（见 §2.3），父级是唯一数据源。
3. **不接管渲染**：尽量复用 `el-table` 的列 / 插槽 / 事件；`table-column.ts` / `table-cell.ts` 是渲染函数（非 `.vue` 单文件组件），递归渲染多级表头与单元格。
4. **上下文注入**：主组件 `provide` 一份 `TableEngine`（key 为 `PLUS_TABLE_INJECTION_KEY`），子组件（`column-settings.vue`、`table-cell.ts`、`table-column.ts`）`inject` 消费，避免逐层透传。
5. **状态寻址稳定**：跨结构变化保持一致的状态（history / dirty / validation 的错误集合）按 `rowKey` 寻址，不用数组下标（下标会因增删移/换页错位）。

### 2.2 分层与目录结构

```
packages/plus-table/src/
├── components/
│   ├── plus-table.vue          # 主组件：编排 engine、provide、defineExpose
│   ├── column-settings.vue     # 列设置弹出面板（显隐 + 拖拽排序 + 重置）
│   ├── table-column.ts         # 递归渲染列（渲染函数，含多级表头 children）
│   └── table-cell.ts           # 单元格：展示态 / 编辑器 / 错误 tooltip（渲染函数）
├── editors/
│   └── registry.ts             # 内置编辑器标识 → 组件 + v-model 映射，editor 配置解析
├── engine/                     # 能力层（"引擎"，见 §2.4）
│   ├── index.ts                # createTableEngine：编排入口 + writeCell 写值管线
│   ├── columns.ts              # 列归一化、显隐/排序/列宽 + 持久化
│   ├── selection.ts            # 活动格、方向键导航、focusActiveCellEditor
│   ├── editing.ts              # 编辑状态机（cell/row/table）、live draft 缓冲
│   ├── keyboard.ts             # 键盘事件分发（内置导航 + 自定义 hotkeys）
│   ├── validation.ts           # 校验聚合、异步竞态版本号、getErrors
│   ├── dependencies.ts         # 字段联动 dependencies 解析与触发
│   ├── history.ts              # 撤销重做（rowKey 寻址）
│   ├── dirty.ts                # 脏行/脏格追踪（rowKey 寻址）
│   ├── rows.ts                 # 行增/删/移/复制
│   └── adaptive.ts             # 自适应高度（viewport / container）
├── constants.ts                # provide/inject key、localStorage key 前缀
├── env.d.ts                    # *.vue / *.scss 模块声明
├── types.ts                    # 全部公开类型（props / column / hotkey / adaptive 等）
└── styles/index.scss           # 类名样式（active/editing/error/required/dirty 等）
```

没有独立的 `adapters/` / `utils/` / `types/`（复数、分文件夹）目录——编辑器映射并入 `editors/`，类型集中在单一 `types.ts`。

### 2.3 数据流

```
父组件 v-model:data ──> props.data ──> engine 各工厂函数按需通过 data() 读取

结构变更（增删移复制）──> emit('update:data', 新数组) ──> 父组件替换 data
取值变更（编辑提交/联动 setValue/撤销重做/Delete 清空）
   └─> writeCell(row, rowIndex, prop, value)
         ├─ history.pushChange（history 开启时）
         ├─ dirty.markDirty（dirtyTracking 开启时）
         ├─ emit('cell-change')
         ├─ dependencies.notifyFieldChange（防循环守卫）
         └─ validateOn === 'change' ? validateCellByField（遍历全部列） : 跳过
```

- `writeCell` 直接对父级 `data` 数组里的行对象赋值（`row[prop] = value`），不整体替换 `data` 数组，因此父级需要把 `data` 作为响应式引用（`ref`/`reactive`）传入，而不是每次 diff 出全新数组。
- 服务端分页时，`page-change` 通知父级换页，父级替换 `data`，组件**不切片**。

### 2.4 engine 模块职责表

| 模块 | 职责 |
| --- | --- |
| `index.ts`（`createTableEngine`） | 编排入口：组装各模块依赖、`writeCell` 写值管线、按 `column.columnKey` 而非 DOM `cellIndex` 解析点击的行列坐标（特殊列天然查不到，等同跳过）、开发环境 `rowKey` 重复/缺失检测、行结构变化后清理 history/dirty/validation 残留 |
| `columns.ts` | 列归一化（`columns` → `ColumnNode` 树）、显隐/拖拽排序/列宽 + localStorage 持久化（`try/catch` 兜底 SSR/隐私模式）、可见列 `leafNodes` 与全部列 `allLeafNodes` 两套叶子节点（均排除 `type` 特殊列）；特殊列排序时锚定在原始下标 |
| `selection.ts` | 活动格状态、方向键/Tab/Home/End 移动、`focusActiveCellEditor`（row/table 模式同步真实 DOM 焦点）、`getCellEl` |
| `editing.ts` | 编辑状态机（cell/row/table 三种模式）；cell 模式单槽 draft；row/table 模式按 `` `${rowKey}:${prop}` `` 的 live draft 缓冲（文本类失焦提交）；行编辑快照与 `cancelRowEdit` 回滚 |
| `keyboard.ts` | 键盘事件分发：自定义 `hotkeys`（override）→ cell 编辑态按键流 → 全局 Tab/Esc → 内置导航与撤销重做 → 自定义 `hotkeys`（非 override） |
| `validation.ts` | 规则聚合（列 `rules`/`required` + `dependencies.rules`，遍历全部列）、按 `rowKey → prop → 版本号` 丢弃过期异步结果、`getErrors()`、错误定位与滚动 |
| `dependencies.ts` | 解析 `dependencies`（disabled/required/rules/componentProps），字段变更触发 `trigger` |
| `history.ts` | 撤销/重做栈（按 `rowKey` 寻址，默认上限 50，行已删除时对应条目安全跳过） |
| `dirty.ts` | 基线快照（按 `rowKey` 存，`shallowRef` + `triggerRef` 手动触发）、脏格/脏行判定、`getModifiedRows`/`getDirtyCells` |
| `rows.ts` | 行增/删/移/复制（基于 `emit('update:data')`），越界下标安全返回 `undefined`/`false` 而非抛错 |
| `adaptive.ts` | 自适应高度：`viewport`（`@vueuse/core` 量视口/网格/分页器尺寸计算）/ `container`（`height: 100%` 交给 CSS flex 父级撑满） |
| `editors/registry.ts` | 内置编辑器标识 → 组件 + v-model 映射、`editor` 配置解析、`typedCharToDraft`（cell 模式「选中即输入」） |

### 2.5 写值管线（关键编排）

一次单元格取值变更由 `engine/index.ts` 的 `writeCell` 串起多个模块，保证顺序与一致性：

```
writeCell(row, rowIndex, prop, value)
  值未变化（Object.is）？
    是 ─> 不做任何事
    否 ─> row[prop] = value
           ├─ history.pushChange（history 开启时，新增）
           ├─ dirty.markDirty（dirtyTracking 开启时，新增）
           ├─ emit('cell-change')
           ├─ dependencies.notifyFieldChange（防循环守卫）
           └─ validateOn === 'change' ? validateCellByField（全部列）: 跳过
```

撤销 / 重做走独立的 `applyHistoryChanges`：只回滚 `row[prop]` 并重新对比脏基线、`emit('cell-change')`、按需重新校验，**不**重新触发 `dependencies.trigger`（避免联动副作用在历史回放时被重复执行）。

### 2.6 渲染机制

- 主组件按 `columns.displayTree` 渲染 `TableColumnNode`（`table-column.ts`，递归处理多级表头与叶子列）；叶子列的展示态 / 编辑态交给 `table-cell.ts` 渲染函数；特殊列（`type: 'index'\|'selection'\|'expand'`）不挂载 `table-cell.ts`，交给 `el-table` 原生渲染。
- 展示态：`render` / `formatter` / `cell-${prop}` 插槽；编辑态：`component` 解析出的内置或自定义组件，或 `editor-${prop}` 插槽（优先于 `component` 配置）。
- 单元格状态类名（`active`/`editing`/`error`/`required`/`dirty` 等）直接读 `engine` 内部响应式状态计算得出，不依赖 `el-table` 自身 `cell-class-name` 的重算时机。

### 2.7 扩展点

| 扩展点 | 用途 |
| --- | --- |
| `component` 内置标识 / 自定义组件 | 新增 / 替换编辑器 |
| `dependencies` | 字段联动逻辑 |
| `hotkeys`（`override` / `when`） | 自定义 / 覆盖键盘行为 |
| 插槽 `cell-/header-/editor-${prop}` | 局部接管展示 / 表头 / 编辑器 |
| `$attrs` 透传 + `getElTable()` | 触达未封装的 `el-table` 原生能力 |
| `settingsKey` | 列设置持久化（当前固定 localStorage） |

### 2.8 关键设计取舍

- **受控数据、不持有副本**：可与父级状态库（Pinia 等）无缝协作，但要求父级正确回写 `data`。
- **服务端分页不切片**：组件只发分页事件，数据切分交给数据源，避免「客户端有全量数据」的错误假设。
- **列设置持久化 key 必须唯一**：多实例共用默认行为会互相覆盖，故 `settingsKey` 需各自设置；不传则不持久化。
- **历史 / 脏追踪 / 校验按 `rowKey` 寻址，不按数组下标**：这是相对早期实现刻意修正的一点——`insertRow`/`removeRow`/`moveRow` 或换页都会让下标错位，`rowKey` 寻址天然免疫；行被移除后，对应残留状态会在 `engine/index.ts` 的 `watch(data)` 差集清理中被移除，避免长会话（SPA 不卸载表格）内存无限增长。
- **消费者回调直接调用，不做错误隔离**：`formatter`/`render`/`dependencies.*`/`hotkeys[].handler|when`/函数式 `rowKey` 均直接调用，不额外包一层 `try/catch`——这类回调都是业务侧自己代码，出错应尽早在开发期暴露而不是被静默吞掉；若抛错会随正常的 Vue 渲染异常向上传播。
- **脏数据基于基线快照**：以 `data` 首次出现时的深拷贝为基线（按 `rowKey` 存），`resetTracking()` 可重设基线。

---

## 三、公共 API 速览

```ts
import { PlusTable, PLUS_TABLE_INJECTION_KEY, EDITOR_REGISTRY, createTableEngine } from '@labs/plus-table';
import type {
  PlusTableColumn, PlusTableProps, RowData, EditMode, ValidateOn,
  ColumnDependencies, DependencyApi,
  HotkeyBinding, HotkeyContext, AdaptiveConfig,
  HistoryApi, DirtyApi,
} from '@labs/plus-table';
```

完整 Props / 事件 / 插槽 / `ref` 方法见 `docs/components/plus-table/index.md`。

## 四、约束与已知边界

- 依赖 peer：`element-plus ^2.0.0`、`vue ^3.4.0`；另依赖 `@vueuse/core`（自适应高度）、`async-validator`（校验）、`es-toolkit`（深拷贝/深比较）；以**源码**形式被工作区消费（无独立构建产物）。
- 行操作（`insertRow`/`removeRow`/`moveRow`/`duplicateRow`）下标均为**当前 `data` 数组下标**（服务端分页时即「当前页下标」）。
- 可编辑 / 校验 / 联动均以 `prop` 为标识；历史 / 脏追踪 / 校验错误定位以 `rowKey` 为标识——两者是不同维度。`rowKey` 必须唯一且稳定，开发环境下检测到重复或空值会 `console.warn`（不抛错，最坏情况下编辑态/校验/脏标记可能串到别的行）。
- 列设置持久化目前仅 localStorage，SSR / 隐私模式下读写失败会被静默捕获（不持久化，不报错）。
- 仓库无测试框架（无 vitest/jest 配置），验证方式为 `pnpm typecheck`（`vue-tsc`）+ `docs` 交互示例走查。

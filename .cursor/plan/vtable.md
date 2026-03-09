# VTable — 基于 VisActor VTable 的高性能表格组件

> **技术选型**：基于 [@visactor/vtable](https://visactor.io/vtable) + [@visactor/vue-vtable](https://visactor.io/vtable/guide/Developer_Ecology/vue) Canvas 渲染引擎。  
> **定位**：百万级数据、配置式驱动、与 PlusTable 能力对标的大数据表格方案。

---

## 〇、进度里程碑

| 阶段 | 名称 | 状态 | 完成度 | Demo |
|------|------|------|--------|------|
| 0 | 依赖引入 + 基础 ListTable 渲染 | ✅ 已完成 | 8/8 | `/vtable` |
| 1 | 配置适配层 + 类 PlusTable API | ✅ 已完成 | 10/10 | `/vtable/stage1` |
| 2 | 分页 + 排序 + 固定列 | ✅ 已完成 | 8/8 | `/vtable/stage2` |
| 3 | 单元格编辑 + 自定义渲染 | ⏳ 未开始 | 0/9 | `/vtable/stage3` |
| 4 | 主题 + 导出 + 事件透传 | ⏳ 未开始 | 0/7 | `/vtable/stage4` |

**当前进度：** 阶段 2 已完成

**整体完成度：** 26/42 任务（约 62%）

---

## 一、资源参考与设计约束

### 1.1 VTable 特性（来自 visactor.io）

| 特性 | 说明 |
|------|------|
| **渲染** | Canvas 渲染，百万级数据流畅 |
| **表格类型** | ListTable（列表表）、PivotTable（透视表）、PivotChart（透视图） |
| **Vue 集成** | `@visactor/vue-vtable`：ListTable、ListColumn、option/records 两种用法 |
| **数据格式** | `records: any[][]`（二维数组）或对象数组 + `header.field` 映射 |
| **事件** | onClickCell、onDblClickCell、onKeyDown、onResizeColumn、onSortClick 等 |
| **编辑** | editCell 配置、自定义 editor、fill handle |
| **导出** | table export、export-image |

### 1.2 与 .plus-table.md / PlusTable 的关系

| 维度 | PlusTable (el-table) | VTable 规划 |
|------|----------------------|-------------|
| **基座** | el-table，DOM 渲染 | VTable，Canvas 渲染 |
| **数据规模** | 千级以内，分页 | 百万级，虚拟滚动内置 |
| **列配置** | PlusTableColumn，prop/label/render | header[{field, caption}]，customLayout |
| **API 策略** | 提供 PlusTable 风格适配层，便于迁移与复用 |

### 1.3 设计约束

| 约束项 | 说明 |
|--------|------|
| **依赖** | 使用 `@visactor/vue-vtable`，不直接裸用 `@visactor/vtable` |
| **兼容** | 提供 `columns` + `data` 类 PlusTable API，内部转换为 VTable option/records |
| **分页器** | 不自带分页 UI，通过 `#pagination` 插槽由调用方按 UI 库（el-pagination、a-pagination 等）选型 |
| **场景** | 大数据列表（10 万+ 行）、透视分析、导出为图像/Excel |

---

## 二、技术方案

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────────┐
│  VTablePlus.vue（主组件）                                  │
│  - props: columns, data, pagination, editable, ...       │
│  - 调用 useVTableAdapter 将 columns/data 转为 option      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  useVTableAdapter（适配层）                                │
│  - columns → header[]                                    │
│  - data → records[][]                                    │
│  - PlusTableColumn 扩展 → cellType / customLayout        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  @visactor/vue-vtable ListTable                          │
│  - :options="option"                                     │
│  - :records="records"                                    │
│  - @onClickCell、@onDblClickCell 等事件透传              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 列配置映射（PlusTableColumn → VTable header）

| PlusTableColumn | VTable header 字段 | 备注 |
|-----------------|-------------------|------|
| prop | field | 字段名 |
| label | caption | 表头文案 |
| width | width | 列宽 |
| formatter | 需在 customLayout 或 cellType 中实现 | 无直接等价 |
| render | customLayout（Vue slot） | 自定义单元格 |
| sortable | sort | 排序配置 |
| fixed | frozenColCount / freeze 配置 | 固定列 |

### 2.3 数据格式转换

```ts
// PlusTable: data = [{ id: 1, name: 'A' }, ...]
// VTable records 两种形态：
// 1. 二维数组: [[1, 'A'], [2, 'B'], ...]，field 为 '0','1'
// 2. 对象数组: 需 header.field 与对象 key 对应
// 适配策略：优先转 records 为二维数组，按 columns 顺序取 prop 对应值
```

---

## 三、实施步骤

### 阶段 0：依赖引入 + 基础 ListTable 渲染（约 1–2 天）

- [x] **0.1** 安装依赖：`pnpm add @visactor/vue-vtable @visactor/vtable`
- [x] **0.2** 创建 `src/components/vtable/` 目录
- [x] **0.3** 实现 `VTablePlus.vue`：仅使用 `ListTable` + 硬编码 option/records
- [x] **0.4** 创建 Demo 页面 `views/vtable/index.vue` + 路由 `/vtable`
- [x] **0.5** 验证 1000 行 × 5 列基础渲染
- [x] **0.6** 容器尺寸：width/height 整数，避免抖动（VTable 官方要求）
- [x] **0.7** 实现 `use-adaptive.ts`：ResizeObserver 计算容器宽高
- [x] **0.8** 支持 `adaptive` prop，表格填满父容器

**产出验收：** 页面可展示 1000 行列表，无报错；`adaptive` 时自适应容器

---

#### 阶段 0 详细规划（Prompt 增强 + UI/UX + 功能规划）

##### 0.0 Prompt 增强结果

| 维度 | 补全内容 |
|------|----------|
| **目标** | 完成 VTable 依赖引入与基础 ListTable 渲染，验证 Canvas 表格能展示 1000 行 × 5 列，并支持 `adaptive` 时填满父容器 |
| **技术约束** | 使用 `@visactor/vue-vtable` 的 ListTable；VTable 要求 width/height 为**整数**，避免 Canvas 抖动；项目为 Vue 3 + Vite |
| **范围边界** | 仅阶段 0 的 8 项任务；不实现 columns/data 适配层（阶段 1）、不分页、不编辑 |
| **验收标准** | 访问 `/vtable` 可见 1000 行列表；开启 `adaptive` 时表格随容器 resize 变化；`vue-tsc` 无报错 |
| **隐含假设** | PlusTable 的 `useAdaptive` 返回 maxHeight，VTable 需要 width+height；vtable 的 use-adaptive 需独立实现，用 ResizeObserver 计算容器宽高并取整 |

##### 0.1 UI/UX 设计方案

**设计目标**

- 用户目标：快速验证 VTable 能渲染大数据列表，并观察自适应效果
- 业务目标：为后续阶段 1～4 建立可运行的基础 Demo

**页面结构（Demo）**

```
+----------------------------------------------------------+
|  views/vtable/index.vue                                   |
|  +------------------------------------------------------+ |
|  | 标题：VTable 基础 Demo（阶段 0）                      | |
|  +------------------------------------------------------+ |
|  | 说明区：1000 行 × 5 列，adaptive 开关                | |
|  +------------------------------------------------------+ |
|  | vtable-wrapper (ref，ResizeObserver 监听)            | |
|  |  +------------------------------------------------+  | |
|  |  | VTablePlus / ListTable                          |  | |
|  |  | - 硬编码 header + records                       |  | |
|  |  | - width / height 来自 use-adaptive 或固定值     |  | |
|  |  +------------------------------------------------+  | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**组件树**

```
views/vtable/index.vue
├── 标题 + 说明文案
├── adaptive 开关（el-switch 或 el-checkbox）
└── VTablePlus
    └── ListTable（@visactor/vue-vtable）
        - :options="option"
        - :records="records"
        - :width="tableWidth"
        - :height="tableHeight"
```

**交互**

- 默认展示 1000 行、5 列（如：序号、姓名、年龄、性别、爱好）
- `adaptive=true` 时：表格 width/height 随 wrapper 变化；使用 ResizeObserver 节流计算
- `adaptive=false` 时：使用固定 width（如 800）和 height（如 500）

**响应式与 A11y**

- 容器使用 `width: 100%`，高度由父级或 flex 决定
- 表格需获得 `tabindex` 以支持键盘导航（VTable 内置）
- 无明显色彩对比问题，遵循默认主题

##### 0.2 功能规划（任务依赖与实现要点）

| 任务 | 依赖 | 关键实现 |
|------|------|----------|
| 0.1 | 无 | `pnpm add @visactor/vue-vtable @visactor/vtable` |
| 0.2 | 0.1 | `src/components/vtable/`、`composables/`、`styles/` |
| 0.3 | 0.2 | VTablePlus.vue：硬编码 `option.header`（5 列）、`records`（1000×5 二维数组）；接收 `width`、`height` props |
| 0.4 | 0.3 | `views/vtable/index.vue`，路由 `/vtable` |
| 0.5 | 0.4 | 造数：`Array.from({ length: 1000 }, (_, i) => [i+1, 'Name'+i, 18+i%50, ['男','女'][i%2], '爱好'])` |
| 0.6 | 0.3 | 传 width/height 前 `Math.floor()` 取整 |
| 0.7 | 0.2 | `composables/use-adaptive.ts`：ResizeObserver 监听 wrapperEl，返回 `{ width, height }` 整数 |
| 0.8 | 0.7 | VTablePlus 接收 `adaptive` prop，为 true 时用 use-adaptive 的 width/height，否则用 props 或默认值 |

**关键文件**

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 @visactor/vue-vtable、@visactor/vtable |
| `src/components/vtable/VTablePlus.vue` | 新增 | 主组件，包裹 ListTable |
| `src/components/vtable/composables/use-adaptive.ts` | 新增 | ResizeObserver 计算容器宽高，返回整数 |
| `src/components/vtable/index.ts` | 新增 | 导出 VTablePlus |
| `src/views/vtable/index.vue` | 新增 | Demo 页面 |
| `src/router/routes.ts` | 修改 | 添加 `/vtable` |

**VTable use-adaptive 与 PlusTable 差异**

| 维度 | PlusTable use-adaptive | VTable use-adaptive |
|------|------------------------|---------------------|
| 输出 | maxHeight（字符串或数字） | width、height（整数） |
| 监听 | window resize | ResizeObserver(wrapperEl) |
| 计算 | 视口 - rect.top - offsets - 兄弟/header/footer | rect.width、rect.height 直接取整 |

**风险与缓解**

| 风险 | 缓解 |
|------|------|
| ResizeObserver 兼容性 | Vue 3 目标浏览器普遍支持；可用 polyfill 兜底 |
| 容器初始尺寸为 0 | onMounted + nextTick 后再计算；或给 wrapper 设置 min-height |

---

### 阶段 1：配置适配层 + 类 PlusTable API（约 2–3 天）

- [x] **1.1** 编写 `types.ts`：`VTablePlusColumn`、`VTablePlusProps`（兼容 PlusTableColumn 子集）
- [x] **1.2** 实现 `use-vtable-adapter.ts`：`columns` + `data` → `option.header` + `records`
- [x] **1.3** 支持 `field` = column.prop，`caption` = column.label
- [x] **1.4** 支持 `width`、`minWidth`、`maxWidth` 映射
- [x] **1.5** 支持 `sortable` → VTable sort 配置
- [x] **1.6** 主组件 `VTablePlus.vue` 接收 `columns`、`data`，内部调用 adapter
- [x] **1.7** 透传 VTable 事件：onClickCell、onDblClickCell、onKeyDown
- [x] **1.8** 暴露 ref：`getTableInstance()` 获取 VTable 实例
- [x] **1.9** 支持 `rowKey`：用于 records 行标识（若 VTable 支持）
- [x] **1.10** Demo stage1：使用 columns + data 驱动，与 PlusTable 用法对比

**产出验收：** 使用 `columns`、`data` 配置即可渲染，无需手写 option

---

#### 阶段 1 详细规划（Prompt 增强 + UI/UX + 功能规划）

##### 1.0 Prompt 增强结果

| 维度 | 补全内容 |
|------|----------|
| **目标** | 实现 columns + data 配置式 API，与 PlusTable 用法对齐；内部通过 useVTableAdapter 转为 VTable option/records |
| **技术约束** | VTable header.field 与 records 列序对应；二维数组 records 时 field 为 '0'/'1'/…；对象数组时 field = prop |
| **范围边界** | 仅阶段 1 的 10 项；不实现 type 列（expand/selection/index）、不实现 formatter/render（阶段 3）；sortable 仅做配置映射 |
| **验收标准** | `columns`、`data` 配置驱动渲染；透传 onClickCell/onDblClickCell/onKeyDown；暴露 getTableInstance；vue-tsc 无报错 |
| **隐含假设** | 阶段 1 优先使用二维数组 records，adapter 按 columns 顺序取 data 行中 prop 对应值；type 列（expand/selection/index）暂过滤或延后 |

##### 1.1 UI/UX 设计方案

**设计目标**

- 用户目标：用与 PlusTable 相同的 columns、data 配置驱动 VTable，降低迁移成本
- 业务目标：验证配置适配层可行，为阶段 2～4 打基础

**Demo 页面结构（stage1）**

```
+----------------------------------------------------------+
|  views/vtable/stage1.vue                                  |
|  +------------------------------------------------------+ |
|  | 标题：VTable 配置适配 Demo（阶段 1）                  | |
|  +------------------------------------------------------+ |
|  | 说明：columns + data 驱动，与 PlusTable 用法一致      | |
|  +------------------------------------------------------+ |
|  | VTablePlus :columns="columns" :data="tableData"       | |
|  |   - 复用 PlusTable Demo 的 columns/data 结构（简化）  | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**组件树**

```
views/vtable/stage1.vue
├── 标题 + 说明
└── VTablePlus
    ├── props: columns, data, width?, height?, adaptive?
    ├── useVTableAdapter(columns, data) → option, records
    └── ListTable :options="option" :records="records"
```

**交互**

- 传入 columns（prop/label/width/minWidth/maxWidth/sortable/fixed）和 data（对象数组）
- 表格按列配置渲染；sortable 列显示排序图标（实际排序逻辑阶段 2）
- 点击单元格可透传 onClickCell 等事件

##### 1.2 功能规划（任务依赖与实现要点）

| 任务 | 依赖 | 关键实现 |
|------|------|----------|
| 1.1 | 无 | types.ts：VTablePlusColumn（prop, label, width, minWidth, maxWidth, sortable, fixed）；VTablePlusProps（columns, data, rowKey?） |
| 1.2 | 1.1 | use-vtable-adapter.ts：columns→header[]，data→records[][]；过滤 type 列，按 columns 顺序取 row[prop] |
| 1.3 | 1.2 | header.field = column.prop，header.caption = column.label |
| 1.4 | 1.2 | header.width/minWidth/maxWidth 映射 |
| 1.5 | 1.2 | sortable → header.sort: { order: 'asc'\|'desc' } 或 true |
| 1.6 | 1.2 | VTablePlus.vue 接收 columns、data，computed 调用 adapter 得到 option、records |
| 1.7 | 1.6 | 透传 @onClickCell、@onDblClickCell、@onKeyDown |
| 1.8 | 1.6 | defineExpose({ getTableInstance: () => tableRef.value?.table }) |
| 1.9 | 1.2 | rowKey 用于后续扩展；records 二维数组时无行唯一标识，可先占位 |
| 1.10 | 1.6 | stage1.vue + 路由 /vtable/stage1；columns/data 与 PlusTable 子集一致 |

**关键文件**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/vtable/types.ts` | 新增 | VTablePlusColumn、VTablePlusProps |
| `src/components/vtable/composables/use-vtable-adapter.ts` | 新增 | columns/data → option.header + records |
| `src/components/vtable/VTablePlus.vue` | 修改 | 接入 columns、data、adapter，透传事件，暴露 getTableInstance |
| `src/views/vtable/stage1.vue` | 新增 | Demo |
| `src/router/routes.ts` | 修改 | 添加 /vtable/stage1 |

**VTable header 与 PlusTableColumn 映射**

| PlusTableColumn | VTable header | 备注 |
|-----------------|---------------|------|
| prop | field | 必填，作为列标识 |
| label | caption | 表头文案 |
| width | width | 列宽 |
| minWidth | minWidth | 最小列宽 |
| maxWidth | maxWidth | 最大列宽 |
| sortable | sort | `true` 或 `{ order: 'asc' }` |
| fixed | freeze 列配置 | 阶段 2 实现，1.1 类型可预留 |

**数据转换逻辑**

```ts
// data = [{ id: 1, name: 'A' }, ...]
// columns = [{ prop: 'id' }, { prop: 'name' }, ...]
// records = data.map(row => columns.filter(c => c.prop).map(c => row[c.prop]))
// header = columns.filter(c => c.prop).map(c => ({ field: c.prop, caption: c.label, ... }))
```

**风险与缓解**

| 风险 | 缓解 |
|------|------|
| ListTable 需通过 ref 获取实例 | Vue-VTable ListTable 可能暴露 table 属性，需查阅文档或源码 |
| type 列（expand/selection/index） | 阶段 1 过滤，阶段 2/3 再考虑 |
| formatter/render | 阶段 3 实现，1.1 类型可预留 |

**实现调整**

| 调整项 | 说明 |
|--------|------|
| records 为二维数组 | header.field 使用列索引字符串 '0'/'1'/...，与 VTable 二维数组格式一致 |
| 无 columns/data 时 | 使用兜底硬编码 option/records，保持阶段 0 Demo `/vtable` 可用 |

---

### 阶段 2：分页 + 排序 + 固定列（约 2 天）

- [x] **2.1** 实现 VTable 分页：参考 [pagination demo](https://visactor.io/vtable/demo/basic-functionality/pagination)
- [x] **2.2** 支持 `pagination` prop：currentPage、pageSize、total，内部 data 切片
- [x] **2.3** 分页器由调用方通过插槽 `#pagination` 提供，根据项目 UI 库（Element Plus、Ant Design Vue 等）自行选型
- [x] **2.4** 排序：透传 `onSortClick`，支持 sortable 列
- [x] **2.5** 固定列：`frozenColCount` 或列级 `frozen`，映射 column.fixed
- [x] **2.6** 固定行：可选支持 `frozenRowCount`
- [x] **2.7** Demo stage2：分页、排序、固定列演示
- [x] **2.8** 列宽拖拽：VTable 原生支持，确保 `resizeColumn` 等事件透传

**产出验收：** 分页切换、列排序、固定列正常

**分页插槽约定**：`#pagination` 接收 `{ currentPage, pageSize, total }` 等 scope，调用方使用 `el-pagination`、`a-pagination` 等组件并 `@current-change` / `@size-change` 调用 `tableRef.setPage()` 或更新 `pagination` 配置。

---

#### 阶段 2 详细规划（Prompt 增强 + UI/UX + 功能规划）

##### 2.0 Prompt 增强结果

| 维度 | 补全内容 |
|------|----------|
| **目标** | 支持分页、排序、固定列；分页采用客户端切片或服务端由调用方控制 data；排序透传 onSortClick；固定列映射 column.fixed → frozenColCount |
| **技术约束** | VTable option 支持 pagination、frozenColCount；分页器通过 #pagination 插槽由调用方提供（el-pagination）；项目使用 Element Plus |
| **范围边界** | 仅阶段 2 的 8 项；不实现服务端分页逻辑（由调用方按页传 data）；fixed 仅支持 'left' |
| **验收标准** | 分页切换、列排序（图标+事件）、固定列、列宽拖拽事件透传；Demo stage2 可验收 |
| **隐含假设** | 客户端分页：内部按 currentPage/pageSize 对 data 切片后传 records；服务端分页：调用方按页传 data，VTablePlus 只透传 |

##### 2.1 UI/UX 设计方案

**设计目标**

- 用户目标：表格支持分页切换、列头排序、左侧固定列、列宽拖拽
- 业务目标：与 PlusTable 分页/排序/固定列能力对齐

**Demo 页面结构（stage2）**

```
+----------------------------------------------------------+
|  views/vtable/stage2.vue                                  |
|  +------------------------------------------------------+ |
|  | 标题：VTable 分页 / 排序 / 固定列 Demo（阶段 2）     | |
|  +------------------------------------------------------+ |
|  | VTablePlus :columns :data :pagination                 | |
|  |   #pagination → el-pagination                         | |
|  |   - 客户端分页：1000 条，每页 20 条                  | |
|  |   - 部分列 sortable，部分列 fixed: 'left'            | |
|  +------------------------------------------------------+ |
+----------------------------------------------------------+
```

**组件树**

```
views/vtable/stage2.vue
├── 标题 + 说明
└── VTablePlus
    ├── props: columns, data, pagination
    ├── 内部：按 pagination 切片 data → records
    ├── #pagination 插槽 → el-pagination
    └── 透传 onSortClick、onResizeColumn
```

**交互**

- 分页：el-pagination 切换页/每页条数 → emit pagination → 父更新 currentPage/pageSize → 切片 data
- 排序：点击 sortable 列表头 → onSortClick → 父可监听并自行排序 data（或阶段 2 仅透传事件）
- 固定列：左固定列不随横向滚动
- 列宽拖拽：VTable 原生支持，透传 onResizeColumn

##### 2.2 功能规划（任务依赖与实现要点）

| 任务 | 依赖 | 关键实现 |
|------|------|----------|
| 2.1 | 无 | 研究 VTable pagination 配置；客户端分页采用 data 切片，不依赖 VTable 内置分页 |
| 2.2 | 2.1 | pagination prop：{ currentPage, pageSize, total }；有 total 时对 data 按页切片传入 records |
| 2.3 | 2.2 | 主组件增加 #pagination 插槽；layout 含 header/table/footer，footer 放 #pagination |
| 2.4 | 1.x | 透传 @onSortClick；sortable 列已由 adapter 配置，事件透传即可 |
| 2.5 | 1.2 | adapter 计算 frozenColCount = fixed==='left' 的列数；option 增加 frozenColCount |
| 2.6 | 2.5 | frozenRowCount 可选，option 增加；阶段 2 可为 0 |
| 2.7 | 2.1–2.6 | stage2.vue + 路由 /vtable/stage2；1000 条数据，分页 20 条，固定 ID 列 |
| 2.8 | 1.6 | 透传 @onResizeColumn、@onResizeColumnEnd |

**关键文件**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/vtable/types.ts` | 修改 | 增加 VTablePlusPagination 类型 |
| `src/components/vtable/composables/use-vtable-adapter.ts` | 修改 | 支持 frozenColCount，映射 column.fixed |
| `src/components/vtable/VTablePlus.vue` | 修改 | pagination prop、#pagination 插槽、data 切片、透传 onSortClick/onResizeColumn |
| `src/views/vtable/stage2.vue` | 新增 | Demo |
| `src/router/routes.ts` | 修改 | 添加 /vtable/stage2 |

**分页与切片逻辑**

```ts
// pagination = { currentPage: 1, pageSize: 20, total: 1000 }
// 客户端分页：slicedData = data.slice((currentPage-1)*pageSize, currentPage*pageSize)
// records 由 adapter 基于 slicedData 生成
// 无 pagination 时：使用完整 data
```

**固定列映射**

```ts
// frozenColCount = columns.filter(c => c.fixed === 'left').length
// option.frozenColCount = frozenColCount
```

**风险与缓解**

| 风险 | 缓解 |
|------|------|
| VTable 与 Vue 响应式导致列宽重置 | 使用 keepColumnWidthChange（Vue-VTable 文档） |
| 排序逻辑由谁实现 | 阶段 2 仅透传 onSortClick，父可监听后排序 data；或后续在 adapter 内做客户端排序 |

**实现调整**

| 调整项 | 说明 |
|--------|------|
| 客户端分页 | 有 total 时对 data 按 currentPage/pageSize 切片，displayData 传入 adapter |
| frozenRowCount | 阶段 2 未实现，adapter 仅增加 frozenColCount |
| keepColumnWidthChange | ListTable 增加 :keep-column-width-change="true" 避免列宽重置 |

---

### 阶段 3：单元格编辑 + 自定义渲染（约 2–3 天）

- [ ] **3.1** 研究 VTable [editCell](https://visactor.io/vtable/demo/edit/edit-cell) 配置
- [ ] **3.2** 支持 `editable` prop 及列级 `column.editable`
- [ ] **3.3** 映射 `component`（input/select 等）→ VTable 内置 editor 或自定义 editor
- [ ] **3.4** 支持 `#cell-${prop}` 插槽 → 列 `customLayout`（Vue 自定义组件）
- [ ] **3.5** 参考 [Vue Custom Component](https://visactor.io/vtable/guide/custom_define/vue-custom-component) 实现 customLayout 插槽
- [ ] **3.6** 编辑确认/取消：Enter/Tab/Escape 行为与 PlusTable 对齐（若 VTable 支持）
- [ ] **3.7** 事件：cell-edit-start、cell-edit-end、cell-value-change（通过 VTable 事件包装）
- [ ] **3.8** Demo stage3：可编辑列 + 自定义单元格（进度条、标签等）
- [ ] **3.9** 大数据编辑性能验证（1 万+ 行可编辑）

**产出验收：** 可编辑列、自定义单元格、编辑事件可用

---

### 阶段 4：主题 + 导出 + 事件透传（约 1–2 天）

- [ ] **4.1** 支持 `theme` prop：default/dark/custom，映射 VTable themes
- [ ] **4.2** 支持自定义主题：传入 theme 对象覆盖
- [ ] **4.3** 实现 `exportImage()`、`exportExcel()` 方法（调用 VTable export API）
- [ ] **4.4** 工具栏插槽：`#title`、`#actions`，与 PlusTable header 布局一致
- [ ] **4.5** 底栏插槽：`#summary`、`#pagination`
- [ ] **4.6** 事件透传：onSelectedCell、onResizeColumn、onScroll 等常用事件
- [ ] **4.7** Demo stage4：主题切换、导出、完整布局

**产出验收：** 主题可切换、可导出、header/footer 插槽可用

---

## 四、文件结构

```
src/components/vtable/
├── VTablePlus.vue              # 主组件（分页通过 #pagination 插槽，调用方按 UI 库选型）
├── types.ts                    # VTablePlusColumn、VTablePlusProps
├── constants.ts                # injectKey、默认值
├── index.ts                    # 导出
│
├── composables/
│   ├── use-vtable-adapter.ts   # columns/data → option/records
│   ├── use-adaptive.ts         # 容器自适应（可复用 plus-table）
│   └── index.ts
│
└── styles/
    └── index.scss              # 容器样式

src/views/vtable/
├── index.vue                   # 主 Demo
├── stage1.vue                  # 配置适配
├── stage2.vue                  # 分页/排序/固定列
├── stage3.vue                  # 编辑/自定义
└── stage4.vue                  # 主题/导出
```

---

## 五、关键文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 @visactor/vue-vtable、@visactor/vtable |
| `src/components/vtable/VTablePlus.vue` | 新增 | 主组件，ListTable 封装 |
| `src/components/vtable/composables/use-vtable-adapter.ts` | 新增 | 列/数据适配 |
| `src/router/routes.ts` | 修改 | 添加 /vtable、/vtable/stage1～stage4 |
| `src/components/index.ts` | 修改 | 导出 VTablePlus |

---

## 六、风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| VTable 与 Vue 响应式更新导致列宽重置 | 使用 `keepColumnWidthChange`（Vue-VTable 文档） |
| customLayout 与 Element Plus 组件兼容 | 优先使用 VTable 原生 cellType（progressbar、checkbox 等），复杂场景用 Vue 组件 + 文档示例 |
| 大数据下编辑性能 | 依赖 VTable 内置虚拟渲染，避免整表重绘 |
| option 与 records 分离导致二次更新 | adapter 使用 computed 合并，watch 变化时一次性 setRecords/updateOption |

---

## 七、与 PlusTable 的能力对标（目标）

| 能力 | PlusTable | VTable 规划 |
|------|-----------|-------------|
| 配置式列 | ✅ | ✅ 阶段 1 |
| 分页 | ✅ | ✅ 阶段 2 |
| 排序 | ✅ | ✅ 阶段 2 |
| 固定列 | ✅ | ✅ 阶段 2 |
| 单元格编辑 | ✅ | ✅ 阶段 3 |
| 自定义渲染 | ✅ render/插槽 | ✅ customLayout 阶段 3 |
| 校验 | ✅ | 🔶 后续迭代 |
| 热键导航 | ✅ | 🔶 依赖 VTable onKeyDown |
| 列设置 | ✅ | 🔶 后续迭代 |
| 自适应高度 | ✅ | ✅ 阶段 0 |
| 百万级数据 | ❌ | ✅ 核心价值 |

---

## 八、验收标准

1. **功能**：各阶段任务清单完成，Demo 可验收
2. **性能**：10 万行数据滚动流畅，无明显卡顿
3. **API**：`columns`、`data` 与 PlusTable 风格一致，降低迁移成本
4. **类型**：`vue-tsc` 零错误
5. **文档**：README 或组件内注释说明 Props、Events、Slots

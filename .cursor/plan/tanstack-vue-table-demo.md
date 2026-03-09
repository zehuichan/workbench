# TanStack Vue Table 起步 Demo

> **需求来源**：/feat 起步@tanstack/vue-table demo  
> **增强后需求**：在项目内新增「TanStack Vue Table 起步示例」单页，用 @tanstack/vue-table 实现基础表格展示，可选排序/分页，便于团队快速上手 API。

---

## 〇、进度里程碑

| 项目     | 说明 |
|----------|------|
| **当前阶段** | ✅ 已完成 |
| **待办任务** | 无 |
| **完成度**   | 12/12 |

**Demo 路由**：`/tanstack-table-demo` → `views/tanstack-table-demo/index.vue`

---

## 一、需求说明（Prompt 增强结果）

| 维度         | 说明 |
|--------------|------|
| **目标**     | 新增一个基于 @tanstack/vue-table 的起步示例页，展示创建 table 实例、列定义、数据绑定与基础渲染；可选展示排序或分页能力。 |
| **技术约束** | Vue 3 Composition API、已依赖 `@tanstack/vue-table ^8.21.3`；与现有 PlusTable（Element Plus）并存，不替换。 |
| **范围边界** | 单页 demo，不封装为通用业务组件；渲染使用原生 `<table>` 或项目现有样式体系（如 Tailwind），表头 + 表体 + 可选排序/分页。 |
| **验收标准** | ① 新路由可访问；② 表格列与数据正确对应；③ 符合项目 kebab-case、ESLint、Prettier；④ 若实现排序/分页则交互正确。 |

---

## 二、UI/UX 设计方案

### 2.1 设计目标

- **用户目标**：快速查看 @tanstack/vue-table 在本项目中的最小可用示例（列定义、数据、表头表体渲染）。
- **业务目标**：降低团队接入 TanStack Table 的心智负担，与 plus-table 形成「原生 Table API」与「Element 增强表格」的对照。

### 2.2 页面结构

```
+----------------------------------------------------------+
|  页面标题：TanStack Vue Table 起步示例                      |
|  简短说明：createVueTable + 列定义 + getCoreRowModel        |
+----------------------------------------------------------+
|  [可选] 工具栏：排序开关 / 分页大小 等（若做排序/分页）       |
+----------------------------------------------------------+
|  <table>                                                  |
|    表头（从 table.getHeaderGroups() 渲染）                 |
|    表体（从 table.getRowModel().rows 渲染）                |
|  </table>                                                 |
+----------------------------------------------------------+
|  [可选] 分页控件（若用 getPaginationRowModel）              |
+----------------------------------------------------------+
```

### 2.3 组件树

```
TanstackTableDemoPage (views/tanstack-table-demo/index.vue)
├── 页面标题 + 说明文案
├── 可选：Toolbar（排序/分页相关控制）
└── 表格区域
    └── 原生 <table> 或带样式的 table
        ├── <thead>：headerGroups → headerGroup.headers → column.columnDef.header
        └── <tbody>：rowModel.rows → row.getVisibleCells() → cell.getValue()
```

### 2.4 交互与状态

- **基础**：仅展示数据，无额外状态。
- **若做排序**：列头可点击，切换升序/降序/无排序；使用 `getSortedRowModel()`。
- **若做分页**：使用 `getPaginationRowModel()`，提供页码或上一页/下一页；状态：currentPage、pageSize。

### 2.5 响应式与 A11y

- 表格容器可设置 `overflow-x: auto`，避免小屏横向溢出。
- 使用语义化 `<table>`、`<thead>`、`<tbody>`、`<th>`、`<td>`；表头 `scope="col"`。

---

## 三、功能规划（任务清单）

### 3.1 路由与入口

- [x] **3.1.1** 在 `src/router/routes.ts` 中新增路由：`/tanstack-table-demo` → `views/tanstack-table-demo/index.vue`。
- [x] **3.1.2** 新建 `src/views/tanstack-table-demo/index.vue` 作为 demo 页面入口（先空壳或仅标题）。

### 3.2 数据与列定义

- [x] **3.2.1** 在 demo 页面中定义 1 个 TypeScript 类型（如 `DemoRow`），包含至少 3 个字段（如 id、name、status）。
- [x] **3.2.2** 使用 `defineColumnHelper<DemoRow>()` 或等价方式定义列（accessorKey/header）；列数 ≥ 3。（采用 `createColumnHelper<DemoRow>()`）
- [x] **3.2.3** 准备一份 `ref` 或 `reactive` 的示例数据（数组），行数约 5～10 条。

### 3.3 创建 Table 实例

- [x] **3.3.1** 从 `@tanstack/vue-table` 引入 `createVueTable`、`getCoreRowModel`（及若需要：`getSortedRowModel`、`getPaginationRowModel` 等）。（实际 API 为 `useVueTable`）
- [x] **3.3.2** 在 setup 中调用 `createVueTable`，传入 `data`、`columns`、`getCoreRowModel: getCoreRowModel()`，得到 table 实例并用于模板。

### 3.4 模板渲染

- [x] **3.4.1** 使用 `table.getHeaderGroups()` 在 `<thead>` 中渲染表头（遍历 headerGroup.headers，取 column.columnDef.header）。
- [x] **3.4.2** 使用 `table.getRowModel().rows` 在 `<tbody>` 中渲染行；每行用 `row.getVisibleCells()` 渲染单元格，用 `cell.getValue()` 或自定义渲染显示内容。
- [x] **3.4.3** 为表格添加基础样式（如 border、padding），与项目风格一致（可复用 plus-table-demo 的容器样式或 Tailwind）。

### 3.5 可选能力（二选一或都做）

- [x] **3.5.1** **排序**：列定义中为需排序列设置 `enableSorting: true`；传入 `getSortedRowModel: getSortedRowModel()`；表头渲染可点击并调用 `column.getToggleSortingHandler()`；显示排序状态（升序/降序）。
- [x] **3.5.2** **分页**：传入 `getPaginationRowModel: getPaginationRowModel()`，并设置 `initialState: { pagination: { pageSize: 5 } }`（或等价）；在页面上展示 `table.getPageCount()`、当前页、上一页/下一页或页码列表。

### 3.6 规范与收尾

- [x] **3.6.1** 确保文件命名、组件名为 kebab-case；通过 ESLint、Prettier；若有测试要求则补充最小用例。
- [x] **3.6.2** 在本文档「〇、进度里程碑」中填写 Demo 路由（如 `views/tanstack-table-demo/index.vue` 对应 `/tanstack-table-demo`）。

---

## 四、依赖关系与关键文件

| 依赖项           | 说明 |
|------------------|------|
| @tanstack/vue-table | 已安装 ^8.21.3，无需新增依赖。 |
| Vue 3 + Vue Router | 已有；仅新增路由与单页。 |
| 样式             | 使用项目现有 Tailwind 或与 plus-table-demo 一致的 scoped 样式。 |

**关键文件**：

- `src/router/routes.ts` — 新增一条 route。
- `src/views/tanstack-table-demo/index.vue` — 唯一新建页面，内含 table 创建与渲染逻辑。

---

## 五、风险与缓解

| 风险               | 缓解 |
|--------------------|------|
| @tanstack/vue-table API 与文档版本不一致 | 以 package 内版本为准，必要时查 npm 或 GitHub 源码。 |
| 与 PlusTable 风格差异大 | 仅做起步 demo，不强制统一组件库；表格用简单 table 样式即可。 |

---

## 六、实现调整（实施过程中可补充）

- **API 命名**：项目内 @tanstack/vue-table 使用 `useVueTable` 而非 `createVueTable`；列定义采用 `createColumnHelper<DemoRow>()`。
- **数据响应式**：`useVueTable` 接受 `get data() { return data.value }` 以支持 ref 数据响应式更新。

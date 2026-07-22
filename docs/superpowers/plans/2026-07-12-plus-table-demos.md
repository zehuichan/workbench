# PlusTable Playground Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 vue-router + 侧栏布局搭可扩展 playground，并实现 PlusTable 四个场景 demo 页。

**Architecture:** `App.vue` 只挂 `el-config-provider` + `router-view`；`playground-layout.vue` 提供左侧 PlusTable 导航与右侧内容；每个 demo 自包含 data/columns/toolbar。本期不注册 composables 路由。

**Tech Stack:** Vue 3.5、vue-router、Element Plus、现有 `@/components/plus-table`、Vite 8、TypeScript。

**Spec:** `docs/superpowers/specs/2026-07-12-plus-table-demos-design.md`

**验证约定:** 本仓库无 demo 单测；每任务用 `pnpm typecheck`（及必要的手动检查）代替 TDD 红绿循环。

---

## File Structure

| 路径                                                    | 职责                              |
| ------------------------------------------------------- | --------------------------------- |
| `package.json`                                          | 增加 `vue-router` 依赖            |
| `src/main.ts`                                           | `app.use(router)`                 |
| `src/App.vue`                                           | 壳：config-provider + router-view |
| `src/router/index.ts`                                   | 路由表与重定向                    |
| `src/layouts/playground-layout.vue`                     | 侧栏 + router-view                |
| `src/views/plus-table/basic-editing-demo.vue`           | 多编辑器 cell 编辑                |
| `src/views/plus-table/dependencies-validation-demo.vue` | 联动 + 校验                       |
| `src/views/plus-table/history-dirty-demo.vue`           | history + dirty                   |
| `src/views/plus-table/pagination-rows-demo.vue`         | 分页 + 行操作（改全量源）         |
| `README.md`                                             | 补充 playground 路由说明          |

---

### Task 1: 安装 vue-router 并接通壳

**Files:**

- Modify: `package.json`（经 pnpm）
- Modify: `src/main.ts`
- Create: `src/router/index.ts`
- Create: `src/layouts/playground-layout.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 安装依赖**

```bash
pnpm add vue-router
```

Expected: `package.json` dependencies 出现 `vue-router`。

- [ ] **Step 2: 创建 `src/router/index.ts`**

```ts
import { createRouter, createWebHistory } from 'vue-router';

import PlaygroundLayout from '@/layouts/playground-layout.vue';
import BasicEditingDemo from '@/views/plus-table/basic-editing-demo.vue';
import DependenciesValidationDemo from '@/views/plus-table/dependencies-validation-demo.vue';
import HistoryDirtyDemo from '@/views/plus-table/history-dirty-demo.vue';
import PaginationRowsDemo from '@/views/plus-table/pagination-rows-demo.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PlaygroundLayout,
      children: [
        { path: '', redirect: '/plus-table/basic-editing' },
        {
          path: 'plus-table/basic-editing',
          name: 'plus-table-basic-editing',
          component: BasicEditingDemo,
          meta: { title: '基础编辑', group: 'PlusTable' },
        },
        {
          path: 'plus-table/dependencies-validation',
          name: 'plus-table-dependencies-validation',
          component: DependenciesValidationDemo,
          meta: { title: '联动与校验', group: 'PlusTable' },
        },
        {
          path: 'plus-table/history-dirty',
          name: 'plus-table-history-dirty',
          component: HistoryDirtyDemo,
          meta: { title: '历史与脏追踪', group: 'PlusTable' },
        },
        {
          path: 'plus-table/pagination-rows',
          name: 'plus-table-pagination-rows',
          component: PaginationRowsDemo,
          meta: { title: '分页与行操作', group: 'PlusTable' },
        },
      ],
    },
  ],
});
```

- [ ] **Step 3: 创建 `src/layouts/playground-layout.vue`**

```vue
<script setup lang="ts">
defineOptions({ name: 'PlaygroundLayout' });

const plusTableLinks = [
  { to: '/plus-table/basic-editing', label: '基础编辑' },
  { to: '/plus-table/dependencies-validation', label: '联动与校验' },
  { to: '/plus-table/history-dirty', label: '历史与脏追踪' },
  { to: '/plus-table/pagination-rows', label: '分页与行操作' },
] as const;
</script>

<template>
  <div class="playground">
    <aside class="playground__nav">
      <div class="playground__brand">Component Labs</div>
      <div class="playground__group">
        <div class="playground__group-title">PlusTable</div>
        <router-link
          v-for="link in plusTableLinks"
          :key="link.to"
          class="playground__link"
          active-class="is-active"
          :to="link.to"
        >
          {{ link.label }}
        </router-link>
      </div>
    </aside>
    <main class="playground__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  color: #303133;
}

.playground__nav {
  width: 220px;
  flex-shrink: 0;
  padding: 20px 12px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.playground__brand {
  font-size: 15px;
  font-weight: 600;
  margin: 0 8px 20px;
}

.playground__group-title {
  font-size: 12px;
  color: #909399;
  margin: 0 8px 8px;
}

.playground__link {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 2px;
}

.playground__link:hover {
  background: #f2f6fc;
  color: #409eff;
}

.playground__link.is-active {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 600;
}

.playground__main {
  flex: 1;
  min-width: 0;
  padding: 24px 28px 40px;
}
</style>
```

- [ ] **Step 4: 改写 `src/App.vue`**

```vue
<script setup lang="ts">
defineOptions({ name: 'App' });
</script>

<template>
  <el-config-provider size="small">
    <router-view />
  </el-config-provider>
</template>
```

- [ ] **Step 5: 改写 `src/main.ts`**

```ts
import { createApp } from 'vue';

import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';

import App from './App.vue';
import { router } from './router';

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount('#app');
```

- [ ] **Step 6: 先放四个空壳 demo，让路由可解析**

对每个文件创建最小 SFC（下一步再填满）：

`src/views/plus-table/basic-editing-demo.vue`：

```vue
<script setup lang="ts">
defineOptions({ name: 'BasicEditingDemo' });
</script>

<template>
  <div>basic-editing placeholder</div>
</template>
```

同理创建：

- `dependencies-validation-demo.vue`（name: `DependenciesValidationDemo`）
- `history-dirty-demo.vue`（name: `HistoryDirtyDemo`）
- `pagination-rows-demo.vue`（name: `PaginationRowsDemo`）

- [ ] **Step 7: 类型检查**

```bash
pnpm typecheck
```

Expected: 通过（无报错）。

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml src/main.ts src/App.vue src/router/index.ts src/layouts/playground-layout.vue src/views/plus-table
git commit -m "feat(playground): add vue-router shell and plus-table routes"
```

---

### Task 2: basic-editing-demo

**Files:**

- Modify: `src/views/plus-table/basic-editing-demo.vue`

- [ ] **Step 1: 实现完整页面**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'BasicEditingDemo' });

interface Row {
  id: number;
  name: string;
  amount: number;
  status: string;
  dueDate: string;
  enabled: boolean;
}

const data = ref<Row[]>([
  {
    id: 1,
    name: '需求评审',
    amount: 1200,
    status: 'todo',
    dueDate: '2026-07-20',
    enabled: true,
  },
  {
    id: 2,
    name: '接口开发',
    amount: 3400,
    status: 'doing',
    dueDate: '2026-07-25',
    enabled: true,
  },
  {
    id: 3,
    name: '联调测试',
    amount: 800,
    status: 'done',
    dueDate: '2026-07-30',
    enabled: false,
  },
]);

const statusOptions = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'doing' },
  { label: '完成', value: 'done' },
];

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 140,
    editable: true,
    component: 'input',
  },
  {
    prop: 'amount',
    label: '金额',
    width: 120,
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 100, controls: false },
    formatter: (row: Row) => `¥ ${(row.amount ?? 0).toLocaleString('zh-CN')}`,
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    editable: true,
    component: 'select',
    componentProps: { options: statusOptions, clearable: true },
    formatter: (row: Row) => statusOptions.find((o) => o.value === row.status)?.label ?? row.status,
  },
  {
    prop: 'dueDate',
    label: '截止日期',
    width: 160,
    editable: true,
    component: 'date-picker',
    componentProps: { type: 'date', valueFormat: 'YYYY-MM-DD' },
  },
  {
    prop: 'enabled',
    label: '启用',
    width: 90,
    align: 'center',
    editable: true,
    component: 'switch',
  },
];
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">基础编辑</h1>
      <p class="demo__desc">cell 模式：input / input-number / select / date-picker / switch</p>
    </header>
    <PlusTable v-model:data="data" :columns="columns" row-key="id" edit-mode="cell" border />
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
```

- [ ] **Step 2: `pnpm typecheck`**

Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/views/plus-table/basic-editing-demo.vue
git commit -m "feat(plus-table): add basic editing demo"
```

---

### Task 3: dependencies-validation-demo

**Files:**

- Modify: `src/views/plus-table/dependencies-validation-demo.vue`

- [ ] **Step 1: 实现完整页面**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PlusTable } from '@/components/plus-table';
import type { ValidateResult } from '@/components/plus-table';

defineOptions({ name: 'DependenciesValidationDemo' });

interface Row {
  id: number;
  category: string;
  item: string;
  remark: string;
}

const CATEGORY_ITEMS: Record<string, { label: string; value: string }[]> = {
  hardware: [
    { label: '显示器', value: 'monitor' },
    { label: '键盘', value: 'keyboard' },
  ],
  software: [
    { label: 'IDE 许可', value: 'ide' },
    { label: '云服务', value: 'cloud' },
  ],
};

const tableRef = ref<{ validate: () => Promise<ValidateResult> }>();
const lastValidate = ref('');

const data = ref<Row[]>([
  { id: 1, category: 'hardware', item: 'monitor', remark: '27 寸' },
  { id: 2, category: 'software', item: 'ide', remark: '' },
  { id: 3, category: '', item: '', remark: '' },
]);

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'category',
    label: '类别',
    width: 160,
    editable: true,
    required: true,
    rules: [{ required: true, message: '请选择类别' }],
    component: 'select',
    componentProps: {
      options: [
        { label: '硬件', value: 'hardware' },
        { label: '软件', value: 'software' },
      ],
      clearable: true,
    },
    formatter: (row: Row) =>
      (({ hardware: '硬件', software: '软件' }) as Record<string, string>)[row.category] ?? '',
  },
  {
    prop: 'item',
    label: '明细',
    width: 160,
    editable: true,
    required: true,
    rules: [{ required: true, message: '请选择明细' }],
    component: 'select',
    componentProps: { clearable: true },
    dependencies: {
      triggerFields: ['category'],
      componentProps: (row: Row) => ({
        options: CATEGORY_ITEMS[row.category] ?? [],
        disabled: !row.category,
      }),
      trigger: (row: Row, api: { setValue: (p: string, v: unknown) => void }) => {
        const options = CATEGORY_ITEMS[row.category] ?? [];
        if (!options.some((o) => o.value === row.item)) {
          api.setValue('item', '');
        }
      },
    },
    formatter: (row: Row) => {
      const options = CATEGORY_ITEMS[row.category] ?? [];
      return options.find((o) => o.value === row.item)?.label ?? row.item;
    },
  },
  {
    prop: 'remark',
    label: '备注',
    minWidth: 160,
    editable: true,
    component: 'input',
  },
];

async function handleValidate() {
  const result = await tableRef.value?.validate();
  if (!result) {
    lastValidate.value = '无法校验';
    return;
  }
  lastValidate.value = result.valid ? '校验通过' : `失败 ${result.errors.length} 项`;
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">联动与校验</h1>
      <p class="demo__desc">类别驱动明细选项；必填校验。第 3 行故意留空便于触发失败。</p>
    </header>
    <PlusTable
      ref="tableRef"
      v-model:data="data"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      border
    >
      <template #toolbar>
        <el-button type="primary" @click="handleValidate">校验</el-button>
        <span v-if="lastValidate" class="demo__meta">{{ lastValidate }}</span>
      </template>
    </PlusTable>
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.demo__meta {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
}
</style>
```

- [ ] **Step 2: `pnpm typecheck`**

Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/views/plus-table/dependencies-validation-demo.vue
git commit -m "feat(plus-table): add dependencies and validation demo"
```

---

### Task 4: history-dirty-demo

**Files:**

- Modify: `src/views/plus-table/history-dirty-demo.vue`

- [ ] **Step 1: 实现完整页面**

说明：`canUndo` / `canRedo` 经 `defineExpose` 暴露为 ComputedRef；在 script 里用可选链读 `.value`。脏行数在 `cell-change` 时刷新。

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'HistoryDirtyDemo' });

interface Row {
  id: number;
  name: string;
  amount: number;
}

interface TableExpose {
  undo: () => unknown;
  redo: () => unknown;
  canUndo: { value: boolean };
  canRedo: { value: boolean };
  getModifiedRows: () => Row[];
  resetTracking: () => void;
}

const tableRef = ref<TableExpose>();
const dirtyCount = ref(0);

const data = ref<Row[]>([
  { id: 1, name: '差旅报销', amount: 1280 },
  { id: 2, name: '办公采购', amount: 560 },
  { id: 3, name: '外包结算', amount: 9200 },
]);

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 160,
    editable: true,
    component: 'input',
  },
  {
    prop: 'amount',
    label: '金额',
    width: 140,
    align: 'right',
    editable: true,
    component: 'input-number',
    componentProps: { min: 0, step: 10, controls: false },
  },
];

const canUndo = computed(() => tableRef.value?.canUndo?.value ?? false);
const canRedo = computed(() => tableRef.value?.canRedo?.value ?? false);

function refreshDirty() {
  dirtyCount.value = tableRef.value?.getModifiedRows()?.length ?? 0;
}

function handleUndo() {
  tableRef.value?.undo();
  refreshDirty();
}

function handleRedo() {
  tableRef.value?.redo();
  refreshDirty();
}

function handleResetTracking() {
  tableRef.value?.resetTracking();
  refreshDirty();
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">历史与脏追踪</h1>
      <p class="demo__desc">开启 history + dirtyTracking；编辑后可撤销并查看脏行。</p>
    </header>
    <PlusTable
      ref="tableRef"
      v-model:data="data"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      history
      dirty-tracking
      border
      @cell-change="refreshDirty"
    >
      <template #toolbar>
        <el-button :disabled="!canUndo" @click="handleUndo">Undo</el-button>
        <el-button :disabled="!canRedo" @click="handleRedo">Redo</el-button>
        <el-button @click="handleResetTracking">Reset tracking</el-button>
        <span class="demo__meta">脏行 {{ dirtyCount }}</span>
      </template>
    </PlusTable>
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.demo__meta {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
}
</style>
```

- [ ] **Step 2: `pnpm typecheck`**

Expected: 通过。若 `canUndo` 类型不匹配（暴露的是 ComputedRef 或已解包 boolean），按实际类型收窄 `TableExpose`，以 typecheck 为准。

- [ ] **Step 3: Commit**

```bash
git add src/views/plus-table/history-dirty-demo.vue
git commit -m "feat(plus-table): add history and dirty tracking demo"
```

---

### Task 5: pagination-rows-demo

**Files:**

- Modify: `src/views/plus-table/pagination-rows-demo.vue`

**要点:** PlusTable 分页为服务端驱动（组件不切片）。`insertRow`/`removeRow` 作用在传入的 `data` 上；因此行操作必须改 `allRows`，表格只吃当前页切片。单元格编辑会原地改行对象，切片与全量共享引用即可。

- [ ] **Step 1: 实现完整页面**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlusTable } from '@/components/plus-table';

defineOptions({ name: 'PaginationRowsDemo' });

interface Row {
  id: number;
  name: string;
  owner: string;
}

let nextId = 21;

const allRows = ref<Row[]>(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `任务 ${i + 1}`,
    owner: i % 2 === 0 ? 'Alice' : 'Bob',
  })),
);

const page = ref(1);
const pageSize = ref(5);

const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return allRows.value.slice(start, start + pageSize.value);
});

const columns = [
  { type: 'index', label: '#', width: 60 },
  {
    prop: 'name',
    label: '名称',
    minWidth: 160,
    editable: true,
    component: 'input',
  },
  {
    prop: 'owner',
    label: '负责人',
    width: 140,
    editable: true,
    component: 'input',
  },
];

function handlePageChange(payload: { page: number; pageSize: number }) {
  page.value = payload.page;
  pageSize.value = payload.pageSize;
}

function addRow() {
  allRows.value = [
    ...allRows.value,
    { id: nextId++, name: `新任务 ${nextId - 1}`, owner: 'Alice' },
  ];
  page.value = Math.ceil(allRows.value.length / pageSize.value) || 1;
}

function removeFirstOnPage() {
  if (pageRows.value.length === 0) return;
  const id = pageRows.value[0]!.id;
  allRows.value = allRows.value.filter((row) => row.id !== id);
  const maxPage = Math.max(1, Math.ceil(allRows.value.length / pageSize.value));
  if (page.value > maxPage) page.value = maxPage;
}

function duplicateFirstOnPage() {
  const source = pageRows.value[0];
  if (!source) return;
  const index = allRows.value.findIndex((row) => row.id === source.id);
  if (index < 0) return;
  const clone: Row = {
    ...source,
    id: nextId++,
    name: `${source.name} (副本)`,
  };
  const next = [...allRows.value];
  next.splice(index + 1, 0, clone);
  allRows.value = next;
}
</script>

<template>
  <section class="demo">
    <header class="demo__header">
      <h1 class="demo__title">分页与行操作</h1>
      <p class="demo__desc">全量在内存切片；增删复制改源数据。表格仅接收当前页。</p>
    </header>
    <PlusTable
      :data="pageRows"
      :columns="columns"
      row-key="id"
      edit-mode="cell"
      border
      :total="allRows.length"
      :page="page"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20]"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @page-change="handlePageChange"
    >
      <template #toolbar>
        <el-button type="primary" @click="addRow">新增</el-button>
        <el-button @click="removeFirstOnPage">删除当前页首行</el-button>
        <el-button @click="duplicateFirstOnPage">复制当前页首行</el-button>
        <span class="demo__meta">共 {{ allRows.length }} 行</span>
      </template>
    </PlusTable>
  </section>
</template>

<style scoped>
.demo__header {
  margin-bottom: 16px;
}

.demo__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.demo__desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.demo__meta {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
}
</style>
```

- [ ] **Step 2: `pnpm typecheck`**

Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/views/plus-table/pagination-rows-demo.vue
git commit -m "feat(plus-table): add pagination and row ops demo"
```

---

### Task 6: README + 最终验收

**Files:**

- Modify: `README.md`

- [ ] **Step 1: 更新 README 仓库结构与 PlusTable 小节**

在「仓库结构」中改为：

```
component-labs/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── router/
│   ├── layouts/
│   ├── views/plus-table/     # PlusTable 场景 demo
│   ├── components/plus-table/
│   └── composables/
├── docs/superpowers/
├── index.html
├── vite.config.ts
└── package.json
```

并补充：

```markdown
## Playground

`pnpm dev` 后访问 http://localhost:8000 。

侧栏切换 PlusTable 场景：

- `/plus-table/basic-editing`
- `/plus-table/dependencies-validation`
- `/plus-table/history-dirty`
- `/plus-table/pagination-rows`

后续 composables demo 约定路径：`/composables/<name>`（本期未注册）。
```

- [ ] **Step 2: 最终检查**

```bash
pnpm typecheck
```

Expected: 通过。

手动（`pnpm dev`）：

1. `/` 跳到基础编辑
2. 侧栏四个链接可切换且 URL 正确
3. 基础页五种编辑器可提交
4. 联动页改类别后明细选项变化；校验可失败/通过
5. 历史页 Undo/Redo、脏行数、Reset
6. 分页页翻页、增删复制、总数变化
7. 侧栏无 Composables 分组

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document playground routes"
```

---

## Spec coverage check

| Spec 要求                    | Task                     |
| ---------------------------- | ------------------------ |
| vue-router + layout + 重定向 | 1                        |
| 四条 plus-table 路由         | 1                        |
| basic-editing                | 2                        |
| dependencies-validation      | 3                        |
| history-dirty                | 4                        |
| pagination-rows（全量切片）  | 5                        |
| 无 composables 导航          | 1（layout 仅 PlusTable） |
| typecheck / 验收             | 各 task + 6              |
| README                       | 6                        |

## Plan self-review

- 无 TBD/TODO 占位
- 分页行操作不调用 `tableRef.insertRow`（避免只改当前页数组）
- `canUndo` 暴露形态以 typecheck 为准，Task 4 已注明可调整

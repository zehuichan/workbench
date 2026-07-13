# PlusTable title / summary Slots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 PlusTable 增加 `#title` / `#summary` 插槽，形成顶栏左标题+右工具区、底栏左汇总+右分页的布局壳层。

**Architecture:** 在 `table.vue` 用 `__header` / `__footer` 两个 flex 容器包裹既有 toolbar / 分页；插槽无作用域参数；`paginationRef` 挂到 `__footer`，使 adaptive 高度把整条底栏（含仅 summary）算进去。样式只加必要规则，不引入字符串 prop。

**Tech Stack:** Vue 3 `<script setup>`、Element Plus、现有 SCSS BEM、Vitest + happy-dom、`createApp` 挂载模式（与 `demo-components.test.ts` 一致）。

**Spec:** `docs/superpowers/specs/2026-07-13-plus-table-title-summary-slots-design.md`

## Global Constraints

- 不新增 `title` / `summary` 字符串 prop
- 不实现汇总计算 / 选中统计业务逻辑（插槽内容由消费方提供）
- 外科手术式修改：不顺手重构相邻逻辑
- 验证：`pnpm test` + `pnpm typecheck`

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/components/plus-table/table.vue` | `defineSlots` + header/footer 模板；`footerEnabled`；`paginationRef` → footer |
| `src/components/plus-table/styles/index.scss` | `__header` / `__title` / `__footer` / `__summary`；调整 `__toolbar` / `__pagination` |
| `src/components/plus-table/table-slots.test.ts` | 挂载测 title/summary/footer 可见性 |
| `src/views/plus-table/pagination-rows-demo.vue` | 演示两插槽 + API 表补充 |
| `src/views/demo-content.test.ts` | 同步行数与内容指纹 |

---

### Task 1: 组件插槽壳层 + 样式 + 挂载测试

**Files:**
- Create: `src/components/plus-table/table-slots.test.ts`
- Modify: `src/components/plus-table/table.vue`
- Modify: `src/components/plus-table/styles/index.scss`

**Interfaces:**
- Consumes: 现有 `paginationEnabled`（`props.total !== undefined`）、`PlusTableColumnSettings`、`ElPagination`
- Produces:
  - slots: `title?: () => unknown`、`summary?: () => unknown`（无作用域）
  - DOM: `.plus-table__header` / `__title` / `__toolbar` / `__footer` / `__summary` / `__pagination`
  - `footerEnabled = !!$slots.summary || paginationEnabled`
  - `ref="paginationRef"` 挂在 `.plus-table__footer` 上（保留字段名，避免改 tokens）

- [ ] **Step 1: Write the failing mount test**

Create `src/components/plus-table/table-slots.test.ts`:

```ts
import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./table-column-settings/index.vue', () => ({
  default: { name: 'PlusTableColumnSettings', render: () => null },
}));

vi.mock('./table-column', () => ({
  default: { name: 'PlusTableColumnNode', render: () => null },
}));

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>();
  const { defineComponent, h } = await import('vue');
  return {
    ...actual,
    ElTable: defineComponent({
      name: 'ElTable',
      setup(_, { slots }) {
        return () => h('div', { class: 'mock-el-table' }, slots.default?.());
      },
    }),
    ElPagination: defineComponent({
      name: 'ElPagination',
      setup() {
        return () => h('div', { class: 'mock-el-pagination' });
      },
    }),
  };
});

import PlusTable from './table.vue';

describe('PlusTable title / summary slots', () => {
  const mounted: Array<{ app: ReturnType<typeof createApp>; host: Element }> =
    [];

  async function mount(
    slots: Record<string, () => unknown> = {},
    props: Record<string, unknown> = {},
  ) {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () =>
        h(
          PlusTable,
          {
            data: [],
            columns: [{ prop: 'name', label: '名称' }],
            rowKey: 'id',
            ...props,
          },
          slots,
        ),
    });
    app.mount(host);
    await nextTick();
    mounted.push({ app, host });
    return host;
  }

  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
  });

  it('puts title and toolbar on one header row', async () => {
    const host = await mount({
      title: () => '任务列表',
      toolbar: () => h('button', '新增'),
    });

    const header = host.querySelector('.plus-table__header');
    expect(header).toBeTruthy();
    expect(header!.querySelector('.plus-table__title')?.textContent).toBe(
      '任务列表',
    );
    expect(header!.querySelector('.plus-table__toolbar')).toBeTruthy();
    expect(host.querySelector('.plus-table__title')?.parentElement).toBe(
      header,
    );
  });

  it('shows summary with pagination on the same footer row', async () => {
    const host = await mount(
      { summary: () => '已选 3 项' },
      { total: 20, page: 1, pageSize: 5 },
    );

    const footer = host.querySelector('.plus-table__footer');
    expect(footer).toBeTruthy();
    expect(footer!.querySelector('.plus-table__summary')?.textContent).toBe(
      '已选 3 项',
    );
    expect(footer!.querySelector('.plus-table__pagination')).toBeTruthy();
    expect(footer!.querySelector('.mock-el-pagination')).toBeTruthy();
  });

  it('shows footer with summary only when total is omitted', async () => {
    const host = await mount({ summary: () => '合计 10' });

    const footer = host.querySelector('.plus-table__footer');
    expect(footer).toBeTruthy();
    expect(footer!.querySelector('.plus-table__summary')?.textContent).toBe(
      '合计 10',
    );
    expect(footer!.querySelector('.plus-table__pagination')).toBeNull();
  });

  it('hides title / summary wrappers when slots are absent', async () => {
    const host = await mount({}, { total: 10 });

    expect(host.querySelector('.plus-table__title')).toBeNull();
    expect(host.querySelector('.plus-table__summary')).toBeNull();
    expect(host.querySelector('.plus-table__footer')).toBeTruthy();
    expect(host.querySelector('.plus-table__pagination')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --environment happy-dom src/components/plus-table/table-slots.test.ts`

Expected: FAIL（缺少 `.plus-table__header` / `__footer` 结构，或 title 不在 header 内）

- [ ] **Step 3: Update `defineSlots` and template in `table.vue`**

In script, extend `defineSlots` and add `footerEnabled`:

```ts
defineSlots<{
  title?: () => unknown;
  summary?: () => unknown;
  toolbar?: () => unknown;
  empty?: () => unknown;
  [key: `cell-${string}`]: (props: CellContext<T>) => unknown;
  [key: `header-${string}`]: (props: HeaderSlotProps<T>) => unknown;
  [key: `editor-${string}`]: (props: EditorSlotProps<T>) => unknown;
}>();
```

After `paginationEnabled`:

```ts
const footerEnabled = computed(
  () => !!slots.summary || paginationEnabled.value,
);
```

Replace the root template body (inside `.plus-table`) with:

```vue
<div class="plus-table__header">
  <div v-if="$slots.title" class="plus-table__title">
    <slot name="title" />
  </div>
  <div class="plus-table__toolbar">
    <slot name="toolbar" />
    <PlusTableColumnSettings />
  </div>
</div>

<div
  ref="gridRef"
  class="plus-table__grid"
  tabindex="0"
  :aria-describedby="ids.description"
  :aria-activedescendant="activeCellId"
  @keydown="keyboard.handleKeydown"
>
  <!-- 既有 description + el-table 保持不变 -->
</div>

<div
  v-if="footerEnabled"
  ref="paginationRef"
  class="plus-table__footer"
>
  <div v-if="$slots.summary" class="plus-table__summary">
    <slot name="summary" />
  </div>
  <div v-if="paginationEnabled" class="plus-table__pagination">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :current-page="page"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      @update:current-page="events.handlePageChange"
      @update:page-size="events.handlePageSizeChange"
    />
  </div>
</div>
```

Keep the existing `el-table` / `PlusTableColumnNode` / `#empty` block unchanged inside `__grid`.

- [ ] **Step 4: Update styles in `styles/index.scss`**

Replace the existing `&__toolbar` / `&__pagination` block under `.plus-table` with:

```scss
&__header,
&__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

&__header {
  margin-bottom: 8px;
}

&__footer {
  margin-top: 8px;
}

&__title,
&__summary {
  min-width: 0;
  margin-right: auto;
}

&__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

&__pagination {
  margin-left: auto;
}
```

Remove the old `&__toolbar { ... margin-bottom: 8px; }` and `&__pagination { display: flex; justify-content: flex-end; }` rules so spacing lives on header/footer.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run --environment happy-dom src/components/plus-table/table-slots.test.ts`

Expected: PASS（4 tests）

Also run: `pnpm typecheck`

Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add src/components/plus-table/table.vue \
  src/components/plus-table/styles/index.scss \
  src/components/plus-table/table-slots.test.ts
git commit -m "$(cat <<'EOF'
feat(plus-table): add title and summary layout slots

EOF
)"
```

---

### Task 2: 分页 demo 演示插槽 + content contract

**Files:**
- Modify: `src/views/plus-table/pagination-rows-demo.vue`
- Modify: `src/views/demo-content.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `#title` / `#summary` 插槽
- Produces: demo 源码含 `#title`、`#summary`；API 表增加 Slots 小节；`demo-content.test.ts` 指纹同步

- [ ] **Step 1: Update `pagination-rows-demo.vue` API section**

After the existing Expose `DemoApiTable`（行操作那张表），追加：

```vue
<DemoApiTable title="Slots" :headers="['名称', '说明']">
  <tr>
    <td><code>#title</code></td>
    <td>顶栏左侧标题区，与 toolbar / 列设置同一行。</td>
  </tr>
  <tr>
    <td><code>#summary</code></td>
    <td>
      底栏左侧汇总区；有分页时与分页同一行，无
      <code>total</code> 时仍可单独显示。
    </td>
  </tr>
</DemoApiTable>
```

- [ ] **Step 2: Wire slots in the demo `PlusTable`**

Inside the existing `<PlusTable ...>`，在 `#toolbar` 旁增加：

```vue
<template #title>任务列表</template>
<template #summary>
  <span class="demo__meta">当前页 {{ pageRows.length }} 条</span>
</template>
```

Keep existing `#toolbar` content as-is（可保留「共 N 行」在 toolbar，或挪到 summary；推荐：toolbar 只留按钮，把「共 {{ allRows.length }} 行」挪到 `#summary`，与 title 分工清晰）：

```vue
<template #title>任务列表</template>
<template #toolbar>
  <el-button type="primary" @click="addRow">新增</el-button>
  <el-button @click="removeFirstOnPage">删除当前页首行</el-button>
  <el-button @click="duplicateFirstOnPage">复制当前页首行</el-button>
</template>
<template #summary>
  <span class="demo__meta">共 {{ allRows.length }} 行 · 当前页 {{ pageRows.length }} 条</span>
</template>
```

- [ ] **Step 3: Sync `demo-content.test.ts`**

Update the `pagination-rows` entry:

```ts
{
  path: './plus-table/pagination-rows-demo.vue',
  source: paginationRows,
  sections: 4,
  rows: 12,
  content: ['PlusTable Props（分页）', 'Events', 'Slots', '#title', '#summary'],
},
```

说明：原 `sections: 3`、`rows: 10`；新增一张 2 行的 Slots 表 → `sections: 4`、`rows: 12`。原指纹 `allRows` 若仍出现在 summary 文案中可保留，否则用上面 `content` 列表替换。

- [ ] **Step 4: Run verification**

Run:

```bash
pnpm exec vitest run --environment happy-dom src/views/demo-content.test.ts src/components/plus-table/table-slots.test.ts
pnpm typecheck
```

Expected: all PASS / exit 0

- [ ] **Step 5: Commit**

```bash
git add src/views/plus-table/pagination-rows-demo.vue src/views/demo-content.test.ts
git commit -m "$(cat <<'EOF'
docs(plus-table): demo title and summary slots

EOF
)"
```

---

## Spec coverage (self-review)

| Spec 要求 | Task |
|-----------|------|
| title 与 toolbar 同一行 | Task 1 template `__header` |
| summary 可与分页同行；无 total 仍可显示 | Task 1 `footerEnabled` + tests |
| `defineSlots` 声明 | Task 1 |
| header/footer flex 样式 | Task 1 SCSS |
| 无字符串 prop | Global Constraints；未改 `defaults.ts` |
| pagination demo + API | Task 2 |
| content contract | Task 2 |
| `paginationRef` 与 adaptive | Task 1 挂到 `__footer` |

无 TBD / 占位步骤；插槽与 DOM class 名前后一致。

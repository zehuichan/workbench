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


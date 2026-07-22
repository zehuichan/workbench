# PlusTable API Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PlusTable playground 增设纯文档「API Overview」页，汇总完整公开 API，并纳入 `demo-content` 合同测试。

**Architecture:** 新增 `api-overview-demo.vue`（`DemoPage` + 11 张 `DemoApiTable`，无表格实例）；在 `router/index.ts` 以 `order: 0` 注册；扩展 `demo-content.test.ts` 支持 docs-only 页（不要求 `#hint`）。文案以类型定义与现有场景页为准。

**Tech Stack:** Vue 3.5、vue-router 5、现有 `@/components/demo/*`、Vitest、TypeScript。

**Spec:** `docs/superpowers/specs/2026-07-18-plus-table-api-overview-design.md`

## Global Constraints

- 不修改 `src/components/plus-table/**` 组件实现
- 不抽共享 API 文案模块；场景页「本页用到」API 保留不动
- `/` 默认重定向仍为 `/plus-table/basic-editing`
- Overview 页禁止出现 `DemoBlock`、`PlusTable`、`#hint`
- `DemoApiTable` 恰好 11 张，标题与顺序见 Task 2

---

## File Structure

| 路径                                         | 职责                                          |
| -------------------------------------------- | --------------------------------------------- |
| `src/views/plus-table/api-overview-demo.vue` | 新建：完整 API 参考页                         |
| `src/router/index.ts`                        | 注册 `/plus-table/api-overview`（`order: 0`） |
| `src/views/demo-content.test.ts`             | 扩展 docs-only 合同 + Overview case           |

---

### Task 1: 扩展合同测试（先红）

**Files:**

- Create: `src/views/plus-table/api-overview-demo.vue`（最小可导入桩）
- Modify: `src/views/demo-content.test.ts`

**Interfaces:**

- Consumes: 现有 `demos` 数组形状
- Produces: `docsOnly?: boolean`；Overview 条目期望 `sections: 11`、`rows: 64`

- [ ] **Step 1: 创建最小桩文件（让 `?raw` 导入可解析）**

Create `src/views/plus-table/api-overview-demo.vue`:

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'ApiOverviewDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>stub</template>
    <template #api>
      <DemoApiTable title="Props">
        <tr>
          <td><code>data</code></td>
          <td><code>T[]</code></td>
          <td>stub</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
```

- [ ] **Step 2: 更新 `demo-content.test.ts`**

将文件改为（完整替换）：

```ts
import { describe, expect, it } from 'vitest';
import autoSave from './composables/use-auto-save-demo.vue?raw';
import formDraft from './composables/use-form-draft-demo.vue?raw';
import saveHotkey from './composables/use-save-hotkey-demo.vue?raw';
import apiOverview from './plus-table/api-overview-demo.vue?raw';
import basicEditing from './plus-table/basic-editing-demo.vue?raw';
import dependenciesValidation from './plus-table/dependencies-validation-demo.vue?raw';
import historyDirty from './plus-table/history-dirty-demo.vue?raw';
import paginationRows from './plus-table/pagination-rows-demo.vue?raw';

const demos = [
  {
    path: './plus-table/api-overview-demo.vue',
    source: apiOverview,
    sections: 11,
    rows: 64,
    docsOnly: true,
    content: [
      'Props',
      'Events',
      'Slots',
      'Expose · 校验',
      'dependencies',
      'setActiveCell',
      'v-model:data',
    ],
  },
  {
    path: './plus-table/basic-editing-demo.vue',
    source: basicEditing,
    sections: 2,
    rows: 8,
    content: ['PlusTable Props（本页用到）', 'Column 关键字段', '方向键移动'],
  },
  {
    path: './plus-table/dependencies-validation-demo.vue',
    source: dependenciesValidation,
    sections: 3,
    rows: 10,
    content: ['Column 校验 / 联动', 'dependencies', 'clearValidate'],
  },
  {
    path: './plus-table/history-dirty-demo.vue',
    source: historyDirty,
    sections: 3,
    rows: 10,
    content: ['Expose（历史）', 'Expose（脏追踪）', 'Reset tracking'],
  },
  {
    path: './plus-table/pagination-rows-demo.vue',
    source: paginationRows,
    sections: 4,
    rows: 12,
    content: ['PlusTable Props（分页）', 'Events', 'Slots', '#title', '#summary'],
  },
  {
    path: './composables/use-auto-save-demo.vue',
    source: autoSave,
    sections: 2,
    rows: 11,
    content: ['useFormDraft', 'withPaused', 'localStorage'],
  },
  {
    path: './composables/use-form-draft-demo.vue',
    source: formDraft,
    sections: 2,
    rows: 12,
    content: ['恢复必须显式调用', 'Restore', 'DRAFT_KEY'],
  },
  {
    path: './composables/use-save-hotkey-demo.vue',
    source: saveHotkey,
    sections: 2,
    rows: 5,
    content: ['Ctrl/Cmd+S', 'SaveHotkeyDialogPanel', 'onDeactivated'],
  },
] as const;

describe('demo content contracts', () => {
  it.each(demos)(
    'preserves API and description content in $path',
    ({ sections, rows, content, source, ...rest }) => {
      const docsOnly = 'docsOnly' in rest && rest.docsOnly;
      expect(source.match(/<DemoApiTable\b/g)).toHaveLength(sections);
      expect(source.match(/<tr>/g)).toHaveLength(rows);
      expect(source).toContain('<template #description>');
      expect(source).toContain('<template #api>');
      if (docsOnly) {
        expect(source).not.toContain('<template #hint>');
        expect(source).not.toContain('<DemoBlock');
        expect(source).not.toContain('<PlusTable');
      } else {
        expect(source).toContain('<template #hint>');
      }
      for (const fingerprint of content) expect(source).toContain(fingerprint);
    },
  );
});
```

- [ ] **Step 3: 跑测试确认 Overview case 失败**

Run:

```bash
pnpm test src/views/demo-content.test.ts
```

Expected: FAIL — Overview 的 `DemoApiTable` 数量为 1，不是 11（或 rows 不是 62）。

- [ ] **Step 4: Commit**

```bash
git add src/views/plus-table/api-overview-demo.vue src/views/demo-content.test.ts
git commit -m "$(cat <<'EOF'
test(plus-table): add failing API Overview demo content contract

EOF
)"
```

---

### Task 2: 实现完整 API Overview 页

**Files:**

- Modify: `src/views/plus-table/api-overview-demo.vue`（完整替换）

**Interfaces:**

- Consumes: `DemoPage`、`DemoApiTable`；类型真相见 `table/defaults.ts`、`table.vue`、`table-column/defaults.ts`
- Produces: 11 张表、恰好 64 个 `<tr>`；无 `DemoBlock` / `PlusTable` / `#hint`

- [ ] **Step 1: 用下列完整内容替换 `api-overview-demo.vue`**

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'ApiOverviewDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      PlusTable 完整公开 API 参考。交互与场景说明见侧栏其它 demo。未列出的
      <code>el-table</code> 属性经 <code>$attrs</code> 透传；列上 <code>width</code> /
      <code>align</code> / <code>fixed</code> / <code>sortable</code> / <code>formatter</code> 等
      <code>el-table-column</code> 字段可直通。
    </template>

    <template #api>
      <DemoApiTable title="Props">
        <tr>
          <td><code>data</code> / <code>v-model:data</code></td>
          <td><code>T[]</code></td>
          <td>必填。表格数据；编辑经 <code>update:data</code> 回写。</td>
        </tr>
        <tr>
          <td><code>columns</code></td>
          <td><code>PlusTableColumnDef[]</code></td>
          <td>必填。列配置（可字面量，无需显式标注泛型）。</td>
        </tr>
        <tr>
          <td><code>row-key</code></td>
          <td><code>keyof T | (row) =&gt; string | number</code></td>
          <td>必填。行唯一标识；函数须纯且仅从行字段派生。</td>
        </tr>
        <tr>
          <td><code>mode</code></td>
          <td><code>'none' | 'cell' | 'row' | 'table'</code></td>
          <td>默认 <code>cell</code>。编辑模式。</td>
        </tr>
        <tr>
          <td><code>validate-event</code></td>
          <td><code>boolean</code></td>
          <td>默认 <code>true</code>。为 false 时仅 <code>ref.validate()</code> 触发校验。</td>
        </tr>
        <tr>
          <td><code>cache</code></td>
          <td><code>boolean</code></td>
          <td>
            默认 <code>false</code>。缓存列设置（显隐 / 顺序 / 列宽）；为 true 时需同时传
            <code>id</code>。
          </td>
        </tr>
        <tr>
          <td><code>id</code></td>
          <td><code>string</code></td>
          <td>列设置缓存标识；多实例需各自唯一。</td>
        </tr>
        <tr>
          <td><code>adaptive</code></td>
          <td><code>boolean | AdaptiveConfig</code></td>
          <td>
            默认 <code>false</code>。自适应高度；可配
            <code>mode: 'viewport' | 'container'</code> 等。
          </td>
        </tr>
        <tr>
          <td><code>total</code></td>
          <td><code>number</code></td>
          <td>传入即启用分页 UI；组件不切片，由业务提供当前页 data。</td>
        </tr>
        <tr>
          <td><code>page</code> / <code>v-model:page</code></td>
          <td><code>number</code></td>
          <td>默认 <code>1</code>。当前页。</td>
        </tr>
        <tr>
          <td><code>page-size</code> / <code>v-model:pageSize</code></td>
          <td><code>number</code></td>
          <td>默认 <code>20</code>。每页条数。</td>
        </tr>
        <tr>
          <td><code>page-sizes</code></td>
          <td><code>number[]</code></td>
          <td>默认 <code>[10, 20, 50, 100]</code>。</td>
        </tr>
        <tr>
          <td><code>history</code></td>
          <td><code>boolean</code></td>
          <td>默认 <code>false</code>。单元格变更撤销 / 重做。</td>
        </tr>
        <tr>
          <td><code>dirty-tracking</code></td>
          <td><code>boolean</code></td>
          <td>默认 <code>false</code>。脏行 / 脏格追踪。</td>
        </tr>
        <tr>
          <td><code>hotkeys</code></td>
          <td><code>HotkeyBinding[]</code></td>
          <td>自定义热键绑定（不影响内置方向键导航）。</td>
        </tr>
        <tr>
          <td><code>hotkey-enabled</code></td>
          <td><code>boolean</code></td>
          <td>默认 <code>true</code>。自定义热键总开关。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Events" :headers="['名称', '载荷', '说明']">
        <tr>
          <td><code>update:data</code></td>
          <td><code>T[]</code></td>
          <td>数据变更回写（配合 <code>v-model:data</code>）。</td>
        </tr>
        <tr>
          <td><code>cell-change</code></td>
          <td><code>{ row, rowIndex, prop, value, oldValue }</code></td>
          <td>单个单元格值变更。</td>
        </tr>
        <tr>
          <td><code>update:page</code> / <code>update:pageSize</code></td>
          <td><code>number</code></td>
          <td>分页控件变更。</td>
        </tr>
        <tr>
          <td><code>page-change</code></td>
          <td><code>{ page, pageSize }</code></td>
          <td>页码或 pageSize 变化时一并抛出，便于拉数。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Slots" :headers="['名称', '说明']">
        <tr>
          <td><code>#title</code></td>
          <td>顶栏左侧标题区，与 toolbar / 列设置同一行。</td>
        </tr>
        <tr>
          <td><code>#toolbar</code></td>
          <td>顶栏工具区（列设置按钮在其右侧）。</td>
        </tr>
        <tr>
          <td><code>#summary</code></td>
          <td>
            底栏左侧汇总；有分页时与分页同行，无
            <code>total</code> 时仍可单独显示。
          </td>
        </tr>
        <tr>
          <td><code>#empty</code></td>
          <td>透传到底层 <code>el-table</code> 空状态。</td>
        </tr>
        <tr>
          <td><code>#cell-&#123;prop&#125;</code></td>
          <td>展示态单元格插槽；参数为 <code>CellContext</code>。</td>
        </tr>
        <tr>
          <td><code>#header-&#123;prop&#125;</code></td>
          <td>表头插槽；参数为 <code>{ column }</code>。</td>
        </tr>
        <tr>
          <td><code>#editor-&#123;prop&#125;</code></td>
          <td>
            编辑态插槽；参数含
            <code>value</code> / <code>setValue</code> / <code>commit</code> / <code>cancel</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 校验">
        <tr>
          <td><code>validate</code></td>
          <td><code>() =&gt; Promise&lt;ValidateResult&gt;</code></td>
          <td>全表校验；返回 <code>{ valid, errors }</code>。</td>
        </tr>
        <tr>
          <td><code>clearValidate</code></td>
          <td><code>() =&gt; void</code></td>
          <td>清空当前校验错误。</td>
        </tr>
        <tr>
          <td><code>getErrors</code></td>
          <td><code>() =&gt; CellError[]</code></td>
          <td>读取当前错误列表。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 行操作" :headers="['名称', '说明']">
        <tr>
          <td><code>insertRow(row, index?)</code></td>
          <td>插入行并 <code>update:data</code>。</td>
        </tr>
        <tr>
          <td><code>removeRow(index)</code></td>
          <td>按当前 <code>data</code> 下标删除。</td>
        </tr>
        <tr>
          <td><code>moveRow(from, to)</code></td>
          <td>移动行。</td>
        </tr>
        <tr>
          <td><code>duplicateRow(index, patch)</code></td>
          <td>复制行；须用 <code>patch</code> 覆盖新 <code>rowKey</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 编辑">
        <tr>
          <td><code>startEdit</code> / <code>cancelEdit</code></td>
          <td><code>() =&gt; void</code></td>
          <td>cell 模式：对活动格进编 / 取消。</td>
        </tr>
        <tr>
          <td>
            <code>startRowEdit</code> / <code>commitRowEdit</code> /
            <code>cancelRowEdit</code>
          </td>
          <td>行编辑 API</td>
          <td>row 模式：开始 / 提交 / 取消整行编辑。</td>
        </tr>
        <tr>
          <td><code>setActiveCell</code></td>
          <td>定位活动格</td>
          <td>设置当前活动单元格（不必然进入编辑态）。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 列设置">
        <tr>
          <td><code>resetColumnSettings</code></td>
          <td><code>() =&gt; void</code></td>
          <td>重置列显隐 / 顺序 / 列宽（含缓存）。</td>
        </tr>
        <tr>
          <td><code>setColumnWidth</code></td>
          <td><code>(prop, width) =&gt; void</code></td>
          <td>设置列宽。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 历史">
        <tr>
          <td><code>undo</code> / <code>redo</code></td>
          <td><code>() =&gt; AppliedChange[]</code></td>
          <td>撤销 / 重做；关闭 history 时为空操作。</td>
        </tr>
        <tr>
          <td><code>canUndo</code> / <code>canRedo</code></td>
          <td><code>ComputedRef&lt;boolean&gt;</code></td>
          <td>是否可撤销 / 重做。</td>
        </tr>
        <tr>
          <td><code>clearHistory</code></td>
          <td><code>() =&gt; void</code></td>
          <td>清空撤销重做栈。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Expose · 脏追踪">
        <tr>
          <td><code>getModifiedRows</code></td>
          <td><code>() =&gt; T[]</code></td>
          <td>当前有脏格的行。</td>
        </tr>
        <tr>
          <td><code>getDirtyCells</code></td>
          <td><code>() =&gt; DirtyCell[]</code></td>
          <td>
            每项为
            <code>{ rowKey: string; prop: string }</code>。
          </td>
        </tr>
        <tr>
          <td><code>isCellDirty</code> / <code>isRowDirty</code></td>
          <td>谓词</td>
          <td>判断单格 / 整行是否脏。</td>
        </tr>
        <tr>
          <td><code>resetTracking</code></td>
          <td><code>() =&gt; void</code></td>
          <td>以当前 data 为新基线并清空脏标记。</td>
        </tr>
        <tr>
          <td><code>clearDirty</code></td>
          <td><code>(rowKey?, prop?) =&gt; void</code></td>
          <td>按范围清除脏标记（不改数据）。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Column">
        <tr>
          <td><code>prop</code></td>
          <td><code>keyof T &amp; string</code></td>
          <td>字段名；特殊列可省略，改用 <code>type</code>。</td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td>
            <code>'index' | 'selection' | 'expand' | 'operation'</code>
          </td>
          <td>特殊列类型；前三者走 el-table 原生渲染。</td>
        </tr>
        <tr>
          <td><code>editable</code></td>
          <td><code>boolean | (ctx) =&gt; boolean</code></td>
          <td>是否可编辑。</td>
        </tr>
        <tr>
          <td><code>component</code></td>
          <td><code>BuiltinEditorType | Component</code></td>
          <td>
            编辑控件。内置：<code>input</code> / <code>textarea</code> / <code>input-number</code> /
            <code>select</code> / <code>date-picker</code> / <code>time-picker</code> /
            <code>switch</code> / <code>checkbox</code>。
          </td>
        </tr>
        <tr>
          <td><code>componentProps</code></td>
          <td><code>object | (ctx) =&gt; object</code></td>
          <td>透传编辑器 props；可被 dependencies 同名项覆盖。</td>
        </tr>
        <tr>
          <td><code>modelProp</code></td>
          <td><code>string</code></td>
          <td>自定义组件 v-model prop 名，默认 <code>modelValue</code>。</td>
        </tr>
        <tr>
          <td><code>required</code></td>
          <td><code>boolean</code></td>
          <td>静态必填。</td>
        </tr>
        <tr>
          <td><code>rules</code></td>
          <td><code>RuleItem[]</code></td>
          <td>async-validator 规则；与联动动态 rules 合并。</td>
        </tr>
        <tr>
          <td><code>render</code></td>
          <td><code>(ctx) =&gt; VNodeChild</code></td>
          <td>展示态自定义渲染，优先级高于 formatter。</td>
        </tr>
        <tr>
          <td><code>visible</code></td>
          <td><code>boolean</code></td>
          <td>初始是否可见（列设置）。</td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td><code>PlusTableColumn[]</code></td>
          <td>多级表头；组节点通常只需 <code>label</code>。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="dependencies">
        <tr>
          <td><code>triggerFields</code></td>
          <td><code>string[]</code></td>
          <td>必填。这些字段变更时跑 <code>trigger</code> 副作用。</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>(row, api) =&gt; boolean</code></td>
          <td>可选。动态禁用本格编辑。</td>
        </tr>
        <tr>
          <td><code>required</code></td>
          <td><code>(row, api) =&gt; boolean</code></td>
          <td>可选。动态必填。</td>
        </tr>
        <tr>
          <td><code>rules</code></td>
          <td><code>(row, api) =&gt; CellRule[] | null</code></td>
          <td>可选。动态规则，与列静态 rules 合并。</td>
        </tr>
        <tr>
          <td><code>componentProps</code></td>
          <td><code>(row, api) =&gt; Record</code></td>
          <td>可选。动态编辑器 props（如下拉 options）。</td>
        </tr>
        <tr>
          <td><code>trigger</code></td>
          <td><code>(row, api) =&gt; void</code></td>
          <td>
            可选。副作用；用
            <code>api.setValue(prop, value)</code> 改同行其他字段。
          </td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
```

行数：Props 16 + Events 4 + Slots 7 + 校验 3 + 行操作 4 + 编辑 3 + 列设置 2 + 历史 3 + 脏追踪 5 + Column 11 + dependencies 6 = **64**。

- [ ] **Step 2: 核对行数与表数**

Run:

```bash
rg -c '<tr>' src/views/plus-table/api-overview-demo.vue
rg -c '<DemoApiTable\b' src/views/plus-table/api-overview-demo.vue
```

Expected: `64` 与 `11`。若粘贴后数字不符，先修页面再改测试期望，保持二者一致。

- [ ] **Step 3: 跑测试确认通过**

Run:

```bash
pnpm test src/views/demo-content.test.ts
```

Expected: PASS（全部 demo content contracts）。

- [ ] **Step 4: Commit**

```bash
git add src/views/plus-table/api-overview-demo.vue src/views/demo-content.test.ts
git commit -m "$(cat <<'EOF'
feat(plus-table): add API Overview demo page with full public API tables

EOF
)"
```

---

### Task 3: 注册路由

**Files:**

- Modify: `src/router/index.ts`

**Interfaces:**

- Consumes: `ApiOverviewDemo` 默认导出
- Produces: 路由 `plus-table/api-overview`，`meta.order: 0`，标题 `API Overview`

- [ ] **Step 1: 在 `src/router/index.ts` 增加 import 与路由**

在其它 plus-table import 旁增加：

```ts
import ApiOverviewDemo from '@/views/plus-table/api-overview-demo.vue';
```

在 `plus-table/basic-editing` 路由**之前**插入：

```ts
{
  path: 'plus-table/api-overview',
  name: 'plus-table-api-overview',
  component: ApiOverviewDemo,
  meta: { title: 'API Overview', group: 'PlusTable', order: 0 },
},
```

保持：

```ts
{ path: '', redirect: '/plus-table/basic-editing' },
```

不要改默认重定向。

- [ ] **Step 2: typecheck**

Run:

```bash
pnpm typecheck
```

Expected: 无错误退出。

- [ ] **Step 3: 再跑合同测试**

Run:

```bash
pnpm test src/views/demo-content.test.ts
```

Expected: PASS。

- [ ] **Step 4: 手动抽查（可选但建议）**

Run `pnpm dev`，确认：

1. 侧栏 PlusTable 第一项为「API Overview」
2. 打开 `/` 仍落在「基础编辑」
3. Overview 页只有 API 表、无表格

- [ ] **Step 5: Commit**

```bash
git add src/router/index.ts
git commit -m "$(cat <<'EOF'
feat(plus-table): register API Overview route as first nav item

EOF
)"
```

---

## Spec Coverage Checklist

| Spec 要求                                      | Task     |
| ---------------------------------------------- | -------- |
| `/plus-table/api-overview` + `ApiOverviewDemo` | 2, 3     |
| `order: 0`，默认重定向不变                     | 3        |
| 纯文档、11 张表、完整公开面                    | 2        |
| 场景页 API 不动、不改组件源码                  | 全局约束 |
| `demo-content` 合同（含 docs-only）            | 1, 2     |
| 验收：侧栏第一项 / 无表格实例 / 测试过         | 2, 3     |

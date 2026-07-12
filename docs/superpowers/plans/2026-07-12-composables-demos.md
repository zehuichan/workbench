# Composables Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 playground 侧栏增加 Composables 分组，并实现 `useAutoSave` / `useFormDraft` / `useSaveHotkey` 三个场景 demo 页。

**Architecture:** 延续现有 `PlaygroundLayout` + vue-router；`src/views/composables/*-demo.vue` 各页自包含 el-form；热键嵌套用同文件子组件保证组件树深度优先。

**Tech Stack:** Vue 3.5、vue-router、Element Plus、`@/composables`、Vite、TypeScript。

**Spec:** `docs/superpowers/specs/2026-07-12-composables-demos-design.md`

**验证约定:** 无 demo 单测；每任务用 `pnpm typecheck` 验证。

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/layouts/playground-layout.vue` | 增加 Composables 侧栏分组 |
| `src/router/index.ts` | 注册三条 `/composables/...` 路由 |
| `src/views/composables/use-auto-save-demo.vue` | 自动保存场景 |
| `src/views/composables/use-form-draft-demo.vue` | localStorage 草稿场景 |
| `src/views/composables/use-save-hotkey-demo.vue` | Ctrl/Cmd+S 主页 |
| `src/views/composables/save-hotkey-dialog-panel.vue` | 对话框内嵌套热键（更深优先） |

---

### Task 1: 路由 + 侧栏

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layouts/playground-layout.vue`
- Create: 三个 demo 文件的空壳（可在本任务只加路由占位，或与 Task 2–4 一并创建完整页）

- [ ] **Step 1: 扩展 router**

在 `src/router/index.ts` 增加 imports 与 children：

```ts
import UseAutoSaveDemo from '@/views/composables/use-auto-save-demo.vue';
import UseFormDraftDemo from '@/views/composables/use-form-draft-demo.vue';
import UseSaveHotkeyDemo from '@/views/composables/use-save-hotkey-demo.vue';

// children 内追加：
{
  path: 'composables/use-auto-save',
  name: 'composables-use-auto-save',
  component: UseAutoSaveDemo,
  meta: { title: 'useAutoSave', group: 'Composables' },
},
{
  path: 'composables/use-form-draft',
  name: 'composables-use-form-draft',
  component: UseFormDraftDemo,
  meta: { title: 'useFormDraft', group: 'Composables' },
},
{
  path: 'composables/use-save-hotkey',
  name: 'composables-use-save-hotkey',
  component: UseSaveHotkeyDemo,
  meta: { title: 'useSaveHotkey', group: 'Composables' },
},
```

- [ ] **Step 2: 扩展 layout 侧栏**

在 `playground-layout.vue` 增加：

```ts
const composablesLinks = [
  { to: '/composables/use-auto-save', label: 'useAutoSave' },
  { to: '/composables/use-form-draft', label: 'useFormDraft' },
  { to: '/composables/use-save-hotkey', label: 'useSaveHotkey' },
] as const;
```

模板中 PlusTable 分组后再加一组「Composables」，结构同 PlusTable（`playground__group` + `router-link`）。

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts src/layouts/playground-layout.vue
git commit -m "feat(playground): add composables nav and routes"
```

（若 demo 文件尚未创建，本 commit 与 Task 2–4 合并亦可。）

---

### Task 2: use-auto-save-demo

**Files:**
- Create: `src/views/composables/use-auto-save-demo.vue`

- [ ] **Step 1: 实现页面**

要点：
- `form = ref({ title, note })` 作为 `source`
- `serverSnapshot = ref(...)`；`save` 内 `await delay(400)` 后 `structuredClone` 写入 snapshot
- `enabled`、`debounceMs`（500 | 1500）为 ref，传给 `useAutoSave`
- 展示 `status` / `lastSavedAt` / `error`
- 按钮：Flush、`withPaused`（暂停内改 `form` 后退出，期间不应自动保存）
- 页头说明 + 服务端快照 JSON 预览
- 样式对齐 `basic-editing-demo` 的 `.demo` / `.demo__header`

完整脚本骨架：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElSwitch,
} from 'element-plus';
import { useAutoSave } from '@/composables';

defineOptions({ name: 'UseAutoSaveDemo' });

interface FormState {
  title: string;
  note: string;
}

const form = ref<FormState>({ title: '草稿标题', note: '' });
const serverSnapshot = ref<FormState | null>(null);
const enabled = ref(true);
const debounceMs = ref(500);

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const { status, lastSavedAt, error, flush, withPaused } = useAutoSave({
  source: form,
  enabled,
  debounceMs,
  save: async (value) => {
    await delay(400);
    serverSnapshot.value = structuredClone(value);
  },
});

async function handleFlush() {
  await flush();
}

async function handlePausedEdit() {
  await withPaused(async () => {
    form.value = {
      ...form.value,
      note: `${form.value.note}[paused]`,
    };
    await delay(300);
  });
}
</script>
```

模板：表单字段 + 控制条 + status 文案 + `<pre>` 快照。

- [ ] **Step 2: typecheck**

```bash
pnpm typecheck
```

Expected: 通过（可与后续页一并跑）。

---

### Task 3: use-form-draft-demo

**Files:**
- Create: `src/views/composables/use-form-draft-demo.vue`

- [ ] **Step 1: 实现页面**

要点：
- `DRAFT_KEY = 'composables-demo:form-draft'`
- `defaults = { name: '', email: '', remark: '' }`
- `form = ref({ ...defaults })`
- `useFormDraft({ form, key: DRAFT_KEY, enabled, defaults, debounceMs: 500 })`
- 按钮：Restore / Clear / Flush；展示 `isPending` / `error`
- 说明：刷新后需手动点 Restore

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElMessage,
} from 'element-plus';
import { useFormDraft } from '@/composables';

defineOptions({ name: 'UseFormDraftDemo' });

const DRAFT_KEY = 'composables-demo:form-draft';

interface FormState {
  name: string;
  email: string;
  remark: string;
}

const defaults: FormState = { name: '', email: '', remark: '' };
const form = ref<FormState>({ ...defaults });
const enabled = ref(true);

const { error, isPending, restore, clear, flush } = useFormDraft({
  form,
  key: DRAFT_KEY,
  enabled,
  defaults,
  debounceMs: 500,
});

function handleRestore() {
  const ok = restore();
  ElMessage[ok ? 'success' : 'info'](ok ? '已恢复草稿' : '无草稿可恢复');
}

function handleClear() {
  clear();
  ElMessage.success('已清除草稿');
}

function handleFlush() {
  const ok = flush();
  ElMessage[ok ? 'success' : 'warning'](ok ? '已立即写入' : '未写入');
}
</script>
```

---

### Task 4: use-save-hotkey-demo

**Files:**
- Create: `src/views/composables/use-save-hotkey-demo.vue`

- [ ] **Step 1: 实现页面（含子组件）**

要点：
- 父组件：`enabled` / `active` 开关；`saveCount`；`useSaveHotkey({ handler, enabled, active })`；保存按钮与热键同一 handler（`ElMessage` + 计数）
- 对话框：独立子组件 `save-hotkey-dialog-panel.vue` 内再 `useSaveHotkey`，保证树深度 > 父级
- 打开 `el-dialog` 时挂载子组件；关闭后回到主 handler

- [ ] **Step 2: 全量 typecheck**

```bash
pnpm typecheck
```

Expected: exit 0。

- [ ] **Step 3: 手动验收（对照 spec）**

1. 侧栏 Composables 三路由可切换  
2. auto-save：编辑后 status 变化；Flush / withPaused / enabled 可观察  
3. form-draft：Flush 后刷新，Restore 能回填；Clear 后 Restore 提示无草稿  
4. save-hotkey：主页面与对话框 Ctrl/Cmd+S 分别计数；enabled/active 关闭后主热键不响应  

- [ ] **Step 4: Commit**

```bash
git add src/views/composables src/router/index.ts src/layouts/playground-layout.vue
git commit -m "feat(playground): add composables demos"
```

---

## Spec Coverage

| Spec 项 | Task |
|---------|------|
| 三条路由 + 侧栏分组 | 1 |
| use-auto-save 场景 | 2 |
| use-form-draft 场景 | 3 |
| use-save-hotkey + dialog 优先 | 4 |
| typecheck | 2–4 |
| 不做真实后端 / PlusTable / 测试 / shell | 全程遵守 |

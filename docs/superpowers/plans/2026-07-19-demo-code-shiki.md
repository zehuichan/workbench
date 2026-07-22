# DemoCode (Shiki) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `DemoCode` 组件（Shiki 高亮 + 行号 + 复制），并接入 `useAuth` / `useWeixin` 文档页。

**Architecture:** `demo-highlighter.ts` 持有 `createHighlighter` 单例并导出 `highlightCode`；`demo-code.vue` 负责工具栏 / 复制 / `v-html`；行号用 CSS counter 画在 `.line` 上。首批只替换两个微信 composable 文档页的裸 `<pre>`。

**Tech Stack:** Vue 3.5、TypeScript、Shiki、Element Plus（复制按钮）、Vitest + happy-dom、现有 demo SCSS tokens。

**Spec:** `docs/superpowers/specs/2026-07-19-demo-code-shiki-design.md`

## Global Constraints

- 高亮库只用 `shiki`；主题仅 `github-light`
- 行号用 Shiki `.line` + CSS `counter`，不引入额外行号库
- 复制用 `navigator.clipboard.writeText`；无暗色主题切换
- 不触发真实微信授权 / JSSDK；文档页仍为静态代码展示
- 包管理器用 `pnpm`；验证用仓库 scripts（`pnpm test` / `pnpm typecheck`）

---

## File Structure

| 路径                                          | 职责                                               |
| --------------------------------------------- | -------------------------------------------------- |
| `package.json` / `pnpm-lock.yaml`             | 增加 `shiki` 依赖                                  |
| `src/components/demo/demo-highlighter.ts`     | highlighter 单例 + `resolveLang` + `highlightCode` |
| `src/components/demo/demo-code.vue`           | DemoCode UI                                        |
| `src/components/demo/demo-components.test.ts` | 追加 DemoCode / highlighter 测试                   |
| `src/styles/index.scss`                       | `.demo-code` 样式（工具栏、行号）                  |
| `src/views/composables/use-auth-demo.vue`     | 裸 pre → DemoCode                                  |
| `src/views/composables/use-weixin-demo.vue`   | 裸 pre → DemoCode                                  |

---

### Task 1: `demo-highlighter` + `shiki` 依赖（TDD）

**Files:**

- Modify: `package.json`（via `pnpm add`）
- Create: `src/components/demo/demo-highlighter.ts`
- Modify: `src/components/demo/demo-components.test.ts`

**Interfaces:**

- Consumes: `shiki` 的 `createHighlighter`
- Produces:
  - `resolveLang(lang: string): string` — `ts`→`typescript`，`js`→`javascript`，其余原样
  - `highlightCode(code: string, lang?: string): Promise<string>` — 返回 Shiki HTML（含 `.shiki` / `.line`）

- [ ] **Step 1: 安装 shiki**

Run: `pnpm add shiki`

Expected: `package.json` 的 `dependencies` 出现 `shiki`；lockfile 更新。

- [ ] **Step 2: 写失败测试（resolveLang + highlightCode）**

在 `src/components/demo/demo-components.test.ts` 顶部增加 import，并在现有 `describe` **之后**追加：

```ts
import { highlightCode, resolveLang } from './demo-highlighter';

describe('demo-highlighter', () => {
  it('resolves common language aliases', () => {
    expect(resolveLang('ts')).toBe('typescript');
    expect(resolveLang('js')).toBe('javascript');
    expect(resolveLang('vue')).toBe('vue');
  });

  it('highlights typescript into shiki html with line spans', async () => {
    const html = await highlightCode('const x = 1\nconst y = 2', 'ts');
    expect(html).toContain('class="shiki');
    expect(html.match(/class="line"/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm test -- src/components/demo/demo-components.test.ts`

Expected: FAIL（`demo-highlighter` 模块不存在）

- [ ] **Step 4: 实现 `demo-highlighter.ts`**

创建 `src/components/demo/demo-highlighter.ts`：

```ts
import { createHighlighter, type Highlighter } from 'shiki';

const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
};

export function resolveLang(lang: string): string {
  return LANG_ALIASES[lang] ?? lang;
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light'],
      langs: ['typescript', 'vue', 'javascript'],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang = 'ts'): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang: resolveLang(lang),
    theme: 'github-light',
  });
}
```

若 Vitest/happy-dom 因 WASM 加载失败：改用 `createJavaScriptRegexEngine`（`shiki` 自带），并在 `createHighlighter` 传入 `engine: createJavaScriptRegexEngine()`。仅在默认引擎失败时启用。

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test -- src/components/demo/demo-components.test.ts`

Expected: PASS（含新建 `demo-highlighter` 用例）

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/demo/demo-highlighter.ts src/components/demo/demo-components.test.ts
git commit -m "feat(demo): add Shiki highlighter singleton"
```

---

### Task 2: `DemoCode` 组件 + 样式（TDD）

**Files:**

- Create: `src/components/demo/demo-code.vue`
- Modify: `src/styles/index.scss`
- Modify: `src/components/demo/demo-components.test.ts`

**Interfaces:**

- Consumes: `highlightCode` from `./demo-highlighter`
- Produces: Vue SFC `DemoCode`，props `{ code: string; lang?: string; title?: string }`（`lang` 默认 `'ts'`）

- [ ] **Step 1: 写失败测试（高亮渲染 + 复制）**

在 `demo-components.test.ts` 的 `demo components` describe 内追加（需 `import DemoCode from './demo-code.vue'`，以及 `vi` from vitest）：

```ts
it('renders highlighted code with line spans', async () => {
  const host = await mount({
    render: () => h(DemoCode, { code: 'const a = 1\nconst b = 2', lang: 'ts' }),
  });

  await vi.waitFor(() => {
    expect(host.querySelector('.shiki')).not.toBeNull();
  });
  expect(host.querySelectorAll('.line').length).toBeGreaterThanOrEqual(2);
});

it('copies the full source when the copy button is clicked', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', {
    ...navigator,
    clipboard: { writeText },
  });

  const source = 'const hello = "world"';
  const host = await mount({
    render: () => h(DemoCode, { code: source, lang: 'ts' }),
  });

  await vi.waitFor(() => {
    expect(host.querySelector('.shiki')).not.toBeNull();
  });

  const button = host.querySelector('button');
  expect(button).not.toBeNull();
  button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  await vi.waitFor(() => {
    expect(writeText).toHaveBeenCalledWith(source);
  });

  vi.unstubAllGlobals();
});
```

在文件顶部：`import { afterEach, describe, expect, it, vi } from 'vitest';`

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- src/components/demo/demo-components.test.ts`

Expected: FAIL（`demo-code.vue` 不存在）

- [ ] **Step 3: 实现 `demo-code.vue`**

创建 `src/components/demo/demo-code.vue`：

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { highlightCode } from './demo-highlighter';

defineOptions({ name: 'DemoCode' });

const props = withDefaults(
  defineProps<{
    code: string;
    lang?: string;
    title?: string;
  }>(),
  { lang: 'ts' },
);

const html = ref('');
const copied = ref(false);
let renderToken = 0;
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

const label = computed(() => props.title ?? props.lang);

async function render() {
  const token = ++renderToken;
  try {
    const next = await highlightCode(props.code, props.lang);
    if (token === renderToken) html.value = next;
  } catch {
    if (token === renderToken) html.value = '';
  }
}

watch(() => [props.code, props.lang] as const, render, { immediate: true });

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="demo-code">
    <div class="demo-code__toolbar">
      <span class="demo-code__label">{{ label }}</span>
      <el-button size="small" text @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </el-button>
    </div>
    <div v-if="html" class="demo-code__body" v-html="html" />
    <pre v-else class="demo-code__fallback">{{ code }}</pre>
  </div>
</template>
```

- [ ] **Step 4: 追加 `.demo-code` 样式**

在 `src/styles/index.scss` 的 `.demo-block` 块之后追加：

```scss
// ---------------------------------------------------------------------------
// Block: demo-code (Shiki snippet)
// ---------------------------------------------------------------------------
.demo-code {
  border: 1px solid $demo-border;
  border-radius: $demo-radius;
  background: #fff;
  overflow: hidden;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 10px 6px 14px;
    border-bottom: 1px solid $demo-border-light;
    background: $demo-bg-soft;
  }

  &__label {
    font-size: 12px;
    color: $demo-text-muted;
    font-family: $demo-mono;
  }

  &__body {
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.65;

    .shiki {
      margin: 0;
      padding: 14px 0;
      background: transparent !important;
      counter-reset: demo-line;
    }

    .line {
      display: inline-block;
      min-width: 100%;
      padding: 0 16px 0 0;

      &::before {
        display: inline-block;
        width: 2.5rem;
        margin-right: 12px;
        padding-right: 12px;
        border-right: 1px solid $demo-border-light;
        text-align: right;
        color: #a8abb2;
        content: counter(demo-line);
        counter-increment: demo-line;
        user-select: none;
      }
    }
  }

  &__fallback {
    margin: 0;
    padding: 14px 16px;
    font-family: $demo-mono;
    font-size: 13px;
    line-height: 1.65;
    color: $demo-text-secondary;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test -- src/components/demo/demo-components.test.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/demo/demo-code.vue src/styles/index.scss src/components/demo/demo-components.test.ts
git commit -m "feat(demo): add DemoCode with highlight, lines, and copy"
```

---

### Task 3: 接入 useAuth / useWeixin 文档页

**Files:**

- Modify: `src/views/composables/use-auth-demo.vue`
- Modify: `src/views/composables/use-weixin-demo.vue`

**Interfaces:**

- Consumes: `DemoCode` props `{ code, lang? }`
- Produces: 两页「代码演示」区使用高亮组件，无裸 `demo__pre`

- [ ] **Step 1: 更新 `use-auth-demo.vue`**

在 script 增加：

```ts
import DemoCode from '@/components/demo/demo-code.vue';
```

将 `DemoBlock` 内的：

```vue
<pre class="demo__pre">{{ codeDemo }}</pre>
```

替换为：

```vue
<DemoCode :code="codeDemo" lang="ts" />
```

保留现有 `codeDemo` 字符串与 hint（说明无法真实授权）。

- [ ] **Step 2: 更新 `use-weixin-demo.vue`**

同样 import `DemoCode`，将裸 `<pre class="demo__pre">` 换成：

```vue
<DemoCode :code="codeDemo" lang="ts" />
```

- [ ] **Step 3: typecheck**

Run: `pnpm typecheck`

Expected: 无错误

- [ ] **Step 4: 全量相关测试**

Run: `pnpm test -- src/components/demo/demo-components.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/views/composables/use-auth-demo.vue src/views/composables/use-weixin-demo.vue
git commit -m "docs(playground): use DemoCode on useAuth and useWeixin pages"
```

---

## Spec coverage (self-review)

| Spec 项                              | Task                           |
| ------------------------------------ | ------------------------------ |
| `shiki` + `createHighlighter` 单例   | Task 1                         |
| `github-light` / langs ts·vue·js     | Task 1                         |
| `resolveLang` 别名                   | Task 1                         |
| DemoCode props `code`/`lang`/`title` | Task 2                         |
| 复制按钮 +「已复制」                 | Task 2                         |
| 行号 CSS counter                     | Task 2                         |
| 降级纯文本 `<pre>`                   | Task 2（`html` 空时 fallback） |
| 接入 use-auth / use-weixin           | Task 3                         |
| 组件测试高亮 + 复制                  | Task 2                         |
| 不做暗色 / 预渲染 / 全站迁移         | 全任务未包含                   |

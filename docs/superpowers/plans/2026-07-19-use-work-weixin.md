# useWorkWeixin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增企微 H5 JSSDK 双 config 初始化 composable `useWorkWeixin`（`wx.config` + `wx.agentConfig`），对齐 `useWeixin` 的 API 形态与测试风格，并补 playground API 文档页。

**Architecture:** 独立 `use-work-weixin/` 夹；`createGlobalState` 全局只跑一次；可替换 stub `fetchWwJsConfig` / `fetchWwAgentConfig`（不进根 barrel）；仅企微 UA + `VITE_WW_JSSDK_ENABLED` 门控；`ready` 在双 config 都成功后置 true。

**Tech Stack:** Vue 3.5、TypeScript、`@vueuse/core`、Vitest + happy-dom、Vue Router、Vite。

**Spec:** `docs/superpowers/specs/2026-07-19-use-work-weixin-design.md`

## Global Constraints

- 不新建 `src/api/`、不引入 `jweixin` npm 包
- 不修改 `useWeixin` 行为；不抽共享内核
- 不做企微 OAuth / 业务 JSAPI 封装
- 根 barrel `@/composables` 只导出 `useWorkWeixin`；两个 fetch stub 与 `set/reset*Impl` 仅实现文件导出供测试
- `VITE_WW_JSSDK_ENABLED === 'true'` 才开启（不复用 `VITE_JSSDK_ENABLED`）
- UA 仅 `/wxwork/i`；签名 URL：`encodeURIComponent(location.href.split('#')[0])`
- Demo 无真实交互（描述 + API 表 + 代码块）
- 包管理器用 `pnpm`；验证命令用仓库 scripts

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/env.d.ts` | `VITE_WW_JSSDK_ENABLED` + `WeixinJsSdk.agentConfig` |
| `src/composables/use-work-weixin/use-work-weixin.ts` | 双 config 全局初始化 + stubs |
| `src/composables/use-work-weixin/index.ts` | 夹内 barrel（只导出 `useWorkWeixin`） |
| `src/composables/index.ts` | 根 barrel re-export |
| `src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts` | 单测 |
| `src/views/composables/use-work-weixin-demo.vue` | API 文档页 |
| `src/router/index.ts` | 注册路由（WeChat 组，order 3） |

---

### Task 1: `useWorkWeixin`（TDD）

**Files:**
- Modify: `src/env.d.ts`
- Create: `src/composables/use-work-weixin/use-work-weixin.ts`
- Create: `src/composables/use-work-weixin/index.ts`
- Create: `src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts`
- Modify: `src/composables/index.ts`

**Interfaces:**
- Consumes: `vue` (`ref`)、`@vueuse/core` (`createGlobalState`)、`import.meta.env.VITE_WW_JSSDK_ENABLED`、`window.wx`
- Produces:
  - `export type FetchWwConfig = (url: string) => Promise<{ data: Record<string, unknown> }>`
  - `export async function fetchWwJsConfig(url: string): Promise<{ data: Record<string, unknown> }>`（stub；**不要**从根 barrel 导出）
  - `export async function fetchWwAgentConfig(url: string): Promise<{ data: Record<string, unknown> }>`（stub；**不要**从根 barrel 导出）
  - `export function setFetchWwJsConfigImpl` / `resetFetchWwJsConfigImpl`（测试 helper）
  - `export function setFetchWwAgentConfigImpl` / `resetFetchWwAgentConfigImpl`（测试 helper）
  - `export const useWorkWeixin: () => [Ref<boolean>, WeixinJsSdk | undefined]`

- [ ] **Step 1: 扩展 `src/env.d.ts`**

在现有 `ImportMetaEnv` 中追加一行（保留已有字段）：

```ts
readonly VITE_WW_JSSDK_ENABLED?: string;
```

在现有 `WeixinJsSdk` 中追加（保留已有 `config` / `ready` / `error` / `scanQRCode?`）：

```ts
agentConfig: (config: Record<string, unknown>) => void;
```

完整目标片段应类似：

```ts
interface ImportMetaEnv {
  readonly VITE_WECHAT_APPID?: string;
  readonly VITE_JSSDK_ENABLED?: string;
  readonly VITE_WW_JSSDK_ENABLED?: string;
}

/** Minimal Weixin JSSDK surface used by useWeixin / useWorkWeixin. */
interface WeixinJsSdk {
  config: (config: Record<string, unknown>) => void;
  ready: (fn: () => void) => void;
  error: (fn: (err: unknown) => void) => void;
  agentConfig: (config: Record<string, unknown>) => void;
  scanQRCode?: (options: Record<string, unknown>) => void;
}
```

- [ ] **Step 2: 写失败测试**

创建 `src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts`：

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUseWorkWeixin() {
  return import('../../use-work-weixin/use-work-weixin');
}

function mockWx(handlers?: {
  onConfig?: (config: Record<string, unknown>) => void;
  onAgentConfig?: (config: Record<string, unknown>) => void;
  readyMode?: 'ready' | 'error';
  agentMode?: 'success' | 'fail';
  errorPayload?: unknown;
}) {
  const readyMode = handlers?.readyMode ?? 'ready';
  const agentMode = handlers?.agentMode ?? 'success';
  const wx = {
    config: vi.fn((config: Record<string, unknown>) => {
      handlers?.onConfig?.(config);
    }),
    ready: vi.fn((fn: () => void) => {
      if (readyMode === 'ready') fn();
    }),
    error: vi.fn((fn: (err: unknown) => void) => {
      if (readyMode === 'error')
        fn(handlers?.errorPayload ?? new Error('wx error'));
    }),
    agentConfig: vi.fn((config: Record<string, unknown>) => {
      handlers?.onAgentConfig?.(config);
      if (agentMode === 'success') {
        (config.success as (() => void) | undefined)?.();
      } else {
        (config.fail as ((err: unknown) => void) | undefined)?.(
          handlers?.errorPayload ?? new Error('agent error'),
        );
      }
    }),
  };
  vi.stubGlobal('wx', wx);
  window.wx = wx;
  return wx;
}

describe('useWorkWeixin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'true');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 wxwork/4.0.0 MicroMessenger/7.0.1',
    });
    vi.stubGlobal('location', {
      href: 'https://example.com/page?x=1#/hash',
    });
  });

  afterEach(async () => {
    try {
      const mod = await loadUseWorkWeixin();
      mod.resetFetchWwJsConfigImpl();
      mod.resetFetchWwAgentConfigImpl();
    } catch {
      // module may be absent in early failures
    }
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.wx = undefined;
  });

  it('does not initialize outside Work Weixin', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    const wx = mockWx();
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi.fn().mockResolvedValue({ data: { appId: 'x' } });
    const agentSpy = vi.fn().mockResolvedValue({ data: {} });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(jsSpy).not.toHaveBeenCalled();
    expect(agentSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
    expect(wx.agentConfig).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_WW_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'false');
    const wx = mockWx();
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi.fn().mockResolvedValue({ data: {} });
    const agentSpy = vi.fn().mockResolvedValue({ data: {} });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(jsSpy).not.toHaveBeenCalled();
    expect(agentSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('configures wx + agentConfig and sets ready on success', async () => {
    const wx = mockWx({ readyMode: 'ready', agentMode: 'success' });
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi
      .fn()
      .mockResolvedValue({ data: { appId: 'ww1', jsApiList: [] } });
    const agentSpy = vi.fn().mockResolvedValue({
      data: { corpid: 'corp1', agentid: '1000001', jsApiList: [] },
    });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready, sdk] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });

    const expectedUrl = encodeURIComponent('https://example.com/page?x=1');
    expect(sdk).toBe(wx);
    expect(jsSpy).toHaveBeenCalledWith(expectedUrl);
    expect(agentSpy).toHaveBeenCalledWith(expectedUrl);
    expect(wx.config).toHaveBeenCalledWith({
      debug: false,
      appId: 'ww1',
      jsApiList: [],
    });
    expect(wx.agentConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        corpid: 'corp1',
        agentid: '1000001',
        jsApiList: [],
        success: expect.any(Function),
        fail: expect.any(Function),
      }),
    );
  });

  it('sets ready false when wx.error fires', async () => {
    const wx = mockWx({ readyMode: 'error' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(wx.error).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('sets ready false when agentConfig fails', async () => {
    const wx = mockWx({ readyMode: 'ready', agentMode: 'fail' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(wx.agentConfig).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWwJsConfig rejects', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => {
      throw new Error('js stub down');
    });
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWwAgentConfig rejects', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => {
      throw new Error('agent stub down');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.config).toHaveBeenCalled();
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
```

**Stub 时序约束：** `createGlobalState` 在首次 `useWorkWeixin()` 时跑 `setup`。必须先 `setFetch*Impl`，再调用 `useWorkWeixin()`。每个用例 `vi.resetModules()` 以保证全局 state 重置。使用可替换 `impl`（对齐现有 `use-weixin`），不要依赖 `vi.spyOn` 拦截闭包内调用。

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm test -- src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts`

Expected: FAIL（模块不存在或导出缺失）

- [ ] **Step 4: 实现 `useWorkWeixin`**

创建 `src/composables/use-work-weixin/use-work-weixin.ts`：

```ts
import { ref, type Ref } from 'vue';
import { createGlobalState } from '@vueuse/core';

export type FetchWwConfig = (
  url: string,
) => Promise<{ data: Record<string, unknown> }>;

async function defaultFetchWwJsConfig(
  _url: string,
): Promise<{ data: Record<string, unknown> }> {
  // TODO: replace with real GET /wechat/ww/jssdk/config (param REDIRECT_URI).
  return { data: {} };
}

async function defaultFetchWwAgentConfig(
  _url: string,
): Promise<{ data: Record<string, unknown> }> {
  // TODO: replace with real GET /wechat/ww/jssdk/agent-config (param REDIRECT_URI).
  return { data: {} };
}

let fetchWwJsConfigImpl: FetchWwConfig = defaultFetchWwJsConfig;
let fetchWwAgentConfigImpl: FetchWwConfig = defaultFetchWwAgentConfig;

/**
 * Stub enterprise WeChat JSSDK config fetcher.
 * Do not re-export from @/composables.
 */
export async function fetchWwJsConfig(
  url: string,
): Promise<{ data: Record<string, unknown> }> {
  return fetchWwJsConfigImpl(url);
}

/**
 * Stub enterprise WeChat agentConfig fetcher.
 * Do not re-export from @/composables.
 */
export async function fetchWwAgentConfig(
  url: string,
): Promise<{ data: Record<string, unknown> }> {
  return fetchWwAgentConfigImpl(url);
}

/** @internal test helper — restore with `resetFetchWwJsConfigImpl`. */
export function setFetchWwJsConfigImpl(fn: FetchWwConfig) {
  fetchWwJsConfigImpl = fn;
}

/** @internal test helper */
export function resetFetchWwJsConfigImpl() {
  fetchWwJsConfigImpl = defaultFetchWwJsConfig;
}

/** @internal test helper — restore with `resetFetchWwAgentConfigImpl`. */
export function setFetchWwAgentConfigImpl(fn: FetchWwConfig) {
  fetchWwAgentConfigImpl = fn;
}

/** @internal test helper */
export function resetFetchWwAgentConfigImpl() {
  fetchWwAgentConfigImpl = defaultFetchWwAgentConfig;
}

function isWorkWeixinBrowser() {
  return (
    typeof navigator !== 'undefined' && /wxwork/i.test(navigator.userAgent)
  );
}

/**
 * Work Weixin JSSDK bootstrap (global wx.config + wx.agentConfig).
 *
 * - Signature URL: `location.href.split('#')[0]`
 * - `ready` is true only after both configs succeed
 * - Skips when not Work Weixin / VITE_WW_JSSDK_ENABLED !== 'true' / no window.wx
 *
 * @example
 * const [ready, $wx] = useWorkWeixin()
 * watch(ready, (ok) => {
 *   if (!ok) return
 *   $wx?.scanQRCode?.({ needResult: 1, success: console.log })
 * })
 */
export const useWorkWeixin = createGlobalState((): [
  Ref<boolean>,
  WeixinJsSdk | undefined,
] => {
  const ready = ref(false);
  const wx = typeof window !== 'undefined' ? window.wx : undefined;
  let pending: Promise<void> | null = null;
  const enabled = import.meta.env.VITE_WW_JSSDK_ENABLED === 'true';

  async function setup() {
    if (!enabled || !wx || !isWorkWeixinBrowser()) {
      ready.value = false;
      return;
    }
    if (pending) return pending;

    pending = (async () => {
      try {
        const url = encodeURIComponent(location.href.split('#')[0] ?? '');
        const { data } = await fetchWwJsConfigImpl(url);

        await new Promise<void>((resolve, reject) => {
          wx.config({ debug: false, ...data });
          wx.ready(() => resolve());
          wx.error((err) => {
            ready.value = false;
            pending = null;
            console.error('[wx.config]', err);
            reject(err);
          });
        });

        const { data: agentData } = await fetchWwAgentConfigImpl(url);

        await new Promise<void>((resolve, reject) => {
          wx.agentConfig({
            ...agentData,
            success: () => {
              ready.value = true;
              resolve();
            },
            fail: (err: unknown) => {
              ready.value = false;
              pending = null;
              console.error('[wx.agentConfig]', err);
              reject(err);
            },
          });
        });
      } catch (e) {
        ready.value = false;
        pending = null;
        console.error('[wx.agentConfig]', e);
      }
    })();

    return pending;
  }

  void setup();

  return [ready, wx];
});
```

创建 `src/composables/use-work-weixin/index.ts`：

```ts
export { useWorkWeixin } from './use-work-weixin';
```

修改 `src/composables/index.ts`，在现有 exports 中按字母序（或紧挨 `use-weixin`）追加：

```ts
export * from './use-work-weixin';
```

（根 barrel 只 re-export 夹内 `index.ts`，因此不会漏出 fetch stubs。）

**实现注意：**

- `wx.ready` 回调里**不要**把 `ready` 设为 `true`；只有 `agentConfig` 的 `success` 才置 true
- `agentConfig` 调用时把 `success` / `fail` 写在 spread 之后，避免被 stub data 覆盖
- 外层 `catch` 的 `console.error` 标签可用 `[useWorkWeixin]` 或保留 `[wx.agentConfig]`；与测试「error 被调用」断言兼容即可
- 若 `wx.error` 触发 `reject`，外层 `catch` 会再打一次日志——可接受，对齐「失败可观测」

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test -- src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts`

Expected: PASS（全部 7 个用例）

若失败：确认 `setFetch*Impl` 发生在 `useWorkWeixin()` 之前，且每例 `resetModules`；确认个微 UA 用例用的是无 `wxwork` 的 `MicroMessenger` UA。

- [ ] **Step 6: Commit**

```bash
git add src/env.d.ts src/composables/use-work-weixin src/composables/__tests__/use-work-weixin src/composables/index.ts
git commit -m "feat(composables): add useWorkWeixin with dual jssdk config"
```

---

### Task 2: Playground 文档页 + 路由

**Files:**
- Create: `src/views/composables/use-work-weixin-demo.vue`
- Modify: `src/router/index.ts`

**Interfaces:**
- Consumes: `DemoPage` / `DemoApiTable` / `DemoBlock` / `DemoCode`、Task 1 的公开 API 形态
- Produces: 路由 `composables-use-work-weixin`（`group: 'WeChat'`, `order: 3`）

- [ ] **Step 1: 创建 demo 页**

创建 `src/views/composables/use-work-weixin-demo.vue`：

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoCode from '@/components/demo/demo-code.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWorkWeixinDemo' });

const codeDemo = `import { watch } from 'vue'
import { useWorkWeixin } from '@/composables'

const [ready, $wx] = useWorkWeixin()

watch(ready, (ok) => {
  if (!ok) return
  $wx?.scanQRCode?.({ needResult: 1, success: console.log })
})`;
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      企微 JSSDK 初始化（<code>createGlobalState</code>，全局
      <code>wx.config</code> + <code>wx.agentConfig</code> 各一次）。
      <code>ready</code> 仅在双配置都成功后为
      <code>true</code>。签名 URL 取
      <code>location.href.split('#')[0]</code>。非企微环境或
      <code>VITE_WW_JSSDK_ENABLED !== 'true'</code> 时跳过。当前
      <code>fetchWwJsConfig</code> /
      <code>fetchWwAgentConfig</code> 为 stub（空
      <code>data</code>），待接后端签名接口。
    </template>

    <template #api>
      <DemoApiTable title="Returns (tuple)">
        <tr>
          <td><code>[0] ready</code></td>
          <td><code>Ref&lt;boolean&gt;</code></td>
          <td>
            <code>wx.config</code> 与
            <code>wx.agentConfig</code> 都成功后为
            <code>true</code>。
          </td>
        </tr>
        <tr>
          <td><code>[1] wx</code></td>
          <td><code>WeixinJsSdk | undefined</code></td>
          <td>
            <code>window.wx</code> 引用；未注入脚本时为
            <code>undefined</code>。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_WW_JSSDK_ENABLED</code></td>
          <td><code>string</code></td>
          <td>仅当值为 <code>'true'</code> 时初始化。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="代码演示">
      <template #hint>
        playground 非企微环境且 JSSDK 配置仍为 stub，无法交互演示；此处仅展示用法。需企微内置浏览器（UA 含
        <code>wxwork</code>）、
        <code>VITE_WW_JSSDK_ENABLED=true</code>，并注入
        <code>window.wx</code>。
      </template>
      <DemoCode :code="codeDemo" lang="ts" />
    </DemoBlock>
  </DemoPage>
</template>
```

- [ ] **Step 2: 注册路由**

修改 `src/router/index.ts`：

1. 在现有 `UseWeixinDemo` import 旁追加：

```ts
import UseWorkWeixinDemo from '@/views/composables/use-work-weixin-demo.vue';
```

2. 在 `composables/use-weixin` 路由对象之后追加：

```ts
{
  path: 'composables/use-work-weixin',
  name: 'composables-use-work-weixin',
  component: UseWorkWeixinDemo,
  meta: { title: 'use-work-weixin', group: 'WeChat', order: 3 },
},
```

- [ ] **Step 3: 冒烟验证**

Run: `pnpm test -- src/composables/__tests__/use-work-weixin/use-work-weixin.test.ts`

Expected: PASS

可选：`pnpm dev` 后打开 `/composables/use-work-weixin`，确认侧栏 WeChat 组出现该项，页面有描述 / API 表 / 代码块。

- [ ] **Step 4: Commit**

```bash
git add src/views/composables/use-work-weixin-demo.vue src/router/index.ts
git commit -m "docs(playground): add useWorkWeixin API page"
```

---

## Spec coverage checklist

| Spec 要求 | Task |
|-----------|------|
| `useWorkWeixin` → `[ready, wx]` | Task 1 |
| `wx.config` + `wx.agentConfig` 顺序 | Task 1 |
| `ready` 仅双成功后 true | Task 1 |
| 仅 `wxwork` UA | Task 1 |
| `VITE_WW_JSSDK_ENABLED` | Task 1 |
| 双 stub + 测试 helper，不进根 barrel | Task 1 |
| 签名 URL 去 hash | Task 1 |
| 单测 7 场景 | Task 1 |
| Demo + 路由 WeChat order 3 | Task 2 |
| 不改 `useWeixin` / 无 OAuth / 无业务封装 | 全计划未包含 = OK |

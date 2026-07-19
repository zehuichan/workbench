# WeChat Composables Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `useAuth` / `useWeixin` 迁入 workbench composables（TS + History OAuth + JSSDK stub），并补单元测试与仅 API 文档的 playground 页。

**Architecture:** 按现有 `use-xxx/` 夹结构落地；`useAuth` 用 `@vueuse/core` 的 `useUrlSearchParams('history')`；`useWeixin` 用 `createGlobalState` + 同文件 `fetchWxJsConfig` stub（不进根 barrel）。Demo 只用 `DemoPage` / `DemoApiTable`，无交互。

**Tech Stack:** Vue 3.5、TypeScript、`@vueuse/core`、Vitest + happy-dom、Vue Router、Vite。

**Spec:** `docs/superpowers/specs/2026-07-19-wechat-composables-migration-design.md`

## Global Constraints

- 不新建 `src/api/`、不引入 axios / jweixin npm 包
- 不迁 `wrapperEnv`；`VITE_JSSDK_ENABLED === 'true'` 才开启 JSSDK
- OAuth `redirect_uri` 必须为 History 拼法（无 `#/...`）
- Demo 禁止 `DemoBlock` 与真实授权 / 扫码调用
- 根 barrel `@/composables` 为公开入口；`fetchWxJsConfig` 仅实现文件导出供测试 spy，不进根 barrel
- 包管理器用 `pnpm`；验证命令用仓库 scripts

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/env.d.ts` | `VITE_WECHAT_*` + `Window.wx` 最小类型 |
| `src/composables/use-auth/use-auth.ts` | 微信网页授权 |
| `src/composables/use-auth/index.ts` | 夹内 barrel |
| `src/composables/use-weixin/use-weixin.ts` | JSSDK 全局配置 + stub |
| `src/composables/use-weixin/index.ts` | 夹内 barrel（只导出 `useWeixin`） |
| `src/composables/index.ts` | 根 barrel re-export |
| `src/composables/__tests__/use-auth/use-auth.test.ts` | useAuth 单测 |
| `src/composables/__tests__/use-weixin/use-weixin.test.ts` | useWeixin 单测 |
| `src/views/composables/use-auth-demo.vue` | API 文档页 |
| `src/views/composables/use-weixin-demo.vue` | API 文档页 |
| `src/router/index.ts` | 注册路由（layout 按 `meta.group` / `order` 自动侧栏） |

---

### Task 1: `useAuth`（TDD）

**Files:**
- Modify: `src/env.d.ts`
- Create: `src/composables/use-auth/use-auth.ts`
- Create: `src/composables/use-auth/index.ts`
- Create: `src/composables/__tests__/use-auth/use-auth.test.ts`
- Modify: `src/composables/index.ts`

**Interfaces:**
- Consumes: `vue` (`ref`, `watchEffect`)、`@vueuse/core` (`useUrlSearchParams`)、`import.meta.env.VITE_WECHAT_APPID`
- Produces:
  - `export type WechatOAuthScope = 'snsapi_base' | 'snsapi_userinfo'`
  - `export function useAuth(scope?: WechatOAuthScope): [Ref<string | undefined>, (redirect?: string) => void]`

- [ ] **Step 1: 扩展 `src/env.d.ts`**

在现有内容后追加（保留已有 `*.vue` / `*.css` / `*.scss` 声明）：

```ts
interface ImportMetaEnv {
  readonly VITE_WECHAT_APPID?: string;
  readonly VITE_JSSDK_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Minimal Weixin JSSDK surface used by useWeixin. */
interface WeixinJsSdk {
  config: (config: Record<string, unknown>) => void;
  ready: (fn: () => void) => void;
  error: (fn: (err: unknown) => void) => void;
  scanQRCode?: (options: Record<string, unknown>) => void;
}

interface Window {
  wx?: WeixinJsSdk;
}
```

- [ ] **Step 2: 写失败测试**

创建 `src/composables/__tests__/use-auth/use-auth.test.ts`：

```ts
import { effectScope, type EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../use-auth/use-auth';

describe('useAuth', () => {
  let scope: EffectScope;
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scope = effectScope();
    vi.stubEnv('VITE_WECHAT_APPID', 'wx-test-appid');

    hrefSetter = vi.fn();
    const locationMock = {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/app/home',
      search: '?from=demo',
      hash: '',
      href: 'https://example.com/app/home?from=demo',
      origin: 'https://example.com',
    };
    Object.defineProperty(locationMock, 'href', {
      configurable: true,
      get: () => 'https://example.com/app/home?from=demo',
      set: hrefSetter,
    });
    vi.stubGlobal('location', locationMock);

    window.history.replaceState({}, '', '/app/home?from=demo');
  });

  afterEach(() => {
    scope.stop();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('syncs code from the URL search params', () => {
    window.history.replaceState({}, '', '/app/home?code=oauth-code-1&from=demo');
    const pair = scope.run(() => useAuth());
    if (!pair) throw new Error('scope did not return useAuth');
    const [code] = pair;
    expect(code.value).toBe('oauth-code-1');
  });

  it('authorize redirects with history redirect_uri (no hash path)', () => {
    const pair = scope.run(() => useAuth('snsapi_base'));
    if (!pair) throw new Error('scope did not return useAuth');
    const [, authorize] = pair;
    authorize();

    expect(hrefSetter).toHaveBeenCalledTimes(1);
    const url = String(hrefSetter.mock.calls[0]?.[0]);
    expect(url).toContain('https://open.weixin.qq.com/connect/oauth2/authorize?');
    expect(url).toContain('appid=wx-test-appid');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=snsapi_base');
    expect(url).toContain('#wechat_redirect');

    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/app/home?from=demo');
    expect(redirectUri.includes('#')).toBe(false);
  });

  it('authorize(redirect) replaces pathname', () => {
    const pair = scope.run(() => useAuth());
    if (!pair) throw new Error('scope did not return useAuth');
    const [, authorize] = pair;
    authorize('/login');

    const url = String(hrefSetter.mock.calls[0]?.[0]);
    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/login?from=demo');
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm test -- src/composables/__tests__/use-auth/use-auth.test.ts`

Expected: FAIL（模块不存在或 `useAuth` 未定义）

- [ ] **Step 4: 实现 `useAuth`**

创建 `src/composables/use-auth/use-auth.ts`：

```ts
import { ref, watchEffect, type Ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

export type WechatOAuthScope = 'snsapi_base' | 'snsapi_userinfo';

/**
 * WeChat web OAuth helper (History mode redirect_uri).
 *
 * @example
 * const [code, authorize] = useAuth()
 * authorize('/login')
 */
export function useAuth(
  scope: WechatOAuthScope = 'snsapi_userinfo',
): [Ref<string | undefined>, (redirect?: string) => void] {
  const params = useUrlSearchParams('history');
  const code = ref<string | undefined>(undefined);

  watchEffect(() => {
    const value = params.code;
    code.value = typeof value === 'string' ? value : undefined;
  });

  function authorize(redirect?: string) {
    const { protocol, host, pathname, search } = location;
    const nextPath = redirect
      ? redirect.startsWith('/')
        ? redirect
        : `/${redirect}`
      : pathname;
    const redirectUri = `${protocol}//${host}${nextPath}${search}`;
    const appId = import.meta.env.VITE_WECHAT_APPID ?? '';
    location.href =
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=${scope}&state=${Date.now()}#wechat_redirect`;
  }

  return [code, authorize];
}
```

创建 `src/composables/use-auth/index.ts`：

```ts
export { useAuth } from './use-auth';
export type { WechatOAuthScope } from './use-auth';
```

修改 `src/composables/index.ts`，追加：

```ts
export * from './use-auth';
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test -- src/composables/__tests__/use-auth/use-auth.test.ts`

Expected: PASS（3 tests）

若 `useUrlSearchParams` 与 `history.replaceState` 不同步导致第一例失败：在 `scope.run` 前先 `replaceState`，并在断言前 `await Promise.resolve()`；仍失败则改为在测试里直接设置 `location.search` 与当前 happy-dom 行为对齐（保持断言语义不变）。

- [ ] **Step 6: Commit**

```bash
git add src/env.d.ts src/composables/use-auth src/composables/__tests__/use-auth src/composables/index.ts
git commit -m "feat(composables): add useAuth with history OAuth redirect"
```

---

### Task 2: `useWeixin`（TDD）

**Files:**
- Create: `src/composables/use-weixin/use-weixin.ts`
- Create: `src/composables/use-weixin/index.ts`
- Create: `src/composables/__tests__/use-weixin/use-weixin.test.ts`
- Modify: `src/composables/index.ts`

**Interfaces:**
- Consumes: `vue` (`ref`)、`@vueuse/core` (`createGlobalState`)、`import.meta.env.VITE_JSSDK_ENABLED`、`window.wx`
- Produces:
  - `export async function fetchWxJsConfig(url: string): Promise<{ data: Record<string, unknown> }>`（stub；**不要**从根 barrel 导出）
  - `export const useWeixin: () => [Ref<boolean>, WeixinJsSdk | undefined]`

- [ ] **Step 1: 写失败测试**

创建 `src/composables/__tests__/use-weixin/use-weixin.test.ts`：

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUseWeixin() {
  return import('../../use-weixin/use-weixin');
}

function mockWx(handlers?: {
  onConfig?: (config: Record<string, unknown>) => void;
  readyMode?: 'ready' | 'error';
  errorPayload?: unknown;
}) {
  const readyMode = handlers?.readyMode ?? 'ready';
  const wx = {
    config: vi.fn((config: Record<string, unknown>) => {
      handlers?.onConfig?.(config);
    }),
    ready: vi.fn((fn: () => void) => {
      if (readyMode === 'ready') fn();
    }),
    error: vi.fn((fn: (err: unknown) => void) => {
      if (readyMode === 'error') fn(handlers?.errorPayload ?? new Error('wx error'));
    }),
  };
  vi.stubGlobal('wx', wx);
  window.wx = wx;
  return wx;
}

describe('useWeixin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_JSSDK_ENABLED', 'true');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    vi.stubGlobal('location', {
      href: 'https://example.com/page?x=1#/hash',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // @ts-expect-error test cleanup
    delete window.wx;
  });

  it('does not initialize outside WeChat', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120' });
    const wx = mockWx();
    const mod = await loadUseWeixin();
    const fetchSpy = vi
      .spyOn(mod, 'fetchWxJsConfig')
      .mockResolvedValue({ data: { appId: 'x' } });

    const [ready] = mod.useWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_JSSDK_ENABLED', 'false');
    const wx = mockWx();
    const mod = await loadUseWeixin();
    const fetchSpy = vi
      .spyOn(mod, 'fetchWxJsConfig')
      .mockResolvedValue({ data: {} });

    const [ready] = mod.useWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('configures wx and sets ready on success', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWeixin();
    const fetchSpy = vi
      .spyOn(mod, 'fetchWxJsConfig')
      .mockResolvedValue({ data: { appId: 'wx1', jsApiList: [] } });

    const [ready, sdk] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });

    expect(sdk).toBe(wx);
    expect(fetchSpy).toHaveBeenCalledWith(
      encodeURIComponent('https://example.com/page?x=1'),
    );
    expect(wx.config).toHaveBeenCalledWith({
      debug: false,
      appId: 'wx1',
      jsApiList: [],
    });
  });

  it('sets ready false when wx.error fires', async () => {
    const wx = mockWx({ readyMode: 'error' });
    const mod = await loadUseWeixin();
    vi.spyOn(mod, 'fetchWxJsConfig').mockResolvedValue({ data: {} });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(wx.error).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWxJsConfig rejects', async () => {
    mockWx({ readyMode: 'ready' });
    const mod = await loadUseWeixin();
    vi.spyOn(mod, 'fetchWxJsConfig').mockRejectedValue(new Error('stub down'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(ready.value).toBe(false);
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
```

**Spy 时序约束：** `createGlobalState` 在首次 `useWeixin()` 时跑 `setup`。必须先 `vi.spyOn(mod, 'fetchWxJsConfig')`，再调用 `useWeixin()`。每个用例 `vi.resetModules()` 以保证全局 state 重置。

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- src/composables/__tests__/use-weixin/use-weixin.test.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `useWeixin`**

创建 `src/composables/use-weixin/use-weixin.ts`：

```ts
import { ref, type Ref } from 'vue';
import { createGlobalState } from '@vueuse/core';

/**
 * TODO: replace with real GET /wechat/jssdk/config (param REDIRECT_URI).
 * Kept exported for unit-test spies; do not re-export from @/composables.
 */
export async function fetchWxJsConfig(
  _url: string,
): Promise<{ data: Record<string, unknown> }> {
  return { data: {} };
}

function isWeixinBrowser() {
  return (
    typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)
  );
}

/**
 * WeChat JSSDK bootstrap (single global wx.config).
 *
 * - Signature URL: `location.href.split('#')[0]`
 * - Skips when not WeChat / VITE_JSSDK_ENABLED !== 'true' / no window.wx
 *
 * @example
 * const [ready, $wx] = useWeixin()
 * $wx?.scanQRCode?.({ needResult: 1, success: console.log })
 */
export const useWeixin = createGlobalState((): [
  Ref<boolean>,
  WeixinJsSdk | undefined,
] => {
  const ready = ref(false);
  const wx = typeof window !== 'undefined' ? window.wx : undefined;
  let pending: Promise<void> | null = null;
  const enabled = import.meta.env.VITE_JSSDK_ENABLED === 'true';

  async function setup() {
    if (!enabled || !wx || !isWeixinBrowser()) {
      ready.value = false;
      return;
    }
    if (pending) return pending;

    pending = (async () => {
      try {
        const url = encodeURIComponent(location.href.split('#')[0] ?? '');
        const { data } = await fetchWxJsConfig(url);

        await new Promise<void>((resolve, reject) => {
          wx.config({ debug: false, ...data });
          wx.ready(() => {
            ready.value = true;
            resolve();
          });
          wx.error((err) => {
            ready.value = false;
            pending = null;
            console.error('[wx.config]', err);
            reject(err);
          });
        });
      } catch (e) {
        ready.value = false;
        pending = null;
        console.error('[wx.config]', e);
      }
    })();

    return pending;
  }

  void setup();

  return [ready, wx];
});
```

创建 `src/composables/use-weixin/index.ts`：

```ts
export { useWeixin } from './use-weixin';
```

修改 `src/composables/index.ts`，追加：

```ts
export * from './use-weixin';
```

（根 barrel 只 re-export 夹内 `index.ts`，因此不会漏出 `fetchWxJsConfig`。）

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test -- src/composables/__tests__/use-weixin/use-weixin.test.ts`

Expected: PASS

若 spy 因 `createGlobalState` 闭包未命中：确认 spy 发生在 `useWeixin()` 之前，且每例 `resetModules`；仍失败则改为在 `fetchWxJsConfig` 内读取可替换的模块级 `let impl`（仅测试用，不扩大公开 API）。

- [ ] **Step 5: Commit**

```bash
git add src/composables/use-weixin src/composables/__tests__/use-weixin src/composables/index.ts
git commit -m "feat(composables): add useWeixin with jssdk config stub"
```

---

### Task 3: API 文档页 + 路由

**Files:**
- Create: `src/views/composables/use-auth-demo.vue`
- Create: `src/views/composables/use-weixin-demo.vue`
- Modify: `src/router/index.ts`

**Interfaces:**
- Consumes: `useAuth` / `useWeixin` 公开签名（仅文档描述，页面不调用）
- Produces: 路由 `composables-use-auth`（order 4）、`composables-use-weixin`（order 5）

- [ ] **Step 1: 创建 `use-auth-demo.vue`（仅文档）**

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseAuthDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信网页授权（OAuth）。从 URL search 同步
      <code>code</code>，并通过
      <code>authorize</code> 跳转微信授权页。workbench 使用 History 路由，
      <code>redirect_uri</code> 不含 hash 路径。需配置
      <code>VITE_WECHAT_APPID</code>。
    </template>

    <template #api>
      <DemoApiTable title="Parameters">
        <tr>
          <td><code>scope</code></td>
          <td><code>'snsapi_base' | 'snsapi_userinfo'</code></td>
          <td>默认 <code>'snsapi_userinfo'</code>。授权作用域。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Returns (tuple)">
        <tr>
          <td><code>[0] code</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>URL 上的 OAuth <code>code</code>。</td>
        </tr>
        <tr>
          <td><code>[1] authorize</code></td>
          <td><code>(redirect?: string) =&gt; void</code></td>
          <td>
            跳转微信授权；可选 <code>redirect</code> 替换当前 pathname（History）。
          </td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_WECHAT_APPID</code></td>
          <td><code>string</code></td>
          <td>微信公众号 / 网页应用 AppId。</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
```

- [ ] **Step 2: 创建 `use-weixin-demo.vue`（仅文档）**

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWeixinDemo' });
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信 JSSDK 初始化（<code>createGlobalState</code>，全局只
      <code>wx.config</code> 一次）。签名 URL 取
      <code>location.href.split('#')[0]</code>。非微信环境或
      <code>VITE_JSSDK_ENABLED !== 'true'</code> 时跳过。当前
      <code>fetchWxJsConfig</code> 为 stub（空
      <code>data</code>），待接 <code>/wechat/jssdk/config</code>。
    </template>

    <template #api>
      <DemoApiTable title="Returns (tuple)">
        <tr>
          <td><code>[0] ready</code></td>
          <td><code>Ref&lt;boolean&gt;</code></td>
          <td><code>wx.ready</code> 之后为 <code>true</code>。</td>
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
          <td><code>VITE_JSSDK_ENABLED</code></td>
          <td><code>string</code></td>
          <td>仅当值为 <code>'true'</code> 时初始化。</td>
        </tr>
      </DemoApiTable>
    </template>
  </DemoPage>
</template>
```

- [ ] **Step 3: 注册路由**

在 `src/router/index.ts` 增加 import：

```ts
import UseAuthDemo from '@/views/composables/use-auth-demo.vue';
import UseWeixinDemo from '@/views/composables/use-weixin-demo.vue';
```

在 `composables/use-save-hotkey` 路由后追加：

```ts
{
  path: 'composables/use-auth',
  name: 'composables-use-auth',
  component: UseAuthDemo,
  meta: { title: 'useAuth', group: 'Composables', order: 4 },
},
{
  path: 'composables/use-weixin',
  name: 'composables-use-weixin',
  component: UseWeixinDemo,
  meta: { title: 'useWeixin', group: 'Composables', order: 5 },
},
```

- [ ] **Step 4: typecheck**

Run: `pnpm typecheck`

Expected: 无错误

- [ ] **Step 5: Commit**

```bash
git add src/views/composables/use-auth-demo.vue src/views/composables/use-weixin-demo.vue src/router/index.ts
git commit -m "docs(playground): add useAuth and useWeixin API pages"
```

---

### Task 4: 全量验证

**Files:**
- （无新文件；回归）

- [ ] **Step 1: 跑全部测试**

Run: `pnpm test`

Expected: 全部 PASS（含既有 composables / plus-table 测试）

- [ ] **Step 2: typecheck**

Run: `pnpm typecheck`

Expected: 无错误

- [ ] **Step 3: 手工确认侧栏（可选）**

Run: `pnpm dev`

打开 `/composables/use-auth` 与 `/composables/use-weixin`，确认仅有描述 + API 表、无交互块。

- [ ] **Step 4: 若 Task 4 无代码改动则无需 commit；有修复则单独 commit**

```bash
git commit -m "fix(composables): address wechat migration verification gaps"
```

---

## Spec coverage checklist

| Spec 项 | Task |
|---------|------|
| `useAuth` History OAuth | Task 1 |
| `useWeixin` + stub `fetchWxJsConfig` | Task 2 |
| `env.d.ts` 环境变量与 `Window.wx` | Task 1 |
| 根 barrel 导出 | Task 1–2 |
| 单元测试 | Task 1–2 |
| API-only demos + 路由 | Task 3 |
| 不引入真实 API / jweixin | Global Constraints |
| 全量回归 | Task 4 |

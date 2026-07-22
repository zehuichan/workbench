# useWechatQrAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地微信开放平台 PC 扫码登录前端：`useWechatQrAuth`（OAuth 管道）+ stub `exchangeWechatQrCode` + `/auth/wechat` 中间页编排模拟换票 + playground API demo。

**Architecture:** composable 只负责 `qrconnect` 跳转、`sessionStorage` state、URL `code`/`state` 同步与清参；同目录 stub 供中间页调用且不被 composable 引用；中间页在 `stateValid` 后换票并 `clearCallbackParams`。不改动现有 `useWechatAuth`。

**Tech Stack:** Vue 3、TypeScript、`@vueuse/core`（`useUrlSearchParams`）、Vitest + happy-dom、Vue Router、Vite。

**Spec:** `docs/superpowers/specs/2026-07-22-use-wechat-qr-auth-design.md`

## Global Constraints

- composable **不**调用换票、**不**暴露 `token` / `exchanging`
- 无弹窗；整页 `location.href` 跳 `qrconnect`；`scope` 固定 `snsapi_login`
- `redirect_uri` 为固定 path（History，无 `#/...`）
- stub 不新建 `src/api/`；`TODO: 接真实后端` 留在 `exchange-wechat-qr-code.ts`
- 不修改 `useWechatAuth` / `useWechat` / `useWecom` 行为
- 包管理器用 `pnpm`；验证用 `pnpm test` / `pnpm typecheck`

---

## File Structure

| 路径 | 职责 |
|------|------|
| `src/env.d.ts` | 增加 `VITE_WECHAT_OPEN_APPID`、`VITE_WECHAT_QR_REDIRECT_PATH` |
| `src/composables/use-wechat-qr-auth/exchange-wechat-qr-code.ts` | 模拟换票 stub + `WechatQrToken` |
| `src/composables/use-wechat-qr-auth/use-wechat-qr-auth.ts` | OAuth 管道 |
| `src/composables/use-wechat-qr-auth/index.ts` | 夹内 barrel |
| `src/composables/index.ts` | 根 barrel re-export |
| `src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts` | stub 单测 |
| `src/composables/__tests__/use-wechat-qr-auth/use-wechat-qr-auth.test.ts` | composable 单测 |
| `src/views/composables/wechat-qr-auth-callback.vue` | `/auth/wechat` 中间页 |
| `src/views/composables/use-wechat-qr-auth-demo.vue` | API 文档 demo |
| `src/router/index.ts` | 注册 demo + 顶层 `/auth/wechat` |

---

### Task 1: `exchangeWechatQrCode` stub（TDD）

**Files:**

- Create: `src/composables/use-wechat-qr-auth/exchange-wechat-qr-code.ts`
- Create: `src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts`

**Interfaces:**

- Consumes: none（纯 stub）
- Produces:
  - `export type WechatQrToken = { accessToken: string; openid: string }`
  - `export function exchangeWechatQrCode(code: string): Promise<WechatQrToken>`

- [ ] **Step 1: 写失败测试**

Create `src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exchangeWechatQrCode } from '../../use-wechat-qr-auth/exchange-wechat-qr-code';

describe('exchangeWechatQrCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves mock token for a non-empty code', async () => {
    const promise = exchangeWechatQrCode('abcdefghij');
    await vi.advanceTimersByTimeAsync(300);
    await expect(promise).resolves.toEqual({
      accessToken: 'mock-access-token-abcdefgh',
      openid: 'mock-openid-abcdefgh',
    });
  });

  it('rejects when code is empty', async () => {
    const promise = exchangeWechatQrCode('');
    await vi.advanceTimersByTimeAsync(300);
    await expect(promise).rejects.toThrow('missing code');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm exec vitest run src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 3: 最小实现**

Create `src/composables/use-wechat-qr-auth/exchange-wechat-qr-code.ts`:

```ts
export type WechatQrToken = {
  accessToken: string;
  openid: string;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Mock WeChat Open Platform QR code exchange.
 * TODO: POST /api/auth/wechat/qr with `code` against a real backend.
 */
export async function exchangeWechatQrCode(
  code: string,
): Promise<WechatQrToken> {
  await delay(300);
  if (!code) throw new Error('missing code');
  const slice = code.slice(0, 8);
  return {
    accessToken: `mock-access-token-${slice}`,
    openid: `mock-openid-${slice}`,
  };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm exec vitest run src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts`

Expected: PASS（2 tests）

- [ ] **Step 5: Commit**

```bash
git add \
  src/composables/use-wechat-qr-auth/exchange-wechat-qr-code.ts \
  src/composables/__tests__/use-wechat-qr-auth/exchange-wechat-qr-code.test.ts
git commit -m "$(cat <<'EOF'
feat(composables): add exchangeWechatQrCode mock stub

EOF
)"
```

---

### Task 2: `useWechatQrAuth`（TDD）

**Files:**

- Modify: `src/env.d.ts`
- Create: `src/composables/use-wechat-qr-auth/use-wechat-qr-auth.ts`
- Create: `src/composables/use-wechat-qr-auth/index.ts`
- Create: `src/composables/__tests__/use-wechat-qr-auth/use-wechat-qr-auth.test.ts`
- Modify: `src/composables/index.ts`

**Interfaces:**

- Consumes: `vue`、`@vueuse/core`（`useUrlSearchParams`）、`VITE_WECHAT_OPEN_APPID`、`VITE_WECHAT_QR_REDIRECT_PATH`
- Produces:

```ts
export const WECHAT_QR_OAUTH_STORAGE_KEY = 'wechat-qr-oauth';

export function useWechatQrAuth(): {
  code: Ref<string | undefined>
  state: Ref<string | undefined>
  stateValid: Ref<boolean | null>
  returnTo: Ref<string | undefined>
  authorize: (returnTo?: string) => void
  clearCallbackParams: () => void
}
```

- 不 import / 不调用 `exchangeWechatQrCode`

- [ ] **Step 1: 扩展 `src/env.d.ts`**

在 `ImportMetaEnv` 内追加（保留既有字段）：

```ts
readonly VITE_WECHAT_OPEN_APPID?: string;
/** Fixed OAuth callback path for QR login; default /auth/wechat */
readonly VITE_WECHAT_QR_REDIRECT_PATH?: string;
```

- [ ] **Step 2: 写失败测试**

Create `src/composables/__tests__/use-wechat-qr-auth/use-wechat-qr-auth.test.ts`:

```ts
import { effectScope, type EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WECHAT_QR_OAUTH_STORAGE_KEY,
  useWechatQrAuth,
} from '../../use-wechat-qr-auth/use-wechat-qr-auth';

describe('useWechatQrAuth', () => {
  let scope: EffectScope;
  let hrefSetter: ReturnType<typeof vi.fn<(value: string) => void>>;

  beforeEach(() => {
    scope = effectScope();
    vi.stubEnv('VITE_WECHAT_OPEN_APPID', 'wx-open-test');
    vi.stubEnv('VITE_WECHAT_QR_REDIRECT_PATH', '/auth/wechat');
    sessionStorage.clear();

    hrefSetter = vi.fn<(value: string) => void>();
    const locationMock = {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/login',
      search: '',
      hash: '',
      href: 'https://example.com/login',
      origin: 'https://example.com',
    };
    Object.defineProperty(locationMock, 'href', {
      configurable: true,
      get: () => 'https://example.com/login',
      set: (value: string) => {
        hrefSetter(value);
      },
    });
    vi.stubGlobal('location', locationMock);
    window.history.replaceState({}, '', '/login');
  });

  afterEach(() => {
    scope.stop();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('authorize redirects to qrconnect with fixed redirect_uri', () => {
    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');
    api.authorize('/composables/use-wechat-qr-auth');

    expect(hrefSetter).toHaveBeenCalledTimes(1);
    const url = String(hrefSetter.mock.calls[0]?.[0]);
    expect(url).toContain(
      'https://open.weixin.qq.com/connect/qrconnect?',
    );
    expect(url).toContain('appid=wx-open-test');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=snsapi_login');
    expect(url).toContain('#wechat_redirect');

    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/auth/wechat');
    expect(redirectUri.includes('#')).toBe(false);

    const state = url.match(/state=([^&#]+)/)?.[1];
    expect(state).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const stored = JSON.parse(
      sessionStorage.getItem(WECHAT_QR_OAUTH_STORAGE_KEY) ?? '{}',
    ) as { state?: string; returnTo?: string };
    expect(stored.state).toBe(state);
    expect(stored.returnTo).toBe('/composables/use-wechat-qr-auth');
  });

  it('defaults redirect path to /auth/wechat when env unset', () => {
    vi.stubEnv('VITE_WECHAT_QR_REDIRECT_PATH', '');
    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');
    api.authorize();

    const url = String(hrefSetter.mock.calls[0]?.[0]);
    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/auth/wechat');
  });

  it('sets stateValid true when URL state matches sessionStorage', () => {
    const state = '11111111-1111-4111-8111-111111111111';
    sessionStorage.setItem(
      WECHAT_QR_OAUTH_STORAGE_KEY,
      JSON.stringify({ state, returnTo: '/home' }),
    );
    window.history.replaceState(
      {},
      '',
      `/auth/wechat?code=oauth-code-1&state=${state}`,
    );

    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');

    expect(api.code.value).toBe('oauth-code-1');
    expect(api.state.value).toBe(state);
    expect(api.stateValid.value).toBe(true);
    expect(api.returnTo.value).toBe('/home');
  });

  it('sets stateValid false when state mismatches', () => {
    sessionStorage.setItem(
      WECHAT_QR_OAUTH_STORAGE_KEY,
      JSON.stringify({ state: 'expected-state' }),
    );
    window.history.replaceState(
      {},
      '',
      '/auth/wechat?code=oauth-code-1&state=wrong-state',
    );

    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');

    expect(api.stateValid.value).toBe(false);
    expect(api.returnTo.value).toBeUndefined();
  });

  it('keeps stateValid null without callback params', () => {
    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');
    expect(api.code.value).toBeUndefined();
    expect(api.state.value).toBeUndefined();
    expect(api.stateValid.value).toBeNull();
  });

  it('clearCallbackParams removes code/state and storage', () => {
    const state = '22222222-2222-4222-8222-222222222222';
    sessionStorage.setItem(
      WECHAT_QR_OAUTH_STORAGE_KEY,
      JSON.stringify({ state, returnTo: '/home' }),
    );
    window.history.replaceState(
      {},
      '',
      `/auth/wechat?code=oauth-code-1&state=${state}&keep=1`,
    );

    const api = scope.run(() => useWechatQrAuth());
    if (!api) throw new Error('scope did not return useWechatQrAuth');
    expect(api.code.value).toBe('oauth-code-1');

    api.clearCallbackParams();

    expect(sessionStorage.getItem(WECHAT_QR_OAUTH_STORAGE_KEY)).toBeNull();
    expect(window.location.search).not.toContain('code=');
    expect(window.location.search).not.toContain('state=');
    expect(window.location.search).toContain('keep=1');
    expect(api.code.value).toBeUndefined();
    expect(api.state.value).toBeUndefined();
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm exec vitest run src/composables/__tests__/use-wechat-qr-auth/use-wechat-qr-auth.test.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 4: 最小实现**

Create `src/composables/use-wechat-qr-auth/use-wechat-qr-auth.ts`:

```ts
import { ref, watchEffect, type Ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

export const WECHAT_QR_OAUTH_STORAGE_KEY = 'wechat-qr-oauth';

type StoredOAuth = {
  state: string;
  returnTo?: string;
};

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function readStored(): StoredOAuth | undefined {
  try {
    const raw = sessionStorage.getItem(WECHAT_QR_OAUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredOAuth;
    if (typeof parsed?.state !== 'string') return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

/**
 * WeChat Open Platform website QR login helper (`qrconnect`).
 * OAuth plumbing only — exchange the `code` on the callback page.
 *
 * @example
 * const { authorize } = useWechatQrAuth()
 * authorize('/composables/use-wechat-qr-auth')
 */
export function useWechatQrAuth(): {
  code: Ref<string | undefined>;
  state: Ref<string | undefined>;
  stateValid: Ref<boolean | null>;
  returnTo: Ref<string | undefined>;
  authorize: (returnTo?: string) => void;
  clearCallbackParams: () => void;
} {
  const params = useUrlSearchParams('history');
  const code = ref<string | undefined>(undefined);
  const state = ref<string | undefined>(undefined);
  const stateValid = ref<boolean | null>(null);
  const returnTo = ref<string | undefined>(undefined);

  watchEffect(() => {
    const codeValue = params.code;
    const stateValue = params.state;
    code.value = typeof codeValue === 'string' ? codeValue : undefined;
    state.value = typeof stateValue === 'string' ? stateValue : undefined;

    if (!code.value && !state.value) {
      stateValid.value = null;
      returnTo.value = undefined;
      return;
    }

    const stored = readStored();
    const ok = Boolean(stored && state.value && stored.state === state.value);
    stateValid.value = ok;
    returnTo.value = ok ? stored?.returnTo : undefined;
  });

  function authorize(nextReturnTo?: string) {
    const oauthState = crypto.randomUUID();
    const payload: StoredOAuth = { state: oauthState };
    if (nextReturnTo) {
      payload.returnTo = normalizePath(nextReturnTo);
    }
    sessionStorage.setItem(
      WECHAT_QR_OAUTH_STORAGE_KEY,
      JSON.stringify(payload),
    );

    const redirectPath = normalizePath(
      import.meta.env.VITE_WECHAT_QR_REDIRECT_PATH || '/auth/wechat',
    );
    const redirectUri = `${location.protocol}//${location.host}${redirectPath}`;
    const appId = import.meta.env.VITE_WECHAT_OPEN_APPID ?? '';

    location.href =
      `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=snsapi_login&state=${oauthState}` +
      `#wechat_redirect`;
  }

  function clearCallbackParams() {
    delete params.code;
    delete params.state;
    sessionStorage.removeItem(WECHAT_QR_OAUTH_STORAGE_KEY);
  }

  return {
    code,
    state,
    stateValid,
    returnTo,
    authorize,
    clearCallbackParams,
  };
}
```

Create `src/composables/use-wechat-qr-auth/index.ts`:

```ts
export {
  WECHAT_QR_OAUTH_STORAGE_KEY,
  useWechatQrAuth,
} from './use-wechat-qr-auth';
export {
  exchangeWechatQrCode,
  type WechatQrToken,
} from './exchange-wechat-qr-code';
```

Modify `src/composables/index.ts` — 在 wechat 相关 export 旁增加：

```ts
export * from './use-wechat-qr-auth';
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm exec vitest run src/composables/__tests__/use-wechat-qr-auth/`

Expected: PASS（Task 1 + Task 2 全部）

若 `clearCallbackParams` 后 `window.location.search` 断言在 happy-dom 不稳定：改为断言 `api.code.value` / `api.state.value` 为 `undefined`，并用 `params` 副作用或 `new URL(location.href).searchParams` 读取；必要时在实现里对 `history.replaceState` 显式同步。优先保持与 `useUrlSearchParams('history')` 一致的删除方式。

- [ ] **Step 6: Commit**

```bash
git add \
  src/env.d.ts \
  src/composables/use-wechat-qr-auth/use-wechat-qr-auth.ts \
  src/composables/use-wechat-qr-auth/index.ts \
  src/composables/index.ts \
  src/composables/__tests__/use-wechat-qr-auth/use-wechat-qr-auth.test.ts
git commit -m "$(cat <<'EOF'
feat(composables): add useWechatQrAuth for PC QR OAuth

EOF
)"
```

---

### Task 3: 中间页 `/auth/wechat` + 路由 + demo

**Files:**

- Create: `src/views/composables/wechat-qr-auth-callback.vue`
- Create: `src/views/composables/use-wechat-qr-auth-demo.vue`
- Modify: `src/router/index.ts`

**Interfaces:**

- Consumes: `useWechatQrAuth`、`exchangeWechatQrCode`、`WechatQrToken`、`Button`（`@/ui/button`）、`vue-router`
- Produces: 路由 `auth-wechat`（`/auth/wechat`）、`composables-use-wechat-qr-auth`

- [ ] **Step 1: 创建中间页**

Create `src/views/composables/wechat-qr-auth-callback.vue`:

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  exchangeWechatQrCode,
  useWechatQrAuth,
  type WechatQrToken,
} from '@/composables';
import { Button } from '@/ui/button';

defineOptions({ name: 'WechatQrAuthCallback' });

const router = useRouter();
const { code, stateValid, returnTo, clearCallbackParams } = useWechatQrAuth();

const exchanging = ref(false);
const token = ref<WechatQrToken | undefined>(undefined);
const exchangeError = ref<string | undefined>(undefined);
let exchangedFor: string | undefined;

watch(
  [stateValid, code],
  async ([valid, oauthCode]) => {
    if (valid !== true || !oauthCode) return;
    if (exchangedFor === oauthCode) return;
    exchangedFor = oauthCode;

    exchanging.value = true;
    exchangeError.value = undefined;
    try {
      token.value = await exchangeWechatQrCode(oauthCode);
      clearCallbackParams();
    } catch (error) {
      exchangeError.value =
        error instanceof Error ? error.message : String(error);
    } finally {
      exchanging.value = false;
    }
  },
  { immediate: true },
);

function goReturnTo() {
  if (!returnTo.value) return;
  void router.push(returnTo.value);
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 p-8">
    <h1 class="text-xl font-semibold">微信扫码回调</h1>
    <p class="text-sm text-muted-foreground">
      当前为 stub 换票（
      <code>exchangeWechatQrCode</code>
      ）。替换该文件实现即可对接真实后端。
    </p>

    <dl class="space-y-2 text-sm">
      <div>
        <dt class="text-muted-foreground">stateValid</dt>
        <dd>
          <code>{{ stateValid }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">code</dt>
        <dd>
          <code>{{ code ?? '—' }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">returnTo</dt>
        <dd>
          <code>{{ returnTo ?? '—' }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">exchanging</dt>
        <dd>
          <code>{{ exchanging }}</code>
        </dd>
      </div>
      <div>
        <dt class="text-muted-foreground">token</dt>
        <dd>
          <code>{{ token ? JSON.stringify(token) : '—' }}</code>
        </dd>
      </div>
      <div v-if="exchangeError">
        <dt class="text-muted-foreground">exchangeError</dt>
        <dd class="text-destructive">
          <code>{{ exchangeError }}</code>
        </dd>
      </div>
      <div v-if="stateValid === false">
        <dt class="text-muted-foreground">error</dt>
        <dd class="text-destructive">state 校验失败，未换票</dd>
      </div>
    </dl>

    <Button v-if="token && returnTo" type="button" @click="goReturnTo">
      前往 {{ returnTo }}
    </Button>
  </div>
</template>
```

- [ ] **Step 2: 创建 API demo 页**

Create `src/views/composables/use-wechat-qr-auth-demo.vue`:

```vue
<script setup lang="ts">
import DemoApiTable from '@/components/demo/demo-api-table.vue';
import DemoBlock from '@/components/demo/demo-block.vue';
import DemoCode from '@/components/demo/demo-code.vue';
import DemoPage from '@/components/demo/demo-page.vue';

defineOptions({ name: 'UseWechatQrAuthDemo' });

const codeDemo = `import { useWechatQrAuth } from '@/composables'

// 登录页：整页跳转 qrconnect（固定回调 /auth/wechat）
const { authorize } = useWechatQrAuth()
authorize('/composables/use-wechat-qr-auth')

// 中间页 /auth/wechat：
// const { code, stateValid, returnTo, clearCallbackParams } = useWechatQrAuth()
// if (stateValid && code) {
//   const token = await exchangeWechatQrCode(code) // stub
//   clearCallbackParams()
// }`;
</script>

<template>
  <DemoPage width="wide">
    <template #description>
      微信开放平台网站应用扫码登录（
      <code>qrconnect</code>
      /
      <code>snsapi_login</code>
      ）。
      <code>useWechatQrAuth</code>
      只做 OAuth 管道；模拟换票在中间页
      <code>/auth/wechat</code>
      调用
      <code>exchangeWechatQrCode</code>
      。需配置
      <code>VITE_WECHAT_OPEN_APPID</code>
      ，并在开放平台登记与
      <code>VITE_WECHAT_QR_REDIRECT_PATH</code>
      （默认
      <code>/auth/wechat</code>
      ）一致的回调。
    </template>

    <template #api>
      <DemoApiTable title="useWechatQrAuth() returns">
        <tr>
          <td><code>code</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>URL 上的 OAuth <code>code</code>。</td>
        </tr>
        <tr>
          <td><code>state</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>URL 上的 OAuth <code>state</code>。</td>
        </tr>
        <tr>
          <td><code>stateValid</code></td>
          <td><code>Ref&lt;boolean | null&gt;</code></td>
          <td>
            <code>null</code>
            未回调；
            <code>true</code>
            /
            <code>false</code>
            为校验结果。
          </td>
        </tr>
        <tr>
          <td><code>returnTo</code></td>
          <td><code>Ref&lt;string | undefined&gt;</code></td>
          <td>
            校验通过后从 sessionStorage 取出的回跳 path。
          </td>
        </tr>
        <tr>
          <td><code>authorize</code></td>
          <td><code>(returnTo?: string) =&gt; void</code></td>
          <td>整页跳转 <code>qrconnect</code>。</td>
        </tr>
        <tr>
          <td><code>clearCallbackParams</code></td>
          <td><code>() =&gt; void</code></td>
          <td>清除 URL <code>code</code>/<code>state</code> 与 storage。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="exchangeWechatQrCode(code)">
        <tr>
          <td><code>returns</code></td>
          <td><code>Promise&lt;WechatQrToken&gt;</code></td>
          <td>stub 模拟换票；后续替换为真实后端。</td>
        </tr>
      </DemoApiTable>

      <DemoApiTable title="Env">
        <tr>
          <td><code>VITE_WECHAT_OPEN_APPID</code></td>
          <td><code>string</code></td>
          <td>网站应用 AppId（扫码登录）。</td>
        </tr>
        <tr>
          <td><code>VITE_WECHAT_QR_REDIRECT_PATH</code></td>
          <td><code>string</code></td>
          <td>固定回调 path，默认 <code>/auth/wechat</code>。</td>
        </tr>
      </DemoApiTable>
    </template>

    <DemoBlock title="代码演示">
      <template #hint>
        playground 无法真实完成微信扫码。本地验证中间页：先
        <code>authorize</code>
        写入 sessionStorage，或手动写入
        <code>wechat-qr-oauth</code>
        后访问
        <code>/auth/wechat?code=demo&amp;state=...</code>
        。
      </template>
      <DemoCode :code="codeDemo" lang="ts" />
    </DemoBlock>
  </DemoPage>
</template>
```

- [ ] **Step 3: 注册路由**

Modify `src/router/index.ts`:

1. 增加 import：

```ts
import UseWechatQrAuthDemo from '@/views/composables/use-wechat-qr-auth-demo.vue';
import WechatQrAuthCallback from '@/views/composables/wechat-qr-auth-callback.vue';
```

2. 在 `routes` 数组中，**与** PlaygroundLayout 路由 **并列**增加顶层回调（不套 playground shell，便于聚焦中间页）：

```ts
{
  path: '/auth/wechat',
  name: 'auth-wechat',
  component: WechatQrAuthCallback,
  meta: { title: '微信扫码回调' },
},
```

3. 在 WeChat group children 中、`use-wechat-auth` 之后插入 demo（order 可插在 1 与 2 之间，或使用 `order: 1.5` 不合适则整体重排为 1=auth、2=qr-auth、3=wechat、4=wecom）：

推荐重排 WeChat orders：

| path | title | order |
|------|-------|-------|
| `composables/use-wechat-auth` | use-wechat-auth | 1 |
| `composables/use-wechat-qr-auth` | use-wechat-qr-auth | 2 |
| `composables/use-wechat` | use-wechat | 3 |
| `composables/use-wecom` | use-wecom | 4 |

```ts
{
  path: 'composables/use-wechat-qr-auth',
  name: 'composables-use-wechat-qr-auth',
  component: UseWechatQrAuthDemo,
  meta: { title: 'use-wechat-qr-auth', group: 'WeChat', order: 2 },
},
```

并相应把 `use-wechat` → order 3、`use-wecom` → order 4。

- [ ] **Step 4: typecheck + 相关测试**

Run:

```bash
pnpm typecheck
pnpm exec vitest run src/composables/__tests__/use-wechat-qr-auth/
```

Expected: typecheck 无错；vitest PASS。

- [ ] **Step 5: Commit**

```bash
git add \
  src/views/composables/wechat-qr-auth-callback.vue \
  src/views/composables/use-wechat-qr-auth-demo.vue \
  src/router/index.ts
git commit -m "$(cat <<'EOF'
feat(composables): add QR auth callback page and demo

EOF
)"
```

---

## Spec coverage (self-review)

| Spec 要求 | Task |
|-----------|------|
| `useWechatQrAuth` OAuth 管道 | Task 2 |
| stub `exchangeWechatQrCode` | Task 1 |
| 中间页编排换票 / 清参 / 不自动跳转 | Task 3 |
| env 变量 | Task 2 Step 1 |
| 路由 `/auth/wechat` + demo | Task 3 |
| 单测 composable + stub | Task 1–2 |
| 不改 `useWechatAuth`、无弹窗、无真实后端 | Global Constraints |

## Placeholder scan

无 TBD /「similar to Task N」占位；测试与实现代码均已写出。

## Type consistency

- `WechatQrToken` / `exchangeWechatQrCode` / `useWechatQrAuth` / `WECHAT_QR_OAUTH_STORAGE_KEY` 命名在 Task 1–3 一致
- 中间页 UI 状态 `exchanging` / `token` / `exchangeError` 仅存在于 callback 组件

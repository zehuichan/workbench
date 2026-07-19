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

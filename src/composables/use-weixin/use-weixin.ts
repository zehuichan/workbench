import { ref, type Ref } from 'vue';
import { createGlobalState } from '@vueuse/core';

export type FetchWxJsConfig = (
  url: string,
) => Promise<{ data: Record<string, unknown> }>;

async function defaultFetchWxJsConfig(
  _url: string,
): Promise<{ data: Record<string, unknown> }> {
  // TODO: replace with real GET /wechat/jssdk/config (param REDIRECT_URI).
  return { data: {} };
}

let fetchWxJsConfigImpl: FetchWxJsConfig = defaultFetchWxJsConfig;

/**
 * Stub JSSDK config fetcher. Delegates to a replaceable impl for tests.
 * Do not re-export from @/composables.
 */
export async function fetchWxJsConfig(
  url: string,
): Promise<{ data: Record<string, unknown> }> {
  return fetchWxJsConfigImpl(url);
}

/** @internal test helper — restore with `resetFetchWxJsConfigImpl`. */
export function setFetchWxJsConfigImpl(fn: FetchWxJsConfig) {
  fetchWxJsConfigImpl = fn;
}

/** @internal test helper */
export function resetFetchWxJsConfigImpl() {
  fetchWxJsConfigImpl = defaultFetchWxJsConfig;
}

function isWeixinBrowser() {
  return (
    typeof navigator !== 'undefined' &&
    /MicroMessenger/i.test(navigator.userAgent)
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
        const { data } = await fetchWxJsConfigImpl(url);

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

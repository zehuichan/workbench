import { ref, type Ref } from 'vue';
import { createGlobalState } from '@vueuse/core';
import { getJsApiTicket } from '@/api/signature';

function isWechatBrowser() {
  return (
    typeof navigator !== 'undefined' &&
    /MicroMessenger/i.test(navigator.userAgent)
  );
}

/**
 * WeChat JSSDK bootstrap (single global wx.config).
 *
 * - Skips when not WeChat / VITE_JSSDK_ENABLED !== 'true' / no window.wx
 *
 * @example
 * const [ready, $wx] = useWechat()
 * $wx?.scanQRCode?.({ needResult: 1, success: console.log })
 */
export const useWechat = createGlobalState((): [
  Ref<boolean>,
  WeixinJsSdk | undefined,
] => {
  const ready = ref(false);
  const wx = typeof window !== 'undefined' ? window.wx : undefined;
  let pending: Promise<void> | null = null;
  const enabled = import.meta.env.VITE_JSSDK_ENABLED === 'true';

  async function setup() {
    if (!enabled || !wx || !isWechatBrowser()) {
      ready.value = false;
      return;
    }
    if (pending) return pending;

    pending = (async () => {
      try {
        const data = await getJsApiTicket();

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

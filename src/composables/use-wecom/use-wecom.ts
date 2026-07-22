import { ref, type Ref } from 'vue';
import { createGlobalState } from '@vueuse/core';
import * as ww from '@wecom/jssdk';
import { getAppJsApiTicket, getJsApiTicket } from '@/api/signature';

/** Playground keeps an empty list; real apps pass the JSAPIs they need. */
const jsApiList: string[] = [];

function isWecomBrowser() {
  return typeof navigator !== 'undefined' && /wxwork/i.test(navigator.userAgent);
}

/**
 * WeCom JSSDK bootstrap (single global `ww.register`).
 *
 * - Blueprint mirrors `useWechat` (`createGlobalState` + pending setup)
 * - Register shape follows `@wecom/jssdk`
 * - `ready` is true only after `onAgentConfigSuccess`
 * - Skips when not WeCom / `VITE_WW_JSSDK_ENABLED !== 'true'`
 *
 * @example
 * const [ready, $ww] = useWecom()
 * watch(ready, (ok) => {
 *   if (!ok) return
 *   void $ww.getLocation({ type: 'gcj02' })
 * })
 */
export const useWecom = createGlobalState((): [Ref<boolean>, typeof ww] => {
  const ready = ref(false);
  let pending: Promise<void> | null = null;
  const enabled = import.meta.env.VITE_WW_JSSDK_ENABLED === 'true';

  async function setup() {
    if (!enabled || !isWecomBrowser()) {
      ready.value = false;
      return;
    }
    if (pending) return pending;

    pending = (async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          ww.register({
            corpId: import.meta.env.VITE_WORK_WECHAT_CORP_ID ?? '',
            agentId: import.meta.env.VITE_WORK_WECHAT_AGENT_ID,
            jsApiList,
            getConfigSignature: async () => getJsApiTicket(),
            getAgentConfigSignature: async () => getAppJsApiTicket(),
            onConfigFail: (err) => {
              ready.value = false;
              pending = null;
              console.error('[ww.config]', err);
              reject(err);
            },
            onAgentConfigSuccess: () => {
              ready.value = true;
              resolve();
            },
            onAgentConfigFail: (err) => {
              ready.value = false;
              pending = null;
              console.error('[ww.agentConfig]', err);
              reject(err);
            },
          });
        });
      } catch (e) {
        ready.value = false;
        pending = null;
        console.error('[ww.register]', e);
      }
    })();

    return pending;
  }

  void setup();

  return [ready, ww];
});

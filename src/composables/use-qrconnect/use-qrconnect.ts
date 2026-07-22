import { ref, watchEffect, type Ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

/**
 * WeChat Open Platform website QR login (`qrconnect` / `snsapi_login`).
 *
 * Same shape as `useWechatAuth`; differs in endpoint, scope, and AppId.
 *
 * @example
 * const [code, authorize] = useQrconnect()
 * authorize('/auth/wechat')
 */
export function useQrconnect(): [Ref<string | undefined>, (redirect?: string) => void] {
  const params = useUrlSearchParams('history');
  const code = ref<string | undefined>(undefined);

  watchEffect(() => {
    const value = params.code;
    code.value = typeof value === 'string' ? value : undefined;
  });

  function authorize(redirect?: string) {
    const { protocol, host } = location;
    const nextPath = redirect
      ? redirect.startsWith('/')
        ? redirect
        : `/${redirect}`
      : import.meta.env.VITE_WECHAT_QR_REDIRECT_PATH || '/auth/wechat';
    const redirectUri = `${protocol}//${host}${nextPath}`;
    const appId = import.meta.env.VITE_WECHAT_OPEN_APPID ?? '';
    location.href =
      `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=snsapi_login&state=${crypto.randomUUID()}#wechat_redirect`;
  }

  return [code, authorize];
}

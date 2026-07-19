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

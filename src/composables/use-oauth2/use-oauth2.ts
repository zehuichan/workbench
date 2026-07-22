import { ref, watchEffect, type Ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

export type Oauth2Scope = 'snsapi_base' | 'snsapi_userinfo';

/**
 * WeChat web OAuth helper (History mode redirect_uri).
 *
 * `state` uses `crypto.randomUUID()` (unguessable, per RFC 6749 §10.12)
 * instead of a timestamp. Validate it server-side when exchanging `code`.
 *
 * @example
 * const [code, authorize] = useOauth2()
 * authorize('/login')
 */
export function useOauth2(
  scope: Oauth2Scope = 'snsapi_userinfo',
): [Ref<string | undefined>, (redirect?: string) => void] {
  const params = useUrlSearchParams('history');
  const code = ref<string | undefined>(undefined);

  watchEffect(() => {
    const value = params.code;
    code.value = typeof value === 'string' ? value : undefined;
  });

  function authorize(redirect?: string) {
    const { protocol, host, pathname, search } = location;
    const nextPath = redirect ? (redirect.startsWith('/') ? redirect : `/${redirect}`) : pathname;
    const redirectUri = `${protocol}//${host}${nextPath}${search}`;
    const appId = import.meta.env.VITE_WECHAT_APPID ?? '';
    location.href =
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=${scope}&state=${crypto.randomUUID()}#wechat_redirect`;
  }

  return [code, authorize];
}

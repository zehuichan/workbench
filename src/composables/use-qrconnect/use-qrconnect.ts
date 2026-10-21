import type { ConfigurableWindow } from '@vueuse/core';

import type { ShallowRef } from 'vue';

import type { Oauth2ParamsMode } from '../use-oauth2/use-oauth2';

import { shallowRef, watchEffect } from 'vue';

import { defaultWindow, useUrlSearchParams } from '@vueuse/core';

const QRCONNECT_ENDPOINT = 'https://open.weixin.qq.com/connect/qrconnect';

export interface UseQrconnectOptions extends ConfigurableWindow {
  /** Open Platform AppId. Defaults to `VITE_WECHAT_OPEN_APPID`. */
  appId?: string;
  /** Router mode, so hash-routed apps still find `code`. */
  mode?: Oauth2ParamsMode;
  /** Callback path used when `authorize()` is called without an argument. */
  redirectPath?: string;
}

export interface UseQrconnectReturn {
  /** Leaves for the qrconnect endpoint, returning to `redirect`. */
  authorize: (redirect?: string) => void;
  /** `code` from the current URL; `undefined` until WeChat redirects back. */
  code: ShallowRef<string | undefined>;
}

/**
 * WeChat Open Platform website QR login (`qrconnect` / `snsapi_login`).
 *
 * Same shape as `useOauth2`; differs in endpoint, scope, and AppId.
 *
 * @example
 * const { code, authorize } = useQrconnect()
 * authorize('/auth/wechat')
 */
export function useQrconnect(
  options: UseQrconnectOptions = {},
): UseQrconnectReturn {
  const {
    window = defaultWindow,
    appId = import.meta.env.VITE_WECHAT_OPEN_APPID ?? '',
    redirectPath = import.meta.env.VITE_WECHAT_QR_REDIRECT_PATH ||
      '/auth/wechat',
    mode = 'history',
  } = options;

  const params = useUrlSearchParams(mode, { window });
  const code = shallowRef<string | undefined>(undefined);

  watchEffect(() => {
    const value = params.code;
    code.value = typeof value === 'string' ? value : undefined;
  });

  function authorize(redirect?: string): void {
    if (!window) return;
    const { protocol, host } = window.location;
    const target = redirect ?? redirectPath;
    const nextPath = target.startsWith('/') ? target : `/${target}`;
    const redirectUri = `${protocol}//${host}${nextPath}`;
    window.location.href =
      `${QRCONNECT_ENDPOINT}?appid=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=snsapi_login&state=${window.crypto.randomUUID()}#wechat_redirect`;
  }

  return { code, authorize };
}

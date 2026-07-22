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
    const url = new URL(location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', next);
    delete params.code;
    delete params.state;
    sessionStorage.removeItem(WECHAT_QR_OAUTH_STORAGE_KEY);
    code.value = undefined;
    state.value = undefined;
    stateValid.value = null;
    returnTo.value = undefined;
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

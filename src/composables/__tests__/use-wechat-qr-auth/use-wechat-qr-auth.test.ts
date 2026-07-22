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
    const search = `?code=oauth-code-1&state=${state}`;
    vi.stubGlobal('location', {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/auth/wechat',
      search,
      hash: '',
      href: `https://example.com/auth/wechat${search}`,
      origin: 'https://example.com',
    });
    window.history.replaceState({}, '', `/auth/wechat${search}`);

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
    const search = '?code=oauth-code-1&state=wrong-state';
    vi.stubGlobal('location', {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/auth/wechat',
      search,
      hash: '',
      href: `https://example.com/auth/wechat${search}`,
      origin: 'https://example.com',
    });
    window.history.replaceState({}, '', `/auth/wechat${search}`);

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
    // useUrlSearchParams writes via real location/history — avoid stubbing location here
    vi.unstubAllGlobals();
    vi.stubEnv('VITE_WECHAT_OPEN_APPID', 'wx-open-test');
    vi.stubEnv('VITE_WECHAT_QR_REDIRECT_PATH', '/auth/wechat');

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
    expect(api.code.value).toBeUndefined();
    expect(api.state.value).toBeUndefined();
    expect(api.stateValid.value).toBeNull();
    const kept = new URL(window.location.href).searchParams;
    expect(kept.has('code')).toBe(false);
    expect(kept.has('state')).toBe(false);
    expect(kept.get('keep')).toBe('1');
  });
});

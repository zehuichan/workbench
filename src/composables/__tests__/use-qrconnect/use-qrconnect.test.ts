import { effectScope, type EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useQrconnect } from '../../use-qrconnect/use-qrconnect';

describe('useQrconnect', () => {
  let scope: EffectScope;
  let hrefSetter: ReturnType<typeof vi.fn<(value: string) => void>>;

  beforeEach(() => {
    scope = effectScope();
    vi.stubEnv('VITE_WECHAT_OPEN_APPID', 'wx-open-test');
    vi.stubEnv('VITE_WECHAT_QR_REDIRECT_PATH', '/auth/wechat');

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
    window.history.replaceState({}, '', '/');
  });

  it('syncs code from the URL search params', () => {
    const search = '?code=oauth-code-1&state=any-state';
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

    const pair = scope.run(() => useQrconnect());
    if (!pair) throw new Error('scope did not return useQrconnect');
    const [code] = pair;
    expect(code.value).toBe('oauth-code-1');
  });

  it('authorize redirects to qrconnect with history redirect_uri', () => {
    const pair = scope.run(() => useQrconnect());
    if (!pair) throw new Error('scope did not return useQrconnect');
    const [, authorize] = pair;
    authorize();

    expect(hrefSetter).toHaveBeenCalledTimes(1);
    const url = String(hrefSetter.mock.calls[0]?.[0]);
    expect(url).toContain('https://open.weixin.qq.com/connect/qrconnect?');
    expect(url).toContain('appid=wx-open-test');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=snsapi_login');
    expect(url).toContain('#wechat_redirect');

    const state = url.match(/state=([^&#]+)/)?.[1];
    expect(state).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    const redirectUri = decodeURIComponent(url.match(/redirect_uri=([^&]+)/)?.[1] ?? '');
    expect(redirectUri).toBe('https://example.com/auth/wechat');
    expect(redirectUri.includes('#')).toBe(false);
  });

  it('authorize(redirect) replaces redirect_uri pathname', () => {
    const pair = scope.run(() => useQrconnect());
    if (!pair) throw new Error('scope did not return useQrconnect');
    const [, authorize] = pair;
    authorize('/custom/callback');

    const url = String(hrefSetter.mock.calls[0]?.[0]);
    const redirectUri = decodeURIComponent(url.match(/redirect_uri=([^&]+)/)?.[1] ?? '');
    expect(redirectUri).toBe('https://example.com/custom/callback');
  });
});

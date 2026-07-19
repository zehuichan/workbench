import { effectScope, type EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../use-auth/use-auth';

describe('useAuth', () => {
  let scope: EffectScope;
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scope = effectScope();
    vi.stubEnv('VITE_WECHAT_APPID', 'wx-test-appid');

    hrefSetter = vi.fn();
    const locationMock = {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/app/home',
      search: '?from=demo',
      hash: '',
      href: 'https://example.com/app/home?from=demo',
      origin: 'https://example.com',
    };
    Object.defineProperty(locationMock, 'href', {
      configurable: true,
      get: () => 'https://example.com/app/home?from=demo',
      set: hrefSetter,
    });
    vi.stubGlobal('location', locationMock);

    window.history.replaceState({}, '', '/app/home?from=demo');
  });

  afterEach(() => {
    scope.stop();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('syncs code from the URL search params', () => {
    vi.stubGlobal('location', {
      protocol: 'https:',
      host: 'example.com',
      pathname: '/app/home',
      search: '?code=oauth-code-1&from=demo',
      hash: '',
      href: 'https://example.com/app/home?code=oauth-code-1&from=demo',
      origin: 'https://example.com',
    });
    window.history.replaceState(
      {},
      '',
      '/app/home?code=oauth-code-1&from=demo',
    );
    const pair = scope.run(() => useAuth());
    if (!pair) throw new Error('scope did not return useAuth');
    const [code] = pair;
    expect(code.value).toBe('oauth-code-1');
  });

  it('authorize redirects with history redirect_uri (no hash path)', () => {
    const pair = scope.run(() => useAuth('snsapi_base'));
    if (!pair) throw new Error('scope did not return useAuth');
    const [, authorize] = pair;
    authorize();

    expect(hrefSetter).toHaveBeenCalledTimes(1);
    const url = String(hrefSetter.mock.calls[0]?.[0]);
    expect(url).toContain(
      'https://open.weixin.qq.com/connect/oauth2/authorize?',
    );
    expect(url).toContain('appid=wx-test-appid');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=snsapi_base');
    expect(url).toContain('#wechat_redirect');

    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/app/home?from=demo');
    expect(redirectUri.includes('#')).toBe(false);
  });

  it('authorize(redirect) replaces pathname', () => {
    const pair = scope.run(() => useAuth());
    if (!pair) throw new Error('scope did not return useAuth');
    const [, authorize] = pair;
    authorize('/login');

    const url = String(hrefSetter.mock.calls[0]?.[0]);
    const redirectUri = decodeURIComponent(
      url.match(/redirect_uri=([^&]+)/)?.[1] ?? '',
    );
    expect(redirectUri).toBe('https://example.com/login?from=demo');
  });
});

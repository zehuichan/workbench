import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUseWeixin() {
  return import('../../use-weixin/use-weixin');
}

function mockWx(handlers?: {
  onConfig?: (config: Record<string, unknown>) => void;
  readyMode?: 'ready' | 'error';
  errorPayload?: unknown;
}) {
  const readyMode = handlers?.readyMode ?? 'ready';
  const wx = {
    config: vi.fn((config: Record<string, unknown>) => {
      handlers?.onConfig?.(config);
    }),
    ready: vi.fn((fn: () => void) => {
      if (readyMode === 'ready') fn();
    }),
    error: vi.fn((fn: (err: unknown) => void) => {
      if (readyMode === 'error')
        fn(handlers?.errorPayload ?? new Error('wx error'));
    }),
  };
  vi.stubGlobal('wx', wx);
  window.wx = wx;
  return wx;
}

describe('useWeixin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_JSSDK_ENABLED', 'true');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    vi.stubGlobal('location', {
      href: 'https://example.com/page?x=1#/hash',
    });
  });

  afterEach(async () => {
    try {
      const mod = await loadUseWeixin();
      mod.resetFetchWxJsConfigImpl();
    } catch {
      // module may be absent in early failures
    }
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // @ts-expect-error test cleanup
    delete window.wx;
  });

  it('does not initialize outside WeChat', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120' });
    const wx = mockWx();
    const mod = await loadUseWeixin();
    const fetchSpy = vi.fn().mockResolvedValue({ data: { appId: 'x' } });
    mod.setFetchWxJsConfigImpl(fetchSpy);

    const [ready] = mod.useWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_JSSDK_ENABLED', 'false');
    const wx = mockWx();
    const mod = await loadUseWeixin();
    const fetchSpy = vi.fn().mockResolvedValue({ data: {} });
    mod.setFetchWxJsConfigImpl(fetchSpy);

    const [ready] = mod.useWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('configures wx and sets ready on success', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWeixin();
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ data: { appId: 'wx1', jsApiList: [] } });
    mod.setFetchWxJsConfigImpl(fetchSpy);

    const [ready, sdk] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });

    expect(sdk).toBe(wx);
    expect(fetchSpy).toHaveBeenCalledWith(
      encodeURIComponent('https://example.com/page?x=1'),
    );
    expect(wx.config).toHaveBeenCalledWith({
      debug: false,
      appId: 'wx1',
      jsApiList: [],
    });
  });

  it('sets ready false when wx.error fires', async () => {
    const wx = mockWx({ readyMode: 'error' });
    const mod = await loadUseWeixin();
    mod.setFetchWxJsConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(wx.error).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWxJsConfig rejects', async () => {
    mockWx({ readyMode: 'ready' });
    const mod = await loadUseWeixin();
    mod.setFetchWxJsConfigImpl(async () => {
      throw new Error('stub down');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWeixin();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });
});

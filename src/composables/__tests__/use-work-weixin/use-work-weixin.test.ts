import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadUseWorkWeixin() {
  return import('../../use-work-weixin/use-work-weixin');
}

function mockWx(handlers?: {
  onConfig?: (config: Record<string, unknown>) => void;
  onAgentConfig?: (config: Record<string, unknown>) => void;
  readyMode?: 'ready' | 'error';
  agentMode?: 'success' | 'fail';
  errorPayload?: unknown;
}) {
  const readyMode = handlers?.readyMode ?? 'ready';
  const agentMode = handlers?.agentMode ?? 'success';
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
    agentConfig: vi.fn((config: Record<string, unknown>) => {
      handlers?.onAgentConfig?.(config);
      if (agentMode === 'success') {
        (config.success as (() => void) | undefined)?.();
      } else {
        (config.fail as ((err: unknown) => void) | undefined)?.(
          handlers?.errorPayload ?? new Error('agent error'),
        );
      }
    }),
  };
  vi.stubGlobal('wx', wx);
  window.wx = wx;
  return wx;
}

describe('useWorkWeixin', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'true');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 wxwork/4.0.0 MicroMessenger/7.0.1',
    });
    vi.stubGlobal('location', {
      href: 'https://example.com/page?x=1#/hash',
    });
  });

  afterEach(async () => {
    try {
      const mod = await loadUseWorkWeixin();
      mod.resetFetchWwJsConfigImpl();
      mod.resetFetchWwAgentConfigImpl();
    } catch {
      // module may be absent in early failures
    }
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.wx = undefined;
  });

  it('does not initialize outside Work Weixin', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    const wx = mockWx();
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi.fn().mockResolvedValue({ data: { appId: 'x' } });
    const agentSpy = vi.fn().mockResolvedValue({ data: {} });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(jsSpy).not.toHaveBeenCalled();
    expect(agentSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
    expect(wx.agentConfig).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_WW_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'false');
    const wx = mockWx();
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi.fn().mockResolvedValue({ data: {} });
    const agentSpy = vi.fn().mockResolvedValue({ data: {} });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(jsSpy).not.toHaveBeenCalled();
    expect(agentSpy).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('configures wx + agentConfig and sets ready on success', async () => {
    const wx = mockWx({ readyMode: 'ready', agentMode: 'success' });
    const mod = await loadUseWorkWeixin();
    const jsSpy = vi
      .fn()
      .mockResolvedValue({ data: { appId: 'ww1', jsApiList: [] } });
    const agentSpy = vi.fn().mockResolvedValue({
      data: { corpid: 'corp1', agentid: '1000001', jsApiList: [] },
    });
    mod.setFetchWwJsConfigImpl(jsSpy);
    mod.setFetchWwAgentConfigImpl(agentSpy);

    const [ready, sdk] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });

    const expectedUrl = encodeURIComponent('https://example.com/page?x=1');
    expect(sdk).toBe(wx);
    expect(jsSpy).toHaveBeenCalledWith(expectedUrl);
    expect(agentSpy).toHaveBeenCalledWith(expectedUrl);
    expect(wx.config).toHaveBeenCalledWith({
      debug: false,
      appId: 'ww1',
      jsApiList: [],
    });
    expect(wx.agentConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        corpid: 'corp1',
        agentid: '1000001',
        jsApiList: [],
        success: expect.any(Function),
        fail: expect.any(Function),
      }),
    );
  });

  it('sets ready false when wx.error fires', async () => {
    const wx = mockWx({ readyMode: 'error' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(wx.error).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('sets ready false when agentConfig fails', async () => {
    const wx = mockWx({ readyMode: 'ready', agentMode: 'fail' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(wx.agentConfig).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWwJsConfig rejects', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => {
      throw new Error('js stub down');
    });
    mod.setFetchWwAgentConfigImpl(async () => ({ data: {} }));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('sets ready false when fetchWwAgentConfig rejects', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    const mod = await loadUseWorkWeixin();
    mod.setFetchWwJsConfigImpl(async () => ({ data: {} }));
    mod.setFetchWwAgentConfigImpl(async () => {
      throw new Error('agent stub down');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    expect(wx.config).toHaveBeenCalled();
    expect(wx.agentConfig).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

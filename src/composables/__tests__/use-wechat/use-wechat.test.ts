import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getJsApiTicketMock } = vi.hoisted(() => ({
  getJsApiTicketMock: vi.fn(),
}));

vi.mock('@/api/signature', () => ({
  getJsApiTicket: getJsApiTicketMock,
  getAppJsApiTicket: vi.fn(),
}));

async function loadUseWechat() {
  return import('../../use-wechat/use-wechat');
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
      if (readyMode === 'error') fn(handlers?.errorPayload ?? new Error('wx error'));
    }),
  };
  vi.stubGlobal('wx', wx);
  window.wx = wx;
  return wx;
}

describe('useWechat', () => {
  beforeEach(() => {
    vi.resetModules();
    getJsApiTicketMock.mockReset();
    vi.stubEnv('VITE_JSSDK_ENABLED', 'true');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    vi.stubGlobal('location', {
      href: 'https://example.com/page?x=1#/hash',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.wx = undefined;
  });

  it('does not initialize outside WeChat', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/120' });
    const wx = mockWx();
    const mod = await loadUseWechat();

    const [ready] = mod.useWechat();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(getJsApiTicketMock).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_JSSDK_ENABLED', 'false');
    const wx = mockWx();
    const mod = await loadUseWechat();

    const [ready] = mod.useWechat();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(getJsApiTicketMock).not.toHaveBeenCalled();
    expect(wx.config).not.toHaveBeenCalled();
  });

  it('configures wx and sets ready on success', async () => {
    const wx = mockWx({ readyMode: 'ready' });
    getJsApiTicketMock.mockResolvedValue({
      timestamp: 1,
      nonceStr: 'n',
      signature: 's',
    });
    const mod = await loadUseWechat();

    const [ready, sdk] = mod.useWechat();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });

    expect(sdk).toBe(wx);
    expect(getJsApiTicketMock).toHaveBeenCalled();
    expect(wx.config).toHaveBeenCalledWith({
      debug: false,
      timestamp: 1,
      nonceStr: 'n',
      signature: 's',
    });
  });

  it('sets ready false when wx.error fires', async () => {
    const wx = mockWx({ readyMode: 'error' });
    getJsApiTicketMock.mockResolvedValue({
      timestamp: 0,
      nonceStr: '',
      signature: '',
    });
    const mod = await loadUseWechat();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWechat();
    await vi.waitFor(() => {
      expect(wx.error).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });

  it('sets ready false when getJsApiTicket rejects', async () => {
    mockWx({ readyMode: 'ready' });
    getJsApiTicketMock.mockRejectedValue(new Error('api down'));
    const mod = await loadUseWechat();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWechat();
    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(ready.value).toBe(false);
    errorSpy.mockRestore();
  });
});

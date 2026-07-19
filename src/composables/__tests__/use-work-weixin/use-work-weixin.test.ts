import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { registerMock, getJsApiTicketMock, getAppJsApiTicketMock } = vi.hoisted(
  () => ({
    registerMock: vi.fn(),
    getJsApiTicketMock: vi.fn(),
    getAppJsApiTicketMock: vi.fn(),
  }),
);

vi.mock('@wecom/jssdk', () => ({
  register: registerMock,
}));

vi.mock('@/api/signature', () => ({
  getJsApiTicket: getJsApiTicketMock,
  getAppJsApiTicket: getAppJsApiTicketMock,
}));

async function loadUseWorkWeixin() {
  return import('../../use-work-weixin/use-work-weixin');
}

describe('useWorkWeixin', () => {
  beforeEach(() => {
    vi.resetModules();
    registerMock.mockReset();
    getJsApiTicketMock.mockReset();
    getAppJsApiTicketMock.mockReset();
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'true');
    vi.stubEnv('VITE_WORK_WECHAT_CORP_ID', 'ww-corp-1');
    vi.stubEnv('VITE_WORK_WECHAT_AGENT_ID', '1000001');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 wxwork/4.0.0 MicroMessenger/7.0.1',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not initialize outside Work Weixin', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 MicroMessenger/8.0.0',
    });
    const mod = await loadUseWorkWeixin();

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(registerMock).not.toHaveBeenCalled();
    expect(getJsApiTicketMock).not.toHaveBeenCalled();
  });

  it('does not initialize when VITE_WW_JSSDK_ENABLED is not true', async () => {
    vi.stubEnv('VITE_WW_JSSDK_ENABLED', 'false');
    const mod = await loadUseWorkWeixin();

    const [ready] = mod.useWorkWeixin();
    await Promise.resolve();
    await Promise.resolve();

    expect(ready.value).toBe(false);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers via ww.register and sets ready on agentConfig success', async () => {
    getJsApiTicketMock.mockResolvedValue({
      timestamp: 1,
      nonceStr: 'n1',
      signature: 's1',
    });
    getAppJsApiTicketMock.mockResolvedValue({
      timestamp: 2,
      nonceStr: 'n2',
      signature: 's2',
    });
    const mod = await loadUseWorkWeixin();

    const [ready, sdk] = mod.useWorkWeixin();
    mod.useWorkWeixin();

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(1);
    });

    expect(sdk.register).toBe(registerMock);
    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        corpId: 'ww-corp-1',
        agentId: '1000001',
        jsApiList: [],
        getConfigSignature: expect.any(Function),
        getAgentConfigSignature: expect.any(Function),
      }),
    );

    const options = registerMock.mock.calls[0]?.[0] as {
      getConfigSignature: (url: string) => Promise<unknown>;
      getAgentConfigSignature: (url: string) => Promise<unknown>;
      onAgentConfigSuccess: () => void;
    };

    await expect(
      options.getConfigSignature('https://example.com/page'),
    ).resolves.toEqual({
      timestamp: 1,
      nonceStr: 'n1',
      signature: 's1',
    });
    await expect(
      options.getAgentConfigSignature('https://example.com/page'),
    ).resolves.toEqual({
      timestamp: 2,
      nonceStr: 'n2',
      signature: 's2',
    });

    expect(ready.value).toBe(false);
    options.onAgentConfigSuccess();
    await vi.waitFor(() => {
      expect(ready.value).toBe(true);
    });
  });

  it('sets ready false when config fails', async () => {
    const mod = await loadUseWorkWeixin();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalled();
    });

    const options = registerMock.mock.calls[0]?.[0] as {
      onConfigFail: (err: unknown) => void;
    };
    options.onConfigFail(new Error('config fail'));

    await vi.waitFor(() => {
      expect(ready.value).toBe(false);
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('sets ready false when agentConfig fails', async () => {
    const mod = await loadUseWorkWeixin();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const [ready] = mod.useWorkWeixin();
    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalled();
    });

    const options = registerMock.mock.calls[0]?.[0] as {
      onAgentConfigFail: (err: unknown) => void;
    };
    options.onAgentConfigFail(new Error('agent fail'));

    await vi.waitFor(() => {
      expect(ready.value).toBe(false);
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

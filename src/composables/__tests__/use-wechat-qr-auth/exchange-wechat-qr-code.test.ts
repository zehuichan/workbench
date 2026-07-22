import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exchangeWechatQrCode } from '../../use-wechat-qr-auth/exchange-wechat-qr-code';

describe('exchangeWechatQrCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves mock token for a non-empty code', async () => {
    const promise = exchangeWechatQrCode('abcdefghij');
    const assertion = expect(promise).resolves.toEqual({
      accessToken: 'mock-access-token-abcdefgh',
      openid: 'mock-openid-abcdefgh',
    });
    await vi.advanceTimersByTimeAsync(300);
    await assertion;
  });

  it('rejects when code is empty', async () => {
    const promise = exchangeWechatQrCode('');
    const assertion = expect(promise).rejects.toThrow('missing code');
    await vi.advanceTimersByTimeAsync(300);
    await assertion;
  });
});

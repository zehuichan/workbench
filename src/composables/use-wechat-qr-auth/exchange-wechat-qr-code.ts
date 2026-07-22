export type WechatQrToken = {
  accessToken: string;
  openid: string;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Mock WeChat Open Platform QR code exchange.
 * TODO: POST /api/auth/wechat/qr with `code` against a real backend.
 */
export async function exchangeWechatQrCode(
  code: string,
): Promise<WechatQrToken> {
  await delay(300);
  if (!code) throw new Error('missing code');
  const slice = code.slice(0, 8);
  return {
    accessToken: `mock-access-token-${slice}`,
    openid: `mock-openid-${slice}`,
  };
}

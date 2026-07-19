import type { SignatureData } from '@wecom/jssdk';

export async function getJsApiTicket(): Promise<SignatureData> {
  const res = await fetch('/api/signature/jsApiTicket');
  return res.json();
}

export async function getAppJsApiTicket(): Promise<SignatureData> {
  const res = await fetch('/api/signature/appJsApiTicket');
  return res.json();
}

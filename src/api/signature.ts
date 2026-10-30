import type { SignatureData } from '@wecom/jssdk';

import { request } from './request';

export async function getJsApiTicket(): Promise<SignatureData> {
  const { data } = await request.get<SignatureData>(
    '/api/signature/jsApiTicket',
  );
  return data;
}

export async function getAppJsApiTicket(): Promise<SignatureData> {
  const { data } = await request.get<SignatureData>(
    '/api/signature/appJsApiTicket',
  );
  return data;
}

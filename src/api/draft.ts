import { request } from './request';

const DRAFT_URL = '/api/draft';

/**
 * Reads the saved draft; `null` when none was saved.
 *
 * Falls back to `localStorage` when no server answers (see `localKey` on the request
 * config). The result is untrusted JSON: narrow it before use. Rejects on a server error
 * or an unparsable local payload.
 */
export async function getDraft(signal?: AbortSignal): Promise<unknown> {
  const { data } = await request.get<unknown>(DRAFT_URL, {
    localKey: DRAFT_URL,
    signal,
  });
  return data;
}

/**
 * Saves `value` as the draft, replacing the previous one.
 *
 * Falls back to `localStorage` when no server answers (see `localKey` on the request
 * config). Rejects on a server error or when `localStorage` is full.
 */
export async function saveDraft(
  value: object,
  signal?: AbortSignal,
): Promise<void> {
  await request.put(DRAFT_URL, value, { localKey: DRAFT_URL, signal });
}

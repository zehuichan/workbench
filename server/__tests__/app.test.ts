// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockApp } from '../app.ts';

const put = (body: string) => ({
  body,
  headers: { 'content-type': 'application/json' },
  method: 'PUT',
});

describe('createMockApp', () => {
  describe('draft', () => {
    it('answers JSON null before anything was saved', async () => {
      const app = createMockApp();

      const response = await app.request('/api/draft');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );
      await expect(response.json()).resolves.toBeNull();
    });

    it('returns what a PUT stored', async () => {
      const app = createMockApp();

      const saved = await app.request('/api/draft', put('{"title":"hi"}'));
      expect(saved.status).toBe(200);
      await expect(saved.json()).resolves.toEqual({ title: 'hi' });

      const loaded = await app.request('/api/draft');
      await expect(loaded.json()).resolves.toEqual({ title: 'hi' });
    });

    it('keeps each app instance isolated', async () => {
      const first = createMockApp();
      await first.request('/api/draft', put('{"n":1}'));

      const second = await createMockApp().request('/api/draft');

      await expect(second.json()).resolves.toBeNull();
    });

    it.each([
      ['a JSON array', '[1]'],
      ['a JSON null', 'null'],
      ['a JSON string', '"text"'],
      ['malformed JSON', '{broken'],
    ])('rejects %s with 400', async (_label, body) => {
      const app = createMockApp();

      const response = await app.request('/api/draft', put(body));

      expect(response.status).toBe(400);
      const loaded = await app.request('/api/draft');
      await expect(loaded.json()).resolves.toBeNull();
    });
  });

  describe('latencyMs', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('holds every response back for latencyMs', async () => {
      vi.useFakeTimers();
      let settled = false;
      const pending = Promise.resolve(
        createMockApp({ latencyMs: 400 }).request('/api/draft'),
      ).then((response) => {
        settled = true;
        return response;
      });

      await vi.advanceTimersByTimeAsync(399);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(settled).toBe(true);
      const response = await pending;
      expect(response.status).toBe(200);
    });
  });

  it('answers 404 for an unknown route', async () => {
    const response = await createMockApp().request('/api/unknown');

    expect(response.status).toBe(404);
  });
});

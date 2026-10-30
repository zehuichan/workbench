import { H3, onRequest } from 'h3';

import { registerDraftRoutes } from './routes/draft.ts';

export interface CreateMockAppOptions {
  /** Milliseconds every response waits before the route runs. Defaults to `0`. */
  latencyMs?: number;
}

/**
 * Builds the h3 app behind `/api/*` while `pnpm dev` runs.
 *
 * A new endpoint is a `register*Routes(app)` module under `server/routes/`, called here.
 * Production is a static deployment without this app, so every client of `/api/*` must
 * tolerate its absence (see `localKey` in `src/api/request.ts`).
 */
export function createMockApp({
  latencyMs = 0,
}: CreateMockAppOptions = {}): H3 {
  const app = new H3();
  if (latencyMs > 0) {
    app.use(
      onRequest(
        () => new Promise<void>((resolve) => setTimeout(resolve, latencyMs)),
      ),
    );
  }
  registerDraftRoutes(app);
  return app;
}

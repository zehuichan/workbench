import type { H3 } from 'h3';

import { isPlainObject } from 'es-toolkit';
import { HTTPError, readBody } from 'h3';

/**
 * Registers `GET` and `PUT /api/draft`, an in-memory store of one JSON object.
 *
 * `GET` answers the stored object, or JSON `null` before the first `PUT`, so a missing
 * draft is distinguishable from a missing route. `PUT` takes the object as the request
 * body and answers it back. The store belongs to `app` and is discarded with it.
 */
export function registerDraftRoutes(app: H3): void {
  let draft: null | object = null;

  app.get('/api/draft', () => Response.json(draft));

  app.put('/api/draft', async (event) => {
    const body = await readBody(event);
    if (!isPlainObject(body)) {
      throw HTTPError.status(400, 'Body must be a JSON object');
    }
    draft = body;
    return body;
  });
}
